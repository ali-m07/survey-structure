from datetime import date
from django.core.validators import validate_email
from django.core.exceptions import ValidationError as DjangoValidationError
from rest_framework.exceptions import ValidationError

SUPPORTED = {'text','single_choice','multiple_choice','rating','scale','matrix','ranking','date','number','email','boolean','nps'}
OPERATORS = {'equals','not_equals','contains','greater_than','less_than','answered'}

def ordered_questions(survey):
    return list(survey.sections.order_by('order','id').prefetch_related('questions').all())

def questions(survey):
    return [q for section in ordered_questions(survey) for q in section.questions.order_by('order','id')]

def validate_structure(survey):
    qs = questions(survey)
    if not qs:
        raise ValidationError('Add at least one question.')
    positions = {q.id:i for i,q in enumerate(qs)}
    for q in qs:
        if q.question_type not in SUPPORTED:
            raise ValidationError(f'Unsupported question type: {q.question_type}')
        rules = q.validation_rules
        if not isinstance(rules, dict) or not isinstance(q.options, list):
            raise ValidationError('Question settings must be an object and options an array.')
        if any(not isinstance(v,str) for v in q.options):
            raise ValidationError('Options must be strings.')
        for key in ('min','max','min_length','max_length','min_choices','max_choices'):
            if key in rules and (isinstance(rules[key],bool) or not isinstance(rules[key],(int,float))):
                raise ValidationError('Numeric bounds must be numbers.')
        if not isinstance(rules.get('jump_to',{}),dict) or not isinstance(rules.get('display_if',{}),dict):
            raise ValidationError('Conditions and branches must be objects.')
        for key in ('rows','columns'):
            if key in rules and (not isinstance(rules[key],list) or any(not isinstance(v,str) for v in rules[key])):
                raise ValidationError('Matrix rows and columns must be arrays of text.')
        if q.question_type in ('single_choice','multiple_choice','ranking') and (not q.options or len(q.options) != len(set(q.options))):
            raise ValidationError('Choice options must be nonempty and unique.')
        if q.question_type == 'matrix' and (not rules.get('rows') or not (rules.get('columns') or q.options)):
            raise ValidationError('Matrix requires rows and columns.')
        condition = rules.get('display_if')
        if condition:
            source = condition.get('question')
            if source not in positions or positions[source] >= positions[q.id] or condition.get('operator') not in OPERATORS:
                raise ValidationError('Display conditions must refer to an earlier question and supported operator.')
        for target in rules.get('jump_to', {}).values():
            if target not in positions or positions[target] <= positions[q.id]:
                raise ValidationError('Branch targets must refer to a later question.')
    if survey.starts_at and survey.ends_at and survey.ends_at <= survey.starts_at:
        raise ValidationError('End date must be after start date.')

def matches(condition, values):
    actual = values.get(condition['question'])
    expected = condition.get('value')
    operator = condition['operator']
    if operator == 'answered': return actual is not None and actual != '' and actual != []
    if operator == 'equals': return actual == expected
    if operator == 'not_equals': return actual != expected
    if operator == 'contains': return isinstance(actual, (list,str)) and expected in actual
    try:
        return float(actual) > float(expected) if operator == 'greater_than' else float(actual) < float(expected)
    except (TypeError, ValueError): return False

def active_questions(survey, values):
    qs = questions(survey)
    visible = []
    skip_until = None
    for q in qs:
        if skip_until is not None:
            if q.id != skip_until: continue
            skip_until = None
        rules = q.validation_rules
        if rules.get('display_if') and not matches(rules['display_if'], values): continue
        visible.append(q)
        value = values.get(q.id)
        key = str(value).lower() if isinstance(value,bool) else str(value)
        skip_until = rules.get('jump_to', {}).get(key)
    return visible

def validate_value(q, value):
    kind, rules = q.question_type, q.validation_rules
    empty = value is None or value == '' or value == [] or value == {}
    if empty:
        if q.is_required: raise ValidationError('An answer is required.')
        return
    if kind in ('text','email','date'):
        if not isinstance(value,str): raise ValidationError('Expected text.')
        if len(value) < rules.get('min_length',0) or len(value) > rules.get('max_length',100000): raise ValidationError('Invalid text length.')
        if kind == 'email':
            try: validate_email(value)
            except DjangoValidationError: raise ValidationError('Invalid email address.')
        if kind == 'date':
            try: date.fromisoformat(value)
            except ValueError: raise ValidationError('Invalid ISO date.')
    elif kind in ('number','rating','scale','nps'):
        if isinstance(value,bool) or not isinstance(value,(int,float)): raise ValidationError('Expected a number.')
        low, high = (0,10) if kind == 'nps' else (rules.get('min',1 if kind in ('rating','scale') else -1e100),rules.get('max',5 if kind in ('rating','scale') else 1e100))
        if not low <= value <= high or kind == 'nps' and int(value) != value: raise ValidationError('Number is outside the allowed range.')
    elif kind == 'boolean':
        if not isinstance(value,bool): raise ValidationError('Expected true or false.')
    elif kind == 'single_choice':
        if value not in q.options: raise ValidationError('Unknown option.')
    elif kind in ('multiple_choice','ranking'):
        if not isinstance(value,list) or any(not isinstance(v,str) for v in value) or len(value)!=len(set(value)) or any(v not in q.options for v in value): raise ValidationError('Invalid selected options.')
        if kind == 'ranking' and set(value)!=set(q.options): raise ValidationError('Rank all options exactly once.')
        if kind == 'multiple_choice' and not rules.get('min_choices',0) <= len(value) <= rules.get('max_choices',len(q.options)): raise ValidationError('Invalid number of selections.')
    elif kind == 'matrix':
        rows, columns = rules.get('rows',[]),rules.get('columns') or q.options
        if not isinstance(value,dict) or any(k not in rows or v not in columns for k,v in value.items()) or q.is_required and set(value)!=set(rows): raise ValidationError('Invalid matrix answers.')
    else: raise ValidationError('Unsupported question type.')

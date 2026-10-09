import csv, io, json
from collections import Counter
from django.http import HttpResponse
from app.surveys.services.validation import questions

def filtered(survey, params):
    from datetime import date
    from rest_framework.exceptions import ValidationError
    try:
        start=date.fromisoformat(params['start']) if params.get('start') else None
        end=date.fromisoformat(params['end']) if params.get('end') else None
        if start and end and start>end: raise ValueError()
    except ValueError: raise ValidationError('Use ISO dates and start before end.')
    qs = survey.submissions.all()
    if params.get('start'): qs = qs.filter(submitted_at__date__gte=params['start'])
    if params.get('end'): qs = qs.filter(submitted_at__date__lte=params['end'])
    return qs

def analytics(survey, params):
    submissions = filtered(survey,params)
    result = []
    for q in questions(survey):
        values = list(q.answers.filter(submission__in=submissions).values_list('answer_value',flat=True))
        dist = Counter()
        for value in values:
            for item in value if isinstance(value,list) else [value]:
                dist[json.dumps(item,ensure_ascii=False) if isinstance(item,dict) else str(item)] += 1
        item = {'id':q.id,'text':q.question_text,'type':q.question_type,'count':len(values),'distribution':dict(dist)}
        nums = [v for v in values if isinstance(v,(float,int)) and not isinstance(v,bool)]
        if nums: item['average'] = sum(nums)/len(nums)
        if q.question_type == 'nps' and nums: item['nps'] = 100*(sum(v>=9 for v in nums)-sum(v<=6 for v in nums))/len(nums)
        result.append(item)
    return {'survey_id':survey.id,'total_responses':submissions.count(),'questions':result}

def export(survey,params):
    kind = params.get('format','csv')
    qs = questions(survey)
    headers = ['response_id','submitted_at']+[f'{q.id}: {q.question_text}' for q in qs]
    rows = []
    for submission in filtered(survey,params).prefetch_related('answers'):
        values = {a.question_id:a.answer_value for a in submission.answers.all()}
        rows.append([submission.id,submission.submitted_at.isoformat()]+[json.dumps(values.get(q.id,''),ensure_ascii=False) for q in qs])
    if kind == 'xlsx':
        from openpyxl import Workbook
        book=Workbook();sheet=book.active;sheet.title='Responses';sheet.append(headers)
        for row in rows: sheet.append(row)
        for row in sheet:
            for cell in row:
                if isinstance(cell.value,str) and cell.value.startswith(('=','+','-','@')): cell.data_type='s'
        output=io.BytesIO();book.save(output)
        response=HttpResponse(output.getvalue(),content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    elif kind == 'pdf':
        from reportlab.pdfgen import canvas
        from reportlab.pdfbase import pdfmetrics
        from reportlab.pdfbase.ttfonts import TTFont
        from pathlib import Path
        import arabic_reshaper
        from bidi.algorithm import get_display
        pdfmetrics.registerFont(TTFont('NotoArabic',str(Path(__file__).resolve().parent.parent/'assets'/'NotoSansArabic.ttf')))
        output=io.BytesIO();pdf=canvas.Canvas(output);pdf.setFont('NotoArabic',12);y=790
        for line in [survey.title]+[f"Question {q.id}: {q.question_text}" for q in qs]+['Responses: '+str(len(rows))]+[json.dumps(row,ensure_ascii=False) for row in rows]:
            for start in range(0,len(line),95):
                pdf.drawString(35,y,get_display(arabic_reshaper.reshape(line[start:start+95])));y-=18
                if y<40: pdf.showPage();pdf.setFont('NotoArabic',12);y=790
        pdf.save();response=HttpResponse(output.getvalue(),content_type='application/pdf')
    elif kind == 'csv':
        output=io.StringIO();writer=csv.writer(output);writer.writerow(headers)
        for row in rows: writer.writerow(["'"+v if isinstance(v,str) and v.startswith(('=','+','-','@')) else v for v in row])
        response=HttpResponse(bytes([239,187,191])+output.getvalue().encode('utf-8'),content_type='text/csv; charset=utf-8')
    else:
        from rest_framework.exceptions import ValidationError
        raise ValidationError('Supported formats: csv, xlsx, pdf.')
    response['Content-Disposition']=f'attachment; filename="survey-{survey.id}.{kind}"'
    return response

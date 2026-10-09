import csv, io, json, re
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
        if q.question_type=='text':
            stop={'the','and','a','an','to','of','in','is','it','for','on','with','this','that','از','به','در','و','که','این','را','با','برای','یک','است','هم','بود','من'}
            words=Counter(word.casefold() for value in values if isinstance(value,str) for word in re.findall(r'[^\W\d_]+',value,flags=re.UNICODE) if len(word)>1 and word.casefold() not in stop)
            item['text_insights']={'method':'keyword_frequency','keywords':[{'word':word,'count':count} for word,count in words.most_common(20)]}
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
        output=io.BytesIO();pdf=canvas.Canvas(output,pagesize=(595,842));y=780;page=1
        def arabic(text): return bool(re.search(r'[\u0600-\u06ff\ufb50-\ufeff]',text))
        def font(char): return 'NotoArabic' if arabic(char) else 'Helvetica'
        def visual(text):
            text=re.sub(r'\d{4}-\d{2}-\d{2}(?: \d{2}:\d{2})?',lambda match: chr(8234)+match.group(0)+chr(8236),str(text))
            return get_display(arabic_reshaper.reshape(text))
        def width(text,size): return sum(pdfmetrics.stringWidth(c,font(c),size) for c in visual(text))
        def footer():
            pdf.setFont('Helvetica',9);pdf.setFillColorRGB(.4,.4,.4);pdf.drawRightString(550,25,f'{page}');pdf.setFillColorRGB(0,0,0)
        def line(text,size=11):
            nonlocal y,page
            if y<55:
                footer();pdf.showPage();page+=1;y=780
            prepared=visual(text);x=550-width(text,size)
            for char in prepared:
                family=font(char);pdf.setFont(family,size);pdf.drawString(x,y,char);x+=pdfmetrics.stringWidth(char,family,size)
            y-=size+9
        def paragraph(text,size=11):
            words=str(text).split();current=''
            for word in words:
                candidate=(current+' '+word).strip()
                if current and width(candidate,size)>505: line(current,size);current=word
                else: current=candidate
            if current: line(current,size)
        def answer(value):
            if value is True: return 'بله'
            if value is False: return 'خیر'
            if isinstance(value,list): return '، '.join(str(v) for v in value)
            if isinstance(value,dict): return '؛ '.join(f'{k}: {v}' for k,v in value.items())
            return str(value)
        paragraph(survey.title,18)
        paragraph('گزارش پاسخ‌های پرسشنامه',13)
        paragraph('تعداد پاسخ‌ها: '+str(len(rows)))
        from django.utils import timezone
        paragraph('تاریخ گزارش: '+timezone.now().strftime('%Y-%m-%d')+' (UTC)')
        y-=10
        report=analytics(survey,params)
        for item in report['questions']:
            paragraph(item['text'],13)
            paragraph('تعداد پاسخ: '+str(item['count']))
            if 'average' in item: paragraph('میانگین: '+str(round(item['average'],2)))
            if 'nps' in item: paragraph('NPS: '+str(round(item['nps'],2)))
            for value,count in item['distribution'].items():
                value='بله' if value=='True' else 'خیر' if value=='False' else value
                paragraph(value+' — '+str(count))
            y-=8
        paragraph('جزئیات پاسخ‌ها',14)
        for submission in filtered(survey,params).prefetch_related('answers'):
            paragraph('پاسخ شماره '+str(submission.id)+' | '+submission.submitted_at.strftime('%Y-%m-%d %H:%M')+' UTC',12)
            values={a.question_id:a.answer_value for a in submission.answers.all()}
            for q in qs:
                if q.id in values: paragraph(q.question_text+': '+answer(values[q.id]))
            y-=8
        footer();pdf.save();response=HttpResponse(output.getvalue(),content_type='application/pdf')
    elif kind == 'csv':
        output=io.StringIO();writer=csv.writer(output);writer.writerow(headers)
        for row in rows: writer.writerow(["'"+v if isinstance(v,str) and v.startswith(('=','+','-','@')) else v for v in row])
        response=HttpResponse(bytes([239,187,191])+output.getvalue().encode('utf-8'),content_type='text/csv; charset=utf-8')
    else:
        from rest_framework.exceptions import ValidationError
        raise ValidationError('Supported formats: csv, xlsx, pdf.')
    response['Content-Disposition']=f'attachment; filename="survey-{survey.id}.{kind}"'
    return response

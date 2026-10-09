FROM python:3.12-slim
ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1
WORKDIR /app
COPY services/3-survey_engine_service/requirements.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt
COPY services/3-survey_engine_service/ ./
RUN useradd --create-home survey && mkdir -p /app/media && chown -R survey:survey /app
USER survey
EXPOSE 8003
CMD ["gunicorn", "app.wsgi:application", "--bind", "0.0.0.0:8003", "--workers", "2", "--timeout", "120", "--access-logfile", "-"]

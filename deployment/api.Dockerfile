FROM python:3.12-slim AS dependencies
ENV PIP_DISABLE_PIP_VERSION_CHECK=1 PIP_NO_CACHE_DIR=1
WORKDIR /build
COPY services/3-survey_engine_service/requirements.txt ./requirements.txt
RUN python -m venv /opt/venv && /opt/venv/bin/pip install -r requirements.txt

FROM python:3.12-slim AS runtime
ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1 PATH="/opt/venv/bin:$PATH"
WORKDIR /app
COPY --from=dependencies /opt/venv /opt/venv
RUN useradd --create-home survey && mkdir -p /app/media && chown survey:survey /app /app/media
COPY --chown=survey:survey services/3-survey_engine_service/ ./
USER survey
EXPOSE 8003
CMD ["gunicorn", "app.wsgi:application", "--bind", "0.0.0.0:8003", "--workers", "2", "--timeout", "120", "--access-logfile", "-"]

{{/*
Expand the name of the chart.
*/}}
{{- define "ex-platform.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Create a default fully qualified app name.
*/}}
{{- define "ex-platform.fullname" -}}
{{- if .Values.fullnameOverride }}
{{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- $name := default .Chart.Name .Values.nameOverride }}
{{- if contains $name .Release.Name }}
{{- .Release.Name | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" }}
{{- end }}
{{- end }}
{{- end }}

{{/*
Create chart name and version as used by the chart label.
*/}}
{{- define "ex-platform.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Common labels
*/}}
{{- define "ex-platform.labels" -}}
helm.sh/chart: {{ include "ex-platform.chart" . }}
{{ include "ex-platform.selectorLabels" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}

{{/*
Selector labels
*/}}
{{- define "ex-platform.selectorLabels" -}}
app.kubernetes.io/name: {{ include "ex-platform.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}

{{/*
Create the name of the service account to use
*/}}
{{- define "ex-platform.serviceAccountName" -}}
{{- if .Values.serviceAccount.create }}
{{- default (include "ex-platform.fullname" .) .Values.serviceAccount.name }}
{{- else }}
{{- default "default" .Values.serviceAccount.name }}
{{- end }}
{{- end }}

{{/*
Service template helper
*/}}
{{- define "ex-platform.serviceTemplate" -}}
apiVersion: v1
kind: Service
metadata:
  name: {{ .name }}
  namespace: {{ .namespace }}
  labels:
    {{- include "ex-platform.labels" .root | nindent 4 }}
    app: {{ .name }}
spec:
  type: {{ .serviceType }}
  ports:
    - port: {{ .port }}
      targetPort: {{ .targetPort }}
      protocol: TCP
      name: http
  selector:
    app: {{ .name }}
{{- end }}

{{/*
Deployment template helper
*/}}
{{- define "ex-platform.deploymentTemplate" -}}
apiVersion: apps/v1
kind: Deployment
metadata:
  name: {{ .name }}
  namespace: {{ .namespace }}
  labels:
    {{- include "ex-platform.labels" .root | nindent 4 }}
    app: {{ .name }}
spec:
  replicas: {{ .replicaCount }}
  selector:
    matchLabels:
      app: {{ .name }}
  template:
    metadata:
      labels:
        app: {{ .name }}
        {{- include "ex-platform.selectorLabels" .root | nindent 8 }}
    spec:
      containers:
      - name: {{ .name }}
        image: "{{ .image.repository }}:{{ .image.tag }}"
        imagePullPolicy: {{ .image.pullPolicy }}
        ports:
        - name: http
          containerPort: {{ .containerPort }}
          protocol: TCP
        env:
        {{- range .env }}
        - name: {{ .name }}
          {{- if .value }}
          value: {{ .value | quote }}
          {{- end }}
          {{- if .valueFrom }}
          valueFrom:
            {{- toYaml .valueFrom | nindent 12 }}
          {{- end }}
        {{- end }}
        resources:
          {{- toYaml .resources | nindent 10 }}
        {{- if .livenessProbe }}
        livenessProbe:
          {{- toYaml .livenessProbe | nindent 10 }}
        {{- end }}
        {{- if .readinessProbe }}
        readinessProbe:
          {{- toYaml .readinessProbe | nindent 10 }}
        {{- end }}
{{- end }}

{{/*
HPA template helper
*/}}
{{- define "ex-platform.hpaTemplate" -}}
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: {{ .name }}
  namespace: {{ .namespace }}
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: {{ .name }}
  minReplicas: {{ .minReplicas }}
  maxReplicas: {{ .maxReplicas }}
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: {{ .targetCPUUtilizationPercentage }}
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: {{ .targetMemoryUtilizationPercentage | default 80 }}
{{- end }}


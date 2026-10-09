param([switch]$Install)
$ErrorActionPreference = 'Stop'
$project = Split-Path $PSScriptRoot -Parent
$service = Join-Path $project 'services/3-survey_engine_service'
$python = Join-Path $service '.venv/Scripts/python.exe'
$logs = Join-Path $project 'logs'
New-Item -ItemType Directory -Force $logs | Out-Null
if ($Install) {
    if (!(Test-Path $python)) { python -m venv (Join-Path $service '.venv'); if ($LASTEXITCODE) { throw 'Virtual environment creation failed' } }
    & $python -m pip install -r (Join-Path $service 'requirements.txt')
    if ($LASTEXITCODE) { throw 'Backend dependency installation failed' }
    Push-Location (Join-Path $project 'frontend')
    try { npm.cmd ci; if ($LASTEXITCODE) { throw 'Frontend dependency installation failed' } } finally { Pop-Location }
}
if (!(Test-Path $python)) { throw 'Run ./scripts/start-local.ps1 -Install first' }
$env:USE_SQLITE = 'true'
$env:DEBUG = 'true'
$env:NEXT_PUBLIC_API_URL = 'http://localhost:8003'
& $python (Join-Path $service 'manage.py') migrate
if ($LASTEXITCODE) { throw 'Database migration failed' }
$running = @()
if (!(Get-NetTCPConnection -State Listen -LocalPort 8003 -ErrorAction SilentlyContinue)) {
    $running += Start-Process -FilePath $python -ArgumentList 'manage.py','runserver','127.0.0.1:8003','--noreload' -WorkingDirectory $service -WindowStyle Hidden -RedirectStandardOutput (Join-Path $logs 'survey-api.log') -RedirectStandardError (Join-Path $logs 'survey-api-error.log') -PassThru
}
if (!(Get-NetTCPConnection -State Listen -LocalPort 3000 -ErrorAction SilentlyContinue)) {
    $running += Start-Process -FilePath (Get-Command node.exe).Source -ArgumentList 'node_modules/next/dist/bin/next','dev','--hostname','127.0.0.1','--port','3000' -WorkingDirectory (Join-Path $project 'frontend') -WindowStyle Hidden -RedirectStandardOutput (Join-Path $logs 'survey-web.log') -RedirectStandardError (Join-Path $logs 'survey-web-error.log') -PassThru
}
$jobsStateFile = Join-Path $logs 'survey-jobs.pid'
$jobsActive = $false
if (Test-Path $jobsStateFile) {
    $jobsId = Get-Content $jobsStateFile -Raw
    if ($jobsId -match '^\s*\d+\s*$') {
        $jobsProcess = Get-CimInstance Win32_Process -Filter "ProcessId = $([int]$jobsId)"
        $jobsActive = $jobsProcess -and $jobsProcess.ExecutablePath -eq $python -and $jobsProcess.CommandLine -match 'manage.py.*run_survey_jobs'
    }
}
if (!$jobsActive) {
    $jobsProcess = Start-Process -FilePath $python -ArgumentList 'manage.py','run_survey_jobs','--interval','30' -WorkingDirectory $service -WindowStyle Hidden -RedirectStandardOutput (Join-Path $logs 'survey-jobs.log') -RedirectStandardError (Join-Path $logs 'survey-jobs-error.log') -PassThru
    $jobsProcess.Id | Set-Content $jobsStateFile
    $running += $jobsProcess
}
$running | Select-Object Id,ProcessName
Write-Host 'Web: http://localhost:3000 | API health: http://localhost:8003/health'
Write-Host 'Create the administrator using the bootstrap_survey_admin command in RUNBOOK.md.'


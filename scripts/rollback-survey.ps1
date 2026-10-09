param([Parameter(Mandatory)][string]$ReleaseTag, [string]$EnvironmentFile = 'deployment/.env.production')
$ErrorActionPreference = 'Stop'
Set-Location (Split-Path $PSScriptRoot -Parent)
if ($ReleaseTag -notmatch '^[A-Za-z0-9][A-Za-z0-9_.-]*$') { throw 'Invalid release tag' }
$env:RELEASE_TAG = $ReleaseTag
foreach ($image in @("survey-api:$ReleaseTag", "survey-web:$ReleaseTag")) {
    & docker image inspect $image --format '{{.Id}}' | Out-Null
    if ($LASTEXITCODE) { throw "Previous image missing: $image" }
}
& docker compose --env-file $EnvironmentFile -f docker-compose.survey.yml up -d --no-deps --no-build api web
if ($LASTEXITCODE) { throw 'Rollback failed' }
Write-Host 'Application rollback completed. Database migrations are not reversed. Run health checks and confirm schema compatibility.'

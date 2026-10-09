param([string]$EnvironmentFile = 'deployment/.env.local', [string]$Destination = 'backups')
$ErrorActionPreference = 'Stop'
Set-Location (Split-Path $PSScriptRoot -Parent)
New-Item -ItemType Directory -Force $Destination | Out-Null
$stamp = Get-Date -Format 'yyyyMMdd-HHmmss'
$file = Join-Path (Resolve-Path $Destination) "survey-$stamp.dump"
$compose = @('compose','--env-file',$EnvironmentFile,'-f','docker-compose.survey.yml')
& docker @compose exec -T postgres sh -c 'pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" -Fc -f /tmp/survey-backup.dump'
if ($LASTEXITCODE) { throw 'Database backup failed' }
$id = & docker @compose ps -q postgres
& docker cp "${id}:/tmp/survey-backup.dump" $file
if ($LASTEXITCODE) { throw 'Backup copy failed' }
& docker @compose exec -T postgres rm -f /tmp/survey-backup.dump
Write-Host "Database backup: $file"
$mediaId = & docker @compose ps -q api
if ($mediaId) {
    $mediaFile = Join-Path (Resolve-Path $Destination) "survey-media-$stamp.tar.gz"
    & docker @compose exec -T api tar -czf /tmp/survey-media-backup.tar.gz -C /app/media .
    if ($LASTEXITCODE) { throw 'Media backup failed' }
    & docker cp "${mediaId}:/tmp/survey-media-backup.tar.gz" $mediaFile
    if ($LASTEXITCODE) { throw 'Media copy failed' }
    & docker @compose exec -T api rm -f /tmp/survey-media-backup.tar.gz
    Write-Host "Media backup: $mediaFile"
}


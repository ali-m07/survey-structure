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

param([Parameter(Mandatory)][string]$BackupFile, [string]$EnvironmentFile = 'deployment/.env.local', [switch]$ConfirmOverwrite)
$ErrorActionPreference = 'Stop'
Set-Location (Split-Path $PSScriptRoot -Parent)
if (!$ConfirmOverwrite) { throw 'Restore overwrites the database. Add -ConfirmOverwrite after checking the backup and target environment.' }
$resolvedBackup = (Resolve-Path -LiteralPath $BackupFile).Path
$compose = @('compose','--env-file',$EnvironmentFile,'-f','docker-compose.survey.yml')
& docker @compose stop api web
if ($LASTEXITCODE) { throw 'Could not stop application before restore' }
$id = & docker @compose ps -q postgres
& docker cp $resolvedBackup "${id}:/tmp/survey-restore.dump"
if ($LASTEXITCODE) { throw 'Backup transfer failed' }
& docker @compose exec -T postgres sh -c 'pg_restore --exit-on-error --clean --if-exists --no-owner -U "$POSTGRES_USER" -d "$POSTGRES_DB" /tmp/survey-restore.dump'
if ($LASTEXITCODE) { throw 'Restore failed; application remains stopped. Inspect database before restarting.' }
& docker @compose exec -T postgres rm -f /tmp/survey-restore.dump
& docker @compose up -d --no-deps api web
if ($LASTEXITCODE) { throw 'Application restart failed' }

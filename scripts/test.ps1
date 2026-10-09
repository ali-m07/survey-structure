param(
    [ValidateSet('all', 'backend', 'frontend')][string]$Suite = 'all',
    [switch]$Install
)
$runnerArgs = @((Join-Path $PSScriptRoot 'run-tests.py'), '--suite', $Suite)
if ($Install) { $runnerArgs += '--install' }
python @runnerArgs
exit $LASTEXITCODE

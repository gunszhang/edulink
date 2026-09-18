param([switch]$FrontendOnly)
$ErrorActionPreference = "Stop"
Set-Location -LiteralPath $PSScriptRoot
$arguments = @("run_local.py")
if ($FrontendOnly) { $arguments += "--frontend-only" }
& python @arguments
exit $LASTEXITCODE

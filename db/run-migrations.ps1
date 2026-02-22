param(
  [Parameter(Mandatory = $true)]
  [string]$ConnectionString
)

$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $PSScriptRoot
$migrationDir = Join-Path $PSScriptRoot "migrations"

$migrations = @(
  "001_create_accounts_table.sql",
  "002_create_contacts_table.sql",
  "003_create_crm_core_tables.sql",
  "004_create_account_write_function.sql"
)

if (-not (Get-Command psql -ErrorAction SilentlyContinue)) {
  Write-Error "psql is not installed or not in PATH. Install PostgreSQL client tools first."
}

foreach ($file in $migrations) {
  $fullPath = Join-Path $migrationDir $file
  if (-not (Test-Path $fullPath)) {
    Write-Error "Migration file not found: $fullPath"
  }

  Write-Host "Running migration: $file"
  & psql "$ConnectionString" -v ON_ERROR_STOP=1 -f "$fullPath"
}

Write-Host "Verifying database objects..."

$verifySql = @"
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('accounts', 'contacts', 'deals', 'tasks', 'activities')
ORDER BY table_name;

SELECT routine_name
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name IN ('create_account')
ORDER BY routine_name;
"@

& psql "$ConnectionString" -v ON_ERROR_STOP=1 -c "$verifySql"

Write-Host "Migrations applied and verification completed."

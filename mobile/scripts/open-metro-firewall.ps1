# Opens Windows Firewall (Private profile only) for Metro bundler ports so a
# physical Android phone on the same Wi-Fi can connect to `npx expo start`
# from your laptop. Defaults: 8081 (Metro), 19000-19002 (Expo Go legacy +
# devtools — harmless to leave open).
#
# Run from an *Administrator* PowerShell prompt:
#
#   cd mobile
#   powershell -ExecutionPolicy Bypass -File scripts/open-metro-firewall.ps1
#
# To remove the rules later:
#
#   powershell -ExecutionPolicy Bypass -File scripts/open-metro-firewall.ps1 -Remove

param(
  [switch]$Remove
)

$ports = @(8081, 19000, 19001, 19002)
$ruleNamePrefix = "Minor Shop / Metro Dev Server"

# Refuse to run as a non-admin — `New-NetFirewallRule` will silently no-op
# without admin privilege, which would be a confusing failure mode.
$isAdmin = ([Security.Principal.WindowsPrincipal] `
  [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole(
    [Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
  Write-Error "This script must be run as Administrator. Right-click PowerShell → 'Run as Administrator', then re-run."
  exit 1
}

if ($Remove) {
  foreach ($port in $ports) {
    $name = "$ruleNamePrefix (TCP $port)"
    if (Get-NetFirewallRule -DisplayName $name -ErrorAction SilentlyContinue) {
      Remove-NetFirewallRule -DisplayName $name
      Write-Host "✓ Removed rule: $name"
    } else {
      Write-Host "  (no rule named '$name')"
    }
  }
  Write-Host "`nDone. Metro ports closed."
  exit 0
}

foreach ($port in $ports) {
  $name = "$ruleNamePrefix (TCP $port)"
  if (Get-NetFirewallRule -DisplayName $name -ErrorAction SilentlyContinue) {
    Write-Host "  Rule '$name' already exists — skipping."
    continue
  }
  New-NetFirewallRule `
    -DisplayName $name `
    -Direction Inbound `
    -Protocol TCP `
    -LocalPort $port `
    -Action Allow `
    -Profile Private `
    -Description "Allow phone on the same Wi-Fi to reach Metro / Expo dev server." `
    | Out-Null
  Write-Host "✓ Allowed inbound TCP $port (Private profile only)."
}

# Print the LAN IP so the user can plug it straight into the dev client.
$ip = (Get-NetIPAddress -AddressFamily IPv4 -ErrorAction SilentlyContinue |
       Where-Object {
         $_.PrefixOrigin -in @("Dhcp","Manual") -and
         $_.IPAddress -notlike "169.*" -and
         $_.IPAddress -ne "127.0.0.1"
       } |
       Select-Object -First 1 -ExpandProperty IPAddress)

Write-Host "`nDone. On your phone, point the dev client at:"
Write-Host "    exp://${ip}:8081" -ForegroundColor Cyan
Write-Host "(or just scan the QR shown by 'npx expo start' on the same network)."

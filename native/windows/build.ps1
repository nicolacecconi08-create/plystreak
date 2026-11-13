param([Parameter(Mandatory=$true)][string]$OutputDirectory,[string]$ElectronArchive)
$ErrorActionPreference='Stop'
$version='45.3.2'
$root=[IO.Path]::GetFullPath((Join-Path $PSScriptRoot '../..'))
$destination=[IO.Path]::GetFullPath($OutputDirectory)
if(Test-Path -LiteralPath $destination){throw 'Choose a new output directory; existing files are never overwritten.'}
New-Item -ItemType Directory -Path $destination | Out-Null
$archive=Join-Path $destination 'electron.zip'
$base="https://github.com/electron/electron/releases/download/v$version"
$name="electron-v$version-win32-x64.zip"
if($ElectronArchive){Copy-Item -LiteralPath $ElectronArchive -Destination $archive}else{Invoke-WebRequest "$base/$name" -OutFile $archive}
$sums=(Invoke-WebRequest "$base/SHASUMS256.txt").Content
if($sums -is [byte[]]){$sums=[Text.Encoding]::UTF8.GetString($sums)}
$match=($sums -split "`n" | Where-Object {$_ -match "\s+\*?$([regex]::Escape($name))\s*$"})
if(!$match){throw 'Missing official checksum.'}
$expected=($match.Trim() -split '\s+')[0]
if((Get-FileHash -LiteralPath $archive -Algorithm SHA256).Hash.ToLower() -ne $expected.ToLower()){throw 'Electron checksum mismatch.'}
$appDir=Join-Path $destination 'Plystreak-Windows'
Expand-Archive -LiteralPath $archive -DestinationPath $appDir
$resources=Join-Path $appDir 'resources/app'
New-Item -ItemType Directory -Path $resources | Out-Null
Copy-Item -LiteralPath (Join-Path $PSScriptRoot 'main.cjs'),(Join-Path $PSScriptRoot 'local-files.cjs'),(Join-Path $PSScriptRoot 'package.json') -Destination $resources
$dist=Join-Path $resources 'dist'
New-Item -ItemType Directory -Path $dist | Out-Null
Get-ChildItem -LiteralPath (Join-Path $root 'dist') | Where-Object {$_.Name -notin @('updates','sw.js')} | Copy-Item -Destination $dist -Recurse
Copy-Item -LiteralPath (Join-Path $root 'LICENSE'),(Join-Path $root 'THIRD_PARTY_NOTICES.md') -Destination $resources
Rename-Item -LiteralPath (Join-Path $appDir 'electron.exe') -NewName 'Plystreak.exe'
Write-Output "Prepared unsigned Windows x64 preview: $appDir"

Set-StrictMode -Version Latest

$root = Split-Path -Parent $MyInvocation.MyCommand.Definition
Set-Location $root
Add-Type -AssemblyName System.Drawing

$sourcePlayStore = 'assets\Android\Play Store Icon\ic_playstore.png'
$sourceLauncher = 'assets\Android\App Icon\mipmap-xxxhdpi\ic_launcher.png'
$sourceLauncherForeground = 'assets\Android\App Icon\mipmap-xxxhdpi\ic_launcher_foreground.png'

if (-not (Test-Path $sourcePlayStore)) { throw "Source not found: $sourcePlayStore" }
if (-not (Test-Path $sourceLauncher)) { throw "Source not found: $sourceLauncher" }
if (-not (Test-Path $sourceLauncherForeground)) { throw "Source not found: $sourceLauncherForeground" }

function ResizeTo($src, $dst, $width, $height) {
    $srcFull = Resolve-Path $src
    $image = [System.Drawing.Image]::FromFile($srcFull.Path)
    $bitmap = New-Object System.Drawing.Bitmap $width, $height
    $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
    $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
    $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $graphics.DrawImage($image, 0, 0, $width, $height)
    $dir = Split-Path -Parent $dst
    if (-not (Test-Path $dir)) { New-Item -ItemType Directory -Path $dir | Out-Null }
    $bitmap.Save($dst, [System.Drawing.Imaging.ImageFormat]::Png)
    $graphics.Dispose()
    $bitmap.Dispose()
    $image.Dispose()
}

ResizeTo $sourcePlayStore 'assets\icon-only.png' 1024 1024
ResizeTo $sourceLauncherForeground 'assets\icon-foreground.png' 1024 1024
ResizeTo $sourceLauncher 'assets\icon-background.png' 1024 1024
ResizeTo $sourcePlayStore 'assets\splash.png' 2732 2732
ResizeTo $sourcePlayStore 'assets\splash-dark.png' 2732 2732

Get-ChildItem -Path assets\icon-only.png, assets\icon-foreground.png, assets\icon-background.png, assets\splash.png, assets\splash-dark.png | Select-Object Name, @{Name='SizeBytes';Expression={$_.Length}}, @{Name='Dimensions';Expression={ $img = [System.Drawing.Image]::FromFile($_.FullName); $dim = "$($img.Width)x$($img.Height)"; $img.Dispose(); $dim }} | Format-Table -AutoSize

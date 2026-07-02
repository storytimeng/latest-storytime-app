Set-StrictMode -Version Latest

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
$root = Split-Path -Parent $scriptDir
Set-Location $root
Add-Type -AssemblyName System.Drawing

function ResizeImage {
    param(
        [Parameter(Mandatory=$true)] [string] $Source,
        [Parameter(Mandatory=$true)] [string] $Target,
        [Parameter(Mandatory=$true)] [int] $Width,
        [Parameter(Mandatory=$true)] [int] $Height
    )

    if (-not (Test-Path $Source)) {
        throw "Source file not found: $Source"
    }

    $bitmap = [System.Drawing.Image]::FromFile((Resolve-Path $Source).Path)
    try {
        $result = New-Object System.Drawing.Bitmap $Width, $Height
        $graphics = [System.Drawing.Graphics]::FromImage($result)
        $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
        $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
        $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
        $graphics.DrawImage($bitmap, 0, 0, $Width, $Height)
        $dir = Split-Path -Parent $Target
        if (-not (Test-Path $dir)) { New-Item -ItemType Directory -Path $dir | Out-Null }
        $result.Save((Resolve-Path $Target -LiteralPath $false).Path, [System.Drawing.Imaging.ImageFormat]::Png)
    }
    finally {
        if ($graphics) { $graphics.Dispose() }
        if ($result) { $result.Dispose() }
        $bitmap.Dispose()
    }
}

try {
    ResizeImage 'assets/Android/Play Store Icon/ic_playstore.png' 'assets/icon-only.png' 1024 1024
    ResizeImage 'assets/Android/App Icon/mipmap-xxxhdpi/ic_launcher_foreground.png' 'assets/icon-foreground.png' 1024 1024
    ResizeImage 'assets/Android/App Icon/mipmap-xxxhdpi/ic_launcher.png' 'assets/icon-background.png' 1024 1024
    ResizeImage 'assets/Android/Play Store Icon/ic_playstore.png' 'assets/splash.png' 2732 2732
    ResizeImage 'assets/Android/Play Store Icon/ic_playstore.png' 'assets/splash-dark.png' 2732 2732
    Write-Output 'Generated Capacitor custom-mode asset files:'
    Get-ChildItem -Path assets\icon-only.png, assets\icon-foreground.png, assets\icon-background.png, assets\splash.png, assets\splash-dark.png | Select-Object Name, @{Name='Size';Expression={$_.Length}}, @{Name='Dimensions';Expression={ $img=[System.Drawing.Image]::FromFile($_.FullName); $dim="$($img.Width)x$($img.Height)"; $img.Dispose(); $dim }} | Format-Table -AutoSize
}
catch {
    Write-Error $_
    exit 1
}

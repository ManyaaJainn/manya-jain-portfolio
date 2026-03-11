$content = Get-Content -Path "index.html", "articles.html", "styles.css", "script.js"
$matches = [regex]::Matches($content, 'assets/([A-Za-z0-9_.-]+\.(?:jpg|jpeg|png|webp|gif|svg))')
$usedImages = $matches | ForEach-Object { $_.Groups[1].Value } | Sort-Object -Unique

Write-Host "Used Images:"
$usedImages | ForEach-Object { Write-Host " - $_" }

$deleted = @()
$allAssets = Get-ChildItem -Path "assets" -File | Where-Object { $_.Extension -match "\.(jpg|jpeg|png|webp|gif|svg)$" }

foreach ($asset in $allAssets) {
    if ($usedImages -notcontains $asset.Name) {
        Write-Host "Deleting unused image: $($asset.Name)"
        $deleted += $asset.Name
        Remove-Item -Path $asset.FullName -Force
    }
}

$deleted | Out-File -FilePath ".\tmp\deleted_images.txt" -Encoding utf8
Write-Host "Total deleted: $($deleted.Count)"

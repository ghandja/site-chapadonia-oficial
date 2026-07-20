# Fix outfit sprites
# Filename format (Gesior/outfitter.php): {animation}_{mountState}_{addons}_{direction}.png
#   animation  = walk frame (1 = idle)
#   mountState = 1 on foot, 2 mounted
#   addons     = 1 base, 2 addon1, 3 addon2
#   direction  = 1 North(back), 2 East, 3 South(FRONT), 4 West
# NEVER copy *_template.png (color slot maps, not sprites)

$srcDir = "C:\Users\Usuario\Downloads\animated-items-and-outfits\animated-outfits\outfits\outfits_anim"
$dstDir = "C:\Users\Usuario\Documents\UniServerZ\www\sprites"

$dirs = Get-ChildItem $srcDir -Directory
$fixed = 0
$skipped = 0
$usedFront = 0
$usedFallback = 0

foreach ($d in $dirs) {
    $looktype = $d.Name
    $dstFile = Join-Path $dstDir "Outfit_${looktype}.gif"

    $files = Get-ChildItem $d.FullName -Filter "*.png" | Where-Object { $_.Name -notlike "*_template.png" }

    # Prefer idle + on foot + base outfit + SOUTH (front-facing)
    $preferred = @(
        "1_1_1_3.png",  # frame1, foot, base, south (FRONT)
        "1_1_1_2.png",  # east 3/4
        "1_1_1_4.png",  # west 3/4
        "1_1_1_1.png"   # north (back) last resort
    )

    $selected = $null
    $which = $null
    foreach ($pref in $preferred) {
        $selected = $files | Where-Object { $_.Name -eq $pref } | Select-Object -First 1
        if ($selected) {
            $which = $pref
            break
        }
    }

    # Fallback: any idle base layer (1_1_1_*.png)
    if (-not $selected) {
        $selected = $files | Where-Object { $_.Name -like "1_1_1_*.png" } | Select-Object -First 1
        if ($selected) { $which = "fallback-idle:" + $selected.Name }
    }

    # Last resort: first non-template PNG
    if (-not $selected) {
        $selected = $files | Select-Object -First 1
        if ($selected) { $which = "lastresort:" + $selected.Name }
    }

    if ($selected) {
        Copy-Item -Path $selected.FullName -Destination $dstFile -Force
        $fixed++
        if ($which -eq "1_1_1_3.png") { $usedFront++ } else { $usedFallback++ }
    } else {
        Write-Output "No PNG found for looktype $looktype"
        $skipped++
    }
}

Write-Output "Done. Fixed: $fixed (front/south: $usedFront, other: $usedFallback), Skipped: $skipped"

param(
    [string]$Path = "W:\devwithsu\drk-all-in-one\index.html"
)

$lines = Get-Content -LiteralPath $Path

function Replace-Line([int]$index, [scriptblock]$transform) {
    if ($index -ge 0 -and $index -lt $lines.Count) {
        $lines[$index] = & $transform $lines[$index]
    }
}

Replace-Line 363 { param($l) $l -replace 'margin-top: 4px;', 'margin-top: 7px;' }
Replace-Line 383 { param($l) $l -replace 'margin-top: 12px;', 'margin-top: 18px;' }
Replace-Line 397 { param($l) $l -replace 'margin-top: 12px;', 'margin-top: 24px;' }

$insertIndex = -1
for ($i=0; $i -lt $lines.Count; $i++) {
    if ($lines[$i] -match 'align-self: stretch;' -and $lines[$i-1] -match 'flex: 1 1 auto;') {
        $insertIndex = $i
        break
    }
}
if ($insertIndex -ge 0) {
    $newLines = $lines[0..$insertIndex] + '      margin-top: 24px;' + $lines[($insertIndex+1)..($lines.Count-1)]
    $lines = $newLines
}

$searchStart = 1490
for ($i=$searchStart; $i -lt $lines.Count; $i++) {
    if ($lines[$i] -match 'align-items: center;' -and $lines[$i-2] -match '\.profile-header \{') {
        $lines[$i] = $lines[$i] -replace 'align-items: center;', 'align-items: flex-start;'
        $blockStart = $i - 2
        for ($j=$blockStart; $j -lt $blockStart+10; $j++) {
            if ($lines[$j] -match 'gap: 20px;') {
                $lines[$j] = $lines[$j] -replace 'gap: 20px;', 'gap: 24px;'
                break
            }
        }
        break
    }
}

for ($i=$searchStart; $i -lt $lines.Count; $i++) {
    if ($lines[$i] -match 'align-self: center;' -and $lines[$i-1] -match '\.profile-info \{') {
        $lines[$i] = $lines[$i] -replace 'align-self: center;', 'align-self: flex-start;'
        $hasMargin = $false
        for ($j=$i; $j -lt $i+5; $j++) {
            if ($lines[$j] -match 'margin-top:') { $hasMargin = $true; break }
        }
        if (-not $hasMargin) {
            $insertPos = $i+1
            $newLines = $lines[0..$insertPos] + '        margin-top: 24px;' + $lines[($insertPos+1)..($lines.Count-1)]
            $lines = $newLines
        }
        break
    }
}

for ($i=$searchStart; $i -lt $lines.Count; $i++) {
    if ($lines[$i] -match 'margin-top: 14px;' -and $lines[$i-2] -match '\.profile-description \{') {
        $lines[$i] = $lines[$i] -replace 'margin-top: 14px;', 'margin-top: 28px;'
        break
    }
}

Set-Content -LiteralPath $Path -Value $lines -Encoding UTF8
Write-Host "Profile header adjustments applied."

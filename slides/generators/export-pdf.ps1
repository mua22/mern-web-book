<#
.SYNOPSIS
  Export one or more lecture .pptx decks to PDF, overwriting the copy already
  published under docs/downloads/lecture-slides/. One slide per PDF page.

.DESCRIPTION
  Run this after regenerating any deck (node lecture-NN.js) so the PDF a
  student downloads always matches the current .pptx. Requires PowerPoint
  installed locally (uses COM automation, same as the deck screenshot QA).

.EXAMPLE
  # Re-export every deck
  powershell -File export-pdf.ps1

.EXAMPLE
  # Re-export just one deck after editing it
  powershell -File export-pdf.ps1 -Pattern "CSC336-Lecture-03-*"
#>
param(
    [string]$Pattern = "CSC336-Lecture-*.pptx"
)

$src = "D:\GitHub\mern-web-book\slides"
$dst = "D:\GitHub\mern-web-book\docs\downloads\lecture-slides"
if (-not (Test-Path $dst)) { New-Item -ItemType Directory -Force $dst | Out-Null }

$pp = New-Object -ComObject PowerPoint.Application
$files = Get-ChildItem (Join-Path $src $Pattern) | Sort-Object Name
foreach ($f in $files) {
    $pdfName = [System.IO.Path]::GetFileNameWithoutExtension($f.Name) + ".pdf"
    $outPath = Join-Path $dst $pdfName
    $pres = $pp.Presentations.Open($f.FullName, $true, $false, $false)
    $pres.SaveAs($outPath, 32)  # 32 = ppSaveAsPDF -- overwrites any existing file at $outPath
    $pres.Close()
    Write-Output "Exported: $pdfName"
}
$pp.Quit()

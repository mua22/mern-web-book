# Converts the four course-cdf Word documents (.doc / .docx) to PDF using
# Microsoft Word's COM automation, since these are legacy formats that
# need real Word (not just a text extractor like antiword) to preserve
# the CDF's table layout in the PDF.

$ErrorActionPreference = "Stop"

$root = "D:\GitHub\mern-web-book"
$sourceDir = Join-Path $root "course-cdf"
$targetDir = Join-Path $root "docs\downloads\course-cdf"

$files = @(
    @{ Src = "CSC336 WT CDF V5.0.docx"; Dst = "CSC336-Web-Technologies-CDF.pdf" },
    @{ Src = "CSC336 Web Technologies - Lecture-wise Plan.doc"; Dst = "CSC336-Web-Technologies-Lecture-Plan.pdf" },
    @{ Src = "CSC337 AWT CDF V5.0.docx"; Dst = "CSC337-Advanced-Web-Technologies-CDF.pdf" },
    @{ Src = "CSC337 Advanced Web Technologies - Lecture-wise Plan.doc"; Dst = "CSC337-Advanced-Web-Technologies-Lecture-Plan.pdf" }
)

New-Item -ItemType Directory -Force -Path $targetDir | Out-Null

$word = New-Object -ComObject Word.Application
$word.Visible = $false
$wdExportFormatPDF = 17
$wdExportOptimizeForOnScreen = 0
$wdExportDocumentContent = 0

try {
    foreach ($file in $files) {
        $srcPath = Join-Path $sourceDir $file.Src
        $dstPath = Join-Path $targetDir $file.Dst

        if (-not (Test-Path $srcPath)) {
            Write-Error "Source file not found: $srcPath"
            continue
        }

        Write-Host "Converting: $($file.Src) -> $($file.Dst)"
        $doc = $word.Documents.Open($srcPath, $false, $true)
        $doc.ExportAsFixedFormat($dstPath, $wdExportFormatPDF, $false, $wdExportOptimizeForOnScreen, $wdExportDocumentContent)
        $doc.Close([ref]$false)
        Write-Host "  Done: $dstPath"
    }
} finally {
    $word.Quit()
    [System.Runtime.Interopservices.Marshal]::ReleaseComObject($word) | Out-Null
}

Write-Host "All conversions complete."

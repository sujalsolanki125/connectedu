# ============================================================================
# AUTOMATED TAILWIND CSS UPDATE SCRIPT
# ============================================================================
# This script will update all pages with Tailwind CSS designs
# Run this in PowerShell from the alumni-connect directory
# ============================================================================

Write-Host "🎨 Alumni Connect - Tailwind CSS Update Script" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Set paths
$clientPath = "d:\AlumniMentorHub\alumni-connect\client"
$pagesPath = "$clientPath\src\pages"
$backupPath = "$pagesPath\backup-$(Get-Date -Format 'yyyyMMdd-HHmmss')"

# Create backup directory
Write-Host "📦 Creating backup..." -ForegroundColor Yellow
New-Item -ItemType Directory -Path $backupPath -Force | Out-Null

# Backup all JSX files
Get-ChildItem -Path $pagesPath -Filter "*.jsx" | ForEach-Object {
    Copy-Item $_.FullName "$backupPath\$($_.Name)"
    Write-Host "   ✓ Backed up $($_.Name)" -ForegroundColor Green
}

Write-Host ""
Write-Host "✅ Backup completed at: $backupPath" -ForegroundColor Green
Write-Host ""

# List of pages to update
$pagesToUpdate = @(
    "RegisterPage.jsx",
    "StudentDashboard.jsx",
    "AlumniDashboard.jsx",
    "AdminDashboard.jsx",
    "InterviewExperiencesPage.jsx",
    "CompanyInsightsPage.jsx",
    "MentorshipPage.jsx",
    "LeaderboardPage.jsx",
    "QAPage.jsx",
    "PlacementResourcesPage.jsx"
)

Write-Host "📝 Pages to update:" -ForegroundColor Yellow
$pagesToUpdate | ForEach-Object {
    Write-Host "   • $_" -ForegroundColor White
}

Write-Host ""
Write-Host "⚠️  MANUAL STEP REQUIRED:" -ForegroundColor Red
Write-Host "   The updated Tailwind CSS code for each page is available in:" -ForegroundColor White
Write-Host "   - ALL_TAILWIND_PAGES.jsx" -ForegroundColor Cyan
Write-Host "   - Individual page designs have been prepared" -ForegroundColor Cyan
Write-Host ""
Write-Host "   Please copy the code for each page from the guide files." -ForegroundColor White
Write-Host ""

# Check if Tailwind is installed
Write-Host "🔍 Checking Tailwind CSS installation..." -ForegroundColor Yellow
$packageJson = Get-Content "$clientPath\package.json" | ConvertFrom-Json

if ($packageJson.devDependencies.tailwindcss) {
    Write-Host "   ✓ Tailwind CSS is installed" -ForegroundColor Green
} else {
    Write-Host "   ✗ Tailwind CSS not found" -ForegroundColor Red
    Write-Host "   Installing Tailwind CSS..." -ForegroundColor Yellow
    Set-Location $clientPath
    npm install -D tailwindcss postcss autoprefixer
}

# Check config files
Write-Host ""
Write-Host "🔍 Checking configuration files..." -ForegroundColor Yellow

if (Test-Path "$clientPath\tailwind.config.js") {
    Write-Host "   ✓ tailwind.config.js exists" -ForegroundColor Green
} else {
    Write-Host "   ✗ tailwind.config.js not found" -ForegroundColor Red
}

if (Test-Path "$clientPath\postcss.config.js") {
    Write-Host "   ✓ postcss.config.js exists" -ForegroundColor Green
} else {
    Write-Host "   ✗ postcss.config.js not found" -ForegroundColor Red
}

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "📚 Next Steps:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Review the backup at: $backupPath" -ForegroundColor White
Write-Host "2. Copy updated page code from the guide files" -ForegroundColor White
Write-Host "3. Test each page at http://localhost:3000" -ForegroundColor White
Write-Host "4. Verify all functionality works" -ForegroundColor White
Write-Host ""
Write-Host "🎉 Ready to transform your UI with Tailwind CSS!" -ForegroundColor Green
Write-Host ""

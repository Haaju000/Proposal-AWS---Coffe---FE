# 📦 Create Backup Before Commit
# Run this BEFORE committing to create a safe restore point

Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "  📦 CREATE BACKUP TAG" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan

Write-Host "`n📊 Current status:" -ForegroundColor Yellow
git status --short

Write-Host "`n📜 Recent commits:" -ForegroundColor Yellow
git log --oneline -3

Write-Host "`n🏷️  Creating backup tag..." -ForegroundColor Cyan
$timestamp = Get-Date -Format "yyyy-MM-dd-HHmm"
$tagName = "backup-before-eb-$timestamp"

git tag $tagName

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Created tag: $tagName" -ForegroundColor Green
    
    Write-Host "`n📤 Pushing tag to GitHub..." -ForegroundColor Yellow
    git push origin $tagName
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "`n✅ BACKUP TAG CREATED!" -ForegroundColor Green
        Write-Host "`n📋 Restore anytime with:" -ForegroundColor Cyan
        Write-Host "   git checkout $tagName" -ForegroundColor Gray
        Write-Host "`n📋 View all backup tags:" -ForegroundColor Cyan
        Write-Host "   git tag -l 'backup-*'" -ForegroundColor Gray
    } else {
        Write-Host "`n⚠️  Tag created locally but push failed" -ForegroundColor Yellow
        Write-Host "   You can still use it locally" -ForegroundColor Gray
    }
} else {
    Write-Host "`n❌ Failed to create tag" -ForegroundColor Red
}

Write-Host ""

# 🔄 Quick Rollback Script
# Revert về commit trước đó (SAFE method)

Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "  🔄 ROLLBACK TO PREVIOUS COMMIT" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan

Write-Host "`n📜 Recent commits:" -ForegroundColor Yellow
git log --oneline -5

Write-Host "`n⚠️  This will REVERT the last commit" -ForegroundColor Yellow
Write-Host "    (Safe method: Creates new commit, keeps history)" -ForegroundColor Gray

$confirm = Read-Host "`nProceed with rollback? (y/n)"

if ($confirm -eq 'y' -or $confirm -eq 'Y') {
    Write-Host "`n🔄 Reverting last commit..." -ForegroundColor Yellow
    
    git revert HEAD --no-edit
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Revert successful!" -ForegroundColor Green
        
        Write-Host "`n📤 Pushing to GitHub..." -ForegroundColor Yellow
        git push origin main
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "`n✅ ROLLBACK COMPLETED!" -ForegroundColor Green
            Write-Host "⏳ Amplify will auto-deploy in ~5 minutes" -ForegroundColor Cyan
            Write-Host "`n📊 Check status:" -ForegroundColor Cyan
            Write-Host "   https://console.aws.amazon.com/amplify" -ForegroundColor Gray
        } else {
            Write-Host "`n❌ Push failed!" -ForegroundColor Red
            Write-Host "Run 'git status' to see details" -ForegroundColor Yellow
        }
    } else {
        Write-Host "`n❌ Revert failed!" -ForegroundColor Red
        Write-Host "There may be conflicts. Run 'git status' to see details" -ForegroundColor Yellow
    }
} else {
    Write-Host "`n❌ Rollback cancelled" -ForegroundColor Red
}

Write-Host ""

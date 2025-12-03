# 🛡️ Advanced Rollback Script
# Multiple rollback options

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  🛡️ ADVANCED ROLLBACK TOOL" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan

Write-Host "`n📜 Current situation:" -ForegroundColor Yellow
git log --oneline -3

Write-Host "`n📊 Current branch:" -ForegroundColor Yellow
git branch --show-current

Write-Host "`n⚠️  Choose rollback method:" -ForegroundColor Cyan
Write-Host "   1. Git Revert       (SAFE - Recommended)" -ForegroundColor Green
Write-Host "   2. Git Reset        (DANGER - Deletes commit)" -ForegroundColor Red
Write-Host "   3. Restore Files    (Restore from backup folder)" -ForegroundColor Yellow
Write-Host "   4. Show Backup Tag  (View backup point)" -ForegroundColor Cyan
Write-Host "   5. Cancel" -ForegroundColor Gray

$choice = Read-Host "`nEnter choice (1-5)"

switch ($choice) {
    "1" {
        Write-Host "`n🔄 METHOD 1: Git Revert (Safe)" -ForegroundColor Green
        Write-Host "   Creates new commit that reverses changes" -ForegroundColor Gray
        
        $confirm = Read-Host "`nProceed? (y/n)"
        if ($confirm -eq 'y') {
            git revert HEAD --no-edit
            git push origin main
            Write-Host "`n✅ Revert completed! Amplify will redeploy." -ForegroundColor Green
        }
    }
    
    "2" {
        Write-Host "`n🚨 METHOD 2: Git Reset (Dangerous)" -ForegroundColor Red
        Write-Host "   ⚠️  WARNING: This DELETES commit from history!" -ForegroundColor Red
        Write-Host "   ⚠️  Cannot be undone easily!" -ForegroundColor Red
        
        $confirm = Read-Host "`nType 'DELETE' to confirm"
        if ($confirm -eq 'DELETE') {
            Write-Host "`n🔄 Resetting to previous commit..." -ForegroundColor Yellow
            git reset --hard HEAD~1
            
            Write-Host "📤 Force pushing to GitHub..." -ForegroundColor Yellow
            git push --force origin main
            
            Write-Host "`n✅ Hard reset completed!" -ForegroundColor Green
        } else {
            Write-Host "`n❌ Reset cancelled (safety)" -ForegroundColor Yellow
        }
    }
    
    "3" {
        Write-Host "`n🔄 METHOD 3: Restore from Backup Files" -ForegroundColor Yellow
        
        $restored = $false
        
        if (Test-Path "backup/environment.js.backup") {
            Copy-Item "backup/environment.js.backup" "src/config/environment.js" -Force
            Write-Host "✅ Restored environment.js" -ForegroundColor Green
            $restored = $true
        }
        
        if (Test-Path "backup/index.html.backup") {
            Copy-Item "backup/index.html.backup" "public/index.html" -Force
            Write-Host "✅ Restored index.html" -ForegroundColor Green
            $restored = $true
        }
        
        if (Test-Path "backup/axiosConfig.js.backup") {
            Copy-Item "backup/axiosConfig.js.backup" "src/config/axiosConfig.js" -Force
            Write-Host "✅ Restored axiosConfig.js" -ForegroundColor Green
            $restored = $true
        }
        
        if ($restored) {
            Write-Host "`n📝 Files restored. Commit changes?" -ForegroundColor Cyan
            $commitConfirm = Read-Host "(y/n)"
            
            if ($commitConfirm -eq 'y') {
                git add .
                git commit -m "revert: Restore files from backup"
                git push origin main
                Write-Host "`n✅ Restored and pushed!" -ForegroundColor Green
            } else {
                Write-Host "Files restored locally. Run git commands manually." -ForegroundColor Yellow
            }
        } else {
            Write-Host "❌ No backup files found in backup/ folder" -ForegroundColor Red
        }
    }
    
    "4" {
        Write-Host "`n📋 Backup Tag Info:" -ForegroundColor Cyan
        
        git tag -l "backup-*"
        
        Write-Host "`nTo restore to backup tag:" -ForegroundColor Yellow
        Write-Host "   git checkout backup-before-eb-integration" -ForegroundColor Gray
    }
    
    "5" {
        Write-Host "`n❌ Operation cancelled" -ForegroundColor Yellow
    }
    
    default {
        Write-Host "`n❌ Invalid choice" -ForegroundColor Red
    }
}

Write-Host ""

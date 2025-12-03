# 🔄 ROLLBACK GUIDE - Khôi phục về trạng thái ban đầu

**Tạo:** December 3, 2025  
**Mục đích:** Rollback nếu deploy lên Amplify gặp lỗi

---

## 🚨 KHI NÀO CẦN ROLLBACK?

### Rollback ngay nếu:
- ❌ Amplify deploy thất bại (build error)
- ❌ App crash hoàn toàn
- ❌ Không thể access app
- ❌ Database/backend connection hoàn toàn broken

### KHÔNG cần rollback nếu:
- ⚠️ Mixed content warning (expected)
- ⚠️ API calls blocked (expected, cần add SSL)
- ⚠️ Console có warnings nhưng app vẫn load

---

## 🔄 PHƯƠNG PHÁP 1: GIT REVERT (KHUYẾN NGHỊ)

### Ưu điểm:
- ✅ Giữ lại lịch sử commit
- ✅ Có thể revert lại revert
- ✅ An toàn nhất

### Các bước:

```bash
# 1. Xem commit vừa push
git log --oneline -5

# Output ví dụ:
# abc1234 (HEAD -> main) feat: Configure Elastic Beanstalk API integration
# def5678 Previous commit
# ...

# 2. Revert commit vừa push (tạo commit mới đảo ngược thay đổi)
git revert HEAD

# 3. Push revert lên GitHub
git push origin main

# 4. Amplify sẽ tự động deploy lại version cũ
```

---

## 🔄 PHƯƠNG PHÁP 2: GIT RESET (MẠNH HƠN)

### Ưu điểm:
- ✅ Xóa hẳn commit không mong muốn
- ✅ Clean history

### Nhược điểm:
- ⚠️ Mất commit history
- ⚠️ Cần force push

### Các bước:

```bash
# 1. Xem commit history
git log --oneline -5

# 2. Reset về commit TRƯỚC commit lỗi
git reset --hard def5678
# Hoặc: git reset --hard HEAD~1  (về 1 commit trước)

# 3. Force push (XÓA commit trên GitHub)
git push --force origin main

# 4. Amplify sẽ tự động deploy lại version cũ
```

---

## 🔄 PHƯƠNG PHÁP 3: RESTORE TỪ BACKUP FILES (NHANH NHẤT)

### Khi nào dùng:
- Chỉ muốn revert 1 vài files
- Chưa push lên GitHub
- Local đang có lỗi

### Các bước:

```bash
# 1. Copy files từ backup về
cp backup/environment.js.backup src/config/environment.js
cp backup/index.html.backup public/index.html

# 2. Xóa files không cần (nếu muốn)
rm src/config/axiosConfig.js
rm src/components/MixedContentTest.js

# 3. Commit changes
git add .
git commit -m "revert: Rollback EB integration changes"
git push origin main
```

---

## 🔄 PHƯƠNG PHÁP 4: AMPLIFY MANUAL ROLLBACK

### Ưu điểm:
- ✅ Không cần động đến Git
- ✅ Rollback trực tiếp trên Amplify
- ✅ Nhanh nhất

### Các bước:

```bash
1. Vào AWS Amplify Console
2. Chọn app: main.d3djm3hylbiyyu.amplifyapp.com
3. Sidebar → "Deployments"
4. Tìm deployment thành công trước đó
5. Click "Redeploy this version"
6. Chờ 3-5 phút
```

---

## 📋 SCRIPT TỰ ĐỘNG ROLLBACK

### Windows PowerShell:

Tạo file `rollback.ps1`:

```powershell
# Rollback to previous commit
Write-Host "🔄 Starting rollback..." -ForegroundColor Yellow

# Show recent commits
Write-Host "`n📜 Recent commits:" -ForegroundColor Cyan
git log --oneline -5

# Confirm rollback
$confirm = Read-Host "`n⚠️ Rollback về commit trước? (y/n)"

if ($confirm -eq 'y') {
    Write-Host "`n🔄 Reverting last commit..." -ForegroundColor Yellow
    
    # Revert
    git revert HEAD --no-edit
    
    # Push
    Write-Host "`n📤 Pushing to GitHub..." -ForegroundColor Yellow
    git push origin main
    
    Write-Host "`n✅ Rollback completed!" -ForegroundColor Green
    Write-Host "⏳ Wait 5 minutes for Amplify to redeploy" -ForegroundColor Cyan
} else {
    Write-Host "`n❌ Rollback cancelled" -ForegroundColor Red
}
```

### Cách dùng:
```powershell
.\rollback.ps1
```

---

## 🛡️ ROLLBACK SCRIPT NÂNG CAO (WITH OPTIONS)

Tạo file `rollback-advanced.ps1`:

```powershell
Write-Host "🔄 Advanced Rollback Tool" -ForegroundColor Cyan
Write-Host "=========================" -ForegroundColor Cyan

# Show options
Write-Host "`nChọn phương pháp rollback:"
Write-Host "1. Git Revert (safe, recommended)"
Write-Host "2. Git Reset --hard (clean history)"
Write-Host "3. Restore from backup files"
Write-Host "4. Cancel"

$choice = Read-Host "`nNhập lựa chọn (1-4)"

switch ($choice) {
    "1" {
        Write-Host "`n🔄 Git Revert..." -ForegroundColor Yellow
        git log --oneline -3
        git revert HEAD --no-edit
        git push origin main
        Write-Host "`n✅ Done! Amplify will redeploy in ~5 mins" -ForegroundColor Green
    }
    "2" {
        Write-Host "`n⚠️ WARNING: This will DELETE commit!" -ForegroundColor Red
        $confirm = Read-Host "Are you sure? (type 'DELETE' to confirm)"
        if ($confirm -eq "DELETE") {
            git reset --hard HEAD~1
            git push --force origin main
            Write-Host "`n✅ Force rollback done!" -ForegroundColor Green
        } else {
            Write-Host "❌ Cancelled" -ForegroundColor Red
        }
    }
    "3" {
        Write-Host "`n🔄 Restoring from backup..." -ForegroundColor Yellow
        
        if (Test-Path "backup/environment.js.backup") {
            Copy-Item "backup/environment.js.backup" "src/config/environment.js" -Force
            Write-Host "✅ Restored environment.js" -ForegroundColor Green
        }
        
        if (Test-Path "backup/index.html.backup") {
            Copy-Item "backup/index.html.backup" "public/index.html" -Force
            Write-Host "✅ Restored index.html" -ForegroundColor Green
        }
        
        Write-Host "`nCommit changes? (y/n)"
        $commitConfirm = Read-Host
        if ($commitConfirm -eq "y") {
            git add .
            git commit -m "revert: Restore from backup files"
            git push origin main
            Write-Host "`n✅ Restored and pushed!" -ForegroundColor Green
        }
    }
    "4" {
        Write-Host "`n❌ Cancelled" -ForegroundColor Yellow
    }
    default {
        Write-Host "`n❌ Invalid choice" -ForegroundColor Red
    }
}
```

---

## 📸 BACKUP HIỆN TẠI (TRƯỚC KHI COMMIT)

### Tạo snapshot Git:

```bash
# Tạo tag backup
git tag backup-before-eb-integration

# Push tag lên GitHub
git push origin backup-before-eb-integration

# Khôi phục về tag này bất cứ lúc nào:
git checkout backup-before-eb-integration
```

---

## 🧪 TEST ROLLBACK (DRY RUN)

Trước khi rollback thật:

```bash
# Xem thay đổi sẽ bị revert
git show HEAD

# Hoặc xem diff giữa commit hiện tại và trước đó
git diff HEAD HEAD~1

# Test revert (không commit)
git revert --no-commit HEAD

# Xem thay đổi
git status
git diff

# Hủy test
git revert --abort
```

---

## 🎯 QUICK REFERENCE

| Tình huống | Command |
|------------|---------|
| Revert commit cuối | `git revert HEAD && git push` |
| Xóa commit cuối | `git reset --hard HEAD~1 && git push --force` |
| Về 2 commits trước | `git reset --hard HEAD~2 && git push --force` |
| Về commit cụ thể | `git reset --hard <commit-hash> && git push --force` |
| Restore 1 file | `git checkout HEAD~1 -- path/to/file` |
| Amplify manual | AWS Console → Deployments → Redeploy |

---

## ⚠️ LƯU Ý QUAN TRỌNG

### 1. **Force Push Risks:**
- ⚠️ Xóa commit history
- ⚠️ Có thể conflict nếu ai đó đã pull
- ⚠️ Chỉ dùng khi chắc chắn

### 2. **Revert vs Reset:**
- **Revert:** Tạo commit mới, giữ history (SAFE)
- **Reset:** Xóa commit, clean history (RISKY)

### 3. **Amplify Auto-Deploy:**
- Mỗi push → Auto deploy
- Mất ~5 phút
- Check status trong Amplify Console

### 4. **Database/Backend:**
- Rollback frontend KHÔNG ảnh hưởng backend
- Backend vẫn chạy bình thường
- Chỉ frontend được revert

---

## 📞 TROUBLESHOOTING

### "Git push rejected"
```bash
# Solution: Pull trước khi push
git pull --rebase origin main
git push origin main
```

### "Cannot force push (protected branch)"
```bash
# Go to GitHub → Settings → Branches
# Uncheck "Require pull request reviews before merging"
# Or use GitHub UI to revert
```

### "Amplify không auto-deploy sau push"
```bash
# Manual trigger trong Amplify Console
# Hoặc: Push empty commit
git commit --allow-empty -m "trigger deploy"
git push origin main
```

---

## ✅ CHECKLIST SAU ROLLBACK

- [ ] Git history clean
- [ ] Amplify deployment thành công
- [ ] App accessible
- [ ] No console errors (hoặc chỉ có expected errors)
- [ ] Functionality works như trước

---

**Last Updated:** December 3, 2025  
**Status:** Ready for rollback if needed

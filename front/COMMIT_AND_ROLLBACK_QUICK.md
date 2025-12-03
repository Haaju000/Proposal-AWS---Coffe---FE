# 🚀 COMMIT & ROLLBACK - Quick Guide (GitHub Desktop)

## 📦 TRƯỚC KHI COMMIT

### Tạo backup point trong GitHub Desktop:
1. Click **"Repository"** menu → **"Create tag"**
2. Tag name: `backup-before-eb-test`
3. Description: `Backup before Elastic Beanstalk integration`
4. Click **"Create tag"**
5. Click **"Repository"** → **"Push tags"**

---

## 🚀 COMMIT CHANGES (GitHub Desktop)

### Bước 1: Review Changes
1. Mở **GitHub Desktop**
2. Tab **"Changes"** - Xem tất cả files thay đổi
3. Review từng file (click để xem diff)

### Bước 2: Commit
1. **Summary:** `Configure Elastic Beanstalk API integration`
2. **Description:**
```
- Update environment config for EB HTTP endpoint
- Disable upgrade-insecure-requests (backend has no SSL)
- Update all service files to use ENV_CONFIG
- Add debug components and documentation

⚠️ Known: Mixed content will cause API failures until backend has SSL
```
3. Click **"Commit to main"**

### Bước 3: Push
1. Click **"Push origin"** (button ở top)
2. Wait for push to complete
3. Amplify sẽ tự động deploy (~5 phút)

---

## 🔄 NẾU CẦN ROLLBACK (GitHub Desktop)

### ⚡ Method 1: Revert Commit (RECOMMENDED)
1. Tab **"History"**
2. **Right-click** on commit vừa push
3. Select **"Revert changes in commit"**
4. Click **"Push origin"**
5. ✅ Done! Amplify sẽ auto-deploy lại

### 🔙 Method 2: Undo Commit (Before Push)
- Nếu chưa push, click **"Undo"** button ở bottom

### 🎯 Method 3: Restore to Tag
1. Tab **"History"**
2. Find tag **"backup-before-eb-test"**
3. Right-click → **"Create branch from tag"**
4. Switch to new branch
5. Push new branch

### ⚠️ Method 4: Reset to Commit (DANGER)
1. Tab **"History"**
2. Right-click on commit TRƯỚC commit lỗi
3. Select **"Reset current branch to here"**
4. Choose **"Hard reset"**
5. Click **"Repository"** → **"Push"** → **Force push**

---

## 📊 CHECK STATUS

### GitHub Desktop:
- Tab **"Changes"**: Uncommitted changes
- Tab **"History"**: Commit history
- Top bar: Current branch, Push/Pull status

### Amplify:
```
https://console.aws.amazon.com/amplify
→ Check deployment status
```

---

## ✅ CHECKLIST

**Trước commit:**
- [ ] GitHub Desktop shows all changes
- [ ] Review changes look correct
- [ ] Create backup tag
- [ ] Write clear commit message

**Sau commit:**
- [ ] Push successful (no errors)
- [ ] Check GitHub.com - commit appeared
- [ ] Amplify auto-deploy triggered
- [ ] Wait 5 minutes
- [ ] Check app URL
- [ ] If error → Revert trong GitHub Desktop

---

## 🆘 EMERGENCY ROLLBACK

### Fastest way (GitHub Desktop):
1. **History** tab
2. **Right-click** last commit
3. **"Revert changes in commit"**
4. **Push origin**
5. ✅ Done in 10 seconds!

---

## 🎥 VISUAL GUIDE

### Revert Steps:
```
GitHub Desktop
  → History tab
  → Right-click commit
  → "Revert changes in commit"
  → Confirm
  → Push origin button
  → ✅ Reverted!
```

### Create Tag:
```
Repository menu
  → Create tag...
  → Name: backup-before-eb-test
  → Create tag
  → Repository → Push tags
  → ✅ Backup created!
```

---

## 📞 SUPPORT

- Full PowerShell guide: `ROLLBACK_GUIDE.md` (if needed)
- This is easier with GitHub Desktop UI!

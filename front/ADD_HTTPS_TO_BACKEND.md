# 🔒 Hướng dẫn thêm HTTPS cho Elastic Beanstalk

## Bước 1: Tạo SSL Certificate (5 phút)

1. Vào AWS Console → **Certificate Manager** (ACM)
2. Chọn region: **ap-southeast-1** (Singapore)
3. Click **"Request a certificate"**
4. Chọn **"Request a public certificate"**
5. Domain name: `fixenv-env.eba-vgperhwx.ap-southeast-1.elasticbeanstalk.com`
6. Validation method: **DNS validation**
7. Click **"Request"**

⏳ **Chờ 5-10 phút** để certificate được validate

---

## Bước 2: Add HTTPS Listener (3 phút)

1. Vào **Elastic Beanstalk Console**
2. Chọn environment: `fixenv-env`
3. Sidebar → **Configuration**
4. Tìm **"Load balancer"** → Click **"Edit"**
5. Trong **"Listeners"**, click **"Add listener"**:
   - Protocol: **HTTPS**
   - Port: **443**
   - SSL certificate: Chọn certificate vừa tạo
6. Click **"Add"** rồi **"Apply"**

⏳ **Chờ 3-5 phút** để Elastic Beanstalk cập nhật

---

## Bước 3: Update Frontend Config

```javascript
// src/config/environment.js
export const ENV_CONFIG = {
  API: {
    PRODUCTION: {
      USE_AMPLIFY_AUTH: true,
      API_BASE_URL: 'https://fixenv-env.eba-vgperhwx.ap-southeast-1.elasticbeanstalk.com/api', // ← HTTPS
      AUTH_TYPE: 'amplify'
    }
  }
};
```

---

## Bước 4: Test

```bash
# Test backend có HTTPS chưa
curl https://fixenv-env.eba-vgperhwx.ap-southeast-1.elasticbeanstalk.com/swagger

# Nếu OK, deploy frontend
npm run build
```

---

## ✅ Hoàn tất!

- ✅ Backend có HTTPS
- ✅ Frontend có HTTPS  
- ✅ Không bị Mixed Content Error
- ✅ Bảo mật tốt
- ✅ **MIỄN PHÍ** (ACM certificate free)

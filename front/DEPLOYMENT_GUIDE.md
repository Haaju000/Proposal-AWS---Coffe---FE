# 🚀 Hướng Dẫn Deploy Frontend với Elastic Beanstalk Backend

## ✅ Những thay đổi đã thực hiện

### 1. **Cập nhật Environment Configuration**
File: `src/config/environment.js`
- ✅ **PRODUCTION URL**: `http://fixenv-env.eba-vgperhwx.ap-southeast-1.elasticbeanstalk.com/api`
- ✅ **LOCAL URL**: `http://localhost:5144/api` (cho development)
- ✅ Tự động detect environment (localhost vs production)

### 2. **Cập nhật tất cả Service Files**
Đã cập nhật 14 files để sử dụng `ENV_CONFIG`:

✅ `authService.js`
✅ `loyaltyService.js`
✅ `shipperService.js`
✅ `customerService.js`
✅ `drinkService.js`
✅ `cakeService.js`
✅ `toppingService.js`
✅ `inventoryService.js`
✅ `dashboardService.js`
✅ `paymentService.js`
✅ `notificationService.js`
✅ `orderService.js`
✅ `shipperAPI.js`
✅ `shipperRegistrationService.js`

### 3. **Cập nhật Payment Result Page**
File: `src/pages/PaymentResult.js`
- ✅ Sử dụng dynamic API URL thay vì hardcode

---

## 🌐 Cách Hoạt Động

### **Khi chạy trên localhost** (`npm start` local):
```javascript
API_BASE_URL = 'http://localhost:5144/api'
USE_AMPLIFY_AUTH = false
```

### **Khi deploy trên Amplify/Production**:
```javascript
API_BASE_URL = 'http://fixenv-env.eba-vgperhwx.ap-southeast-1.elasticbeanstalk.com/api'
USE_AMPLIFY_AUTH = true
```

---

## 📝 Backend CORS Configuration

Backend của bạn đã được cấu hình đúng trong `Program.cs`:

```csharp
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.WithOrigins(
                "http://localhost:3000",  // Local development
                "https://main.d3djm3hylbiyyu.amplifyapp.com",  // Amplify
                "http://fixenv-env.eba-vgperhwx.ap-southeast-1.elasticbeanstalk.com"  // EB
              )
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials();
    });
});
```

---

## 🧪 Testing

### **1. Test Local**
```bash
npm start
```
→ Sẽ connect tới `http://localhost:5144/api`

### **2. Test Production**
Deploy lên Amplify hoặc hosting bất kỳ
→ Sẽ tự động connect tới Elastic Beanstalk URL

### **3. Verify Connection**
Mở browser console và check:
```javascript
import { ENV_CONFIG } from './src/config/environment';
console.log(ENV_CONFIG.getApiBaseUrl());
```

---

## ⚠️ Lưu Ý Quan Trọng

### **1. HTTPS vs HTTP**
- ⚠️ Backend hiện đang dùng **HTTP** (không secure)
- Nếu frontend deploy trên HTTPS (như Amplify), có thể gặp **Mixed Content Error**
- **Giải pháp**: 
  - Thêm SSL certificate cho Elastic Beanstalk
  - Hoặc deploy frontend cũng trên HTTP

### **2. CORS Issues**
Nếu gặp lỗi CORS:
1. Kiểm tra backend có chạy không: `http://fixenv-env.eba-vgperhwx.ap-southeast-1.elasticbeanstalk.com/swagger`
2. Kiểm tra frontend origin đã được add vào CORS policy chưa
3. Check browser console để xem exact error

### **3. Authentication**
- **Production** sẽ dùng AWS Cognito
- **Local** có thể dùng custom auth hoặc Cognito
- JWT tokens được tự động attach vào mọi request qua axios interceptors

---

## 🔧 Troubleshooting

### **Error: "Network Error" hoặc "Failed to fetch"**
**Nguyên nhân**: Backend không chạy hoặc CORS chưa đúng
**Giải pháp**:
```bash
# Test backend trực tiếp
curl http://fixenv-env.eba-vgperhwx.ap-southeast-1.elasticbeanstalk.com/api/health
```

### **Error: "Mixed Content"**
**Nguyên nhân**: Frontend HTTPS → Backend HTTP
**Giải pháp**: Cấu hình SSL cho Elastic Beanstalk

### **Error: "Unauthorized" (401)**
**Nguyên nhân**: Token không hợp lệ hoặc expired
**Giải pháp**: 
1. Clear localStorage
2. Login lại
3. Check token trong localStorage: `localStorage.getItem('access_token')`

---

## 📦 Deploy Frontend

### **Deploy lên AWS Amplify**
```bash
# Amplify sẽ tự động build và deploy
# Build command: npm run build
# Publish directory: build
```

### **Build Manual**
```bash
npm run build
# Upload folder 'build' lên hosting service
```

---

## 🎯 Next Steps

1. ✅ **Test thoroughly** trên production environment
2. ⚠️ **Consider HTTPS** cho backend (SSL certificate)
3. 🔒 **Secure sensitive data** (không hardcode credentials)
4. 📊 **Monitor logs** trên Elastic Beanstalk
5. 🚀 **Optimize performance** (CDN, caching, etc.)

---

## 📞 Support

Nếu gặp vấn đề:
1. Check browser console (F12)
2. Check network tab để xem request/response
3. Check backend logs trên Elastic Beanstalk
4. Verify CORS và authentication configuration

---

**Last Updated**: December 3, 2025
**Backend URL**: http://fixenv-env.eba-vgperhwx.ap-southeast-1.elasticbeanstalk.com
**Frontend**: Auto-detect localhost vs production

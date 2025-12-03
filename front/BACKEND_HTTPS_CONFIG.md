# ⚠️ Backend Configuration for Mixed Content Support

## Vấn đề hiện tại:
Backend có HTTP security headers nhưng **CHƯA hỗ trợ HTTPS**.
Meta tag `upgrade-insecure-requests` sẽ tự động chuyển HTTP → HTTPS, 
nhưng backend sẽ reject vì chưa có SSL certificate.

---

## ✅ Giải pháp: Thêm HTTPS Redirect Middleware

### Cập nhật Program.cs:

```csharp
// Thêm TRƯỚC app.UseCors("AllowAll");

// === HTTPS Redirect cho Production ===
if (!app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection(); // Tự động redirect HTTP → HTTPS
}

// === Security Headers cho Mixed Content ===
app.Use(async (context, next) =>
{
    // Cho phép HTTPS frontend gọi HTTP backend
    context.Response.Headers.Add("Access-Control-Allow-Credentials", "true");
    context.Response.Headers.Add("X-Content-Type-Options", "nosniff");
    
    // ⚠️ CHỈ cho development/testing - KHÔNG dùng trong production thực sự
    if (app.Environment.IsDevelopment() || 
        context.Request.Headers["Origin"].ToString().Contains("amplifyapp.com"))
    {
        context.Response.Headers.Remove("X-Frame-Options");
    }
    
    await next();
});

app.UseCors("AllowAll");
```

---

## ⚠️ LƯU Ý QUAN TRỌNG:

### 1. **Backend PHẢI có SSL Certificate**
Elastic Beanstalk cần HTTPS listener:
- Vào EB Console → Configuration → Load Balancer
- Add listener: HTTPS:443
- Attach SSL certificate từ ACM

### 2. **Nếu không có HTTPS:**
```
Frontend: https://amplifyapp.com
↓ (upgrade-insecure-requests)
Backend: https://fixenv-env.eba-vgperhwx... 
↓
❌ ERR_CONNECTION_REFUSED (vì backend chỉ có HTTP)
```

### 3. **Test HTTPS hoạt động:**
```bash
curl https://fixenv-env.eba-vgperhwx.ap-southeast-1.elasticbeanstalk.com/swagger
```

Nếu **KHÔNG hoạt động** → Meta tag sẽ **GÂY RA LỖI**!

---

## 🎯 KHUYẾN NGHỊ:

**Thay vì dùng Mixed Content bypass:**
1. ✅ Thêm SSL certificate cho Elastic Beanstalk (15 phút, miễn phí)
2. ✅ Backend support HTTPS natively
3. ✅ Không cần workaround, bảo mật tốt hơn

**Xem hướng dẫn:** `ADD_HTTPS_TO_BACKEND.md`

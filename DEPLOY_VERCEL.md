# 🚀 Deploy Frontend lên Vercel

---

## **BƯỚC 1: Chuẩn Bị (2 phút)**

```bash
# Từ thư mục gốc
cd d:\Spend-Sense-AI

# Commit tất cả thay đổi
git add .
git commit -m "Ready for Vercel deployment"
git push origin main
```

---

## **BƯỚC 2: Vercel Setup (5 phút)**

### **2.1 Tạo Tài Khoản**
1. Vào https://vercel.com
2. Click "Sign Up"
3. Chọn "Continue with GitHub"
4. Authorize Vercel

### **2.2 Import Project**
1. Dashboard → "Add New" → **Project**
2. Chọn repository: `Spend-Sense-AI`
3. Click "Import"

---

## **BƯỚC 3: Cấu Hình Build (3 phút)**

### **3.1 Configure Project**
Vercel sẽ show form:

```
PROJECT NAME: spend-sense-ai
(Vercel tự detect)
```

### **3.2 Framework & Build Settings**
Vercel sẽ đọc cấu hình từ [frontend/vercel.json](frontend/vercel.json#L1), nên bạn có thể giữ mặc định hoặc để `Other`.

Nếu cần nhập tay trong UI thì dùng:
```
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

### **3.3 Root Directory**
Đặt `Root Directory` thành `frontend`.

---

## **BƯỚC 4: Environment Variables (2 phút)**

### **4.1 Add Environment Variables**
1. Continue → "Environment Variables"
2. Thêm từng biến:

```
VITE_API_URL = /api
VITE_TIMEOUT_MS = 10000
VITE_RECEIPT_TIMEOUT_MS = 120000
VITE_GOOGLE_CLIENT_ID = your-google-client-id
```

> 💡 Dùng `VITE_API_URL = /api` để frontend đi qua proxy của Vercel, tránh lỗi CORS và tránh gọi nhầm vào frontend domain.
> 💡 Nếu muốn trỏ trực tiếp vào Railway thì vẫn có thể set full URL, nhưng lúc đó phải giữ CORS backend như hiện tại.
> 💡 Backend FastAPI đã đọc `PORT` từ Railway qua lệnh `python -m uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}`, nên phần này không cần sửa.

### **4.2 Save**
Click "Save" → Continue

---

## **BƯỚC 5: Deploy! (1 phút)**

**Click "Deploy"** → Chờ build hoàn tất (~2-3 phút)

Khi xong:
```
✅ Deployment Complete!
🎉 Your site is live on https://spend-sense-ai.vercel.app
```

---

## **BƯỚC 6: Lấy Frontend URL**

Copy URL từ Vercel:
```
https://spend-sense-ai.vercel.app
```

(Hoặc custom domain nếu muốn)

---

## **BƯỚC 7: Test (1 phút)**

### **7.1 Mở Frontend**
```
https://spend-sense-ai.vercel.app
```

### **7.2 DevTools - Check API Connection**
1. F12 → Network tab
2. Refresh trang
3. Tìm request đi đến backend URL
4. Nếu status 200 → ✅ OK!

### **7.3 Test Login**
1. Đăng ký account mới
2. Email + password
3. Nếu thành công → ✅ Backend connect OK!

### **7.4 Test Upload Receipt**
1. Đăng nhập
2. Dashboard → Upload receipt
3. Chụp hoặc chọn file hóa đơn
4. Xem kết quả → Check API call trong Network tab

---

## **✅ DONE!**

| Service | URL |
|---------|-----|
| Frontend | https://spend-sense-ai.vercel.app |
| Backend | https://spend-sense-backend-production.up.railway.app |
| Database | Supabase |

---

## **🔗 Liên Kết Nhanh**

- Vercel Dashboard: https://vercel.com/dashboard
- Railway Dashboard: https://railway.app/dashboard
- GitHub: https://github.com/4-useless-student/Spend-Sense-AI

---

## **🐛 Troubleshooting**

| Lỗi | Fix |
|-----|-----|
| Build failed | Check `npm run build` locally: `cd frontend && npm run build` |
| Blank page | Check dist/ folder exists, root directory = `frontend` |
| API not responding | VITE_API_URL sai? Check Railway URL |
| CORS error | Backend CORS không allow Vercel URL |
| 404 on route | Frontend routing issue, check vite.config.ts |

---

## **📝 Notes**

- Vercel auto redeploy khi push code
- Logs: Vercel → Deployments → click deployment → Logs
- Custom domain: Settings → Domains → Add domain

---

**Xong! 🎉 Dự án live trên production!**

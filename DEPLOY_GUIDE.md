# 🚀 Hướng Dẫn Deploy Spend-Sense-AI - Option 1
## Frontend lên Vercel + Backend lên Render

---

## ✅ BƯỚC 1: Chuẩn Bị Trước Deploy

### 1.1 Đảm bảo mã nguồn sạch
```bash
# Từ thư mục gốc Spend-Sense-AI
git add .
git commit -m "Ready for production deployment"
git push origin main
```

### 1.2 Kiểm tra Git repo
- Đảm bảo code đã push lên GitHub
- Repo phải public hoặc bạn có quyền truy cập

### 1.3 Chuẩn bị các API Key cần thiết
Bạn cần các biến này (từ .env.example):
- ✅ `GEMINI_API_KEY` (Google Gemini)
- ✅ `GOOGLE_CLIENT_ID` (Google OAuth)
- ✅ `DATABASE_URL` (PostgreSQL từ Supabase/Railway)
- ✅ `JWT_SECRET_KEY` (sinh ngẫu nhiên, min 32 char)
- ✅ `HF_TOKEN` (optional, cho Hugging Face models)

---

## 📱 BƯỚC 2: Deploy Frontend lên Vercel

### 2.1 Tạo tài khoản Vercel
1. Vào https://vercel.com
2. Click "Sign Up"
3. Chọn "Continue with GitHub" (dễ nhất)
4. Authorize Vercel để truy cập GitHub

### 2.2 Import Project trên Vercel
1. Vào Dashboard → "Add New..." → "Project"
2. Chọn repo `Spend-Sense-AI`
3. Click "Import"

### 2.3 Cấu hình Build Settings
```
Framework Preset: Vite
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

### 2.4 Cấu hình Environment Variables (Frontend)
Add các biến sau trong "Environment Variables":
```
VITE_API_URL = https://spend-sense-backend.onrender.com
VITE_TIMEOUT_MS = 10000
VITE_RECEIPT_TIMEOUT_MS = 120000
```

> 🔗 **LƯU Ý:** `VITE_API_URL` sẽ là URL backend trên Render (cấu hình sau)

### 2.5 Advanced Settings
- Root Directory: `frontend` (rất quan trọng!)
- Click "Deploy"

### 2.6 Chờ Deploy hoàn tất
- Vercel sẽ build tự động
- Khi xong, bạn sẽ có URL như: `https://spend-sense-ai.vercel.app`

✅ **Frontend đã live!**

---

## 🔧 BƯỚC 3: Setup Backend trên Render

### 3.1 Tạo tài khoản Render
1. Vào https://render.com
2. Click "Sign Up"
3. Chọn "Continue with GitHub"

### 3.2 Tạo PostgreSQL Database
1. Vào Dashboard → "New +" → "PostgreSQL"
2. Tên: `spend-sense-db`
3. Database: `spendsense`
4. User: `postgres`
5. Region: Gần bạn nhất (VN → Singapore)
6. Chọn free plan (512MB)
7. Click "Create Database"
8. **LƯU DATABASE_URL** (sẽ cần dùng sau)

### 3.3 Tạo Web Service cho Backend
1. Vào Dashboard → "New +" → "Web Service"
2. Chọn "Connect a repository"
3. Tìm `Spend-Sense-AI` và "Connect"

### 3.4 Cấu hình Web Service
```
Name: spend-sense-backend
Environment: Python 3
Build Command: pip install -r requirements.txt && alembic upgrade head
Start Command: uvicorn main:app --host 0.0.0.0 --port $PORT
Region: Singapore (hoặc gần nhất)
Plan: Standard ($12/month)
```

### 3.5 Add Environment Variables
Click "Environment" → Add từng biến (từ .env của bạn):
```
GEMINI_API_KEY = (copy từ Google Cloud)
GOOGLE_CLIENT_ID = (copy từ Google OAuth)
DATABASE_URL = (copy từ PostgreSQL Database)
JWT_SECRET_KEY = (tạo key mới: openssl rand -hex 32)
JWT_ALGORITHM = HS256
JWT_EXPIRE_MINUTES = 1440
API_HOST = 0.0.0.0
API_PORT = $PORT
DEBUG = false
YOLO_CONFIDENCE = 0.3
EMBEDDING_MODEL = all-MiniLM-L6-v2
SIMILARITY_THRESHOLD = 0.9
VITE_API_URL = (sẽ lấy từ backend URL sau)
```

> **Tạo JWT_SECRET_KEY mới:** Chạy lệnh trong PowerShell:
> ```powershell
> [System.Guid]::NewGuid().ToString() -replace '-', '' | ForEach-Object { $_ * 2 }
> ```
> Hoặc copy từ kết quả: `openssl rand -hex 32` (nếu có OpenSSL)

### 3.6 Deploy Backend
1. Click "Create Web Service"
2. Render sẽ tự động deploy
3. Chờ khi thấy "Your service is live on https://spend-sense-backend.onrender.com"
4. **LƯU URL này** (dạng: `https://spend-sense-backend-xxxxx.onrender.com`)

✅ **Backend đã live!**

---

## 🔗 BƯỚC 4: Update Frontend với Backend URL

### 4.1 Cập nhật Vercel Environment Variable
1. Vào Vercel Dashboard → Project → Settings → Environment Variables
2. Update `VITE_API_URL` thành URL của backend Render
3. Click "Save"
4. Trigger redeploy:
   - Vào Deployments → Click "..." trên deployment mới nhất → "Redeploy"

### 4.2 Verify Connection
1. Mở frontend: https://your-project.vercel.app
2. Mở DevTools → Network tab
3. Test login hoặc upload receipt
4. Verify API call đi đến backend URL đúng

---

## 🧪 BƯỚC 5: Test Production

### 5.1 Test Frontend
```bash
# Verify frontend loads
curl https://your-project.vercel.app
```

### 5.2 Test Backend Health
```bash
curl https://spend-sense-backend-xxxxx.onrender.com/api/health
```

### 5.3 Test Database Connection
Vào Render Backend → Logs → xem có error liên quan database không

### 5.4 Test API Endpoint
```bash
curl -X POST https://spend-sense-backend-xxxxx.onrender.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "password123"}'
```

---

## ⚙️ BƯỚC 6: Cấu hình CORS (nếu có lỗi)

Nếu frontend bị lỗi CORS, cập nhật file `main.py`:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://your-project.vercel.app",
        "http://localhost:3000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

Sau đó push và Render sẽ tự động redeploy.

---

## 🔒 BƯỚC 7: Bảo Mật (Quan Trọng!)

### 7.1 Không commit .env
Đảm bảo `.env` trong `.gitignore`:
```bash
echo ".env" >> .gitignore
git add .gitignore
git commit -m "Add .env to gitignore"
git push
```

### 7.2 Tạo JWT_SECRET_KEY mới
Không dùng secret cũ! Generate mới:
```bash
python -c "import secrets; print(secrets.token_hex(32))"
```

### 7.3 Enable Custom Domain (tuỳ chọn)
- Vercel: Settings → Domains → Add custom domain
- Render: Settings → Custom Domain

---

## 📊 MONITORING & LOGS

### Vercel Logs
```bash
# Cài Vercel CLI
npm i -g vercel

# Xem logs real-time
vercel logs [URL]
```

### Render Logs
- Vào Dashboard → Web Service → Logs
- Xem real-time logs

### Database
- Vào PostgreSQL trong Render → Connection
- Dùng pgAdmin hoặc DBeaver để connect

---

## 🐛 Troubleshooting

| Lỗi | Giải Pháp |
|-----|----------|
| CORS error | Cập nhật CORS middleware trong main.py |
| Database timeout | Kiểm tra DATABASE_URL, firewall |
| 500 error | Xem Render logs → kiểm tra missing env vars |
| Model load fail | Kiểm tra HF_TOKEN, internet connection |
| Frontend blank | Kiểm tra build output directory là "dist" |

---

## ✨ DONE!

🎉 Bây giờ bạn có:
- ✅ Frontend: https://your-project.vercel.app
- ✅ Backend: https://spend-sense-backend-xxxxx.onrender.com
- ✅ Database: PostgreSQL trên Render
- ✅ Auto CI/CD (push → auto deploy)

Hãy test thử chức năng chính: Upload receipt, login, xem dashboard!

---

**Có lỗi? Cần help? Dm mình nhé!** 🚀

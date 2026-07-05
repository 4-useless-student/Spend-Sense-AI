# 🚀 Deploy lên Railway (Thay vì Render)

Railway dùng được tốt hơn cho dự án này vì:
- ✅ Free credit $5/tháng
- ✅ Memory linh hoạt hơn
- ✅ Hỗ trợ ML models tốt hơn
- ✅ Database PostgreSQL miễn phí

---

## **BƯỚC 1: Git Commit (1 phút)**

```bash
cd d:\Spend-Sense-AI

git add requirements.txt
git commit -m "Optimize dependencies for deployment"
git push origin main
```

---

## **BƯỚC 2: Setup Railway (5 phút)**

### **2.1 Tạo tài khoản & Project**
1. Vào https://railway.app
2. Click "Start New Project"
3. Chọn "Deploy from GitHub"
4. Authorize Railway → chọn repo `Spend-Sense-AI`

### **2.2 Chọn Service
1. GitHub repo settings hiện ra
2. Click "Database" → thêm **PostgreSQL** (Railway tự tạo)
3. Railway tự detect Python project → deploy

---

## **BƯỚC 3: Cấu hình Environment Variables (5 phút)**

### **3.1 Vào Project Settings**
1. Railway Dashboard → Project → Variables
2. Click "Add Variable" → Thêm từng biến:

```
CHROMA_HOST=localhost
CHROMA_PORT=8000
CHROMA_COLLECTION=receipt_insights
SIMILARITY_THRESHOLD=0.9
GEMINI_API_KEY=AIzaSyBFHLo0pp6LTbH8B0gnFeV-PSHb4Khf-pg
GEMINI_MODEL=gemini-2.5-flash
GEMMA_MODEL=gemma-4-31b-it
GEMMA_TIMEOUT_SECONDS=5
GOOGLE_CLIENT_ID=662950444920-sp23rhqarqiudns2e1vbf0ep9a66l45m.apps.googleusercontent.com
YOLO_CONFIDENCE=0.3
YOLO_MODEL_PATH=src/models/yolo/receipt_items_yolov11s.pt
YOLO_MODEL_URL=https://raw.githubusercontent.com/4-useless-student/Spend-Sense-AI/main/src/models/yolo/receipt_items_yolov11s.pt
YOLO_MODEL_REPO=
YOLO_MODEL_FILENAME=receipt_items_yolov11s.pt
YOLO_MODEL_REVISION=main
EMBEDDING_MODEL=all-MiniLM-L6-v2
API_HOST=0.0.0.0
DEBUG=false
JWT_SECRET_KEY=your-secret-key-min-32-chars
JWT_ALGORITHM=HS256
JWT_EXPIRE_MINUTES=1440
VITE_TIMEOUT_MS=10000
VITE_RECEIPT_TIMEOUT_MS=120000
```

### **3.2 Database URL (Tự động)**
Railway tự tạo `DATABASE_URL` - không cần thêm!

> ⚠️ **Nhưng bạn có database trên Supabase rồi, nên:**
> - Copy `DATABASE_URL` từ .env của bạn
> - Add vào Railway variables

```
DATABASE_URL=postgresql+asyncpg://postgres.kpzxwzruaqsbwrgutfea:Quanpnq08032005%23@aws-1-ap-northeast-1.pooler.supabase.com:5432/postgres?ssl=require
```

---

## **BƯỚC 4: Cấu hình Build Command (2 phút)**

Railway auto detect, nhưng để chắc:

1. Project → Settings → "Build Command":
   ```
   pip install -r requirements.txt && alembic upgrade head
   ```

2. "Start Command":
   ```
   uvicorn main:app --host 0.0.0.0 --port $PORT
   ```

3. Save → Auto redeploy

---

## **BƯỚC 5: Kiếm Backend URL (1 phút)**

1. Railway Dashboard → Deployments
2. Tìm service Python → xem logs
3. Khi xong: `https://your-service-xxx.railway.app`
4. **Lưu URL này**

---

## **BƯỚC 6: Update Vercel Frontend**

### **6.1 Cập nhật Environment Variable**
1. Vercel Dashboard → Project → Settings → Environment Variables
2. Update `VITE_API_URL`:
   ```
   VITE_API_URL = https://your-service-xxx.railway.app
   ```
3. Save → Redeploy

### **6.2 Redeploy Frontend**
1. Vercel → Deployments
2. Click "..." trên deployment mới nhất
3. "Redeploy"

---

## **✅ DONE!**

| Service | URL |
|---------|-----|
| Frontend | https://your-project.vercel.app |
| Backend | https://your-service-xxx.railway.app |
| Database | Supabase |

---

## **🧪 Test**

```bash
# Test Backend
curl https://your-service-xxx.railway.app/docs

# Test Frontend
# Mở browser → https://your-project.vercel.app
# Đăng nhập → Upload receipt → Check
```

---

## **💡 Tips**

- Railway free tier: **$5/tháng**
- Nếu hết tiền → Render Standard **$12/tháng** là bước tiếp
- Check logs: Railway Dashboard → Logs tab

---

**Đã xong! Hỏi mình nếu có vấn đề! 🚀**

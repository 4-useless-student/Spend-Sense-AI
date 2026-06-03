# 🎬 Demo Script — SpendSense AI: Quản Lý Đầu Tư & Cố Vấn AI (PA3)

> **Thời lượng khuyến nghị**: 5-7 phút  
> **Người demo**: Kiên  
> **Phần phụ trách**: Luồng 2 — Quản Lý Danh Mục Đầu Tư & AI Cố Vấn Tài Chính

---

## 📋 Chuẩn Bị Trước Khi Quay

### Khởi động ứng dụng
1. Mở **2 terminal** tại thư mục project `Spend-Sense-AI`:
   - **Terminal 1 (Backend)**: 
     ```
     .venv\Scripts\uvicorn main:app --host 127.0.0.1 --port 8080 --reload
     ```
   - **Terminal 2 (Frontend)**: 
     ```
     cd frontend
     npm run dev
     ```
2. Mở trình duyệt tại `http://localhost:5173`
3. Đảm bảo đã login (hệ thống sẽ tự sinh dev token nếu DB offline)

### Chuẩn bị data (nếu chưa có)
- Trước khi quay, nên đã thêm sẵn 2-3 tài sản (ví dụ FPT, GOLD, BTC) vào danh mục để phần Tổng Quan có dữ liệu hiển thị đẹp.
- Nếu chưa có, bạn sẽ thêm trực tiếp trong lúc quay ở phần demo "Thêm tài sản".

### Checklist trước khi bấm Record
- [ ] Backend đang chạy (không có lỗi đỏ trong terminal)
- [ ] Frontend đang chạy (Vite hiện `ready in xxx ms`)
- [ ] Đã đăng nhập (thấy sidebar navigation)
- [ ] Có ít nhất 1-2 tài sản trong danh mục (tùy chọn, có thể thêm live)
- [ ] `GEMINI_API_KEY` trong `.env` còn quota (test thử 1 lần trước)

---

## 🎬 SCRIPT DEMO CHI TIẾT

---

### PHẦN 1: GIỚI THIỆU TỔNG QUAN (30 giây)

**Lời thoại:**
> "Xin chào, mình là Kiên. Hôm nay mình sẽ demo Luồng 2 của SpendSense AI — phần **Quản Lý Đầu Tư và Cố Vấn Tài Chính AI**."

**Thao tác trên giao diện:**
1. Từ Dashboard, **bấm vào menu "Đầu tư"** ở sidebar bên trái
2. Trang Đầu tư mở ra → Dừng lại 2-3 giây để camera quay toàn cảnh

**Lời thoại tiếp:**
> "Đây là trang Đầu tư — trung tâm quản lý danh mục tài sản cá nhân, theo dõi giá thị trường thời gian thực, và nhận tư vấn AI cá nhân hóa."

---

### PHẦN 2: MARKET TICKER — GIÁ THỊ TRƯỜNG THỜI GIAN THỰC (30 giây)

**Thao tác trên giao diện:**
1. **Chỉ vào dãy ticker ngang** ở đầu trang (VN-Index, VN30, HNX-Index, E1VFVN30, FUEVFVND, FUESSVFL)

**Lời thoại:**
> "Ở trên cùng, ứng dụng hiển thị **ticker giá thị trường thời gian thực** của các chỉ số chính — VN-Index, VN30, HNX-Index — và 3 quỹ ETF phổ biến. Dữ liệu được lấy trực tiếp từ thư viện **vnstock** kết nối nguồn KBS, cập nhật mỗi lần tải trang."

> *(Nếu ngoài giờ giao dịch)*: "Hiện tại đang ngoài giờ giao dịch nên giá hiển thị là giá đóng cửa phiên gần nhất."

---

### PHẦN 3: KPI DASHBOARD & TỔNG QUAN DANH MỤC (45 giây)

**Thao tác trên giao diện:**
1. **Chỉ vào 4 card KPI** bên dưới ticker:
   - Tổng vốn đầu tư đăng ký
   - Giá trị danh mục thực tế
   - Lợi nhuận tạm tính (P/L)
   - Vốn khả dụng / Tiền nhàn rỗi
2. **Cuộn xuống** phần biểu đồ tăng trưởng và biểu đồ phân bổ tài sản (Pie chart)

**Lời thoại:**
> "Phần KPI Dashboard cho thấy tổng quan tài chính: tổng vốn đã đăng ký, giá trị thực tế danh mục dựa trên giá thị trường live, lợi nhuận tạm tính P/L, và số tiền nhàn rỗi chưa đầu tư."

> "Bên dưới có **biểu đồ tăng trưởng** danh mục theo thời gian và **biểu đồ tròn phân bổ** tỷ trọng từng loại tài sản."

---

### PHẦN 4: CÀI ĐẶT HỒ SƠ ĐẦU TƯ (45 giây)

**Thao tác trên giao diện:**
1. Bấm **nút bánh răng ⚙️** (góc trên phải, cạnh các tab)
2. Modal "Cài đặt Hồ sơ Đầu tư" mở ra
3. **Chọn khẩu vị rủi ro** → chọn "Tăng trưởng" (Aggressive)
4. **Nhập Tổng vốn đầu tư**: gõ `500000000` (500 triệu)
   - → Chỉ vào dòng preview: **"Định dạng: 500.000.000 ₫ — 500 triệu đồng"**
5. **Nhập Mục tiêu tích lũy**: gõ `2000000000` (2 tỷ)
   - → Chỉ vào dòng preview: **"Định dạng: 2.000.000.000 ₫ — 2 tỷ đồng"**
6. Bấm **"Lưu thay đổi"**

**Lời thoại:**
> "Mình thiết lập hồ sơ đầu tư bằng cách bấm nút cài đặt. Ở đây mình chọn khẩu vị rủi ro là **Tăng trưởng**, tổng vốn 500 triệu, mục tiêu tích lũy 2 tỷ đồng."

> "Một điểm đặc biệt là khi nhập số tiền, ứng dụng sẽ hiển thị **dòng preview định dạng kèm đọc bằng chữ tiếng Việt** — ví dụ 500 triệu đồng, 2 tỷ đồng — giúp người dùng kiểm tra lại ngay mà không sợ nhầm số 0."

---

### PHẦN 5: THÊM TÀI SẢN — AI COPILOT QUICK-ADD (1 phút 30 giây)

**Thao tác trên giao diện:**

#### 5a. Thêm bằng AI Copilot
1. Bấm nút **"+ Thêm tài sản"** 
2. Modal mở ra → đang ở tab **"AI Copilot"** mặc định
3. Trong ô nhập, **gõ**: `Tôi mới mua 200 cổ phiếu FPT giá 135k`
4. Bấm **"Phân tích bằng AI"**
5. Chờ 2-3 giây → AI tự động điền form:
   - Mã: FPT
   - Tên: Cổ phiếu FPT
   - Loại: stock
   - Số lượng: 200
   - Giá mua: 135,000
6. Chỉ vào form đã được điền → bấm **"Thêm tài sản"**

**Lời thoại:**
> "Để thêm tài sản, mình có 2 cách. Cách đầu tiên là dùng **AI Copilot** — mình chỉ cần mô tả bằng ngôn ngữ tự nhiên, ví dụ 'Tôi mới mua 200 cổ phiếu FPT giá 135k'. AI sử dụng **Gemini 2.5 Flash** phân tích câu văn, trích xuất mã chứng khoán, số lượng, giá mua, và tự động điền vào form. Mình chỉ cần review và xác nhận."

#### 5b. Thêm thủ công với Autocomplete
1. Bấm **"+ Thêm tài sản"** lần nữa
2. Chuyển sang tab **"Nhập thủ công"**
3. Trong ô "Mã tài sản", **gõ**: `BTC`
   - → Dropdown autocomplete hiện ra: "Bitcoin"
4. **Chọn Bitcoin** từ dropdown
   - → Tự động điền: Tên = Bitcoin, Loại = crypto, Màu
   - → Tự động gọi API Binance lấy giá BTC hiện tại và điền vào ô "Giá mua"
5. Nhập số lượng: `0.05`
6. Bấm **"Thêm tài sản"**

**Lời thoại:**
> "Cách thứ hai là nhập thủ công với **hệ thống autocomplete thông minh**. Khi gõ mã tài sản, ứng dụng gợi ý từ catalog hơn **75 mã phổ biến** — cổ phiếu Việt Nam, crypto, vàng, tiết kiệm. Khi chọn, hệ thống tự động điền tên, phân loại, và quan trọng nhất là **lấy giá thị trường thời gian thực** từ vnstock hoặc Binance API để điền sẵn vào ô giá."

---

### PHẦN 6: STRESS-TEST VĨ MÔ & ĐỀ XUẤT PHÒNG VỆ (1 phút)

**Thao tác trên giao diện:**
1. Cuộn xuống phần **"Stress-Test & Phòng Vệ Vĩ Mô"** (nếu có)
2. Bấm nút **"Chạy Stress-Test ⚡"**
3. Chờ loading → kết quả hiện ra:
   - 4 kịch bản: Lạm phát phi mã, Suy thoái, Khủng hoảng Tech, Sụp đổ Crypto
   - Với mỗi kịch bản: tổn thất ước tính, mức độ rủi ro
   - Chỉ số Simpson Diversity Index
   - Vulnerability Score
4. Cuộn xuống phần **"AI Khuyến nghị phòng vệ"** → hiển thị các đề xuất hedging/rebalance

**Lời thoại:**
> "Một tính năng nổi bật là **Stress-Test vĩ mô**. Hệ thống mô phỏng 4 kịch bản biến cố — lạm phát phi mã, suy thoái thị trường, khủng hoảng công nghệ, và sụp đổ crypto. Với mỗi kịch bản, nó tính toán mức tổn thất ước tính dựa trên cấu trúc danh mục thực tế."

> "Ngoài ra, nó tính **chỉ số đa dạng hóa Simpson** và **Vulnerability Score**, sau đó gọi **Gemini AI** phân tích sâu và đề xuất hành động phòng vệ cụ thể — ví dụ giảm tỷ trọng cổ phiếu, thêm vàng, hoặc tăng dự trữ tiền mặt."

---

### PHẦN 7: CỐ VẤN TÍCH LŨY AI — NHẬN ĐỊNH CÁ NHÂN HÓA (1 phút 30 giây)

**Thao tác trên giao diện:**
1. Bấm chuyển sang tab **"Cố Vấn Tích Lũy AI"** (tab bên phải)
2. Chờ loading → dữ liệu hiện ra
3. Chỉ vào phần **"Đánh giá Tổng quan Tài chính"**:
   - Khẩu vị rủi ro
   - Tỷ lệ tiết kiệm thực tế
   - Tiến độ mục tiêu tích lũy với thanh progress bar
4. Chỉ vào phần **"Lộ trình Đầu tư Cá Nhân Hóa"**:
   - AI phân tích chi tiết dựa trên dữ liệu thật
5. Cuộn xuống phần **Mô phỏng Tăng trưởng Lãi kép**:
   - **Kéo thanh trượt** "Tiết kiệm hàng tháng" → thay đổi giá trị
   - **Kéo thanh trượt** "Lợi suất kỳ vọng" → thay đổi giá trị
   - **Kéo thanh trượt** "Số năm đầu tư" → thay đổi giá trị
   - → Biểu đồ cập nhật real-time theo các tham số

**Lời thoại:**
> "Đây là tab **Cố Vấn Tích Lũy AI** — tính năng mới hoàn toàn. Hệ thống tổng hợp dữ liệu thu chi 30 ngày, danh mục đầu tư hiện tại, và mục tiêu tích lũy của người dùng, sau đó gọi **Gemini AI** sinh ra **lộ trình đầu tư cá nhân hóa**."

> "Phần đánh giá bao gồm khẩu vị rủi ro, tỷ lệ tiết kiệm thực tế, và **tiến độ đạt mục tiêu**. Dưới đây là bảng **Mô phỏng Tăng trưởng Lãi kép** — mình có thể kéo 3 thanh trượt để điều chỉnh tiết kiệm hàng tháng, lợi suất, và kỳ hạn, biểu đồ sẽ cập nhật ngay lập tức."

---

### PHẦN 8: THỬ THÁCH TIẾT KIỆM GAMIFICATION (30 giây)

**Thao tác trên giao diện:**
1. Cuộn xuống phần **"Thử thách Tiết kiệm"**
2. Bấm **"Tham gia"** vào thử thách "52 Tuần Tích Lũy"
3. Bấm **"Tích lũy thêm"** → nhập số tiền → xác nhận
4. Chỉ vào progress bar cập nhật

**Lời thoại:**
> "Cuối cùng là tính năng **Thử thách Tiết kiệm Gamification** — 3 thử thách tài chính hấp dẫn như 52 Tuần Tích Lũy, Không Trà Sữa 30 Ngày, và Tích Lũy Blue-chip. Người dùng có thể tham gia, tích lũy dần, và tiến trình được đồng bộ trực tiếp vào danh mục đầu tư."

---

### PHẦN 9: NÚT HƯỚNG DẪN SỬ DỤNG (20 giây)

**Thao tác trên giao diện:**
1. Bấm vào **dấu chấm hỏi (?)** bên cạnh tab "Danh Mục & Tài Sản"
2. Modal hướng dẫn mở ra → lướt nhanh nội dung
3. Đóng modal
4. Bấm vào **dấu chấm hỏi (?)** bên cạnh tab "Cố Vấn Tích Lũy AI"
5. Modal hướng dẫn khác mở ra → lướt nhanh

**Lời thoại:**
> "Mỗi tab đều có **nút hướng dẫn (?)** — bấm vào sẽ hiện modal giải thích chi tiết cách sử dụng từng chức năng, giúp người dùng mới dễ dàng làm quen."

---

### PHẦN 10: KẾT THÚC (15 giây)

**Lời thoại:**
> "Tóm lại, Luồng 2 của SpendSense AI cung cấp một bộ công cụ quản lý đầu tư toàn diện — từ theo dõi giá thị trường thời gian thực, quản lý danh mục đa loại tài sản, đến stress-test vĩ mô và cố vấn tài chính AI cá nhân hóa. Tất cả đều tích hợp AI thông minh để giúp người dùng đưa ra quyết định tài chính sáng suốt hơn. Cảm ơn mọi người đã theo dõi!"

---

## ⏱ Tóm Tắt Thời Lượng

| Phần | Nội dung | Thời lượng |
|------|----------|-----------|
| 1 | Giới thiệu tổng quan | 30s |
| 2 | Market Ticker | 30s |
| 3 | KPI Dashboard | 45s |
| 4 | Cài đặt Hồ sơ + Định dạng tiền VN | 45s |
| 5 | Thêm tài sản (AI Copilot + Autocomplete) | 1m30s |
| 6 | Stress-Test vĩ mô | 1m |
| 7 | Cố Vấn AI + Mô phỏng lãi kép | 1m30s |
| 8 | Thử thách Gamification | 30s |
| 9 | Nút Hướng dẫn (?) | 20s |
| 10 | Kết thúc | 15s |
| **Tổng** | | **~7 phút** |

---

## 🛑 Xử Lý Sự Cố Khi Quay

| Vấn đề | Cách xử lý |
|---------|------------|
| AI Copilot / Robo-Advisor bị lỗi | Gemini API hết quota → thay `GEMINI_API_KEY` mới trong `.env`, restart backend |
| Ticker hiện giá 0 hoặc trống | Ngoài giờ giao dịch hoặc vnstock bị rate limit → nói rõ trong video "hiện đang ngoài giờ giao dịch" |
| Loading quá lâu | Backend cold start → chạy trước 1-2 phút, test thử 1 request trước khi quay |
| Form không submit | Kiểm tra browser console (F12) → có thể do CORS hoặc backend chưa chạy |

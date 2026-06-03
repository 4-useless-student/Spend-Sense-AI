# Báo Cáo Working Software — SpendSense AI (PA3)

Tài liệu này tóm tắt các tính năng đã được triển khai, các giới hạn kỹ thuật và lỗi đã biết (known defects) của ứng dụng **SpendSense AI** trong giai đoạn báo cáo PA3.

---

## 1. Các Tính Năng Đã Triển Khai (Implemented Features)

SpendSense AI đã triển khai hoàn thiện hai luồng use-case chính tập trung vào các tính năng hỗ trợ trí tuệ nhân tạo (AI-enabled features):

### 1.1 Luồng 1: Tự Động Phân Tích Hóa Đơn & Lưu Trữ Thông Minh (Data Ingestion & Caching)
*   **Computer Vision & OCR**:
    *   Sử dụng mô hình **YOLOv11s** (fine-tuned) phát hiện chính xác các vùng thông tin hóa đơn (merchant, date, total, items, price, quantity).
    *   Tích hợp mô hình nhận diện chữ viết tiếng Việt **VietOCR (VGG-Transformer)** để trích xuất text thô chất lượng cao.
    *   Tự động phát hiện chiết khấu dòng hàng (Line Discounts) từ các token giá trị âm (ví dụ: `-8.400`) để tính tổng tiền thực tế.
*   **Phân Loại & Chuẩn Hóa**:
    *   Sử dụng mô hình ngôn ngữ **Gemma** để phân loại danh mục từng mặt hàng (ăn uống, di chuyển, mua sắm...). Có hệ thống từ điển từ khóa tiếng Việt fallback nếu API chậm/lỗi.
*   **Semantic Caching (Tối Ưu Hóa Token)**:
    *   Mã hóa hóa đơn thành vector 384 chiều qua `sentence-transformers`.
    *   Lưu và truy vấn trong **ChromaDB**. Nếu hóa đơn tương đồng $\ge 90\%$, hệ thống trả về lời khuyên chi tiêu ngay lập tức từ bộ nhớ cache (**0 token LLM tiêu tốn**).
    *   **Feedback Loop**: Hỗ trợ 👍 (CONFIRM - giữ cache) hoặc 👎 (REJECT - xóa cache/unlearn) trực quan.

### 1.2 Luồng 2: Quản Lý Danh Mục Đầu Tư & AI Cố Vấn Tích Lũy (Investment & Robo-Advisor)
*   **Hồ Sơ Rủi Ro**: Cho phép người dùng tùy chỉnh khẩu vị rủi ro (Thận trọng, Trung bình, Tăng trưởng), thiết lập tổng vốn đầu tư và mục tiêu tài chính.
*   **Quản Lý Tài Sản Thực Tế & Trải Nghiệm Người Dùng Tối Ưu**:
    *   Kết nối trực tiếp thư viện **vnstock (KBS source)** lấy giá cổ phiếu Việt Nam (FPT, HPG, VNM,...) thời gian thực.
    *   Gọi API công khai của **Binance** lấy giá các đồng tiền mã hóa phổ biến (BTC, ETH,...) quy đổi sang VND.
    *   Truy vấn dữ liệu XML tỷ giá vàng **SJC** chính thức.
    *   Tự động tính toán tổng tài sản thực tế, lợi nhuận tạm tính (P/L) và tỷ lệ phần trăm biến động.
    *   **Trợ Lý AI Quick-Add (AI Copilot)**: Phân tích mô tả giao dịch bằng ngôn ngữ tự nhiên sử dụng **Gemini 2.5 Flash** (ví dụ: *"Tôi mới mua 200 cổ phiếu FPT giá 135k"*) để trích xuất JSON cấu trúc đầy đủ và tự động điền thông tin vào biểu mẫu chỉ với 1 click.
    *   **Smart Price Normalization (Tự động Chuẩn hóa Giá)**: Tự động điều chỉnh sai lệch đơn vị giá mua đầu vào (Vàng chỉ/lượng, Cổ phiếu hàng chục/hàng ngàn, Crypto USD/VND) dựa trên tỷ số so sánh với giá live thị trường, ngăn chặn lỗi hiện sai lệch lợi nhuận khổng lồ.
    *   **Autocomplete & Auto-Prefill (Gợi ý & Điền sẵn)**: Dropdown gợi ý các mã tài sản phổ biến (FPT, GOLD, BTC, SAVING...) khi người dùng nhập thủ công, tự động điền Tên tài sản, phân loại, màu đồ thị và tự động gọi API lấy giá thị trường hiện thời để điền sẵn vào ô giá.

### 1.3 AI Cố Vấn Tài Chính Cá Nhân Hóa & Tái Cân Bằng (AI Robo-Advisor) — MỚI
*   **Tái Cân Bằng Danh Mục Robo-Advisor**:
    *   So sánh trực quan tỷ lệ phân bổ tài sản **Hiện tại** so với tỷ lệ **Mục tiêu** tối ưu tương ứng với 3 khẩu vị rủi ro: *Thận trọng (Conservative), Trung bình (Moderate), Tăng trưởng (Aggressive)*.
    *   Tự động tính toán chênh lệch giá trị danh mục và đưa ra đề xuất rõ ràng bằng tiếng Việt cho từng lớp tài sản: **Mua thêm** (màu xanh lá), **Bán bớt** (màu đỏ), hoặc **Giữ nguyên** (màu xám) kèm số tiền cụ thể cần cơ cấu.
*   **Nhận Định Cá Nhân Hóa**: Tab riêng trong trang Đầu tư, phân tích toàn diện tình hình tài chính cá nhân:
    *   Đánh giá **Khẩu vị rủi ro** (Thận trọng / Trung bình / Tăng trưởng) và **Tỷ lệ tiết kiệm thực tế** dựa trên dữ liệu thu chi 30 ngày gần nhất.
    *   Tính toán thời gian đạt **Mục tiêu tiết kiệm** (số tiền tích lũy cụ thể do người dùng nhập) theo 3 tốc độ: Hiện tại, Trung bình, và Tối ưu.
    *   Gọi **Gemini 2.5 Flash** sinh lộ trình đầu tư cá nhân hóa (phân bổ tài sản, chiến lược ngắn/dài hạn) dựa trên dữ liệu thực tế của người dùng.
*   **Bảng Mô Phỏng Tăng Trưởng (Wealth Planner)**: Công cụ tính lãi kép tương tác với 3 thanh trượt (tiết kiệm hàng tháng, lợi suất kỳ vọng, số năm đầu tư), hiển thị biểu đồ tăng trưởng và tổng tài sản dự kiến.
*   **Thử Thách Tiết Kiệm Gamification**: 3 thử thách tài chính (52 Tuần, Không Trà Sữa, Tích Lũy Blue-chip) với progress bar, cho phép tích lũy và đồng bộ trực tiếp vào danh mục đầu tư.

### 1.4 Cải Thiện UX/UI — MỚI
*   **Hiển Thị Định Dạng Tiền Tệ & Đọc Số Bằng Chữ Tiếng Việt**: Tất cả các ô nhập số tiền (vốn đầu tư, giá mua tài sản, mục tiêu tiết kiệm, thêm giao dịch) hiển thị dòng xem trước trực quan, ví dụ: `Định dạng: 2.000.000.000 ₫ — Hai tỷ đồng`.
*   **Nút Hướng Dẫn (?) Theo Ngữ Cảnh**: Mỗi tab trong trang Đầu tư đều có nút dấu chấm hỏi, bấm vào sẽ hiện modal hướng dẫn sử dụng các chức năng chi tiết tương ứng với tab đang hoạt động.
*   **Market Ticker Ngang**: Hiển thị ticker chạy ngang ở đầu trang Đầu tư với giá và % biến động thời gian thực của các chỉ số (VN-Index, VN30, HNX-Index) và quỹ ETF (E1VFVN30, FUEVFVND, FUESSVFL).

---

## 2. Giới Hạn (Limitations)
*   **Chất lượng ảnh đầu vào**: Độ chính xác của YOLO và VietOCR phụ thuộc lớn vào góc chụp, ánh sáng và nếp gấp của hóa đơn giấy.
*   **Dữ liệu lịch sử đầu tư**: Hiện tại danh mục đầu tư chỉ ghi nhận số dư và giá mua trung bình thời gian thực; chưa vẽ biểu đồ tăng trưởng lịch sử nhiều năm dựa trên dữ liệu thật (đồ thị tăng trưởng hiện tại sử dụng đường cong giả lập kết thúc ở giá trị thực tế).
*   **Tốc độ mạng ngoại vi**: Việc gọi API tỷ giá Binance hoặc XML SJC có thể bị chậm hoặc chặn (rate limit) tùy thuộc vào kết nối mạng của máy chủ deploy.
*   **Gemini API Quota**: Các tính năng AI (Robo-Advisor, AI Copilot) phụ thuộc vào quota của Google Gemini API key. Khi hết quota, hệ thống sẽ báo lỗi; cần thay API key mới trong file `.env` (biến `GEMINI_API_KEY`).

---

## 3. Các Lỗi Đã Biết (Known Defects)
*   **Độ Trễ Khởi Động Model (Cold Start)**: Lần đầu tiên gọi API `/receipts/analyze` sau khi khởi động server sẽ mất 5-10 giây do máy chủ phải nạp mô hình YOLO và VietOCR lên RAM. (Đã giảm thiểu bằng cách chạy tiến trình warm-up trước ở lifespan startup).
*   **Hợp Nhất Dòng Hóa Đơn Phức Tạp**: Với các hóa đơn in lệch dòng lớn, thuật toán tái tạo (Reconstructor) đôi khi ghép nhầm đơn giá của mặt hàng này sang mặt hàng kia. Người dùng cần chỉnh sửa thủ công trên giao diện Review trước khi lưu.
*   **Stateless Dev Auth Fallback**: Khi cơ sở dữ liệu PostgreSQL ngoại tuyến, hệ thống tự động sinh JWT giả định để người dùng trải nghiệm nhanh. Tính năng này cần được vô hiệu hóa trước khi đưa sản phẩm lên môi trường Product.
*   **Chỉ số thị trường ngoài giờ giao dịch**: Các chỉ số VN-Index, VN30, HNX-Index chỉ có dữ liệu trong giờ giao dịch (9:00-15:00 ngày làm việc). Ngoài giờ giao dịch, giá hiển thị sẽ là giá đóng cửa phiên gần nhất hoặc giá fallback.

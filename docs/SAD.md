Logical View 
Kiến trúc Tổng thể
SpendSense AI được xây dựng theo kiến trúc 3 tầng kết hợp với mô hình luồng dữ liệu.
Tầng 1 - Presentation (Giao diện người dùng) Là ứng dụng Mobile hoặc Web mà người dùng trực tiếp tương tác. Tầng này chịu trách nhiệm hiển thị biểu đồ thống kê, nhận ảnh hóa đơn từ camera, hiển thị gợi ý đầu tư và nhận Push Notification. Tầng này không chứa logic nghiệp vụ.
Tầng 2 - Application (Xử lý nghiệp vụ) Đây là phần lõi của hệ thống, nơi toàn bộ logic nghiệp vụ diễn ra. Tầng này được chia thành 4 thành phần chạy theo chuỗi luồng dữ liệu: Data Ingestion => Cash Flow Engine => Investment Advisor => Reporting & Notification. Mỗi thành phần xử lý một trách nhiệm riêng biệt và truyền kết quả cho thành phần tiếp theo.
Tầng 3 - Data (Lưu trữ dữ liệu) Gồm hai kho lưu trữ chính: Normalized Transaction Store (lưu các giao dịch đã chuẩn hóa dạng quan hệ) và Vector DB (lưu các embedding phục vụ Semantic Cache cho việc phân loại nhanh). Tầng này chỉ được truy cập bởi Tầng 2, không bao giờ trực tiếp từ Tầng 1.
Bên trong Tầng 2, từng thành phần lại áp dụng mô hình Model-View-Controller cục bộ: Controller tiếp nhận yêu cầu, Model xử lý dữ liệu và nghiệp vụ, kết quả trả về Tầng 1 để hiển thị.
Cách các Thành phần Kết nối

Hình 1.1 — Sơ đồ kết nối các thành phần SpendSense AI
Kết nối nội bộ giữa các thành phần trong Tầng 2
Các thành phần Data Ingestion, Cash Flow Engine, Investment Advisor và Reporting giao tiếp với nhau qua internal function call trên cùng một máy chủ hoặc qua LAN nếu triển khai phân tán. Đây là kết nối nhanh nhất, không qua mạng internet, đảm bảo độ trễ thấp. Cụ thể:
Data Ingestion hoàn thành chuẩn hóa => gọi trực tiếp Cash Flow Engine để cập nhật số dư.
Cash Flow Engine tính xong tiền nhàn rỗi => gọi Investment Advisor để xử lý gợi ý đầu tư.
AlertEngine trong Cash Flow Engine phát hiện vượt ngưỡng => gọi Reporting & Notification để gửi cảnh báo.
Kết nối ra bên ngoài qua HTTPS
Các thành phần trong Tầng 2 kết nối với dịch vụ bên ngoài qua giao thức HTTPS (REST API):
Investment Advisor => Gemini LLM API: Gửi prompt phân tích thị trường, nhận về văn bản phân tích có cấu trúc.
Investment Advisor => Market Data API: Lấy dữ liệu thời gian thực về cổ phiếu, vàng, crypto, lãi suất ngân hàng.
Reporting & Notification => Gemini 2.5 Flash API: Gửi dữ liệu thống kê, nhận về nhận xét ngôn ngữ tự nhiên.
Kết nối giữa Tầng 1 và Tầng 2
Giao diện người dùng (Mobile/Web) giao tiếp với backend qua HTTPS/REST API. Riêng tính năng thông báo sử dụng Push Notification (Firebase Cloud Messaging hoặc APNs) để đẩy cảnh báo về thiết bị ngay lập tức mà không cần người dùng mở ứng dụng.
Các tác vụ nặng như OCR và gọi LLM được xử lý bất đồng bộ (Async) - tức là giao diện không bị treo chờ, người dùng vẫn dùng được ứng dụng trong khi hệ thống xử lý ngầm ở Tầng 2.

Component: Dashboard (Frontend UI) 
Component: CV & OCR Module (Data Ingestion) 
Component: LLM Processing & ReAct Agent (AI Insight) 
Component: Semantic Router & Caching Module 
Component: Goal Tracking & Report Engine (Cash Flow & Reporting) 
Component: Task Queue (RabbitMQ / Celery) 
Component: Backend API 
Component: Relational Database (PostgreSQL) 
Component: Vector Database (ChromaDB) 
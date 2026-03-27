# KẾ HOẠCH PHÂN CÔNG NHIỆM VỤ (WBS) - NHÓM 4 THÀNH VIÊN
**Dự án:** Hệ thống Đăng ký Học phần & Quản lý Điểm (Node.js RESTful + React + MongoDB)
**Yêu cầu cốt lõi:**
- **Backend (BE):** Hoàn toàn RESTful (MVC=0), tuân thủ cấu trúc folder phân lớp, Node.js + MongoDB.
- **Frontend (FE):** Dùng React hiển thị dữ liệu từ BE (30% số điểm, bắt buộc có đóng góp để không bị trừ 5đ/người).
- **Yêu cầu chung:** CRUD, Authen/Author, Upload file. Báo cáo (Docs + Hình ảnh Postman).

---

## 👨‍💻 THÀNH VIÊN 1: TRƯỞNG NHÓM (HẠ TẦNG & QUẢN LÝ NGƯỜI DÙNG)
**Nhiệm vụ:** Xây dựng khung Frontend gốc, làm Backend xác thực, JWT & Phân quyền.

### 1. Backend (Controllers & Routes `auth`, `users`, `roles`)
- Xây dựng API Đăng ký (`POST /api/auth/register`) và Đăng nhập (`POST /api/auth/login`).
- Setup Middleware kiểm tra JWT (`authMiddleware.js`) và phân quyền Admin/Sinh Viên/Giảng viên (`roleMiddleware.js`).
- Khởi tạo 06 Models: `User`, `Role`, `Permission`, `RolePermission`, `StudentProfile`, `TeacherProfile`.
- Cấu hình thư mục cấu trúc BE (Routing global, xử lý lỗi Error Handler chung).
- API Thay đổi mật khẩu, Cập nhật thông tin Profile (Sinh viên / Giảng viên).

### 2. Frontend React (Core Layout & Auth)
- Khởi tạo thư mục `client` với Vite + React (Đã hoàn thành qua dòng lệnh `npm create vite`).
- Thiết lập React Router, Axios interceptor để tự động gắn Token JWT vào header mỗi khi gọi API.
- Code 2 giao diện cốt lõi: **Đăng nhập** và **Đăng ký**.
- Layout (Header, Sidebar) dành riêng cho người dùng sau khi đăng nhập thành công.

### 3. Tài liệu & Postman
- Tạo file Postman Collection tổng hợp, cấu hình `{{baseURL}}` và tự động gắn biến `{{token}}` khi login.
- Test và lưu kết quả (Screenshot) nhóm API Xác thực.

---

## 👨‍💻 THÀNH VIÊN 2: DEVELOPER GIÁO VỤ (QUẢN LÝ ĐÀO TẠO)
**Nhiệm vụ:** Xử lý nghiệp vụ Môn học, Lớp học phần và Đăng ký học (Enrollment).

### 1. Backend (Controllers & Routes `courses`, `sections`, `enrollments`)
- Khởi tạo & thao tác 03 Models: `Course`, `CourseSection`, `Enrollment`.
- CRUD API Quản lý Môn học (`GET/POST/PUT/DELETE /api/courses`).
- CRUD API Các lớp học phần mở trong kỳ (`GET/POST/PUT/DELETE /api/sections`).
- Logic sinh viên đăng ký học / hủy học phần (`POST /api/enrollments`, `DELETE /api/enrollments/:id`).
- Ràng buộc nghiệp vụ: Báo lỗi 400 nếu lớp đã đầy sĩ số (capacity full) khi đăng ký.

### 2. Frontend React (Course Module)
- Component **Danh sách môn học**: Gọi API lấy dữ liệu và hiển thị bảng.
- Component **Chức năng Đăng ký học**: Nút "Đăng ký". Cảnh báo thành công (Toast) hoặc báo lỗi nếu lớp đầy sĩ số.
- Màn hình dành cho Giảng vụ (Admin): Thêm mới 1 Môn học / Lớp học phần.

### 3. Tài liệu & Postman
- Chạy Postman các API `/courses`, `/sections` bằng cả quyền Admin và Sinh Viên (để thấy quyền Admin thì được POST, SV thì bị 403 Forbidden).
- Chụp ảnh minh chứng vào Báo cáo.

---

## 👨‍💻 THÀNH VIÊN 3: DEVELOPER HỌC VỤ (BÀI TẬP & ĐIỂM)
**Nhiệm vụ:** Xử lý việc giao bài tập trên hệ thống, nộp bài, cho điểm sinh viên.

### 1. Backend (Controllers & Routes `assignments`, `submissions`, `grades`)
- Khởi tạo & thao tác Models: `Assignment`, `Submission`, `Grade`, `Document`.
- API Giảng viên tạo Bài tập (`POST /api/assignments`) cho một Course Section.
- API Sinh viên nộp bài làm (`POST /api/assignments/:id/submit`).
- API Giảng viên vào chấm điểm bài của SV (`PATCH /api/submissions/:id/grade`).
- Ràng buộc nghiệp vụ: Sinh viên chỉ nộp được khi hạn nộp bài (dueDate) chưa kết thúc.

### 2. Frontend React (Học liệu Module)
- Component **Lớp Học Của Tôi**: Khi click vào 1 Lớp đã học, hiển thị danh sách Bài tập được giao.
- Form Upload file bài nộp (Gắn kèm File). 
- Bảng hiển thị kết quả Điểm của sinh viên.
- Màn hình Giảng viên: Danh sách bài tập do mình tạo, click vào sẽ hiện danh sách sinh viên nộp bài kèm ô nhập "Điểm".

### 3. Tài liệu & Postman
- Chạy Postman luồng API tạo Bài tập -> Nộp Bài -> Chấm điểm. Lấy hình minh chứng (200 OK).

---

## 👨‍💻 THÀNH VIÊN 4: DEVELOPER UPLOAD FILE & BÁO CÁO VIÊN
**Nhiệm vụ:** Cấu hình upload đa nền tảng, tinh chỉnh giao diện, test tích hợp bảo mật và ráp Báo cáo.

### 1. Backend (Upload & Tiện ích chung)
- Cấu hình thư viện `Multer` để xử lý việc upload file (ảnh Avatar cho `User`, file PDF/DOCX học liệu).
- API `POST /api/upload`: Trả về link file đã lưu để nhúng vào Database.
- Model & API `Notification`: Tạo hệ thống thông báo ngắn gọn cho User khi có điểm mới.

### 2. Frontend React (Trang chủ & Làm mịn giao diện)
- Chịu trách nhiệm xử lý làm đẹp giao diện Web (CSS/Tailwind, Responsive).
- Trang Dashboard mặc định: Đếm tổng số Môn học, tổng học sinh (Lấy từ BE về). Hiển thị Thông báo cá nhân.
- Code Component thông báo (Alert success/error/loading) khi các bạn khác gọi API BE.

### 3. Báo cáo Tích hợp - Nhiệm vụ chính
- Chịu trách nhiệm viết File Word Báo Cáo theo form giáo viên yêu cầu (Tuyệt đối không có slide).
- Phối hợp các nhánh tính năng của bạn bè trên GitHub (Merge Code). Giải quyết conflict nếu có.
- Ghi chú Lịch sử commit vào Docs nộp kèm bài.

---

## 🔥 QUY TRÌNH THỰC HIỆN TRÊN GITHUB:
1. Leader sẽ push thư mục BE có sẵn và FE (Vite React mới tạo) lên nhánh `main`.
2. Các thành viên `git clone` về máy.
3. Chạy `npm install` tại thư mục chứa api backend, và `cd client && npm install` cho frontend gốc.
4. Mỗi thành viên tách nhánh theo tên: `git checkout -b feature/minh-auth`, `git checkout -b feature/tuan-courses`,...
5. Làm đến đâu, push lên nhánh cá nhân đó. Cuối tuần Leader sẽ merged vào `main` và phân chia tiến độ tiếp.

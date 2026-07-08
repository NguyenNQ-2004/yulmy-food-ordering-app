# Yulmy - Mobile Food Ordering App

Dự án phát triển ứng dụng đặt đồ ăn trực tuyến (Mobile Food Ordering App) sử dụng React Native Expo và Node.js Express.

## 🚀 Công nghệ sử dụng
- **Frontend**: React Native Expo, JavaScript (Nằm trong thư mục [frontend/mobile-app](file:///c:/Users/nguye/Desktop/yulmy-food-ordering-app/frontend/mobile-app))
- **Backend**: Node.js Express (Nằm trong thư mục [backend](file:///c:/Users/nguye/Desktop/yulmy-food-ordering-app/backend))
- **Database**: MongoDB Local (`mongodb://127.0.0.1:27017/yulmy_db`)

---

## 🛠️ Hướng dẫn cài đặt & Khởi chạy

### 1. Chuẩn bị cơ sở dữ liệu (MongoDB)
- Đảm bảo MongoDB Local đang hoạt động tại địa chỉ: `mongodb://127.0.0.1:27017/yulmy_db`

### 2. Chạy Backend (Port: 5000)
Di chuyển vào thư mục [backend](file:///c:/Users/nguye/Desktop/yulmy-food-ordering-app/backend), cài đặt thư viện và khởi chạy:
```bash
cd backend
npm install
# Khởi tạo dữ liệu mẫu (chỉ cần chạy lần đầu hoặc khi muốn reset database)
npm run seed
# Chạy server ở chế độ development
npm run dev
```

### 3. Chạy Frontend
Di chuyển vào thư mục [frontend/mobile-app](file:///c:/Users/nguye/Desktop/yulmy-food-ordering-app/frontend/mobile-app) và khởi chạy Expo:
```bash
cd frontend/mobile-app
npm install
npm run start
# Nhấn 'w' để chạy phiên bản Web, hoặc quét mã QR bằng ứng dụng Expo Go trên điện thoại để test Mobile
```

---

## 🔑 Tài khoản Demo
Sau khi chạy lệnh `npm run seed` ở backend, bạn có thể dùng các tài khoản sau để đăng nhập kiểm thử:
- **Khách hàng (Customer)**: `user@gmail.com` / Mật khẩu: `123456` (Vào Home Screen)
- **Quản trị viên (Admin)**: `admin@gmail.com` / Mật khẩu: `123456` (Vào Admin Dashboard)

---

## 🌿 Quy tắc tạo nhánh Git
Dự án áp dụng quy trình Git Flow cơ bản. Khi bắt đầu phát triển tính năng mới, hãy tạo nhánh từ `develop` theo cấu trúc:
- Nhánh chính thức (Production): `main`
- Nhánh phát triển chung: `develop`
- Nhánh tính năng cá nhân: `feature/<tên-thành-viên>-<tên-tính-năng>`

---

## 👥 Phân công thành viên & Nhánh Git cá nhân
- **Nguyễn** (`feature/nguyen-core-customer`): Phát triển chức năng cốt lõi cho khách hàng (Danh sách nhà hàng, Chi tiết món ăn, Giỏ hàng, Thanh toán).
- **Duy** (`feature/duy-order-payment`): Xử lý các nghiệp vụ Đặt hàng & Cổng thanh toán (Order & Payment).
- **Ngọc** (`feature/ngoc-admin-crud`): Xử lý phần quản trị hệ thống (CRUD nhà hàng, món ăn, Quản lý đơn hàng).
- **Mạnh** (`feature/manh-engagement-deploy`): Xây dựng tính năng tương tác (Voucher, Đánh giá, Thông báo) và triển khai ứng dụng (Deploy).
- **Sơn** (`feature/son-profile-tracking`): Quản lý hồ sơ cá nhân và theo dõi trạng thái đơn hàng thời gian thực (Profile & Order Tracking).
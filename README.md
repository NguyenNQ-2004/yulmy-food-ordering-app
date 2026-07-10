# Yulmy - Mobile Food Ordering App

## 1. Giới thiệu project

Yulmy là ứng dụng đặt đồ ăn trên thiết bị di động, bao gồm 3 phân hệ người dùng (roles) chính:

- **Customer**: Người dùng đặt đồ ăn.
- **Restaurant Owner**: Chủ nhà hàng (quản lý quán của mình, đăng món, sửa món, xem và cập nhật trạng thái đơn hàng).
- **Admin**: Quản trị hệ thống (quản lý user, restaurant, food, order, review và thống kê tổng).

## 2. Công nghệ sử dụng

- **Frontend**: React Native Expo, JavaScript
- **Backend**: Node.js, Express
- **Database**: MongoDB (Local)

## 3. Cấu trúc thư mục

- `frontend/mobile-app/`: Chứa mã nguồn ứng dụng Mobile.
- `backend/`: Chứa mã nguồn server API.

## 4. Cách chạy Backend

Database local sử dụng URI: `mongodb://127.0.0.1:27017/yulmy_db`. Server chạy tại port **5000**.

**Các bước khởi chạy:**

1. Mở terminal, di chuyển vào thư mục backend: `cd backend`
2. Cài đặt thư viện: `npm install`
3. Chạy lệnh tạo dữ liệu mẫu (nếu database trống): `npm run seed`
4. Khởi động server (chế độ dev): `npm run dev`

*(Lưu ý: Backend hiện đã có API auth: register, login, get profile).*

## 5. Cách chạy Frontend

1. Mở một terminal mới, di chuyển vào thư mục app: `cd frontend/mobile-app`
2. Cài đặt thư viện: `npm install`
3. Khởi động Expo: `npm start`
4. Mở ứng dụng bằng máy ảo (Android/iOS) hoặc quét mã QR bằng app Expo Go trên điện thoại thật.
   *(Lưu ý: Nếu dùng máy ảo Android và bị lỗi kết nối mạng, hãy đổi `localhost` thành `10.0.2.2` trong file cấu hình gọi API).*

## 6. Tài khoản Demo

*(Dùng để test tính năng sau khi đã chạy `npm run seed`)*

- **Customer**: `user@gmail.com` / `123456`
- **Restaurant Owner**: `owner@gmail.com` / `123456`
- **Admin**: `admin@gmail.com` / `123456`

## 7. Quy tắc Git Branch

Các branch trên repository được phân chia cụ thể cho từng người:

- `main`: Bản ổn định dùng để demo và nộp bài.
- `develop`: Nhánh tổng hợp code để test chung.
- `feature/nguyen-core-customer`: Nhánh của Nguyên (Auth, customer home, restaurant list/detail, food detail).
- `feature/duy-order-payment`: Nhánh của Duy (Cart, checkout, payment, order API).
- `feature/ngoc-admin-system`: Nhánh của Ngọc (Admin dashboard, user/restaurant/food/order management, statistics).
- `feature/manh-owner-chat-deploy-ai`: Nhánh của Mạnh (Restaurant owner flow, chat, Git, deploy, AI optional).
- `feature/son-profile-tracking-review`: Nhánh của Sơn (Profile, order history, tracking, review, settings).

**Quy trình code:** Checkout sang nhánh `feature` của cá nhân -> Code -> Commit -> Push -> Nhờ Mạnh hỗ trợ Merge vào `develop`. Tuyệt đối không code đè trực tiếp lên `main` hay `develop`.

## 8. Phân công thành viên

- **Nguyên (Leader)**: Auth, role navigation, customer core flow, database overview, README, viva.
- **Duy**: Order, cart, checkout, payment mock, backend order API.
- **Ngọc**: Admin system management.
- **Mạnh**: Restaurant owner flow, chat, Git branch, merge code, deploy, AI optional.
- **Sơn**: Profile, order tracking, review, settings.

## 9. Ghi chú cho thành viên trước khi code

- Clone code về hãy nhớ chạy `npm install` ở cả hai thư mục `backend` và `frontend/mobile-app`.
- Hãy chắc chắn MongoDB local đang bật và kết nối đúng vào `127.0.0.1:27017`.
- Làm đúng task ở nhánh feature của mình, tránh sửa file của người khác (để hạn chế conflict).
- Có lỗi hay cần pull/merge code, hãy nhắn lên nhóm để được hỗ trợ kịp thời.

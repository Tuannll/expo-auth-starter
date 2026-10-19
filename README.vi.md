<div align="center">

# 🔐 Expo Auth Starter

**Mã nguồn khởi tạo xác thực Full-Stack phục vụ học tập và phát triển với Expo, Express và PostgreSQL.**

[![Expo](https://img.shields.io/badge/Expo-SDK%2054-000020?logo=expo&logoColor=white)](mobile/package.json)
[![React Native](https://img.shields.io/badge/React_Native-0.81.5-61DAFB?logo=react&logoColor=black)](mobile/package.json)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white)](server/package.json)
[![Express](https://img.shields.io/badge/Express-5-000000?logo=express&logoColor=white)](server/package.json)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-17-4169E1?logo=postgresql&logoColor=white)](compose.yaml)
[![License: MIT](https://img.shields.io/badge/License-MIT-22C55E)](LICENSE)

[English](README.md) | **Tiếng Việt**

**[🚀 Quick Start](#quick-start) • [✨ Tính năng](#features) • [📦 API](#api) • [🛠️ Chi tiết Kỹ thuật](#technical-details) • [❓ FAQ](#faq) • [⚠️ Bảo mật](#security)**

</div>

> [!IMPORTANT]
> Repository này là template phục vụ môi trường phát triển cục bộ (local development), chưa tối ưu sẵn sàng cho môi trường sản xuất (production). Client mobile sử dụng Expo SecureStore; xác thực trên nền tảng trình duyệt (Web) chưa được hiện thực.

---

<a id="features"></a>
## ✨ Tính năng

| Phân hệ | Chi tiết triển khai |
| --- | --- |
| **Luồng tài khoản** | Đăng ký, đăng nhập bằng email/mật khẩu, màn hình chính bảo vệ, đăng xuất |
| **Biểu mẫu** | React Hook Form kèm input tái sử dụng, xác nhận mật khẩu, phản hồi submit rõ ràng |
| **Điều hướng** | Expo Router bảo vệ route riêng tư, màn hình loading phục hồi phiên đăng nhập |
| **Trạng thái client** | Zustand quản lý thông tin user và lưu access token tạm thời trong bộ nhớ (in-memory) |
| **Lưu trữ token** | Native SecureStore lưu trữ refresh token bền vững, an toàn trên thiết bị |
| **Xác thực backend** | Mã hóa mật khẩu bcrypt, JWT access token, cơ chế xoay vòng refresh token (rotating) |
| **Cơ sở dữ liệu** | Schema Prisma và migration khởi tạo cho bảng user và refresh session |
| **Middleware API** | Xác thực request bằng Zod, bảo mật Helmet, cấu hình CORS linh hoạt, rate limiting |
| **Hạ tầng local** | Docker Compose chạy PostgreSQL kèm cơ chế health check và persistent volume |
| **Kiểm thử** | Vitest kiểm thử API qua in-memory repository, kèm test helper API cho mobile |

---

<a id="quick-start"></a>
## 🚀 Quick Start

### Yêu cầu tiên quyết

- **Node.js 22+** và npm
- **Docker Desktop** (chế độ Linux containers)
- Android Studio emulator, iOS simulator trên macOS, hoặc thiết bị thật cài sẵn Expo Go

> [!NOTE]
> API và cơ sở dữ liệu chạy trực tiếp trên máy tính phát triển. Ứng dụng Expo chạy trên máy ảo hoặc thiết bị di động. Cài app mobile không tự động cài đặt backend.

### 1. Clone repository

```bash
git clone https://github.com/Tuannll/expo-auth-starter.git
cd expo-auth-starter
```

### 2. Thiết lập cấu hình biến môi trường

macOS / Linux / Git Bash:

```bash
cp .env.example .env
cp server/.env.example server/.env
cp mobile/.env.example mobile/.env
```

PowerShell:

```powershell
Copy-Item .env.example .env
Copy-Item server/.env.example server/.env
Copy-Item mobile/.env.example mobile/.env
```

Sinh 2 chuỗi JWT secret độc lập ngẫu nhiên:

```bash
node -e "const { randomBytes } = require('node:crypto'); console.log(randomBytes(48).toString('hex')); console.log(randomBytes(48).toString('hex'))"
```

Dán giá trị đầu tiên vào `JWT_ACCESS_SECRET` và giá trị thứ hai vào `JWT_REFRESH_SECRET` trong file `server/.env`. Tuyệt đối không commit các giá trị này lên Git.

| File | Cấu hình |
| --- | --- |
| `.env` | Tên người dùng, mật khẩu, tên database PostgreSQL và cổng host |
| `server/.env` | Chuỗi `DATABASE_URL` tương ứng, JWT secrets, cổng API, danh sách web origin hợp lệ |
| `mobile/.env` | `EXPO_PUBLIC_API_URL` trỏ tới địa chỉ API mà máy ảo hoặc thiết bị truy cập được |

Nếu thay đổi thông tin PostgreSQL hoặc cổng kết nối, cập nhật `server/.env` tương ứng. Mã hóa URL (URL-encode) các ký tự đặc biệt trong mật khẩu database khi tạo `DATABASE_URL`.

### 3. Cài đặt dependencies và khởi tạo PostgreSQL

Chạy từ thư mục gốc repository:

```bash
npm install
npm run db:generate --workspace=server
docker compose up -d --wait postgres
npm run db:migrate
```

Root package sử dụng npm workspaces để đồng thời cài đặt cả `mobile/` và `server/`. Prisma sinh database client; lệnh migrate áp dụng các bảng vào database.

> [!TIP]
> Khởi động Docker Desktop trước khi chạy Compose. Dữ liệu PostgreSQL được lưu trữ bền vững qua các lần khởi động lại trong named volume `postgres-data`.

### 4. Khởi chạy API và Mobile Client

Terminal 1 (tại thư mục gốc):

```bash
npm run dev:server
```

Terminal 2 (tại thư mục gốc):

```bash
npm run dev:mobile
```

Sử dụng Expo CLI để mở máy ảo hoặc quét mã QR kết nối qua Expo Go. Đăng ký tài khoản mới, kiểm tra màn hình chính đã xác thực, sau đó đăng xuất.

### 5. Cấu hình đúng địa chỉ API cho thiết bị

Chỉnh sửa file `mobile/.env` theo môi trường thử nghiệm:

| Môi trường đích | `EXPO_PUBLIC_API_URL` |
| --- | --- |
| Android Studio Emulator | `http://10.0.2.2:3000` |
| iOS Simulator | `http://localhost:3000` |
| Thiết bị di động thật | `http://YOUR_COMPUTER_LAN_IP:3000` |

Đối với thiết bị thật, kết nối cùng mạng Wi-Fi cục bộ (LAN) với máy tính và mở cổng firewall cho port API. Khởi động lại Expo server sau mỗi lần sửa đổi biến môi trường.

> [!WARNING]
> Các ví dụ HTTP chỉ phục vụ môi trường phát triển cục bộ an toàn. Cần sử dụng HTTPS trước khi truyền thông tin đăng nhập qua mạng công cộng. Các biến có tiền tố `EXPO_PUBLIC_` được nhúng thẳng vào bundle client; tuyệt đối không đặt secret nhạy cảm của server vào đây.

---

<a id="api"></a>
## 📦 API & Sử dụng

API lắng nghe mặc định tại cổng `3000`. Toàn bộ body của request và response đều dùng định dạng JSON (ngoại trừ response đăng xuất thành công).

| Phương thức | Endpoint | Body Request | Phản hồi Thành công |
| --- | --- | --- | --- |
| `POST` | `/auth/register` | `{ email, password }` | `201` — thông tin user và cặp token |
| `POST` | `/auth/login` | `{ email, password }` | `200` — thông tin user và cặp token |
| `POST` | `/auth/refresh` | `{ refreshToken }` | `200` — thông tin user và cặp token mới |
| `POST` | `/auth/logout` | `{ refreshToken }` | `204` — không có body |
| `GET` | `/auth/me` | Header `Authorization: Bearer <accessToken>` | `200` — thông tin user |

### Đăng ký và Đăng nhập

Email tự động được chuẩn hóa cắt khoảng trắng và chuyển chữ thường. Mật khẩu yêu cầu độ dài từ **12 đến 128 ký tự**.

```json
{
  "email": "person@example.com",
  "password": "correct-horse-battery-staple"
}
```

Xác thực thành công trả về:

```json
{
  "user": {
    "id": "<user-id>",
    "email": "person@example.com"
  },
  "tokens": {
    "accessToken": "<access-token>",
    "refreshToken": "<refresh-token>"
  }
}
```

### Refresh Token và Đăng xuất

```json
{
  "refreshToken": "<refresh-token>"
}
```

Sau khi refresh, lưu lại refresh token thay thế. Token cũ lập tức bị vô hiệu hóa, không thể tái sử dụng.

Định dạng lỗi: `{ "error": "..." }`: mã `400` dữ liệu không hợp lệ, `401` xác thực thất bại, `409` email đã tồn tại, `500` lỗi máy chủ nội bộ. Rate limiter trả về mã `429`.

---

<a id="faq"></a>
## ❓ FAQ

<details>
<summary><b>1. Tại sao app mobile không kết nối được tới API?</b></summary>
<br/>

`localhost` trên thiết bị di động trỏ về chính thiết bị đó, không phải máy tính chạy backend. Kiểm tra lại `EXPO_PUBLIC_API_URL`, tiến trình server API, kết nối mạng LAN và tường lửa. Chế độ tunnel của Expo không tự động mở port cho server Express.
</details>

<details>
<summary><b>2. Xác thực có hoạt động trên nền tảng Web không?</b></summary>
<br/>

Hiện tại chưa hỗ trợ. Package có lệnh web nhưng store xác thực gọi trực tiếp native SecureStore và chưa tích hợp adapter lưu trữ cho browser. Sử dụng Android hoặc iOS để trải nghiệm luồng xác thực. Bản web cần thiết kế cơ chế lưu session và bảo mật riêng.
</details>

<details>
<summary><b>3. Ứng dụng có duy trì trạng thái đăng nhập sau khi tắt mở lại không?</b></summary>
<br/>

Có. Ứng dụng đọc refresh token đã lưu trong SecureStore và yêu cầu phiên đăng nhập mới khi khởi động. API bắt buộc phải kết nối được. Code phục hồi hiện tại sẽ xóa token đã lưu nếu gặp bất kỳ lỗi phục hồi nào, kể cả lỗi mất mạng.
</details>

<details>
<summary><b>4. Đăng xuất có lập tức vô hiệu hóa mọi access token không?</b></summary>
<br/>

Không. Đăng xuất sẽ hủy phiên refresh token đã gửi và xóa trạng thái xác thực cục bộ. Access token đã phát hành vẫn có hiệu lực cho đến khi hết hạn (mặc định 15 phút). Refresh token có hạn mặc định 7 ngày.
</details>

<details>
<summary><b>5. Bộ kiểm thử tự động kiểm tra những gì?</b></summary>
<br/>

Test phía server kiểm tra các hàm xử lý token và luồng HTTP auth qua in-memory repository. Test phía mobile kiểm tra các hàm helper refresh/retry. Bộ test không kiểm tra trực tiếp transaction PostgreSQL thật, cơ chế SecureStore trên thiết bị vật lý hay luồng UI native hoàn chỉnh.
</details>

<details>
<summary><b>6. Có thể deploy dự án này lên production ngay được không?</b></summary>
<br/>

Chưa nên. Đây là template nền tảng để bắt đầu. Hãy rà soát cảnh báo dependencies, vòng đời token, xử lý lỗi database và cấu hình triển khai thực tế trước khi dùng cho tài khoản người dùng thật. Xem thêm [Bảo mật & Giới hạn](#security).
</details>

---

<a id="technical-details"></a>
## 🛠️ Chi tiết Kỹ thuật

### Tech Stack

| Tầng | Công nghệ |
| --- | --- |
| Client native | Expo SDK 54, React Native 0.81.5, React 19.1 |
| Điều hướng & Biểu mẫu | Expo Router 6, React Hook Form 7 |
| Quản lý State & Lưu trữ | Zustand 5, Expo SecureStore |
| API Backend | Express 5, TypeScript 5.9, Zod 4 |
| Cơ chế xác thực | bcrypt 6, JSON Web Tokens (JWT) |
| Cơ sở dữ liệu | PostgreSQL 17, Prisma 6 |
| Kiểm thử | Vitest 3, Supertest 7 |

### Cấu trúc dự án

```text
expo-auth-starter/
├── mobile/
│   ├── app/                  # Các màn hình xác thực và màn hình bảo vệ
│   ├── components/ui/        # Component form field dùng chung
│   ├── services/             # Helper gọi HTTP và bộ test
│   ├── store/                # Zustand store lưu authentication state
│   └── .env.example          # Địa chỉ API public
├── server/
│   ├── prisma/               # Prisma schema và database migrations
│   ├── src/                  # Ứng dụng Express, auth service, xử lý token
│   ├── test/                 # Test suite HTTP và token
│   └── .env.example          # Cấu hình database và JWT secret
├── compose.yaml              # Docker Compose chạy PostgreSQL local
├── .env.example              # Biến môi trường cho Docker Compose
├── package.json              # Script quản lý npm workspace
└── LICENSE
```

### Danh sách Scripts

Chạy từ thư mục gốc repository:

| Lệnh | Mục đích |
| --- | --- |
| `npm run dev:server` | Khởi chạy server API kèm tính năng tự động reload |
| `npm run dev:mobile` | Khởi chạy Expo CLI Metro bundler |
| `npm run db:generate --workspace=server` | Sinh Prisma client |
| `npm run db:migrate` | Áp dụng database migration trong môi trường dev |
| `npm run lint` | Chạy mobile ESLint và kiểm tra server TypeScript |
| `npm test` | Chạy toàn bộ test suite của mobile và server |

Script `lint` phía server thực thi kiểm tra kiểu TypeScript. Tests sử dụng in-memory repository nên không bắt buộc phải bật container PostgreSQL.

---

<a id="contributing"></a>
## 🤝 Đóng góp

1. Fork repository và tạo nhánh tính năng riêng.
2. Giữ các thay đổi nhỏ, súc tích và bổ sung regression test tương ứng.
3. Chạy `npm run lint` và `npm test` từ thư mục gốc.
4. Mô tả chi tiết thay đổi và bằng chứng kiểm thử trong Pull Request.

Tuyệt đối không commit credential, token, dump database hay các thư mục build sinh tự động.

---

<a id="security"></a>
## ⚠️ Bảo mật & Giới hạn

Mã nguồn starter này đã tích hợp băm mật khẩu, băm refresh token, thời hạn JWT, xác thực request, security headers và cấu hình CORS. Tuy nhiên chưa đủ để trực tiếp đưa vào môi trường production.

Trước khi xử lý tài khoản thật:

- Bắt buộc dùng HTTPS, JWT secret sinh ngẫu nhiên độc lập và hệ thống quản lý secret tập trung.
- Kiểm tra các khuyến cáo bảo mật thư viện (dependency advisories) và cập nhật định kỳ.
- Bổ sung xác thực email, luồng quên mật khẩu, hệ thống logging/monitoring và sao lưu tự động database.
- Lưu ý giới hạn **72-byte input của bcrypt**; độ dài ký tự hiện tại chưa bắt buộc giới hạn số byte.
- Thực hiện việc thu hồi refresh token cũ và cấp token mới theo dạng atomic transaction (hiện đang là 2 thao tác rời nhau).
- Kiểm thử kỹ các trường hợp đăng ký đồng thời, xoay vòng refresh token, lỗi sập database và phục hồi session trên hạ tầng thật.
- Điều chỉnh rate limit phù hợp hạ tầng thực tế. Limiter in-memory hiện tại giới hạn 20 request/IP mỗi 15 phút trên toàn bộ route `/auth`.
- Thiết kế kiến trúc session an toàn riêng cho web trước khi kích hoạt xác thực trên trình duyệt.

Các file môi trường và thư mục dependencies đã được loại trừ qua `.gitignore`. Database lưu trữ qua Docker named volume; `.gitignore` không thay thế được hệ thống backup hay vault quản lý secret.

---

<a id="license"></a>
## 📄 Giấy phép

Phát hành dưới giấy phép [MIT License](LICENSE).

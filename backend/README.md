
# Expense Tracker Backend

## Thiết lập dự án

1. Cài đặt Node.js và npm
2. Cài đặt MongoDB
3. Cài đặt các phụ thuộc:

```bash
npm install
```

## Cấu hình môi trường

Tạo file `.env` với các thông số sau:

```
PORT=3000
MONGODB_URI=mongodb://localhost:27017/expense-tracker
FRONTEND_URL=http://localhost:8080
```

## Chạy dự án

Chạy ở môi trường phát triển:

```bash
npm run dev
```

Chạy ở môi trường sản xuất:

```bash
npm start
```

## API Routes

- `GET /api/incomes`: Lấy tất cả thu nhập
- `POST /api/incomes`: Tạo thu nhập mới
- `PUT /api/incomes/:id`: Cập nhật thu nhập
- `DELETE /api/incomes/:id`: Xóa thu nhập

- `GET /api/expenses`: Lấy tất cả chi tiêu
- `POST /api/expenses`: Tạo chi tiêu mới
- `PUT /api/expenses/:id`: Cập nhật chi tiêu
- `DELETE /api/expenses/:id`: Xóa chi tiêu

- `GET /api/debts`: Lấy tất cả nợ
- `POST /api/debts`: Tạo nợ mới
- `PUT /api/debts/:id`: Cập nhật nợ
- `DELETE /api/debts/:id`: Xóa nợ

- `GET /api/summary`: Lấy tổng quan tháng

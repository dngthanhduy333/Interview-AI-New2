# 🎤 Hướng Dẫn Setup Microphone trên Localhost

## Vấn đề với Live Server

Khi sử dụng Live Server (localhost), nhiều trình duyệt yêu cầu **HTTPS** hoặc **localhost đặc biệt** để truy cập microphone. Đây là lý do tại sao bạn gặp lỗi "Requested device not found".

## 🔧 Giải pháp

### Phương pháp 1: Sử dụng HTTPS Server (Khuyến nghị)

#### Bước 1: Cài đặt dependencies
```bash
npm install
```

#### Bước 2: Setup SSL certificates
```bash
npm run setup
```

#### Bước 3: Chạy server HTTPS
```bash
npm start
```

#### Bước 4: Truy cập ứng dụng
Mở trình duyệt và truy cập: `https://localhost:5557`

### Phương pháp 2: Sử dụng Live Server với localhost đặc biệt

#### Bước 1: Chạy Live Server
```bash
npm run dev
```

#### Bước 2: Truy cập qua localhost đặc biệt
Thay vì `http://127.0.0.1:5555`, hãy sử dụng:
- `http://localhost:5555`
- Hoặc `http://[::1]:5555`

### Phương pháp 3: Deploy lên hosting (Tốt nhất)

#### Deploy lên Vercel:
```bash
npm install -g vercel
vercel
```

#### Deploy lên Netlify:
1. Tạo tài khoản Netlify
2. Kéo thả thư mục dự án vào Netlify
3. Truy cập URL được cung cấp

#### Deploy lên GitHub Pages:
1. Push code lên GitHub
2. Vào Settings > Pages
3. Chọn source là main branch
4. Truy cập URL: `https://username.github.io/repository-name`

## 🧪 Test Microphone

### Trên HTTPS (localhost:5557):
1. Mở `https://localhost:5557`
2. Nhấn "Bắt đầu luyện tập"
3. Chọn loại phỏng vấn
4. Nhấn "Bắt đầu ghi âm"
5. Cho phép quyền microphone khi được hỏi

### Trên Live Server:
1. Mở `http://localhost:5555` (không phải 127.0.0.1)
2. Làm theo các bước tương tự
3. Nếu vẫn lỗi, hãy thử phương pháp HTTPS

## 🔍 Khắc phục sự cố

### Lỗi "Requested device not found":
- **Nguyên nhân**: Không có HTTPS hoặc localhost đặc biệt
- **Giải pháp**: Sử dụng HTTPS server hoặc deploy

### Lỗi "Permission denied":
- **Nguyên nhân**: Chưa cấp quyền microphone
- **Giải pháp**: Nhấp vào biểu tượng microphone trong thanh địa chỉ và chọn "Cho phép"

### Lỗi SSL certificate:
- **Nguyên nhân**: Certificate không được tin tưởng
- **Giải pháp**: 
  1. Nhấp "Advanced" trong trình duyệt
  2. Chọn "Proceed to localhost (unsafe)"
  3. Hoặc cài đặt mkcert: `npm run setup`

## 📱 Test trên điện thoại

### Để test trên điện thoại:
1. Tìm IP của máy tính: `ipconfig` (Windows) hoặc `ifconfig` (Mac/Linux)
2. Chạy server: `npm start`
3. Trên điện thoại, truy cập: `https://[IP_MÁY_TÍNH]:5557`
4. Ví dụ: `https://192.168.1.100:5557`

### Lưu ý:
- Điện thoại và máy tính phải cùng mạng WiFi
- Có thể cần tắt firewall tạm thời
- Trên điện thoại, microphone sẽ hoạt động tốt hơn

## 🚀 Deploy Production

### Vercel (Khuyến nghị):
```bash
npm install -g vercel
vercel --prod
```

### Netlify:
1. Tạo file `netlify.toml`:
```toml
[build]
  publish = "."
  command = "echo 'No build needed'"
```

2. Deploy qua Netlify UI

### GitHub Pages:
1. Tạo repository trên GitHub
2. Push code lên repository
3. Vào Settings > Pages
4. Chọn source là main branch

## ✅ Kết quả mong đợi

Sau khi setup đúng:
- ✅ Microphone hoạt động bình thường
- ✅ Có thể ghi âm và nhận feedback
- ✅ AI phân tích giọng nói thực tế
- ✅ Trải nghiệm luyện tập phỏng vấn hoàn chỉnh

## 🆘 Nếu vẫn gặp vấn đề

1. **Kiểm tra microphone**: Test trong ứng dụng khác
2. **Thử trình duyệt khác**: Chrome, Firefox, Edge
3. **Kiểm tra cài đặt âm thanh**: Đảm bảo microphone được chọn
4. **Deploy lên hosting**: Sử dụng Vercel hoặc Netlify để test

---

**Lưu ý**: Microphone là bắt buộc để có trải nghiệm luyện tập tốt nhất. Chế độ nhập text chỉ dành cho trường hợp bất khả kháng. 
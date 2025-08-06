# 🚀 Hướng Dẫn Nhanh - Test Microphone

## ✅ Live Server đang chạy!

### 🔗 Truy cập ứng dụng:
```
http://localhost:5555
```

### 🎤 Test Microphone:

#### Bước 1: Mở ứng dụng
- Mở trình duyệt
- Truy cập: `http://localhost:5555`
- **Lưu ý**: Sử dụng `localhost` thay vì `127.0.0.1`

#### Bước 2: Bắt đầu luyện tập
- Nhấn "Bắt đầu luyện tập"
- Chọn loại phỏng vấn (Job, Scholarship, Visa)
- Nhấn "Bắt đầu ghi âm"

#### Bước 3: Cấp quyền microphone
- Khi trình duyệt hỏi, chọn "Cho phép" hoặc "Allow"
- Nếu không thấy popup, nhấp vào biểu tượng microphone trong thanh địa chỉ

#### Bước 4: Test ghi âm
- Nhấn nút microphone để bắt đầu ghi âm
- Nói câu trả lời
- Nhấn dừng để kết thúc
- Xem feedback từ AI

## 🔍 Nếu microphone không hoạt động:

### Thử các URL khác:
```
http://localhost:5555
http://[::1]:5555
```

### Kiểm tra cài đặt:
1. **Trình duyệt**: Chrome, Firefox, Edge
2. **Microphone**: Kết nối và hoạt động
3. **Quyền**: Cho phép microphone trong trình duyệt

### Deploy lên hosting (Khuyến nghị):
```bash
npm install -g vercel
vercel
```

## 📱 Test trên điện thoại:

### Cách 1: Cùng mạng WiFi
1. Tìm IP máy tính: `ipconfig` (Windows)
2. Trên điện thoại: `http://[IP_MÁY_TÍNH]:5555`
3. Ví dụ: `http://192.168.1.100:5555`

### Cách 2: Deploy lên hosting
- Sử dụng Vercel, Netlify, hoặc GitHub Pages
- Tự động có HTTPS
- Microphone hoạt động tốt hơn

## ✅ Kết quả mong đợi:

- ✅ Microphone hoạt động
- ✅ Có thể ghi âm
- ✅ AI phân tích và đưa feedback
- ✅ Trải nghiệm luyện tập phỏng vấn hoàn chỉnh

## 🆘 Nếu vẫn gặp vấn đề:

1. **Deploy lên hosting**: Vercel, Netlify
2. **Thử trình duyệt khác**: Chrome, Firefox, Edge
3. **Kiểm tra microphone**: Test trong ứng dụng khác
4. **Xem chi tiết**: `MICROPHONE_SETUP.md`

---

**Lưu ý**: Microphone là bắt buộc để có trải nghiệm tốt nhất. Chế độ nhập text chỉ dành cho trường hợp bất khả kháng. 
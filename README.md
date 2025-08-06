# 🏢 Microsoft Interview Pro

Ứng dụng luyện phỏng vấn Microsoft với AI nhà tuyển dụng thực tế. Import CV của bạn để nhận câu hỏi phỏng vấn cá nhân hóa và feedback chi tiết.

## ✨ Tính năng chính

### 🎯 Phỏng vấn Microsoft chuyên biệt
- **Câu hỏi phỏng vấn Microsoft**: 15+ câu hỏi chuẩn Microsoft
- **AI nhà tuyển dụng Microsoft**: Feedback từ góc độ nhà tuyển dụng thực tế
- **Văn hóa Microsoft**: Hiểu rõ giá trị và văn hóa công ty

### 📄 Phân tích CV thông minh
- **Import CV**: Hỗ trợ PDF (bao gồm scan), hình ảnh, DOC, DOCX, TXT
- **OCR Processing**: Tự động nhận diện PDF scan và xử lý bằng Tesseract.js
- **AI phân tích**: Trích xuất thông tin từ CV
- **Câu hỏi cá nhân hóa**: Dựa trên kinh nghiệm và kỹ năng của bạn
- **Đánh giá phù hợp**: Gợi ý vị trí phù hợp tại Microsoft

### 🎤 Ghi âm và AI feedback
- **Ghi âm thực tế**: Sử dụng microphone để ghi âm câu trả lời
- **AI phân tích**: Đánh giá nội dung, phát âm, ngữ điệu
- **Feedback chi tiết**: Điểm số, điểm mạnh, cần cải thiện
- **Gợi ý cải thiện**: Hướng dẫn cụ thể để nâng cao kỹ năng

### 📚 Tài liệu hỗ trợ
- **Hướng dẫn CV Microsoft**: Cách viết CV phù hợp
- **Câu hỏi phỏng vấn**: Tổng hợp câu hỏi thường gặp
- **Văn hóa Microsoft**: Hiểu về giá trị và văn hóa công ty

### 👥 Phỏng vấn 1-1 (Tùy chọn)
- **Chuyên gia Microsoft**: Luyện tập với chuyên gia thực tế
- **Feedback cá nhân hóa**: Đánh giá chi tiết từ chuyên gia
- **Mô phỏng thực tế**: Trải nghiệm phỏng vấn thực tế

## 🛠 Công nghệ sử dụng

- **Frontend**: HTML5, CSS3, JavaScript ES6+
- **Styling**: Tailwind CSS
- **Icons**: Feather Icons
- **AI**: Azure OpenAI API
- **Audio**: Web Audio API
- **File Processing**: File API

## 🚀 Cách sử dụng

### 1. Setup và chạy ứng dụng

#### Phương pháp 1: HTTPS Server (Khuyến nghị cho microphone)
```bash
npm install
npm run setup
npm start
```
Truy cập: `https://localhost:5557`

#### Phương pháp 2: Live Server
```bash
npm run dev
```
Truy cập: `http://localhost:5555` (không phải 127.0.0.1)

#### Phương pháp 3: Deploy lên Vercel (Production)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to production
vercel --prod
```

**Hoặc sử dụng GitHub Integration:**
1. Push code lên GitHub
2. Connect repository với Vercel
3. Set environment variables trong Vercel dashboard
4. Auto-deploy on every push

Xem `DEPLOYMENT.md` để biết chi tiết về deploy.

**Lưu ý**: Microphone chỉ hoạt động trên HTTPS hoặc localhost đặc biệt. Xem `MICROPHONE_SETUP.md` để biết chi tiết.

### 2. Bắt đầu luyện tập

#### Bước 1: Import CV (Khuyến nghị)
- Nhấn "Import CV trước"
- Tải lên CV của bạn (PDF, DOC, DOCX, TXT)
- AI sẽ phân tích và tạo câu hỏi cá nhân hóa

#### Bước 2: Bắt đầu phỏng vấn
- Nhấn "Bắt đầu luyện tập"
- Chọn vị trí ứng tuyển (Software Engineer, Product Manager, etc.)
- Bắt đầu trả lời câu hỏi

#### Bước 3: Ghi âm và nhận feedback
- Nhấn "Bắt đầu ghi âm"
- Trả lời câu hỏi bằng giọng nói
- Nhận feedback chi tiết từ AI

### 3. Cấu trúc câu hỏi

#### Câu hỏi Microsoft chuẩn:
1. **Giới thiệu**: Tell me about yourself
2. **Động lực**: Why do you want to work at Microsoft?
3. **Văn hóa**: What do you know about Microsoft's culture?
4. **Kinh nghiệm**: Describe a challenging project
5. **Teamwork**: How do you handle working in a team?
6. **Điểm mạnh/yếu**: What are your strengths and weaknesses?
7. **Mục tiêu**: Where do you see yourself in 5 years?
8. **Cập nhật công nghệ**: How do you stay updated?
9. **Học hỏi**: Describe learning a new technology
10. **Feedback**: How do you handle feedback?
11. **Xung đột**: What if you disagreed with your manager?
12. **Ưu tiên**: How do you prioritize work?
13. **Giải quyết vấn đề**: Describe solving a complex problem
14. **Áp lực**: How do you handle stress?
15. **Lương**: What are your salary expectations?

## 📁 Cấu trúc dự án

```
microsoft-interview-pro/
├── index.html              # Trang chính
├── script.js               # Logic chính
├── config.js               # Cấu hình Azure OpenAI
├── styles.css              # CSS tùy chỉnh
├── test-mic.html           # Test microphone
├── microphone-fix.html     # Khắc phục vấn đề microphone
├── sample-cv.txt           # CV mẫu để test
├── package.json            # Dependencies
├── server.js               # HTTPS server
├── server-simple.js        # HTTP server
├── setup-ssl.js            # Setup SSL certificates
├── start-localhost.bat     # Chạy với localhost
├── MICROPHONE_SETUP.md     # Hướng dẫn microphone
├── QUICK_START.md          # Hướng dẫn nhanh
└── README.md               # Tài liệu này
```

## 🎯 Vị trí hỗ trợ

### Software Engineer
- **Kỹ năng**: Programming, Problem Solving, System Design
- **Câu hỏi**: Technical challenges, debugging, learning new tech

### Product Manager
- **Kỹ năng**: Product Strategy, User Research, Data Analysis
- **Câu hỏi**: Feature prioritization, product decisions, success metrics

### Data Scientist
- **Kỹ năng**: Machine Learning, Statistics, Data Analysis
- **Câu hỏi**: ML models, data handling, stakeholder communication

### Designer
- **Kỹ năng**: UI/UX Design, User Research, Prototyping
- **Câu hỏi**: Design process, user feedback, design decisions

### Marketing
- **Kỹ năng**: Digital Marketing, Analytics, Campaign Management
- **Câu hỏi**: Marketing strategies, ROI measurement, brand awareness

### Sales
- **Kỹ năng**: Relationship Building, Negotiation, CRM
- **Câu hỏi**: Sales process, objection handling, quota achievement

## 🔧 Khắc phục sự cố

### Vấn đề microphone
- **Lỗi "Requested device not found"**: Sử dụng HTTPS hoặc localhost
- **Lỗi "Permission denied"**: Cấp quyền microphone trong trình duyệt
- **Không có popup quyền**: Nhấp vào biểu tượng microphone trong thanh địa chỉ

### Vấn đề CV upload
- **File không đọc được**: Đảm bảo file là PDF, DOC, DOCX, hoặc TXT
- **Phân tích lỗi**: Kiểm tra kết nối internet và Azure OpenAI API

### Vấn đề AI feedback
- **Feedback không hiển thị**: Kiểm tra Azure OpenAI API key
- **Lỗi API**: Xem console để debug

## 🚀 Deploy

### Vercel (Khuyến nghị)
```bash
npm install -g vercel
vercel --prod
```

### Netlify
1. Tạo tài khoản Netlify
2. Kéo thả thư mục dự án vào Netlify
3. Truy cập URL được cung cấp

### GitHub Pages
1. Push code lên GitHub
2. Vào Settings > Pages
3. Chọn source là main branch
4. Truy cập URL: `https://username.github.io/repository-name`

## 📞 Hỗ trợ

- **Email**: support@microsoftinterviewpro.com
- **GitHub Issues**: Báo cáo lỗi và đề xuất tính năng
- **Documentation**: Xem các file .md để biết chi tiết

## 📄 License

MIT License - Xem file LICENSE để biết chi tiết.

---

**Lưu ý**: Ứng dụng này được phát triển để hỗ trợ ứng viên Microsoft. Không phải sản phẩm chính thức của Microsoft Corporation. 
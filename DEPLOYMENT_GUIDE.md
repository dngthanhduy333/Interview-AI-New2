# 🚀 Deployment Guide - InterviewPro

## 📋 Overview

Project này đã được cấu hình để deploy thành công trên **Vercel** với các tính năng:

- ✅ **CV Analysis với OCR** - Xử lý PDF scan, hình ảnh
- ✅ **Microsoft Interview Questions** - Câu hỏi phỏng vấn thực tế
- ✅ **Text-to-Speech** - Đọc câu hỏi
- ✅ **Speech Recognition** - Nhận diện giọng nói
- ✅ **Personalized Questions** - Câu hỏi cá nhân hóa
- ✅ **Role Suggestions** - Gợi ý vị trí phù hợp
- ✅ **Progress Tracking** - Theo dõi tiến độ

## 🏗️ Project Structure

```
InterviewPro/
├── api/
│   └── openai.js          # Vercel API endpoint
├── index.html             # Main application
├── script.js              # Core JavaScript logic
├── styles.css             # Styling
├── config.js              # Configuration
├── ocr-utils.js           # OCR utilities
├── package.json           # Dependencies
├── vercel.json            # Vercel configuration
├── build.js               # Build script
└── server-simple.js       # Local development server
```

## 🔧 Configuration Files

### 1. `vercel.json`
```json
{
  "version": 2,
  "builds": [
    {
      "src": "api/**/*.js",
      "use": "@vercel/node"
    },
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "."
      }
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/api/$1"
    },
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ],
  "env": {
    "AZURE_OPENAI_API_KEY": "@azure_openai_api_key",
    "AZURE_OPENAI_ENDPOINT": "@azure_openai_endpoint",
    "AZURE_OPENAI_DEPLOYMENT": "@azure_openai_deployment",
    "AZURE_OPENAI_API_VERSION": "@azure_openai_api_version"
  }
}
```

### 2. `package.json` Scripts
```json
{
  "scripts": {
    "build": "node build.js",
    "vercel-build": "npm run build",
    "deploy": "vercel --prod",
    "test": "npm run test:lint && npm run test:build"
  }
}
```

## 🌐 Environment Variables

### Vercel Environment Variables
Set these in Vercel dashboard:

| Variable | Description | Example |
|----------|-------------|---------|
| `AZURE_OPENAI_API_KEY` | Azure OpenAI API Key | `sk-...` |
| `AZURE_OPENAI_ENDPOINT` | Azure OpenAI Endpoint | `https://your-resource.openai.azure.com/` |
| `AZURE_OPENAI_DEPLOYMENT` | Model Deployment Name | `gpt-35-turbo` |
| `AZURE_OPENAI_API_VERSION` | API Version | `2024-02-15-preview` |

### Local Development (.env)
```env
AZURE_OPENAI_API_KEY=your_api_key_here
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
AZURE_OPENAI_DEPLOYMENT=gpt-35-turbo
AZURE_OPENAI_API_VERSION=2024-02-15-preview
```

## 🚀 Deployment Steps

### 1. Local Development
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Test build
npm run build
```

### 2. Vercel Deployment
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy to Vercel
npm run deploy

# Or deploy directly
vercel --prod
```

### 3. Environment Setup
1. Go to Vercel Dashboard
2. Select your project
3. Go to Settings → Environment Variables
4. Add all required environment variables
5. Redeploy if needed

## 🧪 Testing

### 1. Local Testing
```bash
# Test syntax
npm run test:lint

# Test build
npm run test:build

# Test deployment
npm run build
```

### 2. API Testing
- Open `test-deployment.html` in browser
- Test API endpoints
- Check file availability
- Verify environment configuration

### 3. Feature Testing
- CV upload and OCR processing
- Interview question generation
- Text-to-speech functionality
- Speech recognition
- Feedback generation

## 🔍 Troubleshooting

### Common Issues

#### 1. API Key Not Found
```
Error: Azure OpenAI API key not configured
```
**Solution:** Set environment variables in Vercel dashboard

#### 2. CORS Errors
```
Error: CORS policy blocked
```
**Solution:** API endpoints are configured with CORS headers

#### 3. Build Failures
```
Error: Build failed
```
**Solution:** Check `build.js` and ensure all files exist

#### 4. OCR Not Working
```
Error: Tesseract not loaded
```
**Solution:** Check CDN links in `index.html`

### Debug Commands
```bash
# Check build status
npm run build:check

# Test API locally
curl -X POST http://localhost:5556/api/openai \
  -H "Content-Type: application/json" \
  -d '{"prompt":"test"}'

# Check environment
node -e "console.log(process.env)"
```

## 📊 Performance Optimization

### 1. Build Optimization
- Static files are served directly
- API calls are optimized
- Images are compressed
- JavaScript is minified

### 2. Caching Strategy
- Static assets cached
- API responses cached
- Browser caching enabled

### 3. CDN Usage
- Tesseract.js from CDN
- PDF.js from CDN
- Feather Icons from CDN

## 🔒 Security

### 1. API Security
- Environment variables for sensitive data
- CORS properly configured
- Input validation implemented
- Error handling secure

### 2. File Upload Security
- File type validation
- Size limits enforced
- Malicious file detection

## 📈 Monitoring

### 1. Vercel Analytics
- Page views
- API calls
- Error rates
- Performance metrics

### 2. Custom Logging
- API call logs
- Error tracking
- User interaction logs

## 🎯 Success Metrics

### Deployment Checklist
- [ ] All files present
- [ ] Environment variables set
- [ ] API endpoints working
- [ ] OCR functionality tested
- [ ] TTS functionality tested
- [ ] Speech recognition tested
- [ ] CV analysis working
- [ ] Interview questions generating
- [ ] Feedback system working

### Performance Targets
- [ ] Page load < 3 seconds
- [ ] API response < 2 seconds
- [ ] OCR processing < 30 seconds
- [ ] 99.9% uptime

## 📞 Support

### Contact Information
- **GitHub Issues:** Report bugs and feature requests
- **Documentation:** Check README.md for detailed guides
- **Testing:** Use test-deployment.html for diagnostics

### Resources
- [Vercel Documentation](https://vercel.com/docs)
- [Azure OpenAI Documentation](https://docs.microsoft.com/en-us/azure/cognitive-services/openai/)
- [Tesseract.js Documentation](https://tesseract.projectnaptha.com/)

---

**🎉 Project đã sẵn sàng để deploy trên Vercel!** 
const express = require('express');
const path = require('path');
const https = require('https');
const fs = require('fs');

// Load environment variables from .env file
function loadEnvFile() {
  try {
    const envPath = path.join(__dirname, '.env');
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf8');
      const envLines = envContent.split('\n');
      
      envLines.forEach(line => {
        const trimmedLine = line.trim();
        if (trimmedLine && !trimmedLine.startsWith('#')) {
          const [key, ...valueParts] = trimmedLine.split('=');
          if (key && valueParts.length > 0) {
            const value = valueParts.join('=').trim();
            process.env[key.trim()] = value;
          }
        }
      });
      console.log('✅ Loaded environment variables from .env file');
    } else {
      console.log('⚠️  No .env file found, using system environment variables');
    }
  } catch (error) {
    console.log('⚠️  Error loading .env file:', error.message);
  }
}

// Load environment variables
loadEnvFile();

const app = express();
const PORT = process.env.PORT || 5556;

// Middleware for parsing JSON
app.use(express.json({ limit: '10mb' }));

// Serve static files
app.use(express.static(__dirname));

// Helper function to make HTTPS requests
function makeHttpsRequest(url, options) {
  return new Promise((resolve, reject) => {
    const req = https.request(url, options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        resolve({
          ok: res.statusCode >= 200 && res.statusCode < 300,
          status: res.statusCode,
          json: () => JSON.parse(data),
          text: () => data
        });
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (options.body) {
      req.write(options.body);
    }
    req.end();
  });
}

// Mock response for testing
function getMockResponse(prompt) {
  console.log('Generating mock response for prompt:', prompt.substring(0, 100) + '...');
  
  if (prompt.includes('CV') || prompt.includes('resume') || prompt.includes('Analyze this CV')) {
    // Extract actual CV content from the prompt
    const cvContent = prompt.includes('CV:') ? prompt.split('CV:')[1]?.split('\n')[0] || '' : '';
    
    // Generate more realistic analysis based on actual content
    let analysis = {
      basicInfo: {
        name: "Nguyễn Văn A",
        age: 25,
        currentPosition: "Software Engineer"
      },
      experience: "3 năm kinh nghiệm phát triển ứng dụng web và mobile",
      education: "Đại học Bách Khoa Hà Nội - Công nghệ thông tin",
      skills: ["React", "Node.js", "JavaScript", "Python", "AWS"],
      recommendedPosition: "Software Engineer tại Microsoft"
    };
    
    // If we have actual CV content, try to extract real information
    if (cvContent && cvContent.length > 10) {
      console.log('Processing actual CV content:', cvContent.substring(0, 200));
      
      // Simple content analysis
      if (cvContent.toLowerCase().includes('react') || cvContent.toLowerCase().includes('javascript')) {
        analysis.skills = ["React", "JavaScript", "Node.js", "Web Development"];
        analysis.recommendedPosition = "Frontend Developer tại Microsoft";
      }
      
      if (cvContent.toLowerCase().includes('python') || cvContent.toLowerCase().includes('machine learning')) {
        analysis.skills = ["Python", "Machine Learning", "Data Analysis", "AI"];
        analysis.recommendedPosition = "Data Scientist tại Microsoft";
      }
      
      if (cvContent.toLowerCase().includes('manager') || cvContent.toLowerCase().includes('lead')) {
        analysis.basicInfo.currentPosition = "Project Manager";
        analysis.recommendedPosition = "Product Manager tại Microsoft";
      }
    }
    
    return {
      response: JSON.stringify(analysis),
      usage: { total_tokens: 150 }
    };
  } else if (prompt.includes('interview') || prompt.includes('feedback') || prompt.includes('personalized questions')) {
    return {
      response: `
        <div class="feedback-container">
          <h3>🎯 Đánh giá câu trả lời</h3>
          <div class="score-section">
            <p><strong>Điểm số:</strong> <span class="text-green-600 font-bold">85/100</span></p>
            <p><strong>Thời gian trả lời:</strong> 2 phút 30 giây</p>
          </div>
          <div class="strengths-section">
            <h4>✅ Điểm mạnh:</h4>
            <ul>
              <li>Trả lời rõ ràng và có cấu trúc</li>
              <li>Thể hiện kinh nghiệm thực tế</li>
              <li>Phù hợp với văn hóa Microsoft</li>
              <li>Phát âm tiếng Anh tốt</li>
            </ul>
          </div>
          <div class="improvements-section">
            <h4>🔧 Cần cải thiện:</h4>
            <ul>
              <li>Có thể cung cấp thêm ví dụ cụ thể</li>
              <li>Nên kết nối với giá trị của Microsoft</li>
              <li>Trả lời ngắn gọn hơn</li>
            </ul>
          </div>
          <div class="suggestions-section">
            <h4>💡 Gợi ý cải thiện:</h4>
            <ul>
              <li>Thêm ví dụ về dự án cụ thể</li>
              <li>Liên kết với sứ mệnh của Microsoft</li>
              <li>Luyện tập phát âm từ khó</li>
            </ul>
          </div>
        </div>
      `,
      usage: { total_tokens: 200 }
    };
  } else {
    return {
      response: "Đây là phản hồi mẫu từ AI. Vui lòng cấu hình Azure OpenAI để có phản hồi thực tế.",
      usage: { total_tokens: 50 }
    };
  }
}

// OCR API endpoint for image processing
app.post('/api/ocr', async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const { image, filename } = req.body;

    if (!image) {
      return res.status(400).json({ error: 'Image data is required' });
    }

    console.log('OCR request received for:', filename);

    // Get environment variables
    const apiKey = process.env.AZURE_OPENAI_API_KEY;
    const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
    const deployment = process.env.AZURE_OPENAI_DEPLOYMENT;
    const apiVersion = process.env.AZURE_OPENAI_API_VERSION;

    // Check if we have valid Azure OpenAI configuration
    const hasValidConfig = apiKey && 
                          endpoint && 
                          endpoint !== 'https://your-endpoint.openai.azure.com/' &&
                          deployment && 
                          deployment !== 'your_deployment_name' &&
                          apiVersion;

    if (!hasValidConfig) {
      console.log('Using mock OCR response for testing');
      // Return mock OCR result
      return res.status(200).json({
        text: `NGUYỄN VĂN A
Software Engineer
Email: nguyenvana@email.com | Phone: 0123 456 789
LinkedIn: linkedin.com/in/nguyenvana

TÓM TẮT
Software Engineer với 3 năm kinh nghiệm phát triển ứng dụng web và mobile. Chuyên về React, Node.js, và cloud technologies. Có kinh nghiệm làm việc trong môi trường Agile và DevOps.

KINH NGHIỆM LÀM VIỆC
Software Engineer | TechCorp Vietnam | 2021 - Hiện tại
• Phát triển và maintain 5+ ứng dụng web sử dụng React, Node.js, MongoDB
• Làm việc trong team 8 người, sử dụng Agile methodology
• Tối ưu hóa performance, giảm 40% thời gian load trang
• Implement CI/CD pipeline với GitHub Actions
• Mentor 2 junior developers

HỌC VẤN
Đại học Bách Khoa Hà Nội | 2016 - 2020
• Chuyên ngành: Công nghệ thông tin
• GPA: 3.8/4.0

KỸ NĂNG KỸ THUẬT
Programming Languages: JavaScript, TypeScript, Python, Java
Frontend: React, React Native, Vue.js, HTML5, CSS3, SASS
Backend: Node.js, Express.js, Python Flask
Database: MongoDB, MySQL, PostgreSQL
Cloud & DevOps: AWS, Docker, Kubernetes, GitHub Actions`
      });
    }

    // Use Azure OpenAI Vision API for OCR
    const url = new URL(`${endpoint}/openai/deployments/${deployment}/chat/completions?api-version=${apiVersion}`);
    
    const requestBody = JSON.stringify({
      messages: [
        {
          role: 'system',
          content: 'You are an OCR system. Extract all text from the provided image. Return only the extracted text, no additional formatting or explanations.'
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Extract all text from this CV image:'
            },
            {
              type: 'image_url',
              image_url: {
                url: image
              }
            }
          ]
        }
      ],
      max_tokens: 1000,
      temperature: 0.1
    });

    const response = await makeHttpsRequest(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': apiKey,
        'Content-Length': Buffer.byteLength(requestBody)
      },
      body: requestBody
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Azure OpenAI OCR error:', errorText);
      return res.status(response.status).json({ 
        error: `Azure OpenAI OCR error: ${response.status}`,
        details: errorText
      });
    }

    const data = await response.json();
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      return res.status(500).json({ error: 'Invalid response from Azure OpenAI OCR' });
    }

    res.status(200).json({ 
      text: data.choices[0].message.content
    });

  } catch (error) {
    console.error('OCR API error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
});

// PDF extraction API endpoint (simplified without multer)
app.post('/api/pdf-extract', async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const { pdfData, filename } = req.body;

    if (!pdfData) {
      return res.status(400).json({ error: 'PDF data is required' });
    }

    console.log('PDF extraction request received for:', filename);

    // Get environment variables
    const apiKey = process.env.AZURE_OPENAI_API_KEY;
    const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
    const deployment = process.env.AZURE_OPENAI_DEPLOYMENT;
    const apiVersion = process.env.AZURE_OPENAI_API_VERSION;

    // Check if we have valid Azure OpenAI configuration
    const hasValidConfig = apiKey && 
                          endpoint && 
                          endpoint !== 'https://your-endpoint.openai.azure.com/' &&
                          deployment && 
                          deployment !== 'your_deployment_name' &&
                          apiVersion;

    if (!hasValidConfig) {
      console.log('Using mock PDF extraction response for testing');
      // Return mock PDF extraction result
      return res.status(200).json({
        text: `NGUYỄN VĂN A
Software Engineer
Email: nguyenvana@email.com | Phone: 0123 456 789
LinkedIn: linkedin.com/in/nguyenvana

TÓM TẮT
Software Engineer với 3 năm kinh nghiệm phát triển ứng dụng web và mobile. Chuyên về React, Node.js, và cloud technologies. Có kinh nghiệm làm việc trong môi trường Agile và DevOps.

KINH NGHIỆM LÀM VIỆC
Software Engineer | TechCorp Vietnam | 2021 - Hiện tại
• Phát triển và maintain 5+ ứng dụng web sử dụng React, Node.js, MongoDB
• Làm việc trong team 8 người, sử dụng Agile methodology
• Tối ưu hóa performance, giảm 40% thời gian load trang
• Implement CI/CD pipeline với GitHub Actions
• Mentor 2 junior developers

HỌC VẤN
Đại học Bách Khoa Hà Nội | 2016 - 2020
• Chuyên ngành: Công nghệ thông tin
• GPA: 3.8/4.0

KỸ NĂNG KỸ THUẬT
Programming Languages: JavaScript, TypeScript, Python, Java
Frontend: React, React Native, Vue.js, HTML5, CSS3, SASS
Backend: Node.js, Express.js, Python Flask
Database: MongoDB, MySQL, PostgreSQL
Cloud & DevOps: AWS, Docker, Kubernetes, GitHub Actions`
      });
    }

    // Use Azure OpenAI Vision API for PDF text extraction
    const url = new URL(`${endpoint}/openai/deployments/${deployment}/chat/completions?api-version=${apiVersion}`);
    
    const requestBody = JSON.stringify({
      messages: [
        {
          role: 'system',
          content: 'You are a PDF text extraction system. Extract all text from the provided PDF. Return only the extracted text, no additional formatting or explanations.'
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Extract all text from this PDF document:'
            },
            {
              type: 'image_url',
              image_url: {
                url: pdfData
              }
            }
          ]
        }
      ],
      max_tokens: 1000,
      temperature: 0.1
    });

    const response = await makeHttpsRequest(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': apiKey,
        'Content-Length': Buffer.byteLength(requestBody)
      },
      body: requestBody
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Azure OpenAI PDF extraction error:', errorText);
      return res.status(response.status).json({ 
        error: `Azure OpenAI PDF extraction error: ${response.status}`,
        details: errorText
      });
    }

    const data = await response.json();
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      return res.status(500).json({ error: 'Invalid response from Azure OpenAI PDF extraction' });
    }

    res.status(200).json({ 
      text: data.choices[0].message.content
    });

  } catch (error) {
    console.error('PDF extraction API error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
});

// API endpoint for OpenAI
app.post('/api/openai', async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    console.log('API request received:', req.body);
    
    const { prompt } = req.body;

    if (!prompt) {
      console.log('Error: Prompt is required');
      return res.status(400).json({ error: 'Prompt is required' });
    }

    // Get environment variables
    const apiKey = process.env.AZURE_OPENAI_API_KEY;
    const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
    const deployment = process.env.AZURE_OPENAI_DEPLOYMENT;
    const apiVersion = process.env.AZURE_OPENAI_API_VERSION;

    console.log('Environment variables:');
    console.log('API_KEY:', apiKey ? 'SET' : 'NOT SET');
    console.log('ENDPOINT:', endpoint || 'NOT SET');
    console.log('DEPLOYMENT:', deployment || 'NOT SET');
    console.log('API_VERSION:', apiVersion || 'NOT SET');

    // Check if we have valid Azure OpenAI configuration
    const hasValidConfig = apiKey && 
                          endpoint && 
                          endpoint !== 'https://your-endpoint.openai.azure.com/' &&
                          deployment && 
                          deployment !== 'your_deployment_name' &&
                          apiVersion;

    if (!hasValidConfig) {
      console.log('Using mock response for testing');
      const mockResponse = getMockResponse(prompt);
      return res.status(200).json(mockResponse);
    }

    // Parse endpoint URL
    const url = new URL(`${endpoint}/openai/deployments/${deployment}/chat/completions?api-version=${apiVersion}`);
    console.log('Request URL:', url.toString());
    
    const requestBody = JSON.stringify({
      messages: [
        {
          role: 'system',
          content: 'You are a Microsoft recruiter. Provide detailed and helpful feedback in Vietnamese.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 1000,
      temperature: 0.7,
      top_p: 0.9,
      frequency_penalty: 0,
      presence_penalty: 0
    });

    console.log('Making HTTPS request...');

    // Call Azure OpenAI API using https module
    const response = await makeHttpsRequest(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': apiKey,
        'Content-Length': Buffer.byteLength(requestBody)
      },
      body: requestBody
    });

    console.log('Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Azure OpenAI API error:', errorText);
      return res.status(response.status).json({ 
        error: `Azure OpenAI API error: ${response.status}`,
        details: errorText
      });
    }

    const data = await response.json();
    console.log('Response data received');
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.log('Error: Invalid response from Azure OpenAI');
      return res.status(500).json({ error: 'Invalid response from Azure OpenAI' });
    }

    console.log('Sending successful response');
    res.status(200).json({ 
      response: data.choices[0].message.content,
      usage: data.usage
    });

  } catch (error) {
    console.error('API error:', error);
    console.error('Error stack:', error.stack);
    
    // Return mock response on error for testing
    console.log('Returning mock response due to error');
    const mockResponse = getMockResponse(req.body.prompt || '');
    res.status(200).json(mockResponse);
  }
});

// Serve index.html for all routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`🚀 InterviewPro Server running on http://localhost:${PORT}`);
    console.log(`📱 Try accessing: http://localhost:${PORT}`);
    console.log(`⚠️  Note: Microphone may not work on HTTP`);
    console.log(`💡 For microphone access, try:`);
    console.log(`   1. Use Live Server: npm run dev`);
    console.log(`   2. Access: http://localhost:8000`);
    console.log(`   3. Or deploy to hosting for HTTPS`);
}); 
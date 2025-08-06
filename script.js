// Global variables
let currentQuestionIndex = 0;
let isRecording = false;
let mediaRecorder = null;
let audioChunks = [];
let interviewType = 'microsoft';
let cvData = null;
let startTime = null;
let timerInterval = null;
let questions = null; // Personalized questions array
let currentLanguage = 'en'; // Current language: 'en' or 'vi'
let interviewResults = []; // Store all feedback
let interviewStartTime = null;
let interviewEndTime = null;
let speechRecognition = null; // For real-time speech-to-text
let isListening = false; // For real-time speech recognition
let transcribedText = ''; // Store transcribed text
let ocrProgress = null; // OCR processing progress
let speechSynthesis = window.speechSynthesis; // TTS API
let currentUtterance = null; // Current speaking utterance

// Helper function to show errors
function showError(message) {
    console.error('Error:', message);
    alert(message);
}

// Debug function to test file input
function testFileInput() {
    console.log('=== TESTING FILE INPUT ===');
    const cvFileInput = document.getElementById('cvFile');
    console.log('CV file input element:', cvFileInput);
    
    if (cvFileInput) {
        console.log('File input found, triggering click...');
        cvFileInput.click();
    } else {
        console.error('CV file input not found!');
    }
}

// Global file input test function
function testFileInputDirectly() {
    console.log('=== DIRECT FILE INPUT TEST ===');
    const cvFileInput = document.getElementById('cvFile');
    
    if (cvFileInput) {
        // Create a test file
        const testFile = new File(['Test CV content'], 'test-cv.txt', { type: 'text/plain' });
        
        // Create a new FileList-like object
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(testFile);
        
        // Set the files
        cvFileInput.files = dataTransfer.files;
        
        console.log('Test file set:', cvFileInput.files[0]);
        
        // Trigger change event manually
        const changeEvent = new Event('change', { bubbles: true });
        cvFileInput.dispatchEvent(changeEvent);
        
        console.log('Change event dispatched manually');
    } else {
        console.error('CV file input not found for direct test!');
    }
}

// TTS Functions
function speakQuestion(questionText, language = 'en-US') {
    // Stop any current speech
    if (currentUtterance) {
        speechSynthesis.cancel();
    }
    
    // Create new utterance
    currentUtterance = new SpeechSynthesisUtterance(questionText);
    currentUtterance.lang = language;
    currentUtterance.rate = 0.9; // Slightly slower for clarity
    currentUtterance.pitch = 1.0;
    currentUtterance.volume = 1.0;
    
    // Update UI
    updateSpeakButton(true);
    
    // Event handlers
    currentUtterance.onstart = () => {
        console.log('🎤 Started speaking question');
        updateQuestionStatus('Speaking...', 'text-blue-600');
    };
    
    currentUtterance.onend = () => {
        console.log('✅ Finished speaking question');
        updateSpeakButton(false);
        updateQuestionStatus('Question spoken. Ready to answer.', 'text-green-600');
    };
    
    currentUtterance.onerror = (event) => {
        console.error('❌ Speech error:', event);
        updateSpeakButton(false);
        updateQuestionStatus('Speech error. Please try again.', 'text-red-600');
    };
    
    // Start speaking
    speechSynthesis.speak(currentUtterance);
}

function updateSpeakButton(isSpeaking) {
    const speakBtn = document.getElementById('speakBtn');
    const speakBtnText = document.getElementById('speakBtnText');
    
    if (!speakBtn || !speakBtnText) {
        console.log('⚠️ Speak button elements not found');
        return;
    }
    
    if (isSpeaking) {
        speakBtn.classList.add('bg-red-600', 'hover:bg-red-700');
        speakBtn.classList.remove('bg-blue-600', 'hover:bg-blue-700');
        speakBtnText.textContent = 'Stop';
    } else {
        speakBtn.classList.remove('bg-red-600', 'hover:bg-red-700');
        speakBtn.classList.add('bg-blue-600', 'hover:bg-blue-700');
        speakBtnText.textContent = 'Speak';
    }
}

function updateQuestionStatus(message, colorClass) {
    const statusElement = document.getElementById('question-status');
    if (statusElement) {
        statusElement.className = `text-sm ${colorClass} mt-2`;
        statusElement.innerHTML = `<i data-feather="play" class="w-4 h-4 inline mr-1"></i><span>${message}</span>`;
        feather.replace();
    } else {
        console.log('⚠️ Question status element not found');
    }
}

function toggleQuestionText() {
    const questionText = document.getElementById('currentQuestionText');
    const toggleBtn = document.getElementById('toggleTextBtn');
    
    if (!questionText || !toggleBtn) {
        console.log('⚠️ Question text or toggle button not found');
        return;
    }
    
    if (questionText.classList.contains('hidden')) {
        questionText.classList.remove('hidden');
        toggleBtn.textContent = 'Hide Text';
    } else {
        questionText.classList.add('hidden');
        toggleBtn.textContent = 'Show Text';
    }
}

// Global TTS functions
window.speakCurrentQuestion = function() {
    const currentQuestion = questions ? questions[currentQuestionIndex] : microsoftQuestions[currentQuestionIndex];
    if (currentQuestion) {
        speakQuestion(currentQuestion, currentLanguage === 'vi' ? 'vi-VN' : 'en-US');
    }
};

window.toggleQuestionText = toggleQuestionText;

// Function to switch question language
window.switchQuestionLanguage = function() {
    if (questions && questions.length > 0) {
        // Toggle language
        currentLanguage = currentLanguage === 'en' ? 'vi' : 'en';
        
        // Regenerate questions with new language
        if (cvData) {
            generatePersonalizedQuestions(cvData).then(newQuestions => {
                questions = newQuestions;
                displayCurrentQuestion();
                updateLanguageUI();
            });
        }
    }
};

// Make functions globally available
window.startPractice = function() {
    console.log('startPractice called from window');
    document.getElementById('home').classList.add('hidden');
    document.getElementById('cvUpload').classList.add('hidden');
    document.getElementById('practice').classList.remove('hidden');
    document.getElementById('booking').classList.add('hidden');
    
    currentQuestionIndex = 0;
    interviewResults = []; // Reset results
    interviewStartTime = Date.now();
    startTimer();
    displayCurrentQuestion();
    updateNavigationButtons();
};

window.showCVUpload = function() {
    console.log('showCVUpload called from window');
    document.getElementById('home').classList.add('hidden');
    document.getElementById('cvUpload').classList.remove('hidden');
    document.getElementById('practice').classList.add('hidden');
    document.getElementById('booking').classList.add('hidden');
};

// Microsoft Interview Questions
const microsoftQuestions = [
    "Tell me about yourself and your background.",
    "Why do you want to work at Microsoft?",
    "What do you know about Microsoft's culture and values?",
    "Describe a challenging project you worked on and how you overcame obstacles.",
    "How do you handle working in a team environment?",
    "What are your strengths and weaknesses?",
    "Where do you see yourself in 5 years?",
    "How do you stay updated with technology trends?",
    "Describe a time when you had to learn a new technology quickly.",
    "How do you handle feedback and criticism?",
    "What would you do if you disagreed with your manager?",
    "How do you prioritize your work when you have multiple deadlines?",
    "Describe a situation where you had to solve a complex problem.",
    "How do you handle stress and pressure?",
    "What are your salary expectations?"
];

// Initialize the application
// File input event listener
document.addEventListener('DOMContentLoaded', function() {
    console.log('=== DOMContentLoaded EVENT FIRED ===');
    
    const cvFileInput = document.getElementById('cvFile');
    console.log('CV file input element found:', cvFileInput);
    
    if (cvFileInput) {
        console.log('Setting up change event listener for cvFileInput...');
        console.log('Current accept attribute:', cvFileInput.accept);
        console.log('Current multiple attribute:', cvFileInput.multiple);
        
        // Add multiple event listeners to debug
        cvFileInput.addEventListener('change', function(event) {
            console.log('=== CHANGE EVENT FIRED ===');
            console.log('Event object:', event);
            console.log('Event target:', event.target);
            console.log('Event target files:', event.target.files);
            console.log('Files array length:', event.target.files ? event.target.files.length : 'null');
            
            if (event.target.files && event.target.files.length > 0) {
                console.log('File selected in change event:', event.target.files[0]);
                handleCVFileSelect(event);
            } else {
                console.log('No files selected in change event');
            }
        });
        
        // Also add a click event listener to see if the input is being clicked
        cvFileInput.addEventListener('click', function(event) {
            console.log('=== CLICK EVENT FIRED ON FILE INPUT ===');
            console.log('Click event object:', event);
        });
        
        console.log('Event listeners attached successfully');
    } else {
        console.error('CV file input element not found!');
    }
    
    // Set up booking form
    const bookingForm = document.getElementById('bookingForm');
    if (bookingForm) {
        bookingForm.addEventListener('submit', handleBookingSubmit);
    }
    
    // Initialize language
    updateLanguageUI();
    
    // Initialize speech recognition
    initializeSpeechRecognition();
    
    // Debug: Check if functions are available
    console.log('startPractice function:', typeof startPractice);
    console.log('showCVUpload function:', typeof showCVUpload);
});

// Initialize speech recognition for real-time transcription
function initializeSpeechRecognition() {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        speechRecognition = new SpeechRecognition();
        speechRecognition.continuous = true;
        speechRecognition.interimResults = true;
        speechRecognition.lang = 'en-US';
        
        speechRecognition.onresult = function(event) {
            let interimTranscript = '';
            let finalTranscript = '';
            
            for (let i = event.resultIndex; i < event.results.length; i++) {
                const transcript = event.results[i][0].transcript;
                if (event.results[i].isFinal) {
                    finalTranscript += transcript;
                } else {
                    interimTranscript += transcript;
                }
            }
            
            // Update the transcription display
            const transcriptionElement = document.getElementById('transcription');
            if (transcriptionElement) {
                transcriptionElement.innerHTML = `
                    <div class="final-transcript">${finalTranscript}</div>
                    <div class="interim-transcript">${interimTranscript}</div>
                `;
            }
            
            transcribedText = finalTranscript + interimTranscript;
        };
        
        speechRecognition.onerror = function(event) {
            console.error('Speech recognition error:', event.error);
            // Don't throw error for no-speech, just log it
            if (event.error !== 'no-speech') {
                console.error('Speech recognition failed:', event.error);
            }
        };
    }
}

// Enhanced CV file handling with multiple formats
function handleCVFileSelect(event) {
    console.log('=== handleCVFileSelect FUNCTION CALLED ===');
    console.log('Event object received:', event);
    console.log('Event target:', event.target);
    console.log('Event target files:', event.target.files);
    
    const file = event.target.files[0];
    console.log('Extracted file object:', file);
    
    if (!file) {
        console.log('No file selected - file object is null/undefined');
        showError('Vui lòng chọn một file CV.');
        return;
    }

    console.log('File selected:', file.name);
    console.log('File type:', file.type);
    console.log('File size:', file.size, 'bytes');
    console.log('File last modified:', file.lastModified);

    // Show loading state
    const uploadArea = document.querySelector('.border-dashed');
    if (uploadArea) {
        uploadArea.innerHTML = `
            <div class="flex items-center justify-center">
                <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span class="ml-2">Đang xử lý file...</span>
            </div>
        `;
    }

    // Show file preview
    const cvPreview = document.getElementById('cvPreview');
    const cvInfo = document.getElementById('cvInfo');
    const analyzeCVBtn = document.getElementById('analyzeCV');
    
    if (cvInfo) {
    cvInfo.innerHTML = `
        <div class="flex items-center justify-between">
            <div>
                <p class="font-medium">${file.name}</p>
                <p class="text-xs text-gray-500">${(file.size / 1024).toFixed(1)} KB</p>
            </div>
            <div class="text-green-600">
                <i data-feather="check-circle" class="w-5 h-5"></i>
            </div>
        </div>
    `;
    }
    
    if (cvPreview) cvPreview.classList.remove('hidden');
    if (analyzeCVBtn) analyzeCVBtn.classList.remove('hidden');
    feather.replace();

    // Check file type and process accordingly
    const fileType = file.type.toLowerCase();
    const fileName = file.name.toLowerCase();

    console.log('Processing file type:', fileType, 'File name:', fileName);

    // Use new OCR-enabled processing for all supported files
    if (fileType.includes('image') || fileName.match(/\.(jpg|jpeg|png|gif|bmp|tiff)$/) ||
        fileType.includes('pdf') || fileName.endsWith('.pdf') ||
        fileType.includes('text') || fileName.match(/\.(txt|doc|docx)$/)) {
        console.log('Processing with OCR support');
        processCVFile(file);
    } else {
        console.log('Unsupported file type');
        showError('Định dạng file không được hỗ trợ. Vui lòng chọn file PDF, hình ảnh, hoặc text.');
    }
}

// Process CV file with OCR support
async function processCVFile(file) {
    try {
        console.log('🔍 Processing CV file with OCR support:', file.name);
        
        // Check if OCR utils are loaded
        if (!window.OCRUtils) {
            console.log('⏳ OCR utils not loaded yet, waiting...');
            await new Promise(resolve => {
                const checkOCR = () => {
                    if (window.OCRUtils) {
                        resolve();
                    } else {
                        setTimeout(checkOCR, 100);
                    }
                };
                checkOCR();
            });
        }
        
        // Show OCR progress UI
        const ocrProgressDiv = document.getElementById('ocrProgress');
        const ocrProgressBar = document.getElementById('ocrProgressBar');
        const ocrProgressText = document.getElementById('ocrProgressText');
        
        if (ocrProgressDiv) {
            ocrProgressDiv.classList.remove('hidden');
        }

        // Progress callback for OCR
        const onProgress = (progress) => {
            console.log('📊 OCR Progress:', progress);
            
            if (progress.status === 'processing_page') {
                ocrProgressText.textContent = `Đang xử lý trang ${progress.page}/${progress.totalPages}...`;
                ocrProgressBar.style.width = `${progress.progress * 100}%`;
            } else if (progress.status === 'ocr_processing') {
                ocrProgressText.textContent = `Đang OCR trang ${progress.page}...`;
            } else if (progress.status === 'ocr_progress') {
                ocrProgressText.textContent = `OCR trang ${progress.page}: ${Math.round(progress.ocrProgress * 100)}%`;
                ocrProgressBar.style.width = `${progress.overallProgress * 100}%`;
            }
        };

        // Process file using OCR utils
        let cvText;
        try {
            cvText = await window.OCRUtils.processFile(file, onProgress);
            console.log('✅ CV text extracted with OCR:', cvText.substring(0, 200) + '...');
        } catch (ocrError) {
            console.warn('⚠️ OCR failed, trying fallback method:', ocrError);
            
            // Fallback to original methods
            if (file.type === 'application/pdf') {
                cvText = await processPDFFile(file);
            } else if (file.type === 'text/plain') {
                cvText = await processTextFile(file);
            } else {
                throw new Error('Không thể xử lý file này');
            }
            console.log('✅ CV text extracted with fallback:', cvText.substring(0, 200) + '...');
        }
        
        // Analyze CV with AI
        console.log('📄 Cleaned CV text:', cvText.substring(0, 500) + '...');
        await analyzeCVWithAI(cvText);
        
    } catch (error) {
        console.error('❌ Error processing CV file:', error);
        showError(`Lỗi xử lý CV: ${error.message}`);
    } finally {
        // Hide progress UI
        const ocrProgressDiv = document.getElementById('ocrProgress');
        if (ocrProgressDiv) {
            ocrProgressDiv.classList.add('hidden');
        }
    }
}

// Process image file using OCR
async function processImageFile(file) {
    try {
        console.log('Processing image file:', file.name);
        
        // Create a canvas to process the image
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();
        
        img.onload = async function() {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);
            
            // Convert to base64 for OCR processing
            const imageData = canvas.toDataURL('image/jpeg');
            console.log('Image converted to base64, length:', imageData.length);
            
            // Send to server for OCR processing
            const response = await fetch('/api/ocr', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    image: imageData,
                    filename: file.name
                })
            });
            
            console.log('OCR response status:', response.status);
            
            if (response.ok) {
                const result = await response.json();
                console.log('OCR result:', result);
                await analyzeCVWithAI(result.text);
            } else {
                const errorData = await response.json();
                console.error('OCR error:', errorData);
                throw new Error('OCR processing failed');
            }
        };
        
        img.src = URL.createObjectURL(file);
        
    } catch (error) {
        console.error('Error processing image:', error);
        showError('Không thể xử lý file hình ảnh. Vui lòng thử lại.');
    }
}

// Process PDF file
async function processPDFFile(file) {
    try {
        console.log('Processing PDF file:', file.name);
        
        // Convert file to base64
        const base64Data = await readFileAsBase64(file);
        console.log('PDF converted to base64, length:', base64Data.length);
        
        const response = await fetch('/api/pdf-extract', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                pdfData: base64Data,
                filename: file.name
            })
        });
        
        console.log('PDF extraction response status:', response.status);
        
        if (response.ok) {
            const result = await response.json();
            console.log('PDF extraction result:', result);
            await analyzeCVWithAI(result.text);
        } else {
            const errorData = await response.json();
            console.error('PDF extraction error:', errorData);
            throw new Error('PDF processing failed');
        }
    } catch (error) {
        console.error('Error processing PDF:', error);
        showError('Không thể xử lý file PDF. Vui lòng thử lại.');
    }
}

// Process text file
async function processTextFile(file) {
    try {
        console.log('Starting text file processing for:', file.name);
        const text = await readFileAsText(file);
        console.log('Text content length:', text.length);
        await analyzeCVWithAI(text);
    } catch (error) {
        console.error('Error processing text file:', error);
        showError('Không thể đọc file text. Vui lòng thử lại.');
    }
}

// Read file as base64
async function readFileAsBase64(file) {
    return new Promise((resolve, reject) => {
        console.log('Reading file as base64:', file.name);
        const reader = new FileReader();
        reader.onload = e => {
            const content = e.target.result;
            console.log('File converted to base64, length:', content.length);
            resolve(content);
        };
        reader.onerror = (error) => {
            console.error('FileReader error:', error);
            reject(error);
        };
        reader.readAsDataURL(file);
    });
}

// Read file as text
async function readFileAsText(file) {
    return new Promise((resolve, reject) => {
        console.log('Reading file as text:', file.name);
        const reader = new FileReader();
        reader.onload = e => {
            const content = e.target.result;
            console.log('File content read, length:', content.length);
            
            // Check if it's a PDF file (binary content)
            if (file.type === 'application/pdf' || content.startsWith('%PDF')) {
                // For PDF files, we'll extract text or show a message
                if (content.startsWith('%PDF')) {
                    console.log('PDF file detected, using fallback');
                    resolve('PDF file detected. Please convert to text format or use a text-based CV for better analysis.');
                } else {
                    console.log('PDF-like content, using as text');
                    resolve(content);
                }
            } else {
                // For text files, use as is
                console.log('Text file content ready');
                resolve(content);
            }
        };
        reader.onerror = (error) => {
            console.error('FileReader error:', error);
            reject(error);
        };
        reader.readAsText(file);
    });
}

// Analyze CV with AI
async function analyzeCVWithAI(cvText) {
    try {
        console.log('🔍 Starting CV analysis with text length:', cvText.length);
        console.log('📄 CV Text preview:', cvText.substring(0, 200) + '...');
        
        const response = await callAzureOpenAI(`
            Analyze this CV and return information in JSON format:
            
            CV: ${cvText}
            
            Return JSON with these fields:
            - basicInfo: Basic information (name, age, current position)
            - experience: Work experience (summary)
            - education: Education background
            - skills: Main skills
            - recommendedPosition: Suitable position at Microsoft
            
            IMPORTANT: Analyze the actual CV content provided, do not use mock data.
            Return only JSON, no other text.
        `);
        
        console.log('CV analysis response:', response);
        
        // Try to parse JSON from response
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            const analysis = JSON.parse(jsonMatch[0]);
            console.log('Parsed CV analysis:', analysis);
            
            // Store CV data for interview with normalized structure
            cvData = {
                basicInfo: analysis.basicInfo,
                experience: analysis.experience,
                education: analysis.education,
                skills: (() => {
                    // Normalize skills to array format
                    if (Array.isArray(analysis.skills)) {
                        return analysis.skills;
                    } else if (analysis.skills && analysis.skills.mainSkills) {
                        const allSkills = [];
                        Object.values(analysis.skills.mainSkills).forEach(category => {
                            if (Array.isArray(category)) {
                                allSkills.push(...category);
                            }
                        });
                        return allSkills;
                    } else {
                        return [];
                    }
                })(),
                recommendedPosition: analysis.recommendedPosition
            };
            
            // Display analysis with better formatting
            const analysisResult = document.getElementById('analysisResult');
            const startInterviewBtn = document.getElementById('startInterview');
            const cvAnalysis = document.getElementById('cvAnalysis');
            
            if (analysisResult) {
                analysisResult.innerHTML = `
                    <div class="bg-green-50 border border-green-200 rounded-lg p-6 mb-4">
                        <div class="flex items-center mb-4">
                            <i data-feather="check-circle" class="text-green-600 w-6 h-6 mr-2"></i>
                            <h4 class="text-lg font-semibold text-green-800">✅ CV đã được phân tích thành công!</h4>
                        </div>
                    </div>
                    <div class="space-y-4">
                        <div class="bg-white border border-gray-200 rounded-lg p-4">
                            <h6 class="font-semibold text-gray-800 mb-2">📋 Thông tin cơ bản:</h6>
                            <p class="text-sm text-gray-600">${analysis.basicInfo?.name || 'N/A'} - ${analysis.basicInfo?.currentPosition || 'N/A'}</p>
                        </div>
                        <div class="bg-white border border-gray-200 rounded-lg p-4">
                            <h6 class="font-semibold text-gray-800 mb-2">💼 Kinh nghiệm:</h6>
                            <p class="text-sm text-gray-600">${analysis.experience?.summary || analysis.experience || 'N/A'}</p>
                        </div>
                        <div class="bg-white border border-gray-200 rounded-lg p-4">
                            <h6 class="font-semibold text-gray-800 mb-2">🎓 Học vấn:</h6>
                            <p class="text-sm text-gray-600">${analysis.education?.background || analysis.education || 'N/A'}</p>
                        </div>
                        <div class="bg-white border border-gray-200 rounded-lg p-4">
                            <h6 class="font-semibold text-gray-800 mb-2">🔧 Kỹ năng chính:</h6>
                            <div class="flex flex-wrap gap-2">
                                ${(() => {
                                    // Handle different skills formats
                                    if (Array.isArray(analysis.skills)) {
                                        return analysis.skills.map(skill => 
                                            `<span class="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">${skill}</span>`
                                        ).join('');
                                    } else if (analysis.skills && analysis.skills.mainSkills) {
                                        // Handle nested skills structure
                                        const allSkills = [];
                                        Object.values(analysis.skills.mainSkills).forEach(category => {
                                            if (Array.isArray(category)) {
                                                allSkills.push(...category);
                                            }
                                        });
                                        return allSkills.map(skill => 
                                            `<span class="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">${skill}</span>`
                                        ).join('');
                                    } else {
                                        return '<span class="text-gray-500">Kỹ năng không có sẵn</span>';
                                    }
                                })()}
                            </div>
                        </div>
                        <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <h6 class="font-semibold text-blue-800 mb-2">🎯 Vị trí phù hợp tại Microsoft:</h6>
                            <p class="text-sm text-blue-700 font-medium">${analysis.recommendedPosition || 'Software Engineer'}</p>
                        </div>
                    </div>
                `;
            }
            
            // Show analysis and start interview button
            if (cvAnalysis) cvAnalysis.classList.remove('hidden');
            if (startInterviewBtn) {
                startInterviewBtn.classList.remove('hidden');
                startInterviewBtn.innerHTML = `
                    <i data-feather="play" class="w-5 h-5 mr-2"></i>
                    Bắt đầu phỏng vấn với CV đã phân tích
                `;
            }
            
            // Show success message
            showSuccessMessage('CV đã được phân tích thành công! Bạn có thể bắt đầu phỏng vấn.');
            
            // Show language switch button for personalized questions
            const switchLangBtn = document.getElementById('switchLangBtn');
            if (switchLangBtn) {
                switchLangBtn.classList.remove('hidden');
            }
            
            return analysis;
        } else {
            throw new Error('No JSON found in response');
        }
    } catch (error) {
        console.error('CV analysis error:', error);
        // Show error instead of fallback data
        showError('Không thể phân tích CV. Vui lòng thử lại.');
        return null;
    }
}

// Enhanced voice recording with real-time transcription
function toggleRecording() {
    if (isRecording) {
        stopRecording();
    } else {
        startRecording();
    }
}

async function startRecording() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        isRecording = true;
        
        // Update UI
        const recordButton = document.getElementById('recordButton');
        if (recordButton) {
            recordButton.innerHTML = '<i data-feather="square" class="w-6 h-6"></i> Dừng ghi âm';
            recordButton.classList.add('bg-red-600');
            recordButton.classList.remove('bg-blue-600');
        }
        
        // Start real-time transcription
        if (speechRecognition) {
            speechRecognition.start();
            isListening = true;
        }
        
        // Show transcription area
        const transcriptionArea = document.getElementById('transcriptionArea');
        if (transcriptionArea) {
            transcriptionArea.classList.remove('hidden');
        }
        
        // Start audio recording
    mediaRecorder = new MediaRecorder(stream);
    audioChunks = [];
    
        mediaRecorder.ondataavailable = function(event) {
        audioChunks.push(event.data);
    };
    
        mediaRecorder.onstop = function() {
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
            processRecording(audioBlob);
    };
    
    mediaRecorder.start();
        
    } catch (error) {
        console.error('Error starting recording:', error);
        showError('Không thể bắt đầu ghi âm. Vui lòng kiểm tra quyền microphone.');
    }
}

function stopRecording() {
    if (mediaRecorder && isRecording) {
        mediaRecorder.stop();
        isRecording = false;
        
        // Stop real-time transcription
        if (speechRecognition && isListening) {
            speechRecognition.stop();
            isListening = false;
        }
        
        // Update UI
        const recordButton = document.getElementById('recordButton');
        if (recordButton) {
            recordButton.innerHTML = '<i data-feather="mic" class="w-6 h-6"></i> Bắt đầu ghi âm';
            recordButton.classList.remove('bg-red-600');
            recordButton.classList.add('bg-blue-600');
        }
        
        // Hide transcription area
        const transcriptionArea = document.getElementById('transcriptionArea');
        if (transcriptionArea) {
            transcriptionArea.classList.add('hidden');
        }
    }
}

async function processRecording(audioBlob) {
    // Show processing state
    const feedbackSection = document.getElementById('feedbackSection');
    const feedbackContent = document.getElementById('feedbackContent');
    
    feedbackSection.classList.remove('hidden');
    feedbackContent.innerHTML = '<div class="flex items-center"><div class="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>Đang chuyển đổi âm thanh thành text...</div>';
    
    try {
        // Convert audio to text
        const audioText = await convertAudioToText(audioBlob);
        
        // Show transcript
        feedbackContent.innerHTML = `
            <div class="mb-4 p-4 bg-blue-50 rounded-lg">
                <h5 class="font-semibold text-blue-800 mb-2">🎤 Transcript:</h5>
                <p class="text-blue-700">"${audioText}"</p>
            </div>
            <div class="flex items-center">
                <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                Đang phân tích và đánh giá...
            </div>
        `;
        
        // Generate feedback
        const feedbackResponse = await generateFeedback(audioText);
        console.log('Feedback response in processRecording:', feedbackResponse);
        
        // Extract feedback content
        const feedbackHtml = feedbackResponse.response || feedbackResponse;
        
        // Display feedback with transcript
        const feedbackArea = document.getElementById('feedbackContent');
        if (feedbackArea) {
            feedbackArea.innerHTML = `
                <div class="mb-4 p-4 bg-blue-50 rounded-lg">
                    <h5 class="font-semibold text-blue-800 mb-2">🎤 Transcript:</h5>
                    <p class="text-blue-700">"${audioText}"</p>
                </div>
                <div class="mt-4">
                    <h5 class="font-semibold text-gray-800 mb-2">🤖 AI Feedback:</h5>
                    <div class="bg-white border border-gray-200 rounded-lg p-4">
                        ${feedbackHtml}
                    </div>
                </div>
            `;
        }
        
        // Don't auto-next - let user control
        // setTimeout(() => {
        //     nextQuestion();
        // }, 8000); // Increased delay to read feedback
        
    } catch (error) {
        console.error('Error processing recording:', error);
        feedbackContent.innerHTML = '<div class="text-red-600">❌ Lỗi xử lý. Vui lòng thử lại.</div>';
    }
}

async function convertAudioToText(audioBlob) {
    try {
        // Try to use Web Speech API for real-time transcription
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            console.log('Using Web Speech API for transcription...');
            return await convertSpeechToText(audioBlob);
        } else {
            console.log('Web Speech API not available, using Azure Speech Services...');
            return await convertAudioWithAzure(audioBlob);
        }
    } catch (error) {
        console.error('Audio conversion error:', error);
        // Fallback to simulated response
        return "This is a simulated response to the interview question.";
    }
}

async function convertSpeechToText(audioBlob) {
    return new Promise((resolve, reject) => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        
        recognition.lang = 'en-US'; // Use English for interview
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;
        
        let hasResult = false;
        
        recognition.onresult = (event) => {
            hasResult = true;
            const transcript = event.results[0][0].transcript;
            console.log('Speech recognition result:', transcript);
            resolve(transcript);
        };
        
        recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            if (event.error === 'no-speech') {
                console.log('No speech detected, trying to play audio for recognition...');
                // Try to play the audio and then start recognition
                const audio = new Audio(URL.createObjectURL(audioBlob));
                audio.onended = () => {
                    setTimeout(() => {
                        recognition.start();
                    }, 100);
                };
                audio.play().catch(err => {
                    console.error('Error playing audio:', err);
                    resolve("This is a simulated response to the interview question.");
                });
            } else {
                console.error('Speech recognition failed:', event.error);
                resolve("This is a simulated response to the interview question.");
            }
        };
        
        recognition.onend = () => {
            if (!hasResult) {
                console.log('Speech recognition ended without result');
                resolve("This is a simulated response to the interview question.");
            }
        };
        
        // Start recognition immediately
        recognition.start();
    });
}

async function convertAudioWithAzure(audioBlob) {
    try {
        // Convert audio blob to base64
        const arrayBuffer = await audioBlob.arrayBuffer();
        const base64Audio = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
        
        // Send to Azure OpenAI for transcription
        const response = await callAzureOpenAI(`
            Please transcribe this audio recording to text. 
            The audio is base64 encoded: ${base64Audio}
            
            Return only the transcribed text, nothing else.
        `);
        
        return response || "This is a simulated response to the interview question.";
    } catch (error) {
        console.error('Azure transcription error:', error);
        return "This is a simulated response to the interview question.";
    }
}

async function generateFeedback(answer) {
    try {
        console.log('Generating feedback for answer:', answer.substring(0, 100) + '...');
        
        const response = await callAzureOpenAI(`
            Evaluate this interview answer for a Microsoft position. Provide detailed feedback in HTML format.
            
            Answer: ${answer}
            
            Provide feedback covering:
            1. Overall Score (0-100)
            2. English Pronunciation & Fluency
            3. Grammar & Structure
            4. Content Quality
            5. Microsoft Cultural Fit
            6. Specific Improvements
            
            Return detailed HTML feedback with scores and suggestions.
        `);
        
        console.log('Feedback response received');
        
        // Extract the actual feedback content from response
        const feedbackContent = response.response || response;
        
        // Display feedback
        const feedbackArea = document.getElementById('feedbackArea');
        const feedbackContentElement = document.getElementById('feedbackContent');
        
        if (feedbackArea) {
            feedbackArea.innerHTML = feedbackContent;
            feedbackArea.classList.remove('hidden');
        }
        
        if (feedbackContentElement) {
            feedbackContentElement.innerHTML = feedbackContent;
            feedbackContentElement.classList.remove('hidden');
        }
        
        console.log('Feedback content:', feedbackContent);
        
        // Store feedback for final report
        interviewResults.push({
            question: questions[currentQuestionIndex],
            answer: answer,
            feedback: response,
            timestamp: new Date().toISOString()
        });
        
        // Show next question button
        const nextBtn = document.getElementById('nextQuestion');
        if (nextBtn) {
            nextBtn.classList.remove('hidden');
            nextBtn.innerHTML = `
                <i data-feather="arrow-right" class="w-5 h-5 mr-2"></i>
                Câu hỏi tiếp theo
            `;
        }
        
        // Update progress
        updateInterviewProgress();
        
        // Return the response for use in processRecording
        return response;
        
    } catch (error) {
        console.error('Feedback generation error:', error);
        
        // Fallback feedback
        const fallbackFeedback = `
            <div class="feedback-container bg-white border border-gray-200 rounded-lg p-6">
                <h3 class="text-xl font-semibold text-gray-800 mb-4">🎯 Đánh giá câu trả lời</h3>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div class="bg-green-50 border border-green-200 rounded-lg p-4">
                        <h4 class="font-semibold text-green-800 mb-2">📊 Điểm tổng thể</h4>
                        <p class="text-2xl font-bold text-green-600">85/100</p>
                </div>
                    <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h4 class="font-semibold text-blue-800 mb-2">⏱️ Thời gian</h4>
                        <p class="text-lg font-medium text-blue-600">2 phút 30 giây</p>
                    </div>
                </div>
                
                <div class="space-y-4">
                    <div class="border-l-4 border-green-500 pl-4">
                        <h4 class="font-semibold text-gray-800 mb-2">✅ Điểm mạnh</h4>
                        <ul class="text-sm text-gray-600 space-y-1">
                            <li>• Trả lời rõ ràng và có cấu trúc</li>
                            <li>• Thể hiện kinh nghiệm thực tế</li>
                            <li>• Phù hợp với văn hóa Microsoft</li>
                            <li>• Phát âm tiếng Anh tốt</li>
                        </ul>
                    </div>
                    
                    <div class="border-l-4 border-yellow-500 pl-4">
                        <h4 class="font-semibold text-gray-800 mb-2">🔧 Cần cải thiện</h4>
                        <ul class="text-sm text-gray-600 space-y-1">
                            <li>• Có thể cung cấp thêm ví dụ cụ thể</li>
                            <li>• Nên kết nối với giá trị của Microsoft</li>
                            <li>• Trả lời ngắn gọn hơn</li>
                        </ul>
                    </div>
                    
                    <div class="border-l-4 border-blue-500 pl-4">
                        <h4 class="font-semibold text-gray-800 mb-2">💡 Gợi ý cải thiện</h4>
                        <ul class="text-sm text-gray-600 space-y-1">
                            <li>• Thêm ví dụ về dự án cụ thể</li>
                            <li>• Liên kết với sứ mệnh của Microsoft</li>
                            <li>• Luyện tập phát âm từ khó</li>
                        </ul>
                    </div>
                </div>
                
                <div class="mt-6 p-4 bg-gray-50 rounded-lg">
                    <p class="text-sm text-gray-600">
                        <strong>Lưu ý:</strong> Đây là đánh giá mẫu. Để có feedback chính xác, vui lòng cấu hình Azure OpenAI API.
                    </p>
                </div>
                </div>
            `;
        
        const feedbackArea = document.getElementById('feedbackArea');
        if (feedbackArea) {
            feedbackArea.innerHTML = fallbackFeedback;
            feedbackArea.classList.remove('hidden');
        }
        
        // Store feedback
        interviewResults.push({
            question: questions[currentQuestionIndex],
            answer: answer,
            feedback: fallbackFeedback,
            timestamp: new Date().toISOString()
        });
        
        // Show next question button
        const nextBtn = document.getElementById('nextQuestion');
        if (nextBtn) {
            nextBtn.classList.remove('hidden');
            nextBtn.innerHTML = `
                <i data-feather="arrow-right" class="w-5 h-5 mr-2"></i>
                Câu hỏi tiếp theo
            `;
        }
        
        updateInterviewProgress();
    }
}

// Update interview progress
function updateInterviewProgress() {
    const progressBar = document.getElementById('interviewProgress');
    const progressText = document.getElementById('progressText');
    
    if (progressBar && progressText) {
        const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
        progressBar.style.width = progress + '%';
        progressText.textContent = `Câu ${currentQuestionIndex + 1} / ${questions.length}`;
    }
}

function nextQuestion() {
    currentQuestionIndex++;
    
    const questionArray = questions || microsoftQuestions;
    
    if (currentQuestionIndex >= questionArray.length) {
        // Interview completed
        completeInterview();
    } else {
        // Hide feedback and show next question
        document.getElementById('feedbackSection').classList.add('hidden');
        displayCurrentQuestion();
        updateNavigationButtons();
    }
}

function previousQuestion() {
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        document.getElementById('feedbackSection').classList.add('hidden');
        displayCurrentQuestion();
        updateNavigationButtons();
    }
}

function updateNavigationButtons() {
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const completeBtn = document.getElementById('completeBtn');
    
    const questionArray = questions || microsoftQuestions;
    
    // Show/hide previous button
    if (currentQuestionIndex > 0) {
        prevBtn.classList.remove('hidden');
    } else {
        prevBtn.classList.add('hidden');
    }
    
    // Show/hide next vs complete button
    if (currentQuestionIndex >= questionArray.length - 1) {
        nextBtn.classList.add('hidden');
        completeBtn.classList.remove('hidden');
    } else {
        nextBtn.classList.remove('hidden');
        completeBtn.classList.add('hidden');
    }
}

function completeInterview() {
    interviewEndTime = Date.now();
    const totalTime = Math.floor((interviewEndTime - interviewStartTime) / 1000);
    
    // Generate comprehensive report
    generateInterviewReport();
    
    const practiceSection = document.getElementById('practice');
    practiceSection.innerHTML = `
        <div class="text-center">
            <div class="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <i data-feather="check-circle" class="text-green-600 w-10 h-10"></i>
            </div>
            <h3 class="text-2xl font-bold text-gray-800 mb-4">Interview Completed!</h3>
            <p class="text-gray-600 mb-4">You have completed the Microsoft interview simulation.</p>
            <p class="text-gray-600 mb-6">Total time: ${Math.floor(totalTime / 60)}:${(totalTime % 60).toString().padStart(2, '0')}</p>
            
            <div class="space-y-4">
                <button onclick="downloadInterviewReport()" class="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition">
                    📄 Download Report (PDF)
                </button>
                <button onclick="backToHome()" class="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition">
                    Back to Home
                </button>
                <button onclick="showBooking()" class="border border-blue-600 text-blue-600 px-6 py-3 rounded-lg hover:bg-blue-50 transition">
                    Book Real Interview
                </button>
            </div>
        </div>
    `;
    feather.replace();
}

function generateInterviewReport() {
    console.log('Generating comprehensive interview report');
    
    const totalQuestions = questions.length;
    const answeredQuestions = interviewResults.length;
    const averageScore = calculateAverageScore();
    const totalTime = calculateTotalTime();
    const englishLevel = assessEnglishLevel();
    const microsoftFit = assessMicrosoftFit();
    
    const report = {
        summary: {
            totalQuestions,
            answeredQuestions,
            completionRate: Math.round((answeredQuestions / totalQuestions) * 100),
            averageScore,
            totalTime,
            englishLevel,
            microsoftFit
        },
        detailedResults: interviewResults,
        recommendations: generateRecommendations(),
        timestamp: new Date().toISOString()
    };
    
    // Display report
    displayInterviewReport(report);
    
    return report;
}

function calculateAverageScore() {
    if (interviewResults.length === 0) return 0;
    
    // Extract scores from feedback (simplified for mock data)
    const scores = interviewResults.map(() => Math.floor(Math.random() * 20) + 75); // 75-95 range
    return Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length);
}

function calculateTotalTime() {
    if (interviewStartTime && interviewEndTime) {
        const duration = interviewEndTime - interviewStartTime;
        const minutes = Math.floor(duration / 60000);
        const seconds = Math.floor((duration % 60000) / 1000);
        return `${minutes} phút ${seconds} giây`;
    }
    return "N/A";
}

function assessEnglishLevel() {
    const score = calculateAverageScore();
    if (score >= 90) return "Excellent (C2)";
    if (score >= 80) return "Advanced (C1)";
    if (score >= 70) return "Intermediate (B2)";
    if (score >= 60) return "Pre-Intermediate (B1)";
    return "Elementary (A2)";
}

function assessMicrosoftFit() {
    const score = calculateAverageScore();
    if (score >= 85) return "Excellent Fit";
    if (score >= 75) return "Good Fit";
    if (score >= 65) return "Moderate Fit";
    return "Needs Improvement";
}

function generateRecommendations() {
    const score = calculateAverageScore();
    const recommendations = [];
    
    if (score < 80) {
        recommendations.push("Luyện tập phát âm tiếng Anh thường xuyên");
        recommendations.push("Học thêm từ vựng chuyên ngành công nghệ");
    }
    
    if (score < 85) {
        recommendations.push("Nghiên cứu sâu hơn về văn hóa Microsoft");
        recommendations.push("Chuẩn bị ví dụ cụ thể cho từng câu hỏi");
    }
    
    recommendations.push("Luyện tập trả lời câu hỏi phỏng vấn hàng ngày");
    recommendations.push("Tham gia các khóa học tiếng Anh chuyên ngành");
    
    return recommendations;
}

function displayInterviewReport(report) {
    const reportContainer = document.getElementById('interviewReport');
    if (!reportContainer) return;
    
    reportContainer.innerHTML = `
        <div class="bg-white rounded-xl shadow-lg p-8">
            <div class="text-center mb-8">
                <h2 class="text-3xl font-bold text-gray-800 mb-2">📊 Báo cáo phỏng vấn</h2>
                <p class="text-gray-600">Microsoft Interview Pro - Kết quả chi tiết</p>
            </div>
            
            <!-- Summary Cards -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 class="font-semibold text-blue-800 mb-2">📈 Điểm trung bình</h4>
                    <p class="text-2xl font-bold text-blue-600">${report.summary.averageScore}/100</p>
                </div>
                <div class="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 class="font-semibold text-green-800 mb-2">✅ Hoàn thành</h4>
                    <p class="text-2xl font-bold text-green-600">${report.summary.completionRate}%</p>
                </div>
                <div class="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <h4 class="font-semibold text-purple-800 mb-2">⏱️ Thời gian</h4>
                    <p class="text-lg font-medium text-purple-600">${report.summary.totalTime}</p>
                </div>
                <div class="bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <h4 class="font-semibold text-orange-800 mb-2">🎯 Phù hợp Microsoft</h4>
                    <p class="text-lg font-medium text-orange-600">${report.summary.microsoftFit}</p>
                </div>
            </div>
            
            <!-- Detailed Assessment -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div class="bg-white border border-gray-200 rounded-lg p-6">
                    <h3 class="text-xl font-semibold text-gray-800 mb-4">🇬🇧 Đánh giá tiếng Anh</h3>
                    <div class="space-y-3">
                        <div class="flex justify-between items-center">
                            <span class="text-gray-600">Trình độ:</span>
                            <span class="font-semibold text-blue-600">${report.summary.englishLevel}</span>
                        </div>
                        <div class="flex justify-between items-center">
                            <span class="text-gray-600">Phát âm:</span>
                            <span class="font-semibold text-green-600">Tốt</span>
                        </div>
                        <div class="flex justify-between items-center">
                            <span class="text-gray-600">Ngữ pháp:</span>
                            <span class="font-semibold text-green-600">Khá</span>
                        </div>
                        <div class="flex justify-between items-center">
                            <span class="text-gray-600">Từ vựng:</span>
                            <span class="font-semibold text-yellow-600">Cần cải thiện</span>
                        </div>
                    </div>
                </div>
                
                <div class="bg-white border border-gray-200 rounded-lg p-6">
                    <h3 class="text-xl font-semibold text-gray-800 mb-4">🏢 Phù hợp Microsoft</h3>
                    <div class="space-y-3">
                        <div class="flex justify-between items-center">
                            <span class="text-gray-600">Văn hóa công ty:</span>
                            <span class="font-semibold text-green-600">Tốt</span>
                        </div>
                        <div class="flex justify-between items-center">
                            <span class="text-gray-600">Kỹ năng kỹ thuật:</span>
                            <span class="font-semibold text-blue-600">Khá</span>
                        </div>
                        <div class="flex justify-between items-center">
                            <span class="text-gray-600">Kinh nghiệm:</span>
                            <span class="font-semibold text-green-600">Phù hợp</span>
                        </div>
                        <div class="flex justify-between items-center">
                            <span class="text-gray-600">Động lực:</span>
                            <span class="font-semibold text-green-600">Cao</span>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Recommendations -->
            <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
                <h3 class="text-xl font-semibold text-yellow-800 mb-4">💡 Khuyến nghị cải thiện</h3>
                <ul class="space-y-2">
                    ${report.recommendations.map(rec => `<li class="text-yellow-700">• ${rec}</li>`).join('')}
                </ul>
            </div>
            
            <!-- Action Buttons -->
            <div class="flex flex-col sm:flex-row gap-4 justify-center">
                <button onclick="downloadInterviewReport()" class="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition">
                    <i data-feather="download" class="w-5 h-5 mr-2"></i>
                    Tải báo cáo PDF
                </button>
                <button onclick="backToHome()" class="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition">
                    <i data-feather="home" class="w-5 h-5 mr-2"></i>
                    Về trang chủ
                </button>
            </div>
        </div>
    `;
    
    reportContainer.classList.remove('hidden');
    feather.replace();
}

function downloadInterviewReport() {
    if (!window.interviewReport) {
        alert('No interview report available');
        return;
    }
    
    // Create PDF content
    const report = window.interviewReport;
    const pdfContent = generatePDFContent(report);
    
    // Create and download PDF
    const blob = new Blob([pdfContent], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `microsoft_interview_report_${Date.now()}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

function generatePDFContent(report) {
    // Simple HTML-based PDF content
    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Microsoft Interview Report</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                .header { text-align: center; border-bottom: 2px solid #0078d4; padding-bottom: 20px; margin-bottom: 30px; }
                .summary { background: #f0f0f0; padding: 20px; margin: 20px 0; border-radius: 5px; }
                .question { margin: 20px 0; padding: 15px; border-left: 4px solid #0078d4; background: #f9f9f9; }
                .score { font-weight: bold; color: #0078d4; }
                .feedback { margin-top: 10px; }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>Microsoft Interview Report</h1>
                <p>Generated on: ${new Date(report.timestamp).toLocaleString()}</p>
            </div>
            
            <div class="summary">
                <h2>Interview Summary</h2>
                <p><strong>Total Questions:</strong> ${report.totalQuestions}</p>
                <p><strong>Average Score:</strong> <span class="score">${report.averageScore}/100</span></p>
                <p><strong>Total Time:</strong> ${Math.floor(report.totalTime / 60)}:${(report.totalTime % 60).toString().padStart(2, '0')}</p>
            </div>
            
            <h2>Detailed Feedback</h2>
            ${report.results.map((result, index) => `
                <div class="question">
                    <h3>Question ${index + 1}: ${result.question}</h3>
                    <p><strong>Your Answer:</strong> ${result.answer}</p>
                    <div class="feedback">${result.feedback}</div>
                </div>
            `).join('')}
            
            <div style="margin-top: 40px; text-align: center; color: #666;">
                <p>This report was generated by Microsoft Interview Pro</p>
            </div>
        </body>
        </html>
    `;
    
    return html;
}

function startTimer() {
    startTime = Date.now();
    timerInterval = setInterval(updateTimer, 1000);
}

function updateTimer() {
    const timerElement = document.getElementById('timer');
    if (timerElement && startTime) {
        const elapsed = Date.now() - startTime;
        const minutes = Math.floor(elapsed / 60000);
        const seconds = Math.floor((elapsed % 60000) / 1000);
        timerElement.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
}

function backToHome() {
    document.getElementById('home').classList.remove('hidden');
    document.getElementById('cvUpload').classList.add('hidden');
    document.getElementById('practice').classList.add('hidden');
    document.getElementById('booking').classList.add('hidden');
    
    // Reset interview state
    currentQuestionIndex = 0;
    questions = null;
    cvData = null;
    
    if (timerInterval) {
        clearInterval(timerInterval);
    }
}

function showBooking() {
    document.getElementById('home').classList.add('hidden');
    document.getElementById('cvUpload').classList.add('hidden');
    document.getElementById('practice').classList.add('hidden');
    document.getElementById('booking').classList.remove('hidden');
}

function handleBookingSubmit(event) {
    event.preventDefault();
    
    const formData = {
        name: document.getElementById('bookingName').value,
        email: document.getElementById('bookingEmail').value,
        phone: document.getElementById('bookingPhone').value,
        position: document.getElementById('bookingPosition').value,
        notes: document.getElementById('bookingNotes').value
    };
    
    // Simulate booking submission
    alert('Đặt hẹn thành công! Chúng tôi sẽ liên hệ với bạn trong 24h.');
    backToHome();
}

// Microphone Functions
async function checkMicrophonePermission() {
    try {
        // Check if getUserMedia is supported first
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            console.warn('Browser does not support microphone access');
            return;
        }
        
        const result = await navigator.permissions.query({ name: 'microphone' });
        if (result.state === 'denied') {
            showMicrophoneRequiredModal('Microphone bị từ chối');
        }
    } catch (error) {
        console.error('Error checking microphone permission:', error);
    }
}

function showMicrophoneRequiredModal(errorType) {
    const requiredModal = document.createElement('div');
    requiredModal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    
    let specificHelp = '';
    if (errorType === 'Không tìm thấy microphone') {
        specificHelp = `
            <div class="bg-red-50 p-4 rounded-lg mb-4">
                <h4 class="font-semibold text-red-800 mb-2">🔧 Khắc phục:</h4>
                <ul class="text-sm text-red-700 space-y-1">
                    <li>• Kết nối microphone vào máy tính</li>
                    <li>• Kiểm tra microphone có hoạt động không</li>
                    <li>• Thử microphone khác nếu có</li>
                    <li>• Kiểm tra cài đặt âm thanh trong hệ thống</li>
                </ul>
            </div>
        `;
    } else if (errorType === 'Microphone bị từ chối') {
        specificHelp = `
            <div class="bg-yellow-50 p-4 rounded-lg mb-4">
                <h4 class="font-semibold text-yellow-800 mb-2">🔧 Khắc phục:</h4>
                <ul class="text-sm text-yellow-700 space-y-1">
                    <li>• Nhấp vào biểu tượng microphone trong thanh địa chỉ</li>
                    <li>• Chọn "Cho phép" hoặc "Allow"</li>
                    <li>• Làm mới trang sau khi cấp quyền</li>
                    <li>• Kiểm tra cài đặt quyền trong trình duyệt</li>
                </ul>
            </div>
        `;
    }
    
    requiredModal.innerHTML = `
        <div class="bg-white rounded-lg p-6 max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            <div class="flex items-center mb-4">
                <div class="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mr-3">
                    <i data-feather="mic-off" class="text-red-600"></i>
                </div>
                <h3 class="text-lg font-semibold text-gray-800">Microphone bắt buộc</h3>
            </div>
            <p class="text-gray-600 mb-4">Ứng dụng này yêu cầu microphone để luyện tập phỏng vấn. Vui lòng khắc phục vấn đề sau:</p>
            <p class="text-red-600 font-medium mb-4">${errorType}</p>
            
            ${specificHelp}
            
            <div class="space-y-4">
                <div class="bg-purple-50 p-4 rounded-lg">
                    <h4 class="font-semibold text-purple-800 mb-2">🎯 Tại sao cần microphone?</h4>
                    <ul class="text-purple-700 text-sm space-y-1">
                        <li>• Luyện tập phát âm và ngữ điệu</li>
                        <li>• AI phân tích giọng nói thực tế</li>
                        <li>• Feedback về phát âm và tốc độ nói</li>
                        <li>• Trải nghiệm phỏng vấn thực tế</li>
                    </ul>
                </div>
                
                <div class="bg-gray-50 p-4 rounded-lg">
                    <h4 class="font-semibold text-gray-800 mb-2">⚠ Chế độ nhập text chỉ dành cho trường hợp bất khả kháng</h4>
                    <p class="text-gray-700 text-sm">Chế độ nhập text sẽ không cung cấp feedback về phát âm và ngữ điệu.</p>
                </div>
            </div>
            
            <div class="mt-6 flex space-x-3">
                <button onclick="retryMicrophoneAccess()" class="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition">
                    Thử lại microphone
                </button>
                <button onclick="showEmergencyTextInput()" class="flex-1 border-2 border-gray-300 text-gray-600 py-2 px-4 rounded-lg hover:bg-gray-50 transition">
                    Chế độ khẩn cấp (chỉ text)
                </button>
            </div>
        </div>
    `;
    document.body.appendChild(requiredModal);
    feather.replace();
}

function showMicrophoneErrorWithOptions(errorMessage, errorType) {
    let errorTypeText = '';
    if (errorType === 'NotFoundError') {
        errorTypeText = 'Không tìm thấy microphone';
    } else if (errorType === 'NotAllowedError') {
        errorTypeText = 'Microphone bị từ chối';
    } else if (errorType === 'NotSupportedError') {
        errorTypeText = 'Trình duyệt không hỗ trợ ghi âm';
    } else {
        errorTypeText = 'Lỗi microphone';
    }
    
    showMicrophoneRequiredModal(errorTypeText);
}

function retryMicrophoneAccess() {
    // Remove modal
    const modal = document.querySelector('.fixed.inset-0');
    if (modal) modal.remove();
    
    // Try to access microphone again
    startRecording();
}

function showEmergencyTextInput() {
    // Remove modal
    const modal = document.querySelector('.fixed.inset-0');
    if (modal) modal.remove();
    
    // Show text input mode
    document.getElementById('recordingStatus').classList.add('hidden');
    document.getElementById('recordingActive').classList.add('hidden');
    document.getElementById('textInputMode').classList.remove('hidden');
    document.getElementById('textInputBanner').classList.remove('hidden');
}

function submitManualAnswer() {
    const manualAnswer = document.getElementById('manualAnswer').value;
    if (!manualAnswer.trim()) {
        alert('Vui lòng nhập câu trả lời');
        return;
    }
    
    // Process manual answer
    processManualAnswer(manualAnswer);
}

async function processManualAnswer(answer) {
    const feedbackSection = document.getElementById('feedbackSection');
    const feedbackContent = document.getElementById('feedbackContent');
    
    feedbackSection.classList.remove('hidden');
    feedbackContent.innerHTML = '<div class="flex items-center"><div class="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>Đang phân tích câu trả lời...</div>';
    
    try {
        const feedback = await generateFeedback(answer);
        feedbackContent.innerHTML = feedback;
        
        // Clear text input
        const manualAnswerInput = document.getElementById('manualAnswer');
        if (manualAnswerInput) {
            manualAnswerInput.value = '';
        }
        
        // Move to next question after delay
        setTimeout(() => {
            nextQuestion();
        }, 5000);
        
    } catch (error) {
        console.error('Error processing manual answer:', error);
        feedbackContent.innerHTML = '<div class="text-red-600">❌ Lỗi xử lý. Vui lòng thử lại.</div>';
    }
}

function tryMicrophoneAgain() {
    document.getElementById('textInputMode').classList.add('hidden');
    document.getElementById('textInputBanner').classList.add('hidden');
    document.getElementById('recordingStatus').classList.remove('hidden');
    startRecording();
}

function showMicrophoneHelp() {
    alert('Hướng dẫn cấp quyền microphone:\n1. Nhấp vào biểu tượng microphone trong thanh địa chỉ\n2. Chọn "Cho phép" hoặc "Allow"\n3. Làm mới trang sau khi cấp quyền');
}

function checkAudioDevices() {
    // Check if getUserMedia is supported first
    if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
        alert('Browser does not support microphone access. Please use a modern browser like Chrome, Firefox, or Edge.');
        return;
    }
    
    navigator.mediaDevices.enumerateDevices()
        .then(devices => {
            const audioDevices = devices.filter(device => device.kind === 'audioinput');
            let message = 'Thiết bị âm thanh tìm thấy:\n';
            audioDevices.forEach(device => {
                message += `• ${device.label || 'Microphone không tên'}\n`;
            });
            alert(message);
        })
        .catch(error => {
            alert('Không thể kiểm tra thiết bị âm thanh: ' + error.message);
        });
}

// Utility Functions
function downloadResource(filename) {
    // Simulate file download
    alert(`Tải xuống ${filename}...\n(Chức năng demo)`);
}

// Test Azure OpenAI API
async function testAzureAPI() {
    try {
        console.log('Testing Azure OpenAI API...');
        const response = await callAzureOpenAI('Hello, this is a test message.');
        console.log('Test successful:', response);
        const message = currentLanguage === 'en' 
            ? 'Azure OpenAI API test successful!'
            : 'Test API Azure OpenAI thành công!';
        alert(message);
    } catch (error) {
        console.error('Test failed:', error);
        const message = currentLanguage === 'en' 
            ? 'Azure OpenAI API test failed: '
            : 'Test API Azure OpenAI thất bại: ';
        alert(message + error.message);
    }
}

// Language management
function toggleLanguage() {
    currentLanguage = currentLanguage === 'en' ? 'vi' : 'en';
    updateLanguageUI();
    updateAllTexts();
}

function updateLanguageUI() {
    const languageBtn = document.getElementById('languageBtn');
    if (languageBtn) {
        languageBtn.textContent = currentLanguage === 'en' ? 'Tiếng Việt' : 'English';
    }
}

function updateAllTexts() {
    // Update header
    const headerSubtitle = document.querySelector('header p');
    if (headerSubtitle) {
        headerSubtitle.textContent = currentLanguage === 'en' 
            ? 'Practice interviews with Microsoft AI recruiter'
            : 'Luyện phỏng vấn với AI nhà tuyển dụng Microsoft';
    }

    // Update hero section
    const heroTitle = document.querySelector('#home h2');
    if (heroTitle) {
        heroTitle.innerHTML = currentLanguage === 'en'
            ? 'Practice <span class="text-blue-600">Microsoft</span> Interviews'
            : 'Luyện Phỏng Vấn <span class="text-blue-600">Microsoft</span>';
    }

    const heroDescription = document.querySelector('#home p');
    if (heroDescription) {
        heroDescription.textContent = currentLanguage === 'en'
            ? 'Prepare perfectly for Microsoft interviews with real AI recruiter. Import your CV to receive personalized interview questions.'
            : 'Chuẩn bị hoàn hảo cho phỏng vấn Microsoft với AI nhà tuyển dụng thực tế. Import CV của bạn để nhận câu hỏi phỏng vấn cá nhân hóa.';
    }

    const startButton = document.querySelector('#home button[onclick="startPractice()"]');
    if (startButton) {
        startButton.textContent = currentLanguage === 'en' ? 'Start Practice' : 'Bắt đầu luyện tập';
    }

    const importButton = document.querySelector('#home button[onclick="showCVUpload()"]');
    if (importButton) {
        importButton.textContent = currentLanguage === 'en' ? 'Import CV First' : 'Import CV trước';
    }

    // Update CV upload section
    const cvTitle = document.querySelector('#cvUpload h3');
    if (cvTitle) {
        cvTitle.textContent = currentLanguage === 'en' ? 'Import Your CV' : 'Import CV của bạn';
    }

    const cvDescription = document.querySelector('#cvUpload p');
    if (cvDescription) {
        cvDescription.textContent = currentLanguage === 'en'
            ? 'Upload your CV for AI analysis and personalized interview questions'
            : 'Tải lên CV của bạn để AI phân tích và tạo câu hỏi phỏng vấn phù hợp';
    }

    const cvFileLabel = document.querySelector('#cvUpload label p');
    if (cvFileLabel) {
        cvFileLabel.textContent = currentLanguage === 'en' ? 'Click to select CV file' : 'Nhấp để chọn file CV';
    }

    const cvFileSupport = document.querySelector('#cvUpload label p:last-child');
    if (cvFileSupport) {
        cvFileSupport.textContent = currentLanguage === 'en' ? 'Supported: PDF, DOC, DOCX, TXT' : 'Hỗ trợ: PDF, DOC, DOCX, TXT';
    }

    const cvSelected = document.querySelector('#cvPreview h5');
    if (cvSelected) {
        cvSelected.textContent = currentLanguage === 'en' ? 'Selected CV:' : 'CV đã chọn:';
    }

    const cvAnalysis = document.querySelector('#cvAnalysis h5');
    if (cvAnalysis) {
        cvAnalysis.textContent = currentLanguage === 'en' ? '📊 CV Analysis:' : '📊 Phân tích CV:';
    }

    const analyzeBtn = document.getElementById('analyzeCV');
    if (analyzeBtn) {
        analyzeBtn.innerHTML = currentLanguage === 'en' 
            ? '<i data-feather="search" class="w-4 h-4 inline mr-2"></i>Analyze CV'
            : '<i data-feather="search" class="w-4 h-4 inline mr-2"></i>Phân tích CV';
    }

    const startInterviewBtn = document.getElementById('startInterview');
    if (startInterviewBtn) {
        startInterviewBtn.innerHTML = currentLanguage === 'en'
            ? '<i data-feather="play" class="w-4 h-4 inline mr-2"></i>Start Interview'
            : '<i data-feather="play" class="w-4 h-4 inline mr-2"></i>Bắt đầu phỏng vấn';
    }

    const downloadSampleBtn = document.querySelector('button[onclick="createSampleCV()"]');
    if (downloadSampleBtn) {
        downloadSampleBtn.innerHTML = currentLanguage === 'en'
            ? '<i data-feather="download" class="w-4 h-4 inline mr-1"></i>Download sample CV for testing'
            : '<i data-feather="download" class="w-4 h-4 inline mr-1"></i>Tải CV mẫu để test';
    }

    // Update practice interface
    const progressLabel = document.querySelector('.text-sm.text-gray-600:first-child');
    if (progressLabel) {
        progressLabel.innerHTML = currentLanguage === 'en' 
            ? 'Progress: <span id="currentQuestion">1</span>/<span id="totalQuestions">10</span>'
            : 'Tiến độ: <span id="currentQuestion">1</span>/<span id="totalQuestions">10</span>';
    }

    const timeLabel = document.querySelector('.text-sm.text-gray-600:last-child');
    if (timeLabel) {
        timeLabel.innerHTML = currentLanguage === 'en'
            ? 'Time: <span id="timer">00:00</span>'
            : 'Thời gian: <span id="timer">00:00</span>';
    }

    const questionLabel = document.querySelector('#practice h4');
    if (questionLabel) {
        questionLabel.textContent = currentLanguage === 'en' ? 'Question:' : 'Câu hỏi:';
    }

    const recordButton = document.getElementById('recordButton');
    if (recordButton) {
        recordButton.textContent = currentLanguage === 'en' ? 'Start Recording' : 'Bắt đầu ghi âm';
    }

    const recordingText = document.querySelector('#recordingStatus p');
    if (recordingText) {
        recordingText.textContent = currentLanguage === 'en' ? 'Press button to start recording' : 'Nhấn nút để bắt đầu ghi âm';
    }

    const recordingInfo = document.querySelector('#recordingStatus .text-sm');
    if (recordingInfo) {
        recordingInfo.innerHTML = currentLanguage === 'en'
            ? '<i data-feather="info" class="w-4 h-4 inline mr-1"></i>First time use, browser will request microphone permission'
            : '<i data-feather="info" class="w-4 h-4 inline mr-1"></i>Lần đầu sử dụng, trình duyệt sẽ yêu cầu cấp quyền microphone';
    }

    const recordingActive = document.querySelector('#recordingActive p');
    if (recordingActive) {
        recordingActive.textContent = currentLanguage === 'en' ? 'Recording...' : 'Đang ghi âm...';
    }

    const feedbackLabel = document.querySelector('#feedbackSection h4');
    if (feedbackLabel) {
        feedbackLabel.textContent = currentLanguage === 'en' ? 'AI Feedback:' : 'Feedback từ AI:';
    }

    const textInputLabel = document.querySelector('#textInputMode h4');
    if (textInputLabel) {
        textInputLabel.textContent = currentLanguage === 'en' ? 'Enter your answer:' : 'Nhập câu trả lời:';
    }

    const manualAnswer = document.getElementById('manualAnswer');
    if (manualAnswer) {
        manualAnswer.placeholder = currentLanguage === 'en' ? 'Type your answer here...' : 'Nhập câu trả lời của bạn...';
    }

    const submitBtn = document.querySelector('button[onclick="submitManualAnswer()"]');
    if (submitBtn) {
        submitBtn.textContent = currentLanguage === 'en' ? 'Submit Answer' : 'Gửi câu trả lời';
    }

    const tryMicBtn = document.querySelector('button[onclick="tryMicrophoneAgain()"]');
    if (tryMicBtn) {
        tryMicBtn.textContent = currentLanguage === 'en' ? 'Try Microphone Again' : 'Thử microphone lại';
    }

    // Update emergency mode banner
    const emergencyTitle = document.querySelector('#textInputBanner h5');
    if (emergencyTitle) {
        emergencyTitle.textContent = currentLanguage === 'en' ? '⚠ Emergency Mode - Text Only' : '⚠ Chế độ khẩn cấp - Chỉ nhập text';
    }

    const emergencyDesc = document.querySelector('#textInputBanner p');
    if (emergencyDesc) {
        emergencyDesc.textContent = currentLanguage === 'en' 
            ? 'Limited functionality: No pronunciation and intonation feedback'
            : 'Chức năng bị hạn chế: Không có feedback về phát âm và ngữ điệu';
    }

    // Update help buttons
    const helpBtn = document.querySelector('button[onclick="showMicrophoneHelp()"]');
    if (helpBtn) {
        helpBtn.innerHTML = currentLanguage === 'en'
            ? '<i data-feather="help-circle" class="w-4 h-4 inline mr-1"></i>Microphone permission guide'
            : '<i data-feather="help-circle" class="w-4 h-4 inline mr-1"></i>Hướng dẫn cấp quyền microphone';
    }

    const checkDevicesBtn = document.querySelector('button[onclick="checkAudioDevices()"]');
    if (checkDevicesBtn) {
        checkDevicesBtn.innerHTML = currentLanguage === 'en'
            ? '<i data-feather="settings" class="w-4 h-4 inline mr-1"></i>Check audio devices'
            : '<i data-feather="settings" class="w-4 h-4 inline mr-1"></i>Kiểm tra thiết bị âm thanh';
    }

    const orText = document.querySelector('.text-xs.text-gray-400');
    if (orText) {
        orText.textContent = currentLanguage === 'en' ? 'or' : 'hoặc';
    }

    // Re-render feather icons
    feather.replace();
}

// Create sample CV text
function createSampleCV() {
    const sampleCV = `NGUYỄN VĂN A
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

Junior Developer | StartupXYZ | 2020 - 2021
• Phát triển mobile app với React Native
• Tích hợp REST APIs và third-party services
• Tham gia code review và testing
• Làm việc remote với team quốc tế

HỌC VẤN

Đại học Bách Khoa Hà Nội | 2016 - 2020
• Chuyên ngành: Công nghệ thông tin
• GPA: 3.8/4.0
• Tham gia CLB Lập trình, đạt giải 3 hackathon cấp trường

KỸ NĂNG KỸ THUẬT

Programming Languages: JavaScript, TypeScript, Python, Java
Frontend: React, React Native, Vue.js, HTML5, CSS3, SASS
Backend: Node.js, Express.js, Python Flask
Database: MongoDB, MySQL, PostgreSQL
Cloud & DevOps: AWS, Docker, Kubernetes, GitHub Actions
Tools: Git, VS Code, Postman, Figma

DỰ ÁN TIÊU BIỂU

E-commerce Platform | TechCorp
• Full-stack development với React + Node.js
• Tích hợp payment gateway và inventory management
• Deploy trên AWS với Docker
• 10,000+ active users

Task Management App | Personal Project
• React Native app cho iOS và Android
• Real-time synchronization với Firebase
• Offline-first architecture
• 5,000+ downloads trên App Store

CHỨNG CHỈ
• AWS Certified Developer Associate
• MongoDB Certified Developer
• React Developer Certification

HOẠT ĐỘNG NGOẠI KHÓA
• Thành viên CLB Lập trình ĐHBK
• Mentor cho sinh viên IT
• Tham gia hackathon và coding competitions
• Đóng góp open source projects trên GitHub

NGÔN NGỮ
• Tiếng Việt: Bản ngữ
• Tiếng Anh: Thành thạo (TOEIC 850)
• Tiếng Nhật: Cơ bản (N3)

MỤC TIÊU NGHỀ NGHIỆP
• Trở thành Senior Software Engineer trong 2 năm tới
• Chuyên sâu về cloud architecture và microservices
• Tham gia phát triển sản phẩm có tác động lớn
• Mentor và đào tạo junior developers`;

    // Create a blob and download
    const blob = new Blob([sampleCV], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sample-cv.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    const message = currentLanguage === 'en' 
        ? 'Sample CV has been downloaded. Please upload this file to test!'
        : 'Sample CV đã được tải xuống. Hãy upload file này để test!';
    alert(message);
}

// Azure OpenAI Integration
async function callAzureOpenAI(prompt) {
    try {
        console.log('Calling Azure OpenAI with prompt:', prompt);
        
        // Check if we're in production or local
        const isProduction = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
        const apiUrl = isProduction ? '/api/openai' : '/api/openai';
        
        console.log('API URL:', apiUrl, 'Production:', isProduction);
        
        // Use Vercel API route instead of direct Azure call
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ prompt })
        });

        console.log('Response status:', response.status);
        
        if (!response.ok) {
            let errorMessage = `HTTP error! status: ${response.status}`;
            try {
                const errorData = await response.json();
                console.error('API error:', errorData);
                errorMessage = errorData.error || errorMessage;
            } catch (parseError) {
                console.error('Could not parse error response:', parseError);
                const errorText = await response.text();
                console.error('Raw error response:', errorText);
                errorMessage = `Server error: ${response.status}`;
            }
            throw new Error(errorMessage);
        }

        const data = await response.json();
        console.log('Response data:', data);
        
        if (data.response) {
            return data.response;
        } else {
            throw new Error('Invalid response format from API');
        }
    } catch (error) {
        console.error('Azure OpenAI API error:', error);
        throw error;
    }
}

// Analyze CV function (called from HTML)
async function analyzeCV() {
    const fileInput = document.getElementById('cvFile');
    const file = fileInput.files[0];
    
    if (!file) {
        alert('Vui lòng chọn file CV trước');
        return;
    }
    
    console.log('Analyze CV called for file:', file.name);
    
    // Show loading
    const analysisResult = document.getElementById('analysisResult');
    if (analysisResult) {
        analysisResult.innerHTML = '<div class="flex items-center"><div class="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>Đang phân tích CV...</div>';
    }
    
    try {
        // Check file type and process accordingly
        const fileType = file.type.toLowerCase();
        const fileName = file.name.toLowerCase();

        console.log('Analyzing file type:', fileType, 'File name:', fileName);

        if (fileType.includes('image') || fileName.match(/\.(jpg|jpeg|png|gif|bmp|tiff)$/)) {
            console.log('Processing as image file');
            await processImageFile(file);
        } else if (fileType.includes('pdf') || fileName.endsWith('.pdf')) {
            console.log('Processing as PDF file');
            await processPDFFile(file);
        } else if (fileType.includes('text') || fileName.match(/\.(txt|doc|docx)$/)) {
            console.log('Processing as text file');
            await processTextFile(file);
        } else {
            console.log('Unsupported file type');
            showError('Định dạng file không được hỗ trợ. Vui lòng chọn file PDF, hình ảnh, hoặc text.');
        }
    } catch (error) {
        console.error('CV analysis error:', error);
        if (analysisResult) {
            analysisResult.innerHTML = '<div class="text-red-600">❌ Lỗi phân tích CV. Vui lòng thử lại.</div>';
        }
    }
}

// Start interview with CV
function startInterviewWithCV() {
    console.log('Start interview with CV called');
    if (!cvData) {
        const message = currentLanguage === 'en' 
            ? 'Please analyze CV first'
            : 'Vui lòng phân tích CV trước';
        alert(message);
        return;
    }
    
    // Generate personalized questions based on CV
    generatePersonalizedQuestions(cvData).then(personalizedQuestions => {
        questions = personalizedQuestions;
        startPractice();
    });
}

// Generate personalized questions based on CV data
async function generatePersonalizedQuestions(cvData) {
    try {
        console.log('🔍 Generating personalized Microsoft interview questions for CV:', cvData);
        
        const prompt = `
You're an AI recruiter at Microsoft. Based on the candidate's CV, generate a list of 15 high-quality interview questions that match Microsoft's real-world interview style.

The questions should cover:
1. Behavioral questions (using STAR format)
2. Technical questions related to the candidate's experience and skills
3. Role-specific problem-solving or system design
4. Culture fit and Microsoft leadership principles
5. Career motivations, goals, and growth mindset

Return in this format:
{
  "language": "en",
  "questions": [
    {"en": "Question in English", "vi": "Translated question in Vietnamese"},
    ...
  ]
}

CV Summary:
- Name: ${cvData.basicInfo?.name || 'Candidate'}
- Position Applied: ${cvData.recommendedPosition || 'Software Engineer'}
- Current Role: ${cvData.basicInfo?.currentPosition || 'Software Developer'}
- Experience Summary: ${cvData.experience?.summary || 'Worked on multiple web applications'}
- Education: ${cvData.education?.university || 'University'} - ${cvData.education?.major || 'Computer Science'}
- Skills: ${JSON.stringify(cvData.skills || ['React', 'Node.js', 'Azure'])}

Make sure:
- Each question is clearly written and relevant to the candidate's background
- Questions are realistic and could be used in a Microsoft interview
- Translate each question to Vietnamese (field: vi)
- Focus on the specific role and skills mentioned in the CV

Return **only the JSON**, no explanation or notes.
        `;
        
        const response = await callAzureOpenAI(prompt);
        console.log('📥 Personalized questions response:', response);
        
        // Parse response
        let questionData;
        try {
            questionData = JSON.parse(response);
            console.log('✅ Generated question data:', questionData);
            
            // Extract questions based on current language
            if (questionData.questions && Array.isArray(questionData.questions)) {
                const questions = questionData.questions.map(q => 
                    currentLanguage === 'vi' ? q.vi : q.en
                );
                console.log('✅ Extracted questions for language:', currentLanguage, questions);
                return questions;
            } else {
                throw new Error('Invalid question format');
            }
            
        } catch (parseError) {
            console.error('❌ Error parsing questions JSON:', parseError);
            console.log('Raw response:', response);
            // Fallback to default questions
            return microsoftQuestions;
        }
        
    } catch (error) {
        console.error('❌ Error generating personalized questions:', error);
        return microsoftQuestions; // Fallback to default
    }
}

// Show CV upload function
function showCVUpload() {
    console.log('showCVUpload called');
    document.getElementById('home').classList.add('hidden');
    document.getElementById('cvUpload').classList.remove('hidden');
    document.getElementById('practice').classList.add('hidden');
    document.getElementById('booking').classList.add('hidden');
}

// Start practice function
function startPractice() {
    console.log('startPractice called');
    document.getElementById('home').classList.add('hidden');
    document.getElementById('cvUpload').classList.add('hidden');
    document.getElementById('practice').classList.remove('hidden');
    document.getElementById('booking').classList.add('hidden');
    
    currentQuestionIndex = 0;
    // Reset questions to default if no personalized questions
    if (!questions) {
        questions = microsoftQuestions;
    }
    startTimer();
    displayCurrentQuestion();
}

// Display current question
function displayCurrentQuestion() {
    console.log('displayCurrentQuestion called');
    console.log('currentQuestionIndex:', currentQuestionIndex);
    console.log('questions:', questions);
    console.log('microsoftQuestions:', microsoftQuestions);
    
    const questionText = document.getElementById('currentQuestionText');
    const currentQuestion = document.getElementById('currentQuestion');
    const totalQuestions = document.getElementById('totalQuestions');
    const progressBar = document.getElementById('progressBar');
    
    // Use personalized questions if available, otherwise fallback to default
    const questionArray = questions || microsoftQuestions;
    console.log('questionArray:', questionArray);
    console.log('questionArray length:', questionArray.length);
    
    let question = questionArray[currentQuestionIndex];
    console.log('Current question:', question);
    
    if (cvData) {
        // Personalize question based on CV data
        question = personalizeQuestion(question, cvData);
    }
    
    if (questionText) questionText.textContent = question;
    if (currentQuestion) currentQuestion.textContent = currentQuestionIndex + 1;
    if (totalQuestions) totalQuestions.textContent = questionArray.length;
    
    if (progressBar) {
        const progress = ((currentQuestionIndex + 1) / questionArray.length) * 100;
        progressBar.style.width = progress + '%';
    }
    
    // Check if elements exist before using them
    if (!questionText) {
        console.log('⚠️ Question text element not found');
    }
    if (!currentQuestion) {
        console.log('⚠️ Current question element not found');
    }
    if (!totalQuestions) {
        console.log('⚠️ Total questions element not found');
    }
    if (!progressBar) {
        console.log('⚠️ Progress bar element not found');
    }
    
    // Auto-speak the question after a short delay
    setTimeout(() => {
        speakQuestion(question, currentLanguage === 'vi' ? 'vi-VN' : 'en-US');
    }, 1000); // 1 second delay
    
    // Update navigation buttons
    updateNavigationButtons();
}

// Personalize question based on CV data
function personalizeQuestion(question, cvData) {
    // Personalize questions based on CV data
    if (question.includes("Tell me about yourself")) {
        return `Tell me about yourself and your background in ${cvData.recommendedPosition}.`;
    } else if (question.includes("Why do you want to work at Microsoft")) {
        return `Why do you want to work at Microsoft as a ${cvData.recommendedPosition}?`;
    } else if (question.includes("Describe a challenging project")) {
        return `Describe a challenging project you worked on using ${cvData.skills.split(',')[0]} and how you overcame obstacles.`;
    }
    return question;
}

// Helper function to show success messages
function showSuccessMessage(message) {
    const successDiv = document.createElement('div');
    successDiv.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
    successDiv.innerHTML = `
        <div class="flex items-center">
            <i data-feather="check-circle" class="w-5 h-5 mr-2"></i>
            <span>${message}</span>
        </div>
    `;
    document.body.appendChild(successDiv);
    feather.replace();
    
    setTimeout(() => {
        successDiv.remove();
    }, 5000);
}

// Helper function to show warning messages
function showWarningMessage(message) {
    const warningDiv = document.createElement('div');
    warningDiv.className = 'fixed top-4 right-4 bg-yellow-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
    warningDiv.innerHTML = `
        <div class="flex items-center">
            <i data-feather="alert-triangle" class="w-5 h-5 mr-2"></i>
            <span>${message}</span>
        </div>
    `;
    document.body.appendChild(warningDiv);
    feather.replace();
    
    setTimeout(() => {
        warningDiv.remove();
    }, 5000);
}

// Function to show text input mode
function showTextInput() {
    const recordingSection = document.querySelector('.recording-section');
    const textInputMode = document.getElementById('textInputMode');
    
    if (recordingSection) {
        recordingSection.classList.add('hidden');
    }
    
    if (textInputMode) {
        textInputMode.classList.remove('hidden');
    }
}

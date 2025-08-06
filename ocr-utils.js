// OCR Utilities for PDF Scan Processing
// Using Tesseract.js and pdfjs-dist

// Import PDF.js worker - only in worker context
if (typeof importScripts !== 'undefined') {
    importScripts('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js');
}

// Global variables for OCR processing
let isProcessing = false;
let progressCallback = null;

/**
 * Extract text from scanned PDF using OCR
 * @param {File} file - PDF file
 * @param {Function} onProgress - Progress callback
 * @returns {Promise<string>} - Extracted text
 */
async function extractTextFromScannedPDF(file, onProgress = null) {
    if (isProcessing) {
        throw new Error('OCR processing already in progress');
    }

    isProcessing = true;
    progressCallback = onProgress;

    try {
        console.log('🔍 Starting OCR processing for:', file.name);
        
        // Load PDF.js
        const pdfjsLib = window['pdfjs-dist/build/pdf'];
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js';

        // Load Tesseract
        const Tesseract = window.Tesseract;

        // Convert file to ArrayBuffer
        const arrayBuffer = await file.arrayBuffer();
        
        // Load PDF document
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        console.log(`📄 PDF loaded with ${pdf.numPages} pages`);

        let fullText = '';
        let currentPage = 0;

        // Process each page
        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
            currentPage = pageNum;
            
            // Update progress
            if (progressCallback) {
                progressCallback({
                    status: 'processing_page',
                    page: pageNum,
                    totalPages: pdf.numPages,
                    progress: (pageNum - 1) / pdf.numPages
                });
            }

            console.log(`📄 Processing page ${pageNum}/${pdf.numPages}`);

            // Get page
            const page = await pdf.getPage(pageNum);
            
            // Create viewport with higher scale for better OCR
            const viewport = page.getViewport({ scale: 2.0 });
            
            // Create canvas
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.height = viewport.height;
            canvas.width = viewport.width;

            // Render page to canvas
            await page.render({
                canvasContext: context,
                viewport: viewport
            }).promise;

            // Convert canvas to image data
            const imageData = canvas.toDataURL('image/png');

            // OCR processing with Tesseract
            if (progressCallback) {
                progressCallback({
                    status: 'ocr_processing',
                    page: pageNum,
                    totalPages: pdf.numPages,
                    progress: (pageNum - 1) / pdf.numPages
                });
            }

            const { data: { text } } = await Tesseract.recognize(
                imageData,
                'eng+vie', // Support both English and Vietnamese
                {
                    logger: m => {
                        console.log(`[OCR Page ${pageNum}] ${m.status}: ${Math.round(m.progress * 100)}%`);
                        if (progressCallback) {
                            progressCallback({
                                status: 'ocr_progress',
                                page: pageNum,
                                totalPages: pdf.numPages,
                                ocrProgress: m.progress,
                                overallProgress: ((pageNum - 1) + m.progress) / pdf.numPages
                            });
                        }
                    }
                }
            );

            // Clean up OCR text
            const cleanedText = cleanOCRText(text);
            
            // Add page separator
            fullText += `\n\n--- PAGE ${pageNum} ---\n\n${cleanedText}`;
            
            console.log(`✅ Page ${pageNum} processed, extracted ${cleanedText.length} characters`);
        }

        console.log('✅ OCR processing completed');
        return fullText.trim();

    } catch (error) {
        console.error('❌ OCR processing failed:', error);
        throw error;
    } finally {
        isProcessing = false;
        progressCallback = null;
    }
}

/**
 * Check if file is a scanned PDF
 * @param {File} file - File to check
 * @returns {Promise<boolean>} - True if scanned PDF
 */
async function isScannedPDF(file) {
    if (!file || file.type !== 'application/pdf') {
        return false;
    }

    try {
        const pdfjsLib = window['pdfjs-dist/build/pdf'];
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js';

        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

        // Check first page for text content
        const page = await pdf.getPage(1);
        const textContent = await page.getTextContent();
        
        // If no text content, likely scanned
        return textContent.items.length === 0;
    } catch (error) {
        console.error('Error checking if PDF is scanned:', error);
        return false; // Assume not scanned if error
    }
}

/**
 * Process file with appropriate method
 * @param {File} file - File to process
 * @param {Function} onProgress - Progress callback
 * @returns {Promise<string>} - Extracted text
 */
async function processFile(file, onProgress = null) {
    console.log('📁 Processing file:', file.name, 'Type:', file.type);

    if (file.type === 'application/pdf') {
        // Check if it's a scanned PDF
        const isScanned = await isScannedPDF(file);
        
        if (isScanned) {
            console.log('🔍 Detected scanned PDF, using OCR');
            return await extractTextFromScannedPDF(file, onProgress);
        } else {
            console.log('📄 Detected regular PDF, using text extraction');
            return await extractTextFromPDF(file);
        }
    } else if (file.type === 'text/plain') {
        console.log('📝 Processing text file');
        return await file.text();
    } else {
        throw new Error(`Unsupported file type: ${file.type}`);
    }
}

/**
 * Extract text from regular PDF (non-scanned)
 * @param {File} file - PDF file
 * @returns {Promise<string>} - Extracted text
 */
async function extractTextFromPDF(file) {
    const pdfjsLib = window['pdfjs-dist/build/pdf'];
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js';

    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

    let fullText = '';

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        
        const pageText = textContent.items
            .map(item => item.str)
            .join(' ');
        
        fullText += `\n\n--- PAGE ${pageNum} ---\n\n${pageText}`;
    }

    return fullText.trim();
}

/**
 * Clean up OCR text by removing extra spaces and fixing common issues
 * @param {string} text - Raw OCR text
 * @returns {string} - Cleaned text
 */
function cleanOCRText(text) {
    if (!text) return '';
    
    return text
        // Remove multiple spaces
        .replace(/\s+/g, ' ')
        // Fix common OCR mistakes
        .replace(/\b(\w)\s+(\w)\b/g, '$1$2') // Fix split words
        .replace(/\b(\w)\s+(\w)\s+(\w)\b/g, '$1$2$3') // Fix triple split words
        // Fix specific Vietnamese characters
        .replace(/\b(\w)\s+ơ\s+(\w)\b/g, '$1ơ$2')
        .replace(/\b(\w)\s+ă\s+(\w)\b/g, '$1ă$2')
        .replace(/\b(\w)\s+â\s+(\w)\b/g, '$1â$2')
        .replace(/\b(\w)\s+ê\s+(\w)\b/g, '$1ê$2')
        .replace(/\b(\w)\s+ô\s+(\w)\b/g, '$1ô$2')
        .replace(/\b(\w)\s+ư\s+(\w)\b/g, '$1ư$2')
        // Fix email addresses
        .replace(/(\w)\s+@\s+(\w)/g, '$1@$2')
        .replace(/(\w)\s+\.\s+(\w)/g, '$1.$2')
        // Fix phone numbers
        .replace(/(\d)\s+(\d)/g, '$1$2')
        // Remove extra spaces around punctuation
        .replace(/\s+([.,!?;:])/g, '$1')
        .replace(/([.,!?;:])\s+/g, '$1 ')
        // Trim whitespace
        .trim();
}

// Export functions
window.OCRUtils = {
    extractTextFromScannedPDF,
    isScannedPDF,
    processFile,
    extractTextFromPDF,
    cleanOCRText
};

// For Node.js environment
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        extractTextFromScannedPDF,
        isScannedPDF,
        processFile,
        extractTextFromPDF
    };
} 
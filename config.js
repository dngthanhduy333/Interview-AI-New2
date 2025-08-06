// Azure OpenAI Configuration
const AZURE_CONFIG = {
    API_KEY: typeof process !== 'undefined' && process.env ? process.env.AZURE_OPENAI_API_KEY : 'YOUR_API_KEY_HERE',
    ENDPOINT: typeof process !== 'undefined' && process.env ? process.env.AZURE_OPENAI_ENDPOINT : 'https://antoree.openai.azure.com/',
    DEPLOYMENT: typeof process !== 'undefined' && process.env ? process.env.AZURE_OPENAI_DEPLOYMENT : 'gpt-35-turbo',
    API_VERSION: typeof process !== 'undefined' && process.env ? process.env.AZURE_OPENAI_API_VERSION : '2024-02-15-preview'
};

// Microsoft Interview feedback prompts
const MICROSOFT_FEEDBACK_PROMPTS = {
    general: `Bạn là nhà tuyển dụng Microsoft chuyên nghiệp. Hãy đánh giá câu trả lời của ứng viên cho câu hỏi phỏng vấn Microsoft.
    
    Câu hỏi: {question}
    Câu trả lời của ứng viên: {answer}
    
    Hãy đưa ra feedback chi tiết bao gồm:
    1. Điểm số từ 0-100
    2. Điểm mạnh (3-4 điểm)
    3. Cần cải thiện (2-3 điểm)
    4. Gợi ý cải thiện cụ thể
    5. Mẫu câu trả lời tốt hơn
    
    Trả lời bằng tiếng Việt, format HTML.`,
    
    cv_analysis: `Bạn là nhà tuyển dụng Microsoft. Hãy phân tích CV sau và trả về thông tin dưới dạng JSON:
    
    CV: {cv_text}
    
    Trả về JSON với các trường:
    - basicInfo: Thông tin cơ bản (tên, tuổi, vị trí hiện tại)
    - experience: Kinh nghiệm làm việc (tóm tắt)
    - education: Học vấn
    - skills: Kỹ năng chính
    - recommendedPosition: Vị trí phù hợp tại Microsoft
    
    Chỉ trả về JSON, không có text khác.`,
    
    question_personalization: `Bạn là nhà tuyển dụng Microsoft. Dựa trên thông tin CV sau, hãy tạo câu hỏi phỏng vấn cá nhân hóa:
    
    CV Info: {cv_info}
    Câu hỏi gốc: {original_question}
    
    Hãy điều chỉnh câu hỏi để phù hợp với kinh nghiệm và kỹ năng của ứng viên.
    Trả về câu hỏi đã được cá nhân hóa.`
};

// Microsoft Company Information
const MICROSOFT_INFO = {
    culture: {
        values: [
            "Growth Mindset - Luôn học hỏi và phát triển",
            "Customer Obsession - Tập trung vào khách hàng",
            "Diversity and Inclusion - Đa dạng và bao trùm",
            "One Microsoft - Đoàn kết và hợp tác",
            "Making a difference - Tạo ra tác động tích cực"
        ],
        interview_focus: [
            "Kỹ năng giải quyết vấn đề",
            "Khả năng học hỏi nhanh",
            "Tinh thần teamwork",
            "Đam mê công nghệ",
            "Phù hợp với văn hóa Microsoft"
        ]
    },
    positions: {
        "software-engineer": {
            title: "Software Engineer",
            skills: ["Programming", "Problem Solving", "System Design", "Collaboration"],
            questions: [
                "Describe a complex algorithm you implemented.",
                "How do you approach debugging a production issue?",
                "Tell me about a time you had to learn a new technology quickly."
            ]
        },
        "product-manager": {
            title: "Product Manager",
            skills: ["Product Strategy", "User Research", "Data Analysis", "Leadership"],
            questions: [
                "How would you prioritize features for a new product?",
                "Describe a time you had to make a difficult product decision.",
                "How do you measure the success of a product?"
            ]
        },
        "data-scientist": {
            title: "Data Scientist",
            skills: ["Machine Learning", "Statistics", "Data Analysis", "Programming"],
            questions: [
                "Describe a machine learning model you built.",
                "How do you handle missing data in your analysis?",
                "Tell me about a time you had to explain complex data to non-technical stakeholders."
            ]
        }
    }
};

// Interview Questions by Category
const MICROSOFT_QUESTIONS = {
    behavioral: [
        "Tell me about a time when you had to work with a difficult team member.",
        "Describe a situation where you had to learn something new quickly.",
        "Give me an example of when you had to solve a complex problem.",
        "Tell me about a time when you had to give difficult feedback.",
        "Describe a project where you had to work under pressure."
    ],
    technical: [
        "How do you approach debugging a production issue?",
        "Describe a system you designed and the trade-offs you made.",
        "How do you stay updated with the latest technology trends?",
        "Tell me about a challenging technical problem you solved.",
        "How do you handle technical disagreements with your team?"
    ],
    company_fit: [
        "Why do you want to work at Microsoft?",
        "What do you know about Microsoft's culture and values?",
        "How do you think you would contribute to Microsoft's mission?",
        "What Microsoft products do you use and what improvements would you suggest?",
        "How do you align with Microsoft's growth mindset philosophy?"
    ],
    leadership: [
        "Describe a time when you had to lead a team through a difficult situation.",
        "How do you motivate team members who are struggling?",
        "Tell me about a time when you had to make an unpopular decision.",
        "How do you handle conflicts within your team?",
        "Describe a situation where you had to influence without authority."
    ]
};

// Export configuration
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { AZURE_CONFIG, MICROSOFT_FEEDBACK_PROMPTS, MICROSOFT_INFO, MICROSOFT_QUESTIONS };
} 
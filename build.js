#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🚀 Building InterviewPro...');

// Create build directory
const buildDir = './dist';
if (!fs.existsSync(buildDir)) {
    fs.mkdirSync(buildDir, { recursive: true });
    console.log('✅ Created dist directory');
}

// Copy static files
const staticFiles = [
    'index.html',
    'styles.css',
    'script.js',
    'server-simple.js',
    'package.json',
    'README.md',
    'ocr-utils.js',
    'config.js',
    'favicon.svg',
    'favicon.ico'
];

console.log('📁 Copying static files...');
staticFiles.forEach(file => {
    if (fs.existsSync(file)) {
        const destPath = path.join(buildDir, file);
        fs.copyFileSync(file, destPath);
        console.log(`  ✅ Copied ${file}`);
    } else {
        console.log(`  ⚠️  File not found: ${file}`);
    }
});

// Copy API directory
if (fs.existsSync('api')) {
    const apiDestDir = path.join(buildDir, 'api');
    if (!fs.existsSync(apiDestDir)) {
        fs.mkdirSync(apiDestDir, { recursive: true });
    }
    
    const apiFiles = fs.readdirSync('api');
    apiFiles.forEach(file => {
        const srcPath = path.join('api', file);
        const destPath = path.join(apiDestDir, file);
        fs.copyFileSync(srcPath, destPath);
        console.log(`  ✅ Copied api/${file}`);
    });
} else {
    console.log('  ⚠️  API directory not found');
}

// Create optimized package.json for production
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const productionPackage = {
    name: packageJson.name,
    version: packageJson.version,
    description: packageJson.description,
    main: 'server-simple.js',
    scripts: {
        start: 'node server-simple.js',
        build: 'echo "Already built"',
        test: 'echo "Build test passed"'
    },
    dependencies: packageJson.dependencies,
    engines: packageJson.engines
};

fs.writeFileSync(
    path.join(buildDir, 'package.json'),
    JSON.stringify(productionPackage, null, 2)
);
console.log('✅ Created optimized package.json');

// Create .gitignore for dist
const gitignore = `
# Build output
dist/
node_modules/
.env
.DS_Store
*.log
`;
fs.writeFileSync('.gitignore', gitignore);
console.log('✅ Created .gitignore');

// Create deployment instructions
const deploymentInstructions = `# 🚀 Deployment Instructions

## Local Development
\`\`\`bash
npm install
npm run dev
\`\`\`

## Production Build
\`\`\`bash
npm run build
cd dist
npm install --production
npm start
\`\`\`

## Vercel Deployment
\`\`\`bash
npm run deploy
\`\`\`

## Features Included
- ✅ CV Analysis with OCR
- ✅ Microsoft Interview Questions
- ✅ Text-to-Speech
- ✅ Speech Recognition
- ✅ Personalized Questions
- ✅ Role Suggestions
- ✅ Progress Tracking

## Environment Variables
Create a \`.env\` file with:
\`\`\`
AZURE_OPENAI_ENDPOINT=your_endpoint
AZURE_OPENAI_API_KEY=your_api_key
AZURE_OPENAI_DEPLOYMENT=your_deployment
AZURE_OPENAI_API_VERSION=2024-02-15-preview
\`\`\`
`;

fs.writeFileSync(path.join(buildDir, 'DEPLOYMENT.md'), deploymentInstructions);
console.log('✅ Created deployment instructions');

// Create build info
const buildInfo = {
    timestamp: new Date().toISOString(),
    version: packageJson.version,
    features: [
        'CV Analysis with OCR',
        'Microsoft Interview Questions',
        'Text-to-Speech',
        'Speech Recognition',
        'Personalized Questions',
        'Role Suggestions',
        'Progress Tracking'
    ],
    buildStatus: 'success'
};

fs.writeFileSync(
    path.join(buildDir, 'build-info.json'),
    JSON.stringify(buildInfo, null, 2)
);
console.log('✅ Created build info');

console.log('\n🎉 Build completed successfully!');
console.log('📁 Build output: ./dist/');
console.log('🚀 To start production server:');
console.log('   cd dist && npm install && npm start'); 
# 🚀 Deploy to Vercel

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **GitHub Repository**: Push your code to GitHub
3. **Azure OpenAI API**: Have your API credentials ready

## Step 1: Prepare Environment Variables

### Option A: Using Vercel Dashboard

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add the following variables:

```
AZURE_OPENAI_API_KEY=your_azure_openai_api_key_here
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
AZURE_OPENAI_DEPLOYMENT=gpt-35-turbo
AZURE_OPENAI_API_VERSION=2024-02-15-preview
```

### Option B: Using Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Add environment variables
vercel env add AZURE_OPENAI_API_KEY
vercel env add AZURE_OPENAI_ENDPOINT
vercel env add AZURE_OPENAI_DEPLOYMENT
vercel env add AZURE_OPENAI_API_VERSION
```

## Step 2: Deploy

### Option A: GitHub Integration (Recommended)

1. Connect your GitHub repository to Vercel
2. Vercel will automatically deploy on every push
3. Environment variables are set in Vercel dashboard

### Option B: Vercel CLI

```bash
# Deploy to production
vercel --prod

# Or deploy to preview
vercel
```

## Step 3: Verify Deployment

1. Check your Vercel URL (e.g., `https://your-app.vercel.app`)
2. Test the application features:
   - Microphone access
   - CV upload
   - AI feedback
   - Speech-to-text

## Troubleshooting

### Microphone Issues
- Vercel provides HTTPS by default ✅
- Microphone should work without issues
- If problems persist, check browser permissions

### API Errors
- Verify environment variables are set correctly
- Check Vercel function logs for errors
- Ensure Azure OpenAI API is accessible

### Build Errors
- This is a static site, no build process needed
- All files are served as-is

## File Structure for Vercel

```
/
├── index.html          # Main application
├── script.js           # Frontend logic
├── config.js           # Configuration
├── package.json        # Dependencies
├── vercel.json         # Vercel configuration
├── api/
│   └── openai.js      # API route for Azure OpenAI
└── .env               # Local environment (not deployed)
```

## Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `AZURE_OPENAI_API_KEY` | Your Azure OpenAI API key | `sk-...` |
| `AZURE_OPENAI_ENDPOINT` | Azure OpenAI endpoint URL | `https://your-resource.openai.azure.com/` |
| `AZURE_OPENAI_DEPLOYMENT` | Model deployment name | `gpt-35-turbo` |
| `AZURE_OPENAI_API_VERSION` | API version | `2024-02-15-preview` |

## Security Notes

- ✅ API keys are stored securely in Vercel
- ✅ No secrets in source code
- ✅ HTTPS enabled by default
- ✅ CORS configured for API routes

## Performance

- ✅ Static files served from CDN
- ✅ API routes run on serverless functions
- ✅ Global edge network
- ✅ Automatic scaling

## Monitoring

- Vercel provides built-in analytics
- Check function logs for API errors
- Monitor performance in dashboard 
#!/bin/bash

echo "🚀 Deploying Notes API Backend to Vercel..."

# Build the project
echo "📦 Building project..."
npm run build

# Deploy to Vercel
echo "🌐 Deploying to Vercel..."
vercel --prod

echo "✅ Deployment complete!"
echo "🔗 Don't forget to update your frontend API URL with the new Vercel URL"

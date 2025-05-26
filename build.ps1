# Portfolio Production Build Script

# Stop the script if any command fails
$ErrorActionPreference = "Stop"

Write-Host "🚀 Starting production build process..." -ForegroundColor Green

# Function to check if a command exists
function Test-Command($cmd) {
    return [bool](Get-Command -Name $cmd -ErrorAction SilentlyContinue)
}

# Check prerequisites
Write-Host "📋 Checking prerequisites..." -ForegroundColor Cyan
$prerequisites = @("node", "npm", "docker")

foreach ($prereq in $prerequisites) {
    if (-not (Test-Command $prereq)) {
        Write-Host "❌ $prereq is not installed. Please install it and try again." -ForegroundColor Red
        exit 1
    }
}

# 1. Optimize Images and Generate Sitemap
Write-Host "🖼️ Optimizing images and generating sitemap..." -ForegroundColor Cyan
Set-Location -Path "tools"
npm install
node optimize-images.js
node generate-sitemap.js
Set-Location ..

# 2. Build Client
Write-Host "🏗️ Building client..." -ForegroundColor Cyan
Set-Location -Path "client"
npm ci
npm run build
Set-Location ..

# 3. Prepare Server
Write-Host "🔧 Preparing server..." -ForegroundColor Cyan
Set-Location -Path "server"
npm ci --production
Set-Location ..

# 4. Build Docker Images
Write-Host "🐳 Building Docker images..." -ForegroundColor Cyan
docker-compose build

# 5. Run Tests
Write-Host "🧪 Running tests..." -ForegroundColor Cyan
Set-Location -Path "client"
npm test
Set-Location -Path "../server"
npm test
Set-Location ..

Write-Host "✨ Production build complete!" -ForegroundColor Green
Write-Host @"

Next steps:
1. Update environment variables in .env files
2. Deploy using docker-compose up -d
3. Monitor the logs using docker-compose logs -f

For deployment instructions, see DEPLOYMENT.md
"@ -ForegroundColor Yellow

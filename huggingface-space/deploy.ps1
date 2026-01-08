# ClinicalAI RAG - Hugging Face Spaces Deployment Script
# Run this script from PowerShell to deploy to HuggingFace

param(
    [Parameter(Mandatory=$true)]
    [string]$Username,
    
    [string]$SpaceName = "clinicalai-rag"
)

Write-Host "🚀 ClinicalAI RAG - Hugging Face Deployment" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan

# Check if huggingface-cli is installed
try {
    $hfVersion = huggingface-cli --version 2>$null
    Write-Host "✅ HuggingFace CLI found: $hfVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ HuggingFace CLI not found. Installing..." -ForegroundColor Yellow
    pip install huggingface_hub
}

# Check if git-lfs is installed
try {
    $lfsVersion = git lfs version 2>$null
    Write-Host "✅ Git LFS found: $lfsVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Git LFS not found. Please install from https://git-lfs.github.com/" -ForegroundColor Red
    exit 1
}

# Login to HuggingFace
Write-Host "`n📝 Logging in to HuggingFace..." -ForegroundColor Yellow
huggingface-cli login

# Create the Space repository
Write-Host "`n📦 Creating Space: $Username/$SpaceName" -ForegroundColor Yellow
try {
    huggingface-cli repo create $SpaceName --type space --space_sdk gradio 2>$null
    Write-Host "✅ Space created successfully" -ForegroundColor Green
} catch {
    Write-Host "⚠️ Space may already exist, continuing..." -ForegroundColor Yellow
}

# Clone and setup
$TempDir = "$env:TEMP\hf-space-deploy-$(Get-Date -Format 'yyyyMMddHHmmss')"
Write-Host "`n📂 Cloning Space to: $TempDir" -ForegroundColor Yellow

git clone "https://huggingface.co/spaces/$Username/$SpaceName" $TempDir
Set-Location $TempDir

# Initialize Git LFS
git lfs install

# Copy files
Write-Host "`n📋 Copying files..." -ForegroundColor Yellow
$SourceDir = $PSScriptRoot

Copy-Item "$SourceDir\app.py" -Destination . -Force
Copy-Item "$SourceDir\requirements.txt" -Destination . -Force
Copy-Item "$SourceDir\README.md" -Destination . -Force
Copy-Item "$SourceDir\.gitattributes" -Destination . -Force

# Copy data folder
if (Test-Path "$SourceDir\data") {
    New-Item -ItemType Directory -Path "data" -Force | Out-Null
    Copy-Item "$SourceDir\data\*" -Destination "data\" -Recurse -Force
    Write-Host "  ✅ Data folder copied" -ForegroundColor Green
}

# Copy FAISS index
if (Test-Path "$SourceDir\faiss_index") {
    New-Item -ItemType Directory -Path "faiss_index" -Force | Out-Null
    Copy-Item "$SourceDir\faiss_index\*" -Destination "faiss_index\" -Recurse -Force
    Write-Host "  ✅ FAISS index copied" -ForegroundColor Green
}

# Track large files with LFS
git lfs track "*.faiss"
git lfs track "*.pkl"
git lfs track "*.jsonl"

# Commit and push
Write-Host "`n📤 Pushing to HuggingFace..." -ForegroundColor Yellow
git add .
git commit -m "Deploy ClinicalAI RAG Assistant"
git push

Write-Host "`n✅ Deployment complete!" -ForegroundColor Green
Write-Host "🌐 Your Space is available at:" -ForegroundColor Cyan
Write-Host "   https://huggingface.co/spaces/$Username/$SpaceName" -ForegroundColor White

# Cleanup
Set-Location $PSScriptRoot
Remove-Item $TempDir -Recurse -Force -ErrorAction SilentlyContinue

Write-Host "`n💡 Note: The Space may take 2-3 minutes to build and start." -ForegroundColor Yellow

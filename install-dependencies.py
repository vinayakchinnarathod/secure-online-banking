#!/usr/bin/env python3
"""
Install required dependencies for structure-based document analysis
"""

import subprocess
import sys

def install_package(package):
    """Install a package using pip"""
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", package])
        print(f"✅ Successfully installed {package}")
        return True
    except subprocess.CalledProcessError:
        print(f"❌ Failed to install {package}")
        return False

def main():
    """Install all required dependencies"""
    print("🔧 Installing required dependencies for structure-based document analysis...")
    print("=" * 60)
    
    dependencies = [
        "opencv-python",
        "numpy", 
        "Pillow",
        "pytesseract"
    ]
    
    failed_packages = []
    
    for package in dependencies:
        print(f"\n📦 Installing {package}...")
        if not install_package(package):
            failed_packages.append(package)
    
    print("\n" + "=" * 60)
    if failed_packages:
        print(f"❌ Failed to install: {', '.join(failed_packages)}")
        print("Please install them manually:")
        for package in failed_packages:
            print(f"   pip install {package}")
    else:
        print("✅ All dependencies installed successfully!")
    
    print("\n📋 Additional Setup Required:")
    print("1. Install Tesseract OCR on your system:")
    print("   - Windows: Download from https://github.com/UB-Mannheim/tesseract/wiki")
    print("   - Ubuntu: sudo apt install tesseract-ocr")
    print("   - Mac: brew install tesseract")
    print("\n2. Add Tesseract to your system PATH")
    print("3. Restart your development server")

if __name__ == "__main__":
    main()

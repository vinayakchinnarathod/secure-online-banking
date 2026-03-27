@echo off
echo ========================================
echo Auto-KYC Java Integration Setup
echo ========================================
echo.

echo Step 1: Setting up Auto-KYC Python Backend...
cd /d "c:\Users\VINAYAK CHINNARATHOD\Documents\Bank System Website\auto-kyc"

echo Creating virtual environment if not exists...
if not exist "venv" (
    python -m venv venv
    echo Virtual environment created
)

echo Activating virtual environment...
call venv\Scripts\activate

echo Installing Python dependencies...
pip install fastapi uvicorn python-multipart

echo Starting Auto-KYC Backend...
start "Auto-KYC Backend" cmd /k "python main.py"

echo Waiting for backend to start...
timeout /t 10 /nobreak

echo.
echo Step 2: Testing Auto-KYC Backend...
echo Testing health endpoint...
curl -s http://localhost:8000/api/health

echo.
echo Step 3: Java Integration Files Created...
echo.
echo Files created in java-integration folder:
echo - AutoKYCService.java (Service layer)
echo - AutoKYCController.java (REST Controller)
echo - AutoKYCConfig.java (Configuration)
echo - AutoKYCFrontendComponent.js (Frontend Component)
echo.

echo Step 4: Next Steps for Java Backend:
echo 1. Copy Java files to your Spring Boot project:
echo    src/main/java/com/bank/securebank/service/AutoKYCService.java
echo    src/main/java/com/bank/securebank/controller/AutoKYCController.java
echo    src/main/java/com/bank/securebank/config/AutoKYCConfig.java
echo.
echo 2. Add dependencies to pom.xml:
echo    - spring-boot-starter-web
echo    - spring-boot-starter-security
echo    - jackson-databind
echo.
echo 3. Configure application.properties:
echo    autokyc.base-url=http://localhost:8000/api
echo    autokyc.enabled=true
echo    autokyc.confidence-threshold=0.85
echo.
echo 4. Restart your Java Spring Boot application
echo.
echo Step 5: Frontend Integration:
echo 1. Copy AutoKYCFrontendComponent.js to your frontend
echo 2. Import and use the component in your React app
echo 3. Update API URLs to match your Java backend
echo.

echo ========================================
echo Integration Setup Complete!
echo ========================================
echo.
echo Auto-KYC Backend: http://localhost:8000/api
echo Java Backend: http://localhost:8080/api/autokyc
echo.
echo Test integration: http://localhost:8080/api/autokyc/test-integration
echo.
pause

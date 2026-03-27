# Java Banking System + Auto-KYC Integration Guide

## 🎯 Overview

This guide shows how to integrate your Java Banking System with the Python Auto-KYC system to create a fully functional banking portal with AI-powered document verification.

## 📋 Architecture

```
Java Banking System (Frontend + Backend)
    ↓
Java Spring Boot Backend
    ↓
Python Auto-KYC Backend (FastAPI)
    ↓
AI Processing & Verification
```

## 🚀 Quick Start

### Step 1: Run Setup Script
```cmd
cd "c:\Users\VINAYAK CHINNARATHOD\Documents\Bank System Website\auto-kyc\java-integration"
setup-integration.bat
```

### Step 2: Integrate Java Backend
1. Copy Java files to your Spring Boot project
2. Add dependencies to pom.xml
3. Configure application.properties
4. Restart Spring Boot application

### Step 3: Integrate Frontend
1. Copy React component to your frontend
2. Import and use the component
3. Test the integration

## 📁 Files Created

### Java Backend Files
- `AutoKYCService.java` - Service layer for Auto-KYC API calls
- `AutoKYCController.java` - REST endpoints for frontend
- `AutoKYCConfig.java` - Configuration class

### Frontend Files
- `AutoKYCFrontendComponent.js` - React component for verification

### Setup Files
- `setup-integration.bat` - Automated setup script

## 🔧 Java Backend Integration

### 1. Copy Files to Spring Boot Project

Copy these files to your Spring Boot project:

```
src/main/java/com/bank/securebank/service/AutoKYCService.java
src/main/java/com/bank/securebank/controller/AutoKYCController.java
src/main/java/com/bank/securebank/config/AutoKYCConfig.java
```

### 2. Add Dependencies to pom.xml

```xml
<dependencies>
    <!-- Spring Boot Web -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
    
    <!-- Spring Boot Security -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-security</artifactId>
    </dependency>
    
    <!-- Jackson for JSON -->
    <dependency>
        <groupId>com.fasterxml.jackson.core</groupId>
        <artifactId>jackson-databind</artifactId>
    </dependency>
    
    <!-- File Upload Support -->
    <dependency>
        <groupId>commons-fileupload</groupId>
        <artifactId>commons-fileupload</artifactId>
        <version>1.4</version>
    </dependency>
</dependencies>
```

### 3. Configure application.properties

```properties
# Auto-KYC Configuration
autokyc.base-url=http://localhost:8000/api
autokyc.enabled=true
autokyc.timeout=30000
autokyc.confidence-threshold=0.85

# File Upload Configuration
spring.servlet.multipart.max-file-size=50MB
spring.servlet.multipart.max-request-size=50MB

# CORS Configuration
spring.mvc.cors.allowed-origins=http://localhost:3000,http://localhost:8080
spring.mvc.cors.allowed-methods=GET,POST,PUT,DELETE
spring.mvc.cors.allowed-headers=*
```

### 4. Enable CORS in Your Spring Boot Application

```java
@Configuration
@EnableWebMvc
public class WebConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins("http://localhost:3000", "http://localhost:8080")
                .allowedMethods("GET", "POST", "PUT", "DELETE")
                .allowedHeaders("*");
    }
}
```

## 🎨 Frontend Integration

### 1. Copy React Component

Copy `AutoKYCFrontendComponent.js` to your React frontend project.

### 2. Install Dependencies

```bash
npm install @mui/material @emotion/react @emotion/styled @mui/icons-material
```

### 3. Use the Component

```javascript
import AutoKYCFrontendComponent from './components/AutoKYCFrontendComponent';

function App() {
  return (
    <div>
      <AutoKYCFrontendComponent 
        currentUser={{ id: 'user123', name: 'John Doe' }}
        javaBackendUrl="http://localhost:8080"
        onVerificationComplete={(result) => {
          console.log('Verification completed:', result);
        }}
      />
    </div>
  );
}
```

## 🚀 Running the System

### 1. Start Auto-KYC Python Backend

```cmd
cd "c:\Users\VINAYAK CHINNARATHOD\Documents\Bank System Website\auto-kyc"
venv\Scripts\activate
python main.py
```

### 2. Start Java Spring Boot Backend

```cmd
cd "path\to\your\spring-boot-project"
mvn spring-boot:run
```

### 3. Start Frontend

```cmd
cd "path\to\your\frontend"
npm start
```

## 🌐 Access Points

- **Auto-KYC Backend**: http://localhost:8000/api
- **Java Backend**: http://localhost:8080/api/autokyc
- **Frontend**: http://localhost:3000
- **API Docs**: http://localhost:8000/docs

## 📊 API Endpoints

### Java Backend Endpoints (Auto-KYC Integration)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/autokyc/health` | Check service health |
| POST | `/api/autokyc/upload-document` | Upload document for verification |
| POST | `/api/autokyc/analyze-document` | Analyze document |
| POST | `/api/autokyc/face-verification` | Verify face |
| POST | `/api/autokyc/liveness-session` | Create liveness session |
| POST | `/api/autokyc/complete-verification` | Complete verification workflow |
| GET | `/api/autokyc/customers` | Get all customers |
| GET | `/api/autokyc/customer/{id}` | Get specific customer |
| POST | `/api/autokyc/update-customer` | Update customer |
| GET | `/api/autokyc/statistics` | Get service statistics |
| GET | `/api/autokyc/test-integration` | Test integration |

## 🧪 Testing the Integration

### 1. Test Auto-KYC Backend

```bash
curl http://localhost:8000/api/health
```

### 2. Test Java Backend Integration

```bash
curl http://localhost:8080/api/autokyc/test-integration
```

### 3. Test Complete Workflow

1. Open your frontend application
2. Navigate to the Auto-KYC component
3. Upload a document
4. Start verification
5. Check results

## 🔧 Troubleshooting

### Common Issues

#### 1. "Connection Refused"
**Problem**: Java backend can't connect to Auto-KYC
**Solution**: Make sure Auto-KYC backend is running on port 8000

#### 2. "CORS Error"
**Problem**: Frontend can't access Java backend
**Solution**: Configure CORS in Spring Boot application

#### 3. "File Upload Failed"
**Problem**: Large files not uploading
**Solution**: Increase file size limits in configuration

#### 4. "Verification Failed"
**Problem**: Auto-KYC processing error
**Solution**: Check Auto-KYC backend logs

### Debug Steps

1. **Check Auto-KYC Backend**: http://localhost:8000/api/health
2. **Check Java Backend**: http://localhost:8080/api/autokyc/test-integration
3. **Check Browser Console**: F12 → Console
4. **Check Network Tab**: F12 → Network

## 📈 Features Available

### ✅ Document Verification
- AI-powered document analysis
- Multiple document types (ID, Passport, Driver License)
- Confidence scoring
- Error handling

### ✅ Face Verification
- Face matching with document
- Liveness detection
- Anti-spoofing

### ✅ Customer Management
- Customer status tracking
- Verification history
- Analytics dashboard

### ✅ Admin Features
- Real-time monitoring
- Statistics
- Service health checks

## 🎉 Success Criteria

Your integration is successful when:

1. ✅ Auto-KYC backend is running (http://localhost:8000/api)
2. ✅ Java backend is running (http://localhost:8080)
3. ✅ Frontend loads without errors
4. ✅ Document upload works
5. ✅ Verification process completes
6. ✅ Results appear in dashboard

## 🔄 Next Steps

1. **Customize UI**: Modify the React component to match your design
2. **Add Authentication**: Integrate with your existing user system
3. **Database Integration**: Store verification results in your database
4. **Production Deployment**: Configure for production environment
5. **Monitoring**: Add logging and monitoring

## 📞 Support

For issues:
1. Check Auto-KYC backend logs
2. Check Java backend logs
3. Verify network connectivity
4. Test individual endpoints

---

**🎯 Your Java Banking System is now integrated with Auto-KYC!**

The integration provides a complete solution for AI-powered document verification in your banking application.

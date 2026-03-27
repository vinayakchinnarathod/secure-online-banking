# api_simple.py - Enhanced API with real document analysis

import os
import sys
import uuid
import base64
from datetime import datetime

from fastapi import APIRouter, Request, UploadFile, File, Form, HTTPException
from fastapi.responses import JSONResponse
from typing import Optional, Dict, Any, List
from pydantic import BaseModel
import json
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def truncate_verification_comments(comments: str, max_length: int = 250) -> str:
    """Truncate verification comments to fit database column limit"""
    if not comments:
        return ""
    
    if len(comments) <= max_length:
        return comments
    
    # Truncate and add ellipsis
    truncated = comments[:max_length-3] + "..."
    logger.info(f"Truncated verification comments from {len(comments)} to {len(truncated)} characters")
    return truncated

# Import our document analyzer
sys.path.append('.')
from best_document_analyzer import BestDocumentAnalyzer

# ------------------ FASTAPI SETUP ------------------

app = APIRouter()

# ------------------ MODELS ------------------

class LivenessSessionRequest(BaseModel):
    livenessOperationMode: str
    sendResultsToClient: bool
    deviceCorrelationId: str

class LivenessSessionResponse(BaseModel):
    authToken: str
    session_id: str

# ------------------ DUMMY SERVICES ------------------

class CosmosDBHelper:
    def read_document(self, *args, **kwargs):
        return {
            "first_name": "Vinayak",
            "middle_name": "",
            "last_name": "Chinnarathod",
            "dob": "01-01-2000",
            "address": "Pune",
            "photo": "dummy_photo_url"
        }

    def get_all_documents(self):
        return [
            {"id": "1", "first_name": "Vinayak", "last_name": "Chinnarathod"},
            {"id": "2", "first_name": "Test", "last_name": "User"}
        ]

    def upsert_document(self, data):
        return {"status": "updated", "data": data}

class DummyBlob:
    def upload_document(self, *args, **kwargs):
        return "dummy_url"

    def create_sas_from_blob(self, *args, **kwargs):
        return "dummy_sas_token"

cosmos = CosmosDBHelper()
blob_helper = DummyBlob()

# ------------------ APIs ------------------

@app.get("/")
async def root():
    return {"message": "Backend running successfully 🚀"}

# ------------------ CUSTOMER APIs ------------------

@app.get("/customers")
async def get_customers():
    customers = cosmos.get_all_documents()
    return customers

@app.get("/customer/{customer_id}")
async def get_customer(customer_id: str):
    return cosmos.read_document(customer_id)

@app.post("/upload-document")
async def upload_document(file: UploadFile = File(...), document_type: str = Form(...), username: str = Form("")):
    try:
        # Create temp directory if it doesn't exist
        os.makedirs("temp_imgs", exist_ok=True)
        
        # Save uploaded file
        file_content = await file.read()
        file_path = "temp_imgs/" + file.filename
        
        with open(file_path, "wb") as f:
            f.write(file_content)
        
        # Real document processing
        from best_document_analyzer import BestDocumentAnalyzer
        analyzer = BestDocumentAnalyzer()
        analysis_result = analyzer.analyze_document(file_path, document_type)
        
        # Validate against user data if username provided
        validation_result = {"validated": False}
        if username:
            # Get user data (in real implementation, this would come from database)
            user_data = {
                "name": "Vinayak Chinnarathod",  # This would come from user database
                "date_of_birth": "01-01-2000"
            }
            validation_result = analyzer.validate_against_user_data(
                analysis_result["extracted_data"], 
                user_data
            )
        
        # Determine if document is appropriate type
        is_appropriate_document = False
        if analysis_result["document_type"] in ["Aadhaar Card", "PAN Card"]:
            is_appropriate_document = True
        
        # Calculate final confidence
        base_confidence = analysis_result["confidence"]
        validation_confidence = validation_result.get("confidence", 0.0)
        
        # FIXED: Proper confidence calculation for unknown documents
        if analysis_result["document_type"] == "Unknown Document":
            # Unknown documents should have very low confidence
            document_type_confidence = -0.8  # Heavy penalty for unknown documents
        else:
            document_type_confidence = 0.3 if is_appropriate_document else -0.5
        
        # FIXED: If base confidence is 0 (garbage data), keep it at 0
        if base_confidence == 0.0:
            final_confidence = 0.0
        else:
            # FIXED: Ensure confidence doesn't go negative
            final_confidence = max(0.0, min(base_confidence + validation_confidence + document_type_confidence, 0.95))
        
        # Determine verification status
        verification_status = "success"
        if final_confidence < 0.6:
            verification_status = "low_confidence"
        elif analysis_result["document_type"] == "Unknown Document":
            verification_status = "invalid_document_type"  # Unknown document = invalid
        elif not is_appropriate_document:
            verification_status = "invalid_document_type"
        elif not validation_result.get("is_valid", False):
            verification_status = "data_mismatch"
        
        result = {
            "document_type": analysis_result["document_type"],
            "extracted_data": analysis_result["extracted_data"],
            "confidence": final_confidence,
            "verification_status": verification_status,
            "is_appropriate_document": is_appropriate_document,
            "validation_result": validation_result,
            "file_info": {
                "name": file.filename,
                "path": file_path,
                "document_type": document_type,
                "upload_date": datetime.now().isoformat(),
                "size": len(file_content)
            }
        }
        
        return {
            "success": True,
            "message": f"Document analyzed successfully: {verification_status}",
            "analysis": result
        }
    except Exception as e:
        return {
            "success": False,
            "message": f"Upload failed: {str(e)}",
            "error": str(e)
        }

@app.post("/analyze-document")
async def analyze_document(file_path: str = Form(...)):
    try:
        # Dummy analysis
        result = {
            "document_type": "ID Card",
            "extracted_text": "Sample extracted text",
            "confidence": 0.95,
            "verification_status": "success"
        }
        
        return {
            "success": True,
            "analysis": result
        }
    except Exception as e:
        return {
            "success": False,
            "message": "Analysis failed: " + str(e)
        }

@app.post("/face-verification")
async def face_verification(face_image: UploadFile = File(...), liveness_check: bool = Form(True)):
    try:
        # Create temp directory if it doesn't exist
        os.makedirs("temp_imgs", exist_ok=True)
        
        # Save face image
        file_content = await face_image.read()
        face_path = "temp_imgs/face_" + datetime.now().strftime('%Y%m%d_%H%M%S') + ".jpg"
        
        with open(face_path, "wb") as f:
            f.write(file_content)
        
        # Dummy face verification
        result = {
            "face_detected": True,
            "liveness_verified": liveness_check,
            "confidence": 0.98,
            "match_score": 0.95,
            "verification_status": "success"
        }
        
        return {
            "success": True,
            "message": "Face verification completed",
            "verification_result": result
        }
    except Exception as e:
        return {
            "success": False,
            "message": "Face verification failed: " + str(e)
        }

@app.post("/face-liveness")
async def face_liveness_session(request: LivenessSessionRequest):
    try:
        # Dummy liveness session
        result = {
            "session_id": "session_" + str(uuid.uuid4()),
            "auth_token": "token_" + str(uuid.uuid4()),
            "status": "created"
        }
        
        return {
            "success": True,
            "session": result
        }
    except Exception as e:
        return {
            "success": False,
            "message": "Liveness session creation failed: " + str(e)
        }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "auto-kyc-api",
        "version": "1.0.0",
        "endpoints": {
            "upload": "/upload-document",
            "analyze": "/analyze-document",
            "face_verification": "/face-verification",
            "face_liveness": "/face-liveness",
            "customers": "/customers"
        }
    }

@app.post("/update")
async def update_customer(data: dict):
    return cosmos.upsert_document(data)

# ------------------ FILE APIs ------------------

@app.post("/upload")
async def upload_files(files: List[UploadFile] = File(...)):
    file_names = [file.filename for file in files]
    return {"uploaded_files": file_names}

# ------------------ ANALYSIS API ------------------

@app.post("/analyze")
async def analyze_documents(info: dict):
    customer_id = info.get("customer_id", "")
    id_document = base64.b64decode(info.get("id_document", ""))
    id_document_name = info.get("id_document_name", "test.jpg")

    # Create temp directory if it doesn't exist
    os.makedirs("temp_imgs", exist_ok=True)
    file_path = "temp_imgs/" + id_document_name

    with open(file_path, "wb") as f:
        f.write(id_document)

    # Dummy comparison result
    return {
        "success": True,
        "comparison_result": {
            "match_score": 0.95,
            "discrepancies": [],
            "verification_status": "success"
        }
    }

# ------------------ STATUS ------------------

@app.get("/status/{customer_id}")
async def get_status(customer_id: str):
    return {"customer_id": customer_id, "status": "green"}

@app.get("/logs/{customer_id}")
async def get_logs(customer_id: str):
    return {"customer_id": customer_id, "logs": ["No discrepancies found."]}

# ------------------ LIVENESS (DUMMY) ------------------

@app.post("/detectLiveness")
async def detect_liveness():
    return {
        "authToken": "dummy_token_" + str(uuid.uuid4()),
        "session_id": "dummy_session_" + str(uuid.uuid4())
    }

@app.post("/livenessComplete")
async def livenessComplete():
    return {"status": "completed"}

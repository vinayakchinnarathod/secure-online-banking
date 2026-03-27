# api.py (CLEAN LOCAL VERSION - NO AZURE)

import os
import sys
import uuid
import base64
import socket
import copy
from datetime import datetime

from fastapi import APIRouter, Request, UploadFile, File, Form
from fastapi.responses import HTMLResponse
from typing import List
from pydantic import BaseModel

sys.path.append('code')

from utils.id_document_processor import *
from utils.general_helpers import *

import logging
logger = logging.getLogger('uvicorn.error')
logger.setLevel(logging.INFO)

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

# ------------------ FASTAPI SETUP ------------------

app = APIRouter()

# Note: CORS and middleware will be configured in main.py

# ------------------ MODELS ------------------

class LivenessSessionRequest(BaseModel):
    livenessOperationMode: str
    sendResultsToClient: bool
    deviceCorrelationId: str

class LivenessSessionResponse(BaseModel):
    authToken: str
    session_id: str

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
async def upload_document(file: UploadFile = File(...), document_type: str = Form(...)):
    try:
        # Save uploaded file
        file_content = await file.read()
        file_path = f"temp_imgs/{file.filename}"
        
        with open(file_path, "wb") as f:
            f.write(file_content)
        
        # Process document
        processor = IDDocumentProcessor()
        result = processor.process_document(file_path, document_type)
        
        return {
            "success": True,
            "message": "Document uploaded successfully",
            "file_info": {
                "name": file.filename,
                "path": file_path,
                "document_type": document_type,
                "upload_date": datetime.now().isoformat(),
                "size": len(file_content)
            },
            "analysis": result
        }
    except Exception as e:
        return {
            "success": False,
            "message": f"Upload failed: {str(e)}"
        }

@app.post("/analyze-document")
async def analyze_document(file_path: str = Form(...)):
    try:
        processor = IDDocumentProcessor()
        result = processor.process_document(file_path, "auto")
        
        return {
            "success": True,
            "analysis": result
        }
    except Exception as e:
        return {
            "success": False,
            "message": f"Analysis failed: {str(e)}"
        }

@app.post("/face-verification")
async def face_verification(face_image: UploadFile = File(...), liveness_check: bool = Form(True)):
    try:
        # Save face image
        file_content = await face_image.read()
        face_path = f"temp_imgs/face_{datetime.now().strftime('%Y%m%d_%H%M%S')}.jpg"
        
        with open(face_path, "wb") as f:
            f.write(file_content)
        
        # Perform face verification
        from utils.face_service import FaceService
        face_service = FaceService()
        result = face_service.verify_face(face_path, liveness_check)
        
        return {
            "success": True,
            "message": "Face verification completed",
            "verification_result": result
        }
    except Exception as e:
        return {
            "success": False,
            "message": f"Face verification failed: {str(e)}"
        }

@app.post("/face-liveness")
async def face_liveness_session(request: LivenessSessionRequest):
    try:
        from utils.face_liveness import FaceLivenessDetector
        detector = FaceLivenessDetector()
        result = detector.create_session(request.livenessOperationMode, request.sendResultsToClient)
        
        return {
            "success": True,
            "session": result
        }
    except Exception as e:
        return {
            "success": False,
            "message": f"Liveness session creation failed: {str(e)}"
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

    work_dir = "temp_imgs"
    os.makedirs(work_dir, exist_ok=True)

    file_path = os.path.join(work_dir, id_document_name)

    with open(file_path, "wb") as f:
        f.write(id_document)

    doc_processor = IDDocumentProcessor(
        customer_id=customer_id,
        doc_path=file_path
    )

    return doc_processor.compare_document_to_database()

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
        "authToken": "dummy_token",
        "session_id": "dummy_session"
    }

@app.post("/livenessComplete")
async def livenessComplete():
    return {"status": "completed"}

#!/usr/bin/env python3
"""
Intelligent Document Analyzer - Real Image Analysis
Actually analyzes image content to determine document type
"""

import os
import re
import sys
from typing import Dict, Any, List
from PIL import Image
import pytesseract
from io import BytesIO

class IntelligentDocumentAnalyzer:
    """Intelligent document analyzer that actually analyzes image content"""
    
    def __init__(self):
        """Initialize the intelligent analyzer"""
        # Define document characteristics based on visual and text patterns
        self.document_characteristics = {
            'Aadhaar Card': {
                'visual_indicators': [
                    'government logo', 'emblem of india', 'ashoka chakra',
                    'photo placeholder', 'fingerprint', 'qr code',
                    'aadhaar logo', 'uidai logo'
                ],
                'text_patterns': [
                    r'\b\d{4}\s?\d{4}\s?\d{4}\b',  # 12-digit Aadhaar number
                    r'aadhaar', 'आधार', 'uidai', 'unique identification',
                    'government of india', 'भारत सरकार',
                    'enrolment no', 'enrollment number'
                ],
                'layout_patterns': [
                    'photo on left', 'photo on right', 'centered layout',
                    'two-column', 'header with logo', 'footer with qr'
                ],
                'required_fields': ['name', 'date_of_birth', 'aadhaar_number'],
                'confidence_threshold': 0.7
            },
            'PAN Card': {
                'visual_indicators': [
                    'income tax logo', 'government seal', 'photo',
                    'signature', 'pan card logo', 'department logo'
                ],
                'text_patterns': [
                    r'\b[A-Z]{5}[0-9]{4}\b',  # PAN number format
                    'permanent account number', 'pan card', 'पैन कार्ड',
                    'income tax department', 'कर विभाग',
                    'department of income tax'
                ],
                'layout_patterns': [
                    'photo on left', 'signature on right', 'centered name',
                    'horizontal layout', 'compact format'
                ],
                'required_fields': ['name', 'pan_number', 'date_of_birth'],
                'confidence_threshold': 0.8
            },
            'Voter ID': {
                'visual_indicators': [
                    'election commission logo', 'photo', 'serial number',
                    'voter id symbol', 'government emblem'
                ],
                'text_patterns': [
                    'voter id', 'वोटर आईडी', 'election commission',
                    'electoral photo identity card', 'चुनाव आयोग',
                    r'\b[A-Z]{3}[0-9]{7}\b'  # Voter ID format
                ],
                'layout_patterns': [
                    'photo on left', 'serial number top', 'centered logo',
                    'vertical layout', 'government format'
                ],
                'required_fields': ['name', 'voter_id_number', 'age'],
                'confidence_threshold': 0.6
            },
            'Driving License': {
                'visual_indicators': [
                    'rto logo', 'photo', 'signature', 'barcode',
                    'state transport authority', 'government seal'
                ],
                'text_patterns': [
                    'driving license', 'ड्राइविंग लाइसेंस',
                    'transport authority', 'rto', 'regional transport office',
                    r'\b[A-Z]{2}[0-9]{2}[0-9]{4}[0-9]{7}\b'  # License number format
                ],
                'layout_patterns': [
                    'photo on left', 'signature on right', 'top header',
                    'card format', 'horizontal layout'
                ],
                'required_fields': ['name', 'license_number', 'date_of_birth'],
                'confidence_threshold': 0.7
            },
            'Passport': {
                'visual_indicators': [
                    'national emblem', 'photo', 'signature', 'passport logo',
                    'country symbol', 'official stamp'
                ],
                'text_patterns': [
                    'republic of india', 'passport', 'भारत गणराज्य',
                    'passport no', 'place of birth', 'nationality',
                    r'\b[A-Z]{1}[0-9]{7}\b'  # Passport number format
                ],
                'layout_patterns': [
                    'photo on left', 'centered format', 'official layout',
                    'booklet style', 'government format'
                ],
                'required_fields': ['name', 'passport_number', 'nationality'],
                'confidence_threshold': 0.8
            }
        }
    
    def analyze_image_content(self, image_bytes: bytes, file_path: str) -> Dict[str, Any]:
        """Actually analyze the image content to determine document type"""
        
        try:
            # Convert bytes to PIL Image
            image = Image.open(BytesIO(image_bytes))
            
            # Extract text using OCR
            extracted_text = self._extract_text_from_image(image)
            
            # Analyze visual characteristics
            visual_analysis = self._analyze_visual_characteristics(image)
            
            # Analyze text patterns
            text_analysis = self._analyze_text_patterns(extracted_text)
            
            # Analyze layout
            layout_analysis = self._analyze_layout(image, extracted_text)
            
            # Determine document type based on all analysis
            document_type = self._determine_document_type(
                visual_analysis, 
                text_analysis, 
                layout_analysis
            )
            
            # Calculate confidence based on analysis results
            confidence = self._calculate_analysis_confidence(
                document_type, 
                visual_analysis, 
                text_analysis, 
                layout_analysis
            )
            
            # Extract relevant data
            extracted_data = self._extract_document_data(extracted_text, document_type)
            
            return {
                'document_type': document_type,
                'confidence': confidence,
                'extracted_data': extracted_data,
                'analysis_details': {
                    'visual_analysis': visual_analysis,
                    'text_analysis': text_analysis,
                    'layout_analysis': layout_analysis,
                    'extracted_text': extracted_text[:500] + '...' if len(extracted_text) > 500 else extracted_text
                }
            }
            
        except Exception as e:
            return {
                'document_type': 'Unknown Document',
                'confidence': 0.0,
                'extracted_data': {},
                'error': f'Analysis failed: {str(e)}'
            }
    
    def _extract_text_from_image(self, image: Image.Image) -> str:
        """Extract text from image using OCR"""
        try:
            # Configure Tesseract for better accuracy
            custom_config = r'--oem 3 --psm 6'
            text = pytesseract.image_to_string(image, config=custom_config)
            return text.strip()
        except Exception as e:
            print(f"OCR extraction failed: {e}")
            return ""
    
    def _analyze_visual_characteristics(self, image: Image.Image) -> Dict[str, Any]:
        """Analyze visual characteristics of the image"""
        
        analysis = {
            'has_photo': False,
            'has_logo': False,
            'has_qr_code': False,
            'has_signature': False,
            'color_distribution': {},
            'layout_density': 0.0,
            'aspect_ratio': image.width / image.height
        }
        
        # Convert to RGB for analysis
        rgb_image = image.convert('RGB')
        
        # Basic visual indicators (simplified)
        width, height = image.size
        analysis['layout_density'] = self._calculate_layout_density(rgb_image)
        
        # Detect if image has photo-like regions (simplified)
        analysis['has_photo'] = self._detect_photo_region(rgb_image)
        
        # Detect logo-like regions (simplified)
        analysis['has_logo'] = self._detect_logo_region(rgb_image)
        
        return analysis
    
    def _calculate_layout_density(self, image: Image.Image) -> float:
        """Calculate text/layout density"""
        try:
            # Convert to grayscale
            gray = image.convert('L')
            
            # Simple density calculation
            pixels = list(gray.getdata())
            non_white_pixels = sum(1 for p in pixels if p < 240)
            total_pixels = len(pixels)
            
            return non_white_pixels / total_pixels if total_pixels > 0 else 0.0
        except:
            return 0.0
    
    def _detect_photo_region(self, image: Image.Image) -> bool:
        """Detect if image has photo-like regions"""
        try:
            # Simplified photo detection based on region analysis
            width, height = image.size
            
            # Check if there's a region that looks like a photo (upper portion)
            photo_region = image.crop((0, 0, width, height // 3))
            
            # Convert to grayscale and check for typical photo characteristics
            gray_photo = photo_region.convert('L')
            pixels = list(gray_photo.getdata())
            
            # Photo regions typically have varied pixel values
            pixel_variance = self._calculate_variance(pixels)
            
            return pixel_variance > 1000  # Threshold for photo-like regions
        except:
            return False
    
    def _detect_logo_region(self, image: Image.Image) -> bool:
        """Detect if image has logo-like regions"""
        try:
            # Simplified logo detection
            width, height = image.size
            
            # Check top region for logo
            logo_region = image.crop((0, 0, width, height // 4))
            
            # Logo regions typically have high contrast
            gray_logo = logo_region.convert('L')
            pixels = list(gray_logo.getdata())
            
            pixel_variance = self._calculate_variance(pixels)
            
            return pixel_variance > 500  # Threshold for logo-like regions
        except:
            return False
    
    def _calculate_variance(self, pixels: List[int]) -> float:
        """Calculate variance of pixel values"""
        if not pixels:
            return 0.0
        
        mean = sum(pixels) / len(pixels)
        variance = sum((p - mean) ** 2 for p in pixels) / len(pixels)
        
        return variance
    
    def _analyze_text_patterns(self, text: str) -> Dict[str, Any]:
        """Analyze text patterns in extracted text"""
        
        analysis = {
            'found_patterns': [],
            'document_scores': {},
            'key_indicators': []
        }
        
        text_lower = text.lower()
        
        # Score each document type based on text patterns
        for doc_type, characteristics in self.document_characteristics.items():
            score = 0.0
            found_patterns = []
            
            # Check text patterns
            for pattern in characteristics['text_patterns']:
                if re.search(pattern, text, re.IGNORECASE):
                    score += 0.3
                    found_patterns.append(pattern)
            
            # Check for key indicators
            for indicator in characteristics['visual_indicators']:
                if indicator.lower() in text_lower:
                    score += 0.2
                    analysis['key_indicators'].append(indicator)
            
            analysis['document_scores'][doc_type] = score
            analysis['found_patterns'].extend(found_patterns)
        
        return analysis
    
    def _analyze_layout(self, image: Image.Image, text: str) -> Dict[str, Any]:
        """Analyze document layout"""
        
        analysis = {
            'layout_type': 'unknown',
            'text_density': 0.0,
            'has_header': False,
            'has_footer': False,
            'document_scores': {}
        }
        
        # Simple layout analysis
        lines = text.split('\n')
        if lines:
            # Check for header (first line with keywords)
            first_line = lines[0].strip().lower()
            analysis['has_header'] = any(keyword in first_line for keyword in ['government', 'department', 'card', 'id'])
            
            # Check for footer (last line with numbers/codes)
            if len(lines) > 1:
                last_line = lines[-1].strip().lower()
                analysis['has_footer'] = bool(re.search(r'\d+', last_line))
        
        # Calculate text density
        analysis['text_density'] = len(text) / (image.width * image.height) if image.width * image.height > 0 else 0
        
        # Score layouts for different document types
        for doc_type, characteristics in self.document_characteristics.items():
            score = 0.0
            
            # Check layout patterns
            for pattern in characteristics['layout_patterns']:
                if pattern.lower() in text.lower():
                    score += 0.2
            
            analysis['document_scores'][doc_type] = score
        
        return analysis
    
    def _determine_document_type(self, visual_analysis: Dict, text_analysis: Dict, layout_analysis: Dict) -> str:
        """Determine document type based on all analysis"""
        
        scores = {}
        
        # Calculate combined scores for each document type
        for doc_type in self.document_characteristics.keys():
            score = 0.0
            
            # Visual analysis score
            if visual_analysis.get('has_photo', False):
                score += 0.2
            if visual_analysis.get('has_logo', False):
                score += 0.1
            
            # Text analysis score
            score += text_analysis['document_scores'].get(doc_type, 0.0)
            
            # Layout analysis score
            score += layout_analysis['document_scores'].get(doc_type, 0.0)
            
            scores[doc_type] = score
        
        # Find the document type with highest score
        if scores:
            best_doc_type = max(scores, key=scores.get)
            best_score = scores[best_doc_type]
            
            # Check if score meets threshold
            threshold = self.document_characteristics[best_doc_type]['confidence_threshold']
            
            if best_score >= threshold:
                return best_doc_type
        
        return 'Unknown Document'
    
    def _calculate_analysis_confidence(self, document_type: str, visual_analysis: Dict, text_analysis: Dict, layout_analysis: Dict) -> float:
        """Calculate confidence based on analysis results"""
        
        if document_type == 'Unknown Document':
            return 0.05  # Very low confidence for unknown documents
        
        base_confidence = 0.0
        
        # Visual confidence
        if visual_analysis.get('has_photo', False):
            base_confidence += 0.2
        if visual_analysis.get('has_logo', False):
            base_confidence += 0.1
        
        # Text confidence
        text_score = text_analysis['document_scores'].get(document_type, 0.0)
        base_confidence += min(text_score, 0.4)
        
        # Layout confidence
        layout_score = layout_analysis['document_scores'].get(document_type, 0.0)
        base_confidence += min(layout_score, 0.3)
        
        return min(base_confidence, 0.95)
    
    def _extract_document_data(self, text: str, document_type: str) -> Dict[str, Any]:
        """Extract relevant data based on document type"""
        
        extracted = {}
        
        if document_type == 'Aadhaar Card':
            # Extract Aadhaar number
            aadhaar_match = re.search(r'\b(\d{4}\s?\d{4}\s?\d{4})\b', text)
            if aadhaar_match:
                extracted['aadhaar_number'] = aadhaar_match.group(1).replace(' ', '')
            
            # Extract name
            name_match = re.search(r'name[:\s]*([A-Za-z\s]+)', text, re.IGNORECASE)
            if name_match:
                extracted['name'] = name_match.group(1).strip()
            
            # Extract DOB
            dob_match = re.search(r'(?:dob|date of birth)[:\s]*(\d{2}/\d{2}/\d{4})', text, re.IGNORECASE)
            if dob_match:
                extracted['date_of_birth'] = dob_match.group(1)
        
        elif document_type == 'PAN Card':
            # Extract PAN number
            pan_match = re.search(r'\b([A-Z]{5}[0-9]{4})\b', text)
            if pan_match:
                extracted['pan_number'] = pan_match.group(1)
            
            # Extract name
            name_match = re.search(r'name[:\s]*([A-Za-z\s]+)', text, re.IGNORECASE)
            if name_match:
                extracted['name'] = name_match.group(1).strip()
            
            # Extract DOB
            dob_match = re.search(r'(?:dob|date of birth)[:\s]*(\d{2}/\d{2}/\d{4})', text, re.IGNORECASE)
            if dob_match:
                extracted['date_of_birth'] = dob_match.group(1)
        
        elif document_type == 'Voter ID':
            # Extract Voter ID number
            voter_match = re.search(r'\b([A-Z]{3}[0-9]{7})\b', text)
            if voter_match:
                extracted['voter_id_number'] = voter_match.group(1)
            
            # Extract name
            name_match = re.search(r'name[:\s]*([A-Za-z\s]+)', text, re.IGNORECASE)
            if name_match:
                extracted['name'] = name_match.group(1).strip()
        
        elif document_type == 'Driving License':
            # Extract license number
            license_match = re.search(r'\b([A-Z]{2}[0-9]{13})\b', text)
            if license_match:
                extracted['license_number'] = license_match.group(1)
            
            # Extract name
            name_match = re.search(r'name[:\s]*([A-Za-z\s]+)', text, re.IGNORECASE)
            if name_match:
                extracted['name'] = name_match.group(1).strip()
        
        elif document_type == 'Passport':
            # Extract passport number
            passport_match = re.search(r'\b([A-Z]{1}[0-9]{7})\b', text)
            if passport_match:
                extracted['passport_number'] = passport_match.group(1)
            
            # Extract name
            name_match = re.search(r'name[:\s]*([A-Za-z\s]+)', text, re.IGNORECASE)
            if name_match:
                extracted['name'] = name_match.group(1).strip()
        
        return extracted

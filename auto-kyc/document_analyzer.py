# document_analyzer.py - Real document analysis for Aadhaar and PAN cards

import os
import re
import json
from typing import Dict, Any, Optional
from datetime import datetime

class DocumentAnalyzer:
    """Real document analyzer for Aadhaar and PAN cards"""
    
    def __init__(self):
        self.aadhaar_patterns = {
            'aadhaar_number': r'\b\d{4}\s?\d{4}\s?\d{4}\b',
            'name_pattern': r'(?:Name|नाम)[:\s]*([A-Za-z\s]+)',
            'dob_pattern': r'(?:DOB|Date of Birth|जन्म\:?\s*तिथि)[:\s]*(\d{2}[-/]\d{2}[-/]\d{4})',
            'gender_pattern': r'(?:Gender|लिंग)[:\s]*([A-Za-z]+)',
            'address_pattern': r'(?:Address|पता)[:\s]*([^\n]+?)(?:\n|$)'
        }
        
        self.pan_patterns = {
            'pan_number': r'\b[A-Z]{5}[0-9]{4}\b',
            'name_pattern': r'(?:Name|नाम)[:\s]*([A-Za-z\s]+)',
            'dob_pattern': r'(?:DOB|Date of Birth|जन्म\:?\s*तिथि)[:\s]*(\d{2}[-/]\d{2}[-/]\d{4})',
            'father_name': r'(?:Father\'?s\s*Name|पिता[:\s]*का[:\s]*नाम)[:\s]*([A-Za-z\s]+)'
        }
    
    def analyze_document(self, file_path: str, document_type: str = 'auto') -> Dict[str, Any]:
        """Emergency document analysis with working logic"""
        
        try:
            print(f"🔍 EMERGENCY ANALYSIS: {file_path}")
            
            # Read the file
            with open(file_path, 'rb') as f:
                file_content = f.read()
            
            # Try to extract text from image
            try:
                from PIL import Image
                from io import BytesIO
                
                # Convert to PIL Image
                image = Image.open(BytesIO(file_content))
                
                # Try OCR if available
                try:
                    import pytesseract
                    text = pytesseract.image_to_string(image, config=r'--oem 3 --psm 6')
                    print("✅ OCR extraction successful")
                except:
                    print("❌ OCR not available, using fallback")
                    text = ""
                
            except Exception as img_error:
                print(f"❌ Image processing failed: {img_error}")
                text = ""
            
            # Simple document type detection
            document_type = self._detect_document_type_simple(text, file_path)
            print(f"📋 Detected type: {document_type}")
            
            # Extract data based on type
            extracted_data = self._extract_data_simple(text, document_type)
            
            # Calculate confidence
            confidence = self._calculate_confidence_simple(extracted_data, document_type, text)
            
            result = {
                'document_type': document_type,
                'confidence': confidence,
                'extracted_data': extracted_data,
                'analysis_method': 'emergency_simple',
                'extracted_text': text[:200] + '...' if len(text) > 200 else text
            }
            
            print(f"🎯 EMERGENCY RESULT: {document_type} with {confidence:.2f} confidence")
            return result
            
        except Exception as e:
            print(f"❌ Emergency analysis failed: {e}")
            return {
                'document_type': 'Unknown Document',
                'confidence': 0.0,
                'extracted_data': {},
                'error': f'Emergency analysis failed: {str(e)}',
                'analysis_method': 'emergency_error'
            }
    
    def _detect_document_type_simple(self, text: str, file_path: str) -> str:
        """Simple document type detection"""
        
        text_lower = text.lower()
        
        # Check for Aadhaar patterns
        aadhaar_keywords = ['aadhaar', 'आधार', 'uidai', 'unique identification', 'government of india']
        aadhaar_count = sum(1 for keyword in aadhaar_keywords if keyword in text_lower)
        
        # Check for PAN patterns
        pan_keywords = ['pan', 'pan card', 'पैन कार्ड', 'income tax', 'permanent account number']
        pan_count = sum(1 for keyword in pan_keywords if keyword in text_lower)
        
        # Check for number patterns
        aadhaar_numbers = len(re.findall(r'\b\d{4}\s?\d{4}\s?\d{4}\b', text))
        pan_numbers = len(re.findall(r'\b[A-Z]{5}[0-9]{4}\b', text))
        
        print(f"🔍 Aadhaar keywords: {aadhaar_count}, numbers: {aadhaar_numbers}")
        print(f"🔍 PAN keywords: {pan_count}, numbers: {pan_numbers}")
        
        # Decision logic
        if aadhaar_numbers > 0 or (aadhaar_count >= 2 and aadhaar_numbers >= 1):
            return "Aadhaar Card"
        elif pan_numbers > 0 or (pan_count >= 2 and pan_numbers >= 1):
            return "PAN Card"
        elif aadhaar_count > 0 or pan_count > 0:
            # Some keywords found but not enough
            if aadhaar_count > pan_count:
                return "Aadhaar Card"
            else:
                return "PAN Card"
        else:
            return "Unknown Document"
    
    def _extract_data_simple(self, text: str, document_type: str) -> Dict[str, Any]:
        """Simple data extraction"""
        
        extracted = {}
        
        if document_type == "Aadhaar Card":
            # Extract Aadhaar number
            aadhaar_match = re.search(r'\b(\d{4}\s?\d{4}\s?\d{4})\b', text)
            if aadhaar_match:
                extracted['aadhaar_number'] = aadhaar_match.group(1).replace(' ', '')
            
            # Extract name
            name_match = re.search(r'(?:Name|नाम)[:\s]*([A-Za-z\s]+)', text, re.IGNORECASE)
            if name_match:
                extracted['name'] = name_match.group(1).strip()
            
            # Extract DOB
            dob_match = re.search(r'(?:DOB|Date of Birth|जन्म तिथि)[:\s]*(\d{2}[/]\d{2}[/]\d{4})', text, re.IGNORECASE)
            if dob_match:
                extracted['date_of_birth'] = dob_match.group(1)
        
        elif document_type == "PAN Card":
            # Extract PAN number
            pan_match = re.search(r'\b([A-Z]{5}[0-9]{4})\b', text)
            if pan_match:
                extracted['pan_number'] = pan_match.group(1)
            
            # Extract name
            name_match = re.search(r'(?:Name|नाम)[:\s]*([A-Za-z\s]+)', text, re.IGNORECASE)
            if name_match:
                extracted['name'] = name_match.group(1).strip()
            
            # Extract DOB
            dob_match = re.search(r'(?:DOB|Date of Birth|जन्म तिथि)[:\s]*(\d{2}[/]\d{2}[/]\d{4})', text, re.IGNORECASE)
            if dob_match:
                extracted['date_of_birth'] = dob_match.group(1)
        
        return extracted
    
    def _calculate_confidence_simple(self, extracted_data: Dict[str, Any], document_type: str, text: str) -> float:
        """Simple confidence calculation"""
        
        confidence = 0.0
        
        if document_type == "Aadhaar Card":
            if 'aadhaar_number' in extracted_data:
                confidence += 0.4
            if 'name' in extracted_data:
                confidence += 0.3
            if 'date_of_birth' in extracted_data:
                confidence += 0.2
            # Add text analysis
            if 'aadhaar' in text.lower() or 'आधार' in text.lower():
                confidence += 0.1
                
        elif document_type == "PAN Card":
            if 'pan_number' in extracted_data:
                confidence += 0.5
            if 'name' in extracted_data:
                confidence += 0.3
            if 'date_of_birth' in extracted_data:
                confidence += 0.2
            # Add text analysis
            if 'pan' in text.lower() or 'income tax' in text.lower():
                confidence += 0.1
        
        else:
            # Very low confidence for unknown documents
            confidence = 0.05
        
        return min(confidence, 0.95)
    
    def validate_against_user_data(self, extracted_data: Dict[str, Any], user_data: Dict[str, Any]) -> Dict[str, Any]:
        """Validate extracted data against user data"""
        
        validation_result = {
            "is_valid": False,
            "confidence": 0.0,
            "matched_fields": [],
            "mismatched_fields": []
        }
        
        try:
            # Check name matching
            if 'name' in extracted_data and 'name' in user_data:
                extracted_name = extracted_data['name'].strip().lower()
                user_name = user_data['name'].strip().lower()
                
                if extracted_name == user_name or user_name in extracted_name or extracted_name in user_name:
                    validation_result["matched_fields"].append("name")
                    validation_result["confidence"] += 0.4
                else:
                    validation_result["mismatched_fields"].append("name")
            
            # Check DOB matching
            if 'date_of_birth' in extracted_data and 'date_of_birth' in user_data:
                extracted_dob = extracted_data['date_of_birth'].replace('-', '/')
                user_dob = user_data['date_of_birth'].replace('-', '/')
                
                if extracted_dob == user_dob:
                    validation_result["matched_fields"].append("date_of_birth")
                    validation_result["confidence"] += 0.3
                else:
                    validation_result["mismatched_fields"].append("date_of_birth")
            
            # Determine if valid
            if len(validation_result["matched_fields"]) >= 1:
                validation_result["is_valid"] = True
            
            validation_result["confidence"] = min(validation_result["confidence"], 0.95)
            
        except Exception as e:
            validation_result["error"] = str(e)
        
        return validation_result
    
    def _detect_document_type(self, file_content: bytes, file_path: str) -> str:
        """Detect if document is Aadhaar, PAN, or other"""
        
        file_extension = os.path.splitext(file_path)[1].lower()
        content_str = file_content.decode('utf-8', errors='ignore')
        
        # Check for Aadhaar patterns FIRST (more specific)
        if self._contains_aadhaar_patterns(content_str):
            return "Aadhaar Card"
        
        # Check for PAN card patterns SECOND
        if self._contains_pan_patterns(content_str):
            return "PAN Card"
        
        # If no Aadhaar or PAN patterns found, it's NOT a valid document
        # Don't fall back to generic ID Card - mark as Unknown Document
        return "Unknown Document"
    
    def _contains_aadhaar_patterns(self, content: str) -> bool:
        """Check if content contains Aadhaar card patterns"""
        
        # Look for ONLY Aadhaar-specific keywords (strict matching)
        aadhaar_keywords = [
            'aadhaar', 'आधार', 'uidai', 'unique identification authority',
            'government of india', 'भारत सरकार', 'enrolment',
            'enrollment', 'आधार कार्ड',
            'uidai.gov.in', 'विशिष्ट पहचान संख्या',
            '12 digit', '12-digit', '12 अंक', 'uid'
            # ❌ REMOVED: 'identification', 'resident', 'photo', 'signature' (too generic)
        ]
        
        content_lower = content.lower()
        
        # Check for keywords (strict matching)
        keyword_found = any(keyword in content_lower for keyword in aadhaar_keywords)
        
        # Check for Aadhaar number pattern (12 digits) - MOST IMPORTANT
        aadhaar_pattern = re.search(self.aadhaar_patterns['aadhaar_number'], content)
        
        # Only keep very specific Aadhaar patterns
        aadhaar_specific_patterns = [
            r'\b\d{4}\s?\d{4}\s?\d{4}\b',  # 12-digit Aadhaar number
            # ❌ REMOVED: r'\b\d{2}/\d{2}/\d{4}\b' (DOB - too generic)
            # ❌ REMOVED: r'birth.*\d{4}' (birth year - too generic)
            # ❌ REMOVED: r'year.*\d{4}' (year - too generic)
            # ❌ REMOVED: r'male|female' (gender - too generic)
            # ❌ REMOVED: r'date of birth' (DOB text - too generic)
            # ❌ REMOVED: r'dob' (DOB abbreviation - too generic)
        ]
        
        pattern_found = any(re.search(pattern, content, re.IGNORECASE) for pattern in aadhaar_specific_patterns)
        
        # STRICT LOGIC: Require both keyword AND pattern for higher confidence
        # OR require strong Aadhaar number pattern
        return (keyword_found and aadhaar_pattern is not None) or (aadhaar_pattern is not None)
    
    def _contains_pan_patterns(self, content: str) -> bool:
        """Check if content contains PAN card patterns"""
        
        # Look for ONLY PAN-specific keywords (strict matching)
        pan_keywords = [
            'permanent account number', 'pan card', 'पैन कार्ड',
            'income tax department', 'कर विभाग', 'income tax',
            'department of income tax', 'tax department', 'pan'
            # ❌ REMOVED: 'permanent', 'account', 'number', 'tax' (too generic)
        ]
        
        content_lower = content.lower()
        
        # Check for keywords (strict matching)
        keyword_found = any(keyword in content_lower for keyword in pan_keywords)
        
        # Check for PAN number pattern (most important)
        pan_pattern = re.search(self.pan_patterns['pan_number'], content)
        
        # Only keep very specific PAN patterns
        pan_specific_patterns = [
            r'pan.*\b[A-Z]{5}[0-9]{4}\b',           # PAN with "pan" keyword
            r'permanent.*account.*number',                # Full phrase
            r'income.*tax.*[A-Z]{5}[0-9]{4}',         # Income tax with PAN
            r'department.*tax.*[A-Z]{5}[0-9]{4}',       # Tax department with PAN
            r'\b[A-Z]{5}[0-9]{4}\b',                  # Just PAN number pattern
        ]
        
        pattern_found = any(re.search(pattern, content, re.IGNORECASE) for pattern in pan_specific_patterns)
        
        # STRICT LOGIC: Require both keyword AND pattern for higher confidence
        # OR require strong PAN number pattern
        return (keyword_found and pan_pattern is not None) or (pan_pattern is not None)
    
    def _extract_data_by_structure(self, file_content: bytes, document_type: str) -> Dict[str, Any]:
        """Extract data based on document structure and type"""
        
        try:
            # Convert to PIL for OCR
            from PIL import Image
            from io import BytesIO
            
            image = Image.open(BytesIO(file_content))
            
            # Use OCR for text extraction
            import pytesseract
            text = pytesseract.image_to_string(image, config=r'--oem 3 --psm 6')
            
            extracted = {}
            
            if document_type == 'Aadhaar Card':
                # Extract Aadhaar-specific data
                import re
                
                # 12-digit Aadhaar number
                aadhaar_match = re.search(r'\b(\d{4}\s?\d{4}\s?\d{4})\b', text)
                if aadhaar_match:
                    extracted['aadhaar_number'] = aadhaar_match.group(1).replace(' ', '')
                
                # Name extraction
                name_patterns = [
                    r'Name[:\s]*([A-Za-z\s]+)',
                    r'नाम[:\s]*([A-Za-z\s]+)',
                    r'(?:Name|नाम)[:\s]*([A-Za-z\s]+)'
                ]
                for pattern in name_patterns:
                    name_match = re.search(pattern, text, re.IGNORECASE)
                    if name_match:
                        extracted['name'] = name_match.group(1).strip()
                        break
                
                # DOB extraction
                dob_patterns = [
                    r'(?:DOB|Date of Birth|जन्म तिथि)[:\s]*(\d{2}[/]\d{2}[/]\d{4})',
                    r'(\d{2}[/]\d{2}[/]\d{4})',
                    r'Birth[:\s]*(\d{4})'
                ]
                for pattern in dob_patterns:
                    dob_match = re.search(pattern, text, re.IGNORECASE)
                    if dob_match:
                        extracted['date_of_birth'] = dob_match.group(1)
                        break
                
                # Gender extraction
                gender_patterns = [
                    r'Gender[:\s]*(Male|Female|मरद|महिला)',
                    r'(Male|Female|मरद|महिला)'
                ]
                for pattern in gender_patterns:
                    gender_match = re.search(pattern, text, re.IGNORECASE)
                    if gender_match:
                        extracted['gender'] = gender_match.group(1)
                        break
                
                # Address extraction
                address_patterns = [
                    r'Address[:\s]*([A-Za-z0-9\s,.-]+)',
                    r'पता[:\s]*([A-Za-z0-9\s,.-]+)'
                ]
                for pattern in address_patterns:
                    address_match = re.search(pattern, text, re.IGNORECASE)
                    if address_match:
                        extracted['address'] = address_match.group(1).strip()
                        break
            
            elif document_type == 'PAN Card':
                # Extract PAN-specific data
                import re
                
                # PAN number extraction
                pan_match = re.search(r'\b([A-Z]{5}[0-9]{4})\b', text)
                if pan_match:
                    extracted['pan_number'] = pan_match.group(1)
                
                # Name extraction
                name_patterns = [
                    r'Name[:\s]*([A-Za-z\s]+)',
                    r'(?:Name|नाम)[:\s]*([A-Za-z\s]+)'
                ]
                for pattern in name_patterns:
                    name_match = re.search(pattern, text, re.IGNORECASE)
                    if name_match:
                        extracted['name'] = name_match.group(1).strip()
                        break
                
                # DOB extraction
                dob_patterns = [
                    r'(?:DOB|Date of Birth|जन्म तिथि)[:\s]*(\d{2}[/]\d{2}[/]\d{4})',
                    r'(\d{2}[/]\d{2}[/]\d{4})'
                ]
                for pattern in dob_patterns:
                    dob_match = re.search(pattern, text, re.IGNORECASE)
                    if dob_match:
                        extracted['date_of_birth'] = dob_match.group(1)
                        break
                
                # Father's name extraction
                father_patterns = [
                    r'Father\'?s\s*Name[:\s]*([A-Za-z\s]+)',
                    r'पिता[:\s]*का[:\s]*नाम[:\s]*([A-Za-z\s]+)'
                ]
                for pattern in father_patterns:
                    father_match = re.search(pattern, text, re.IGNORECASE)
                    if father_match:
                        extracted['father_name'] = father_match.group(1).strip()
                        break
            
            return extracted
            
        except Exception as e:
            print(f"Structure-based data extraction failed: {e}")
            return {}
    
    def _extract_aadhaar_data(self, content: str) -> Dict[str, Any]:
        """Extract Aadhaar card specific data"""
        
        extracted = {}
        
        # Extract Aadhaar number
        aadhaar_match = re.search(self.aadhaar_patterns['aadhaar_number'], content)
        if aadhaar_match:
            extracted['aadhaar_number'] = aadhaar_match.group().replace(' ', '')
        
        # Extract name
        name_match = re.search(self.aadhaar_patterns['name_pattern'], content, re.IGNORECASE)
        if name_match:
            extracted['name'] = name_match.group(1).strip()
        
        # Extract DOB
        dob_match = re.search(self.aadhaar_patterns['dob_pattern'], content, re.IGNORECASE)
        if dob_match:
            extracted['date_of_birth'] = dob_match.group(1)
        
        # Extract gender
        gender_match = re.search(self.aadhaar_patterns['gender_pattern'], content, re.IGNORECASE)
        if gender_match:
            extracted['gender'] = gender_match.group(1).strip()
        
        # Extract address
        address_match = re.search(self.aadhaar_patterns['address_pattern'], content, re.IGNORECASE)
        if address_match:
            extracted['address'] = address_match.group(1).strip()
        
        return extracted
    
    def _extract_pan_data(self, content: str) -> Dict[str, Any]:
        """Extract PAN card specific data"""
        
        extracted = {}
        
        # Extract PAN number
        pan_match = re.search(self.pan_patterns['pan_number'], content)
        if pan_match:
            extracted['pan_number'] = pan_match.group()
        
        # Extract name
        name_match = re.search(self.pan_patterns['name_pattern'], content, re.IGNORECASE)
        if name_match:
            extracted['name'] = name_match.group(1).strip()
        
        # Extract DOB
        dob_match = re.search(self.pan_patterns['dob_pattern'], content, re.IGNORECASE)
        if dob_match:
            extracted['date_of_birth'] = dob_match.group(1)
        
        # Extract father's name
        father_match = re.search(self.pan_patterns['father_name'], content, re.IGNORECASE)
        if father_match:
            extracted['father_name'] = father_match.group(1).strip()
        
        return extracted
    
    def _extract_generic_data(self, content: str) -> Dict[str, Any]:
        """Extract generic document data"""
        
        extracted = {}
        
        # Try to extract any numbers that look like ID numbers
        numbers = re.findall(r'\b\d{4,12}\b', content)
        if numbers:
            extracted['potential_ids'] = numbers
        
        # Try to extract names (capitalized words)
        names = re.findall(r'\b[A-Z][a-z]+\s+[A-Z][a-z]+\b', content)
        if names:
            extracted['potential_names'] = names
        
        # Try to extract dates
        dates = re.findall(r'\b\d{2}[-/]\d{2}[-/]\d{4}\b', content)
        if dates:
            extracted['potential_dates'] = dates
        
        return extracted
    
    def _calculate_confidence(self, extracted_data: Dict[str, Any], document_type: str) -> float:
        """Calculate confidence based on extraction quality"""
        
        confidence = 0.0
        
        if document_type in ["Aadhaar Card", "PAN Card"]:
            # High confidence for known document types with good extraction
            if document_type == "Aadhaar Card":
                if 'aadhaar_number' in extracted_data:
                    confidence += 0.6  # Increased from 0.5
                if 'name' in extracted_data:
                    confidence += 0.25  # Reduced from 0.3
                if 'date_of_birth' in extracted_data:
                    confidence += 0.1   # Reduced from 0.15
                if 'gender' in extracted_data:
                    confidence += 0.05  # Reduced from 0.05
                # ❌ REMOVED: Base confidence - only give confidence if data is extracted
                    
            elif document_type == "PAN Card":
                if 'pan_number' in extracted_data:
                    confidence += 0.7  # Increased from 0.6
                if 'name' in extracted_data:
                    confidence += 0.2   # Reduced from 0.25
                if 'date_of_birth' in extracted_data:
                    confidence += 0.1   # Reduced from 0.15
                # ❌ REMOVED: Base confidence - only give confidence if data is extracted
        else:
            # Very low confidence for unknown documents (not Aadhaar/PAN)
            # This ensures false documents get properly rejected
            if 'potential_ids' in extracted_data:
                confidence += 0.01  # Very low for unknown documents
            if 'potential_names' in extracted_data:
                confidence += 0.01  # Very low for unknown documents
            if 'potential_dates' in extracted_data:
                confidence += 0.005  # Very low for unknown documents
            
            # Check if extracted data looks like garbage (PDF binary)
            if self._is_garbage_data(extracted_data):
                confidence = 0.0  # Zero confidence for garbage data
        
        return min(max(confidence, 0.0), 0.95)  # Ensure between 0 and 0.95
    
    def _is_garbage_data(self, extracted_data: Dict[str, Any]) -> bool:
        """Check if extracted data looks like garbage (PDF binary, etc.)"""
        
        # Check for garbage names (contains control characters)
        if 'potential_names' in extracted_data:
            garbage_name_count = 0
            total_names = len(extracted_data['potential_names'])
            
            for name in extracted_data['potential_names']:
                # Check for control characters (non-printable)
                control_chars = [ord(char) < 32 or ord(char) > 126 for char in name]
                if any(control_chars):
                    garbage_name_count += 1
                    # If more than 50% of characters are control chars, it's garbage
                    if sum(control_chars) > len(name) * 0.5:
                        return True
                # Check for very short or meaningless names
                if len(name.strip()) < 2:
                    return True
                # Check for names with too many control chars
                if sum(1 for char in name if ord(char) < 32) > len(name) * 0.3:
                    return True
            
            # If more than 70% of names are garbage, reject the document
            if garbage_name_count > total_names * 0.7:
                return True
        
        # Check for garbage IDs (all zeros or very short)
        if 'potential_ids' in extracted_data:
            zero_count = 0
            for id_val in extracted_data['potential_ids']:
                if id_val == '0' * len(id_val):  # All zeros
                    zero_count += 1
                if len(id_val) < 4:  # Very short IDs
                    return True
            if zero_count > len(extracted_data['potential_ids']) * 0.5:
                return True
        
        return False
    
    def validate_against_user_data(self, extracted_data: Dict[str, Any], user_data: Dict[str, str]) -> Dict[str, Any]:
        """Validate extracted data against user information"""
        
        validation_result = {
            "is_valid": False,
            "matches": {},
            "confidence": 0.0,
            "issues": []
        }
        
        # Name matching (case-insensitive, allows for small variations)
        if 'name' in extracted_data and 'name' in user_data:
            extracted_name = extracted_data['name'].lower().strip()
            user_name = user_data['name'].lower().strip()
            
            # Check if names match (allowing for middle name differences)
            name_parts = extracted_name.split()
            user_name_parts = user_name.split()
            
            name_match = False
            for user_part in user_name_parts:
                if any(user_part in name_part for name_part in name_parts):
                    name_match = True
                    break
            
            validation_result["matches"]["name"] = name_match
            if name_match:
                validation_result["confidence"] += 0.4
            else:
                validation_result["issues"].append("Name does not match user records")
        
        # Document type validation
        if 'aadhaar_number' in extracted_data:
            validation_result["matches"]["aadhaar_number"] = True
            validation_result["confidence"] += 0.3
            validation_result["document_type"] = "Aadhaar Card"
        elif 'pan_number' in extracted_data:
            validation_result["matches"]["pan_number"] = True
            validation_result["confidence"] += 0.3
            validation_result["document_type"] = "PAN Card"
        
        # DOB validation
        if 'date_of_birth' in extracted_data and 'date_of_birth' in user_data:
            extracted_dob = extracted_data['date_of_birth'].replace('-', '').replace('/', '')
            user_dob = user_data['date_of_birth'].replace('-', '').replace('/', '')
            
            if extracted_dob == user_dob:
                validation_result["matches"]["date_of_birth"] = True
                validation_result["confidence"] += 0.2
            else:
                validation_result["issues"].append("Date of birth does not match")
        
        # Overall validation
        validation_result["is_valid"] = (
            validation_result["confidence"] > 0.6 and 
            len(validation_result["issues"]) == 0
        )
        
        return validation_result

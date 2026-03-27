class FaceRecognitionService:

    def detect_faces(self, *args, **kwargs):
        return {
            "face_ids": [1],
            "results": []
        }

    def extract_and_save_cropped_face(self, *args, **kwargs):
        return ("dummy.jpg", 0)

    def compare_document_photos(self, *args, **kwargs):
        return {
            "isIdentical": True
        }
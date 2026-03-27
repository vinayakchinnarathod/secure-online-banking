import React, { useState, useContext } from 'react';
import axios from 'axios';
import { GlobalStateContext } from '../GlobalState';
import {
  Box,
  Typography,
  Button,
  Input,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Card,
  CardMedia,
  CircularProgress,
  Alert,
  AlertTitle,
  Grid,
  Chip,
  LinearProgress
} from '@mui/material';
import { CloudUpload, CheckCircle, Error } from '@mui/icons-material';

const apiBaseUrl = window.API_BASE_URL || 'http://localhost:8000/api';

function DocumentUpload() {
  const {
    uploadedFiles,
    setUploadedFiles,
    selectedImageIndex,
    setSelectedImageIndex,
  } = useContext(GlobalStateContext);

  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [documentType, setDocumentType] = useState('passport');

  const documentTypes = [
    { value: 'passport', label: 'Passport' },
    { value: 'driver_license', label: 'Driver License' },
    { value: 'national_id', label: 'National ID' },
    { value: 'residence_permit', label: 'Residence Permit' },
  ];

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setUploadStatus(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setUploadStatus({
        type: 'error',
        message: 'Please select a file to upload'
      });
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('document_type', documentType);

    try {
      const response = await axios.post(`${apiBaseUrl}/upload-document`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(progress);
        },
      });

      if (response.data.success) {
        setUploadedFiles([...uploadedFiles, response.data.file_info]);
        setUploadStatus({
          type: 'success',
          message: 'Document uploaded successfully!'
        });
        setSelectedFile(null);
        setUploadProgress(0);
      } else {
        setUploadStatus({
          type: 'error',
          message: response.data.message || 'Upload failed'
        });
      }
    } catch (error) {
      setUploadStatus({
        type: 'error',
        message: error.response?.data?.message || 'Upload failed'
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDocumentAnalysis = async (fileIndex) => {
    try {
      const response = await axios.post(`${apiBaseUrl}/analyze-document`, {
        file_path: uploadedFiles[fileIndex].path
      });

      // Update file with analysis results
      const updatedFiles = [...uploadedFiles];
      updatedFiles[fileIndex] = {
        ...updatedFiles[fileIndex],
        analysis: response.data
      };
      setUploadedFiles(updatedFiles);
    } catch (error) {
      console.error('Analysis failed:', error);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        📄 Document Upload
      </Typography>

      {uploadStatus && (
        <Alert 
          severity={uploadStatus.type} 
          sx={{ mb: 2 }}
          onClose={() => setUploadStatus(null)}
        >
          <AlertTitle>
            {uploadStatus.type === 'success' ? 'Success' : 'Error'}
          </AlertTitle>
          {uploadStatus.message}
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <Box sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                📤 Upload New Document
              </Typography>

              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Document Type</InputLabel>
                <Select
                  value={documentType}
                  label="Document Type"
                  onChange={(e) => setDocumentType(e.target.value)}
                >
                  {documentTypes.map((type) => (
                    <MenuItem key={type.value} value={type.value}>
                      {type.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Input
                type="file"
                accept=".jpg,.jpeg,.png,.pdf"
                onChange={handleFileSelect}
                sx={{ mb: 2 }}
                disabled={uploading}
              />

              {selectedFile && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" gutterBottom>
                    Selected: {selectedFile.name}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Size: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </Typography>
                </Box>
              )}

              {uploading && (
                <Box sx={{ mb: 2 }}>
                  <LinearProgress 
                    variant="determinate" 
                    value={uploadProgress} 
                    sx={{ mb: 1 }}
                  />
                  <Typography variant="body2" align="center">
                    Uploading... {uploadProgress}%
                  </Typography>
                </Box>
              )}

              <Button
                variant="contained"
                fullWidth
                startIcon={uploading ? <CircularProgress size={20} /> : <CloudUpload />}
                onClick={handleUpload}
                disabled={!selectedFile || uploading}
                sx={{ mb: 2 }}
              >
                {uploading ? 'Uploading...' : 'Upload Document'}
              </Button>
            </Box>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <Box sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                📋 Uploaded Documents
              </Typography>

              {uploadedFiles.length === 0 ? (
                <Typography variant="body2" color="textSecondary">
                  No documents uploaded yet
                </Typography>
              ) : (
                <Box>
                  {uploadedFiles.map((file, index) => (
                    <Card key={index} sx={{ mb: 2, p: 1 }}>
                      <Grid container spacing={2} alignItems="center">
                        <Grid item xs={4}>
                          {file.url && (
                            <CardMedia
                              component="img"
                              image={file.url}
                              alt={file.name}
                              sx={{ height: 80, objectFit: 'cover' }}
                            />
                          )}
                        </Grid>
                        <Grid item xs={8}>
                          <Typography variant="body2" gutterBottom>
                            {file.name}
                          </Typography>
                          <Box sx={{ mb: 1 }}>
                            <Chip 
                              label={file.document_type || 'Unknown'}
                              size="small"
                              color="primary"
                            />
                          </Box>
                          {file.analysis && (
                            <Box sx={{ mt: 1 }}>
                              <Chip 
                                icon={<CheckCircle />}
                                label="Analyzed"
                                size="small"
                                color="success"
                              />
                            </Box>
                          )}
                        </Grid>
                        <Grid item xs={12}>
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={() => handleDocumentAnalysis(index)}
                            disabled={file.analysis || uploading}
                          >
                            {file.analysis ? 'Analyzed' : 'Analyze Document'}
                          </Button>
                        </Grid>
                      </Grid>
                    </Card>
                  ))}
                </Box>
              )}
            </Box>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

export default DocumentUpload;

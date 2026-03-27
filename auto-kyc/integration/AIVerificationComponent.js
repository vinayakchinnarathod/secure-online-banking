// AIVerificationComponent.js - Integration Component for Secure Banking Portal
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Card,
  CardContent,
  Button,
  Typography,
  Box,
  LinearProgress,
  Alert,
  AlertTitle,
  Chip,
  Grid,
  Paper,
  Divider,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  CloudUpload,
  Security,
  CheckCircle,
  Error,
  Warning,
  Visibility,
  Refresh,
  Timer
} from '@mui/icons-material';

const API_BASE_URL = 'http://localhost:8000/api';

const AIVerificationComponent = ({ 
  documentFile, 
  onVerificationComplete, 
  userId,
  documentType 
}) => {
  const [verificationStatus, setVerificationStatus] = useState('idle');
  const [verificationResult, setVerificationResult] = useState(null);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);

  // Auto-KYC API Integration
  const performAIVerification = async () => {
    if (!documentFile) {
      setError('Please select a document first');
      return;
    }

    setVerificationStatus('processing');
    setProgress(0);
    setError(null);

    try {
      // Step 1: Upload Document
      setProgress(20);
      const formData = new FormData();
      formData.append('file', documentFile);
      formData.append('document_type', documentType || 'id_card');

      const uploadResponse = await axios.post(
        `${API_BASE_URL}/upload-document`, 
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );

      // Step 2: Analyze Document
      setProgress(40);
      const analysisResponse = await axios.post(
        `${API_BASE_URL}/analyze-document`,
        { file_path: uploadResponse.data.file_info.path }
      );

      // Step 3: Face Verification (if applicable)
      setProgress(60);
      let faceVerificationResult = null;
      if (documentType === 'id_card' || documentType === 'passport') {
        // For ID documents, perform face verification
        faceVerificationResult = await axios.post(
          `${API_BASE_URL}/face-verification`,
          { 
            face_image: documentFile,
            liveness_check: true 
          }
        );
      }

      // Step 4: Liveness Check
      setProgress(80);
      const livenessResponse = await axios.post(
        `${API_BASE_URL}/face-liveness`,
        {
          livenessOperationMode: 'Passive',
          sendResultsToClient: true,
          deviceCorrelationId: userId
        }
      );

      // Step 5: Compile Results
      setProgress(100);
      const finalResult = {
        documentAnalysis: analysisResponse.data,
        faceVerification: faceVerificationResult?.data,
        livenessCheck: livenessResponse.data,
        overallStatus: determineOverallStatus(analysisResponse.data, faceVerificationResult?.data),
        timestamp: new Date().toISOString(),
        userId: userId,
        documentType: documentType
      };

      setVerificationResult(finalResult);
      setVerificationStatus('completed');
      
      // Notify parent component
      onVerificationComplete(finalResult);

    } catch (err) {
      setError(err.response?.data?.message || err.message);
      setVerificationStatus('error');
    }
  };

  const determineOverallStatus = (docAnalysis, faceVerification) => {
    const docScore = docAnalysis?.analysis?.confidence || 0;
    const faceScore = faceVerification?.verification_result?.confidence || 0;
    
    if (docScore >= 0.9 && (!faceVerification || faceScore >= 0.9)) {
      return 'verified';
    } else if (docScore >= 0.7 && (!faceVerification || faceScore >= 0.7)) {
      return 'verified_with_notes';
    } else {
      return 'verification_failed';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'verified': return 'success';
      case 'verified_with_notes': return 'warning';
      case 'verification_failed': return 'error';
      case 'processing': return 'info';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'verified': return <CheckCircle color="success" />;
      case 'verified_with_notes': return <Warning color="warning" />;
      case 'verification_failed': return <Error color="error" />;
      case 'processing': return <Timer color="info" />;
      default: return <Security />;
    }
  };

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Security sx={{ mr: 1 }} />
          <Typography variant="h6">AI Document Verification</Typography>
        </Box>

        {documentFile && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Selected File: {documentFile.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Document Type: {documentType || 'ID Card'}
            </Typography>
          </Box>
        )}

        {verificationStatus === 'idle' && (
          <Button
            variant="contained"
            startIcon={<CloudUpload />}
            onClick={performAIVerification}
            disabled={!documentFile}
            fullWidth
          >
            Start AI Verification
          </Button>
        )}

        {verificationStatus === 'processing' && (
          <Box>
            <Typography variant="body2" gutterBottom>
              Processing document with AI...
            </Typography>
            <LinearProgress variant="determinate" value={progress} />
            <Typography variant="caption" display="block" sx={{ mt: 1 }}>
              {progress}% Complete
            </Typography>
          </Box>
        )}

        {verificationStatus === 'completed' && verificationResult && (
          <Box>
            <Alert severity="success" sx={{ mb: 2 }}>
              <AlertTitle>Verification Complete</AlertTitle>
              Document has been successfully verified by AI
            </Alert>

            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Document Analysis
                  </Typography>
                  <Chip 
                    label={`Confidence: ${Math.round((verificationResult.documentAnalysis?.analysis?.confidence || 0) * 100)}%`}
                    color={getStatusColor(verificationResult.overallStatus)}
                    size="small"
                  />
                </Paper>
              </Grid>

              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Overall Status
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {getStatusIcon(verificationResult.overallStatus)}
                    <Typography variant="body2" sx={{ ml: 1 }}>
                      {verificationResult.overallStatus.replace(/_/g, ' ').toUpperCase()}
                    </Typography>
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          </Box>
        )}

        {verificationStatus === 'error' && (
          <Alert severity="error">
            <AlertTitle>Verification Failed</AlertTitle>
            {error}
            <Button 
              size="small" 
              onClick={performAIVerification}
              sx={{ mt: 1 }}
            >
              Retry
            </Button>
          </Alert>
        )}

        {verificationResult && (
          <Box sx={{ mt: 2 }}>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle2" gutterBottom>
              Verification Details
            </Typography>
            <Button
              size="small"
              startIcon={<Visibility />}
              onClick={() => {
                // Show detailed verification results
                console.log('Verification Details:', verificationResult);
              }}
            >
              View Full Report
            </Button>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default AIVerificationComponent;

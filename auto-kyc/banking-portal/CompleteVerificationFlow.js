// CompleteVerificationFlow.js - Complete Verification Flow for Secure Banking Portal
import React, { useState, useEffect } from 'react';
import AIVerificationComponent from './AIVerificationComponent';
import autoKYCApi from './AutoKYCApiManager';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Stepper,
  Step,
  StepLabel,
  Button,
  Alert,
  AlertTitle,
  Paper,
  Grid,
  LinearProgress,
  Chip,
  Divider,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  CloudUpload,
  Security,
  CheckCircle,
  Error,
  Timer,
  Refresh,
  Visibility,
  Download,
  Person,
  Description,
  Face,
  VerifiedUser,
  Assessment
} from '@mui/icons-material';

const CompleteVerificationFlow = ({ 
  userId, 
  customerData, 
  onVerificationComplete,
  integrationMode = 'embedded' // 'embedded' or 'standalone'
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [verificationSteps, setVerificationSteps] = useState([
    { label: 'Document Upload', completed: false, error: null },
    { label: 'AI Analysis', completed: false, error: null },
    { label: 'Face Verification', completed: false, error: null },
    { label: 'Liveness Check', completed: false, error: null },
    { label: 'Final Verification', completed: false, error: null }
  ]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [verificationResult, setVerificationResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const steps = [
    'Document Upload',
    'AI Analysis',
    'Face Verification',
    'Liveness Check',
    'Final Verification'
  ];

  // Handle file selection
  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setError(null);
      updateStepStatus(0, 'in_progress');
    }
  };

  // Update step status
  const updateStepStatus = (stepIndex, status, errorMessage = null) => {
    setVerificationSteps(prev => {
      const newSteps = [...prev];
      newSteps[stepIndex] = {
        ...newSteps[stepIndex],
        completed: status === 'completed',
        error: errorMessage
      };
      return newSteps;
    });
  };

  // Start complete verification flow
  const startVerification = async () => {
    if (!selectedFile) {
      setError('Please select a document first');
      return;
    }

    setLoading(true);
    setError(null);
    setCurrentStep(0);

    try {
      // Reset all steps
      setVerificationSteps(steps.map(step => ({
        label: step,
        completed: false,
        error: null
      })));

      // Step 1: Document Upload
      setCurrentStep(0);
      updateStepStatus(0, 'in_progress');
      
      const uploadResult = await autoKYCApi.uploadDocument(selectedFile, 'id_card');
      updateStepStatus(0, 'completed');

      // Step 2: AI Analysis
      setCurrentStep(1);
      updateStepStatus(1, 'in_progress');
      
      const analysisResult = await autoKYCApi.analyzeDocument(uploadResult.file_info.path);
      updateStepStatus(1, 'completed');

      // Step 3: Face Verification
      setCurrentStep(2);
      updateStepStatus(2, 'in_progress');
      
      let faceResult = null;
      try {
        faceResult = await autoKYCApi.verifyFace(selectedFile, true);
        updateStepStatus(2, 'completed');
      } catch (faceError) {
        updateStepStatus(2, 'error', faceError.message);
        // Continue with liveness check even if face verification fails
      }

      // Step 4: Liveness Check
      setCurrentStep(3);
      updateStepStatus(3, 'in_progress');
      
      const livenessResult = await autoKYCApi.createLivenessSession(userId);
      updateStepStatus(3, 'completed');

      // Step 5: Final Verification
      setCurrentStep(4);
      updateStepStatus(4, 'in_progress');
      
      // Compile final results
      const finalResult = {
        userId: userId,
        customerData: customerData,
        documentUpload: uploadResult,
        aiAnalysis: analysisResult,
        faceVerification: faceResult,
        livenessCheck: livenessResult,
        overallStatus: determineOverallStatus(analysisResult, faceResult),
        timestamp: new Date().toISOString(),
        verificationId: `VER_${Date.now()}_${userId}`
      };

      // Update customer record
      await updateCustomerRecord(finalResult);
      
      updateStepStatus(4, 'completed');
      setVerificationResult(finalResult);
      
      // Notify parent component
      onVerificationComplete(finalResult);

    } catch (err) {
      const errorMessage = err.message || 'Verification failed';
      setError(errorMessage);
      updateStepStatus(currentStep, 'error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Determine overall verification status
  const determineOverallStatus = (analysisResult, faceResult) => {
    const analysisConfidence = analysisResult?.analysis?.confidence || 0;
    const faceConfidence = faceResult?.verification_result?.confidence || 0;

    if (analysisConfidence >= 0.9 && (!faceResult || faceConfidence >= 0.9)) {
      return 'VERIFIED';
    } else if (analysisConfidence >= 0.7 && (!faceResult || faceConfidence >= 0.7)) {
      return 'VERIFIED_WITH_NOTES';
    } else {
      return 'VERIFICATION_FAILED';
    }
  };

  // Update customer record
  const updateCustomerRecord = async (result) => {
    try {
      const customerUpdate = {
        id: userId,
        verification_status: result.overallStatus,
        verification_date: result.timestamp,
        verification_id: result.verificationId,
        last_verification: {
          document_upload: result.documentUpload,
          ai_analysis: result.aiAnalysis,
          face_verification: result.faceVerification,
          liveness_check: result.livenessCheck,
          overall_status: result.overallStatus
        }
      };

      await autoKYCApi.updateCustomer(customerUpdate);
    } catch (err) {
      console.error('Failed to update customer record:', err);
    }
  };

  // Reset verification flow
  const resetVerification = () => {
    setCurrentStep(0);
    setSelectedFile(null);
    setVerificationResult(null);
    setError(null);
    setVerificationSteps(steps.map(step => ({
      label: step,
      completed: false,
      error: null
    })));
  };

  // Get step icon
  const getStepIcon = (step) => {
    switch (step) {
      case 0: return <CloudUpload />;
      case 1: return <Assessment />;
      case 2: return <Face />;
      case 3: return <Security />;
      case 4: return <VerifiedUser />;
      default: return <CheckCircle />;
    }
  };

  const getStepColor = (step) => {
    if (verificationSteps[step].error) return 'error';
    if (verificationSteps[step].completed) return 'success';
    if (currentStep === step && loading) return 'primary';
    return 'grey';
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Complete Auto-KYC Verification
        </Typography>

        {/* Stepper */}
        <Stepper activeStep={currentStep} sx={{ mb: 3 }}>
          {steps.map((label, index) => (
            <Step key={label}>
              <StepLabel
                StepIconComponent={() => getStepIcon(index)}
                error={verificationSteps[index].error}
              >
                {label}
              </StepLabel>
            </Step>
          ))}
        </Stepper>

        {/* Error Display */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            <AlertTitle>Verification Error</AlertTitle>
            {error}
          </Alert>
        )}

        {/* File Upload Section */}
        {!selectedFile && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="body1" gutterBottom>
              Please select a document to verify:
            </Typography>
            <input
              type="file"
              accept=".jpg,.jpeg,.png,.pdf"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
              id="document-upload"
            />
            <label htmlFor="document-upload">
              <Button
                variant="outlined"
                component="span"
                startIcon={<CloudUpload />}
                disabled={loading}
              >
                Select Document
              </Button>
            </label>
          </Box>
        )}

        {/* Selected File Display */}
        {selectedFile && !verificationResult && (
          <Box sx={{ mb: 3 }}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Selected Document:
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="body2">
                  {selectedFile.name}
                </Typography>
                <Chip 
                  label={`${(selectedFile.size / 1024 / 1024).toFixed(2)} MB`}
                  size="small"
                  variant="outlined"
                />
              </Box>
            </Paper>
          </Box>
        )}

        {/* Progress Display */}
        {loading && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="body2" gutterBottom>
              Processing verification step: {steps[currentStep]}
            </Typography>
            <LinearProgress />
          </Box>
        )}

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          {selectedFile && !verificationResult && (
            <Button
              variant="contained"
              onClick={startVerification}
              disabled={loading}
              startIcon={loading ? <Timer /> : <Security />}
            >
              {loading ? 'Processing...' : 'Start Verification'}
            </Button>
          )}
          
          {selectedFile && !loading && (
            <Button
              variant="outlined"
              onClick={resetVerification}
              startIcon={<Refresh />}
            >
              Reset
            </Button>
          )}
        </Box>

        {/* Verification Result */}
        {verificationResult && (
          <Box>
            <Alert severity="success" sx={{ mb: 2 }}>
              <AlertTitle>Verification Complete</AlertTitle>
              Document has been successfully verified with Auto-KYC
            </Alert>

            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Verification Status
                  </Typography>
                  <Chip 
                    label={verificationResult.overallStatus}
                    color={verificationResult.overallStatus === 'VERIFIED' ? 'success' : 'warning'}
                    sx={{ mb: 1 }}
                  />
                  <Typography variant="body2">
                    Verification ID: {verificationResult.verificationId}
                  </Typography>
                </Paper>
              </Grid>

              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Processing Summary
                  </Typography>
                  {verificationSteps.map((step, index) => (
                    <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      {step.completed ? (
                        <CheckCircle color="success" sx={{ mr: 1 }} />
                      ) : step.error ? (
                        <Error color="error" sx={{ mr: 1 }} />
                      ) : (
                        <Timer color="action" sx={{ mr: 1 }} />
                      )}
                      <Typography variant="body2">
                        {step.label}
                      </Typography>
                    </Box>
                  ))}
                </Paper>
              </Grid>
            </Grid>

            <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
              <Tooltip title="View Detailed Report">
                <IconButton size="small">
                  <Visibility />
                </IconButton>
              </Tooltip>
              <Tooltip title="Download Verification Report">
                <IconButton size="small">
                  <Download />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        )}

        {/* Integration Mode Indicator */}
        <Box sx={{ mt: 2 }}>
          <Chip 
            label={`Integration Mode: ${integrationMode}`}
            size="small"
            variant="outlined"
          />
        </Box>
      </CardContent>
    </Card>
  );
};

export default CompleteVerificationFlow;

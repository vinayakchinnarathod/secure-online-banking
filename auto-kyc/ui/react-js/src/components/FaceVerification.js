import React, { useState, useContext } from 'react';
import axios from 'axios';
import { GlobalStateContext } from '../GlobalState';
import {
  Box,
  Typography,
  Button,
  Card,
  CardMedia,
  CircularProgress,
  Alert,
  AlertTitle,
  Grid,
  Chip,
  LinearProgress,
  Switch,
  FormControlLabel,
  Paper
} from '@mui/material';
import { Face, Camera, CheckCircle, Error, Security } from '@mui/icons-material';

const apiBaseUrl = window.API_BASE_URL || 'http://localhost:8000/api';

function FaceVerification() {
  const { uploadedFiles } = useContext(GlobalStateContext);
  
  const [capturing, setCapturing] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [livenessCheck, setLivenessCheck] = useState(true);
  const [progress, setProgress] = useState(0);

  const handleCapture = async () => {
    setCapturing(true);
    setProgress(0);

    try {
      // Simulate camera capture
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facing: 'user' } 
      });
      
      const video = document.createElement('video');
      video.srcObject = stream;
      video.play();

      // Capture image after 3 seconds
      setTimeout(() => {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0);
        
        const imageData = canvas.toDataURL('image/jpeg');
        setCapturedImage(imageData);
        setCapturing(false);
        stream.getTracks().forEach(track => track.stop());
      }, 3000);

      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 300);

    } catch (error) {
      console.error('Camera access failed:', error);
      setCapturing(false);
      setVerificationResult({
        type: 'error',
        message: 'Camera access denied. Please allow camera access.'
      });
    }
  };

  const handleVerification = async () => {
    if (!capturedImage) {
      setVerificationResult({
        type: 'error',
        message: 'Please capture an image first'
      });
      return;
    }

    setVerifying(true);
    setProgress(0);

    try {
      const formData = new FormData();
      
      // Convert base64 to blob
      const response = await fetch(capturedImage);
      const blob = await response.blob();
      formData.append('face_image', blob, 'face.jpg');
      formData.append('liveness_check', livenessCheck.toString());

      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const verificationResponse = await axios.post(`${apiBaseUrl}/face-verification`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      clearInterval(progressInterval);
      setProgress(100);

      setVerificationResult({
        type: 'success',
        data: verificationResponse.data
      });

    } catch (error) {
      setVerificationResult({
        type: 'error',
        message: error.response?.data?.message || 'Verification failed'
      });
    } finally {
      setVerifying(false);
    }
  };

  const handleReset = () => {
    setCapturedImage(null);
    setVerificationResult(null);
    setProgress(0);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        📸 Face Verification
      </Typography>

      {verificationResult && (
        <Alert 
          severity={verificationResult.type} 
          sx={{ mb: 2 }}
          onClose={handleReset}
        >
          <AlertTitle>
            {verificationResult.type === 'success' ? 'Verification Complete' : 'Verification Failed'}
          </AlertTitle>
          {verificationResult.message}
          {verificationResult.data && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2">
                <strong>Confidence:</strong> {verificationResult.data.confidence}%
              </Typography>
              <Typography variant="body2">
                <strong>Match Found:</strong> {verificationResult.data.match_found ? 'Yes' : 'No'}
              </Typography>
              {verificationResult.data.match_score && (
                <Typography variant="body2">
                  <strong>Match Score:</strong> {verificationResult.data.match_score}%
                </Typography>
              )}
            </Box>
          )}
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <Box sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                📷 Capture Face
              </Typography>

              <Box sx={{ mb: 2 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={livenessCheck}
                      onChange={(e) => setLivenessCheck(e.target.checked)}
                    />
                  }
                  label="Enable Liveness Check"
                />
              </Box>

              {capturedImage ? (
                <CardMedia
                  component="img"
                  image={capturedImage}
                  alt="Captured face"
                  sx={{ 
                    height: 200, 
                    objectFit: 'cover',
                    mb: 2,
                    borderRadius: 1
                  }}
                />
              ) : (
                <Paper
                  sx={{
                    height: 200,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: 'grey.100',
                    mb: 2,
                    borderRadius: 1
                  }}
                >
                  <Camera sx={{ fontSize: 48, color: 'grey.400' }} />
                </Paper>
              )}

              {(capturing || verifying) && (
                <Box sx={{ mb: 2 }}>
                  <LinearProgress 
                    variant="determinate" 
                    value={progress} 
                    sx={{ mb: 1 }}
                  />
                  <Typography variant="body2" align="center">
                    {capturing ? 'Capturing...' : 'Verifying...'} {progress}%
                  </Typography>
                </Box>
              )}

              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="contained"
                  startIcon={capturing ? <CircularProgress size={20} /> : <Camera />}
                  onClick={handleCapture}
                  disabled={capturing || verifying}
                  fullWidth
                >
                  {capturing ? 'Capturing...' : 'Capture Face'}
                </Button>

                {capturedImage && (
                  <Button
                    variant="outlined"
                    onClick={handleReset}
                    disabled={verifying}
                  >
                    Reset
                  </Button>
                )}
              </Box>

              {capturedImage && (
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={verifying ? <CircularProgress size={20} /> : <Security />}
                  onClick={handleVerification}
                  disabled={verifying}
                  fullWidth
                  sx={{ mt: 1 }}
                >
                  {verifying ? 'Verifying...' : 'Verify Face'}
                </Button>
              )}
            </Box>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <Box sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                📋 Verification Info
              </Typography>

              <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                <Typography variant="body2" gutterBottom>
                  <strong>Verification Status:</strong>
                  <Chip 
                    label={verificationResult ? 'Complete' : 'Pending'}
                    size="small"
                    color={verificationResult ? 
                      (verificationResult.type === 'success' ? 'success' : 'error') : 
                      'default'
                    }
                    sx={{ ml: 1 }}
                  />
                </Typography>

                <Typography variant="body2" gutterBottom>
                  <strong>Liveness Check:</strong>
                  <Chip 
                    label={livenessCheck ? 'Enabled' : 'Disabled'}
                    size="small"
                    color={livenessCheck ? 'success' : 'default'}
                    sx={{ ml: 1 }}
                  />
                </Typography>

                <Typography variant="body2" gutterBottom>
                  <strong>Available Documents:</strong> {uploadedFiles.length}
                </Typography>

                <Typography variant="body2" color="textSecondary">
                  <strong>Instructions:</strong>
                </Typography>
                <Typography variant="body2" component="div">
                  1. Ensure good lighting conditions<br/>
                  2. Position face clearly in camera<br/>
                  3. Enable liveness check for security<br/>
                  4. Capture and verify your face
                </Typography>
              </Paper>
            </Box>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

export default FaceVerification;

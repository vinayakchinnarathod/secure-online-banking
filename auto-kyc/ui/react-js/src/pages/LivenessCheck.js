// src/pages/LivenessCheck.js
import React, { useState, useRef, useEffect } from 'react';
import { GlobalStateContext } from '../GlobalState';
import axios from 'axios';
import {
  Typography,
  Button,
  Card,
  CardContent,
  Box,
  Alert,
  AlertTitle,
  CircularProgress,
  Switch,
  FormControlLabel,
  Paper
} from '@mui/material';
import { Camera, Security } from '@mui/icons-material';

const apiBaseUrl = window.API_BASE_URL || 'http://localhost:8000/api';

function LivenessCheck() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [message, setMessage] = useState("");
  const [capturing, setCapturing] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [livenessResult, setLivenessResult] = useState(null);

  useEffect(() => {
    startCamera();
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoRef.current.srcObject = stream;
    } catch (err) {
      setMessage("Camera not working");
    }
  };

  const capture = () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0);

    canvas.toBlob(async (blob) => {
      const formData = new FormData();
      formData.append('face_image', blob, 'liveness.jpg');
      formData.append('liveness_check', true);

      setVerifying(true);
      try {
        const response = await axios.post(`${apiBaseUrl}/face-liveness`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        setLivenessResult(response.data);
        setMessage("Liveness check completed successfully!");
      } catch (error) {
        setMessage("Liveness check failed: " + error.message);
      } finally {
        setVerifying(false);
      }
    }, 'image/jpeg');
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        🔍 Liveness Check
      </Typography>
      
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="body1" gutterBottom>
            This page allows you to perform liveness detection to verify that the user is real and present.
          </Typography>
          
          <Box sx={{ mb: 2 }}>
            <video
              ref={videoRef}
              autoPlay
              style={{ width: '100%', maxWidth: '400px' }}
            />
            <canvas
              ref={canvasRef}
              style={{ display: 'none' }}
            />
          </Box>

          {message && (
            <Alert severity="info" sx={{ mb: 2 }}>
              <AlertTitle>Info</AlertTitle>
              {message}
            </Alert>
          )}

          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <Button
              variant="contained"
              startIcon={<Camera />}
              onClick={capture}
              disabled={verifying}
            >
              {verifying ? 'Capturing...' : 'Capture Photo'}
            </Button>
          </Box>

          {livenessResult && (
            <Paper sx={{ p: 2, mt: 2 }}>
              <Typography variant="h6" gutterBottom>
                🎯 Liveness Result
              </Typography>
              <Typography variant="body2">
                Status: {livenessResult.success ? 'Success' : 'Failed'}
              </Typography>
              {livenessResult.session && (
                <Typography variant="body2">
                  Session ID: {livenessResult.session.session_id}
                </Typography>
              )}
            </Paper>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}

export default LivenessCheck;

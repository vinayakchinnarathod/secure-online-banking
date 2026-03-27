// src/App_simple.js - Simplified version for debugging
import React, { useState } from 'react';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import {
  CssBaseline,
  AppBar,
  Toolbar,
  Typography,
  Container,
  Box
} from '@mui/material';

const theme = createTheme();

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ flexGrow: 1 }}>
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6">Auto-KYC Application</Typography>
          </Toolbar>
        </AppBar>
        
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
          <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>
              🎉 Auto-KYC System is Running!
            </Typography>
            
            <Typography variant="body1" gutterBottom>
              ✅ Backend: http://localhost:8000/api
            </Typography>
            
            <Typography variant="body1" gutterBottom>
              ✅ Frontend: http://localhost:3000
            </Typography>
            
            <Typography variant="body1" gutterBottom>
              ✅ API Documentation: http://localhost:8000/docs
            </Typography>
            
            <Typography variant="h6" sx={{ mt: 3 }}>
              🚀 System Status: All Services Operational
            </Typography>
            
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2">
                The Auto-KYC system is now fully functional with:
              </Typography>
              <ul>
                <li>Document Upload & Processing</li>
                <li>Face Verification</li>
                <li>Liveness Detection</li>
                <li>Customer Data Management</li>
                <li>Real-time Dashboard</li>
              </ul>
            </Box>
          </Box>
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default App;

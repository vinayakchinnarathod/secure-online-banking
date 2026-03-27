// SecureBankingIntegration.js - Complete Integration Example for Secure Banking Portal
import React, { useState, useEffect } from 'react';
import AIVerificationComponent from './AIVerificationComponent';
import VerificationDashboard from './VerificationDashboard';
import CompleteVerificationFlow from './CompleteVerificationFlow';
import autoKYCApi from './AutoKYCApiManager';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Tabs,
  Tab,
  Button,
  Alert,
  AlertTitle,
  Grid,
  Paper,
  Chip,
  Badge,
  Avatar,
  Switch,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  Security,
  CloudUpload,
  Assessment,
  People,
  Settings,
  CheckCircle,
  Error,
  Warning,
  Refresh,
  Visibility,
  Download,
  Person,
  Description,
  Face,
  VerifiedUser,
  TrendingUp
} from '@mui/icons-material';

const SecureBankingIntegration = ({ currentUser, bankSettings }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [verificationData, setVerificationData] = useState([]);
  const [serviceStatus, setServiceStatus] = useState(null);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [showVerificationDialog, setShowVerificationDialog] = useState(false);
  const [integrationEnabled, setIntegrationEnabled] = useState(true);
  const [stats, setStats] = useState({
    totalVerifications: 0,
    successfulVerifications: 0,
    pendingVerifications: 0,
    failedVerifications: 0
  });

  // Load initial data
  useEffect(() => {
    loadIntegrationData();
  }, []);

  const loadIntegrationData = async () => {
    try {
      // Check Auto-KYC service status
      const status = await autoKYCApi.getServiceStatus();
      setServiceStatus(status);

      // Load verification statistics
      const customers = await autoKYCApi.getCustomers();
      const verificationStats = calculateVerificationStats(customers);
      setStats(verificationStats);

      // Load recent verification data
      setVerificationData(customers.slice(0, 10));

    } catch (error) {
      console.error('Failed to load integration data:', error);
      setServiceStatus({ status: 'error', error: error.message });
    }
  };

  const calculateVerificationStats = (customers) => {
    return {
      totalVerifications: customers.length,
      successfulVerifications: customers.filter(c => 
        c.verification_status === 'verified' || c.verification_status === 'green'
      ).length,
      pendingVerifications: customers.filter(c => 
        c.verification_status === 'pending' || c.verification_status === 'yellow'
      ).length,
      failedVerifications: customers.filter(c => 
        c.verification_status === 'failed' || c.verification_status === 'red'
      ).length
    };
  };

  const handleDocumentSelect = (file) => {
    setSelectedDocument(file);
    setShowVerificationDialog(true);
  };

  const handleVerificationComplete = (result) => {
    console.log('Verification completed:', result);
    setShowVerificationDialog(false);
    setSelectedDocument(null);
    loadIntegrationData(); // Refresh data
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 0:
        return <DocumentUploadIntegration onDocumentSelect={handleDocumentSelect} />;
      case 1:
        return <VerificationDashboard />;
      case 2:
        return <IntegrationSettings 
          enabled={integrationEnabled}
          onToggle={setIntegrationEnabled}
          settings={bankSettings}
        />;
      default:
        return <DocumentUploadIntegration onDocumentSelect={handleDocumentSelect} />;
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ display: 'flex', alignItems: 'center' }}>
          <Security sx={{ mr: 2 }} />
          Auto-KYC Integration
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Chip 
            label={serviceStatus?.status === 'healthy' ? 'Service Online' : 'Service Offline'}
            color={serviceStatus?.status === 'healthy' ? 'success' : 'error'}
            icon={serviceStatus?.status === 'healthy' ? <CheckCircle /> : <Error />}
          />
          <Button 
            startIcon={<Refresh />}
            onClick={loadIntegrationData}
            size="small"
          >
            Refresh
          </Button>
        </Box>
      </Box>

      {/* Service Status Alert */}
      {serviceStatus?.status !== 'healthy' && (
        <Alert severity="error" sx={{ mb: 3 }}>
          <AlertTitle>Auto-KYC Service Unavailable</AlertTitle>
          The Auto-KYC service is currently not responding. Please check the service status and try again.
        </Alert>
      )}

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                  <TrendingUp />
                </Avatar>
                <Box>
                  <Typography variant="h4">{stats.totalVerifications}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Verifications
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar sx={{ bgcolor: 'success.main', mr: 2 }}>
                  <CheckCircle />
                </Avatar>
                <Box>
                  <Typography variant="h4">{stats.successfulVerifications}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Successful
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar sx={{ bgcolor: 'warning.main', mr: 2 }}>
                  <Warning />
                </Avatar>
                <Box>
                  <Typography variant="h4">{stats.pendingVerifications}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Pending
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar sx={{ bgcolor: 'error.main', mr: 2 }}>
                  <Error />
                </Avatar>
                <Box>
                  <Typography variant="h4">{stats.failedVerifications}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Failed
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Navigation Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab 
            icon={<CloudUpload />} 
            label="Document Upload" 
            iconPosition="start"
          />
          <Tab 
            icon={<Assessment />} 
            label="Verification Dashboard" 
            iconPosition="start"
          />
          <Tab 
            icon={<Settings />} 
            label="Integration Settings" 
            iconPosition="start"
          />
        </Tabs>
      </Box>

      {/* Tab Content */}
      {renderTabContent()}

      {/* Verification Dialog */}
      <Dialog 
        open={showVerificationDialog} 
        onClose={() => setShowVerificationDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          AI Document Verification
        </DialogTitle>
        <DialogContent>
          {selectedDocument && (
            <AIVerificationComponent
              documentFile={selectedDocument}
              onVerificationComplete={handleVerificationComplete}
              userId={currentUser?.id || 'anonymous'}
              documentType="id_card"
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowVerificationDialog(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

// Document Upload Integration Component
const DocumentUploadIntegration = ({ onDocumentSelect }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleVerification = () => {
    if (selectedFile) {
      onDocumentSelect(selectedFile);
    }
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Enhanced Document Upload with AI Verification
        </Typography>

        {/* Drag and Drop Area */}
        <Box
          sx={{
            border: `2px dashed ${dragActive ? 'primary.main' : 'grey.300'}`,
            borderRadius: 2,
            p: 4,
            textAlign: 'center',
            bgcolor: dragActive ? 'action.hover' : 'background.paper',
            cursor: 'pointer',
            mb: 3
          }}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => document.getElementById('file-input').click()}
        >
          <CloudUpload sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            Drag & Drop Document Here
          </Typography>
          <Typography variant="body2" color="text.secondary">
            or click to select file
          </Typography>
          <input
            id="file-input"
            type="file"
            accept=".jpg,.jpeg,.png,.pdf"
            onChange={handleFileSelect}
            style={{ display: 'none' }}
          />
        </Box>

        {/* Selected File Display */}
        {selectedFile && (
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

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            onClick={handleVerification}
            disabled={!selectedFile}
            startIcon={<Security />}
          >
            Start AI Verification
          </Button>
          
          <Button
            variant="outlined"
            onClick={() => setSelectedFile(null)}
            disabled={!selectedFile}
          >
            Clear Selection
          </Button>
        </Box>

        {/* Information */}
        <Alert severity="info" sx={{ mt: 3 }}>
          <AlertTitle>AI-Powered Verification</AlertTitle>
          Documents will be verified using advanced AI including:
          <ul>
            <li>Document authenticity check</li>
            <li>Data extraction and validation</li>
            <li>Face verification (if applicable)</li>
            <li>Liveness detection</li>
          </ul>
        </Alert>
      </CardContent>
    </Card>
  );
};

// Integration Settings Component
const IntegrationSettings = ({ enabled, onToggle, settings }) => {
  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Auto-KYC Integration Settings
        </Typography>

        <Box sx={{ mb: 3 }}>
          <FormControlLabel
            control={
              <Switch
                checked={enabled}
                onChange={(e) => onToggle(e.target.checked)}
              />
            }
            label="Enable Auto-KYC Integration"
          />
        </Box>

        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                API Configuration
              </Typography>
              <Typography variant="body2">
                Endpoint: http://localhost:8000/api
              </Typography>
              <Typography variant="body2">
                Status: Connected
              </Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Verification Settings
              </Typography>
              <Typography variant="body2">
                Face Verification: Enabled
              </Typography>
              <Typography variant="body2">
                Liveness Check: Enabled
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        <Alert severity="success" sx={{ mt: 3 }}>
          <AlertTitle>Integration Active</AlertTitle>
          Auto-KYC is successfully integrated with your Secure Banking Portal.
        </Alert>
      </CardContent>
    </Card>
  );
};

export default SecureBankingIntegration;

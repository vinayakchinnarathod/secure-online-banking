// AutoKYCFrontendComponent.js - Frontend Component for Java Banking System
import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  TextField,
  Alert,
  AlertTitle,
  LinearProgress,
  Chip,
  Grid,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import {
  CloudUpload,
  Security,
  CheckCircle,
  Error,
  Warning,
  Timer,
  Visibility,
  Face,
  VerifiedUser,
  Assessment,
  Description,
  Refresh
} from '@mui/icons-material';

const AutoKYCFrontendComponent = ({ 
  currentUser, 
  javaBackendUrl = 'http://localhost:8080',
  onVerificationComplete 
}) => {
  const [activeTab, setActiveTab] = useState(0);
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedFaceImage, setSelectedFaceImage] = useState(null);
  const [documentType, setDocumentType] = useState('id_card');
  const [verificationInProgress, setVerificationInProgress] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);
  const [error, setError] = useState(null);
  const [serviceStatus, setServiceStatus] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [stats, setStats] = useState(null);

  // Load initial data
  useEffect(() => {
    checkServiceStatus();
    loadCustomers();
    loadStatistics();
  }, []);

  const checkServiceStatus = async () => {
    try {
      const response = await fetch(`${javaBackendUrl}/api/autokyc/health`);
      const data = await response.json();
      setServiceStatus(data);
    } catch (err) {
      setServiceStatus({ service_healthy: false, error: err.message });
    }
  };

  const loadCustomers = async () => {
    try {
      const response = await fetch(`${javaBackendUrl}/api/autokyc/customers`);
      const data = await response.json();
      setCustomers(data);
    } catch (err) {
      console.error('Failed to load customers:', err);
    }
  };

  const loadStatistics = async () => {
    try {
      const response = await fetch(`${javaBackendUrl}/api/autokyc/statistics`);
      const data = await response.json();
      setStats(data);
    } catch (err) {
      console.error('Failed to load statistics:', err);
    }
  };

  const handleFileSelect = (event, type) => {
    const file = event.target.files[0];
    if (file) {
      if (type === 'document') {
        setSelectedFile(file);
      } else if (type === 'face') {
        setSelectedFaceImage(file);
      }
      setError(null);
    }
  };

  const performVerification = async () => {
    if (!selectedFile) {
      setError('Please select a document file');
      return;
    }

    setVerificationInProgress(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('document_file', selectedFile);
      formData.append('document_type', documentType);
      formData.append('user_id', currentUser?.id || 'anonymous');
      
      if (selectedFaceImage) {
        formData.append('face_image', selectedFaceImage);
      }

      const response = await fetch(`${javaBackendUrl}/api/autokyc/complete-verification`, {
        method: 'POST',
        body: formData
      });

      const result = await response.json();
      
      if (response.ok) {
        setVerificationResult(result);
        if (onVerificationComplete) {
          onVerificationComplete(result);
        }
      } else {
        setError(result.message || 'Verification failed');
      }
    } catch (err) {
      setError('Verification failed: ' + err.message);
    } finally {
      setVerificationInProgress(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const resetForm = () => {
    setSelectedFile(null);
    setSelectedFaceImage(null);
    setVerificationResult(null);
    setError(null);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'VERIFIED': return 'success';
      case 'VERIFIED_WITH_NOTES': return 'warning';
      case 'VERIFICATION_FAILED': return 'error';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'VERIFIED': return <CheckCircle color="success" />;
      case 'VERIFIED_WITH_NOTES': return <Warning color="warning" />;
      case 'VERIFICATION_FAILED': return <Error color="error" />;
      default: return <Timer color="action" />;
    }
  };

  const renderVerificationTab = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} md={8}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              AI Document Verification
            </Typography>

            {/* Service Status */}
            {serviceStatus && (
              <Alert 
                severity={serviceStatus.service_healthy ? 'success' : 'error'}
                sx={{ mb: 3 }}
              >
                <AlertTitle>Auto-KYC Service Status</AlertTitle>
                {serviceStatus.service_healthy ? 
                  'Connected and operational' : 
                  'Service unavailable: ' + (serviceStatus.error || 'Unknown error')
                }
              </Alert>
            )}

            {/* Document Upload */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" gutterBottom>
                Select Document Type
              </Typography>
              <TextField
                select
                fullWidth
                value={documentType}
                onChange={(e) => setDocumentType(e.target.value)}
                sx={{ mb: 2 }}
              >
                <option value="id_card">ID Card</option>
                <option value="passport">Passport</option>
                <option value="driver_license">Driver License</option>
              </TextField>

              <input
                type="file"
                accept=".jpg,.jpeg,.png,.pdf"
                onChange={(e) => handleFileSelect(e, 'document')}
                style={{ display: 'none' }}
                id="document-upload"
              />
              <label htmlFor="document-upload">
                <Button
                  variant="outlined"
                  component="span"
                  startIcon={<CloudUpload />}
                  fullWidth
                  sx={{ mb: 2 }}
                >
                  Select Document
                </Button>
              </label>

              {selectedFile && (
                <Paper sx={{ p: 2, mb: 2 }}>
                  <Typography variant="body2">
                    Selected: {selectedFile.name}
                  </Typography>
                  <Typography variant="body2">
                    Size: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </Typography>
                </Paper>
              )}
            </Box>

            {/* Face Image Upload (Optional) */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" gutterBottom>
                Face Image (Optional for enhanced verification)
              </Typography>

              <input
                type="file"
                accept=".jpg,.jpeg,.png"
                onChange={(e) => handleFileSelect(e, 'face')}
                style={{ display: 'none' }}
                id="face-upload"
              />
              <label htmlFor="face-upload">
                <Button
                  variant="outlined"
                  component="span"
                  startIcon={<Face />}
                  fullWidth
                  sx={{ mb: 2 }}
                >
                  Select Face Image
                </Button>
              </label>

              {selectedFaceImage && (
                <Paper sx={{ p: 2, mb: 2 }}>
                  <Typography variant="body2">
                    Selected: {selectedFaceImage.name}
                  </Typography>
                  <Typography variant="body2">
                    Size: {(selectedFaceImage.size / 1024 / 1024).toFixed(2)} MB
                  </Typography>
                </Paper>
              )}
            </Box>

            {/* Error Display */}
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                <AlertTitle>Verification Error</AlertTitle>
                {error}
              </Alert>
            )}

            {/* Action Buttons */}
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="contained"
                onClick={performVerification}
                disabled={!selectedFile || verificationInProgress}
                startIcon={verificationInProgress ? <Timer /> : <Security />}
              >
                {verificationInProgress ? 'Verifying...' : 'Start AI Verification'}
              </Button>
              
              <Button
                variant="outlined"
                onClick={resetForm}
                disabled={verificationInProgress}
                startIcon={<Refresh />}
              >
                Reset
              </Button>
            </Box>

            {/* Progress */}
            {verificationInProgress && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" gutterBottom>
                  Processing with AI...
                </Typography>
                <LinearProgress />
              </Box>
            )}

            {/* Results */}
            {verificationResult && (
              <Box sx={{ mt: 3 }}>
                <Alert severity="success">
                  <AlertTitle>Verification Complete</AlertTitle>
                  Document has been processed by AI
                </Alert>

                <Grid container spacing={2} sx={{ mt: 2 }}>
                  <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Overall Status
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {getStatusIcon(verificationResult.overall_status)}
                        <Chip 
                          label={verificationResult.overall_status}
                          color={getStatusColor(verificationResult.overall_status)}
                          sx={{ ml: 1 }}
                        />
                      </Box>
                    </Paper>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Processing Time
                      </Typography>
                      <Typography variant="body2">
                        {new Date(verificationResult.timestamp).toLocaleString()}
                      </Typography>
                    </Paper>
                  </Grid>
                </Grid>
              </Box>
            )}
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={4}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              AI Verification Features
            </Typography>
            <List dense>
              <ListItem>
                <ListItemIcon>
                  <Description color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary="Document Analysis" 
                  secondary="Extract and validate information" 
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <Face color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary="Face Verification" 
                  secondary="Match face with document" 
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <VerifiedUser color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary="Liveness Detection" 
                  secondary="Prevent spoofing attacks" 
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <Assessment color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary="Confidence Scoring" 
                  secondary="Reliability assessment" 
                />
              </ListItem>
            </List>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const renderCustomersTab = () => (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Customer Verification Status
        </Typography>
        
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Customer ID</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Last Verification</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {customers.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell>{customer.id}</TableCell>
                  <TableCell>
                    {customer.first_name} {customer.last_name}
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={customer.status?.toUpperCase() || 'UNKNOWN'}
                      color={getStatusColor(customer.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {customer.verification_date || 'Not verified'}
                  </TableCell>
                  <TableCell>
                    <IconButton size="small">
                      <Visibility />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );

  const renderDashboardTab = () => (
    <Grid container spacing={3}>
      {stats && (
        <>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h4">{stats.total_customers}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Customers
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h4">{stats.verified_customers}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Verified Customers
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h4">{stats.pending_customers}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Pending Verifications
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h4">{stats.failed_customers}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Failed Verifications
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </>
      )}

      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Service Status
            </Typography>
            {serviceStatus && (
              <Alert severity={serviceStatus.service_healthy ? 'success' : 'error'}>
                <AlertTitle>Integration Status</AlertTitle>
                Java Backend: Connected<br />
                Auto-KYC Service: {serviceStatus.service_healthy ? 'Connected' : 'Disconnected'}
              </Alert>
            )}
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  return (
    <Box sx={{ width: '100%' }}>
      <Typography variant="h5" gutterBottom>
        Auto-KYC Integration
      </Typography>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab icon={<Security />} label="Verification" />
          <Tab icon={<People />} label="Customers" />
          <Tab icon={<Assessment />} label="Dashboard" />
        </Tabs>
      </Box>

      {activeTab === 0 && renderVerificationTab()}
      {activeTab === 1 && renderCustomersTab()}
      {activeTab === 2 && renderDashboardTab()}
    </Box>
  );
};

export default AutoKYCFrontendComponent;

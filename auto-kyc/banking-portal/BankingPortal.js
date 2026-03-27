// BankingPortal.js - Complete Banking Portal with Auto-KYC Integration
import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Grid,
  Paper,
  Button,
  TextField,
  Alert,
  AlertTitle,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Avatar,
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
  LinearProgress
} from '@mui/material';
import {
  AccountBalance,
  Person,
  Description,
  Security,
  CheckCircle,
  Error,
  Warning,
  Timer,
  Visibility,
  Upload,
  Assessment,
  People,
  Settings,
  Dashboard,
  CloudUpload,
  Face,
  VerifiedUser,
  TrendingUp
} from '@mui/icons-material';

const BankingPortal = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [uploadFile, setUploadFile] = useState(null);
  const [verificationResults, setVerificationResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalCustomers: 0,
    verifiedCustomers: 0,
    pendingVerifications: 0,
    todayVerifications: 0
  });

  // Load initial data
  useEffect(() => {
    loadBankingData();
  }, []);

  const loadBankingData = async () => {
    try {
      // Simulate loading customers from backend
      const mockCustomers = [
        {
          id: '1',
          name: 'John Doe',
          email: 'john.doe@email.com',
          phone: '+1234567890',
          accountType: 'Savings',
          status: 'verified',
          verificationDate: '2024-01-15',
          documents: ['ID Card', 'Passport'],
          lastActivity: '2024-01-20'
        },
        {
          id: '2',
          name: 'Jane Smith',
          email: 'jane.smith@email.com',
          phone: '+0987654321',
          accountType: 'Current',
          status: 'pending',
          verificationDate: null,
          documents: ['ID Card'],
          lastActivity: '2024-01-19'
        },
        {
          id: '3',
          name: 'Robert Johnson',
          email: 'robert.j@email.com',
          phone: '+1122334455',
          accountType: 'Savings',
          status: 'failed',
          verificationDate: '2024-01-18',
          documents: ['Passport'],
          lastActivity: '2024-01-18'
        }
      ];

      setCustomers(mockCustomers);
      
      // Calculate stats
      const newStats = {
        totalCustomers: mockCustomers.length,
        verifiedCustomers: mockCustomers.filter(c => c.status === 'verified').length,
        pendingVerifications: mockCustomers.filter(c => c.status === 'pending').length,
        todayVerifications: 2
      };
      setStats(newStats);

    } catch (error) {
      console.error('Failed to load banking data:', error);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setUploadFile(file);
    }
  };

  const handleVerification = async () => {
    if (!uploadFile || !selectedCustomer) {
      alert('Please select a customer and upload a document');
      return;
    }

    setLoading(true);
    
    try {
      // Simulate Auto-KYC verification
      setTimeout(() => {
        const result = {
          customerId: selectedCustomer.id,
          customerName: selectedCustomer.name,
          documentType: 'ID Card',
          verificationStatus: 'verified',
          confidence: 95,
          timestamp: new Date().toISOString(),
          details: {
            documentAuthenticity: 'High',
            faceMatch: 'Success',
            livenessCheck: 'Passed'
          }
        };

        setVerificationResults(prev => [...prev, result]);
        
        // Update customer status
        setCustomers(prev => prev.map(c => 
          c.id === selectedCustomer.id 
            ? { ...c, status: 'verified', verificationDate: new Date().toISOString().split('T')[0] }
            : c
        ));

        setLoading(false);
        setUploadFile(null);
        
        alert('Document verified successfully!');
      }, 3000);
    } catch (error) {
      setLoading(false);
      alert('Verification failed: ' + error.message);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'verified': return 'success';
      case 'pending': return 'warning';
      case 'failed': return 'error';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'verified': return <CheckCircle color="success" />;
      case 'pending': return <Timer color="warning" />;
      case 'failed': return <Error color="error" />;
      default: return <Warning color="action" />;
    }
  };

  const renderDashboard = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} md={3}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                <People />
              </Avatar>
              <Box>
                <Typography variant="h4">{stats.totalCustomers}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Customers
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
                <Typography variant="h4">{stats.verifiedCustomers}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Verified Customers
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
                <Timer />
              </Avatar>
              <Box>
                <Typography variant="h4">{stats.pendingVerifications}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Pending Verifications
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
              <Avatar sx={{ bgcolor: 'info.main', mr: 2 }}>
                <TrendingUp />
              </Avatar>
              <Box>
                <Typography variant="h4">{stats.todayVerifications}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Today's Verifications
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Recent Verification Results
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Customer</TableCell>
                    <TableCell>Document Type</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Confidence</TableCell>
                    <TableCell>Time</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {verificationResults.map((result, index) => (
                    <TableRow key={index}>
                      <TableCell>{result.customerName}</TableCell>
                      <TableCell>{result.documentType}</TableCell>
                      <TableCell>
                        <Chip 
                          label={result.verificationStatus}
                          color={getStatusColor(result.verificationStatus)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{result.confidence}%</TableCell>
                      <TableCell>{new Date(result.timestamp).toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const renderCustomers = () => (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Customer Management
        </Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Customer ID</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Account Type</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Verification Date</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {customers.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell>{customer.id}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar sx={{ mr: 1 }}>
                        <Person />
                      </Avatar>
                      {customer.name}
                    </Box>
                  </TableCell>
                  <TableCell>{customer.email}</TableCell>
                  <TableCell>{customer.accountType}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      {getStatusIcon(customer.status)}
                      <Chip 
                        label={customer.status.toUpperCase()}
                        color={getStatusColor(customer.status)}
                        size="small"
                        sx={{ ml: 1 }}
                      />
                    </Box>
                  </TableCell>
                  <TableCell>{customer.verificationDate || 'Not verified'}</TableCell>
                  <TableCell>
                    <IconButton 
                      size="small"
                      onClick={() => setSelectedCustomer(customer)}
                    >
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

  const renderDocumentUpload = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Document Upload & Verification
            </Typography>
            
            <Box sx={{ mb: 3 }}>
              <TextField
                fullWidth
                label="Select Customer"
                select
                value={selectedCustomer?.id || ''}
                onChange={(e) => {
                  const customer = customers.find(c => c.id === e.target.value);
                  setSelectedCustomer(customer);
                }}
                sx={{ mb: 2 }}
              >
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name} - {customer.email}
                  </option>
                ))}
              </TextField>
            </Box>

            <Box sx={{ mb: 3 }}>
              <input
                type="file"
                accept=".jpg,.jpeg,.png,.pdf"
                onChange={handleFileUpload}
                style={{ display: 'none' }}
                id="document-upload"
              />
              <label htmlFor="document-upload">
                <Button
                  variant="outlined"
                  component="span"
                  startIcon={<Upload />}
                  fullWidth
                >
                  Select Document
                </Button>
              </label>
            </Box>

            {uploadFile && (
              <Box sx={{ mb: 3 }}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="body2">
                    Selected: {uploadFile.name}
                  </Typography>
                  <Typography variant="body2">
                    Size: {(uploadFile.size / 1024 / 1024).toFixed(2)} MB
                  </Typography>
                </Paper>
              </Box>
            )}

            <Button
              variant="contained"
              onClick={handleVerification}
              disabled={!uploadFile || !selectedCustomer || loading}
              startIcon={<Security />}
              fullWidth
            >
              {loading ? 'Verifying...' : 'Start AI Verification'}
            </Button>

            {loading && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" gutterBottom>
                  Processing document with AI...
                </Typography>
                <LinearProgress />
              </Box>
            )}
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              AI Verification Features
            </Typography>
            <List>
              <ListItem>
                <ListItemIcon>
                  <Description color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary="Document Analysis" 
                  secondary="Extract and validate document information" 
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <Face color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary="Face Verification" 
                  secondary="Match face with document photo" 
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

  const renderSettings = () => (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Banking Portal Settings
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Auto-KYC Integration
              </Typography>
              <Typography variant="body2">
                Status: Connected
              </Typography>
              <Typography variant="body2">
                API Endpoint: http://localhost:8000/api
              </Typography>
              <Typography variant="body2">
                Last Sync: Just now
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
              <Typography variant="body2">
                Confidence Threshold: 85%
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ width: '100%', p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ display: 'flex', alignItems: 'center' }}>
          <AccountBalance sx={{ mr: 2 }} />
          Secure Banking Portal
        </Typography>
        <Chip 
          label="Auto-KYC Integrated"
          color="success"
          icon={<Security />}
        />
      </Box>

      {/* Navigation Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab icon={<Dashboard />} label="Dashboard" />
          <Tab icon={<People />} label="Customers" />
          <Tab icon={<CloudUpload />} label="Document Upload" />
          <Tab icon={<Settings />} label="Settings" />
        </Tabs>
      </Box>

      {/* Tab Content */}
      {activeTab === 0 && renderDashboard()}
      {activeTab === 1 && renderCustomers()}
      {activeTab === 2 && renderDocumentUpload()}
      {activeTab === 3 && renderSettings()}
    </Box>
  );
};

export default BankingPortal;

// VerificationDashboard.js - Admin Dashboard for Secure Banking Portal
import React, { useState, useEffect } from 'react';
import autoKYCApi from './AutoKYCApiManager';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  IconButton,
  Tooltip,
  Alert,
  AlertTitle,
  LinearProgress,
  Badge,
  Avatar,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemIcon
} from '@mui/material';
import {
  Security,
  CheckCircle,
  Error,
  Warning,
  Timer,
  Refresh,
  Visibility,
  Download,
  Person,
  Description,
  Face,
  VerifiedUser,
  Assessment,
  TrendingUp,
  FilterList,
  Search,
  Notifications,
  Info
} from '@mui/icons-material';

const VerificationDashboard = () => {
  const [verificationData, setVerificationData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedVerification, setSelectedVerification] = useState(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [serviceStatus, setServiceStatus] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    verified: 0,
    pending: 0,
    failed: 0
  });

  // Load verification data
  const loadVerificationData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get all customers
      const customers = await autoKYCApi.getCustomers();
      
      // Get verification status for each customer
      const verificationPromises = customers.map(async (customer) => {
        try {
          const status = await autoKYCApi.getCustomerStatus(customer.id);
          const logs = await autoKYCApi.getCustomerLogs(customer.id);
          
          return {
            ...customer,
            verification_status: status.status,
            verification_logs: logs.logs,
            last_updated: new Date().toISOString(),
            confidence: calculateConfidence(status, logs)
          };
        } catch (err) {
          return {
            ...customer,
            verification_status: 'error',
            verification_logs: [`Error: ${err.message}`],
            last_updated: new Date().toISOString(),
            confidence: 0
          };
        }
      });

      const results = await Promise.all(verificationPromises);
      setVerificationData(results);

      // Calculate statistics
      const newStats = {
        total: results.length,
        verified: results.filter(r => r.verification_status === 'green' || r.verification_status === 'verified').length,
        pending: results.filter(r => r.verification_status === 'yellow' || r.verification_status === 'pending').length,
        failed: results.filter(r => r.verification_status === 'red' || r.verification_status === 'failed').length
      };
      setStats(newStats);

      // Check service status
      const status = await autoKYCApi.getServiceStatus();
      setServiceStatus(status);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const calculateConfidence = (status, logs) => {
    // Simple confidence calculation based on status and logs
    if (status.status === 'green' || status.status === 'verified') return 95;
    if (status.status === 'yellow' || status.status === 'pending') return 70;
    if (status.status === 'red' || status.status === 'failed') return 30;
    return 50;
  };

  useEffect(() => {
    loadVerificationData();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(loadVerificationData, 30000);
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'green':
      case 'verified':
        return 'success';
      case 'yellow':
      case 'pending':
        return 'warning';
      case 'red':
      case 'failed':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'green':
      case 'verified':
        return <CheckCircle color="success" />;
      case 'yellow':
      case 'pending':
        return <Timer color="warning" />;
      case 'red':
      case 'failed':
        return <Error color="error" />;
      default:
        return <Warning color="action" />;
    }
  };

  const handleViewDetails = (verification) => {
    setSelectedVerification(verification);
    setDetailDialogOpen(true);
  };

  const handleRefresh = () => {
    loadVerificationData();
  };

  if (loading) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6">Loading Verification Dashboard...</Typography>
          <LinearProgress />
        </CardContent>
      </Card>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ display: 'flex', alignItems: 'center' }}>
          <Security sx={{ mr: 2 }} />
          Auto-KYC Verification Dashboard
        </Typography>
        <Box>
          <IconButton onClick={handleRefresh}>
            <Refresh />
          </IconButton>
        </Box>
      </Box>

      {/* Service Status */}
      {serviceStatus && (
        <Alert 
          severity={serviceStatus.status === 'healthy' ? 'success' : 'error'}
          sx={{ mb: 3 }}
        >
          <AlertTitle>Auto-KYC Service Status</AlertTitle>
          {serviceStatus.status === 'healthy' ? 
            'All services are operational' : 
            `Service unavailable: ${serviceStatus.error}`
          }
        </Alert>
      )}

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                  <Assessment />
                </Avatar>
                <Box>
                  <Typography variant="h4">{stats.total}</Typography>
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
                  <Typography variant="h4">{stats.verified}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Verified
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
                  <Typography variant="h4">{stats.pending}</Typography>
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
                  <Typography variant="h4">{stats.failed}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Failed
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Verification Table */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Recent Verifications
          </Typography>
          
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Customer ID</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Document Type</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Confidence</TableCell>
                  <TableCell>Last Updated</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {verificationData.map((verification) => (
                  <TableRow key={verification.id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Person sx={{ mr: 1 }} />
                        {verification.id}
                      </Box>
                    </TableCell>
                    <TableCell>
                      {verification.first_name} {verification.last_name}
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={verification.document_type || 'ID Card'}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {getStatusIcon(verification.verification_status)}
                        <Chip 
                          label={verification.verification_status.toUpperCase()}
                          color={getStatusColor(verification.verification_status)}
                          size="small"
                          sx={{ ml: 1 }}
                        />
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography variant="body2">
                          {verification.confidence}%
                        </Typography>
                        <LinearProgress 
                          variant="determinate" 
                          value={verification.confidence}
                          sx={{ width: 50, ml: 1 }}
                        />
                      </Box>
                    </TableCell>
                    <TableCell>
                      {new Date(verification.last_updated).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Tooltip title="View Details">
                        <IconButton 
                          size="small"
                          onClick={() => handleViewDetails(verification)}
                        >
                          <Visibility />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Download Report">
                        <IconButton size="small">
                          <Download />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog 
        open={detailDialogOpen} 
        onClose={() => setDetailDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Verification Details
        </DialogTitle>
        <DialogContent>
          {selectedVerification && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Customer: {selectedVerification.first_name} {selectedVerification.last_name}
              </Typography>
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="subtitle2" gutterBottom>
                Verification Status
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                {getStatusIcon(selectedVerification.verification_status)}
                <Chip 
                  label={selectedVerification.verification_status.toUpperCase()}
                  color={getStatusColor(selectedVerification.verification_status)}
                  sx={{ ml: 1 }}
                />
              </Box>

              <Typography variant="subtitle2" gutterBottom>
                Verification Logs
              </Typography>
              <List dense>
                {selectedVerification.verification_logs.map((log, index) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      <Info color="info" />
                    </ListItemIcon>
                    <ListItemText primary={log} />
                  </ListItem>
                ))}
              </List>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailDialogOpen(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default VerificationDashboard;

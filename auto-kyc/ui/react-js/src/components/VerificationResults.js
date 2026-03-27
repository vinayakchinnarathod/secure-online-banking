import React, { useState, useContext } from 'react';
import { GlobalStateContext } from '../GlobalState';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Alert,
  AlertTitle,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  LinearProgress,
  Divider
} from '@mui/material';
import {
  CheckCircle,
  Error,
  Warning,
  Visibility,
  Assessment,
  Security,
  Face,
  Description
} from '@mui/icons-material';

function VerificationResults() {
  const { uploadedFiles } = useContext(GlobalStateContext);
  const [selectedResult, setSelectedResult] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'verified':
        return <CheckCircle color="success" />;
      case 'failed':
        return <Error color="error" />;
      case 'pending':
        return <Warning color="warning" />;
      default:
        return <Assessment color="action" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'verified':
        return 'success';
      case 'failed':
        return 'error';
      case 'pending':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 90) return 'success';
    if (confidence >= 70) return 'warning';
    return 'error';
  };

  const handleViewDetails = (result) => {
    setSelectedResult(result);
    setDetailsOpen(true);
  };

  const getVerificationSummary = () => {
    const verified = uploadedFiles.filter(f => f.analysis?.status === 'verified').length;
    const failed = uploadedFiles.filter(f => f.analysis?.status === 'failed').length;
    const pending = uploadedFiles.filter(f => f.analysis?.status === 'pending').length;
    const total = uploadedFiles.length;

    return { verified, failed, pending, total };
  };

  const summary = getVerificationSummary();

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        📊 Verification Results
      </Typography>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <CheckCircle color="success" sx={{ mr: 1 }} />
                <Box>
                  <Typography variant="h4">{summary.verified}</Typography>
                  <Typography variant="body2" color="textSecondary">
                    Verified
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Error color="error" sx={{ mr: 1 }} />
                <Box>
                  <Typography variant="h4">{summary.failed}</Typography>
                  <Typography variant="body2" color="textSecondary">
                    Failed
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Warning color="warning" sx={{ mr: 1 }} />
                <Box>
                  <Typography variant="h4">{summary.pending}</Typography>
                  <Typography variant="body2" color="textSecondary">
                    Pending
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Assessment color="action" sx={{ mr: 1 }} />
                <Box>
                  <Typography variant="h4">{summary.total}</Typography>
                  <Typography variant="body2" color="textSecondary">
                    Total
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Results Table */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            📋 Detailed Results
          </Typography>

          {uploadedFiles.length === 0 ? (
            <Alert severity="info" sx={{ mb: 2 }}>
              <AlertTitle>No Results</AlertTitle>
              No documents have been processed yet. Please upload documents first.
            </Alert>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Document</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Confidence</TableCell>
                    <TableCell>Face Match</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {uploadedFiles.map((file, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Box display="flex" alignItems="center">
                          <Description sx={{ mr: 1 }} />
                          {file.name}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={file.document_type || 'Unknown'}
                          size="small"
                          color="primary"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip 
                          icon={getStatusIcon(file.analysis?.status)}
                          label={file.analysis?.status || 'Pending'}
                          size="small"
                          color={getStatusColor(file.analysis?.status)}
                        />
                      </TableCell>
                      <TableCell>
                        {file.analysis?.confidence ? (
                          <Box display="flex" alignItems="center">
                            <Typography variant="body2">
                              {file.analysis.confidence}%
                            </Typography>
                            <LinearProgress
                              variant="determinate"
                              value={file.analysis.confidence}
                              sx={{ 
                                width: 60, 
                                ml: 1,
                                height: 6,
                                borderRadius: 3
                              }}
                              color={getConfidenceColor(file.analysis.confidence)}
                            />
                          </Box>
                        ) : (
                          <Typography variant="body2" color="textSecondary">
                            -
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        {file.analysis?.face_match ? (
                          <Chip 
                            icon={<Face />}
                            label={`${file.analysis.face_match_score}%`}
                            size="small"
                            color={file.analysis.face_match_score >= 80 ? 'success' : 'warning'}
                          />
                        ) : (
                          <Typography variant="body2" color="textSecondary">
                            -
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        {file.analysis ? (
                          <Button
                            variant="outlined"
                            size="small"
                            startIcon={<Visibility />}
                            onClick={() => handleViewDetails(file)}
                          >
                            View
                          </Button>
                        ) : (
                          <Typography variant="body2" color="textSecondary">
                            Pending
                          </Typography>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Details Dialog */}
      <Dialog 
        open={detailsOpen} 
        onClose={() => setDetailsOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center">
            <Assessment sx={{ mr: 1 }} />
            Verification Details
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedResult && selectedResult.analysis && (
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                  📄 Document Information
                </Typography>
                <Paper sx={{ p: 2, mb: 2 }}>
                  <Typography variant="body2" gutterBottom>
                    <strong>Name:</strong> {selectedResult.name}
                  </Typography>
                  <Typography variant="body2" gutterBottom>
                    <strong>Type:</strong> {selectedResult.document_type}
                  </Typography>
                  <Typography variant="body2" gutterBottom>
                    <strong>Upload Date:</strong> {new Date(selectedResult.upload_date).toLocaleString()}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Status:</strong>
                    <Chip 
                      icon={getStatusIcon(selectedResult.analysis.status)}
                      label={selectedResult.analysis.status}
                      size="small"
                      color={getStatusColor(selectedResult.analysis.status)}
                      sx={{ ml: 1 }}
                    />
                  </Typography>
                </Paper>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                  🔍 Analysis Results
                </Typography>
                <Paper sx={{ p: 2, mb: 2 }}>
                  <Typography variant="body2" gutterBottom>
                    <strong>Overall Confidence:</strong> {selectedResult.analysis.confidence}%
                  </Typography>
                  <Typography variant="body2" gutterBottom>
                    <strong>Face Match:</strong> {selectedResult.analysis.face_match ? 'Yes' : 'No'}
                  </Typography>
                  {selectedResult.analysis.face_match_score && (
                    <Typography variant="body2" gutterBottom>
                      <strong>Match Score:</strong> {selectedResult.analysis.face_match_score}%
                    </Typography>
                  )}
                  <Typography variant="body2" gutterBottom>
                    <strong>Data Extraction:</strong> {selectedResult.analysis.data_extraction ? 'Success' : 'Failed'}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Liveness Check:</strong> {selectedResult.analysis.liveness_check ? 'Passed' : 'Failed'}
                  </Typography>
                </Paper>
              </Grid>

              {selectedResult.analysis.extracted_data && (
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    📋 Extracted Data
                  </Typography>
                  <Paper sx={{ p: 2 }}>
                    <Grid container spacing={2}>
                      {Object.entries(selectedResult.analysis.extracted_data).map(([key, value]) => (
                        <Grid item xs={12} sm={6} key={key}>
                          <Typography variant="body2">
                            <strong>{key.replace(/_/g, ' ').toUpperCase()}:</strong> {value}
                          </Typography>
                        </Grid>
                      ))}
                    </Grid>
                  </Paper>
                </Grid>
              )}

              {selectedResult.analysis.issues && selectedResult.analysis.issues.length > 0 && (
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    ⚠️ Issues Found
                  </Typography>
                  <Paper sx={{ p: 2 }}>
                    {selectedResult.analysis.issues.map((issue, index) => (
                      <Alert key={index} severity="warning" sx={{ mb: 1 }}>
                        {issue}
                      </Alert>
                    ))}
                  </Paper>
                </Grid>
              )}
            </Grid>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
}

export default VerificationResults;

import React, { useState, useContext } from 'react';
import { GlobalStateContext } from '../GlobalState';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Paper,
  LinearProgress,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Alert,
  AlertTitle
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  CloudUpload,
  Face,
  CheckCircle,
  Error,
  Warning,
  Assessment,
  Security,
  Description,
  TrendingUp,
  People
} from '@mui/icons-material';

function Dashboard({ verificationData }) {
  const { uploadedFiles } = useContext(GlobalStateContext);

  const getStatistics = () => {
    const total = uploadedFiles.length;
    const verified = uploadedFiles.filter(f => f.analysis?.status === 'verified').length;
    const failed = uploadedFiles.filter(f => f.analysis?.status === 'failed').length;
    const pending = uploadedFiles.filter(f => f.analysis?.status === 'pending').length;
    const withFaceMatch = uploadedFiles.filter(f => f.analysis?.face_match).length;

    return {
      total,
      verified,
      failed,
      pending,
      withFaceMatch,
      successRate: total > 0 ? ((verified / total) * 100).toFixed(1) : 0,
      faceMatchRate: total > 0 ? ((withFaceMatch / total) * 100).toFixed(1) : 0
    };
  };

  const getRecentActivity = () => {
    return uploadedFiles
      .filter(f => f.upload_date)
      .sort((a, b) => new Date(b.upload_date) - new Date(a.upload_date))
      .slice(0, 5)
      .map(f => ({
        name: f.name,
        type: f.document_type,
        status: f.analysis?.status || 'pending',
        date: new Date(f.upload_date).toLocaleString(),
        confidence: f.analysis?.confidence || 0
      }));
  };

  const stats = getStatistics();
  const recentActivity = getRecentActivity();

  const getStatusColor = (status) => {
    switch (status) {
      case 'verified': return 'success';
      case 'failed': return 'error';
      case 'pending': return 'warning';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'verified': return <CheckCircle color="success" />;
      case 'failed': return <Error color="error" />;
      case 'pending': return <Warning color="warning" />;
      default: return <Assessment color="action" />;
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        📊 Auto-KYC Dashboard
      </Typography>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <DashboardIcon color="primary" sx={{ mr: 1 }} />
                <Box>
                  <Typography variant="h4">{stats.total}</Typography>
                  <Typography variant="body2" color="textSecondary">
                    Total Documents
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
                <CheckCircle color="success" sx={{ mr: 1 }} />
                <Box>
                  <Typography variant="h4">{stats.verified}</Typography>
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
                  <Typography variant="h4">{stats.failed}</Typography>
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
                  <Typography variant="h4">{stats.pending}</Typography>
                  <Typography variant="body2" color="textSecondary">
                    Pending
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Success Rate and Face Match Rate */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                📈 Verification Success Rate
              </Typography>
              <Box sx={{ mb: 2 }}>
                <LinearProgress
                  variant="determinate"
                  value={parseFloat(stats.successRate)}
                  sx={{
                    height: 10,
                    borderRadius: 5,
                    bgcolor: 'grey.200'
                  }}
                  color={
                    parseFloat(stats.successRate) >= 80 ? 'success' :
                    parseFloat(stats.successRate) >= 60 ? 'warning' : 'error'
                  }
                />
              </Box>
              <Typography variant="h4" align="center">
                {stats.successRate}%
              </Typography>
              <Typography variant="body2" color="textSecondary" align="center">
                Success Rate
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                👤 Face Match Rate
              </Typography>
              <Box sx={{ mb: 2 }}>
                <LinearProgress
                  variant="determinate"
                  value={parseFloat(stats.faceMatchRate)}
                  sx={{
                    height: 10,
                    borderRadius: 5,
                    bgcolor: 'grey.200'
                  }}
                  color={
                    parseFloat(stats.faceMatchRate) >= 80 ? 'success' :
                    parseFloat(stats.faceMatchRate) >= 60 ? 'warning' : 'error'
                  }
                />
              </Box>
              <Typography variant="h4" align="center">
                {stats.faceMatchRate}%
              </Typography>
              <Typography variant="body2" color="textSecondary" align="center">
                Face Match Rate
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Recent Activity */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                🕐 Recent Activity
              </Typography>
              {recentActivity.length === 0 ? (
                <Typography variant="body2" color="textSecondary">
                  No recent activity
                </Typography>
              ) : (
                <List>
                  {recentActivity.map((activity, index) => (
                    <ListItem key={index}>
                      <ListItemIcon>
                        {getStatusIcon(activity.status)}
                      </ListItemIcon>
                      <ListItemText
                        primary={activity.name}
                        secondary={
                          <Box>
                            <Typography variant="body2" component="span">
                              {activity.type} • {activity.date}
                            </Typography>
                            {activity.confidence > 0 && (
                              <Box sx={{ mt: 1 }}>
                                <LinearProgress
                                  variant="determinate"
                                  value={activity.confidence}
                                  sx={{ height: 4, borderRadius: 2 }}
                                  color={getConfidenceColor(activity.confidence)}
                                />
                              </Box>
                            )}
                          </Box>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                📋 System Status
              </Typography>
              
              <Box sx={{ mb: 2 }}>
                <Alert severity="success" sx={{ mb: 1 }}>
                  <AlertTitle>System Operational</AlertTitle>
                  Auto-KYC system is running normally
                </Alert>
              </Box>

              <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                <Typography variant="body2" gutterBottom>
                  <strong>🔐 Security:</strong>
                  <Chip label="Enabled" size="small" color="success" sx={{ ml: 1 }} />
                </Typography>
                <Typography variant="body2" gutterBottom>
                  <strong>🤖 AI Services:</strong>
                  <Chip label="Active" size="small" color="success" sx={{ ml: 1 }} />
                </Typography>
                <Typography variant="body2" gutterBottom>
                  <strong>📸 Face Recognition:</strong>
                  <Chip label="Ready" size="small" color="success" sx={{ ml: 1 }} />
                </Typography>
                <Typography variant="body2" gutterBottom>
                  <strong>📄 Document Processing:</strong>
                  <Chip label="Ready" size="small" color="success" sx={{ ml: 1 }} />
                </Typography>
                <Typography variant="body2">
                  <strong>🔍 Liveness Detection:</strong>
                  <Chip label="Enabled" size="small" color="success" sx={{ ml: 1 }} />
                </Typography>
              </Paper>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Quick Actions */}
      <Grid container spacing={3} sx={{ mt: 3 }}>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                🚀 Quick Actions
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <Paper sx={{ p: 2, textAlign: 'center', cursor: 'pointer' }}>
                    <CloudUpload color="primary" sx={{ fontSize: 32, mb: 1 }} />
                    <Typography variant="body2">
                      Upload Document
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Paper sx={{ p: 2, textAlign: 'center', cursor: 'pointer' }}>
                    <Face color="action" sx={{ fontSize: 32, mb: 1 }} />
                    <Typography variant="body2">
                      Face Verification
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Paper sx={{ p: 2, textAlign: 'center', cursor: 'pointer' }}>
                    <Security color="success" sx={{ fontSize: 32, mb: 1 }} />
                    <Typography variant="body2">
                      View Results
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Paper sx={{ p: 2, textAlign: 'center', cursor: 'pointer' }}>
                    <Assessment color="warning" sx={{ fontSize: 32, mb: 1 }} />
                    <Typography variant="body2">
                      Analytics
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );

  function getConfidenceColor(confidence) {
    if (confidence >= 90) return 'success';
    if (confidence >= 70) return 'warning';
    return 'error';
  }
}

export default Dashboard;

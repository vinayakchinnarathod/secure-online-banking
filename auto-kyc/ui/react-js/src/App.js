// src/App.js
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
import BankingPortal from '../../banking-portal/BankingPortal';

const theme = createTheme();

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ flexGrow: 1 }}>
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6">Secure Banking Portal with Auto-KYC</Typography>
          </Toolbar>
        </AppBar>
        
        <Container maxWidth="xl" sx={{ mt: 2, mb: 2 }}>
          <BankingPortal />
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default App;

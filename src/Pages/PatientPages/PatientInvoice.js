import React, { useState } from 'react';
import {
  Box, Typography, Container, Card, CardContent,
  Button, Divider, Grid, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow,
  Paper, IconButton
} from '@mui/material';
import { Download, PictureAsPdf, Receipt } from '@mui/icons-material';

const PatientInvoice = () => {
  // Sample invoice data - in a real app, this would come from an API
  const [invoices, setInvoices] = useState([
    {
      id: 'INV-2023-001',
      date: '2023-05-15',
      description: 'Annual Checkup',
      amount: 120.00,
      status: 'Paid',
      pdfUrl: '/sample-invoice.pdf'
    },
    {
      id: 'INV-2023-002',
      date: '2023-06-20',
      description: 'Blood Tests',
      amount: 85.50,
      status: 'Paid',
      pdfUrl: '/sample-invoice.pdf'
    },
    {
      id: 'INV-2023-003',
      date: '2023-07-10',
      description: 'Consultation',
      amount: 65.00,
      status: 'Pending',
      pdfUrl: '/sample-invoice.pdf'
    },
  ]);

  // Function to handle PDF download
  const handleDownload = (invoiceId) => {
    // In a real app, this would fetch the PDF from the server
    console.log(`Downloading invoice ${invoiceId}`);
    // For demo purposes, we'll just show an alert
    alert(`Invoice ${invoiceId} download started (simulated)`);
  };

  return (
    <Container maxWidth="lg">
      <Card>
        <CardContent>
          <Box display="flex" alignItems="center" mb={3}>
            <Receipt fontSize="large" color="primary" sx={{ mr: 2 }} />
            <Typography variant="h4">Medical Invoices</Typography>
          </Box>

          <Typography variant="body1" paragraph>
            Below you can find all your medical invoices. You can view and download each invoice as a PDF document.
          </Typography>

          <Divider sx={{ my: 3 }} />

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                  <TableCell><strong>Invoice #</strong></TableCell>
                  <TableCell><strong>Date</strong></TableCell>
                  <TableCell><strong>Description</strong></TableCell>
                  <TableCell><strong>Amount ($)</strong></TableCell>
                  <TableCell><strong>Status</strong></TableCell>
                  <TableCell><strong>Actions</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {invoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell>{invoice.id}</TableCell>
                    <TableCell>{invoice.date}</TableCell>
                    <TableCell>{invoice.description}</TableCell>
                    <TableCell>{invoice.amount.toFixed(2)}</TableCell>
                    <TableCell>
                      <Box 
                        component="span" 
                        sx={{
                          p: '4px 8px',
                          borderRadius: '4px',
                          backgroundColor: invoice.status === 'Paid' ? '#e6f7ee' : '#fff3e0',
                          color: invoice.status === 'Paid' ? '#00a65a' : '#ff9800'
                        }}
                      >
                        {invoice.status}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <IconButton 
                        color="primary" 
                        onClick={() => handleDownload(invoice.id)}
                        aria-label="Download invoice"
                      >
                        <PictureAsPdf />
                      </IconButton>
                      <Button 
                        variant="outlined" 
                        startIcon={<Download />}
                        onClick={() => handleDownload(invoice.id)}
                        size="small"
                        sx={{ ml: 1 }}
                      >
                        PDF
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Divider sx={{ my: 3 }} />

          <Grid container spacing={3} mt={2}>
            <Grid item xs={12} md={6}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    <Box display="flex" alignItems="center">
                      <Receipt color="primary" sx={{ mr: 1 }} />
                      Invoice Summary
                    </Box>
                  </Typography>
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography>Total Invoices:</Typography>
                    <Typography><strong>{invoices.length}</strong></Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography>Paid Invoices:</Typography>
                    <Typography><strong>{invoices.filter(i => i.status === 'Paid').length}</strong></Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between">
                    <Typography>Pending Invoices:</Typography>
                    <Typography><strong>{invoices.filter(i => i.status === 'Pending').length}</strong></Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    <Box display="flex" alignItems="center">
                      <Receipt color="primary" sx={{ mr: 1 }} />
                      Total Amounts
                    </Box>
                  </Typography>
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography>Total Billed:</Typography>
                    <Typography><strong>${invoices.reduce((sum, i) => sum + i.amount, 0).toFixed(2)}</strong></Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography>Total Paid:</Typography>
                    <Typography><strong>${invoices.filter(i => i.status === 'Paid').reduce((sum, i) => sum + i.amount, 0).toFixed(2)}</strong></Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between">
                    <Typography>Total Pending:</Typography>
                    <Typography><strong>${invoices.filter(i => i.status === 'Pending').reduce((sum, i) => sum + i.amount, 0).toFixed(2)}</strong></Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Box mt={4} textAlign="center">
            <Button 
              variant="contained" 
              startIcon={<Download />}
              size="large"
              onClick={() => {
                // This would download all invoices as a zip file in a real app
                alert('Downloading all invoices as PDFs (simulated)');
              }}
            >
              Download All Invoices
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
};

export default PatientInvoice;
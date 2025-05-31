import React, { useState } from 'react';
import {
  Box, Typography, Container, Card, CardContent,
  Button, Divider, Grid, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow,
  Paper, IconButton, useMediaQuery, useTheme,
  Stack, Chip
} from '@mui/material';
import { Download, PictureAsPdf, Receipt } from '@mui/icons-material';

const PatientInvoice = () => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

  // Sample invoice data
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

  const handleDownload = (invoiceId) => {
    console.log(`Downloading invoice ${invoiceId}`);
    alert(`Invoice ${invoiceId} download started (simulated)`);
  };

  return (
    <Container maxWidth="lg" sx={{ p: isSmallScreen ? 1 : 3 }}>
      <Card>
        <CardContent>
          <Stack direction="row" alignItems="center" spacing={1} mb={2}>
            <Receipt fontSize={isSmallScreen ? "medium" : "large"} color="primary" />
            <Typography variant={isSmallScreen ? "h5" : "h4"}>Medical Invoices</Typography>
          </Stack>

          <Typography variant="body1" paragraph>
            Below you can find all your medical invoices. You can view and download each invoice as a PDF document.
          </Typography>

          <Divider sx={{ my: 2 }} />

          {isSmallScreen ? (
            // Mobile view - card list
            <Stack spacing={2}>
              {invoices.map((invoice) => (
                <Paper key={invoice.id} sx={{ p: 2 }}>
                  <Stack spacing={1}>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="subtitle2">{invoice.id}</Typography>
                      <Chip 
                        label={invoice.status} 
                        size="small"
                        color={invoice.status === 'Paid' ? 'success' : 'warning'}
                      />
                    </Stack>
                    <Typography variant="body2">{invoice.date}</Typography>
                    <Typography variant="body1" fontWeight="medium">{invoice.description}</Typography>
                    <Typography variant="body1" fontWeight="bold">${invoice.amount.toFixed(2)}</Typography>
                    <Button
                      variant="outlined"
                      startIcon={<PictureAsPdf />}
                      onClick={() => handleDownload(invoice.id)}
                      size="small"
                      fullWidth
                    >
                      Download PDF
                    </Button>
                  </Stack>
                </Paper>
              ))}
            </Stack>
          ) : (
            // Desktop view - table
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
                        <Chip 
                          label={invoice.status} 
                          color={invoice.status === 'Paid' ? 'success' : 'warning'}
                          size="small"
                        />
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
          )}
         
        </CardContent>
      </Card>
    </Container>
  );
};

export default PatientInvoice;
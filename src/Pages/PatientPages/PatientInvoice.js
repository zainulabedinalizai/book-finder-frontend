import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Container, Card, CardContent,
  Button, Divider, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow,
  Paper, useMediaQuery, useTheme,
  Stack, Chip, CircularProgress, Alert,
  Snackbar, TextField,
  TablePagination, Dialog, DialogTitle, DialogContent
} from '@mui/material';
import { Download, PictureAsPdf, Receipt, Search, Refresh, Payment } from '@mui/icons-material';
import { patientAPI } from '../../Api/api';
import { useAuth } from '../../Context/AuthContext';
import PaymentPatient from './PaymentPatient';

const PatientInvoice = () => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const { user } = useAuth();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  const fetchInvoices = async () => {
    try {
      if (!user?.UserId) {
        throw new Error("User ID not available");
      }

      setLoading(true);
      setError(null);
      
      const response = await patientAPI.getPatientApplication({ UserID: user.UserId });
      
      if (response.data.success) {
        const completedApplications = response.data.data.filter(
          app => app.status === 'Completed'
        );
        setInvoices(completedApplications || []);
      } else {
        throw new Error(response.data.message || "Failed to fetch invoices");
      }
    } catch (err) {
      console.error('Error fetching invoices:', err);
      setError(err.message || 'Failed to fetch invoices. Please try again.');
      setSnackbar({
        open: true,
        message: err.message || 'Failed to fetch invoices',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.UserId) {
      fetchInvoices();
    }
  }, [user?.UserId]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const filteredInvoices = invoices.filter(invoice => {
    const searchLower = searchTerm.toLowerCase();
    return (
      (invoice.application_title?.toLowerCase().includes(searchLower)) ||
      (invoice.SubmittedDate?.toLowerCase().includes(searchLower)) ||
      (invoice.status?.toLowerCase().includes(searchLower))
    );
  });

  const emptyRows = rowsPerPage - Math.min(rowsPerPage, filteredInvoices.length - page * rowsPerPage);

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const handleDownload = (invoiceId) => {
    console.log(`Downloading invoice ${invoiceId}`);
    alert(`Invoice ${invoiceId} download started (simulated)`);
  };

  const handlePayNow = (invoice) => {
    setSelectedInvoice(invoice);
    setPaymentDialogOpen(true);
  };

  const handleClosePaymentDialog = () => {
    setPaymentDialogOpen(false);
    setSelectedInvoice(null);
  };

  return (
    <Container maxWidth="lg" sx={{ p: isSmallScreen ? 1 : 3 }}>
      <Card>
        <CardContent>
          <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1} mb={2}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Receipt fontSize={isSmallScreen ? "medium" : "large"} color="primary" />
              <Typography variant={isSmallScreen ? "h5" : "h4"}>Completed Medical Applications</Typography>
            </Stack>
            <Button
              variant="contained"
              color="primary"
              startIcon={<Refresh />}
              onClick={fetchInvoices}
              disabled={loading}
              size={isSmallScreen ? "small" : "medium"}
            >
              Refresh
            </Button>
          </Stack>

          <Typography variant="body1" paragraph>
            Below you can find all your completed medical applications.
          </Typography>

          <Divider sx={{ my: 2 }} />

          <Box sx={{ mb: 3 }}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search completed applications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <Search sx={{ color: 'action.active', mr: 1 }} />,
                size: 'medium'
              }}
              sx={{
                maxWidth: 400,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  backgroundColor: 'background.paper'
                }
              }}
            />
          </Box>

          {!user?.UserId ? (
            <Alert severity="warning" sx={{ mb: 2 }}>
              Please log in to view your applications
            </Alert>
          ) : loading ? (
            <Box display="flex" justifyContent="center" p={4}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          ) : invoices.length === 0 ? (
            <Alert severity="info" sx={{ mb: 2 }}>
              No completed applications found
            </Alert>
          ) : isSmallScreen ? (
            // Mobile view - card list
            <Stack spacing={2}>
              {filteredInvoices
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((invoice, index) => (
                  <Paper key={index} sx={{ p: 2 }}>
                    <Stack spacing={1}>
                      <Typography variant="subtitle2" fontWeight="medium">
                        {invoice.application_title}
                      </Typography>
                      <Typography variant="body2">{invoice.SubmittedDate}</Typography>
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Chip 
                          label={invoice.status} 
                          size="small"
                          color="success"
                        />
                        <Stack direction="row" spacing={1}>
                          <Button
                            variant="outlined"
                            startIcon={<PictureAsPdf />}
                            onClick={() => handleDownload(index)}
                            size="small"
                          >
                            Download
                          </Button>
                          <Button
                            variant="contained"
                            color="primary"
                            startIcon={<Payment />}
                            onClick={() => handlePayNow(invoice)}
                            size="small"
                          >
                            Pay Now
                          </Button>
                        </Stack>
                      </Stack>
                    </Stack>
                  </Paper>
                ))}
              <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={filteredInvoices.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                size="small"
                sx={{
                  '& .MuiTablePagination-toolbar': {
                    justifyContent: 'center'
                  }
                }}
              />
            </Stack>
          ) : (
            // Desktop view - table
            <>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                    <TableRow>
                      <TableCell><strong>Application Title</strong></TableCell>
                      <TableCell><strong>Submitted Date</strong></TableCell>
                      <TableCell><strong>Status</strong></TableCell>
                      <TableCell><strong>Actions</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredInvoices
                      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                      .map((invoice, index) => (
                        <TableRow key={index}>
                          <TableCell>{invoice.application_title}</TableCell>
                          <TableCell>{invoice.SubmittedDate}</TableCell>
                          <TableCell>
                            <Chip 
                              label={invoice.status} 
                              color="success"
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <Stack direction="row" spacing={1}>
                              <Button 
                                variant="outlined" 
                                startIcon={<Download />}
                                onClick={() => handleDownload(index)}
                                size="small"
                              >
                                Download PDF
                              </Button>
                              <Button 
                                variant="contained" 
                                color="primary"
                                startIcon={<Payment />}
                                onClick={() => handlePayNow(invoice)}
                                size="small"
                              >
                                Pay Now
                              </Button>
                            </Stack>
                          </TableCell>
                        </TableRow>
                      ))}
                    {emptyRows > 0 && (
                      <TableRow style={{ height: 53 * emptyRows }}>
                        <TableCell colSpan={4} />
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={filteredInvoices.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                sx={{
                  '& .MuiTablePagination-toolbar': {
                    justifyContent: 'flex-end'
                  }
                }}
              />
            </>
          )}
        </CardContent>
      </Card>

      {/* Payment Dialog */}
      <Dialog
        open={paymentDialogOpen}
        onClose={handleClosePaymentDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogContent>
          { (
            <PaymentPatient
             
              onClose={handleClosePaymentDialog} 
            />
          )}
        </DialogContent>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default PatientInvoice;
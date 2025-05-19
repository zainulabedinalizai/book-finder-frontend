import React, { useState } from 'react';
import {
  Box, Typography, Container, Card, CardContent,
  Button, Divider, Grid, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow,
  Paper, TextField, Select, MenuItem, InputLabel,
  FormControl, IconButton, Dialog, DialogTitle,
  DialogContent, DialogActions
} from '@mui/material';
import { Edit, Send, Save, Cancel, Add, Delete, Receipt } from '@mui/icons-material';

const SendInvoiceToPatient = () => {
  // Sample invoice data
  const [invoices, setInvoices] = useState([
    {
      id: 'INV-2023-001',
      date: '2023-05-15',
      patientName: 'John Doe',
      description: 'Annual Checkup',
      amount: 120.00,
      status: 'Draft',
    },
    {
      id: 'INV-2023-002',
      date: '2023-06-20',
      patientName: 'Jane Smith',
      description: 'Blood Tests',
      amount: 85.50,
      status: 'Pending',
    },
    {
      id: 'INV-2023-003',
      date: '2023-07-10',
      patientName: 'Robert Johnson',
      description: 'Consultation',
      amount: 65.00,
      status: 'Sent',
    },
  ]);

  const [editMode, setEditMode] = useState(null);
  const [editedInvoice, setEditedInvoice] = useState({});
  const [newInvoice, setNewInvoice] = useState({
    description: '',
    amount: '',
    patientName: ''
  });
  const [openDialog, setOpenDialog] = useState(false);

  const handleEdit = (invoice) => {
    setEditMode(invoice.id);
    setEditedInvoice({ ...invoice });
  };

  const handleSave = (id) => {
    setInvoices(invoices.map(invoice => 
      invoice.id === id ? { ...editedInvoice } : invoice
    ));
    setEditMode(null);
  };

  const handleCancel = () => {
    setEditMode(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedInvoice(prev => ({ ...prev, [name]: value }));
  };

  const handleNewInvoiceChange = (e) => {
    const { name, value } = e.target;
    setNewInvoice(prev => ({ ...prev, [name]: value }));
  };

  const handleSendInvoice = (id) => {
    setInvoices(invoices.map(invoice => 
      invoice.id === id ? { ...invoice, status: 'Sent' } : invoice
    ));
    alert(`Invoice ${id} sent to patient`);
  };

  const handleAddInvoice = () => {
    const newId = `INV-${new Date().getFullYear()}-${invoices.length + 1}`;
    const today = new Date().toISOString().split('T')[0];
    
    setInvoices([
      ...invoices,
      {
        id: newId,
        date: today,
        patientName: newInvoice.patientName,
        description: newInvoice.description,
        amount: parseFloat(newInvoice.amount),
        status: 'Draft'
      }
    ]);
    
    setNewInvoice({ description: '', amount: '', patientName: '' });
    setOpenDialog(false);
  };

  const handleDelete = (id) => {
    setInvoices(invoices.filter(invoice => invoice.id !== id));
  };

  return (
    <Container maxWidth="lg">
      <Card>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Box display="flex" alignItems="center">
              <Receipt fontSize="large" color="primary" sx={{ mr: 2 }} />
              <Typography variant="h4">Manage Patient Invoices</Typography>
            </Box>
            <Button 
              variant="contained" 
              startIcon={<Add />}
              onClick={() => setOpenDialog(true)}
            >
              Create New Invoice
            </Button>
          </Box>

          <Typography variant="body1" paragraph>
            Create, edit, and send medical invoices to patients. Update fees and charges as needed.
          </Typography>

          <Divider sx={{ my: 3 }} />

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                  <TableCell><strong>Invoice #</strong></TableCell>
                  <TableCell><strong>Date</strong></TableCell>
                  <TableCell><strong>Patient</strong></TableCell>
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
                    <TableCell>
                      {editMode === invoice.id ? (
                        <TextField
                          name="patientName"
                          value={editedInvoice.patientName}
                          onChange={handleInputChange}
                          size="small"
                        />
                      ) : (
                        invoice.patientName
                      )}
                    </TableCell>
                    <TableCell>
                      {editMode === invoice.id ? (
                        <TextField
                          name="description"
                          value={editedInvoice.description}
                          onChange={handleInputChange}
                          size="small"
                        />
                      ) : (
                        invoice.description
                      )}
                    </TableCell>
                    <TableCell>
                      {editMode === invoice.id ? (
                        <TextField
                          name="amount"
                          type="number"
                          value={editedInvoice.amount}
                          onChange={handleInputChange}
                          size="small"
                          inputProps={{ step: "0.01" }}
                        />
                      ) : (
                        invoice.amount.toFixed(2)
                      )}
                    </TableCell>
                    <TableCell>
                      {editMode === invoice.id ? (
                        <FormControl size="small" sx={{ minWidth: 120 }}>
                          <InputLabel>Status</InputLabel>
                          <Select
                            name="status"
                            value={editedInvoice.status}
                            onChange={handleInputChange}
                            label="Status"
                          >
                            <MenuItem value="Draft">Draft</MenuItem>
                            <MenuItem value="Sent">Sent</MenuItem>
                            <MenuItem value="Pending">Pending</MenuItem>
                            <MenuItem value="Paid">Paid</MenuItem>
                          </Select>
                        </FormControl>
                      ) : (
                        <Box 
                          component="span" 
                          sx={{
                            p: '4px 8px',
                            borderRadius: '4px',
                            backgroundColor: 
                              invoice.status === 'Paid' ? '#e6f7ee' :
                              invoice.status === 'Sent' ? '#e3f2fd' :
                              invoice.status === 'Pending' ? '#fff3e0' : '#f5f5f5',
                            color: 
                              invoice.status === 'Paid' ? '#00a65a' :
                              invoice.status === 'Sent' ? '#1976d2' :
                              invoice.status === 'Pending' ? '#ff9800' : '#757575'
                          }}
                        >
                          {invoice.status}
                        </Box>
                      )}
                    </TableCell>
                    <TableCell>
                      {editMode === invoice.id ? (
                        <>
                          <IconButton 
                            color="primary" 
                            onClick={() => handleSave(invoice.id)}
                          >
                            <Save />
                          </IconButton>
                          <IconButton 
                            color="error" 
                            onClick={handleCancel}
                          >
                            <Cancel />
                          </IconButton>
                        </>
                      ) : (
                        <>
                          <IconButton 
                            color="primary" 
                            onClick={() => handleEdit(invoice)}
                          >
                            <Edit />
                          </IconButton>
                          <IconButton 
                            color="success" 
                            onClick={() => handleSendInvoice(invoice.id)}
                            disabled={invoice.status === 'Sent' || invoice.status === 'Paid'}
                          >
                            <Send />
                          </IconButton>
                          <IconButton 
                            color="error" 
                            onClick={() => handleDelete(invoice.id)}
                          >
                            <Delete />
                          </IconButton>
                        </>
                      )}
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
                    Invoice Summary
                  </Typography>
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography>Total Invoices:</Typography>
                    <Typography><strong>{invoices.length}</strong></Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography>Draft Invoices:</Typography>
                    <Typography><strong>{invoices.filter(i => i.status === 'Draft').length}</strong></Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between">
                    <Typography>Sent Invoices:</Typography>
                    <Typography><strong>{invoices.filter(i => i.status === 'Sent').length}</strong></Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Financial Summary
                  </Typography>
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography>Total Amount:</Typography>
                    <Typography><strong>${invoices.reduce((sum, i) => sum + i.amount, 0).toFixed(2)}</strong></Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography>Pending Amount:</Typography>
                    <Typography><strong>${invoices.filter(i => i.status !== 'Paid').reduce((sum, i) => sum + i.amount, 0).toFixed(2)}</strong></Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between">
                    <Typography>Paid Amount:</Typography>
                    <Typography><strong>${invoices.filter(i => i.status === 'Paid').reduce((sum, i) => sum + i.amount, 0).toFixed(2)}</strong></Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* New Invoice Dialog */}
          <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
            <DialogTitle>Create New Invoice</DialogTitle>
            <DialogContent>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Patient Name"
                    name="patientName"
                    value={newInvoice.patientName}
                    onChange={handleNewInvoiceChange}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Description"
                    name="description"
                    value={newInvoice.description}
                    onChange={handleNewInvoiceChange}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Amount"
                    name="amount"
                    type="number"
                    value={newInvoice.amount}
                    onChange={handleNewInvoiceChange}
                    inputProps={{ step: "0.01" }}
                  />
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
              <Button 
                variant="contained" 
                onClick={handleAddInvoice}
                disabled={!newInvoice.patientName || !newInvoice.description || !newInvoice.amount}
              >
                Create Invoice
              </Button>
            </DialogActions>
          </Dialog>
        </CardContent>
      </Card>
    </Container>
  );
};

export default SendInvoiceToPatient;
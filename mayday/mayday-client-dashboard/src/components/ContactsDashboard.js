import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  InputAdornment,
  IconButton,
  Chip,
  Avatar,
  Menu,
  MenuItem,
  Grid,
  FormControl,
  InputLabel,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Checkbox,
  Tooltip,
  Alert,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  CircularProgress,
} from "@mui/material";
import {
  Search as SearchIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  WhatsApp as WhatsAppIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  Download as DownloadIcon,
  Upload as UploadIcon,
  Refresh as RefreshIcon,
  Visibility as VisibilityIcon,
  LocationOn as LocationIcon,
  Work as WorkIcon,
  CalendarToday as CalendarIcon,
  Notes as NotesIcon,
  Star as StarIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import ContactForm from "./ContactForm";
import { ContactImportModal } from "./ContactImport";
import contactService from "../services/contactService";
import LoadingIndicator from "./common/LoadingIndicator";

const ContactsDashboard = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [contactFormOpen, setContactFormOpen] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [editingContact, setEditingContact] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedContact, setSelectedContact] = useState(null);
  const [detailViewOpen, setDetailViewOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [contactToDelete, setContactToDelete] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [exportProgress, setExportProgress] = useState("");
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    customers: 0,
    leads: 0,
  });
  const [exporting, setExporting] = useState(false);

  const showSnackbar = useCallback((message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  }, []);

  const loadContacts = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page: page + 1,
        limit: rowsPerPage,
        search: searchTerm,
        type: filterType !== "all" ? filterType : undefined,
        status: filterStatus !== "all" ? filterStatus : undefined,
      };

      const response = await contactService.getContacts(params);
      setContacts(response.data || []);
      setTotalCount(response.total || 0);
    } catch (error) {
      console.error("Failed to load contacts:", error);
      showSnackbar("Failed to load contacts", "error");
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, searchTerm, filterType, filterStatus, showSnackbar]);

  const loadStats = useCallback(async () => {
    try {
      const response = await contactService.getContactStats();
      setStats(
        response.data || {
          total: 0,
          active: 0,
          customers: 0,
          leads: 0,
        }
      );
    } catch (error) {
      console.error("Failed to load stats:", error);
    }
  }, []);

  useEffect(() => {
    loadContacts();
    loadStats();
  }, [loadContacts, loadStats]);

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

  const handleFilterChange = (filterType, value) => {
    if (filterType === "type") {
      setFilterType(value);
    } else if (filterType === "status") {
      setFilterStatus(value);
    }
    setPage(0);
  };

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSelectAll = (event) => {
    if (event.target.checked) {
      setSelectedContacts(contacts.map((contact) => contact.id));
    } else {
      setSelectedContacts([]);
    }
  };

  const handleSelectContact = (contactId) => {
    setSelectedContacts((prev) =>
      prev.includes(contactId)
        ? prev.filter((id) => id !== contactId)
        : [...prev, contactId]
    );
  };

  const handleCreateContact = () => {
    setEditingContact(null);
    setContactFormOpen(true);
  };

  const handleEditContact = (contact) => {
    setEditingContact(contact);
    setContactFormOpen(true);
  };

  const handleViewContact = (contact) => {
    setSelectedContact(contact);
    setDetailViewOpen(true);
  };

  const handleCloseDetailView = () => {
    setDetailViewOpen(false);
    setSelectedContact(null);
  };

  const handleDeleteContact = (contact) => {
    setContactToDelete(contact);
    setDeleteConfirmOpen(true);
  };

  const confirmDeleteContact = async () => {
    if (!contactToDelete) return;

    try {
      await contactService.deleteContact(contactToDelete.id);
      showSnackbar("Contact deleted successfully", "success");
      loadContacts();
      loadStats();
    } catch (error) {
      console.error("Failed to delete contact:", error);
      showSnackbar("Failed to delete contact", "error");
    } finally {
      setDeleteConfirmOpen(false);
      setContactToDelete(null);
    }
  };

  const cancelDeleteContact = () => {
    setDeleteConfirmOpen(false);
    setContactToDelete(null);
  };

  const handleBulkDelete = async () => {
    if (selectedContacts.length === 0) return;

    if (
      window.confirm(
        `Are you sure you want to delete ${selectedContacts.length} contacts?`
      )
    ) {
      try {
        await contactService.bulkDeleteContacts(selectedContacts);
        showSnackbar(
          `${selectedContacts.length} contacts deleted successfully`,
          "success"
        );
        setSelectedContacts([]);
        loadContacts();
      } catch (error) {
        console.error("Failed to bulk delete contacts:", error);
        showSnackbar("Failed to delete contacts", "error");
      }
    }
  };

  const handleContactSaved = () => {
    setContactFormOpen(false);
    setEditingContact(null);
    loadContacts();
    loadStats();
  };

  const handleMenuOpen = (event, contact) => {
    setAnchorEl(event.currentTarget);
    setSelectedContact(contact);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedContact(null);
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleExportContacts = async () => {
    if (exporting) return; // Prevent double submissions

    setExporting(true);
    setExportProgress("Preparing export...");
    showSnackbar("Preparing export...", "info");

    try {
      const filters = {
        search: searchTerm,
        type: filterType !== "all" ? filterType : undefined,
        status: filterStatus !== "all" ? filterStatus : undefined,
      };

      setExportProgress("Downloading contacts...");
      showSnackbar("Downloading contacts...", "info");
      const blob = await contactService.exportContacts("csv", filters);

      setExportProgress("Creating download...");
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `contacts-${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      setExportProgress("");
      showSnackbar("Contacts exported successfully", "success");
    } catch (error) {
      console.error("Failed to export contacts:", error);
      setExportProgress("");
      showSnackbar("Failed to export contacts", "error");
    } finally {
      setExporting(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      active: "success",
      inactive: "default",
      pending: "warning",
      blocked: "error",
    };
    return colors[status] || "default";
  };

  const getTypeColor = (type) => {
    const colors = {
      customer: "primary",
      lead: "secondary",
      prospect: "info",
      vendor: "warning",
      partner: "success",
    };
    return colors[type] || "default";
  };

  const formatPhone = (phone) => {
    return contactService.formatPhoneNumber(phone);
  };

  const getInitials = (firstName, lastName) => {
    return contactService.generateAvatarInitials(firstName, lastName);
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h4" component="h1">
          Contact Manager
        </Typography>
        <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
          <Button
            variant="outlined"
            startIcon={<UploadIcon />}
            onClick={() => setImportDialogOpen(true)}
          >
            Import
          </Button>
          <Button
            variant="outlined"
            startIcon={
              exporting ? (
                <CircularProgress size={16} color="inherit" />
              ) : (
                <DownloadIcon />
              )
            }
            onClick={handleExportContacts}
            disabled={exporting}
          >
            {exporting ? "Exporting..." : "Export"}
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreateContact}
          >
            Add Contact
          </Button>
          {exporting && exportProgress && (
            <Typography variant="body2" color="textSecondary" sx={{ ml: 1 }}>
              {exportProgress}
            </Typography>
          )}
        </Box>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <PersonIcon color="primary" sx={{ mr: 2 }} />
                <Box>
                  <Typography variant="h6">{stats.total}</Typography>
                  <Typography color="textSecondary">Total Contacts</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <BusinessIcon color="success" sx={{ mr: 2 }} />
                <Box>
                  <Typography variant="h6">{stats.customers}</Typography>
                  <Typography color="textSecondary">Customers</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <PersonIcon color="info" sx={{ mr: 2 }} />
                <Box>
                  <Typography variant="h6">{stats.leads}</Typography>
                  <Typography color="textSecondary">Leads</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <PersonIcon color="warning" sx={{ mr: 2 }} />
                <Box>
                  <Typography variant="h6">{stats.active}</Typography>
                  <Typography color="textSecondary">Active</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters and Search */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Search contacts..."
                value={searchTerm}
                onChange={handleSearch}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Type</InputLabel>
                <Select
                  value={filterType}
                  onChange={(e) => handleFilterChange("type", e.target.value)}
                  label="Type"
                >
                  <MenuItem value="all">All Types</MenuItem>
                  <MenuItem value="customer">Customer</MenuItem>
                  <MenuItem value="lead">Lead</MenuItem>
                  <MenuItem value="prospect">Prospect</MenuItem>
                  <MenuItem value="vendor">Vendor</MenuItem>
                  <MenuItem value="partner">Partner</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={filterStatus}
                  onChange={(e) => handleFilterChange("status", e.target.value)}
                  label="Status"
                >
                  <MenuItem value="all">All Statuses</MenuItem>
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="blocked">Blocked</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={loadContacts}
              >
                Refresh
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Contacts Table */}
      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={
                      selectedContacts.length === contacts.length &&
                      contacts.length > 0
                    }
                    indeterminate={
                      selectedContacts.length > 0 &&
                      selectedContacts.length < contacts.length
                    }
                    onChange={(e) => {
                      e.stopPropagation();
                      handleSelectAll(e);
                    }}
                  />
                </TableCell>
                <TableCell>Contact</TableCell>
                <TableCell>Company</TableCell>
                <TableCell>Phone</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 8 }}>
                    <LoadingIndicator height={200} width={200} />
                  </TableCell>
                </TableRow>
              ) : contacts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    <Typography>No contacts found</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                contacts.map((contact) => (
                  <TableRow
                    key={contact.id}
                    hover
                    sx={{ cursor: "pointer" }}
                    onClick={() => handleViewContact(contact)}
                  >
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={selectedContacts.includes(contact.id)}
                        onChange={(e) => {
                          e.stopPropagation();
                          handleSelectContact(contact.id);
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <Avatar sx={{ mr: 2, bgcolor: "primary.main" }}>
                          {getInitials(contact.firstName, contact.lastName)}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2">
                            {contact.firstName} {contact.lastName}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            {contact.jobTitle}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {contact.company || "-"}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        {contact.primaryPhone && (
                          <Tooltip title={formatPhone(contact.primaryPhone)}>
                            <PhoneIcon fontSize="small" color="action" />
                          </Tooltip>
                        )}
                        {contact.whatsappNumber && (
                          <Tooltip title={formatPhone(contact.whatsappNumber)}>
                            <WhatsAppIcon fontSize="small" color="success" />
                          </Tooltip>
                        )}
                        <Typography variant="body2">
                          {formatPhone(contact.primaryPhone) || "-"}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        {contact.email && (
                          <EmailIcon fontSize="small" color="action" />
                        )}
                        <Typography variant="body2">
                          {contact.email || "-"}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={contact.contactType}
                        color={getTypeColor(contact.contactType)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={contact.status}
                        color={getStatusColor(contact.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMenuOpen(e, contact);
                        }}
                        size="small"
                      >
                        <MoreVertIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={totalCount}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handlePageChange}
          onRowsPerPageChange={handleRowsPerPageChange}
        />
      </Card>

      {/* Bulk Actions */}
      {selectedContacts.length > 0 && (
        <Box
          sx={{
            position: "fixed",
            bottom: 16,
            right: 16,
            display: "flex",
            gap: 2,
          }}
        >
          <Button
            variant="contained"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={handleBulkDelete}
          >
            Delete ({selectedContacts.length})
          </Button>
        </Box>
      )}

      {/* Contact Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem
          onClick={() => {
            handleViewContact(selectedContact);
            handleMenuClose();
          }}
        >
          <VisibilityIcon sx={{ mr: 1 }} />
          View Details
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleEditContact(selectedContact);
            handleMenuClose();
          }}
        >
          <EditIcon sx={{ mr: 1 }} />
          Edit
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleDeleteContact(selectedContact);
            handleMenuClose();
          }}
          sx={{ color: "error.main" }}
        >
          <DeleteIcon sx={{ mr: 1 }} />
          Delete
        </MenuItem>
      </Menu>

      {/* Contact Form Dialog */}
      <ContactForm
        open={contactFormOpen}
        onClose={() => setContactFormOpen(false)}
        contact={editingContact}
        onSave={handleContactSaved}
      />

      {/* Import Dialog */}
      <ContactImportModal
        open={importDialogOpen}
        onClose={() => setImportDialogOpen(false)}
        onImport={handleContactSaved}
      />

      {/* Contact Detail View Modal */}
      <Dialog
        open={detailViewOpen}
        onClose={handleCloseDetailView}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 2 },
        }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Avatar
              sx={{ mr: 2, bgcolor: "primary.main", width: 48, height: 48 }}
            >
              {selectedContact &&
                getInitials(
                  selectedContact.firstName,
                  selectedContact.lastName
                )}
            </Avatar>
            <Box>
              <Typography variant="h6">
                {selectedContact &&
                  `${selectedContact.firstName} ${selectedContact.lastName}`}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {selectedContact?.jobTitle || "No job title"}
              </Typography>
            </Box>
          </Box>
          <IconButton onClick={handleCloseDetailView} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent>
          <Grid container spacing={3}>
            {/* Contact Information */}
            <Grid item xs={12} md={6}>
              <Typography
                variant="h6"
                gutterBottom
                sx={{ display: "flex", alignItems: "center" }}
              >
                <PersonIcon sx={{ mr: 1 }} />
                Contact Information
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemIcon>
                    <PhoneIcon color="action" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Primary Phone"
                    secondary={
                      selectedContact?.primaryPhone
                        ? formatPhone(selectedContact.primaryPhone)
                        : "Not provided"
                    }
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <WhatsAppIcon color="success" />
                  </ListItemIcon>
                  <ListItemText
                    primary="WhatsApp"
                    secondary={
                      selectedContact?.whatsappNumber
                        ? formatPhone(selectedContact.whatsappNumber)
                        : "Not provided"
                    }
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <PhoneIcon color="action" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Secondary Phone"
                    secondary={
                      selectedContact?.secondaryPhone
                        ? formatPhone(selectedContact.secondaryPhone)
                        : "Not provided"
                    }
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <EmailIcon color="action" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Email"
                    secondary={selectedContact?.email || "Not provided"}
                  />
                </ListItem>
              </List>
            </Grid>

            {/* Company & Professional Info */}
            <Grid item xs={12} md={6}>
              <Typography
                variant="h6"
                gutterBottom
                sx={{ display: "flex", alignItems: "center" }}
              >
                <BusinessIcon sx={{ mr: 1 }} />
                Professional Information
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemIcon>
                    <BusinessIcon color="action" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Company"
                    secondary={selectedContact?.company || "Not provided"}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <WorkIcon color="action" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Job Title"
                    secondary={selectedContact?.jobTitle || "Not provided"}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <LocationIcon color="action" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Address"
                    secondary={selectedContact?.address || "Not provided"}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <BusinessIcon color="action" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Website"
                    secondary={selectedContact?.website || "Not provided"}
                  />
                </ListItem>
              </List>
            </Grid>

            {/* Status & Classification */}
            <Grid item xs={12}>
              <Typography
                variant="h6"
                gutterBottom
                sx={{ display: "flex", alignItems: "center" }}
              >
                <StarIcon sx={{ mr: 1 }} />
                Status & Classification
              </Typography>
              <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", mb: 2 }}>
                <Chip
                  label={selectedContact?.contactType || "Unknown"}
                  color={getTypeColor(selectedContact?.contactType)}
                  icon={<PersonIcon />}
                />
                <Chip
                  label={selectedContact?.status || "Unknown"}
                  color={getStatusColor(selectedContact?.status)}
                  icon={<StarIcon />}
                />
                {selectedContact?.priority && (
                  <Chip
                    label={selectedContact.priority}
                    color="warning"
                    variant="outlined"
                  />
                )}
                {selectedContact?.isFavorite && (
                  <Chip
                    label="Favorite"
                    color="secondary"
                    icon={<StarIcon />}
                  />
                )}
              </Box>
            </Grid>

            {/* Additional Information */}
            {(selectedContact?.notes || selectedContact?.tags?.length > 0) && (
              <Grid item xs={12}>
                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{ display: "flex", alignItems: "center" }}
                >
                  <NotesIcon sx={{ mr: 1 }} />
                  Additional Information
                </Typography>
                {selectedContact?.notes && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Notes:
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {selectedContact.notes}
                    </Typography>
                  </Box>
                )}
                {selectedContact?.tags?.length > 0 && (
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>
                      Tags:
                    </Typography>
                    <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                      {selectedContact.tags.map((tag, index) => (
                        <Chip
                          key={index}
                          label={tag}
                          size="small"
                          variant="outlined"
                        />
                      ))}
                    </Box>
                  </Box>
                )}
              </Grid>
            )}

            {/* Timestamps */}
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography
                variant="h6"
                gutterBottom
                sx={{ display: "flex", alignItems: "center" }}
              >
                <CalendarIcon sx={{ mr: 1 }} />
                Timestamps
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemIcon>
                    <CalendarIcon color="action" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Created"
                    secondary={
                      selectedContact?.createdAt
                        ? new Date(selectedContact.createdAt).toLocaleString()
                        : "Unknown"
                    }
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CalendarIcon color="action" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Last Updated"
                    secondary={
                      selectedContact?.updatedAt
                        ? new Date(selectedContact.updatedAt).toLocaleString()
                        : "Unknown"
                    }
                  />
                </ListItem>
                {selectedContact?.lastContacted && (
                  <ListItem>
                    <ListItemIcon>
                      <CalendarIcon color="action" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Last Contacted"
                      secondary={new Date(
                        selectedContact.lastContacted
                      ).toLocaleString()}
                    />
                  </ListItem>
                )}
              </List>
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button onClick={handleCloseDetailView} variant="outlined">
            Close
          </Button>
          <Button
            onClick={() => {
              handleCloseDetailView();
              handleEditContact(selectedContact);
            }}
            variant="contained"
            startIcon={<EditIcon />}
          >
            Edit Contact
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={cancelDeleteContact}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 2 },
        }}
      >
        <DialogTitle sx={{ display: "flex", alignItems: "center" }}>
          <DeleteIcon color="error" sx={{ mr: 1 }} />
          Delete Contact
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom>
            Are you sure you want to delete this contact?
          </Typography>
          {contactToDelete && (
            <Box sx={{ mt: 2, p: 2, bgcolor: "grey.50", borderRadius: 1 }}>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Avatar sx={{ mr: 2, bgcolor: "primary.main" }}>
                  {getInitials(
                    contactToDelete.firstName,
                    contactToDelete.lastName
                  )}
                </Avatar>
                <Box>
                  <Typography variant="subtitle1" fontWeight="bold">
                    {contactToDelete.firstName} {contactToDelete.lastName}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {contactToDelete.email ||
                      contactToDelete.primaryPhone ||
                      "No contact info"}
                  </Typography>
                </Box>
              </Box>
            </Box>
          )}
          <Typography variant="body2" color="error" sx={{ mt: 2 }}>
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button onClick={cancelDeleteContact} variant="outlined">
            Cancel
          </Button>
          <Button
            onClick={confirmDeleteContact}
            variant="contained"
            color="error"
            startIcon={<DeleteIcon />}
          >
            Delete Contact
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ContactsDashboard;

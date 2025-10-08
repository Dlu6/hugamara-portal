import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  IconButton,
  Grid,
  Card,
  CardContent,
  Avatar,
  Chip,
  Tooltip,
  Menu,
  MenuItem,
  ListItemIcon,
  Divider,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  CircularProgress,
  Alert,
  Checkbox,
  FormControlLabel,
  Autocomplete,
  Stack,
  Badge,
  Tabs,
  Tab,
  Pagination,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Switch,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
} from "@mui/material";
import {
  Search,
  Add,
  Phone,
  Email,
  Edit,
  Delete,
  Star,
  StarBorder,
  MoreVert,
  WhatsApp,
  Business,
  Person,
  Group,
  Refresh,
  FilterList,
  Download,
  Upload,
  Visibility,
  VisibilityOff,
  Call,
  Message,
  LocationOn,
  Language,
  Schedule,
  Tag,
  Category,
  Assignment,
  PersonAdd,
  PersonRemove,
  Block,
  CheckCircle,
  Cancel,
} from "@mui/icons-material";
import ContentFrame from "./ContentFrame";
import contactService from "../services/contactService";
import { useNotification } from "../contexts/NotificationContext";

// Contact form component
const ContactForm = ({ open, onClose, contact, onSave, onWhatsAppChat }) => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    company: "",
    jobTitle: "",
    primaryPhone: "",
    secondaryPhone: "",
    email: "",
    website: "",
    address: "",
    city: "",
    state: "",
    country: "",
    postalCode: "",
    contactType: "customer",
    priority: "medium",
    status: "active",
    source: "manual",
    preferredContactMethod: "phone",
    preferredLanguage: "en",
    timezone: "UTC",
    notes: "",
    tags: [],
    categories: [],
    whatsappNumber: "",
    whatsappOptIn: false,
    assignedAgentId: null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);
  const [errors, setErrors] = useState({});
  const { showNotification } = useNotification();

  useEffect(() => {
    if (contact) {
      // Sanitize contact data - convert null values to empty strings for controlled inputs
      setFormData({
        firstName: contact.firstName || "",
        lastName: contact.lastName || "",
        company: contact.company || "",
        jobTitle: contact.jobTitle || "",
        primaryPhone: contact.primaryPhone || "",
        secondaryPhone: contact.secondaryPhone || "",
        email: contact.email || "",
        website: contact.website || "",
        address: contact.address || "",
        city: contact.city || "",
        state: contact.state || "",
        country: contact.country || "",
        postalCode: contact.postalCode || "",
        contactType: contact.contactType || "customer",
        priority: contact.priority || "medium",
        status: contact.status || "active",
        source: contact.source || "manual",
        preferredContactMethod: contact.preferredContactMethod || "phone",
        preferredLanguage: contact.preferredLanguage || "en",
        timezone: contact.timezone || "UTC",
        notes: contact.notes || "",
        tags: contact.tags || [],
        categories: contact.categories || [],
        whatsappNumber: contact.whatsappNumber || "",
        whatsappOptIn: contact.whatsappOptIn || false,
        assignedAgentId: contact.assignedAgentId || null,
      });
    } else {
      setFormData({
        firstName: "",
        lastName: "",
        company: "",
        jobTitle: "",
        primaryPhone: "",
        secondaryPhone: "",
        email: "",
        website: "",
        address: "",
        city: "",
        state: "",
        country: "",
        postalCode: "",
        contactType: "customer",
        priority: "medium",
        status: "active",
        source: "manual",
        preferredContactMethod: "phone",
        preferredLanguage: "en",
        timezone: "UTC",
        notes: "",
        tags: [],
        categories: [],
        whatsappNumber: "",
        whatsappOptIn: false,
        assignedAgentId: null,
      });
    }
  }, [contact]);

  // Validate form whenever formData changes
  useEffect(() => {
    const isValid =
      formData.firstName.trim() !== "" && formData.primaryPhone.trim() !== "";
    setIsFormValid(isValid && !isSubmitting);
  }, [formData.firstName, formData.primaryPhone, isSubmitting]);

  const handleChange = (field) => (event) => {
    const value = event.target.value;
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: null,
      }));
    }
  };

  const handleArrayChange = (field) => (event, newValue) => {
    setFormData((prev) => ({
      ...prev,
      [field]: newValue,
    }));
  };

  const handleTagsChange = (event, newValue) => {
    setFormData((prev) => ({
      ...prev,
      tags: newValue,
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    }

    if (!formData.primaryPhone.trim()) {
      newErrors.primaryPhone = "Primary phone is required";
    } else if (!contactService.validatePhone(formData.primaryPhone)) {
      newErrors.primaryPhone = "Invalid phone number format";
    }

    if (formData.email && !contactService.validateEmail(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    if (
      formData.secondaryPhone &&
      !contactService.validatePhone(formData.secondaryPhone)
    ) {
      newErrors.secondaryPhone = "Invalid secondary phone format";
    }

    if (
      formData.whatsappNumber &&
      !contactService.validatePhone(formData.whatsappNumber)
    ) {
      newErrors.whatsappNumber = "Invalid WhatsApp number format";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      // Format phone numbers
      const formattedData = {
        ...formData,
        primaryPhone: contactService.formatPhoneNumber(formData.primaryPhone),
        secondaryPhone: formData.secondaryPhone
          ? contactService.formatPhoneNumber(formData.secondaryPhone)
          : null,
        whatsappNumber: formData.whatsappNumber
          ? contactService.formatPhoneNumber(formData.whatsappNumber)
          : null,
      };

      if (contact) {
        await contactService.updateContact(contact.id, formattedData);
        showNotification("Contact updated successfully", "success");
      } else {
        await contactService.createContact(formattedData);
        showNotification("Contact created successfully", "success");
      }

      onSave();
      onClose();
    } catch (error) {
      console.error("Error saving contact:", error);
      showNotification(
        error.response?.data?.error || "Failed to save contact",
        "error"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleWhatsAppChat = () => {
    if (formData.whatsappNumber || formData.primaryPhone) {
      const whatsAppContact = {
        id: `wa-${contact?.id || Date.now()}`,
        name: `${formData.firstName} ${formData.lastName}`.trim(),
        phoneNumber: formData.whatsappNumber || formData.primaryPhone,
        avatar: contactService.generateAvatarInitials(
          formData.firstName,
          formData.lastName
        ),
        isGroup: false,
        messages: [],
        unread: 0,
        isOnline: false,
        timestamp: new Date().toISOString(),
      };

      onWhatsAppChat(whatsAppContact);
      onClose();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      sx={{ zIndex: 1300 }}
    >
      <DialogTitle>{contact ? "Edit Contact" : "Add New Contact"}</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          {/* Basic Information */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Basic Information
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="First Name *"
              value={formData.firstName}
              onChange={handleChange("firstName")}
              error={!!errors.firstName}
              helperText={errors.firstName}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Last Name"
              value={formData.lastName}
              onChange={handleChange("lastName")}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Company"
              value={formData.company}
              onChange={handleChange("company")}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Job Title"
              value={formData.jobTitle}
              onChange={handleChange("jobTitle")}
            />
          </Grid>

          {/* Contact Information */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
              Contact Information
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Primary Phone *"
              placeholder="e.g., +256700123456 or 0700123456"
              value={formData.primaryPhone}
              onChange={handleChange("primaryPhone")}
              error={!!errors.primaryPhone}
              helperText={
                errors.primaryPhone ||
                "Enter phone number with or without country code"
              }
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Secondary Phone"
              placeholder="e.g., +256700123456 or 0700123456"
              value={formData.secondaryPhone}
              onChange={handleChange("secondaryPhone")}
              error={!!errors.secondaryPhone}
              helperText={
                errors.secondaryPhone || "Optional secondary phone number"
              }
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={formData.email}
              onChange={handleChange("email")}
              error={!!errors.email}
              helperText={errors.email}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Website"
              value={formData.website}
              onChange={handleChange("website")}
            />
          </Grid>

          {/* WhatsApp Integration */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
              WhatsApp Integration
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="WhatsApp Number"
              placeholder="e.g., +256700123456 or 0700123456"
              value={formData.whatsappNumber}
              onChange={handleChange("whatsappNumber")}
              error={!!errors.whatsappNumber}
              helperText={errors.whatsappNumber || "Optional WhatsApp number"}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.whatsappOptIn}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      whatsappOptIn: e.target.checked,
                    }))
                  }
                />
              }
              label="WhatsApp Opt-in"
            />
          </Grid>

          {/* Address Information */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
              Address Information
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Address"
              multiline
              rows={2}
              value={formData.address}
              onChange={handleChange("address")}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="City"
              value={formData.city}
              onChange={handleChange("city")}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="State"
              value={formData.state}
              onChange={handleChange("state")}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Country"
              value={formData.country}
              onChange={handleChange("country")}
            />
          </Grid>

          {/* Classification */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
              Classification
            </Typography>
          </Grid>
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth>
              <InputLabel>Contact Type</InputLabel>
              <Select
                value={formData.contactType}
                onChange={handleChange("contactType")}
                label="Contact Type"
              >
                {contactService.getContactTypes().map((type) => (
                  <MenuItem key={type.value} value={type.value}>
                    {type.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth>
              <InputLabel>Priority</InputLabel>
              <Select
                value={formData.priority}
                onChange={handleChange("priority")}
                label="Priority"
              >
                {contactService.getPriorities().map((priority) => (
                  <MenuItem key={priority.value} value={priority.value}>
                    {priority.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={formData.status}
                onChange={handleChange("status")}
                label="Status"
              >
                {contactService.getStatuses().map((status) => (
                  <MenuItem key={status.value} value={status.value}>
                    {status.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Tags */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
              Tags & Categories
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Autocomplete
              multiple
              freeSolo
              options={[]}
              value={formData.tags}
              onChange={handleTagsChange}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip
                    variant="outlined"
                    label={option}
                    {...getTagProps({ index })}
                    key={index}
                  />
                ))
              }
              renderInput={(params) => (
                <TextField {...params} label="Tags" placeholder="Add tags..." />
              )}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <Autocomplete
              multiple
              freeSolo
              options={[]}
              value={formData.categories}
              onChange={handleArrayChange("categories")}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip
                    variant="outlined"
                    label={option}
                    {...getTagProps({ index })}
                    key={index}
                  />
                ))
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Categories"
                  placeholder="Add categories..."
                />
              )}
            />
          </Grid>

          {/* Notes */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Notes"
              multiline
              rows={3}
              value={formData.notes}
              onChange={handleChange("notes")}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        {(formData.whatsappNumber || formData.primaryPhone) && (
          <Button
            onClick={handleWhatsAppChat}
            startIcon={<WhatsApp />}
            color="success"
          >
            WhatsApp Chat
          </Button>
        )}
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={isSubmitting || !isFormValid}
          startIcon={isSubmitting ? <CircularProgress size={20} /> : null}
        >
          {isSubmitting ? "Saving..." : contact ? "Update" : "Create"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Contact card component
const ContactCard = ({ contact, onEdit, onDelete, onWhatsAppChat, onCall }) => {
  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const getPriorityColor = (priority) => {
    const priorityMap = {
      low: "#4caf50",
      medium: "#ff9800",
      high: "#f44336",
      vip: "#9c27b0",
    };
    return priorityMap[priority] || "#ff9800";
  };

  const getStatusColor = (status) => {
    const statusMap = {
      active: "#4caf50",
      inactive: "#9e9e9e",
      blocked: "#f44336",
      deleted: "#757575",
    };
    return statusMap[status] || "#9e9e9e";
  };

  return (
    <Card
      elevation={0}
      sx={{
        border: 1,
        borderColor: "divider",
        borderRadius: "12px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.5)",
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow: "0 6px 16px rgba(0,0,0,0.8)",
        },
      }}
    >
      <CardContent>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            mb: 2,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Avatar
              sx={{
                bgcolor: getPriorityColor(contact.priority),
                width: 48,
                height: 48,
              }}
            >
              {contactService.generateAvatarInitials(
                contact.firstName,
                contact.lastName
              )}
            </Avatar>
            <Box>
              <Typography variant="h6" component="div">
                {contact.firstName} {contact.lastName}
              </Typography>
              {contact.company && (
                <Typography variant="body2" color="text.secondary">
                  {contact.company}
                </Typography>
              )}
            </Box>
          </Box>
          <IconButton onClick={handleMenuOpen} size="small">
            <MoreVert />
          </IconButton>
        </Box>

        <Box sx={{ mb: 2 }}>
          <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
            <Chip
              label={contact.contactType}
              size="small"
              color="primary"
              variant="outlined"
            />
            <Chip
              label={contact.priority}
              size="small"
              sx={{
                backgroundColor: getPriorityColor(contact.priority),
                color: "white",
              }}
            />
            <Chip
              label={contact.status}
              size="small"
              sx={{
                backgroundColor: getStatusColor(contact.status),
                color: "white",
              }}
            />
          </Stack>
        </Box>

        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
            <Phone fontSize="small" color="action" />
            <Typography variant="body2">{contact.primaryPhone}</Typography>
          </Box>
          {contact.email && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
              <Email fontSize="small" color="action" />
              <Typography variant="body2">{contact.email}</Typography>
            </Box>
          )}
          {contact.whatsappNumber && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <WhatsApp fontSize="small" color="action" />
              <Typography variant="body2">{contact.whatsappNumber}</Typography>
            </Box>
          )}
        </Box>

        {contact.tags && contact.tags.length > 0 && (
          <Box sx={{ mb: 2 }}>
            <Stack direction="row" spacing={0.5} flexWrap="wrap" gap={0.5}>
              {contact.tags.slice(0, 3).map((tag, index) => (
                <Chip
                  key={index}
                  label={tag}
                  size="small"
                  variant="outlined"
                  color="secondary"
                />
              ))}
              {contact.tags.length > 3 && (
                <Chip
                  label={`+${contact.tags.length - 3}`}
                  size="small"
                  variant="outlined"
                />
              )}
            </Stack>
          </Box>
        )}

        <Box sx={{ display: "flex", gap: 1, justifyContent: "flex-end" }}>
          {contact.primaryPhone && (
            <Tooltip title="Call">
              <IconButton size="small" onClick={() => onCall(contact)}>
                <Call />
              </IconButton>
            </Tooltip>
          )}
          {(contact.whatsappNumber || contact.primaryPhone) && (
            <Tooltip title="WhatsApp">
              <IconButton size="small" onClick={() => onWhatsAppChat(contact)}>
                <WhatsApp />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      </CardContent>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem
          onClick={() => {
            onEdit(contact);
            handleMenuClose();
          }}
        >
          <ListItemIcon>
            <Edit fontSize="small" />
          </ListItemIcon>
          Edit
        </MenuItem>
        <MenuItem
          onClick={() => {
            onDelete(contact);
            handleMenuClose();
          }}
        >
          <ListItemIcon>
            <Delete fontSize="small" />
          </ListItemIcon>
          Delete
        </MenuItem>
      </Menu>
    </Card>
  );
};

// Main Contacts component
const Contacts = ({ open, onClose, onWhatsAppChat, onCall }) => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("active");
  const [filterPriority, setFilterPriority] = useState("all");
  const [viewMode, setViewMode] = useState("grid"); // grid or list
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editContact, setEditContact] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 20,
  });
  const [stats, setStats] = useState(null);
  const { showNotification } = useNotification();

  // Load contacts
  const loadContacts = async (page = 1) => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page,
        limit: pagination.itemsPerPage,
        search: searchQuery,
        contactType: filterType !== "all" ? filterType : "",
        status: filterStatus !== "all" ? filterStatus : "",
        priority: filterPriority !== "all" ? filterPriority : "",
      };

      const response = await contactService.getContacts(params);
      setContacts(response.data);
      setPagination(response.pagination);
    } catch (error) {
      console.error("Error loading contacts:", error);
      setError("Failed to load contacts");
      showNotification("Failed to load contacts", "error");
    } finally {
      setLoading(false);
    }
  };

  // Load stats
  const loadStats = async () => {
    try {
      const response = await contactService.getContactStats();
      setStats(response.data);
    } catch (error) {
      console.error("Error loading stats:", error);
    }
  };

  useEffect(() => {
    if (open) {
      loadContacts();
      loadStats();
    }
  }, [open]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadContacts(1);
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [searchQuery, filterType, filterStatus, filterPriority]);

  const handleCreateContact = () => {
    setEditContact(null);
    setOpenDialog(true);
  };

  const handleEditContact = (contact) => {
    setEditContact(contact);
    setOpenDialog(true);
  };

  const handleDeleteContact = async (contact) => {
    if (
      window.confirm(
        `Are you sure you want to delete ${contact.firstName} ${contact.lastName}?`
      )
    ) {
      try {
        await contactService.deleteContact(contact.id);
        showNotification("Contact deleted successfully", "success");
        loadContacts(pagination.currentPage);
      } catch (error) {
        console.error("Error deleting contact:", error);
        showNotification("Failed to delete contact", "error");
      }
    }
  };

  const handleSaveContact = () => {
    loadContacts(pagination.currentPage);
    loadStats();
  };

  const handleWhatsAppChat = (contact) => {
    const whatsAppContact = {
      id: `wa-${contact.id}`,
      name: `${contact.firstName} ${contact.lastName}`.trim(),
      phoneNumber: contact.whatsappNumber || contact.primaryPhone,
      avatar: contactService.generateAvatarInitials(
        contact.firstName,
        contact.lastName
      ),
      isGroup: false,
      messages: [],
      unread: 0,
      isOnline: false,
      timestamp: new Date().toISOString(),
    };

    onWhatsAppChat(whatsAppContact);
  };

  const handleCall = (contact) => {
    if (onCall) {
      onCall(contact);
    }
  };

  const handlePageChange = (event, page) => {
    loadContacts(page);
  };

  const filteredContacts = useMemo(() => {
    return contacts.filter((contact) => {
      const matchesSearch =
        !searchQuery ||
        contact.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contact.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contact.company?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contact.primaryPhone.includes(searchQuery) ||
        contact.email?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesType =
        filterType === "all" || contact.contactType === filterType;
      const matchesStatus =
        filterStatus === "all" || contact.status === filterStatus;
      const matchesPriority =
        filterPriority === "all" || contact.priority === filterPriority;

      return matchesSearch && matchesType && matchesStatus && matchesPriority;
    });
  }, [contacts, searchQuery, filterType, filterStatus, filterPriority]);

  return (
    <ContentFrame
      open={open}
      onClose={onClose}
      title={
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Typography variant="h6">Contacts</Typography>
          {stats && (
            <Chip
              label={`${stats.total} contacts`}
              size="small"
              color="primary"
              variant="outlined"
            />
          )}
        </Box>
      }
    >
      {/* Header with search and filters */}
      <Box sx={{ p: 2, borderBottom: 1, borderColor: "divider" }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              fullWidth
              placeholder="Search contacts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth>
              <InputLabel>Type</InputLabel>
              <Select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                label="Type"
              >
                <MenuItem value="all">All Types</MenuItem>
                {contactService.getContactTypes().map((type) => (
                  <MenuItem key={type.value} value={type.value}>
                    {type.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                label="Status"
              >
                <MenuItem value="all">All Status</MenuItem>
                {contactService.getStatuses().map((status) => (
                  <MenuItem key={status.value} value={status.value}>
                    {status.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth>
              <InputLabel>Priority</InputLabel>
              <Select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                label="Priority"
              >
                <MenuItem value="all">All Priority</MenuItem>
                {contactService.getPriorities().map((priority) => (
                  <MenuItem key={priority.value} value={priority.value}>
                    {priority.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <Box sx={{ display: "flex", gap: 1 }}>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={handleCreateContact}
                fullWidth
              >
                Add Contact
              </Button>
              <IconButton onClick={() => loadContacts()}>
                <Refresh />
              </IconButton>
            </Box>
          </Grid>
        </Grid>
      </Box>

      {/* Content */}
      <Box sx={{ p: 2 }}>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        ) : filteredContacts.length === 0 ? (
          <Box sx={{ textAlign: "center", p: 4 }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No contacts found
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {searchQuery
                ? "Try adjusting your search criteria"
                : "Get started by adding your first contact"}
            </Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={handleCreateContact}
            >
              Add Contact
            </Button>
          </Box>
        ) : (
          <>
            <Grid container spacing={2}>
              {filteredContacts.map((contact) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={contact.id}>
                  <ContactCard
                    contact={contact}
                    onEdit={handleEditContact}
                    onDelete={handleDeleteContact}
                    onWhatsAppChat={handleWhatsAppChat}
                    onCall={handleCall}
                  />
                </Grid>
              ))}
            </Grid>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
                <Pagination
                  count={pagination.totalPages}
                  page={pagination.currentPage}
                  onChange={handlePageChange}
                  color="primary"
                />
              </Box>
            )}
          </>
        )}
      </Box>

      {/* Contact Form Dialog */}
      <ContactForm
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        contact={editContact}
        onSave={handleSaveContact}
        onWhatsAppChat={onWhatsAppChat}
      />
    </ContentFrame>
  );
};

export default Contacts;

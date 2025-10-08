import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  Chip,
  Autocomplete,
  Switch,
  FormControlLabel,
  Alert,
} from "@mui/material";
import contactService from "../services/contactService";

const ContactForm = ({ open, onClose, contact, onSave }) => {
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

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

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
      // Reset form for new contact
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
    setErrors({});
  }, [contact, open]);

  const handleChange = (field) => (event) => {
    const value =
      event.target.type === "checkbox"
        ? event.target.checked
        : event.target.value;
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
      newErrors.secondaryPhone = "Invalid phone number format";
    }

    if (
      formData.whatsappNumber &&
      !contactService.validatePhone(formData.whatsappNumber)
    ) {
      newErrors.whatsappNumber = "Invalid phone number format";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      if (contact) {
        await contactService.updateContact(contact.id, formData);
      } else {
        await contactService.createContact(formData);
      }
      onSave();
    } catch (error) {
      console.error("Failed to save contact:", error);
      // Handle specific validation errors from server
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      }
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = formData.firstName.trim() && formData.primaryPhone.trim();

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{contact ? "Edit Contact" : "Add New Contact"}</DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 2 }}>
          <Grid container spacing={3}>
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
                error={!!errors.lastName}
                helperText={errors.lastName}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Company"
                value={formData.company}
                onChange={handleChange("company")}
                error={!!errors.company}
                helperText={errors.company}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Job Title"
                value={formData.jobTitle}
                onChange={handleChange("jobTitle")}
                error={!!errors.jobTitle}
                helperText={errors.jobTitle}
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
                value={formData.primaryPhone}
                onChange={handleChange("primaryPhone")}
                error={!!errors.primaryPhone}
                helperText={
                  errors.primaryPhone || "Format: +1234567890 or (123) 456-7890"
                }
                placeholder="+1234567890"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Secondary Phone"
                value={formData.secondaryPhone}
                onChange={handleChange("secondaryPhone")}
                error={!!errors.secondaryPhone}
                helperText={errors.secondaryPhone}
                placeholder="+1234567890"
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
                placeholder="john@example.com"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="WhatsApp Number"
                value={formData.whatsappNumber}
                onChange={handleChange("whatsappNumber")}
                error={!!errors.whatsappNumber}
                helperText={errors.whatsappNumber}
                placeholder="+1234567890"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Website"
                value={formData.website}
                onChange={handleChange("website")}
                error={!!errors.website}
                helperText={errors.website}
                placeholder="https://example.com"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.whatsappOptIn}
                    onChange={handleChange("whatsappOptIn")}
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
                value={formData.address}
                onChange={handleChange("address")}
                error={!!errors.address}
                helperText={errors.address}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="City"
                value={formData.city}
                onChange={handleChange("city")}
                error={!!errors.city}
                helperText={errors.city}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="State/Province"
                value={formData.state}
                onChange={handleChange("state")}
                error={!!errors.state}
                helperText={errors.state}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Postal Code"
                value={formData.postalCode}
                onChange={handleChange("postalCode")}
                error={!!errors.postalCode}
                helperText={errors.postalCode}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Country"
                value={formData.country}
                onChange={handleChange("country")}
                error={!!errors.country}
                helperText={errors.country}
              />
            </Grid>

            {/* Classification */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Classification
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
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

            <Grid item xs={12} sm={6}>
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

            <Grid item xs={12} sm={6}>
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

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Source</InputLabel>
                <Select
                  value={formData.source}
                  onChange={handleChange("source")}
                  label="Source"
                >
                  {contactService.getSources().map((source) => (
                    <MenuItem key={source.value} value={source.value}>
                      {source.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Preferences */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Preferences
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Preferred Contact Method</InputLabel>
                <Select
                  value={formData.preferredContactMethod}
                  onChange={handleChange("preferredContactMethod")}
                  label="Preferred Contact Method"
                >
                  {contactService.getContactMethods().map((method) => (
                    <MenuItem key={method.value} value={method.value}>
                      {method.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Timezone"
                value={formData.timezone}
                onChange={handleChange("timezone")}
                error={!!errors.timezone}
                helperText={errors.timezone}
              />
            </Grid>

            {/* Tags */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Tags & Categories
              </Typography>
            </Grid>

            <Grid item xs={12}>
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
                  <TextField
                    {...params}
                    label="Tags"
                    placeholder="Add tags..."
                    helperText="Press Enter to add a tag"
                  />
                )}
              />
            </Grid>

            {/* Notes */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Additional Information
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Notes"
                value={formData.notes}
                onChange={handleChange("notes")}
                error={!!errors.notes}
                helperText={errors.notes}
                placeholder="Add any additional notes about this contact..."
              />
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading || !isFormValid}
        >
          {loading ? "Saving..." : contact ? "Update" : "Create"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ContactForm;

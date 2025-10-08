import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Paper,
  LinearProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Container,
} from "@mui/material";
import {
  CloudUpload as UploadIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  Download as DownloadIcon,
} from "@mui/icons-material";
import contactService from "../services/contactService";

// Modal version for use in Contacts component
const ContactImportModal = ({ open, onClose, onImport }) => {
  const [file, setFile] = useState(null);
  const [importing, setImporting] = useState(false);
  const [importResults, setImportResults] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  const handleFileSelect = (selectedFile) => {
    if (
      selectedFile &&
      (selectedFile.type === "text/csv" ||
        selectedFile.type === "application/csv" ||
        selectedFile.name.toLowerCase().endsWith(".csv"))
    ) {
      setFile(selectedFile);
      setImportResults(null);
    } else {
      alert("Please select a CSV file");
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleImport = async () => {
    if (!file) return;

    setImporting(true);
    try {
      const result = await contactService.importContacts(file);
      setImportResults(result);
      if (result.success) {
        onImport();
      }
    } catch (error) {
      console.error("Import failed:", error);
      setImportResults({
        success: false,
        message: "Import failed. Please check your file format and try again.",
        errors: [error.message || "Unknown error occurred"],
      });
    } finally {
      setImporting(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setImportResults(null);
    setImporting(false);
    onClose();
  };

  const downloadSampleCSV = () => {
    const sampleData = [
      {
        firstName: "John",
        lastName: "Doe",
        primaryPhone: "+1234567890",
        email: "john.doe@example.com",
        company: "Acme Corporation",
        type: "customer",
        secondaryPhone: "+1234567891",
        whatsappNumber: "+1234567890",
        jobTitle: "Software Engineer",
        notes: "Regular customer with high engagement",
      },
      {
        firstName: "Jane",
        lastName: "Smith",
        primaryPhone: "+1987654321",
        email: "jane.smith@techcorp.com",
        company: "TechCorp Inc",
        type: "prospect",
        secondaryPhone: "+1987654322",
        whatsappNumber: "+1987654321",
        jobTitle: "Marketing Manager",
        notes: "Interested in our premium services",
      },
      {
        firstName: "Mike",
        lastName: "Johnson",
        primaryPhone: "+1555123456",
        email: "mike.j@startup.io",
        company: "StartupXYZ",
        type: "lead",
        secondaryPhone: "+1555123457",
        whatsappNumber: "+1555123456",
        jobTitle: "CEO",
        notes: "Potential enterprise client",
      },
      {
        firstName: "Sarah",
        lastName: "Williams",
        primaryPhone: "+1444555666",
        email: "sarah.w@bigcorp.com",
        company: "BigCorp Ltd",
        type: "supplier",
        secondaryPhone: "+1444555667",
        whatsappNumber: "+1444555666",
        jobTitle: "VP Sales",
        notes: "Long-term supplier relationship",
      },
      {
        firstName: "Alex",
        lastName: "Brown",
        primaryPhone: "+1777888999",
        email: "alex.brown@consulting.com",
        company: "Consulting Pro",
        type: "partner",
        secondaryPhone: "+1777888900",
        whatsappNumber: "+1777888999",
        jobTitle: "Senior Consultant",
        notes: "Strategic partner - refer clients regularly",
      },
    ];

    // Convert to CSV
    const headers = Object.keys(sampleData[0]);
    const csvContent = [
      headers.join(","),
      ...sampleData.map((row) =>
        headers
          .map((header) => {
            const value = row[header] || "";
            // Escape commas and quotes in values
            return `"${value.toString().replace(/"/g, '""')}"`;
          })
          .join(",")
      ),
    ].join("\n");

    // Create and download file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "sample-contacts.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>Import Contacts</DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 2 }}>
          {!importResults ? (
            <>
              {/* File Upload Area */}
              <Paper
                variant="outlined"
                sx={{
                  p: 4,
                  textAlign: "center",
                  border: dragActive ? "2px dashed #1976d2" : "2px dashed #ccc",
                  backgroundColor: dragActive ? "#f5f5f5" : "transparent",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                }}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => document.getElementById("file-input").click()}
              >
                <input
                  id="file-input"
                  type="file"
                  accept=".csv"
                  onChange={handleFileInput}
                  style={{ display: "none" }}
                />
                <UploadIcon
                  sx={{ fontSize: 48, color: "text.secondary", mb: 2 }}
                />
                <Typography variant="h6" gutterBottom>
                  {file
                    ? file.name
                    : "Drop your CSV file here or click to browse"}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Supported format: CSV (.csv)
                </Typography>
              </Paper>

              {/* CSV Format Instructions */}
              <Box sx={{ mt: 3 }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 2,
                  }}
                >
                  <Typography variant="h6" gutterBottom>
                    CSV Format Requirements
                  </Typography>
                  <Button
                    variant="outlined"
                    startIcon={<DownloadIcon />}
                    onClick={downloadSampleCSV}
                    size="small"
                  >
                    Download Sample CSV
                  </Button>
                </Box>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Your CSV file should include the following columns (first row
                  should contain headers):
                </Typography>
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Column Name</TableCell>
                        <TableCell>Required</TableCell>
                        <TableCell>Description</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <TableRow>
                        <TableCell>firstName</TableCell>
                        <TableCell>
                          <Chip label="Yes" color="error" size="small" />
                        </TableCell>
                        <TableCell>Contact's first name</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>lastName</TableCell>
                        <TableCell>
                          <Chip label="No" color="default" size="small" />
                        </TableCell>
                        <TableCell>Contact's last name</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>primaryPhone</TableCell>
                        <TableCell>
                          <Chip label="Yes" color="error" size="small" />
                        </TableCell>
                        <TableCell>Primary phone number</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>email</TableCell>
                        <TableCell>
                          <Chip label="No" color="default" size="small" />
                        </TableCell>
                        <TableCell>Email address</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>company</TableCell>
                        <TableCell>
                          <Chip label="No" color="default" size="small" />
                        </TableCell>
                        <TableCell>Company name</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>type</TableCell>
                        <TableCell>
                          <Chip label="No" color="default" size="small" />
                        </TableCell>
                        <TableCell>
                          customer, lead, prospect, supplier, partner, internal,
                          other
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>secondaryPhone</TableCell>
                        <TableCell>
                          <Chip label="No" color="default" size="small" />
                        </TableCell>
                        <TableCell>Secondary phone number</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>whatsappNumber</TableCell>
                        <TableCell>
                          <Chip label="No" color="default" size="small" />
                        </TableCell>
                        <TableCell>WhatsApp phone number</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>jobTitle</TableCell>
                        <TableCell>
                          <Chip label="No" color="default" size="small" />
                        </TableCell>
                        <TableCell>Job title or position</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>notes</TableCell>
                        <TableCell>
                          <Chip label="No" color="default" size="small" />
                        </TableCell>
                        <TableCell>Additional notes or comments</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            </>
          ) : (
            /* Import Results */
            <Box>
              <Alert
                severity={importResults.success ? "success" : "error"}
                sx={{ mb: 2 }}
              >
                {importResults.message}
              </Alert>

              {importResults.summary && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Import Summary
                  </Typography>
                  <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                    <Chip
                      label={`${importResults.summary.total || 0} Total`}
                      color="default"
                    />
                    <Chip
                      label={`${importResults.summary.success || 0} Success`}
                      color="success"
                    />
                    <Chip
                      label={`${importResults.summary.errors || 0} Errors`}
                      color="error"
                    />
                  </Box>
                </Box>
              )}

              {importResults.errors && importResults.errors.length > 0 && (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Errors
                  </Typography>
                  <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Row</TableCell>
                          <TableCell>Error</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {importResults.errors.map((error, index) => (
                          <TableRow key={index}>
                            <TableCell>{error.row || index + 1}</TableCell>
                            <TableCell>
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 1,
                                }}
                              >
                                <ErrorIcon color="error" fontSize="small" />
                                {error.message}
                              </Box>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              )}
            </Box>
          )}

          {importing && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" gutterBottom>
                Importing contacts...
              </Typography>
              <LinearProgress />
            </Box>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>
          {importResults ? "Close" : "Cancel"}
        </Button>
        {!importResults && (
          <Button
            onClick={handleImport}
            variant="contained"
            disabled={!file || importing}
          >
            {importing ? "Importing..." : "Import Contacts"}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

// Page component for use in routing
const ContactImport = () => {
  const [importResults, setImportResults] = useState(null);
  const [file, setFile] = useState(null);
  const [importing, setImporting] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const handleFileSelect = (selectedFile) => {
    if (
      selectedFile &&
      (selectedFile.type === "text/csv" ||
        selectedFile.type === "application/csv" ||
        selectedFile.name.toLowerCase().endsWith(".csv"))
    ) {
      setFile(selectedFile);
      setImportResults(null);
    } else {
      alert("Please select a CSV file");
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleImport = async () => {
    if (!file) return;

    setImporting(true);
    try {
      const response = await contactService.importContacts(file);
      setImportResults(response);
    } catch (error) {
      console.error("❌ Import failed:", error);
      setImportResults({
        success: false,
        message: error.response?.data?.message || "Import failed",
        errors: [],
      });
    } finally {
      setImporting(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setImportResults(null);
    setImporting(false);
  };

  const downloadSampleCSV = () => {
    const sampleData = [
      {
        firstName: "John",
        lastName: "Doe",
        primaryPhone: "+1234567890",
        email: "john.doe@example.com",
        company: "Acme Corporation",
        type: "customer",
        secondaryPhone: "+1234567891",
        whatsappNumber: "+1234567890",
        jobTitle: "Software Engineer",
        notes: "Regular customer with high engagement",
      },
      {
        firstName: "Jane",
        lastName: "Smith",
        primaryPhone: "+1987654321",
        email: "jane.smith@techcorp.com",
        company: "TechCorp Inc",
        type: "prospect",
        secondaryPhone: "+1987654322",
        whatsappNumber: "+1987654321",
        jobTitle: "Marketing Manager",
        notes: "Interested in our premium services",
      },
      {
        firstName: "Mike",
        lastName: "Johnson",
        primaryPhone: "+1555123456",
        email: "mike.j@startup.io",
        company: "StartupXYZ",
        type: "lead",
        secondaryPhone: "+1555123457",
        whatsappNumber: "+1555123456",
        jobTitle: "CEO",
        notes: "Potential enterprise client",
      },
      {
        firstName: "Sarah",
        lastName: "Williams",
        primaryPhone: "+1444555666",
        email: "sarah.w@bigcorp.com",
        company: "BigCorp Ltd",
        type: "supplier",
        secondaryPhone: "+1444555667",
        whatsappNumber: "+1444555666",
        jobTitle: "VP Sales",
        notes: "Long-term supplier relationship",
      },
      {
        firstName: "Alex",
        lastName: "Brown",
        primaryPhone: "+1777888999",
        email: "alex.brown@consulting.com",
        company: "Consulting Pro",
        type: "partner",
        secondaryPhone: "+1777888900",
        whatsappNumber: "+1777888999",
        jobTitle: "Senior Consultant",
        notes: "Strategic partner - refer clients regularly",
      },
    ];

    // Convert to CSV
    const headers = Object.keys(sampleData[0]);
    const csvContent = [
      headers.join(","),
      ...sampleData.map((row) =>
        headers
          .map((header) => {
            const value = row[header] || "";
            // Escape commas and quotes in values
            return `"${value.toString().replace(/"/g, '""')}"`;
          })
          .join(",")
      ),
    ].join("\n");

    // Create and download file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "sample-contacts.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Import Contacts
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Upload a CSV file to import multiple contacts at once.
        </Typography>
      </Box>

      <Paper sx={{ p: 3 }}>
        {/* File Upload Area */}
        <Box
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          sx={{
            border: "2px dashed",
            borderColor: dragActive ? "primary.main" : "grey.300",
            borderRadius: 2,
            p: 4,
            textAlign: "center",
            cursor: "pointer",
            transition: "border-color 0.2s",
            "&:hover": {
              borderColor: "primary.main",
            },
          }}
          onClick={() => document.getElementById("file-input").click()}
        >
          <input
            id="file-input"
            type="file"
            accept=".csv"
            onChange={(e) => handleFileSelect(e.target.files[0])}
            style={{ display: "none" }}
          />
          <UploadIcon sx={{ fontSize: 48, color: "text.secondary", mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            {file ? file.name : "Drop your CSV file here or click to browse"}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Only CSV files are supported
          </Typography>
        </Box>

        {/* Import Progress */}
        {importing && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="body2" gutterBottom>
              Importing contacts...
            </Typography>
            <LinearProgress />
          </Box>
        )}

        {/* Import Results */}
        {importResults && (
          <Box sx={{ mt: 3 }}>
            <Alert
              severity={importResults.success ? "success" : "error"}
              sx={{ mb: 2 }}
            >
              {importResults.message}
            </Alert>

            {importResults.success && importResults.summary && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Import Summary
                </Typography>
                <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                  <Chip
                    icon={<CheckIcon />}
                    label={`${importResults.summary.successful} successful`}
                    color="success"
                  />
                  {importResults.summary.failed > 0 && (
                    <Chip
                      icon={<ErrorIcon />}
                      label={`${importResults.summary.failed} failed`}
                      color="error"
                    />
                  )}
                </Box>
              </Box>
            )}

            {importResults.errors && importResults.errors.length > 0 && (
              <Box>
                <Typography variant="h6" gutterBottom>
                  Import Errors
                </Typography>
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Row</TableCell>
                        <TableCell>Error</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {importResults.errors.map((error, index) => (
                        <TableRow key={index}>
                          <TableCell>{error.row || index + 1}</TableCell>
                          <TableCell>
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                              }}
                            >
                              <ErrorIcon color="error" fontSize="small" />
                              {error.message}
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            )}
          </Box>
        )}

        {/* Action Buttons */}
        <Box
          sx={{ display: "flex", gap: 2, mt: 3, justifyContent: "flex-end" }}
        >
          <Button onClick={handleReset} disabled={importing}>
            Reset
          </Button>
          <Button
            onClick={handleImport}
            variant="contained"
            disabled={!file || importing}
          >
            {importing ? "Importing..." : "Import Contacts"}
          </Button>
        </Box>
      </Paper>

      {/* CSV Format Help */}
      <Paper sx={{ p: 3, mt: 3 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Typography variant="h6" gutterBottom>
            CSV Format Requirements
          </Typography>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={downloadSampleCSV}
            size="small"
          >
            Download Sample CSV
          </Button>
        </Box>
        <Typography variant="body2" color="text.secondary" paragraph>
          Your CSV file should include the following columns (first row should
          contain headers):
        </Typography>
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Column</TableCell>
                <TableCell>Required</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Example</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell>firstName</TableCell>
                <TableCell>
                  <Chip label="Yes" color="error" size="small" />
                </TableCell>
                <TableCell>Contact's first name</TableCell>
                <TableCell>John</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>lastName</TableCell>
                <TableCell>
                  <Chip label="No" color="default" size="small" />
                </TableCell>
                <TableCell>Contact's last name</TableCell>
                <TableCell>Doe</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>primaryPhone</TableCell>
                <TableCell>
                  <Chip label="Yes" color="error" size="small" />
                </TableCell>
                <TableCell>Primary phone number</TableCell>
                <TableCell>+1234567890</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>email</TableCell>
                <TableCell>
                  <Chip label="No" color="default" size="small" />
                </TableCell>
                <TableCell>Email address</TableCell>
                <TableCell>john@example.com</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>company</TableCell>
                <TableCell>
                  <Chip label="No" color="default" size="small" />
                </TableCell>
                <TableCell>Company name</TableCell>
                <TableCell>Acme Corp</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>type</TableCell>
                <TableCell>
                  <Chip label="No" color="default" size="small" />
                </TableCell>
                <TableCell>
                  customer, lead, prospect, supplier, partner, internal, other
                </TableCell>
                <TableCell>customer</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>secondaryPhone</TableCell>
                <TableCell>
                  <Chip label="No" color="default" size="small" />
                </TableCell>
                <TableCell>Secondary phone number</TableCell>
                <TableCell>+1234567891</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>whatsappNumber</TableCell>
                <TableCell>
                  <Chip label="No" color="default" size="small" />
                </TableCell>
                <TableCell>WhatsApp phone number</TableCell>
                <TableCell>+1234567890</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>jobTitle</TableCell>
                <TableCell>
                  <Chip label="No" color="default" size="small" />
                </TableCell>
                <TableCell>Job title or position</TableCell>
                <TableCell>Software Engineer</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>notes</TableCell>
                <TableCell>
                  <Chip label="No" color="default" size="small" />
                </TableCell>
                <TableCell>Additional notes or comments</TableCell>
                <TableCell>Regular customer with high engagement</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Container>
  );
};

export default ContactImport;
export { ContactImportModal };

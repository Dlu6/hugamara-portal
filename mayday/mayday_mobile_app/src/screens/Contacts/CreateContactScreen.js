import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { createContact, clearErrors } from "../../store/slices/contactsSlice";

export default function CreateContactScreen({ navigation }) {
  const dispatch = useDispatch();
  const { creating, createError } = useSelector((state) => state.contacts);
  const { token } = useSelector((state) => state.auth);

  // Form state
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
    contactType: "individual",
    status: "active",
    priority: "normal",
    notes: "",
  });

  // Handle input change
  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Handle form submission
  const handleSubmit = async () => {
    // Basic validation
    if (!formData.firstName.trim()) {
      Alert.alert("Error", "First name is required");
      return;
    }

    if (!formData.primaryPhone.trim()) {
      Alert.alert("Error", "Primary phone is required");
      return;
    }

    try {
      const result = await dispatch(createContact(formData));

      if (createContact.fulfilled.match(result)) {
        Alert.alert("Success", "Contact created successfully", [
          {
            text: "OK",
            onPress: () => navigation.goBack(),
          },
        ]);
      } else {
        Alert.alert("Error", createError || "Failed to create contact");
      }
    } catch (error) {
      console.error("Error creating contact:", error);
      Alert.alert("Error", "An unexpected error occurred");
    }
  };

  // Clear errors on unmount
  React.useEffect(() => {
    return () => {
      dispatch(clearErrors());
    };
  }, [dispatch]);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.title}>Create New Contact</Text>
        <Text style={styles.subtitle}>
          Fill in the contact information below
        </Text>
      </View>

      {/* Error Display */}
      {createError && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{createError}</Text>
        </View>
      )}

      <View style={styles.form}>
        {/* Basic Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Basic Information</Text>

          <View style={styles.row}>
            <View style={[styles.inputContainer, { flex: 1, marginRight: 8 }]}>
              <Text style={styles.label}>First Name *</Text>
              <TextInput
                style={styles.input}
                value={formData.firstName}
                onChangeText={(value) => handleInputChange("firstName", value)}
                placeholder="Enter first name"
                placeholderTextColor="#6B7280"
              />
            </View>

            <View style={[styles.inputContainer, { flex: 1, marginLeft: 8 }]}>
              <Text style={styles.label}>Last Name</Text>
              <TextInput
                style={styles.input}
                value={formData.lastName}
                onChangeText={(value) => handleInputChange("lastName", value)}
                placeholder="Enter last name"
                placeholderTextColor="#6B7280"
              />
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Company</Text>
            <TextInput
              style={styles.input}
              value={formData.company}
              onChangeText={(value) => handleInputChange("company", value)}
              placeholder="Enter company name"
              placeholderTextColor="#6B7280"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Job Title</Text>
            <TextInput
              style={styles.input}
              value={formData.jobTitle}
              onChangeText={(value) => handleInputChange("jobTitle", value)}
              placeholder="Enter job title"
              placeholderTextColor="#6B7280"
            />
          </View>
        </View>

        {/* Contact Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Information</Text>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Primary Phone *</Text>
            <TextInput
              style={styles.input}
              value={formData.primaryPhone}
              onChangeText={(value) => handleInputChange("primaryPhone", value)}
              placeholder="Enter primary phone number"
              placeholderTextColor="#6B7280"
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Secondary Phone</Text>
            <TextInput
              style={styles.input}
              value={formData.secondaryPhone}
              onChangeText={(value) =>
                handleInputChange("secondaryPhone", value)
              }
              placeholder="Enter secondary phone number"
              placeholderTextColor="#6B7280"
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              value={formData.email}
              onChangeText={(value) => handleInputChange("email", value)}
              placeholder="Enter email address"
              placeholderTextColor="#6B7280"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Website</Text>
            <TextInput
              style={styles.input}
              value={formData.website}
              onChangeText={(value) => handleInputChange("website", value)}
              placeholder="Enter website URL"
              placeholderTextColor="#6B7280"
              keyboardType="url"
              autoCapitalize="none"
            />
          </View>
        </View>

        {/* Address */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Address</Text>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Address</Text>
            <TextInput
              style={styles.input}
              value={formData.address}
              onChangeText={(value) => handleInputChange("address", value)}
              placeholder="Enter street address"
              placeholderTextColor="#6B7280"
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.inputContainer, { flex: 1, marginRight: 8 }]}>
              <Text style={styles.label}>City</Text>
              <TextInput
                style={styles.input}
                value={formData.city}
                onChangeText={(value) => handleInputChange("city", value)}
                placeholder="Enter city"
                placeholderTextColor="#6B7280"
              />
            </View>

            <View style={[styles.inputContainer, { flex: 1, marginLeft: 8 }]}>
              <Text style={styles.label}>State</Text>
              <TextInput
                style={styles.input}
                value={formData.state}
                onChangeText={(value) => handleInputChange("state", value)}
                placeholder="Enter state"
                placeholderTextColor="#6B7280"
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={[styles.inputContainer, { flex: 1, marginRight: 8 }]}>
              <Text style={styles.label}>Country</Text>
              <TextInput
                style={styles.input}
                value={formData.country}
                onChangeText={(value) => handleInputChange("country", value)}
                placeholder="Enter country"
                placeholderTextColor="#6B7280"
              />
            </View>

            <View style={[styles.inputContainer, { flex: 1, marginLeft: 8 }]}>
              <Text style={styles.label}>Postal Code</Text>
              <TextInput
                style={styles.input}
                value={formData.postalCode}
                onChangeText={(value) => handleInputChange("postalCode", value)}
                placeholder="Enter postal code"
                placeholderTextColor="#6B7280"
              />
            </View>
          </View>
        </View>

        {/* Additional Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Additional Information</Text>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Notes</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.notes}
              onChangeText={(value) => handleInputChange("notes", value)}
              placeholder="Enter any additional notes"
              placeholderTextColor="#6B7280"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => navigation.goBack()}
            disabled={creating}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.submitButton,
              creating && styles.submitButtonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={creating}
          >
            {creating ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.submitButtonText}>Create Contact</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0A0A0A",
  },
  header: {
    backgroundColor: "#111827",
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: "#1F2937",
  },
  title: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 4,
  },
  subtitle: {
    color: "#9CA3AF",
    fontSize: 16,
  },
  form: {
    padding: 16,
  },
  section: {
    backgroundColor: "#111827",
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#1F2937",
  },
  sectionTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
  },
  row: {
    flexDirection: "row",
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 6,
  },
  input: {
    backgroundColor: "#1F2937",
    color: "#FFFFFF",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#374151",
    fontSize: 16,
  },
  textArea: {
    height: 100,
  },
  errorContainer: {
    backgroundColor: "#1F2937",
    padding: 12,
    margin: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#EF4444",
  },
  errorText: {
    color: "#EF4444",
    fontSize: 14,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: "#374151",
    paddingVertical: 16,
    borderRadius: 8,
    marginRight: 8,
    alignItems: "center",
  },
  cancelButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  submitButton: {
    flex: 1,
    backgroundColor: "#3B82F6",
    paddingVertical: 16,
    borderRadius: 8,
    marginLeft: 8,
    alignItems: "center",
  },
  submitButtonDisabled: {
    backgroundColor: "#6B7280",
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});

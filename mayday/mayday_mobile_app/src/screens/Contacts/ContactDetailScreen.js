import React, { useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Linking,
} from "react-native";
import { useSelector, useDispatch } from "react-redux";
import {
  fetchContactById,
  clearCurrentContact,
  clearErrors,
} from "../../store/slices/contactsSlice";

export default function ContactDetailScreen({ route, navigation }) {
  const dispatch = useDispatch();
  const { contactId } = route.params;

  // Redux state
  const { currentContact, loadingContact, contactError } = useSelector(
    (state) => state.contacts
  );

  const { token } = useSelector((state) => state.auth);

  // Load contact on mount
  useEffect(() => {
    if (token && contactId) {
      dispatch(fetchContactById(contactId));
    }

    return () => {
      dispatch(clearCurrentContact());
      dispatch(clearErrors());
    };
  }, [dispatch, token, contactId]);

  // Handle phone call - navigate to dialer with pre-filled number
  const handlePhoneCall = (phoneNumber) => {
    if (phoneNumber) {
      const cleanNumber = phoneNumber.replace(/[^\d+]/g, "");
      // Navigate to dialer screen with pre-filled number
      navigation.navigate("Main", {
        screen: "Dialer",
        params: { prefillNumber: cleanNumber },
      });
    }
  };

  // Handle email
  const handleEmail = (email) => {
    if (email) {
      const emailUrl = `mailto:${email}`;

      Linking.canOpenURL(emailUrl)
        .then((supported) => {
          if (supported) {
            return Linking.openURL(emailUrl);
          } else {
            Alert.alert("Error", "Email is not supported on this device");
          }
        })
        .catch((error) => {
          console.error("Error opening email app:", error);
          Alert.alert("Error", "Could not open email app");
        });
    }
  };

  // Handle website
  const handleWebsite = (website) => {
    if (website) {
      let url = website;
      if (!url.startsWith("http://") && !url.startsWith("https://")) {
        url = `https://${url}`;
      }

      Linking.canOpenURL(url)
        .then((supported) => {
          if (supported) {
            return Linking.openURL(url);
          } else {
            Alert.alert("Error", "Web browser is not supported on this device");
          }
        })
        .catch((error) => {
          console.error("Error opening website:", error);
          Alert.alert("Error", "Could not open website");
        });
    }
  };

  // Render loading state
  if (loadingContact) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color="#3B82F6" size="large" />
        <Text style={styles.loadingText}>Loading contact...</Text>
      </View>
    );
  }

  // Render error state
  if (contactError) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Error: {contactError}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => dispatch(fetchContactById(contactId))}
        >
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Render no contact state
  if (!currentContact) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Contact not found</Text>
      </View>
    );
  }

  const contact = currentContact;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.name}>{contact.displayName}</Text>
        {contact.company && (
          <Text style={styles.company}>{contact.company}</Text>
        )}
        {contact.jobTitle && (
          <Text style={styles.jobTitle}>{contact.jobTitle}</Text>
        )}

        {/* Call Button */}
        {contact.primaryPhone && (
          <TouchableOpacity
            style={styles.callButton}
            onPress={() => handlePhoneCall(contact.primaryPhone)}
          >
            <Text style={styles.callButtonIcon}>📞</Text>
            <Text style={styles.callButtonText}>
              Call {contact.primaryPhone}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Contact Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Contact Information</Text>

        {contact.primaryPhone && (
          <View style={styles.contactItem}>
            <View style={styles.contactInfo}>
              <Text style={styles.contactLabel}>📞 Primary Phone</Text>
              <Text style={styles.contactValue}>{contact.primaryPhone}</Text>
            </View>
            <TouchableOpacity
              style={styles.smallCallButton}
              onPress={() => handlePhoneCall(contact.primaryPhone)}
            >
              <Text style={styles.smallCallButtonText}>Call</Text>
            </TouchableOpacity>
          </View>
        )}

        {contact.secondaryPhone && (
          <View style={styles.contactItem}>
            <View style={styles.contactInfo}>
              <Text style={styles.contactLabel}>📞 Secondary Phone</Text>
              <Text style={styles.contactValue}>{contact.secondaryPhone}</Text>
            </View>
            <TouchableOpacity
              style={styles.smallCallButton}
              onPress={() => handlePhoneCall(contact.secondaryPhone)}
            >
              <Text style={styles.smallCallButtonText}>Call</Text>
            </TouchableOpacity>
          </View>
        )}

        {contact.email && (
          <TouchableOpacity
            style={styles.contactItem}
            onPress={() => handleEmail(contact.email)}
          >
            <Text style={styles.contactLabel}>✉️ Email</Text>
            <Text style={styles.contactValue}>{contact.email}</Text>
          </TouchableOpacity>
        )}

        {contact.website && (
          <TouchableOpacity
            style={styles.contactItem}
            onPress={() => handleWebsite(contact.website)}
          >
            <Text style={styles.contactLabel}>🌐 Website</Text>
            <Text style={styles.contactValue}>{contact.website}</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Address */}
      {(contact.address ||
        contact.city ||
        contact.state ||
        contact.country) && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Address</Text>
          <View style={styles.addressContainer}>
            {contact.address && (
              <Text style={styles.addressText}>{contact.address}</Text>
            )}
            {(contact.city || contact.state || contact.country) && (
              <Text style={styles.addressText}>
                {[contact.city, contact.state, contact.country]
                  .filter(Boolean)
                  .join(", ")}
              </Text>
            )}
            {contact.postalCode && (
              <Text style={styles.addressText}>{contact.postalCode}</Text>
            )}
          </View>
        </View>
      )}

      {/* Tags */}
      {contact.tags && contact.tags.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tags</Text>
          <View style={styles.tagsContainer}>
            {contact.tags.map((tag, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Notes */}
      {contact.notes && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notes</Text>
          <Text style={styles.notesText}>{contact.notes}</Text>
        </View>
      )}

      {/* Metadata */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Details</Text>

        {contact.contactType && (
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Type</Text>
            <Text style={styles.metaValue}>{contact.contactType}</Text>
          </View>
        )}

        {contact.status && (
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Status</Text>
            <Text style={styles.metaValue}>{contact.status}</Text>
          </View>
        )}

        {contact.priority && (
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Priority</Text>
            <Text style={styles.metaValue}>{contact.priority}</Text>
          </View>
        )}

        {contact.lastInteraction && (
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Last Interaction</Text>
            <Text style={styles.metaValue}>
              {new Date(contact.lastInteraction).toLocaleDateString()}
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0A0A0A",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0A0A0A",
  },
  loadingText: {
    color: "#9CA3AF",
    fontSize: 16,
    marginTop: 12,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0A0A0A",
    padding: 24,
  },
  errorText: {
    color: "#EF4444",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: "#3B82F6",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0A0A0A",
    padding: 24,
  },
  emptyText: {
    color: "#9CA3AF",
    fontSize: 16,
  },
  header: {
    backgroundColor: "#111827",
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: "#1F2937",
  },
  name: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 4,
  },
  company: {
    color: "#9CA3AF",
    fontSize: 16,
    marginBottom: 2,
  },
  jobTitle: {
    color: "#6B7280",
    fontSize: 14,
    fontStyle: "italic",
  },
  callButton: {
    backgroundColor: "#0B9246",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginTop: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  callButtonIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  callButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  smallCallButton: {
    backgroundColor: "#0B9246",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginLeft: 12,
  },
  smallCallButtonText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
  section: {
    backgroundColor: "#111827",
    margin: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#1F2937",
  },
  sectionTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
  },
  contactItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#1F2937",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  contactInfo: {
    flex: 1,
  },
  contactLabel: {
    color: "#9CA3AF",
    fontSize: 14,
    marginBottom: 2,
  },
  contactValue: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "500",
  },
  addressContainer: {
    paddingVertical: 8,
  },
  addressText: {
    color: "#FFFFFF",
    fontSize: 16,
    marginBottom: 2,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 8,
  },
  tag: {
    backgroundColor: "#374151",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    color: "#D1D5DB",
    fontSize: 14,
    fontWeight: "500",
  },
  notesText: {
    color: "#FFFFFF",
    fontSize: 16,
    lineHeight: 24,
    paddingVertical: 8,
  },
  metaItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#1F2937",
  },
  metaLabel: {
    color: "#9CA3AF",
    fontSize: 14,
    fontWeight: "500",
  },
  metaValue: {
    color: "#FFFFFF",
    fontSize: 14,
  },
});

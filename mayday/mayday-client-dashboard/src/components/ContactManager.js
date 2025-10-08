import React from "react";
import { Routes, Route } from "react-router-dom";
import ContactsDashboard from "./ContactsDashboard";
import ContactImport from "./ContactImport";

const ContactManager = () => {
  return (
    <Routes>
      <Route path="/contacts" element={<ContactsDashboard />} />
      <Route path="/import" element={<ContactImport />} />
    </Routes>
  );
};

export default ContactManager;

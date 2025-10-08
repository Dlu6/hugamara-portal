export const setupWhatsAppAssociations = (
  UserModel,
  { Contact, WhatsAppMessage }
) => {
  // Message associations
  Contact.hasMany(WhatsAppMessage, {
    foreignKey: "contactId",
    as: "messages",
  });

  WhatsAppMessage.belongsTo(Contact, {
    foreignKey: "contactId",
  });
};

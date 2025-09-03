import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const Payment = sequelize.define('Payment', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  orderId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'order_id',
    references: {
      model: 'orders',
      key: 'id'
    }
  },
  outletId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'outlet_id',
    references: {
      model: 'outlets',
      key: 'id'
    }
  },
  paymentNumber: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true,
    field: 'payment_number'
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  currency: {
    type: DataTypes.STRING(3),
    allowNull: false,
    defaultValue: 'UGX'
  },
  paymentMethod: {
    type: DataTypes.ENUM(
      'cash',
      'credit_card',
      'debit_card',
      'mobile_money',
      'bank_transfer',
      'gift_card',
      'voucher',
      'split'
    ),
    allowNull: false,
    field: 'payment_method'
  },
  paymentStatus: {
    type: DataTypes.ENUM(
      'pending',
      'processing',
      'completed',
      'failed',
      'cancelled',
      'refunded',
      'partially_refunded'
    ),
    allowNull: false,
    defaultValue: 'pending',
    field: 'payment_status'
  },
  transactionId: {
    type: DataTypes.STRING(100),
    allowNull: true,
    field: 'transaction_id'
  },
  referenceNumber: {
    type: DataTypes.STRING(100),
    allowNull: true,
    field: 'reference_number'
  },
  cardType: {
    type: DataTypes.STRING(50),
    allowNull: true,
    field: 'card_type'
  },
  cardLast4: {
    type: DataTypes.STRING(4),
    allowNull: true,
    field: 'card_last_4'
  },
  mobileMoneyProvider: {
    type: DataTypes.STRING(50),
    allowNull: true,
    field: 'mobile_money_provider'
  },
  mobileMoneyNumber: {
    type: DataTypes.STRING(20),
    allowNull: true,
    field: 'mobile_money_number'
  },
  bankName: {
    type: DataTypes.STRING(100),
    allowNull: true,
    field: 'bank_name'
  },
  accountNumber: {
    type: DataTypes.STRING(50),
    allowNull: true,
    field: 'account_number'
  },
  tipAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    field: 'tip_amount'
  },
  serviceCharge: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    field: 'service_charge'
  },
  taxAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    field: 'tax_amount'
  },
  discountAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    field: 'discount_amount'
  },
  discountReason: {
    type: DataTypes.STRING(200),
    allowNull: true,
    field: 'discount_reason'
  },
  // discountApprovedBy removed to simplify associations
  receiptNumber: {
    type: DataTypes.STRING(50),
    allowNull: true,
    field: 'receipt_number'
  },
  receiptUrl: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'receipt_url'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  processedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'processed_at'
  },
  refundedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'refunded_at'
  },
  refundReason: {
    type: DataTypes.STRING(200),
    allowNull: true,
    field: 'refund_reason'
  },
  // refundApprovedBy removed to simplify associations
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
    field: 'created_at'
  },
  updatedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    field: 'updated_at'
  },
  // Audit fields removed to avoid MySQL key limit issues
}, {
  tableName: 'payments',
  timestamps: true,
  underscored: true
});

// Instance methods
Payment.prototype.getNetAmount = function() {
  let netAmount = this.amount;
  if (this.tipAmount) netAmount += this.tipAmount;
  if (this.serviceCharge) netAmount += this.serviceCharge;
  if (this.taxAmount) netAmount += this.taxAmount;
  if (this.discountAmount) netAmount -= this.discountAmount;
  return netAmount;
};

Payment.prototype.isRefundable = function() {
  return this.paymentStatus === 'completed' && !this.refundedAt;
};

Payment.prototype.getPaymentMethodDisplay = function() {
  const methodMap = {
    'credit_card': 'Credit Card',
    'debit_card': 'Debit Card',
    'mobile_money': 'Mobile Money',
    'bank_transfer': 'Bank Transfer',
    'gift_card': 'Gift Card'
  };
  return methodMap[this.paymentMethod] || this.paymentMethod;
};

export default Payment;
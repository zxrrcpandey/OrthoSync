// ==========================================
// OrthoSync - Type Definitions
// ==========================================

// --- Auth & Doctor ---
export interface Doctor {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  specialization: string;
  degree: string;
  registrationNumber: string;
  profilePhoto?: string;
  isVerified: boolean;
  isAdmin: boolean;
  createdAt: string;
  updatedAt: string;
  settings: DoctorSettings;
  subscription: Subscription;
  language: 'en' | 'hi';
}

export interface DoctorSettings {
  treatments: Treatment[];
  defaultCommissionModel: CommissionModel;
  defaultCurrency: string;
  gstEnabled: boolean;
  gstNumber?: string;
  gstPercentage?: number;
  notificationPreferences: {
    reminderDayBefore: boolean;
    reminderHourBefore: boolean;
    missedAppointmentFollowUp: boolean;
  };
}

export interface Subscription {
  plan: 'free' | 'basic' | 'pro';
  photosUsed: number;
  photosLimit: number;
  expiresAt?: string;
}

// --- Location ---
export interface Location {
  id: string;
  doctorId: string;
  name: string;
  type: 'own_clinic' | 'hospital' | 'others_clinic';
  address: string;
  city: string;
  state: string;
  pincode: string;
  phone?: string;
  ownerName?: string;
  ownerPhone?: string;
  workingDays: WorkingDay[];
  commissionModel: CommissionModel;
  isActive: boolean;
  createdAt: string;
}

export interface WorkingDay {
  day: 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';
  startTime: string; // HH:mm
  endTime: string;   // HH:mm
  isActive: boolean;
}

export interface CommissionModel {
  type: 'percentage' | 'fixed_per_patient' | 'fixed_per_visit' | 'rent' | 'none';
  value: number; // percentage or fixed amount
  calculatedOn?: 'total_fee' | 'fee_minus_material';
  settlementFrequency: 'weekly' | 'monthly' | 'custom';
}

// --- Patient ---
export interface Patient {
  id: string;
  patientId: string; // Auto-generated: PAT-0001
  doctorId: string;
  fullName: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  phone: string;
  email?: string;
  address?: string;
  city?: string;
  medicalHistory?: string;
  allergies?: string;
  bloodGroup?: string;
  emergencyContact?: string;
  locationIds: string[]; // Can visit multiple locations
  photos: PatientPhoto[];
  createdAt: string;
  updatedAt: string;
}

export interface PatientPhoto {
  id: string;
  uri: string;
  category: 'extraoral_front' | 'extraoral_side' | 'intraoral' | 'xray' | 'opg' | 'cephalogram' | 'other';
  visitId?: string;
  caption?: string;
  takenAt: string;
}

// --- Treatment ---
export interface Treatment {
  id: string;
  name: string;
  nameHi?: string;
  category: string;
  defaultFee: number;
  equipmentCost: number;
  estimatedDuration?: number; // in days
  stages?: TreatmentStage[];
  isActive: boolean;
}

export interface TreatmentStage {
  id: string;
  name: string;
  nameHi?: string;
  order: number;
  estimatedDays?: number;
}

export interface PatientTreatment {
  id: string;
  patientId: string;
  doctorId: string;
  locationId: string;
  treatmentId: string;
  treatmentName: string;
  status: 'planned' | 'in_progress' | 'on_hold' | 'completed' | 'cancelled';
  currentStage?: string;
  startDate: string;
  expectedEndDate?: string;
  actualEndDate?: string;
  fee: number;
  equipmentCost: number;
  notes?: string;
  photos: PatientPhoto[];
  visits: TreatmentVisit[];
  createdAt: string;
}

export interface TreatmentVisit {
  id: string;
  date: string;
  notes: string;
  procedureDone: string;
  photos: PatientPhoto[];
  stage?: string;
}

// --- Billing ---
export interface Bill {
  id: string;
  patientId: string;
  doctorId: string;
  locationId: string;
  treatmentId?: string;
  items: BillItem[];
  totalAmount: number;
  gstAmount: number;
  grandTotal: number;
  paidAmount: number;
  balanceAmount: number;
  paymentMode: 'cash' | 'upi' | 'card' | 'bank_transfer';
  installments: Installment[];
  status: 'pending' | 'partial' | 'paid' | 'overdue';
  createdAt: string;
}

export interface BillItem {
  description: string;
  amount: number;
  equipmentCost?: number;
}

export interface Installment {
  id: string;
  amount: number;
  dueDate: string;
  paidDate?: string;
  isPaid: boolean;
  paymentMode?: 'cash' | 'upi' | 'card' | 'bank_transfer';
}

// --- Commission ---
export interface CommissionRecord {
  id: string;
  doctorId: string;
  locationId: string;
  locationName: string;
  ownerName: string;
  month: string; // YYYY-MM
  totalRevenue: number;
  commissionAmount: number;
  materialCost: number;
  doctorNetEarning: number;
  paidToOwner: number;
  pendingAmount: number;
  status: 'pending' | 'partial' | 'settled';
  settlements: Settlement[];
}

export interface Settlement {
  id: string;
  amount: number;
  date: string;
  mode: 'cash' | 'upi' | 'bank_transfer';
  notes?: string;
}

// --- Appointment ---
export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  locationId: string;
  locationName: string;
  treatmentId?: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: number; // minutes
  status: 'scheduled' | 'completed' | 'missed' | 'cancelled' | 'hold';
  isRecurring: boolean;
  recurringPattern?: {
    frequency: 'weekly' | 'biweekly' | 'monthly';
    endDate?: string;
  };
  notes?: string;
  reminderSent: boolean;
  createdAt: string;
}

// --- Notification ---
export interface AppNotification {
  id: string;
  doctorId: string;
  type: 'appointment_reminder' | 'missed_appointment' | 'payment_due' | 'custom' | 'system';
  title: string;
  message: string;
  patientId?: string;
  isRead: boolean;
  sentVia: ('push' | 'whatsapp')[];
  createdAt: string;
}

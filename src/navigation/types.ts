// ==========================================
// OrthoSync - Navigation Type Definitions
// ==========================================

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  OtpVerification: { phone: string };
  ForgotPassword: undefined;
};

export type DoctorSetupStackParamList = {
  DoctorSetup: undefined;
};

export type MainTabParamList = {
  Dashboard: undefined;
  Patients: undefined;
  Calendar: undefined;
  Billing: undefined;
  More: undefined;
};

export type PatientsStackParamList = {
  PatientsList: undefined;
  AddPatient: undefined;
  PatientDetail: { patientId: string };
  TreatmentDetail: { treatmentId: string; patientId: string };
  AddTreatmentVisit: { treatmentId: string; patientId: string };
};

export type CalendarStackParamList = {
  CalendarView: undefined;
  AddAppointment: { date?: string; locationId?: string };
  AppointmentDetail: { appointmentId: string };
};

export type BillingStackParamList = {
  BillingOverview: undefined;
  FeesMaster: undefined;
  CreateBill: { patientId?: string; treatmentId?: string };
  BillDetail: { billId: string };
  CommissionDashboard: undefined;
  CommissionDetail: { locationId: string; month: string };
  AddSettlement: { locationId: string; month: string };
};

export type MoreStackParamList = {
  MoreMenu: undefined;
  DoctorProfile: undefined;
  Locations: undefined;
  AddLocation: { locationId?: string };
  LocationDetail: { locationId: string };
  Treatments: undefined;
  Notifications: undefined;
  Reports: undefined;
  Settings: undefined;
  Subscription: undefined;
};

export type RootStackParamList = {
  Auth: undefined;
  DoctorSetup: undefined;
  Main: undefined;
};

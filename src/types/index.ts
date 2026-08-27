export interface Patient {
  id?: string | number;
  patientId: string;
  name: string;
  age: number;
  gender: string;
  phone: string;
  email: string;
  address: string;
  bloodGroup: string;
  emergencyContact: string;
  medicalHistory: string;
  department?: string;
}

export interface Doctor {
  id?: string | number;
  doctorId: string;
  name: string;
  specialization: string;
  department: string;
  experience: number;
  phone: string;
  email: string;
  availability: string;
}

export interface Appointment {
  id?: string | number;
  appointmentId: string;
  patientId: string | number;
  doctorId: string | number;
  date: string;
  time: string;
  reason: string;
  status: "Scheduled" | "Completed" | "Cancelled" | "No-show";
}

export interface Department {
  id?: string | number;
  departmentId: string;
  name: string;
  description: string;
  status: "Active" | "Inactive";
}

export interface Medicine {
  medicineName: string;
  dosage: string;
  duration: string;
  instructions: string;
}

export interface Prescription {
  id?: string | number;
  prescriptionId: string;
  patientId: string | number;
  doctorId: string | number;
  date: string;
  medicines: Medicine[];
}

export interface Bill {
  id?: string | number;
  billId: string;
  patientId: string | number;
  consultationCharges: number;
  medicineCharges: number;
  labCharges: number;
  otherCharges: number;
  totalAmount: number;
  paymentStatus: "Paid" | "Pending" | "Partially Paid";
  date: string;
}

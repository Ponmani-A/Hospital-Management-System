import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainLayout from "../components/Layout/MainLayout";
import Dashboard from "../pages/Dashboard/Dashboard";
import PatientList from "../pages/Patients/PatientList";
import PatientForm from "../pages/Patients/PatientForm";
import PatientView from "../pages/Patients/PatientView";
import DoctorList from "../pages/Doctors/DoctorList";
import DoctorForm from "../pages/Doctors/DoctorForm";
import DoctorView from "../pages/Doctors/DoctorView";
import AppointmentList from "../pages/Appointments/AppointmentList";
import AppointmentForm from "../pages/Appointments/AppointmentForm";
import AppointmentView from "../pages/Appointments/AppointmentView";
import DepartmentList from "../pages/Departments/DepartmentList";
import DepartmentForm from "../pages/Departments/DepartmentForm";
import PrescriptionList from "../pages/Prescriptions/PrescriptionList";
import PrescriptionForm from "../pages/Prescriptions/PrescriptionForm";
import PrescriptionView from "../pages/Prescriptions/PrescriptionView";
import BillingList from "../pages/Billing/BillingList";
import BillingForm from "../pages/Billing/BillingForm";
import BillingView from "../pages/Billing/BillingView";

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/patients" element={<PatientList />} />
          <Route path="/patients/add" element={<PatientForm />} />
          <Route path="/patients/view/:id" element={<PatientView />} />
          <Route path="/patients/edit/:id" element={<PatientForm />} />
          <Route path="/doctors" element={<DoctorList />} />
          <Route path="/doctors/add" element={<DoctorForm />} />
          <Route path="/doctors/edit/:id" element={<DoctorForm />} />
          <Route path="/doctors/view/:id" element={<DoctorView />} />
          <Route path="/appointments" element={<AppointmentList />} />
          <Route path="/appointments/add" element={<AppointmentForm />} />
          <Route path="/appointments/edit/:id" element={<AppointmentForm />} />
          <Route path="/appointments/view/:id" element={<AppointmentView />} />
          <Route path="/departments" element={<DepartmentList />} />
          <Route path="/departments/add" element={<DepartmentForm />} />
          <Route path="/departments/edit/:id" element={<DepartmentForm />} />
          <Route path="/prescriptions" element={<PrescriptionList />} />
          <Route path="/prescriptions/add" element={<PrescriptionForm />} />
          <Route
            path="/prescriptions/edit/:id"
            element={<PrescriptionForm />}
          />
          <Route
            path="/prescriptions/view/:id"
            element={<PrescriptionView />}
          />
          <Route path="/billing" element={<BillingList />} />
          <Route path="/billing/add" element={<BillingForm />} />
          <Route path="/billing/edit/:id" element={<BillingForm />} />
          <Route path="/billing/view/:id" element={<BillingView />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;

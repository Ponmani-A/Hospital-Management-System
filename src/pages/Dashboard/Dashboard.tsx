import { useEffect, useState } from "react";
import api from "../../services/api";
import type { Patient, Doctor, Appointment } from "../../types";

interface Bed {
  id?: string | number;
  bedNumber: string;
  ward: string;
  status: "Available" | "Occupied";
}

const Dashboard = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [beds, setBeds] = useState<Bed[]>([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // =========================
        // Patients
        // =========================
        try {
          const patientsResponse = await api.get("/patients");

          console.log("Patients:", patientsResponse.data);

          setPatients(
            Array.isArray(patientsResponse.data) ? patientsResponse.data : [],
          );
        } catch (error) {
          console.error("Patients API Error:", error);

          setPatients([]);
        }

        // =========================
        // Doctors
        // =========================
        try {
          const doctorsResponse = await api.get("/doctors");

          console.log("Doctors:", doctorsResponse.data);

          setDoctors(
            Array.isArray(doctorsResponse.data) ? doctorsResponse.data : [],
          );
        } catch (error) {
          console.error("Doctors API Error:", error);

          setDoctors([]);
        }

        // =========================
        // Appointments
        // =========================
        try {
          const appointmentsResponse = await api.get("/appointments");

          console.log("Appointments:", appointmentsResponse.data);

          setAppointments(
            Array.isArray(appointmentsResponse.data)
              ? appointmentsResponse.data
              : [],
          );
        } catch (error) {
          console.error("Appointments API Error:", error);

          setAppointments([]);
        }

        // =========================
        // Beds
        // =========================
        try {
          const bedsResponse = await api.get("/beds");

          console.log("Beds:", bedsResponse.data);

          setBeds(Array.isArray(bedsResponse.data) ? bedsResponse.data : []);
        } catch (error) {
          console.error("Beds API Error:", error);

          // Beds API 404 இருந்தாலும்
          // dashboard மற்ற data வேலை செய்யும்
          setBeds([]);
        }
      } catch (error) {
        console.error("Dashboard API Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // =========================
  // Today's Date
  // =========================
  const today = new Date().toISOString().split("T")[0];

  // =========================
  // Today's Appointments
  // =========================
  const todayAppointments = appointments.filter(
    (appointment) => appointment.date === today,
  );

  // =========================
  // Pending Appointments
  // =========================
  const pendingAppointments = appointments.filter(
    (appointment) => appointment.status === "Scheduled",
  );

  // =========================
  // Available Beds
  // =========================
  const availableBeds = beds.filter((bed) => bed.status === "Available");

  // =========================
  // Recent Patients
  // =========================
  const recentPatients = [...patients].reverse().slice(0, 5);

  // =========================
  // Loading
  // =========================
  if (loading) {
    return (
      <div className="flex min-h-[500px] items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-blue-600" />

          <p className="text-sm text-slate-500">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-slate-50 p-6 lg:p-8">
      {/* =========================
          Header
      ========================= */}
      <div className="mb-7">
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>

        <p className="mt-1 text-sm text-slate-500">
          Welcome back. Here's what's happening today.
        </p>
      </div>

      {/* =========================
          Statistics
      ========================= */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-5">
        {/* Total Patients */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Total Patients
              </p>

              <h2 className="mt-2 text-2xl font-bold text-slate-900">
                {patients.length}
              </h2>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-50 text-xl">
              👥
            </div>
          </div>
        </div>

        {/* Total Doctors */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Total Doctors
              </p>

              <h2 className="mt-2 text-2xl font-bold text-slate-900">
                {doctors.length}
              </h2>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-indigo-50 text-xl">
              🩺
            </div>
          </div>
        </div>

        {/* Today's Appointments */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Today's Appointments
              </p>

              <h2 className="mt-2 text-2xl font-bold text-slate-900">
                {todayAppointments.length}
              </h2>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-purple-50 text-xl">
              📅
            </div>
          </div>
        </div>

        {/* Pending Appointments */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Pending Appointments
              </p>

              <h2 className="mt-2 text-2xl font-bold text-slate-900">
                {pendingAppointments.length}
              </h2>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-orange-50 text-xl">
              ⏳
            </div>
          </div>
        </div>

        {/* Available Beds */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Available Beds
              </p>

              <h2 className="mt-2 text-2xl font-bold text-slate-900">
                {availableBeds.length}
              </h2>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-green-50 text-xl">
              🛏️
            </div>
          </div>
        </div>
      </div>

      {/* =========================
          Recent Patients
      ========================= */}
      <div className="mt-7 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
          <div>
            <h2 className="text-base font-semibold text-slate-800">
              Recent Patient Registrations
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Latest patients registered in the hospital
            </p>
          </div>

          <a
            href="/patients"
            className="text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            View All
          </a>
        </div>

        {/* Empty State */}
        {recentPatients.length === 0 ? (
          <div className="p-10 text-center">
            <p className="text-sm text-slate-500">
              No patients registered yet.
            </p>
          </div>
        ) : (
          /* Table */
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead className="bg-slate-50">
                <tr className="border-b border-slate-200 text-left">
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Patient ID
                  </th>

                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Patient Name
                  </th>

                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Age
                  </th>

                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Gender
                  </th>

                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Phone
                  </th>
                </tr>
              </thead>

              <tbody>
                {recentPatients.map((patient) => (
                  <tr
                    key={patient.id}
                    className="border-b border-slate-100 last:border-0 hover:bg-slate-50"
                  >
                    <td className="px-6 py-4">
                      <span className="text-sm font-semibold text-blue-600">
                        {patient.patientId}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-50 text-sm font-semibold text-blue-600">
                          {patient.name.charAt(0).toUpperCase()}
                        </div>

                        <span className="text-sm font-medium text-slate-800">
                          {patient.name}
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-sm text-slate-600">
                      {patient.age}
                    </td>

                    <td className="px-6 py-4 text-sm text-slate-600">
                      {patient.gender}
                    </td>

                    <td className="px-6 py-4 text-sm text-slate-600">
                      {patient.phone}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;

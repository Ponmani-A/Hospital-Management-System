import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Plus,
  Eye,
  Pencil,
  Trash2,
  CalendarDays,
  Clock,
} from "lucide-react";

import api from "../../services/api";
import type { Appointment, Patient, Doctor } from "../../types";

const AppointmentList = () => {
  const navigate = useNavigate();

  const [appointments, setAppointments] = useState<Appointment[]>([]);

  const [patients, setPatients] = useState<Patient[]>([]);

  const [doctors, setDoctors] = useState<Doctor[]>([]);

  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] = useState("All");

  const [loading, setLoading] = useState(true);

  // =========================
  // Fetch All Data
  // =========================

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      const [appointmentResponse, patientResponse, doctorResponse] =
        await Promise.all([
          api.get<Appointment[]>("/appointments"),
          api.get<Patient[]>("/patients"),
          api.get<Doctor[]>("/doctors"),
        ]);

      setAppointments(appointmentResponse.data);

      setPatients(patientResponse.data);

      setDoctors(doctorResponse.data);
    } catch (error) {
      console.error("Failed to fetch appointment data:", error);
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // Get Patient Name
  // =========================

  const getPatientName = (patientId: string | number) => {
    const patient = patients.find(
      (item) =>
        String(item.id) === String(patientId) ||
        String(item.patientId) === String(patientId),
    );

    return patient?.name || "Unknown Patient";
  };

  // =========================
  // Get Doctor Name
  // =========================

  const getDoctorName = (doctorId: string | number) => {
    const doctor = doctors.find(
      (item) =>
        String(item.id) === String(doctorId) ||
        String(item.doctorId) === String(doctorId),
    );

    return doctor?.name || "Unknown Doctor";
  };

  // =========================
  // Delete Appointment
  // =========================

  const handleDelete = async (id?: string | number) => {
    if (!id) return;

    const confirmed = window.confirm(
      "Are you sure you want to delete this appointment?",
    );

    if (!confirmed) return;

    try {
      await api.delete(`/appointments/${id}`);

      setAppointments((prev) =>
        prev.filter((appointment) => String(appointment.id) !== String(id)),
      );
    } catch (error) {
      console.error("Failed to delete appointment:", error);

      alert("Failed to delete appointment");
    }
  };

  // =========================
  // Filter Appointments
  // =========================

  const filteredAppointments = appointments.filter((appointment) => {
    const patientName = getPatientName(appointment.patientId).toLowerCase();

    const doctorName = getDoctorName(appointment.doctorId).toLowerCase();

    const searchText = search.toLowerCase();

    const matchesSearch =
      appointment.appointmentId.toLowerCase().includes(searchText) ||
      patientName.includes(searchText) ||
      doctorName.includes(searchText) ||
      appointment.reason.toLowerCase().includes(searchText);

    const matchesStatus =
      statusFilter === "All" || appointment.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // =========================
  // Status Style
  // =========================

  const getStatusStyle = (status: Appointment["status"]) => {
    switch (status) {
      case "Scheduled":
        return "bg-blue-50 text-blue-600";

      case "Completed":
        return "bg-green-50 text-green-600";

      case "Cancelled":
        return "bg-red-50 text-red-600";

      case "No-show":
        return "bg-orange-50 text-orange-600";

      default:
        return "bg-slate-50 text-slate-600";
    }
  };

  return (
    <div className="min-h-full bg-slate-50 p-6 lg:p-8">
      {/* =========================
          Header
      ========================= */}

      <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Appointments</h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage patient appointments and schedules
          </p>
        </div>

        <button
          onClick={() => navigate("/appointments/add")}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
        >
          <Plus size={18} />
          Book Appointment
        </button>
      </div>

      {/* =========================
          Summary Cards
      ========================= */}

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total */}

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Total Appointments</p>

              <p className="mt-1 text-2xl font-bold text-slate-900">
                {appointments.length}
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <CalendarDays size={22} />
            </div>
          </div>
        </div>

        {/* Scheduled */}

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Scheduled</p>

              <p className="mt-1 text-2xl font-bold text-slate-900">
                {
                  appointments.filter((item) => item.status === "Scheduled")
                    .length
                }
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <Clock size={22} />
            </div>
          </div>
        </div>

        {/* Completed */}

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Completed</p>

              <p className="mt-1 text-2xl font-bold text-slate-900">
                {
                  appointments.filter((item) => item.status === "Completed")
                    .length
                }
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-green-50 text-green-600">
              <CalendarDays size={22} />
            </div>
          </div>
        </div>

        {/* Cancelled */}

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Cancelled</p>

              <p className="mt-1 text-2xl font-bold text-slate-900">
                {
                  appointments.filter((item) => item.status === "Cancelled")
                    .length
                }
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-red-50 text-red-600">
              <CalendarDays size={22} />
            </div>
          </div>
        </div>
      </div>

      {/* =========================
          Search & Filter
      ========================= */}

      <div className="mb-6 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {/* Search */}

          <div className="relative">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              placeholder="Search appointment, patient, doctor..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {/* Status */}

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-600 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
          >
            <option value="All">All Status</option>

            <option value="Scheduled">Scheduled</option>

            <option value="Completed">Completed</option>

            <option value="Cancelled">Cancelled</option>

            <option value="No-show">No-show</option>
          </select>
        </div>
      </div>

      {/* =========================
          Table
      ========================= */}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-6 py-4">
          <div className="flex items-center gap-2">
            <CalendarDays size={19} className="text-blue-600" />

            <h2 className="text-base font-semibold text-slate-800">
              Appointment List
            </h2>

            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-500">
              {filteredAppointments.length}
            </span>
          </div>
        </div>

        {/* Loading */}

        {loading ? (
          <div className="flex min-h-[300px] items-center justify-center">
            <div className="text-center">
              <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-blue-600" />

              <p className="text-sm text-slate-500">Loading appointments...</p>
            </div>
          </div>
        ) : filteredAppointments.length === 0 ? (
          /* Empty */

          <div className="flex min-h-[300px] flex-col items-center justify-center">
            <CalendarDays size={38} className="mb-3 text-slate-300" />

            <p className="font-medium text-slate-700">No appointments found</p>

            <p className="mt-1 text-sm text-slate-400">
              Try changing your search or filter.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px]">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-left">
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Appointment ID
                  </th>

                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Patient
                  </th>

                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Doctor
                  </th>

                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Date
                  </th>

                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Time
                  </th>

                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Status
                  </th>

                  <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredAppointments.map((appointment) => (
                  <tr
                    key={appointment.id}
                    className="border-b border-slate-100 last:border-0 hover:bg-slate-50"
                  >
                    {/* Appointment ID */}

                    <td className="px-6 py-4">
                      <span className="text-sm font-semibold text-slate-800">
                        {appointment.appointmentId}
                      </span>
                    </td>

                    {/* Patient */}

                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-slate-800">
                        {getPatientName(appointment.patientId)}
                      </p>
                    </td>

                    {/* Doctor */}

                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-slate-800">
                        {getDoctorName(appointment.doctorId)}
                      </p>
                    </td>

                    {/* Date */}

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <CalendarDays size={15} className="text-slate-400" />

                        {appointment.date}
                      </div>
                    </td>

                    {/* Time */}

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Clock size={15} className="text-slate-400" />

                        {appointment.time}
                      </div>
                    </td>

                    {/* Status */}

                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusStyle(
                          appointment.status,
                        )}`}
                      >
                        {appointment.status}
                      </span>
                    </td>

                    {/* Actions */}

                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        {/* View */}

                        <button
                          onClick={() =>
                            navigate(`/appointments/view/${appointment.id}`)
                          }
                          title="View"
                          className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
                        >
                          <Eye size={17} />
                        </button>

                        {/* Edit */}

                        <button
                          onClick={() =>
                            navigate(`/appointments/edit/${appointment.id}`)
                          }
                          title="Edit"
                          className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-orange-200 hover:bg-orange-50 hover:text-orange-600"
                        >
                          <Pencil size={17} />
                        </button>

                        {/* Delete */}

                        <button
                          onClick={() => handleDelete(appointment.id)}
                          title="Delete"
                          className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                        >
                          <Trash2 size={17} />
                        </button>
                      </div>
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

export default AppointmentList;

import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, CalendarDays, Save } from "lucide-react";

import api from "../../services/api";
import type { Appointment, Patient, Doctor } from "../../types";

const AppointmentForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const isEditMode = Boolean(id);

  const [patients, setPatients] = useState<Patient[]>([]);

  const [doctors, setDoctors] = useState<Doctor[]>([]);

  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    appointmentId: "",
    patientId: "",
    doctorId: "",
    date: "",
    time: "",
    reason: "",
    status: "Scheduled",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // =========================
  // Load Patients + Doctors
  // =========================

  useEffect(() => {
    fetchPatientsAndDoctors();

    if (isEditMode && id) {
      fetchAppointment(id);
    }
  }, [id, isEditMode]);

  const fetchPatientsAndDoctors = async () => {
    try {
      const [patientResponse, doctorResponse] = await Promise.all([
        api.get<Patient[]>("/patients"),
        api.get<Doctor[]>("/doctors"),
      ]);

      setPatients(patientResponse.data);
      setDoctors(doctorResponse.data);
    } catch (error) {
      console.error("Failed to load patients/doctors:", error);
    }
  };

  // =========================
  // Fetch Appointment
  // =========================

  const fetchAppointment = async (appointmentId: string) => {
    try {
      setLoading(true);

      const response = await api.get<Appointment>(
        `/appointments/${appointmentId}`,
      );

      const appointment = response.data;

      setFormData({
        appointmentId: appointment.appointmentId,

        patientId: String(appointment.patientId),

        doctorId: String(appointment.doctorId),

        date: appointment.date,

        time: appointment.time,

        reason: appointment.reason,

        status: appointment.status,
      });
    } catch (error) {
      console.error("Failed to fetch appointment:", error);

      alert("Failed to load appointment");

      navigate("/appointments");
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // Handle Input
  // =========================

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  // =========================
  // Validation
  // =========================

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.appointmentId.trim()) {
      newErrors.appointmentId = "Appointment ID is required";
    }

    if (!formData.patientId) {
      newErrors.patientId = "Please select a patient";
    }

    if (!formData.doctorId) {
      newErrors.doctorId = "Please select a doctor";
    }

    if (!formData.date) {
      newErrors.date = "Date is required";
    }

    if (!formData.time) {
      newErrors.time = "Time is required";
    }

    if (!formData.reason.trim()) {
      newErrors.reason = "Reason for visit is required";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  // =========================
  // Submit
  // =========================

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);

      const payload = {
        appointmentId: formData.appointmentId.trim(),

        patientId: formData.patientId,

        doctorId: formData.doctorId,

        date: formData.date,

        time: formData.time,

        reason: formData.reason.trim(),

        status: formData.status,
      };

      if (isEditMode && id) {
        // UPDATE
        await api.put(`/appointments/${id}`, payload);
      } else {
        // ADD
        await api.post("/appointments", payload);
      }

      navigate("/appointments");
    } catch (error) {
      console.error("Failed to save appointment:", error);

      alert(
        isEditMode
          ? "Failed to update appointment"
          : "Failed to add appointment",
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // Loading Edit
  // =========================

  if (loading && isEditMode) {
    return (
      <div className="flex min-h-[500px] items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-blue-600" />

          <p className="text-sm text-slate-500">Loading appointment...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-slate-50 p-6 lg:p-8">
      {/* =========================
          Header
      ========================= */}

      <div className="mb-7 flex items-center gap-4">
        <button
          type="button"
          onClick={() => navigate("/appointments")}
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
        >
          <ArrowLeft size={19} />
        </button>

        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {isEditMode ? "Edit Appointment" : "Book Appointment"}
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            {isEditMode
              ? "Update appointment information"
              : "Create a new patient appointment"}
          </p>
        </div>
      </div>

      {/* =========================
          Form Card
      ========================= */}

      <div className="mx-auto max-w-4xl">
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          {/* Card Header */}

          <div className="flex items-center gap-3 border-b border-slate-200 px-6 py-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <CalendarDays size={21} />
            </div>

            <div>
              <h2 className="text-base font-semibold text-slate-800">
                Appointment Information
              </h2>

              <p className="text-xs text-slate-400">
                Fill in the appointment details
              </p>
            </div>
          </div>

          {/* Form */}

          <form onSubmit={handleSubmit} className="p-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {/* =====================
                  Appointment ID
              ===================== */}

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Appointment ID
                  <span className="ml-1 text-red-500">*</span>
                </label>

                <input
                  type="text"
                  name="appointmentId"
                  value={formData.appointmentId}
                  onChange={handleChange}
                  placeholder="Example: APT003"
                  className={`w-full rounded-lg border bg-slate-50 px-4 py-2.5 text-sm outline-none transition focus:bg-white focus:ring-2 ${
                    errors.appointmentId
                      ? "border-red-400 focus:border-red-500 focus:ring-red-100"
                      : "border-slate-200 focus:border-blue-500 focus:ring-blue-100"
                  }`}
                />

                {errors.appointmentId && (
                  <p className="mt-1.5 text-xs text-red-500">
                    {errors.appointmentId}
                  </p>
                )}
              </div>

              {/* =====================
                  Patient
              ===================== */}

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Patient
                  <span className="ml-1 text-red-500">*</span>
                </label>

                <select
                  name="patientId"
                  value={formData.patientId}
                  onChange={handleChange}
                  className={`w-full rounded-lg border bg-slate-50 px-4 py-2.5 text-sm outline-none transition focus:bg-white focus:ring-2 ${
                    errors.patientId
                      ? "border-red-400 focus:border-red-500 focus:ring-red-100"
                      : "border-slate-200 focus:border-blue-500 focus:ring-blue-100"
                  }`}
                >
                  <option value="">Select Patient</option>

                  {patients.map((patient) => (
                    <option key={String(patient.id)} value={String(patient.id)}>
                      {patient.name} ({patient.patientId})
                    </option>
                  ))}
                </select>

                {errors.patientId && (
                  <p className="mt-1.5 text-xs text-red-500">
                    {errors.patientId}
                  </p>
                )}
              </div>

              {/* =====================
                  Doctor
              ===================== */}

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Doctor
                  <span className="ml-1 text-red-500">*</span>
                </label>

                <select
                  name="doctorId"
                  value={formData.doctorId}
                  onChange={handleChange}
                  className={`w-full rounded-lg border bg-slate-50 px-4 py-2.5 text-sm outline-none transition focus:bg-white focus:ring-2 ${
                    errors.doctorId
                      ? "border-red-400 focus:border-red-500 focus:ring-red-100"
                      : "border-slate-200 focus:border-blue-500 focus:ring-blue-100"
                  }`}
                >
                  <option value="">Select Doctor</option>

                  {doctors.map((doctor) => (
                    <option key={String(doctor.id)} value={String(doctor.id)}>
                      {doctor.name} - {doctor.specialization}
                    </option>
                  ))}
                </select>

                {errors.doctorId && (
                  <p className="mt-1.5 text-xs text-red-500">
                    {errors.doctorId}
                  </p>
                )}
              </div>

              {/* =====================
                  Date
              ===================== */}

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Date
                  <span className="ml-1 text-red-500">*</span>
                </label>

                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  min={
                    !isEditMode
                      ? new Date().toISOString().split("T")[0]
                      : undefined
                  }
                  className={`w-full rounded-lg border bg-slate-50 px-4 py-2.5 text-sm outline-none transition focus:bg-white focus:ring-2 ${
                    errors.date
                      ? "border-red-400 focus:border-red-500 focus:ring-red-100"
                      : "border-slate-200 focus:border-blue-500 focus:ring-blue-100"
                  }`}
                />

                {errors.date && (
                  <p className="mt-1.5 text-xs text-red-500">{errors.date}</p>
                )}
              </div>

              {/* =====================
                  Time
              ===================== */}

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Time
                  <span className="ml-1 text-red-500">*</span>
                </label>

                <input
                  type="time"
                  name="time"
                  value={formData.time}
                  onChange={handleChange}
                  className={`w-full rounded-lg border bg-slate-50 px-4 py-2.5 text-sm outline-none transition focus:bg-white focus:ring-2 ${
                    errors.time
                      ? "border-red-400 focus:border-red-500 focus:ring-red-100"
                      : "border-slate-200 focus:border-blue-500 focus:ring-blue-100"
                  }`}
                />

                {errors.time && (
                  <p className="mt-1.5 text-xs text-red-500">{errors.time}</p>
                )}
              </div>

              {/* =====================
                  Status
              ===================== */}

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Status
                </label>

                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                >
                  <option value="Scheduled">Scheduled</option>

                  <option value="Completed">Completed</option>

                  <option value="Cancelled">Cancelled</option>

                  <option value="No-show">No-show</option>
                </select>
              </div>

              {/* =====================
                  Reason
              ===================== */}

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Reason for Visit
                  <span className="ml-1 text-red-500">*</span>
                </label>

                <textarea
                  name="reason"
                  value={formData.reason}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Enter reason for the appointment..."
                  className={`w-full resize-none rounded-lg border bg-slate-50 px-4 py-3 text-sm outline-none transition focus:bg-white focus:ring-2 ${
                    errors.reason
                      ? "border-red-400 focus:border-red-500 focus:ring-red-100"
                      : "border-slate-200 focus:border-blue-500 focus:ring-blue-100"
                  }`}
                />

                {errors.reason && (
                  <p className="mt-1.5 text-xs text-red-500">{errors.reason}</p>
                )}
              </div>
            </div>

            {/* =====================
                Buttons
            ===================== */}

            <div className="mt-8 flex flex-col-reverse gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => navigate("/appointments")}
                className="rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Save size={17} />

                {loading
                  ? "Saving..."
                  : isEditMode
                    ? "Update Appointment"
                    : "Book Appointment"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AppointmentForm;

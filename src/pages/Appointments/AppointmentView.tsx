import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../services/api";
import type { Appointment, Patient, Doctor } from "../../types";

const AppointmentView = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [appointment, setAppointment] = useState<Appointment | null>(null);

  const [patient, setPatient] = useState<Patient | null>(null);

  const [doctor, setDoctor] = useState<Doctor | null>(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const appointmentResponse = await api.get<Appointment>(
          `/appointments/${id}`,
        );

        const appointmentData = appointmentResponse.data;

        setAppointment(appointmentData);

        const [patientResponse, doctorResponse] = await Promise.all([
          api.get<Patient[]>("/patients"),
          api.get<Doctor[]>("/doctors"),
        ]);

        const foundPatient = patientResponse.data.find(
          (item) =>
            String(item.id) === String(appointmentData.patientId) ||
            String(item.patientId) === String(appointmentData.patientId),
        );

        const foundDoctor = doctorResponse.data.find(
          (item) =>
            String(item.id) === String(appointmentData.doctorId) ||
            String(item.doctorId) === String(appointmentData.doctorId),
        );

        setPatient(foundPatient || null);
        setDoctor(foundDoctor || null);
      } catch (error) {
        console.error("Failed to load appointment:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id]);

  const getStatusStyle = (status: string) => {
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
        return "bg-slate-100 text-slate-600";
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-blue-600" />

          <p className="text-sm text-slate-500">
            Loading appointment details...
          </p>
        </div>
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="flex min-h-[400px] items-center justify-center bg-slate-50">
        <div className="text-center">
          <h2 className="text-lg font-semibold text-slate-800">
            Appointment not found
          </h2>

          <button
            onClick={() => navigate("/appointments")}
            className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Back to Appointments
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-slate-50 p-6 lg:p-8">
      {/* Header */}

      <div className="mx-auto mb-6 flex max-w-4xl items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Appointment Details
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            View complete appointment information
          </p>
        </div>

        <button
          onClick={() => navigate("/appointments")}
          className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
        >
          ← Back
        </button>
      </div>

      {/* Main Card */}

      <div className="mx-auto max-w-4xl overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {/* Appointment Header */}

        <div className="border-b border-slate-200 bg-slate-50 p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Appointment ID
              </p>

              <h2 className="mt-1 text-xl font-bold text-slate-900">
                {appointment.appointmentId}
              </h2>
            </div>

            <span
              className={`w-fit rounded-full px-3 py-1.5 text-xs font-semibold ${getStatusStyle(
                appointment.status,
              )}`}
            >
              {appointment.status}
            </span>
          </div>
        </div>

        {/* Schedule */}

        <div className="p-6">
          <h3 className="mb-5 text-sm font-semibold uppercase tracking-wide text-slate-500">
            Appointment Schedule
          </h3>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <p className="text-xs font-medium text-slate-400">
                Appointment Date
              </p>

              <p className="mt-1 text-sm font-semibold text-slate-800">
                {appointment.date}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium text-slate-400">
                Appointment Time
              </p>

              <p className="mt-1 text-sm font-semibold text-slate-800">
                {appointment.time}
              </p>
            </div>
          </div>

          <div className="my-8 border-t border-slate-200" />

          {/* Patient */}

          <h3 className="mb-5 text-sm font-semibold uppercase tracking-wide text-slate-500">
            Patient Information
          </h3>

          <div className="rounded-lg border border-slate-200 bg-slate-50 p-5">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 font-semibold text-blue-600">
                {patient?.name?.charAt(0).toUpperCase() || "P"}
              </div>

              <div>
                <p className="text-base font-semibold text-slate-800">
                  {patient?.name || "Unknown Patient"}
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  {patient?.patientId || "Patient ID unavailable"}
                </p>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <p className="text-xs text-slate-400">Phone</p>

                <p className="mt-1 text-sm font-medium text-slate-700">
                  {patient?.phone || "-"}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-400">Blood Group</p>

                <p className="mt-1 text-sm font-medium text-slate-700">
                  {patient?.bloodGroup || "-"}
                </p>
              </div>
            </div>
          </div>

          <div className="my-8 border-t border-slate-200" />

          {/* Doctor */}

          <h3 className="mb-5 text-sm font-semibold uppercase tracking-wide text-slate-500">
            Doctor Information
          </h3>

          <div className="rounded-lg border border-slate-200 bg-slate-50 p-5">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 font-semibold text-green-600">
                {doctor?.name?.charAt(0).toUpperCase() || "D"}
              </div>

              <div>
                <p className="text-base font-semibold text-slate-800">
                  Dr. {doctor?.name || "Unknown Doctor"}
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  {doctor?.specialization || "-"}
                </p>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <p className="text-xs text-slate-400">Department</p>

                <p className="mt-1 text-sm font-medium text-slate-700">
                  {doctor?.department || "-"}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-400">Experience</p>

                <p className="mt-1 text-sm font-medium text-slate-700">
                  {doctor?.experience ? `${doctor.experience} years` : "-"}
                </p>
              </div>
            </div>
          </div>

          <div className="my-8 border-t border-slate-200" />

          {/* Reason */}

          <h3 className="mb-5 text-sm font-semibold uppercase tracking-wide text-slate-500">
            Visit Details
          </h3>

          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <p className="text-sm leading-6 text-slate-700">
              {appointment.reason || "No reason provided."}
            </p>
          </div>

          {/* Actions */}

          <div className="mt-8 flex justify-end gap-3 border-t border-slate-200 pt-5">
            <button
              onClick={() => navigate(`/appointments/edit/${appointment.id}`)}
              className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Edit Appointment
            </button>

            <button
              onClick={() => navigate("/appointments")}
              className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              Back to List
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppointmentView;

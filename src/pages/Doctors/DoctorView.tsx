import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../services/api";
import type { Doctor } from "../../types";

const DoctorView = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [doctor, setDoctor] = useState<Doctor | null>(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        const response = await api.get<Doctor>(`/doctors/${id}`);

        setDoctor(response.data);
      } catch (error) {
        console.error("Failed to fetch doctor:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchDoctor();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-blue-600" />

          <p className="text-sm text-slate-500">Loading doctor details...</p>
        </div>
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="flex min-h-[400px] items-center justify-center bg-slate-50">
        <div className="text-center">
          <h2 className="text-lg font-semibold text-slate-800">
            Doctor not found
          </h2>

          <button
            onClick={() => navigate("/doctors")}
            className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Back to Doctors
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
          <h1 className="text-2xl font-bold text-slate-900">Doctor Details</h1>

          <p className="mt-1 text-sm text-slate-500">
            View complete doctor information
          </p>
        </div>

        <button
          onClick={() => navigate("/doctors")}
          className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
        >
          ← Back
        </button>
      </div>

      {/* Main Card */}

      <div className="mx-auto max-w-4xl overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {/* Profile Header */}

        <div className="border-b border-slate-200 bg-slate-50 p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-xl font-bold text-blue-600">
              {doctor.name.charAt(0).toUpperCase()}
            </div>

            <div className="flex-1">
              <h2 className="text-xl font-bold text-slate-900">
                {doctor.name}
              </h2>

              <p className="mt-1 text-sm text-slate-500">{doctor.doctorId}</p>
            </div>

            <span
              className={`w-fit rounded-full px-3 py-1.5 text-xs font-semibold ${
                doctor.availability === "Available"
                  ? "bg-green-50 text-green-600"
                  : "bg-red-50 text-red-600"
              }`}
            >
              {doctor.availability}
            </span>
          </div>
        </div>

        {/* Details */}

        <div className="p-6">
          <h3 className="mb-5 text-sm font-semibold uppercase tracking-wide text-slate-500">
            Professional Information
          </h3>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {/* Specialization */}

            <div>
              <p className="text-xs font-medium text-slate-400">
                Specialization
              </p>

              <p className="mt-1 text-sm font-semibold text-slate-800">
                {doctor.specialization}
              </p>
            </div>

            {/* Department */}

            <div>
              <p className="text-xs font-medium text-slate-400">Department</p>

              <p className="mt-1 text-sm font-semibold text-slate-800">
                {doctor.department}
              </p>
            </div>

            {/* Experience */}

            <div>
              <p className="text-xs font-medium text-slate-400">Experience</p>

              <p className="mt-1 text-sm font-semibold text-slate-800">
                {doctor.experience} years
              </p>
            </div>

            {/* Availability */}

            <div>
              <p className="text-xs font-medium text-slate-400">Availability</p>

              <p className="mt-1 text-sm font-semibold text-slate-800">
                {doctor.availability}
              </p>
            </div>
          </div>

          <div className="my-8 border-t border-slate-200" />

          {/* Contact */}

          <h3 className="mb-5 text-sm font-semibold uppercase tracking-wide text-slate-500">
            Contact Information
          </h3>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {/* Phone */}

            <div>
              <p className="text-xs font-medium text-slate-400">Phone</p>

              <p className="mt-1 text-sm font-semibold text-slate-800">
                {doctor.phone}
              </p>
            </div>

            {/* Email */}

            <div>
              <p className="text-xs font-medium text-slate-400">Email</p>

              <p className="mt-1 break-all text-sm font-semibold text-slate-800">
                {doctor.email}
              </p>
            </div>
          </div>

          {/* Actions */}

          <div className="mt-8 flex justify-end gap-3 border-t border-slate-200 pt-5">
            <button
              onClick={() => navigate(`/doctors/edit/${doctor.id}`)}
              className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Edit Doctor
            </button>

            <button
              onClick={() => navigate("/doctors")}
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

export default DoctorView;

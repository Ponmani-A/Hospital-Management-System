import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../services/api";
import type { Patient } from "../../types";

const PatientView = () => {
  const { id } = useParams(); // id=1 or 2
  const navigate = useNavigate();

  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchPatient = async () => {
    try {
      const response = await api.get<Patient>(`/patients/${id}`); //GET http://localhost:5000/patients/1

      setPatient(response.data); //show the view details
    } catch (error) {
      console.error("Failed to fetch patient", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatient();
  }, [id]);

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-sm text-slate-500">Loading patient details...</p>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-semibold text-slate-800">
          Patient not found
        </h2>

        <button
          onClick={() => navigate("/patients")}
          className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white"
        >
          Back to Patients
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Patient Details</h1>

          <p className="mt-1 text-sm text-slate-500">
            View complete patient information
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => navigate("/patients")}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
          >
            Back
          </button>

          <button
            onClick={() => navigate(`/patients/edit/${patient.id}`)}
            className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Edit Patient
          </button>
        </div>
      </div>

      {/* Profile */}
      <div className="mb-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-xl font-bold text-blue-600">
            {patient.name.charAt(0).toUpperCase()}
          </div>

          <div>
            <h2 className="text-xl font-bold text-slate-900">{patient.name}</h2>

            <p className="mt-1 text-sm text-slate-500">
              Patient ID: {patient.patientId}
            </p>
          </div>

          <div className="ml-auto">
            <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-600">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Active
            </span>
          </div>
        </div>
      </div>

      {/* Personal Information */}
      <div className="mb-6 rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-6 py-4">
          <h2 className="font-semibold text-slate-900">Personal Information</h2>
        </div>

        <div className="grid grid-cols-1 gap-6 p-6 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="text-xs font-medium uppercase text-slate-400">Age</p>

            <p className="mt-1 text-sm font-semibold text-slate-800">
              {patient.age} years
            </p>
          </div>

          <div>
            <p className="text-xs font-medium uppercase text-slate-400">
              Gender
            </p>

            <p className="mt-1 text-sm font-semibold text-slate-800">
              {patient.gender}
            </p>
          </div>

          <div>
            <p className="text-xs font-medium uppercase text-slate-400">
              Blood Group
            </p>

            <p className="mt-1">
              <span className="rounded-md bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-600">
                {patient.bloodGroup || "N/A"}
              </span>
            </p>
          </div>

          <div>
            <p className="text-xs font-medium uppercase text-slate-400">
              Phone
            </p>

            <p className="mt-1 text-sm font-semibold text-slate-800">
              {patient.phone}
            </p>
          </div>

          <div className="sm:col-span-2">
            <p className="text-xs font-medium uppercase text-slate-400">
              Email
            </p>

            <p className="mt-1 text-sm font-semibold text-slate-800">
              {patient.email || "Not provided"}
            </p>
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div className="mb-6 rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-6 py-4">
          <h2 className="font-semibold text-slate-900">Contact Information</h2>
        </div>

        <div className="grid grid-cols-1 gap-6 p-6 md:grid-cols-2">
          <div>
            <p className="text-xs font-medium uppercase text-slate-400">
              Address
            </p>

            <p className="mt-1 text-sm text-slate-700">
              {patient.address || "Not provided"}
            </p>
          </div>

          <div>
            <p className="text-xs font-medium uppercase text-slate-400">
              Emergency Contact
            </p>

            <p className="mt-1 text-sm font-semibold text-slate-800">
              {patient.emergencyContact || "Not provided"}
            </p>
          </div>
        </div>
      </div>

      {/* Medical History */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-6 py-4">
          <h2 className="font-semibold text-slate-900">Medical History</h2>
        </div>

        <div className="p-6">
          <p className="text-sm leading-6 text-slate-600">
            {patient.medicalHistory || "No medical history provided."}
          </p>
        </div>
      </div>
    </div>
  );
};

export default PatientView;

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Plus, Eye, Pencil, Trash2, FileText } from "lucide-react";

import api from "../../services/api";
import type { Prescription, Patient, Doctor } from "../../types";

const PrescriptionList = () => {
  const navigate = useNavigate();

  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);

  const [patients, setPatients] = useState<Patient[]>([]);

  const [doctors, setDoctors] = useState<Doctor[]>([]);

  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      const [prescriptionResponse, patientResponse, doctorResponse] =
        await Promise.all([
          api.get<Prescription[]>("/prescriptions"),
          api.get<Patient[]>("/patients"),
          api.get<Doctor[]>("/doctors"),
        ]);

      setPrescriptions(prescriptionResponse.data);

      setPatients(patientResponse.data);

      setDoctors(doctorResponse.data);
    } catch (error) {
      console.error("Failed to fetch prescription data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Get Patient
  const getPatient = (id: string | number) => {
    return patients.find((patient) => String(patient.id) === String(id));
  };

  // Get Doctor
  const getDoctor = (id: string | number) => {
    return doctors.find((doctor) => String(doctor.id) === String(id));
  };

  // Delete Prescription
  const handleDelete = async (id?: string | number) => {
    if (!id) return;

    const confirmDelete = window.confirm(
      "Are you sure you want to delete this prescription?",
    );

    if (!confirmDelete) return;

    try {
      await api.delete(`/prescriptions/${id}`);

      setPrescriptions((prev) =>
        prev.filter((prescription) => String(prescription.id) !== String(id)),
      );
    } catch (error) {
      console.error("Failed to delete prescription:", error);

      alert("Failed to delete prescription");
    }
  };

  // Search
  const filteredPrescriptions = prescriptions.filter((prescription) => {
    const patient = getPatient(prescription.patientId);

    const doctor = getDoctor(prescription.doctorId);

    const searchText = search.toLowerCase();

    return (
      prescription.prescriptionId.toLowerCase().includes(searchText) ||
      patient?.name?.toLowerCase().includes(searchText) ||
      doctor?.name?.toLowerCase().includes(searchText)
    );
  });

  return (
    <div className="min-h-full bg-slate-50 p-6 lg:p-8">
      {/* Header */}

      <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Prescriptions</h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage patient prescriptions and medication history
          </p>
        </div>

        <button
          onClick={() => navigate("/prescriptions/add")}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
        >
          <Plus size={18} />
          Add Prescription
        </button>
      </div>

      {/* Search Card */}

      <div className="mb-6 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="relative max-w-md">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            type="text"
            placeholder="Search prescription, patient or doctor..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
          />
        </div>
      </div>

      {/* Table Card */}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {/* Table Header */}

        <div className="border-b border-slate-200 px-6 py-4">
          <div className="flex items-center gap-2">
            <FileText size={19} className="text-blue-600" />

            <h2 className="text-base font-semibold text-slate-800">
              Prescription History
            </h2>

            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-500">
              {filteredPrescriptions.length}
            </span>
          </div>
        </div>

        {/* Loading */}

        {loading ? (
          <div className="flex min-h-[300px] items-center justify-center">
            <div className="text-center">
              <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-blue-600" />

              <p className="text-sm text-slate-500">Loading prescriptions...</p>
            </div>
          </div>
        ) : filteredPrescriptions.length === 0 ? (
          /* Empty */

          <div className="flex min-h-[300px] flex-col items-center justify-center px-6 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
              <FileText size={25} className="text-slate-400" />
            </div>

            <h3 className="text-base font-semibold text-slate-800">
              No prescriptions found
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Try another search or add a new prescription.
            </p>
          </div>
        ) : (
          /* Table */

          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-left">
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Prescription ID
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
                    Medicines
                  </th>

                  <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredPrescriptions.map((prescription) => {
                  const patient = getPatient(prescription.patientId);

                  const doctor = getDoctor(prescription.doctorId);

                  return (
                    <tr
                      key={prescription.id}
                      className="border-b border-slate-100 last:border-0 hover:bg-slate-50"
                    >
                      {/* Prescription ID */}

                      <td className="px-6 py-4">
                        <span className="font-semibold text-blue-600">
                          {prescription.prescriptionId}
                        </span>
                      </td>

                      {/* Patient */}

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-50 text-sm font-semibold text-blue-600">
                            {patient?.name?.charAt(0).toUpperCase() || "P"}
                          </div>

                          <div>
                            <p className="text-sm font-medium text-slate-800">
                              {patient?.name || "Unknown Patient"}
                            </p>

                            <p className="text-xs text-slate-400">
                              {patient?.patientId || "-"}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Doctor */}

                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-medium text-slate-700">
                            {doctor?.name || "Unknown Doctor"}
                          </p>

                          <p className="text-xs text-slate-400">
                            {doctor?.specialization || "-"}
                          </p>
                        </div>
                      </td>

                      {/* Date */}

                      <td className="px-6 py-4">
                        <span className="text-sm text-slate-600">
                          {prescription.date}
                        </span>
                      </td>

                      {/* Medicines */}

                      <td className="px-6 py-4">
                        <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600">
                          {prescription.medicines?.length || 0} Medicines
                        </span>
                      </td>

                      {/* Actions */}

                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2">
                          {/* View */}

                          <button
                            onClick={() =>
                              navigate(`/prescriptions/view/${prescription.id}`)
                            }
                            title="View"
                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
                          >
                            <Eye size={17} />
                          </button>

                          {/* Edit */}

                          <button
                            onClick={() =>
                              navigate(`/prescriptions/edit/${prescription.id}`)
                            }
                            title="Edit"
                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-orange-200 hover:bg-orange-50 hover:text-orange-600"
                          >
                            <Pencil size={17} />
                          </button>

                          {/* Delete */}

                          <button
                            onClick={() => handleDelete(prescription.id)}
                            title="Delete"
                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                          >
                            <Trash2 size={17} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default PrescriptionList;

import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../services/api";
import type { Prescription, Patient, Doctor } from "../../types";

const PrescriptionView = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [prescription, setPrescription] = useState<Prescription | null>(null);

  const [patient, setPatient] = useState<Patient | null>(null);

  const [doctor, setDoctor] = useState<Doctor | null>(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Get prescription
        const prescriptionResponse = await api.get<Prescription>(
          `/prescriptions/${id}`,
        );

        const prescriptionData = prescriptionResponse.data;

        setPrescription(prescriptionData);

        // Get patient and doctor
        const [patientResponse, doctorResponse] = await Promise.all([
          api.get<Patient>(`/patients/${prescriptionData.patientId}`),

          api.get<Doctor>(`/doctors/${prescriptionData.doctorId}`),
        ]);

        setPatient(patientResponse.data);

        setDoctor(doctorResponse.data);
      } catch (error) {
        console.error("Failed to fetch prescription", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="p-6 lg:p-8">
        <p className="text-sm text-slate-500">Loading prescription...</p>
      </div>
    );
  }

  if (!prescription) {
    return (
      <div className="p-6 lg:p-8">
        <div className="rounded-xl border border-red-200 bg-red-50 p-6">
          <p className="text-sm text-red-600">Prescription not found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-slate-50 p-6 lg:p-8">
      {/* Page Header */}
      <div className="mx-auto mb-6 flex max-w-5xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Prescription Details
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            View complete prescription information
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => navigate(`/prescriptions/edit/${prescription.id}`)}
            className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Edit Prescription
          </button>

          <button
            onClick={() => navigate("/prescriptions")}
            className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
          >
            Back
          </button>
        </div>
      </div>

      {/* Prescription Paper */}
      <div className="mx-auto max-w-5xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {/* Hospital Header */}
        <div className="border-b border-slate-200 px-6 py-6 sm:px-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              {/* Logo */}
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-blue-600 text-2xl font-bold text-white">
                +
              </div>

              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  CityCare Hospital
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Quality Healthcare & Medical Services
                </p>
              </div>
            </div>

            <div className="sm:text-right">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Prescription
              </p>

              <p className="mt-1 text-lg font-bold text-blue-600">
                {prescription.prescriptionId}
              </p>
            </div>
          </div>
        </div>

        {/* Patient + Doctor */}
        <div className="grid grid-cols-1 border-b border-slate-200 md:grid-cols-2">
          {/* Patient */}
          <div className="border-b border-slate-200 p-6 md:border-b-0 md:border-r md:px-8">
            <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-slate-400">
              Patient Information
            </p>

            <div className="space-y-3">
              <div className="flex justify-between gap-4">
                <span className="text-sm text-slate-500">Name</span>

                <span className="text-right text-sm font-semibold text-slate-800">
                  {patient?.name || "-"}
                </span>
              </div>

              <div className="flex justify-between gap-4">
                <span className="text-sm text-slate-500">Patient ID</span>

                <span className="text-right text-sm font-semibold text-slate-800">
                  {patient?.patientId || "-"}
                </span>
              </div>

              <div className="flex justify-between gap-4">
                <span className="text-sm text-slate-500">Age / Gender</span>

                <span className="text-right text-sm font-semibold text-slate-800">
                  {patient?.age || "-"} / {patient?.gender || "-"}
                </span>
              </div>

              <div className="flex justify-between gap-4">
                <span className="text-sm text-slate-500">Phone</span>

                <span className="text-right text-sm font-semibold text-slate-800">
                  {patient?.phone || "-"}
                </span>
              </div>
            </div>
          </div>

          {/* Doctor */}
          <div className="p-6 md:px-8">
            <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-slate-400">
              Doctor Information
            </p>

            <div className="space-y-3">
              <div className="flex justify-between gap-4">
                <span className="text-sm text-slate-500">Doctor</span>

                <span className="text-right text-sm font-semibold text-slate-800">
                  Dr. {doctor?.name || "-"}
                </span>
              </div>

              <div className="flex justify-between gap-4">
                <span className="text-sm text-slate-500">Specialization</span>

                <span className="text-right text-sm font-semibold text-slate-800">
                  {doctor?.specialization || "-"}
                </span>
              </div>

              <div className="flex justify-between gap-4">
                <span className="text-sm text-slate-500">Department</span>

                <span className="text-right text-sm font-semibold text-slate-800">
                  {doctor?.department || "-"}
                </span>
              </div>

              <div className="flex justify-between gap-4">
                <span className="text-sm text-slate-500">Date</span>

                <span className="text-right text-sm font-semibold text-slate-800">
                  {prescription.date}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Medicines */}
        <div className="p-6 sm:p-8">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Prescribed Medicines
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Medicines and dosage instructions
              </p>
            </div>

            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600">
              {prescription.medicines.length} Medicine
              {prescription.medicines.length !== 1 ? "s" : ""}
            </span>
          </div>

          {/* Medicine Table */}
          <div className="overflow-hidden rounded-xl border border-slate-200">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[750px]">
                <thead className="bg-slate-50">
                  <tr className="border-b border-slate-200 text-left">
                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      #
                    </th>

                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Medicine
                    </th>

                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Dosage
                    </th>

                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Duration
                    </th>

                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Instructions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {prescription.medicines.map((medicine, index) => (
                    <tr
                      key={index}
                      className="border-b border-slate-100 last:border-0"
                    >
                      <td className="px-5 py-5 text-sm font-semibold text-slate-400">
                        {String(index + 1).padStart(2, "0")}
                      </td>

                      <td className="px-5 py-5">
                        <p className="text-sm font-semibold text-slate-900">
                          {medicine.medicineName}
                        </p>
                      </td>

                      <td className="px-5 py-5 text-sm font-medium text-slate-700">
                        {medicine.dosage}
                      </td>

                      <td className="px-5 py-5 text-sm text-slate-600">
                        {medicine.duration}
                      </td>

                      <td className="max-w-[280px] px-5 py-5 text-sm text-slate-600">
                        {medicine.instructions}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 bg-slate-50 px-6 py-6 sm:px-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-medium text-slate-400">
                Important Note
              </p>

              <p className="mt-1 max-w-lg text-xs leading-5 text-slate-500">
                Please take medicines according to the prescribed dosage and
                instructions. Contact the hospital if you experience any unusual
                symptoms.
              </p>
            </div>

            <div className="text-left sm:text-right">
              <div className="mb-8 h-px w-40 bg-slate-300 sm:ml-auto" />

              <p className="text-sm font-semibold text-slate-800">
                Dr. {doctor?.name || "-"}
              </p>

              <p className="mt-1 text-xs text-slate-500">
                {doctor?.specialization || ""}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrescriptionView;

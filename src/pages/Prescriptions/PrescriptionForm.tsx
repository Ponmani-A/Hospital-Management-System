import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../services/api";
import type { Prescription, Medicine, Patient, Doctor } from "../../types";

const emptyMedicine: Medicine = {
  medicineName: "",
  dosage: "",
  duration: "",
  instructions: "",
};

const emptyPrescription: Prescription = {
  prescriptionId: "",
  patientId: "",
  doctorId: "",
  date: "",
  medicines: [
    {
      medicineName: "",
      dosage: "",
      duration: "",
      instructions: "",
    },
  ],
};

const PrescriptionForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const isEditMode = Boolean(id);

  const [formData, setFormData] = useState<Prescription>(emptyPrescription);

  const [patients, setPatients] = useState<Patient[]>([]);

  const [doctors, setDoctors] = useState<Doctor[]>([]);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  // Fetch patients and doctors
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [patientResponse, doctorResponse] = await Promise.all([
          api.get<Patient[]>("/patients"),
          api.get<Doctor[]>("/doctors"),
        ]);

        setPatients(patientResponse.data);

        setDoctors(doctorResponse.data);
      } catch (error) {
        console.error(error);

        setError("Failed to load patients or doctors.");
      }
    };

    fetchData();
  }, []);

  // Fetch prescription when editing
  useEffect(() => {
    if (!id) return;

    const fetchPrescription = async () => {
      try {
        setLoading(true);

        const response = await api.get<Prescription>(`/prescriptions/${id}`);

        const data = response.data;

        setFormData({
          ...data,
          patientId: data.patientId,
          doctorId: data.doctorId,
        });
      } catch (error) {
        console.error(error);

        setError("Failed to load prescription.");
      } finally {
        setLoading(false);
      }
    };

    fetchPrescription();
  }, [id]);

  // Normal fields
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "patientId" || name === "doctorId" ? Number(value) : value,
    }));
  };

  // Medicine fields
  const handleMedicineChange = (
    index: number,
    field: keyof Medicine,
    value: string,
  ) => {
    setFormData((prev) => {
      const medicines = [...prev.medicines];

      medicines[index] = {
        ...medicines[index],
        [field]: value,
      };

      return {
        ...prev,
        medicines,
      };
    });
  };

  // Add medicine
  const addMedicine = () => {
    setFormData((prev) => ({
      ...prev,
      medicines: [
        ...prev.medicines,
        {
          ...emptyMedicine,
        },
      ],
    }));
  };

  // Remove medicine
  const removeMedicine = (index: number) => {
    if (formData.medicines.length === 1) {
      return;
    }

    setFormData((prev) => ({
      ...prev,
      medicines: prev.medicines.filter(
        (_, medicineIndex) => medicineIndex !== index,
      ),
    }));
  };

  // Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setError("");

    if (!formData.prescriptionId.trim()) {
      setError("Prescription ID is required.");
      return;
    }

    if (!formData.patientId) {
      setError("Please select a patient.");
      return;
    }

    if (!formData.doctorId) {
      setError("Please select a doctor.");
      return;
    }

    if (!formData.date) {
      setError("Prescription date is required.");
      return;
    }

    for (const medicine of formData.medicines) {
      if (!medicine.medicineName.trim()) {
        setError("Medicine name is required.");
        return;
      }

      if (!medicine.dosage.trim()) {
        setError("Dosage is required.");
        return;
      }

      if (!medicine.duration.trim()) {
        setError("Duration is required.");
        return;
      }

      if (!medicine.instructions.trim()) {
        setError("Instructions are required.");
        return;
      }
    }

    try {
      setLoading(true);

      if (isEditMode) {
        await api.put(`/prescriptions/${id}`, formData);
      } else {
        await api.post("/prescriptions", formData);
      }

      navigate("/prescriptions");
    } catch (error) {
      console.error(error);

      setError(
        isEditMode
          ? "Failed to update prescription."
          : "Failed to create prescription.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mx-auto mb-6 max-w-5xl">
        <h1 className="text-2xl font-bold text-slate-900">
          {isEditMode ? "Edit Prescription" : "Create Prescription"}
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Create and manage patient prescriptions
        </p>
      </div>

      <div className="mx-auto max-w-5xl rounded-xl border border-slate-200 bg-white shadow-sm">
        {/* Error */}
        {error && (
          <div className="mx-6 mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6">
          {/* Basic Information */}
          <div className="mb-8">
            <h2 className="mb-4 text-lg font-semibold text-slate-900">
              Prescription Information
            </h2>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              {/* Prescription ID */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Prescription ID *
                </label>

                <input
                  type="text"
                  name="prescriptionId"
                  value={formData.prescriptionId}
                  onChange={handleChange}
                  placeholder="RX001"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {/* Date */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Date *
                </label>

                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {/* Patient */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Patient *
                </label>

                <select
                  value={formData.patientId || ""}
                  onChange={(e) => {
                    setFormData((prev) => ({
                      ...prev,
                      patientId: e.target.value,
                    }));
                  }}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="">Select Patient</option>

                  {patients.map((patient) => (
                    <option key={patient.id} value={patient.id}>
                      {patient.name} - {patient.patientId}
                    </option>
                  ))}
                </select>
              </div>

              {/* Doctor */}
              {/* Doctor */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Doctor *
                </label>

                <select
                  value={formData.doctorId || ""}
                  onChange={(e) => {
                    setFormData((prev) => ({
                      ...prev,
                      doctorId: e.target.value,
                    }));
                  }}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="">Select Doctor</option>

                  {doctors.map((doctor) => (
                    <option key={doctor.id} value={doctor.id}>
                      Dr. {doctor.name} - {doctor.specialization}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Medicines */}
          <div>
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  Medicines
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Add medicines prescribed to the patient
                </p>
              </div>

              <button
                type="button"
                onClick={addMedicine}
                className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
              >
                + Add Medicine
              </button>
            </div>

            <div className="space-y-5">
              {formData.medicines.map((medicine, index) => (
                <div
                  key={index}
                  className="rounded-xl border border-slate-200 bg-slate-50 p-5"
                >
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-slate-800">
                      Medicine {index + 1}
                    </h3>

                    {formData.medicines.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeMedicine(index)}
                        className="text-xs font-semibold text-red-600 hover:text-red-700"
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    {/* Medicine name */}
                    <div>
                      <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                        Medicine Name *
                      </label>

                      <input
                        type="text"
                        value={medicine.medicineName}
                        onChange={(e) =>
                          handleMedicineChange(
                            index,
                            "medicineName",
                            e.target.value,
                          )
                        }
                        placeholder="Paracetamol"
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                      />
                    </div>

                    {/* Dosage */}
                    <div>
                      <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                        Dosage *
                      </label>

                      <input
                        type="text"
                        value={medicine.dosage}
                        onChange={(e) =>
                          handleMedicineChange(index, "dosage", e.target.value)
                        }
                        placeholder="500mg"
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                      />
                    </div>

                    {/* Duration */}
                    <div>
                      <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                        Duration *
                      </label>

                      <input
                        type="text"
                        value={medicine.duration}
                        onChange={(e) =>
                          handleMedicineChange(
                            index,
                            "duration",
                            e.target.value,
                          )
                        }
                        placeholder="5 Days"
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                      />
                    </div>

                    {/* Instructions */}
                    <div className="md:col-span-3">
                      <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                        Instructions *
                      </label>

                      <textarea
                        value={medicine.instructions}
                        onChange={(e) =>
                          handleMedicineChange(
                            index,
                            "instructions",
                            e.target.value,
                          )
                        }
                        rows={3}
                        placeholder="Take after food..."
                        className="w-full resize-none rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Buttons */}
          <div className="mt-8 flex justify-end gap-3 border-t border-slate-200 pt-5">
            <button
              type="button"
              onClick={() => navigate("/prescriptions")}
              className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
            >
              {loading
                ? "Saving..."
                : isEditMode
                  ? "Update Prescription"
                  : "Create Prescription"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PrescriptionForm;

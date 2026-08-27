import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../services/api";
import type { Patient } from "../../types";

const emptyPatient: Patient = {
  patientId: "",
  name: "",
  age: 0,
  gender: "",
  phone: "",
  email: "",
  address: "",
  bloodGroup: "",
  emergencyContact: "",
  medicalHistory: "",
};

const PatientForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const isEditMode = Boolean(id);

  const [formData, setFormData] = useState<Patient>(emptyPatient);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Get existing patient when editing
  useEffect(() => {
    if (!id) return;

    const fetchPatient = async () => {
      try {
        setLoading(true);

        const response = await api.get<Patient>(`/patients/${id}`);

        setFormData(response.data);
      } catch (error) {
        console.error("Failed to fetch patient", error);
        setError("Failed to load patient details.");
      } finally {
        setLoading(false);
      }
    };

    fetchPatient();
  }, [id]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: name === "age" ? Number(value) : value,
    }));
  };

  const validateForm = () => {
    if (!formData.patientId.trim()) {
      setError("Patient ID is required.");
      return false;
    }

    if (!formData.name.trim()) {
      setError("Patient name is required.");
      return false;
    }

    if (!formData.age || formData.age <= 0) {
      setError("Please enter a valid age.");
      return false;
    }

    if (!formData.gender) {
      setError("Please select gender.");
      return false;
    }

    if (!formData.phone.trim()) {
      setError("Phone number is required.");
      return false;
    }

    if (!/^[0-9]{10}$/.test(formData.phone)) {
      setError("Phone number must contain 10 digits.");
      return false;
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError("Please enter a valid email address.");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setError("");

    if (!validateForm()) return;

    try {
      setLoading(true);

      if (isEditMode) {
        // UPDATE
        await api.put(`/patients/${id}`, formData);
      } else {
        // CREATE
        await api.post("/patients", formData);
      }

      navigate("/patients");
    } catch (error) {
      console.error("Failed to save patient", error);

      setError(
        isEditMode ? "Failed to update patient." : "Failed to add patient.",
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEditMode && !formData.name) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-sm text-slate-500">Loading patient details...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6 lg:p-8">
      {/* Header */}
      <div className="mx-auto mb-6 max-w-4xl">
        <h1 className="text-2xl font-bold text-slate-900">
          {isEditMode ? "Edit Patient" : "Add New Patient"}
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          {isEditMode
            ? "Update patient information"
            : "Enter patient information to register a new patient"}
        </p>
      </div>

      {/* Form Card */}
      <div className="mx-auto max-w-4xl rounded-xl border border-slate-200 bg-white shadow-sm">
        {/* Card Header */}
        <div className="border-b border-slate-200 px-6 py-5">
          <h2 className="font-semibold text-slate-900">Patient Information</h2>

          <p className="mt-1 text-sm text-slate-500">
            Fields marked with * are required
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mx-6 mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 gap-5 p-6 md:grid-cols-2"
        >
          {/* Patient ID */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Patient ID *
            </label>

            <input
              type="text"
              name="patientId"
              value={formData.patientId}
              onChange={handleChange}
              placeholder="P001"
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {/* Name */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Patient Name *
            </label>

            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter patient name"
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {/* Age */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Age *
            </label>

            <input
              type="number"
              name="age"
              min="1"
              max="120"
              value={formData.age || ""}
              onChange={handleChange}
              placeholder="Enter age"
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {/* Gender */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Gender *
            </label>

            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="">Select Gender</option>

              <option value="Male">Male</option>

              <option value="Female">Female</option>

              <option value="Other">Other</option>
            </select>
          </div>

          {/* Phone */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Phone *
            </label>

            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="9876543210"
              maxLength={10}
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {/* Email */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Email
            </label>

            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="patient@gmail.com"
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {/* Address */}
          <div className="md:col-span-2">
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Address
            </label>

            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Enter patient address"
              rows={3}
              className="w-full resize-none rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {/* Blood Group */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Blood Group
            </label>

            <select
              name="bloodGroup"
              value={formData.bloodGroup}
              onChange={handleChange}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="">Select Blood Group</option>

              <option value="A+">A+</option>
              <option value="A-">A-</option>
              <option value="B+">B+</option>
              <option value="B-">B-</option>
              <option value="AB+">AB+</option>
              <option value="AB-">AB-</option>
              <option value="O+">O+</option>
              <option value="O-">O-</option>
            </select>
          </div>

          {/* Emergency Contact */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Emergency Contact
            </label>

            <input
              type="tel"
              name="emergencyContact"
              value={formData.emergencyContact}
              onChange={handleChange}
              placeholder="Emergency contact number"
              maxLength={10}
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {/* Medical History */}
          <div className="md:col-span-2">
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Medical History
            </label>

            <textarea
              name="medicalHistory"
              value={formData.medicalHistory}
              onChange={handleChange}
              placeholder="Enter medical history"
              rows={4}
              className="w-full resize-none rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 border-t border-slate-200 pt-5 md:col-span-2">
            <button
              type="button"
              onClick={() => navigate("/patients")}
              className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading
                ? "Saving..."
                : isEditMode
                  ? "Update Patient"
                  : "Add Patient"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PatientForm;

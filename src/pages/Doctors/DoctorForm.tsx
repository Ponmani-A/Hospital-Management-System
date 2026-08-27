import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../services/api";
import type { Doctor } from "../../types";

const emptyDoctor: Doctor = {
  doctorId: "",
  name: "",
  specialization: "",
  department: "",
  experience: 0,
  phone: "",
  email: "",
  availability: "",
};

const DoctorForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const isEditMode = Boolean(id);

  const [formData, setFormData] = useState<Doctor>(emptyDoctor);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;

    const fetchDoctor = async () => {
      try {
        setLoading(true);

        const response = await api.get<Doctor>(`/doctors/${id}`);

        setFormData(response.data);
      } catch (error) {
        console.error("Failed to fetch doctor", error);

        setError("Failed to load doctor details.");
      } finally {
        setLoading(false);
      }
    };

    fetchDoctor();
  }, [id]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: name === "experience" ? Number(value) : value,
    }));
  };

  const validateForm = () => {
    if (!formData.doctorId.trim()) {
      setError("Doctor ID is required.");
      return false;
    }

    if (!formData.name.trim()) {
      setError("Doctor name is required.");
      return false;
    }

    if (!formData.specialization) {
      setError("Specialization is required.");
      return false;
    }

    if (!formData.department) {
      setError("Department is required.");
      return false;
    }

    if (formData.experience < 0) {
      setError("Experience cannot be negative.");
      return false;
    }

    if (!/^[0-9]{10}$/.test(formData.phone)) {
      setError("Phone number must contain 10 digits.");
      return false;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError("Please enter a valid email.");
      return false;
    }

    if (!formData.availability) {
      setError("Please select availability.");
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
        await api.put(`/doctors/${id}`, formData);
      } else {
        await api.post("/doctors", formData);
      }

      navigate("/doctors");
    } catch (error) {
      console.error("Failed to save doctor", error);

      setError(
        isEditMode ? "Failed to update doctor." : "Failed to add doctor.",
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEditMode && !formData.name) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-sm text-slate-500">Loading doctor details...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6 lg:p-8">
      {/* Header */}
      <div className="mx-auto mb-6 max-w-4xl">
        <h1 className="text-2xl font-bold text-slate-900">
          {isEditMode ? "Edit Doctor" : "Add New Doctor"}
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          {isEditMode
            ? "Update doctor information"
            : "Enter doctor information to register a new doctor"}
        </p>
      </div>

      {/* Form */}
      <div className="mx-auto max-w-4xl rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-6 py-5">
          <h2 className="font-semibold text-slate-900">Doctor Information</h2>

          <p className="mt-1 text-sm text-slate-500">
            Fields marked with * are required
          </p>
        </div>

        {error && (
          <div className="mx-6 mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 gap-5 p-6 md:grid-cols-2"
        >
          {/* Doctor ID */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Doctor ID *
            </label>

            <input
              type="text"
              name="doctorId"
              value={formData.doctorId}
              onChange={handleChange}
              placeholder="D001"
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {/* Name */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Doctor Name *
            </label>

            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter doctor name"
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {/* Specialization */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Specialization *
            </label>

            <select
              name="specialization"
              value={formData.specialization}
              onChange={handleChange}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="">Select Specialization</option>

              <option value="Cardiologist">Cardiologist</option>

              <option value="Neurologist">Neurologist</option>

              <option value="Orthopedic">Orthopedic</option>

              <option value="Pediatrician">Pediatrician</option>

              <option value="General Physician">General Physician</option>
            </select>
          </div>

          {/* Department */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Department *
            </label>

            <select
              name="department"
              value={formData.department}
              onChange={handleChange}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="">Select Department</option>

              <option value="Cardiology">Cardiology</option>

              <option value="Neurology">Neurology</option>

              <option value="Orthopedics">Orthopedics</option>

              <option value="Pediatrics">Pediatrics</option>

              <option value="General Medicine">General Medicine</option>
            </select>
          </div>

          {/* Experience */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Experience *
            </label>

            <input
              type="number"
              name="experience"
              min="0"
              value={formData.experience || ""}
              onChange={handleChange}
              placeholder="Years of experience"
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
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
              maxLength={10}
              placeholder="9876543210"
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {/* Email */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Email *
            </label>

            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="doctor@hospital.com"
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {/* Availability */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Availability *
            </label>

            <select
              name="availability"
              value={formData.availability}
              onChange={handleChange}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="">Select Availability</option>

              <option value="Available">Available</option>

              <option value="On Leave">On Leave</option>

              <option value="Busy">Busy</option>
            </select>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 border-t border-slate-200 pt-5 md:col-span-2">
            <button
              type="button"
              onClick={() => navigate("/doctors")}
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
                  ? "Update Doctor"
                  : "Add Doctor"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DoctorForm;

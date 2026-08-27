import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../services/api";
import type { Department } from "../../types";

const emptyDepartment: Department = {
  departmentId: "",
  name: "",
  description: "",
  status: "Active",
};

const DepartmentForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const isEditMode = Boolean(id);

  const [formData, setFormData] = useState<Department>(emptyDepartment);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;

    const fetchDepartment = async () => {
      try {
        setLoading(true);

        const response = await api.get<Department>(`/departments/${id}`);

        setFormData(response.data);
      } catch (error) {
        console.error(error);
        setError("Failed to load department details.");
      } finally {
        setLoading(false);
      }
    };

    fetchDepartment();
  }, [id]);

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
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setError("");

    if (!formData.departmentId.trim()) {
      setError("Department ID is required.");
      return;
    }

    if (!formData.name.trim()) {
      setError("Department name is required.");
      return;
    }

    if (!formData.description.trim()) {
      setError("Description is required.");
      return;
    }

    try {
      setLoading(true);

      if (isEditMode) {
        await api.put(`/departments/${id}`, formData);
      } else {
        await api.post("/departments", formData);
      }

      navigate("/departments");
    } catch (error) {
      console.error(error);

      setError(
        isEditMode
          ? "Failed to update department."
          : "Failed to add department.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mx-auto mb-6 max-w-3xl">
        <h1 className="text-2xl font-bold text-slate-900">
          {isEditMode ? "Edit Department" : "Add Department"}
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          {isEditMode
            ? "Update department information"
            : "Create a new hospital department"}
        </p>
      </div>

      {/* Form */}
      <div className="mx-auto max-w-3xl rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-6 py-5">
          <h2 className="font-semibold text-slate-900">
            Department Information
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Fields marked with * are required
          </p>
        </div>

        {error && (
          <div className="mx-6 mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-5 p-6">
          {/* Department ID */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Department ID *
            </label>

            <input
              type="text"
              name="departmentId"
              value={formData.departmentId}
              onChange={handleChange}
              placeholder="DEP001"
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {/* Name */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Department Name *
            </label>

            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Cardiology"
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {/* Description */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Description *
            </label>

            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              placeholder="Enter department description..."
              className="w-full resize-none rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {/* Status */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Status
            </label>

            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500"
            >
              <option value="Active">Active</option>

              <option value="Inactive">Inactive</option>
            </select>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 border-t border-slate-200 pt-5">
            <button
              type="button"
              onClick={() => navigate("/departments")}
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
                  ? "Update Department"
                  : "Add Department"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DepartmentForm;

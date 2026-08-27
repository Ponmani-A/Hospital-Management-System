import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import type { Department, Doctor, Patient } from "../../types";

const DepartmentList = () => {
  const navigate = useNavigate();

  const [departments, setDepartments] = useState<Department[]>([]);

  const [doctors, setDoctors] = useState<Doctor[]>([]);

  const [patients, setPatients] = useState<Patient[]>([]);

  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] = useState("");

  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);

      const [departmentResponse, doctorResponse, patientResponse] =
        await Promise.all([
          api.get<Department[]>("/departments"),
          api.get<Doctor[]>("/doctors"),
          api.get<Patient[]>("/patients"),
        ]);

      setDepartments(departmentResponse.data);

      setDoctors(doctorResponse.data);
      setPatients(patientResponse.data);
    } catch (error) {
      console.error("Failed to fetch departments", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id?: number) => {
    if (!id) return;

    const confirmed = window.confirm(
      "Are you sure you want to delete this department?",
    );

    if (!confirmed) return;

    try {
      await api.delete(`/departments/${id}`);

      setDepartments((prev) =>
        prev.filter((department) => department.id !== id),
      );
    } catch (error) {
      console.error(error);

      alert("Failed to delete department.");
    }
  };

  const getDoctorCount = (departmentName: string) => {
    return doctors.filter(
      (doctor) =>
        doctor.department.toLowerCase() === departmentName.toLowerCase(),
    ).length;
  };

  const getPatientCount = (departmentName: string) => {
    return patients.filter(
      (patient) =>
        patient.department?.toLowerCase() === departmentName.toLowerCase(),
    ).length;
  };

  const filteredDepartments = useMemo(() => {
    return departments.filter((department) => {
      const searchText = search.toLowerCase().trim();

      const matchesSearch =
        department.name.toLowerCase().includes(searchText) ||
        department.departmentId.toLowerCase().includes(searchText) ||
        department.description.toLowerCase().includes(searchText);

      const matchesStatus =
        statusFilter === "" || department.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [departments, search, statusFilter]);

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Departments</h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage hospital departments
          </p>
        </div>

        <button
          onClick={() => navigate("/departments/add")}
          className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
        >
          + Add Department
        </button>
      </div>

      {/* Filters */}
      <div className="mb-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-500">
              Search
            </label>

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search department..."
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-500">
              Status
            </label>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500"
            >
              <option value="">All Status</option>

              <option value="Active">Active</option>

              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-5 py-4">
          <h2 className="font-semibold text-slate-900">Department List</h2>

          <p className="mt-1 text-xs text-slate-500">
            {filteredDepartments.length} department(s) found
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead className="bg-slate-50">
              <tr className="border-b border-slate-200 text-left">
                <th className="px-5 py-3 text-xs font-semibold uppercase text-slate-500">
                  Department
                </th>

                <th className="px-5 py-3 text-xs font-semibold uppercase text-slate-500">
                  Description
                </th>

                <th className="px-5 py-3 text-center text-xs font-semibold uppercase text-slate-500">
                  Doctors
                </th>

                <th className="px-5 py-3 text-center text-xs font-semibold uppercase text-slate-500">
                  Patients
                </th>

                <th className="px-5 py-3 text-xs font-semibold uppercase text-slate-500">
                  Status
                </th>

                <th className="px-5 py-3 text-center text-xs font-semibold uppercase text-slate-500">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-5 py-12 text-center text-sm text-slate-500"
                  >
                    Loading departments...
                  </td>
                </tr>
              ) : filteredDepartments.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-5 py-12 text-center text-sm text-slate-500"
                  >
                    No departments found.
                  </td>
                </tr>
              ) : (
                filteredDepartments.map((department) => (
                  <tr
                    key={department.id}
                    className="border-b border-slate-100 hover:bg-slate-50"
                  >
                    {/* Department */}
                    <td className="px-5 py-4">
                      <p className="text-sm font-semibold text-slate-800">
                        {department.name}
                      </p>

                      <p className="text-xs text-slate-500">
                        {department.departmentId}
                      </p>
                    </td>

                    {/* Description */}
                    <td className="max-w-[300px] px-5 py-4">
                      <p className="truncate text-sm text-slate-600">
                        {department.description}
                      </p>
                    </td>

                    {/* Doctors */}
                    <td className="px-5 py-4 text-center">
                      <span className="inline-flex h-8 min-w-8 items-center justify-center rounded-full bg-blue-50 px-2 text-xs font-bold text-blue-600">
                        {getDoctorCount(department.name)}
                      </span>
                    </td>

                    {/* Patients */}
                    <td className="px-5 py-4 text-center">
                      <span className="inline-flex h-8 min-w-8 items-center justify-center rounded-full bg-purple-50 px-2 text-xs font-bold text-purple-600">
                        {getPatientCount(department.name)}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          department.status === "Active"
                            ? "bg-emerald-50 text-emerald-600"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {department.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() =>
                            navigate(`/departments/edit/${department.id}`)
                          }
                          className="rounded-md border border-blue-200 px-3 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-50"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() => handleDelete(department.id)}
                          className="rounded-md border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DepartmentList;

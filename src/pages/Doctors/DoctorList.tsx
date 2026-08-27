import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import type { Doctor } from "../../types";

const DoctorList = () => {
  const navigate = useNavigate();

  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [specializationFilter, setSpecializationFilter] = useState("All");
  const [departmentFilter, setDepartmentFilter] = useState("All");
  const [availabilityFilter, setAvailabilityFilter] = useState("All");

  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");

  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 5;
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setLoading(true);

        const response = await api.get<Doctor[]>("/doctors");

        setDoctors(response.data);
      } catch (error) {
        console.error("Failed to fetch doctors:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, []);

  const handleDelete = async (id?: string | number) => {
    if (!id) return;

    const confirmDelete = window.confirm(
      "Are you sure you want to delete this doctor?",
    );

    if (!confirmDelete) return;

    try {
      await api.delete(`/doctors/${id}`);

      setDoctors((prev) =>
        prev.filter((doctor) => String(doctor.id) !== String(id)),
      );
    } catch (error) {
      console.error("Failed to delete doctor:", error);

      alert("Failed to delete doctor");
    }
  };

  // ============================
  // Filter
  // ============================

  const filteredDoctors = useMemo(() => {
    return doctors.filter((doctor) => {
      const searchText = `
        ${doctor.name}
        ${doctor.doctorId}
        ${doctor.specialization}
        ${doctor.department}
        ${doctor.phone}
        ${doctor.email}
      `.toLowerCase();

      const matchesSearch = searchText.includes(search.toLowerCase());

      const matchesSpecialization =
        specializationFilter === "All" ||
        doctor.specialization === specializationFilter;

      const matchesDepartment =
        departmentFilter === "All" || doctor.department === departmentFilter;

      const matchesAvailability =
        availabilityFilter === "All" ||
        doctor.availability === availabilityFilter;

      return (
        matchesSearch &&
        matchesSpecialization &&
        matchesDepartment &&
        matchesAvailability
      );
    });
  }, [
    doctors,
    search,
    specializationFilter,
    departmentFilter,
    availabilityFilter,
  ]);

  // ============================
  // Sorting
  // ============================

  const sortedDoctors = useMemo(() => {
    const data = [...filteredDoctors];

    data.sort((a, b) => {
      let valueA = "";
      let valueB = "";

      if (sortBy === "name") {
        valueA = a.name.toLowerCase();
        valueB = b.name.toLowerCase();
      }

      if (sortBy === "specialization") {
        valueA = a.specialization.toLowerCase();

        valueB = b.specialization.toLowerCase();
      }

      if (sortBy === "department") {
        valueA = a.department.toLowerCase();

        valueB = b.department.toLowerCase();
      }

      if (sortBy === "experience") {
        return sortOrder === "asc"
          ? a.experience - b.experience
          : b.experience - a.experience;
      }

      if (sortBy === "availability") {
        valueA = a.availability.toLowerCase();

        valueB = b.availability.toLowerCase();
      }

      if (valueA < valueB) {
        return sortOrder === "asc" ? -1 : 1;
      }

      if (valueA > valueB) {
        return sortOrder === "asc" ? 1 : -1;
      }

      return 0;
    });

    return data;
  }, [filteredDoctors, sortBy, sortOrder]);

  const totalPages = Math.ceil(sortedDoctors.length / itemsPerPage);

  const startIndex = (currentPage - 1) * itemsPerPage;

  const paginatedDoctors = sortedDoctors.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  // Reset pagination
  useEffect(() => {
    setCurrentPage(1);
  }, [
    search,
    specializationFilter,
    departmentFilter,
    availabilityFilter,
    sortBy,
    sortOrder,
  ]);

  // ============================
  // Clear Filters
  // ============================

  const clearFilters = () => {
    setSearch("");
    setSpecializationFilter("All");
    setDepartmentFilter("All");
    setAvailabilityFilter("All");
    setSortBy("name");
    setSortOrder("asc");
    setCurrentPage(1);
  };

  return (
    <div className="min-h-full bg-slate-50 p-6 lg:p-8">
      {/* ========================
          Header
      ========================= */}

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Doctors</h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage doctors and their professional information
          </p>
        </div>

        <button
          onClick={() => navigate("/doctors/add")}
          className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
        >
          + Add Doctor
        </button>
      </div>

      {/* ========================
          Main Card
      ========================= */}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {/* ========================
            Search & Filters
        ========================= */}

        <div className="border-b border-slate-200 p-5">
          <div className="flex flex-col gap-4">
            {/* Search */}

            <div className="relative w-full">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                🔍
              </span>

              <input
                type="text"
                placeholder="Search by doctor name, ID, specialization..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {/* Filters */}

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-6">
              {/* Specialization */}

              <select
                value={specializationFilter}
                onChange={(e) => setSpecializationFilter(e.target.value)}
                className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-600 outline-none focus:border-blue-500"
              >
                <option value="All">All Specializations</option>

                <option value="Cardiologist">Cardiologist</option>

                <option value="Neurologist">Neurologist</option>

                <option value="Orthopedic">Orthopedic</option>

                <option value="Pediatrician">Pediatrician</option>

                <option value="General Physician">General Physician</option>
              </select>

              {/* Department */}

              <select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-600 outline-none focus:border-blue-500"
              >
                <option value="All">All Departments</option>

                <option value="Cardiology">Cardiology</option>

                <option value="Neurology">Neurology</option>

                <option value="Orthopedics">Orthopedics</option>

                <option value="Pediatrics">Pediatrics</option>

                <option value="General Medicine">General Medicine</option>
              </select>

              {/* Availability */}

              <select
                value={availabilityFilter}
                onChange={(e) => setAvailabilityFilter(e.target.value)}
                className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-600 outline-none focus:border-blue-500"
              >
                <option value="All">All Availability</option>

                <option value="Available">Available</option>

                <option value="Unavailable">Unavailable</option>
              </select>

              {/* Sort By */}

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-600 outline-none focus:border-blue-500"
              >
                <option value="name">Sort by Name</option>

                <option value="specialization">Sort by Specialization</option>

                <option value="department">Sort by Department</option>

                <option value="experience">Sort by Experience</option>

                <option value="availability">Sort by Availability</option>
              </select>

              {/* Order */}

              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-600 outline-none focus:border-blue-500"
              >
                <option value="asc">Ascending ↑</option>

                <option value="desc">Descending ↓</option>
              </select>

              {/* Clear */}

              <button
                onClick={clearFilters}
                className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* ========================
            Result Count
        ========================= */}

        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3">
          <p className="text-sm text-slate-500">
            Showing{" "}
            <span className="font-semibold text-slate-700">
              {sortedDoctors.length}
            </span>{" "}
            doctors
          </p>
        </div>

        {/* ========================
            Loading
        ========================= */}

        {loading ? (
          <div className="p-12 text-center">
            <div className="mx-auto mb-3 h-7 w-7 animate-spin rounded-full border-2 border-slate-200 border-t-blue-600" />

            <p className="text-sm text-slate-500">Loading doctors...</p>
          </div>
        ) : paginatedDoctors.length === 0 ? (
          /* Empty */

          <div className="p-12 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-2xl">
              👨‍⚕️
            </div>

            <h3 className="text-sm font-semibold text-slate-800">
              No doctors found
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Try changing your search or filters.
            </p>

            <button
              onClick={clearFilters}
              className="mt-4 text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              Clear filters
            </button>
          </div>
        ) : (
          /* ========================
              Table
          ========================= */

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1150px]">
              <thead className="bg-slate-50">
                <tr className="border-b border-slate-200 text-left">
                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Doctor
                  </th>

                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Specialization
                  </th>

                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Department
                  </th>

                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Experience
                  </th>

                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Phone
                  </th>

                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Availability
                  </th>

                  <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {paginatedDoctors.map((doctor) => (
                  <tr
                    key={doctor.id}
                    className="border-b border-slate-100 transition last:border-0 hover:bg-slate-50"
                  >
                    {/* Doctor */}

                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-sm font-bold text-blue-600">
                          {doctor.name.charAt(0).toUpperCase()}
                        </div>

                        <div>
                          <p className="text-sm font-semibold text-slate-800">
                            {doctor.name}
                          </p>

                          <p className="mt-0.5 text-xs text-slate-400">
                            {doctor.doctorId}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Specialization */}

                    <td className="px-5 py-4">
                      <span className="text-sm text-slate-600">
                        {doctor.specialization}
                      </span>
                    </td>

                    {/* Department */}

                    <td className="px-5 py-4">
                      <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                        {doctor.department}
                      </span>
                    </td>

                    {/* Experience */}

                    <td className="px-5 py-4">
                      <span className="text-sm text-slate-600">
                        {doctor.experience} yrs
                      </span>
                    </td>

                    {/* Phone */}

                    <td className="px-5 py-4">
                      <span className="text-sm text-slate-600">
                        {doctor.phone}
                      </span>
                    </td>

                    {/* Availability */}

                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                          doctor.availability === "Available"
                            ? "bg-green-50 text-green-600"
                            : "bg-red-50 text-red-600"
                        }`}
                      >
                        {doctor.availability}
                      </span>
                    </td>

                    {/* Actions */}

                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => navigate(`/doctors/view/${doctor.id}`)}
                          className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-100"
                        >
                          View
                        </button>

                        <button
                          onClick={() => navigate(`/doctors/edit/${doctor.id}`)}
                          className="rounded-lg border border-blue-200 px-3 py-1.5 text-xs font-medium text-blue-600 transition hover:bg-blue-50"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() => handleDelete(doctor.id)}
                          className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-50"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ========================
            Pagination
        ========================= */}

        {totalPages > 0 && (
          <div className="flex flex-col gap-3 border-t border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-500">
              Showing{" "}
              <span className="font-medium text-slate-700">
                {startIndex + 1}
              </span>{" "}
              to{" "}
              <span className="font-medium text-slate-700">
                {Math.min(startIndex + itemsPerPage, sortedDoctors.length)}
              </span>{" "}
              of{" "}
              <span className="font-medium text-slate-700">
                {sortedDoctors.length}
              </span>
            </p>

            <div className="flex items-center gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => prev - 1)}
                className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Previous
              </button>

              {Array.from({ length: totalPages }, (_, index) => index + 1).map(
                (page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`h-8 min-w-8 rounded-lg px-2 text-sm font-medium ${
                      currentPage === page
                        ? "bg-blue-600 text-white"
                        : "border border-slate-300 bg-white text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {page}
                  </button>
                ),
              )}

              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((prev) => prev + 1)}
                className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorList;

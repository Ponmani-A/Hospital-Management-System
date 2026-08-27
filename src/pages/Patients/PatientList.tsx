import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import type { Patient } from "../../types";

const PatientList = () => {
  const navigate = useNavigate();

  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");

  const [genderFilter, setGenderFilter] = useState("All");

  const [bloodGroupFilter, setBloodGroupFilter] = useState("All");

  const [ageFilter, setAgeFilter] = useState("All");

  const [sortBy, setSortBy] = useState("name");

  const [sortOrder, setSortOrder] = useState("asc");

  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 5;

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        setLoading(true);

        const response = await api.get<Patient[]>("/patients");

        setPatients(response.data);
      } catch (error) {
        console.error("Failed to fetch patients:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
  }, []);

  const handleDelete = async (id?: string | number) => {
    if (!id) return;

    try {
      await api.delete(`/patients/${id}`);

      setPatients((prev) =>
        prev.filter((patient) => String(patient.id) !== String(id)),
      );
    } catch (error) {
      console.error("Failed to delete patient:", error);

      alert("Failed to delete patient");
    }
  };

  // -----------------------------
  // Filter Patients
  // -----------------------------

  const filteredPatients = useMemo(() => {
    return patients.filter((patient) => {
      // Search
      const searchText = `
        ${patient.name}
        ${patient.patientId}
        ${patient.phone}
        ${patient.email}
      `.toLowerCase();

      const matchesSearch = searchText.includes(search.toLowerCase());

      // Gender
      const matchesGender =
        genderFilter === "All" || patient.gender === genderFilter;

      // Blood Group
      const matchesBloodGroup =
        bloodGroupFilter === "All" || patient.bloodGroup === bloodGroupFilter;

      // Age
      let matchesAge = true;

      if (ageFilter === "Under 18") {
        matchesAge = patient.age < 18;
      }

      if (ageFilter === "18 - 40") {
        matchesAge = patient.age >= 18 && patient.age <= 40;
      }

      if (ageFilter === "41 - 60") {
        matchesAge = patient.age >= 41 && patient.age <= 60;
      }

      if (ageFilter === "Above 60") {
        matchesAge = patient.age > 60;
      }

      return matchesSearch && matchesGender && matchesBloodGroup && matchesAge;
    });
  }, [patients, search, genderFilter, bloodGroupFilter, ageFilter]);

  const sortedPatients = useMemo(() => {
    const data = [...filteredPatients];

    data.sort((a, b) => {
      if (sortBy === "name") {
        const nameA = a.name.toLowerCase();

        const nameB = b.name.toLowerCase();

        if (nameA < nameB) {
          return sortOrder === "asc" ? -1 : 1;
        }

        if (nameA > nameB) {
          return sortOrder === "asc" ? 1 : -1;
        }

        return 0;
      }

      if (sortBy === "age") {
        return sortOrder === "asc" ? a.age - b.age : b.age - a.age;
      }

      if (sortBy === "gender") {
        const genderA = a.gender.toLowerCase();

        const genderB = b.gender.toLowerCase();

        if (genderA < genderB) {
          return sortOrder === "asc" ? -1 : 1;
        }

        if (genderA > genderB) {
          return sortOrder === "asc" ? 1 : -1;
        }

        return 0;
      }

      if (sortBy === "bloodGroup") {
        const bloodA = a.bloodGroup.toLowerCase();

        const bloodB = b.bloodGroup.toLowerCase();

        if (bloodA < bloodB) {
          return sortOrder === "asc" ? -1 : 1;
        }

        if (bloodA > bloodB) {
          return sortOrder === "asc" ? 1 : -1;
        }

        return 0;
      }

      return 0;
    });

    return data;
  }, [filteredPatients, sortBy, sortOrder]);

  // -----------------------------
  // Pagination
  // -----------------------------

  const totalPages = Math.ceil(sortedPatients.length / itemsPerPage);

  const startIndex = (currentPage - 1) * itemsPerPage;

  const paginatedPatients = sortedPatients.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  // -----------------------------
  // Reset page when filter changes
  // -----------------------------

  useEffect(() => {
    setCurrentPage(1);
  }, [search, genderFilter, bloodGroupFilter, ageFilter, sortBy, sortOrder]);

  // -----------------------------
  // Clear Filters
  // -----------------------------

  const clearFilters = () => {
    setSearch("");
    setGenderFilter("All");
    setBloodGroupFilter("All");
    setAgeFilter("All");
    setSortBy("name");
    setSortOrder("asc");
    setCurrentPage(1);
  };

  return (
    <div className="min-h-full bg-slate-50 p-6 lg:p-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Patients</h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage patient information and records
          </p>
        </div>

        <button
          onClick={() => navigate("/patients/add")}
          className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
        >
          + Add Patient
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 p-5">
          <div className="flex flex-col gap-4">
            <div className="relative w-full">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                🔍
              </span>

              <input
                type="text"
                placeholder="Search by patient name, ID, phone or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
              <select
                value={genderFilter}
                onChange={(e) => setGenderFilter(e.target.value)}
                className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-600 outline-none focus:border-blue-500"
              >
                <option value="All">All Gender</option>

                <option value="Male">Male</option>

                <option value="Female">Female</option>

                <option value="Other">Other</option>
              </select>

              <select
                value={bloodGroupFilter}
                onChange={(e) => setBloodGroupFilter(e.target.value)}
                className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-600 outline-none focus:border-blue-500"
              >
                <option value="All">All Blood Groups</option>

                <option value="A+">A+</option>

                <option value="A-">A-</option>

                <option value="B+">B+</option>

                <option value="B-">B-</option>

                <option value="AB+">AB+</option>

                <option value="AB-">AB-</option>

                <option value="O+">O+</option>

                <option value="O-">O-</option>
              </select>

              {/* Age */}

              <select
                value={ageFilter}
                onChange={(e) => setAgeFilter(e.target.value)}
                className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-600 outline-none focus:border-blue-500"
              >
                <option value="All">All Ages</option>

                <option value="Under 18">Under 18</option>

                <option value="18 - 40">18 - 40</option>

                <option value="41 - 60">41 - 60</option>

                <option value="Above 60">Above 60</option>
              </select>

              {/* Sort By */}

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-600 outline-none focus:border-blue-500"
              >
                <option value="name">Sort by Name</option>

                <option value="age">Sort by Age</option>

                <option value="gender">Sort by Gender</option>

                <option value="bloodGroup">Sort by Blood Group</option>
              </select>

              {/* Sort Order */}

              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-600 outline-none focus:border-blue-500"
              >
                <option value="asc">Ascending ↑</option>

                <option value="desc">Descending ↓</option>
              </select>
            </div>

            {/* Clear */}

            {(search ||
              genderFilter !== "All" ||
              bloodGroupFilter !== "All" ||
              ageFilter !== "All") && (
              <div>
                <button
                  onClick={clearFilters}
                  className="text-sm font-medium text-blue-600 hover:text-blue-700"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3">
          <p className="text-sm text-slate-500">
            Showing{" "}
            <span className="font-semibold text-slate-700">
              {sortedPatients.length}
            </span>{" "}
            patients
          </p>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <div className="mx-auto mb-3 h-7 w-7 animate-spin rounded-full border-2 border-slate-200 border-t-blue-600" />

            <p className="text-sm text-slate-500">Loading patients...</p>
          </div>
        ) : paginatedPatients.length === 0 ? (
          <div className="p-12 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-2xl">
              👤
            </div>

            <h3 className="text-sm font-semibold text-slate-800">
              No patients found
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
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px]">
              <thead className="bg-slate-50">
                <tr className="border-b border-slate-200 text-left">
                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Patient
                  </th>

                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Age
                  </th>

                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Gender
                  </th>

                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Phone
                  </th>

                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Blood Group
                  </th>

                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Email
                  </th>

                  <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {paginatedPatients.map((patient) => (
                  <tr
                    key={patient.id}
                    className="border-b border-slate-100 transition last:border-0 hover:bg-slate-50"
                  >
                    {/* Patient */}

                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-sm font-bold text-blue-600">
                          {patient.name.charAt(0).toUpperCase()}
                        </div>

                        <div>
                          <p className="text-sm font-semibold text-slate-800">
                            {patient.name}
                          </p>

                          <p className="mt-0.5 text-xs text-slate-400">
                            {patient.patientId}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Age */}

                    <td className="px-5 py-4">
                      <span className="text-sm text-slate-600">
                        {patient.age} yrs
                      </span>
                    </td>

                    {/* Gender */}

                    <td className="px-5 py-4">
                      <span className="text-sm text-slate-600">
                        {patient.gender}
                      </span>
                    </td>

                    {/* Phone */}

                    <td className="px-5 py-4">
                      <span className="text-sm text-slate-600">
                        {patient.phone}
                      </span>
                    </td>

                    {/* Blood Group */}

                    <td className="px-5 py-4">
                      <span className="inline-flex rounded-md bg-red-50 px-2.5 py-1 text-xs font-bold text-red-600">
                        {patient.bloodGroup}
                      </span>
                    </td>

                    {/* Email */}

                    <td className="px-5 py-4">
                      <span className="text-sm text-slate-600">
                        {patient.email}
                      </span>
                    </td>

                    {/* Actions */}

                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        {/* View */}

                        <button
                          onClick={() =>
                            navigate(`/patients/view/${patient.id}`)
                          }
                          className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-100"
                        >
                          View
                        </button>

                        {/* Edit */}

                        <button
                          onClick={() =>
                            navigate(`/patients/edit/${patient.id}`)
                          }
                          className="rounded-lg border border-blue-200 px-3 py-1.5 text-xs font-medium text-blue-600 transition hover:bg-blue-50"
                        >
                          Edit
                        </button>

                        {/* Delete */}

                        <button
                          onClick={() => handleDelete(patient.id)}
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

        {totalPages > 0 && (
          <div className="flex flex-col gap-3 border-t border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            {/* Info */}

            <p className="text-sm text-slate-500">
              Showing{" "}
              <span className="font-medium text-slate-700">
                {startIndex + 1}
              </span>{" "}
              to{" "}
              <span className="font-medium text-slate-700">
                {Math.min(startIndex + itemsPerPage, sortedPatients.length)}
              </span>{" "}
              of{" "}
              <span className="font-medium text-slate-700">
                {sortedPatients.length}
              </span>
            </p>

            {/* Buttons */}

            <div className="flex items-center gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => prev - 1)}
                className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Previous
              </button>

              {/* Page Numbers */}

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
                className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
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

export default PatientList;

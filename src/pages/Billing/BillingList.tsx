import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import type { Bill, Patient } from "../../types";

const BillingList = () => {
  const navigate = useNavigate();

  const [bills, setBills] = useState<Bill[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortBy, setSortBy] = useState("date");
  const [sortOrder, setSortOrder] = useState("desc");

  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 5;

  // ============================
  // Fetch Bills & Patients
  // ============================

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const [billResponse, patientResponse] = await Promise.all([
          api.get<Bill[]>("/bills"),
          api.get<Patient[]>("/patients"),
        ]);

        setBills(billResponse.data);
        setPatients(patientResponse.data);
      } catch (error) {
        console.error("Failed to fetch billing data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // ============================
  // Patient Name
  // ============================

  const getPatientName = (patientId: string | number) => {
    const patient = patients.find(
      (item) =>
        String(item.id) === String(patientId) ||
        String(item.patientId) === String(patientId),
    );

    return patient?.name || "Unknown Patient";
  };

  // ============================
  // Delete Bill
  // ============================

  const handleDelete = async (id?: string | number) => {
    if (!id) return;

    const confirmed = window.confirm(
      "Are you sure you want to delete this bill?",
    );

    if (!confirmed) return;

    try {
      await api.delete(`/bills/${id}`);

      setBills((prev) => prev.filter((bill) => String(bill.id) !== String(id)));
    } catch (error) {
      console.error(error);

      alert("Failed to delete bill.");
    }
  };

  // ============================
  // Filter
  // ============================

  const filteredBills = useMemo(() => {
    return bills.filter((bill) => {
      const patientName = getPatientName(bill.patientId);

      const searchText = `
        ${bill.billId}
        ${patientName}
        ${bill.paymentStatus}
      `.toLowerCase();

      const matchesSearch = searchText.includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === "All" || bill.paymentStatus === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [bills, patients, search, statusFilter]);

  // ============================
  // Sorting
  // ============================

  const sortedBills = useMemo(() => {
    const data = [...filteredBills];

    data.sort((a, b) => {
      let valueA = "";
      let valueB = "";

      if (sortBy === "date") {
        valueA = a.date;
        valueB = b.date;
      }

      if (sortBy === "patient") {
        valueA = getPatientName(a.patientId).toLowerCase();

        valueB = getPatientName(b.patientId).toLowerCase();
      }

      if (sortBy === "status") {
        valueA = a.paymentStatus.toLowerCase();

        valueB = b.paymentStatus.toLowerCase();
      }

      if (sortBy === "total") {
        return sortOrder === "asc"
          ? a.totalAmount - b.totalAmount
          : b.totalAmount - a.totalAmount;
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
  }, [filteredBills, patients, sortBy, sortOrder]);

  // ============================
  // Pagination
  // ============================

  const totalPages = Math.ceil(sortedBills.length / itemsPerPage);

  const startIndex = (currentPage - 1) * itemsPerPage;

  const paginatedBills = sortedBills.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter, sortBy, sortOrder]);

  // ============================
  // Status Style
  // ============================

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "Paid":
        return "bg-green-50 text-green-600";

      case "Pending":
        return "bg-red-50 text-red-600";

      case "Partially Paid":
        return "bg-orange-50 text-orange-600";

      default:
        return "bg-slate-100 text-slate-600";
    }
  };

  // ============================
  // Clear Filters
  // ============================

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("All");
    setSortBy("date");
    setSortOrder("desc");
    setCurrentPage(1);
  };

  // ============================
  // UI
  // ============================

  return (
    <div className="min-h-full bg-slate-50 p-6 lg:p-8">
      {/* Header */}

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Billing</h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage patient bills and payment information
          </p>
        </div>

        <button
          onClick={() => navigate("/billing/add")}
          className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
        >
          + Create Bill
        </button>
      </div>

      {/* Main Card */}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {/* Filters */}

        <div className="border-b border-slate-200 p-5">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
            {/* Search */}

            <div className="relative md:col-span-2">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                🔍
              </span>

              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search bill ID or patient..."
                className="w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {/* Status */}

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-600 outline-none focus:border-blue-500"
            >
              <option value="All">All Payment Status</option>

              <option value="Paid">Paid</option>

              <option value="Pending">Pending</option>

              <option value="Partially Paid">Partially Paid</option>
            </select>

            {/* Clear */}

            <button
              onClick={clearFilters}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              Clear Filters
            </button>
          </div>

          {/* Sort */}

          <div className="mt-3 flex flex-wrap gap-3">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-600 outline-none focus:border-blue-500"
            >
              <option value="date">Sort by Date</option>

              <option value="patient">Sort by Patient</option>

              <option value="total">Sort by Total</option>

              <option value="status">Sort by Status</option>
            </select>

            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-600 outline-none focus:border-blue-500"
            >
              <option value="asc">Ascending ↑</option>

              <option value="desc">Descending ↓</option>
            </select>
          </div>
        </div>

        {/* Count */}

        <div className="border-b border-slate-100 px-5 py-3">
          <p className="text-sm text-slate-500">
            Total{" "}
            <span className="font-semibold text-slate-700">
              {sortedBills.length}
            </span>{" "}
            bills
          </p>
        </div>

        {/* Loading */}

        {loading ? (
          <div className="p-12 text-center">
            <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-blue-600" />

            <p className="text-sm text-slate-500">Loading bills...</p>
          </div>
        ) : paginatedBills.length === 0 ? (
          <div className="p-12 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-2xl">
              ₹
            </div>

            <h3 className="text-sm font-semibold text-slate-800">
              No bills found
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Try changing your search or filters.
            </p>
          </div>
        ) : (
          /* Table */

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px]">
              <thead className="bg-slate-50">
                <tr className="border-b border-slate-200 text-left">
                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Bill ID
                  </th>

                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Patient
                  </th>

                  <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Consultation
                  </th>

                  <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Medicine
                  </th>

                  <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Lab / Test
                  </th>

                  <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Other
                  </th>

                  <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Total
                  </th>

                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Payment
                  </th>

                  <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {paginatedBills.map((bill) => (
                  <tr
                    key={bill.id}
                    className="border-b border-slate-100 hover:bg-slate-50"
                  >
                    {/* Bill ID */}

                    <td className="px-5 py-4">
                      <p className="text-sm font-semibold text-slate-800">
                        {bill.billId}
                      </p>

                      <p className="mt-1 text-xs text-slate-400">{bill.date}</p>
                    </td>

                    {/* Patient */}

                    <td className="px-5 py-4">
                      <p className="text-sm font-medium text-slate-800">
                        {getPatientName(bill.patientId)}
                      </p>
                    </td>

                    {/* Consultation */}

                    <td className="px-5 py-4 text-right text-sm text-slate-600">
                      ₹{bill.consultationCharges.toLocaleString("en-IN")}
                    </td>

                    {/* Medicine */}

                    <td className="px-5 py-4 text-right text-sm text-slate-600">
                      ₹{bill.medicineCharges.toLocaleString("en-IN")}
                    </td>

                    {/* Lab */}

                    <td className="px-5 py-4 text-right text-sm text-slate-600">
                      ₹{bill.labCharges.toLocaleString("en-IN")}
                    </td>

                    {/* Other */}

                    <td className="px-5 py-4 text-right text-sm text-slate-600">
                      ₹{bill.otherCharges.toLocaleString("en-IN")}
                    </td>

                    {/* Total */}

                    <td className="px-5 py-4 text-right">
                      <p className="text-sm font-bold text-slate-800">
                        ₹{bill.totalAmount.toLocaleString("en-IN")}
                      </p>
                    </td>

                    {/* Status */}

                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusStyle(
                          bill.paymentStatus,
                        )}`}
                      >
                        {bill.paymentStatus}
                      </span>
                    </td>

                    {/* Actions */}

                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => navigate(`/billing/view/${bill.id}`)}
                          className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100"
                        >
                          View
                        </button>

                        <button
                          onClick={() => navigate(`/billing/edit/${bill.id}`)}
                          className="rounded-lg border border-blue-200 px-3 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-50"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() => handleDelete(bill.id)}
                          className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
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

        {/* Pagination */}

        {totalPages > 0 && (
          <div className="flex flex-col gap-3 border-t border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-500">
              Showing{" "}
              <span className="font-medium text-slate-700">
                {startIndex + 1}
              </span>{" "}
              to{" "}
              <span className="font-medium text-slate-700">
                {Math.min(startIndex + itemsPerPage, sortedBills.length)}
              </span>{" "}
              of{" "}
              <span className="font-medium text-slate-700">
                {sortedBills.length}
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

export default BillingList;

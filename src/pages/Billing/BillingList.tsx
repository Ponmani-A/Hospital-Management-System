import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../services/api";
import type { Bill, Patient } from "../../types";
import DownloadBillButton from "../Billing/DownloadBillButton";

const BillList = () => {
  const navigate = useNavigate();

  const [bills, setBills] = useState<Bill[]>([]);

  const [patients, setPatients] = useState<Patient[]>([]);

  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] = useState("All");

  const [currentPage, setCurrentPage] = useState(1);

  const [loading, setLoading] = useState(true);

  const itemsPerPage = 5;

  // ==========================
  // Fetch Data
  // ==========================

  const fetchData = async () => {
    try {
      setLoading(true);

      const [billsResponse, patientsResponse] = await Promise.all([
        api.get("/bills"),
        api.get("/patients"),
      ]);

      setBills(Array.isArray(billsResponse.data) ? billsResponse.data : []);

      setPatients(
        Array.isArray(patientsResponse.data) ? patientsResponse.data : [],
      );
    } catch (error) {
      console.error("Billing API Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ==========================
  // Get Patient
  // ==========================

  const getPatient = (patientId: string | number) => {
    return patients.find(
      (patient) =>
        String(patient.patientId) === String(patientId) ||
        String(patient.id) === String(patientId),
    );
  };

  // ==========================
  // Search + Filter
  // ==========================

  const filteredBills = useMemo(() => {
    return bills.filter((bill) => {
      const patient = getPatient(bill.patientId);

      const searchText = search.toLowerCase().trim();

      const matchesSearch =
        searchText === "" ||
        String(bill.billId).toLowerCase().includes(searchText) ||
        String(bill.patientId).toLowerCase().includes(searchText) ||
        patient?.name?.toLowerCase().includes(searchText);

      const matchesStatus =
        statusFilter === "All" || bill.paymentStatus === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [bills, patients, search, statusFilter]);

  // ==========================
  // Pagination
  // ==========================

  const totalPages = Math.ceil(filteredBills.length / itemsPerPage);

  const startIndex = (currentPage - 1) * itemsPerPage;

  const paginatedBills = filteredBills.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  // ==========================
  // Delete
  // ==========================

  const handleDelete = async (id?: string | number) => {
    if (id === undefined) {
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to delete this bill?",
    );

    if (!confirmed) {
      return;
    }

    try {
      await api.delete(`/bills/${String(id)}`);

      setBills((prev) => prev.filter((bill) => String(bill.id) !== String(id)));
    } catch (error) {
      console.error("Delete bill error:", error);

      alert("Failed to delete bill.");
    }
  };

  // ==========================
  // Edit
  // ==========================

  const handleEdit = (id?: string | number) => {
    if (id === undefined) {
      return;
    }

    navigate(`/billing/edit/${String(id)}`);
  };

  // ==========================
  // Loading
  // ==========================

  if (loading) {
    return (
      <div className="flex min-h-[500px] items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-blue-600" />

          <p className="text-sm text-slate-500">Loading bills...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-slate-50 p-6 lg:p-8">
      {/* Header */}

      <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Billing</h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage patient bills and payments
          </p>
        </div>

        <Link
          to="/billing/add"
          className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700"
        >
          + Create Bill
        </Link>
      </div>

      {/* Search / Filter */}

      <div className="mb-5 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Search
            </label>

            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by bill ID or patient..."
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Payment Status
            </label>

            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="All">All</option>

              <option value="Paid">Paid</option>

              <option value="Pending">Pending</option>

              <option value="Partially Paid">Partially Paid</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px]">
            <thead className="bg-slate-50">
              <tr className="border-b border-slate-200 text-left">
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Bill ID
                </th>

                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Patient
                </th>

                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Date
                </th>

                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Consultation
                </th>

                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Medicine
                </th>

                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Lab/Test
                </th>

                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Other
                </th>

                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Total
                </th>

                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Status
                </th>

                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {paginatedBills.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-6 py-12 text-center">
                    <p className="text-sm text-slate-500">No bills found.</p>
                  </td>
                </tr>
              ) : (
                paginatedBills.map((bill) => {
                  const patient = getPatient(bill.patientId);

                  return (
                    <tr
                      key={String(bill.id ?? bill.billId)}
                      className="border-b border-slate-100 last:border-0 hover:bg-slate-50"
                    >
                      {/* Bill ID */}

                      <td className="px-6 py-4">
                        <span className="text-sm font-semibold text-blue-600">
                          {bill.billId}
                        </span>
                      </td>

                      {/* Patient */}

                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-medium text-slate-800">
                            {patient?.name || "Unknown Patient"}
                          </p>

                          <p className="mt-0.5 text-xs text-slate-500">
                            ID: {String(bill.patientId)}
                          </p>
                        </div>
                      </td>

                      {/* Date */}

                      <td className="px-6 py-4 text-sm text-slate-600">
                        {bill.date || "N/A"}
                      </td>

                      {/* Consultation */}

                      <td className="px-6 py-4 text-sm text-slate-600">
                        ₹{Number(bill.consultationFee).toFixed(2)}
                      </td>

                      {/* Medicine */}

                      <td className="px-6 py-4 text-sm text-slate-600">
                        ₹{Number(bill.medicineCharges).toFixed(2)}
                      </td>

                      {/* Lab */}

                      <td className="px-6 py-4 text-sm text-slate-600">
                        ₹{Number(bill.labCharges).toFixed(2)}
                      </td>

                      {/* Other */}

                      <td className="px-6 py-4 text-sm text-slate-600">
                        ₹{Number(bill.otherCharges).toFixed(2)}
                      </td>

                      {/* Total */}

                      <td className="px-6 py-4">
                        <span className="text-sm font-bold text-slate-900">
                          ₹{Number(bill.totalAmount).toFixed(2)}
                        </span>
                      </td>

                      {/* Status */}

                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                            bill.paymentStatus === "Paid"
                              ? "bg-green-50 text-green-700"
                              : bill.paymentStatus === "Pending"
                                ? "bg-orange-50 text-orange-700"
                                : "bg-blue-50 text-blue-700"
                          }`}
                        >
                          {bill.paymentStatus}
                        </span>
                      </td>

                      {/* Actions */}

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Link
                            to={`/billing/view/${String(bill.id)}`}
                            className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-50"
                          >
                            View
                          </Link>

                          <button
                            type="button"
                            onClick={() => handleEdit(bill.id)}
                            className="rounded-lg border border-blue-200 px-3 py-1.5 text-xs font-medium text-blue-600 transition hover:bg-blue-50"
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDelete(bill.id)}
                            className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-50"
                          >
                            Delete
                          </button>

                          <DownloadBillButton bill={bill} patient={patient} />
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}

        {totalPages > 1 && (
          <div className="flex flex-col gap-3 border-t border-slate-200 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-500">
              Showing {startIndex + 1}–
              {Math.min(startIndex + itemsPerPage, filteredBills.length)} of{" "}
              {filteredBills.length} bills
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((page) => Math.max(page - 1, 1))}
                className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Previous
              </button>

              {Array.from(
                {
                  length: totalPages,
                },
                (_, index) => index + 1,
              ).map((page) => (
                <button
                  key={page}
                  type="button"
                  onClick={() => setCurrentPage(page)}
                  className={`h-8 w-8 rounded-lg text-sm font-medium ${
                    currentPage === page
                      ? "bg-blue-600 text-white"
                      : "border border-slate-300 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {page}
                </button>
              ))}

              <button
                type="button"
                disabled={currentPage === totalPages}
                onClick={() =>
                  setCurrentPage((page) => Math.min(page + 1, totalPages))
                }
                className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
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

export default BillList;

import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../services/api";
import type { Bill, Patient } from "../../types";

const BillingView = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [bill, setBill] = useState<Bill | null>(null);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const billResponse = await api.get<Bill>(`/bills/${id}`);

        const billData = billResponse.data;

        setBill(billData);

        const patientResponse = await api.get<Patient[]>("/patients");

        const foundPatient = patientResponse.data.find(
          (item) =>
            String(item.id) === String(billData.patientId) ||
            String(item.patientId) === String(billData.patientId),
        );

        setPatient(foundPatient || null);
      } catch (error) {
        console.error("Failed to load bill:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id]);

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

  const formatAmount = (amount: number) => {
    return amount.toLocaleString("en-IN");
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-blue-600" />

          <p className="text-sm text-slate-500">Loading bill details...</p>
        </div>
      </div>
    );
  }

  if (!bill) {
    return (
      <div className="flex min-h-[400px] items-center justify-center bg-slate-50">
        <div className="text-center">
          <h2 className="text-lg font-semibold text-slate-800">
            Bill not found
          </h2>

          <button
            onClick={() => navigate("/billing")}
            className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Back to Billing
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-slate-50 p-6 lg:p-8">
      {/* Header */}

      <div className="mx-auto mb-6 flex max-w-4xl items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Bill Details</h1>

          <p className="mt-1 text-sm text-slate-500">
            View complete patient billing information
          </p>
        </div>

        <button
          onClick={() => navigate("/billing")}
          className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
        >
          ← Back
        </button>
      </div>

      {/* Bill Card */}

      <div className="mx-auto max-w-4xl overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {/* Bill Header */}

        <div className="border-b border-slate-200 p-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Bill ID
              </p>

              <h2 className="mt-1 text-xl font-bold text-slate-900">
                {bill.billId}
              </h2>
            </div>

            <div className="sm:text-right">
              <p className="text-xs text-slate-400">Billing Date</p>

              <p className="mt-1 text-sm font-semibold text-slate-700">
                {bill.date}
              </p>

              <span
                className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusStyle(
                  bill.paymentStatus,
                )}`}
              >
                {bill.paymentStatus}
              </span>
            </div>
          </div>
        </div>

        {/* Patient */}

        <div className="border-b border-slate-200 p-6">
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">
            Patient Information
          </h3>

          <div className="rounded-lg border border-slate-200 bg-slate-50 p-5">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-lg font-semibold text-blue-600">
                {patient?.name?.charAt(0).toUpperCase() || "P"}
              </div>

              <div>
                <p className="text-base font-semibold text-slate-800">
                  {patient?.name || "Unknown Patient"}
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Patient ID: {patient?.patientId || "-"}
                </p>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <p className="text-xs text-slate-400">Age</p>

                <p className="mt-1 text-sm font-medium text-slate-700">
                  {patient?.age ?? "-"}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-400">Gender</p>

                <p className="mt-1 text-sm font-medium text-slate-700">
                  {patient?.gender || "-"}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-400">Phone</p>

                <p className="mt-1 text-sm font-medium text-slate-700">
                  {patient?.phone || "-"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Charges */}

        <div className="p-6">
          <h3 className="mb-5 text-sm font-semibold uppercase tracking-wide text-slate-500">
            Billing Summary
          </h3>

          <div className="overflow-hidden rounded-lg border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <span className="text-sm text-slate-600">
                Consultation Charges
              </span>

              <span className="text-sm font-medium text-slate-800">
                ₹{formatAmount(bill.consultationCharges)}
              </span>
            </div>

            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <span className="text-sm text-slate-600">Medicine Charges</span>

              <span className="text-sm font-medium text-slate-800">
                ₹{formatAmount(bill.medicineCharges)}
              </span>
            </div>

            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <span className="text-sm text-slate-600">Lab / Test Charges</span>

              <span className="text-sm font-medium text-slate-800">
                ₹{formatAmount(bill.labCharges)}
              </span>
            </div>

            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <span className="text-sm text-slate-600">Other Charges</span>

              <span className="text-sm font-medium text-slate-800">
                ₹{formatAmount(bill.otherCharges)}
              </span>
            </div>

            {/* Total */}

            <div className="flex items-center justify-between bg-blue-50 px-5 py-5">
              <span className="text-base font-bold text-slate-800">
                Total Amount
              </span>

              <span className="text-2xl font-bold text-blue-600">
                ₹{formatAmount(bill.totalAmount)}
              </span>
            </div>
          </div>

          {/* Actions */}

          <div className="mt-6 flex justify-end gap-3 border-t border-slate-200 pt-5">
            <button
              onClick={() => navigate(`/billing/edit/${bill.id}`)}
              className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Edit Bill
            </button>

            <button
              onClick={() => navigate("/billing")}
              className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              Back to List
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BillingView;

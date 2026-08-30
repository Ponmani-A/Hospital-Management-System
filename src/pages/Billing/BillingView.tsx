import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../services/api";
import type { Bill, Patient } from "../../types";
import DownloadBillButton from "../Billing/DownloadBillButton";

const BillingView = () => {
  const { id } = useParams();

  const navigate = useNavigate();

  const [bill, setBill] = useState<Bill | null>(null);

  const [patient, setPatient] = useState<Patient | undefined>();

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBill = async () => {
      try {
        setLoading(true);

        const [billResponse, patientsResponse] = await Promise.all([
          api.get(`/bills/${String(id)}`),
          api.get("/patients"),
        ]);

        const billData = billResponse.data as Bill;

        const patients = Array.isArray(patientsResponse.data)
          ? patientsResponse.data
          : [];

        const foundPatient = patients.find(
          (item: Patient) =>
            String(item.patientId) === String(billData.patientId) ||
            String(item.id) === String(billData.patientId),
        );

        setBill(billData);
        setPatient(foundPatient);
      } catch (error) {
        console.error("Billing view error:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchBill();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="flex min-h-[500px] items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-blue-600" />

          <p className="text-sm text-slate-500">Loading bill...</p>
        </div>
      </div>
    );
  }

  if (!bill) {
    return (
      <div className="flex min-h-[500px] items-center justify-center bg-slate-50">
        <div className="text-center">
          <h2 className="text-lg font-semibold text-slate-800">
            Bill Not Found
          </h2>

          <button
            type="button"
            onClick={() => navigate("/billing")}
            className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white"
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

      <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <button
            type="button"
            onClick={() => navigate("/billing")}
            className="mb-3 text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            ← Back to Billing
          </button>

          <h1 className="text-2xl font-bold text-slate-900">Bill Details</h1>

          <p className="mt-1 text-sm text-slate-500">
            View complete billing information
          </p>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => navigate(`/billing/edit/${String(bill.id)}`)}
            className="rounded-lg border border-blue-200 bg-white px-4 py-2.5 text-sm font-medium text-blue-600 transition hover:bg-blue-50"
          >
            Edit
          </button>

          <DownloadBillButton bill={bill} patient={patient} />
        </div>
      </div>

      {/* Invoice */}

      <div className="mx-auto max-w-4xl rounded-xl border border-slate-200 bg-white shadow-sm">
        {/* Invoice Header */}

        <div className="border-b border-slate-200 p-6">
          <div className="flex flex-col justify-between gap-5 sm:flex-row">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Hospital Management System
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Patient Billing Invoice
              </p>
            </div>

            <div className="sm:text-right">
              <p className="text-sm text-slate-500">Bill ID</p>

              <p className="text-lg font-bold text-blue-600">{bill.billId}</p>
            </div>
          </div>
        </div>

        {/* Patient Details */}

        <div className="border-b border-slate-200 p-6">
          <h3 className="mb-4 text-base font-semibold text-slate-800">
            Patient Information
          </h3>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Patient Name
              </p>

              <p className="mt-1 text-sm font-medium text-slate-800">
                {patient?.name || "Unknown Patient"}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Patient ID
              </p>

              <p className="mt-1 text-sm font-medium text-slate-800">
                {String(bill.patientId)}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Bill Date
              </p>

              <p className="mt-1 text-sm font-medium text-slate-800">
                {bill.date || "N/A"}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Payment Status
              </p>

              <span
                className={`mt-1 inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                  bill.paymentStatus === "Paid"
                    ? "bg-green-50 text-green-700"
                    : bill.paymentStatus === "Pending"
                      ? "bg-orange-50 text-orange-700"
                      : "bg-blue-50 text-blue-700"
                }`}
              >
                {bill.paymentStatus}
              </span>
            </div>
          </div>
        </div>

        {/* Charges */}

        <div className="p-6">
          <h3 className="mb-4 text-base font-semibold text-slate-800">
            Billing Summary
          </h3>

          <div className="overflow-hidden rounded-lg border border-slate-200">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Description
                  </th>

                  <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Amount
                  </th>
                </tr>
              </thead>

              <tbody>
                <tr className="border-t border-slate-200">
                  <td className="px-5 py-4 text-sm text-slate-700">
                    Consultation Charges
                  </td>

                  <td className="px-5 py-4 text-right text-sm font-medium text-slate-800">
                    ₹{Number(bill.consultationFee).toFixed(2)}
                  </td>
                </tr>

                <tr className="border-t border-slate-200">
                  <td className="px-5 py-4 text-sm text-slate-700">
                    Medicine Charges
                  </td>

                  <td className="px-5 py-4 text-right text-sm font-medium text-slate-800">
                    ₹{Number(bill.medicineCharges).toFixed(2)}
                  </td>
                </tr>

                <tr className="border-t border-slate-200">
                  <td className="px-5 py-4 text-sm text-slate-700">
                    Lab / Test Charges
                  </td>

                  <td className="px-5 py-4 text-right text-sm font-medium text-slate-800">
                    ₹{Number(bill.labCharges).toFixed(2)}
                  </td>
                </tr>

                <tr className="border-t border-slate-200">
                  <td className="px-5 py-4 text-sm text-slate-700">
                    Other Charges
                  </td>

                  <td className="px-5 py-4 text-right text-sm font-medium text-slate-800">
                    ₹{Number(bill.otherCharges).toFixed(2)}
                  </td>
                </tr>

                <tr className="border-t border-slate-300 bg-slate-50">
                  <td className="px-5 py-4 text-base font-bold text-slate-900">
                    Total Amount
                  </td>

                  <td className="px-5 py-4 text-right text-lg font-bold text-blue-600">
                    ₹{Number(bill.totalAmount).toFixed(2)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BillingView;

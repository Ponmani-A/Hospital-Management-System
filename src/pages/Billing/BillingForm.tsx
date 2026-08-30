import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../services/api";
import type { Bill, Patient } from "../../types";

interface BillingFormData {
  billId: string;
  patientId: string;
  date: string;
  consultationFee: string;
  medicineCharges: string;
  labCharges: string;
  otherCharges: string;
  paymentStatus: "Paid" | "Pending" | "Partially Paid";
}

interface FormErrors {
  billId?: string;
  patientId?: string;
  date?: string;
  consultationFee?: string;
  medicineCharges?: string;
  labCharges?: string;
  otherCharges?: string;
}

const BillingForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const isEditMode = Boolean(id);

  const [patients, setPatients] = useState<Patient[]>([]);

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const [errors, setErrors] = useState<FormErrors>({});

  const [formData, setFormData] = useState<BillingFormData>({
    billId: "",
    patientId: "",
    date: new Date().toISOString().split("T")[0],
    consultationFee: "",
    medicineCharges: "",
    labCharges: "",
    otherCharges: "",
    paymentStatus: "Pending",
  });

  // ==========================
  // Fetch Patients
  // ==========================

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const patientResponse = await api.get("/patients");

        const patientData = Array.isArray(patientResponse.data)
          ? patientResponse.data
          : [];

        setPatients(patientData);

        // ==========================
        // Edit Bill
        // ==========================

        if (isEditMode && id) {
          const billResponse = await api.get(`/bills/${String(id)}`);

          const bill = billResponse.data as Bill;

          setFormData({
            billId: String(bill.billId ?? ""),

            patientId: String(bill.patientId ?? ""),

            date: bill.date || new Date().toISOString().split("T")[0],

            consultationFee: String(bill.consultationFee ?? ""),

            medicineCharges: String(bill.medicineCharges ?? ""),

            labCharges: String(bill.labCharges ?? ""),

            otherCharges: String(bill.otherCharges ?? ""),

            paymentStatus: bill.paymentStatus || "Pending",
          });
        }
      } catch (error) {
        console.error("Billing form error:", error);

        alert("Failed to load billing data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, isEditMode]);

  // ==========================
  // Handle Input
  // ==========================

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: undefined,
    }));
  };

  // ==========================
  // Total Amount
  // ==========================

  const totalAmount = useMemo(() => {
    const consultation = Number(formData.consultationFee) || 0;

    const medicine = Number(formData.medicineCharges) || 0;

    const lab = Number(formData.labCharges) || 0;

    const other = Number(formData.otherCharges) || 0;

    return consultation + medicine + lab + other;
  }, [
    formData.consultationFee,
    formData.medicineCharges,
    formData.labCharges,
    formData.otherCharges,
  ]);

  // ==========================
  // Validation
  // ==========================

  const validate = () => {
    const newErrors: FormErrors = {};

    if (!formData.billId.trim()) {
      newErrors.billId = "Bill ID is required.";
    }

    if (!formData.patientId) {
      newErrors.patientId = "Please select a patient.";
    }

    if (!formData.date) {
      newErrors.date = "Date is required.";
    }

    if (formData.consultationFee === "") {
      newErrors.consultationFee = "Consultation charge is required.";
    }

    if (formData.medicineCharges === "") {
      newErrors.medicineCharges = "Medicine charge is required.";
    }

    if (formData.labCharges === "") {
      newErrors.labCharges = "Lab/Test charge is required.";
    }

    if (formData.otherCharges === "") {
      newErrors.otherCharges = "Other charge is required.";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  // ==========================
  // Submit
  // ==========================

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    try {
      setSaving(true);

      const billData = {
        billId: formData.billId.trim(),

        patientId: formData.patientId,

        date: formData.date,

        consultationFee: Number(formData.consultationFee),

        medicineCharges: Number(formData.medicineCharges),

        labCharges: Number(formData.labCharges),

        otherCharges: Number(formData.otherCharges),

        totalAmount: totalAmount,

        paymentStatus: formData.paymentStatus,
      };

      if (isEditMode && id) {
        await api.put(`/bills/${String(id)}`, billData);
      } else {
        await api.post("/bills", billData);
      }

      navigate("/billing");
    } catch (error) {
      console.error("Save bill error:", error);

      alert("Failed to save bill.");
    } finally {
      setSaving(false);
    }
  };

  // ==========================
  // Loading
  // ==========================

  if (loading) {
    return (
      <div className="flex min-h-[500px] items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-blue-600" />

          <p className="text-sm text-slate-500">Loading...</p>
        </div>
      </div>
    );
  }

  // ==========================
  // UI
  // ==========================

  return (
    <div className="min-h-full bg-slate-50 p-6 lg:p-8">
      {/* Header */}

      <div className="mb-7">
        <button
          type="button"
          onClick={() => navigate("/billing")}
          className="mb-3 text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          ← Back to Billing
        </button>

        <h1 className="text-2xl font-bold text-slate-900">
          {isEditMode ? "Edit Bill" : "Create New Bill"}
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          {isEditMode
            ? "Update patient billing information"
            : "Create a new patient bill"}
        </p>
      </div>

      {/* Form */}

      <form onSubmit={handleSubmit} className="mx-auto max-w-4xl">
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
          {/* Basic Details */}

          <div className="border-b border-slate-200 p-6">
            <h2 className="mb-5 text-base font-semibold text-slate-800">
              Bill Information
            </h2>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              {/* Bill ID */}

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Bill ID *
                </label>

                <input
                  type="text"
                  name="billId"
                  value={formData.billId}
                  onChange={handleChange}
                  placeholder="B001"
                  className={`w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition focus:ring-2 focus:ring-blue-100 ${
                    errors.billId
                      ? "border-red-400"
                      : "border-slate-300 focus:border-blue-500"
                  }`}
                />

                {errors.billId && (
                  <p className="mt-1 text-xs text-red-500">{errors.billId}</p>
                )}
              </div>

              {/* Patient */}

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Patient *
                </label>

                <select
                  name="patientId"
                  value={formData.patientId}
                  onChange={handleChange}
                  className={`w-full rounded-lg border bg-white px-3 py-2.5 text-sm outline-none transition focus:ring-2 focus:ring-blue-100 ${
                    errors.patientId
                      ? "border-red-400"
                      : "border-slate-300 focus:border-blue-500"
                  }`}
                >
                  <option value="">Select Patient</option>

                  {patients.map((patient) => (
                    <option
                      key={String(patient.id ?? patient.patientId)}
                      value={String(patient.patientId)}
                    >
                      {patient.name} - {patient.patientId}
                    </option>
                  ))}
                </select>

                {errors.patientId && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.patientId}
                  </p>
                )}
              </div>

              {/* Date */}

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Bill Date *
                </label>

                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  className={`w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition focus:ring-2 focus:ring-blue-100 ${
                    errors.date
                      ? "border-red-400"
                      : "border-slate-300 focus:border-blue-500"
                  }`}
                />

                {errors.date && (
                  <p className="mt-1 text-xs text-red-500">{errors.date}</p>
                )}
              </div>

              {/* Payment Status */}

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Payment Status
                </label>

                <select
                  name="paymentStatus"
                  value={formData.paymentStatus}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="Paid">Paid</option>

                  <option value="Pending">Pending</option>

                  <option value="Partially Paid">Partially Paid</option>
                </select>
              </div>
            </div>
          </div>

          {/* Charges */}

          <div className="p-6">
            <h2 className="mb-5 text-base font-semibold text-slate-800">
              Charges
            </h2>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              {/* Consultation */}

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Consultation Charges *
                </label>

                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-500">
                    ₹
                  </span>

                  <input
                    type="number"
                    min="0"
                    name="consultationFee"
                    value={formData.consultationFee}
                    onChange={handleChange}
                    placeholder="0"
                    className="w-full rounded-lg border border-slate-300 py-2.5 pl-8 pr-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                {errors.consultationFee && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.consultationFee}
                  </p>
                )}
              </div>

              {/* Medicine */}

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Medicine Charges *
                </label>

                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-500">
                    ₹
                  </span>

                  <input
                    type="number"
                    min="0"
                    name="medicineCharges"
                    value={formData.medicineCharges}
                    onChange={handleChange}
                    placeholder="0"
                    className="w-full rounded-lg border border-slate-300 py-2.5 pl-8 pr-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                {errors.medicineCharges && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.medicineCharges}
                  </p>
                )}
              </div>

              {/* Lab */}

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Lab / Test Charges *
                </label>

                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-500">
                    ₹
                  </span>

                  <input
                    type="number"
                    min="0"
                    name="labCharges"
                    value={formData.labCharges}
                    onChange={handleChange}
                    placeholder="0"
                    className="w-full rounded-lg border border-slate-300 py-2.5 pl-8 pr-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                {errors.labCharges && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.labCharges}
                  </p>
                )}
              </div>

              {/* Other */}

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Other Charges *
                </label>

                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-500">
                    ₹
                  </span>

                  <input
                    type="number"
                    min="0"
                    name="otherCharges"
                    value={formData.otherCharges}
                    onChange={handleChange}
                    placeholder="0"
                    className="w-full rounded-lg border border-slate-300 py-2.5 pl-8 pr-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                {errors.otherCharges && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.otherCharges}
                  </p>
                )}
              </div>
            </div>

            {/* Total */}

            <div className="mt-6 rounded-xl bg-slate-50 p-5">
              <div className="flex items-center justify-between">
                <span className="text-base font-semibold text-slate-700">
                  Total Amount
                </span>

                <span className="text-2xl font-bold text-blue-600">
                  ₹{totalAmount.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Buttons */}

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => navigate("/billing")}
                className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving
                  ? "Saving..."
                  : isEditMode
                    ? "Update Bill"
                    : "Create Bill"}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default BillingForm;

import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../services/api";
import type { Bill, Patient } from "../../types";

const BillingForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const isEdit = Boolean(id);

  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    billId: "",
    patientId: "",
    consultationCharges: "",
    medicineCharges: "",
    labCharges: "",
    otherCharges: "",
    paymentStatus: "Pending",
    date: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // =========================
  // Load Data
  // =========================

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        const patientResponse = await api.get<Patient[]>("/patients");

        setPatients(patientResponse.data);

        if (id) {
          const response = await api.get<Bill>(`/bills/${id}`);

          const bill = response.data;

          setFormData({
            billId: bill.billId,
            patientId: String(bill.patientId),
            consultationCharges: String(bill.consultationCharges),
            medicineCharges: String(bill.medicineCharges),
            labCharges: String(bill.labCharges),
            otherCharges: String(bill.otherCharges),
            paymentStatus: bill.paymentStatus,
            date: bill.date,
          });
        } else {
          const today = new Date().toISOString().split("T")[0];

          setFormData((prev) => ({
            ...prev,
            billId: `BILL${Date.now().toString().slice(-5)}`,
            date: today,
          }));
        }
      } catch (error) {
        console.error("Failed to load billing data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id]);

  // =========================
  // Handle Change
  // =========================

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
      [name]: "",
    }));
  };

  // =========================
  // Number Change
  // =========================

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (value !== "" && !/^\d*\.?\d*$/.test(value)) {
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  // =========================
  // Total Calculation
  // =========================

  const consultation = Number(formData.consultationCharges) || 0;

  const medicine = Number(formData.medicineCharges) || 0;

  const lab = Number(formData.labCharges) || 0;

  const other = Number(formData.otherCharges) || 0;

  const totalAmount = consultation + medicine + lab + other;

  // =========================
  // Validation
  // =========================

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.patientId) {
      newErrors.patientId = "Please select a patient.";
    }

    if (!formData.date) {
      newErrors.date = "Please select a date.";
    }

    if (consultation === 0 && medicine === 0 && lab === 0 && other === 0) {
      newErrors.charges = "Please enter at least one charge.";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  // =========================
  // Submit
  // =========================

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    try {
      setSaving(true);

      const billData = {
        billId: formData.billId,

        patientId: formData.patientId,

        consultationCharges: consultation,

        medicineCharges: medicine,

        labCharges: lab,

        otherCharges: other,

        totalAmount,

        paymentStatus: formData.paymentStatus,

        date: formData.date,
      };

      if (isEdit && id) {
        await api.put(`/bills/${id}`, billData);
      } else {
        await api.post("/bills", billData);
      }

      navigate("/billing");
    } catch (error) {
      console.error("Failed to save bill:", error);

      alert(isEdit ? "Failed to update bill." : "Failed to create bill.");
    } finally {
      setSaving(false);
    }
  };

  // =========================
  // Loading
  // =========================

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-blue-600" />

          <p className="text-sm text-slate-500">Loading billing form...</p>
        </div>
      </div>
    );
  }

  // =========================
  // UI
  // =========================

  return (
    <div className="min-h-full bg-slate-50 p-6 lg:p-8">
      {/* Header */}

      <div className="mx-auto mb-6 max-w-4xl">
        <button
          type="button"
          onClick={() => navigate("/billing")}
          className="mb-4 text-sm font-medium text-slate-500 hover:text-blue-600"
        >
          ← Back to Billing
        </button>

        <h1 className="text-2xl font-bold text-slate-900">
          {isEdit ? "Edit Bill" : "Create Bill"}
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          {isEdit
            ? "Update patient billing information"
            : "Create a new patient bill"}
        </p>
      </div>

      {/* Form */}

      <form
        onSubmit={handleSubmit}
        className="mx-auto max-w-4xl overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
      >
        {/* Basic Information */}

        <div className="border-b border-slate-200 p-6">
          <h2 className="text-base font-semibold text-slate-800">
            Bill Information
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Select the patient and billing date.
          </p>

          <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">
            {/* Bill ID */}

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Bill ID
              </label>

              <input
                type="text"
                value={formData.billId}
                readOnly
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-500 outline-none"
              />
            </div>

            {/* Date */}

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Billing Date
                <span className="text-red-500"> *</span>
              </label>

              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className={`w-full rounded-lg border px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-100 ${
                  errors.date
                    ? "border-red-400"
                    : "border-slate-300 focus:border-blue-500"
                }`}
              />

              {errors.date && (
                <p className="mt-1 text-xs text-red-500">{errors.date}</p>
              )}
            </div>

            {/* Patient */}

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Patient
                <span className="text-red-500"> *</span>
              </label>

              <select
                name="patientId"
                value={formData.patientId}
                onChange={handleChange}
                className={`w-full rounded-lg border bg-white px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-100 ${
                  errors.patientId
                    ? "border-red-400"
                    : "border-slate-300 focus:border-blue-500"
                }`}
              >
                <option value="">Select Patient</option>

                {patients.map((patient) => (
                  <option key={patient.id} value={String(patient.id)}>
                    {patient.name} ({patient.patientId})
                  </option>
                ))}
              </select>

              {errors.patientId && (
                <p className="mt-1 text-xs text-red-500">{errors.patientId}</p>
              )}
            </div>
          </div>
        </div>

        {/* Charges */}

        <div className="p-6">
          <h2 className="text-base font-semibold text-slate-800">Charges</h2>

          <p className="mt-1 text-sm text-slate-500">
            Enter the applicable charges for this patient.
          </p>

          {errors.charges && (
            <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {errors.charges}
            </div>
          )}

          <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">
            {/* Consultation */}

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Consultation Charges
              </label>

              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">
                  ₹
                </span>

                <input
                  type="text"
                  inputMode="decimal"
                  name="consultationCharges"
                  value={formData.consultationCharges}
                  onChange={handleNumberChange}
                  placeholder="0"
                  className="w-full rounded-lg border border-slate-300 px-4 py-2.5 pl-8 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>

            {/* Medicine */}

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Medicine Charges
              </label>

              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">
                  ₹
                </span>

                <input
                  type="text"
                  inputMode="decimal"
                  name="medicineCharges"
                  value={formData.medicineCharges}
                  onChange={handleNumberChange}
                  placeholder="0"
                  className="w-full rounded-lg border border-slate-300 px-4 py-2.5 pl-8 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>

            {/* Lab */}

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Lab / Test Charges
              </label>

              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">
                  ₹
                </span>

                <input
                  type="text"
                  inputMode="decimal"
                  name="labCharges"
                  value={formData.labCharges}
                  onChange={handleNumberChange}
                  placeholder="0"
                  className="w-full rounded-lg border border-slate-300 px-4 py-2.5 pl-8 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>

            {/* Other */}

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Other Charges
              </label>

              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">
                  ₹
                </span>

                <input
                  type="text"
                  inputMode="decimal"
                  name="otherCharges"
                  value={formData.otherCharges}
                  onChange={handleNumberChange}
                  placeholder="0"
                  className="w-full rounded-lg border border-slate-300 px-4 py-2.5 pl-8 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>
          </div>

          {/* Total */}

          <div className="mt-6 rounded-xl border border-blue-100 bg-blue-50 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Total Amount
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Automatically calculated
                </p>
              </div>

              <p className="text-2xl font-bold text-blue-600">
                ₹{totalAmount.toLocaleString("en-IN")}
              </p>
            </div>
          </div>

          {/* Payment Status */}

          <div className="mt-6">
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Payment Status
            </label>

            <select
              name="paymentStatus"
              value={formData.paymentStatus}
              onChange={handleChange}
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="Pending">Pending</option>

              <option value="Partially Paid">Partially Paid</option>

              <option value="Paid">Paid</option>
            </select>
          </div>
        </div>

        {/* Buttons */}

        <div className="flex justify-end gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4">
          <button
            type="button"
            onClick={() => navigate("/billing")}
            className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? "Saving..." : isEdit ? "Update Bill" : "Create Bill"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default BillingForm;

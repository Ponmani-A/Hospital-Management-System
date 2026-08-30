import jsPDF from "jspdf";
import type { Bill, Patient } from "../../types";

interface DownloadBillButtonProps {
  bill: Bill;
  patient?: Patient;
}

const DownloadBillButton = ({ bill, patient }: DownloadBillButtonProps) => {
  const handleDownload = () => {
    const doc = new jsPDF();

    const patientName = patient?.name || "N/A";

    // =========================
    // Header
    // =========================

    doc.setFont("helvetica", "bold");

    doc.setFontSize(20);

    doc.text("Hospital Management System", 105, 20, {
      align: "center",
    });

    doc.setFont("helvetica", "normal");

    doc.setFontSize(11);

    doc.text("Patient Billing Invoice", 105, 28, {
      align: "center",
    });

    doc.line(20, 35, 190, 35);

    // =========================
    // Bill Information
    // =========================

    doc.setFontSize(11);

    doc.setFont("helvetica", "bold");

    doc.text("Bill ID:", 20, 48);

    doc.setFont("helvetica", "normal");

    doc.text(String(bill.billId), 60, 48);

    doc.setFont("helvetica", "bold");

    doc.text("Patient ID:", 20, 58);

    doc.setFont("helvetica", "normal");

    doc.text(String(bill.patientId), 60, 58);

    doc.setFont("helvetica", "bold");

    doc.text("Patient Name:", 20, 68);

    doc.setFont("helvetica", "normal");

    doc.text(patientName, 60, 68);

    doc.setFont("helvetica", "bold");

    doc.text("Bill Date:", 20, 78);

    doc.setFont("helvetica", "normal");

    doc.text(bill.date || "N/A", 60, 78);

    doc.setFont("helvetica", "bold");

    doc.text("Payment Status:", 20, 88);

    doc.setFont("helvetica", "normal");

    doc.text(String(bill.paymentStatus), 65, 88);

    // =========================
    // Charges
    // =========================

    doc.line(20, 98, 190, 98);

    doc.setFont("helvetica", "bold");

    doc.text("Description", 25, 110);

    doc.text("Amount", 155, 110);

    doc.line(20, 115, 190, 115);

    doc.setFont("helvetica", "normal");

    // Consultation

    doc.text("Consultation Charges", 25, 128);

    doc.text(`Rs. ${Number(bill.consultationFee).toFixed(2)}`, 155, 128);

    // Medicine

    doc.text("Medicine Charges", 25, 140);

    doc.text(`Rs. ${Number(bill.medicineCharges).toFixed(2)}`, 155, 140);

    // Lab

    doc.text("Lab / Test Charges", 25, 152);

    doc.text(`Rs. ${Number(bill.labCharges).toFixed(2)}`, 155, 152);

    // Other

    doc.text("Other Charges", 25, 164);

    doc.text(`Rs. ${Number(bill.otherCharges).toFixed(2)}`, 155, 164);

    // =========================
    // Total
    // =========================

    doc.line(20, 174, 190, 174);

    doc.setFont("helvetica", "bold");

    doc.setFontSize(13);

    doc.text("Total Amount", 25, 188);

    doc.text(`Rs. ${Number(bill.totalAmount).toFixed(2)}`, 155, 188);

    // =========================
    // Footer
    // =========================

    doc.setFont("helvetica", "normal");

    doc.setFontSize(10);

    doc.text("Thank you for choosing our hospital.", 105, 215, {
      align: "center",
    });

    doc.text("This is a computer-generated invoice.", 105, 223, {
      align: "center",
    });

    // =========================
    // Download
    // =========================

    doc.save(`${bill.billId}-invoice.pdf`);
  };

  return (
    <button
      type="button"
      onClick={handleDownload}
      className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-600 transition hover:bg-blue-100"
    >
      Download
    </button>
  );
};

export default DownloadBillButton;

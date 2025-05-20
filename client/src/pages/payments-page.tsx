import React, { useState } from "react";
import { InvoiceTemplate } from "@/components/ui/invoice-template";
import { Button } from "@/components/ui/button";

const payments = [
  { event: "Spring Gala", date: "2024-04-01", amount: "$250.00", status: "Succeeded", invoice: "Invoice" },
  { event: "Summer Fest", date: "2024-05-15", amount: "$400.00", status: "Failed", invoice: "Invoice" },
  { event: "Tech Expo", date: "2024-06-10", amount: "$150.00", status: "Succeeded", invoice: "Invoice" },
];

export default function PaymentsPage() {
  const [showInvoice, setShowInvoice] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<any>(null);

  // Mock invoice data generator based on payment row
  const getInvoiceData = (payment: any) => ({
    company: {
      name: "StaffLoop Inc.",
      logoUrl: "/logo192.png", // Replace with your logo path
      address: "123 Main St, City, Country",
      contact: "support@staffloop.com | +1 234 567 8900",
    },
    organizer: {
      name: "Organizer Name",
      companyName: "Organizer Company",
    },
    invoice: {
      number: `INV-${payment.event.replace(/\s/g, "").toUpperCase()}-${payment.date.replace(/-/g, "")}`,
      date: payment.date,
      paymentDate: payment.date,
      status: payment.status,
      method: "Paid via Card ending in 1234",
    },
    event: {
      name: payment.event,
      dates: payment.date,
    },
    lineItems: [
      {
        description: `Staffing services for ${payment.event}`,
        quantity: 1,
        unitPrice: Number(payment.amount.replace("$", "")),
        total: Number(payment.amount.replace("$", "")),
      },
    ],
    subtotal: Number(payment.amount.replace("$", "")),
    total: Number(payment.amount.replace("$", "")),
  });

  const handleInvoiceClick = (payment: any) => {
    setSelectedPayment(payment);
    setShowInvoice(true);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Payment History</h1>
      <div className="overflow-x-auto rounded-lg shadow bg-white">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Event Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount Paid</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {payments.map((p, i) => (
              <tr key={i}>
                <td className="px-6 py-4 whitespace-nowrap">{p.event}</td>
                <td className="px-6 py-4 whitespace-nowrap">{p.date}</td>
                <td className="px-6 py-4 whitespace-nowrap">{p.amount}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={p.status === "Succeeded" ? "text-green-600" : "text-red-600"}>{p.status}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {p.status === "Succeeded" ? (
                    <Button size="sm" variant="outline" onClick={() => handleInvoiceClick(p)}>
                      Invoice
                    </Button>
                  ) : (
                    <span className="text-gray-400">N/A</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Invoice Modal */}
      {showInvoice && selectedPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 print:hidden">
          <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full p-6 relative">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
              onClick={() => setShowInvoice(false)}
            >
              &times;
            </button>
            <InvoiceTemplate {...getInvoiceData(selectedPayment)} />
            <div className="flex justify-end mt-6">
              <Button onClick={handlePrint} variant="default">
                Print / Save as PDF
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 
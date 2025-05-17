import React from "react";

const payments = [
  { event: "Spring Gala", date: "2024-04-01", amount: "$250.00", status: "Succeeded", invoice: "Invoice" },
  { event: "Summer Fest", date: "2024-05-15", amount: "$400.00", status: "Failed", invoice: "Invoice" },
  { event: "Tech Expo", date: "2024-06-10", amount: "$150.00", status: "Succeeded", invoice: "Invoice" },
];

export default function PaymentsPage() {
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
                <td className="px-6 py-4 whitespace-nowrap">{p.invoice}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 
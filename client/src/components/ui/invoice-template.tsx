import React from "react";

interface InvoiceTemplateProps {
  company: {
    name: string;
    logoUrl?: string;
    address: string;
    contact: string;
  };
  organizer: {
    name: string;
    companyName: string;
  };
  invoice: {
    number: string;
    date: string;
    paymentDate: string;
    status: string;
    method: string;
  };
  event: {
    name: string;
    dates: string;
  };
  lineItems: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;
  subtotal: number;
  total: number;
}

export const InvoiceTemplate: React.FC<InvoiceTemplateProps> = ({
  company,
  organizer,
  invoice,
  event,
  lineItems,
  subtotal,
  total,
}) => {
  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded shadow print:shadow-none print:p-0 print:bg-white text-gray-800">
      <div className="flex items-center justify-between mb-8">
        <div>
          {company.logoUrl && (
            <img src={company.logoUrl} alt="Logo" className="h-12 mb-2" />
          )}
          <div className="font-bold text-lg">{company.name}</div>
          <div className="text-sm text-gray-600">{company.address}</div>
          <div className="text-sm text-gray-600">{company.contact}</div>
        </div>
        <div className="text-right">
          <div className="font-bold text-xl mb-2">INVOICE</div>
          <div className="text-sm">Invoice #: {invoice.number}</div>
          <div className="text-sm">Invoice Date: {invoice.date}</div>
          <div className="text-sm">Payment Date: {invoice.paymentDate}</div>
        </div>
      </div>
      <div className="flex justify-between mb-8">
        <div>
          <div className="font-semibold">Billed To:</div>
          <div>{organizer.name}</div>
          <div>{organizer.companyName}</div>
        </div>
        <div>
          <div className="font-semibold">Event:</div>
          <div>{event.name}</div>
          <div>{event.dates}</div>
        </div>
      </div>
      <table className="w-full mb-8 border-t border-b">
        <thead>
          <tr className="text-left">
            <th className="py-2">Description</th>
            <th className="py-2">Qty</th>
            <th className="py-2">Unit Price</th>
            <th className="py-2">Total</th>
          </tr>
        </thead>
        <tbody>
          {lineItems.map((item, idx) => (
            <tr key={idx}>
              <td className="py-2">{item.description}</td>
              <td className="py-2">{item.quantity}</td>
              <td className="py-2">${item.unitPrice.toFixed(2)}</td>
              <td className="py-2">${item.total.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="flex justify-end mb-2">
        <div className="w-1/2">
          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          {/* Taxes can be added here if needed */}
          <div className="flex justify-between font-bold text-lg mt-2">
            <span>Total:</span>
            <span>${total.toFixed(2)}</span>
          </div>
        </div>
      </div>
      <div className="flex justify-between mt-8">
        <div>
          <div className="text-sm">Payment Status: <span className="font-semibold">{invoice.status}</span></div>
          <div className="text-sm">Payment Method: {invoice.method}</div>
        </div>
        <div className="text-right text-sm text-gray-500">
          Thank you for your business!<br />
          <span className="italic">StaffLoop - Event Staffing Platform</span>
        </div>
      </div>
    </div>
  );
}; 
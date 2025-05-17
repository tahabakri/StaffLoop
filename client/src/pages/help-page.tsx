import React from "react";

const faqs = [
  {
    question: "How do I create an event?",
    answer: "Go to the Events tab and click '+ Create New Event'. Fill in the event details and save.",
  },
  {
    question: "How does staff check-in work?",
    answer: "Staff can check in using the StaffLoop mobile app or web portal. Facial recognition is used for secure check-in.",
  },
  {
    question: "What happens if facial recognition fails?",
    answer: "If facial recognition fails, staff can use a backup code or contact the event organizer for manual check-in.",
  },
  {
    question: "How is payment calculated?",
    answer: "Payments are based on the number of staff checked in and the event's pricing plan. You can view payment history in the Payments tab.",
  },
];

export default function HelpPage() {
  return (
    <div className="max-w-3xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Help & Support</h1>
      <section className="mb-10">
        <h2 className="text-lg font-semibold mb-4">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <div key={i} className="border rounded-lg p-4 bg-gray-50">
              <div className="font-medium text-gray-800 mb-2">{faq.question}</div>
              <div className="text-gray-600">{faq.answer}</div>
            </div>
          ))}
        </div>
      </section>
      <section>
        <h2 className="text-lg font-semibold mb-4">Contact Support</h2>
        <div className="bg-white border rounded-lg p-4">
          <div className="mb-2">
            <span className="font-medium">Email Support:</span> <a href="mailto:support@staffloop.app" className="text-primary underline">support@staffloop.app</a>
          </div>
          <div>
            <span className="font-medium">WhatsApp Support:</span> <a href="https://wa.me/1234567890" className="text-primary underline">+1 234 567 890</a>
          </div>
        </div>
      </section>
    </div>
  );
} 
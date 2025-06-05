import React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import {
  LifeBuoy,
  HelpCircle,
  Mail,
  MessageCircle,
} from "lucide-react";

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
      <h1 className="text-2xl font-bold mb-6 flex items-center">
        <LifeBuoy className="h-6 w-6 mr-2" />
        Help & Support
      </h1>
      
      <section className="mb-10">
        <h2 className="text-lg font-semibold mb-4 flex items-center">
          <HelpCircle className="h-5 w-5 mr-2" />
          Frequently Asked Questions
        </h2>
        
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, i) => (
            <AccordionItem key={i} value={`item-${i}`} className="border-b">
              <AccordionTrigger className="font-medium text-gray-800 py-4">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-gray-600 pt-2 pb-4">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>
      
      <section>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center">
              <Mail className="h-5 w-5 mr-2" />
              Contact Support
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4 flex items-center">
              <Mail className="h-5 w-5 mr-3 text-gray-600" />
              <span className="font-medium mr-2">Email Support:</span>
              <a 
                href="mailto:support@staffloop.app" 
                className="text-primary hover:underline"
              >
                support@staffloop.app
              </a>
            </div>
            <div className="flex items-center">
              <MessageCircle className="h-5 w-5 mr-3 text-gray-600" />
              <span className="font-medium mr-2">WhatsApp Support:</span>
              <a 
                href="https://wa.me/1234567890" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-primary hover:underline"
              >
                +1 234 567 890
              </a>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
} 
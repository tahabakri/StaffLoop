import { useAuth } from "@/hooks/use-auth";
import { ReportGenerator } from "@/components/reports/report-generator";

export default function ReportPage() {
  const { user } = useAuth();

  return (
    <ReportGenerator />
  );
}

import { useAuth } from "@/hooks/use-auth";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { ReportGenerator } from "@/components/reports/report-generator";

export default function ReportPage() {
  const { user } = useAuth();

  return (
    <DashboardLayout title="Attendance Reports">
      <ReportGenerator />
    </DashboardLayout>
  );
}

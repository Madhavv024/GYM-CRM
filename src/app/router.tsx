import { createBrowserRouter } from "react-router-dom";
import { AppLayout } from "@/app/app-layout";
import { AttendancePage } from "@/pages/attendance-page";
import { ClassesPage } from "@/pages/classes-page";
import { DashboardPage } from "@/pages/dashboard-page";
import { ExpensesPage } from "@/pages/expenses-page";
import { LeadsPage } from "@/pages/leads-page";
import { MemberDetailsPage } from "@/pages/member-details-page";
import { MembersPage } from "@/pages/members-page";
import { PaymentsPage } from "@/pages/payments-page";
import { PlansPage } from "@/pages/plans-page";
import { ReportsPage } from "@/pages/reports-page";
import { SettingsPage } from "@/pages/settings-page";
import { TrainersPage } from "@/pages/trainers-page";
import { ReceiptPage } from "@/pages/receipt-page";
import { AppointmentsPage } from "@/pages/appointments-page";

export const router = createBrowserRouter(
  [
    {
      path: "/",
      element: <AppLayout />,
      children: [
        { index: true, element: <DashboardPage /> },
        { path: "members", element: <MembersPage /> },
        { path: "members/:memberId", element: <MemberDetailsPage /> },
        { path: "payments", element: <PaymentsPage /> },
        { path: "payments/:paymentId/receipt", element: <ReceiptPage /> },
        { path: "attendance", element: <AttendancePage /> },
        { path: "leads", element: <LeadsPage /> },
        { path: "appointments", element: <AppointmentsPage /> },
        { path: "plans", element: <PlansPage /> },
        { path: "trainers", element: <TrainersPage /> },
        { path: "classes", element: <ClassesPage /> },
        { path: "expenses", element: <ExpensesPage /> },
        { path: "reports", element: <ReportsPage /> },
        { path: "settings", element: <SettingsPage /> },
      ],
    },
  ],
  {
    basename: "/crm",
  },
);
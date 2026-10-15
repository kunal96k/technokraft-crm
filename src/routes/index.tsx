import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from '../components/layout/AppLayout';
import { DashboardPage } from '../pages/Dashboard';
import { PlaceholderPage } from '../pages/PlaceholderPage';
import { LeadsListPage } from '../pages/leads/LeadsListPage';
import { LeadDetailsPage } from '../pages/leads/LeadDetailsPage';
import { AddLeadPage } from '../pages/leads/AddLeadPage';
import { BulkImportPage } from '../pages/leads/BulkImportPage';
import { EmailsPage } from '../pages/communication/EmailsPage';
import { EmailComposePage } from '../pages/communication/EmailComposePage';
import { WhatsAppPage } from '../pages/communication/WhatsAppPage';
import { CallsPage } from '../pages/communication/CallsPage';
import { CallDetailsPage } from '../pages/communication/CallDetailsPage';
import { FollowUpsPage } from '../pages/followups/FollowUpsPage';
import { TasksPage } from '../pages/followups/TasksPage';
import { MeetingsPage } from '../pages/followups/MeetingsPage';
import { PipelinePage } from '../pages/opportunities/PipelinePage';
import { ProposalsPage } from '../pages/opportunities/ProposalsPage';
import { OpportunityDetailsPage } from '../pages/opportunities/OpportunityDetailsPage';
import { PerformanceReportPage } from '../pages/reports/PerformanceReportPage';
import { EmployeePerformanceDetailPage } from '../pages/reports/EmployeePerformanceDetailPage';
import { AnalyticsPage } from '../pages/reports/AnalyticsPage';
import { EmployeeListPage } from '../pages/employees/EmployeeListPage';
import { AttendancePage } from '../pages/attendance/AttendancePage';
import { GeneralSettingsPage } from '../pages/settings/GeneralSettingsPage';
import { NotificationsPage } from '../pages/notifications/NotificationsPage';
import { LoginPage } from '../pages/auth/LoginPage';
import { ForgotPasswordPage } from '../pages/auth/ForgotPasswordPage';
import { ResetPasswordPage } from '../pages/auth/ResetPasswordPage';
import { ProtectedRoute } from '../components/auth/ProtectedRoute';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* 1. Public Authentication Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />

      {/* 2. Protected CRM Application Routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />

        {/* 2. Leads Module — all authenticated users */}
        <Route path="/leads" element={<LeadsListPage />} />
        <Route path="/leads/add" element={<AddLeadPage />} />
        <Route path="/leads/import" element={<BulkImportPage />} />
        <Route path="/leads/:leadId" element={<LeadDetailsPage />} />

        {/* 3. Communication Module — all authenticated users */}
        <Route path="/communication/emails" element={<EmailsPage />} />
        <Route path="/communication/emails/compose" element={<EmailComposePage />} />
        <Route path="/communication/whatsapp" element={<WhatsAppPage />} />
        <Route path="/communication/calls" element={<CallsPage />} />
        <Route path="/communication/calls/:id" element={<CallDetailsPage />} />

        {/* 4. Follow-ups Module — all authenticated users */}
        <Route path="/follow-ups" element={<FollowUpsPage />} />
        <Route path="/follow-ups/tasks" element={<TasksPage />} />
        <Route path="/follow-ups/meetings" element={<MeetingsPage />} />

        {/* 5. Opportunities Module — all authenticated users */}
        <Route path="/opportunities" element={<Navigate to="/opportunities/pipeline" replace />} />
        <Route path="/opportunities/pipeline" element={<PipelinePage />} />
        <Route path="/opportunities/proposals" element={<ProposalsPage />} />
        <Route path="/opportunities/:id" element={<OpportunityDetailsPage />} />

        {/* 6. Reports Module — Managers and above only */}
        <Route
          path="/reports"
          element={
            <ProtectedRoute allowedRoles={['Super Admin', 'Admin', 'Sales Manager']}>
              <Navigate to="/reports/performance" replace />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reports/performance"
          element={<ProtectedRoute allowedRoles={['Super Admin', 'Admin', 'Sales Manager']}><PerformanceReportPage /></ProtectedRoute>}
        />
        <Route
          path="/reports/performance/:employeeId"
          element={<ProtectedRoute allowedRoles={['Super Admin', 'Admin', 'Sales Manager']}><EmployeePerformanceDetailPage /></ProtectedRoute>}
        />
        <Route
          path="/reports/analytics"
          element={<ProtectedRoute allowedRoles={['Super Admin', 'Admin', 'Sales Manager']}><AnalyticsPage /></ProtectedRoute>}
        />

        {/* 7. Employees Module — Managers and above only */}
        <Route
          path="/employees"
          element={<ProtectedRoute allowedRoles={['Super Admin', 'Admin', 'Sales Manager']}><EmployeeListPage /></ProtectedRoute>}
        />
        <Route
          path="/employees/attendance"
          element={<ProtectedRoute allowedRoles={['Super Admin', 'Admin', 'Sales Manager']}><AttendancePage /></ProtectedRoute>}
        />
        <Route
          path="/attendance"
          element={<ProtectedRoute allowedRoles={['Super Admin', 'Admin', 'Sales Manager']}><AttendancePage /></ProtectedRoute>}
        />

        {/* 8. Settings Module — Super Admin / Admin only */}
        <Route
          path="/settings"
          element={
            <ProtectedRoute allowedRoles={['Super Admin', 'Admin']}>
              <Navigate to="/settings/general" replace />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings/general"
          element={<ProtectedRoute allowedRoles={['Super Admin', 'Admin']}><GeneralSettingsPage /></ProtectedRoute>}
        />

        {/* 9. Notification Center — all authenticated users */}
        <Route path="/notifications" element={<NotificationsPage />} />

        {/* Fallback Catch-all */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Route>
  </Routes>
);
};

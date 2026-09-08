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
import { UsersRolesPage } from '../pages/settings/UsersRolesPage';
import { GeneralSettingsPage } from '../pages/settings/GeneralSettingsPage';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />

        {/* 2. Leads Module */}
        <Route path="/leads" element={<LeadsListPage />} />
        <Route path="/leads/add" element={<AddLeadPage />} />
        <Route path="/leads/import" element={<BulkImportPage />} />
        <Route path="/leads/:leadId" element={<LeadDetailsPage />} />

        {/* 3. Communication Module */}
        <Route path="/communication/emails" element={<EmailsPage />} />
        <Route path="/communication/emails/compose" element={<EmailComposePage />} />
        <Route path="/communication/whatsapp" element={<WhatsAppPage />} />
        <Route path="/communication/calls" element={<CallsPage />} />
        <Route path="/communication/calls/:id" element={<CallDetailsPage />} />

        {/* 4. Follow-ups Module */}
        <Route path="/follow-ups" element={<FollowUpsPage />} />
        <Route path="/follow-ups/tasks" element={<TasksPage />} />
        <Route path="/follow-ups/meetings" element={<MeetingsPage />} />

        {/* 5. Opportunities Module */}
        <Route path="/opportunities" element={<Navigate to="/opportunities/pipeline" replace />} />
        <Route path="/opportunities/pipeline" element={<PipelinePage />} />
        <Route path="/opportunities/proposals" element={<ProposalsPage />} />
        <Route path="/opportunities/:id" element={<OpportunityDetailsPage />} />

        {/* 6. Reports Module */}
        <Route path="/reports" element={<Navigate to="/reports/performance" replace />} />
        <Route path="/reports/performance" element={<PerformanceReportPage />} />
        <Route path="/reports/performance/:employeeId" element={<EmployeePerformanceDetailPage />} />
        <Route path="/reports/analytics" element={<AnalyticsPage />} />

        {/* 7. Employees Module */}
        <Route path="/employees" element={<EmployeeListPage />} />
        <Route path="/employees/attendance" element={<AttendancePage />} />
        <Route path="/attendance" element={<AttendancePage />} />

        {/* 8. Settings Module */}
        <Route path="/settings" element={<Navigate to="/settings/users" replace />} />
        <Route path="/settings/users" element={<UsersRolesPage />} />
        <Route path="/settings/users-roles" element={<UsersRolesPage />} />
        <Route path="/settings/general" element={<GeneralSettingsPage />} />

        {/* Fallback Catch-all */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  );
};

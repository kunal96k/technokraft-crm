import React, { useState, useEffect } from 'react';
import { SettingsLayout, SettingsSectionTab } from '../../components/settings/SettingsLayout';
import { SettingsHeader } from '../../components/settings/SettingsHeader';
import { SettingsSaveBar } from '../../components/settings/SettingsSaveBar';
import { UnsavedChangesDialog } from '../../components/settings/UnsavedChangesDialog';
import { AuditLogPreview } from '../../components/settings/AuditLogPreview';

import { CompanySettings } from '../../components/settings/general/CompanySettings';
import { CRMSettings } from '../../components/settings/general/CRMSettings';
import { LeadSettings } from '../../components/settings/general/LeadSettings';
import { PipelineSettings } from '../../components/settings/general/PipelineSettings';
import { CommunicationSettings } from '../../components/settings/general/CommunicationSettings';
import { FollowupSettings } from '../../components/settings/general/FollowupSettings';
import { NotificationSettings } from '../../components/settings/general/NotificationSettings';
import { EmailSettings } from '../../components/settings/general/EmailSettings';
import { AppearanceSettings } from '../../components/settings/general/AppearanceSettings';
import { DangerZone } from '../../components/settings/general/DangerZone';

import {
  GeneralSettingsState,
  CompanySettingsData,
  CrmPreferencesData,
  LeadStatusConfig,
  LeadSourceConfig,
  PipelineStageConfig,
  CommunicationConfigData,
  FollowupConfigData,
  NotificationTypePreference,
  EmailConfigData,
  AppearanceConfigData,
} from '../../types/settings';
import {
  loadGeneralSettings,
  saveGeneralSettings,
  INITIAL_GENERAL_SETTINGS,
} from '../../data/mockSettings';
import { CheckCircle2 } from 'lucide-react';

export const GeneralSettingsPage: React.FC = () => {
  // Current active sub-section tab
  const [activeTab, setActiveTab] = useState<SettingsSectionTab>('company');

  // Saved baseline state
  const [savedSettings, setSavedSettings] = useState<GeneralSettingsState>(INITIAL_GENERAL_SETTINGS);
  // Current editing state
  const [currentSettings, setCurrentSettings] = useState<GeneralSettingsState>(INITIAL_GENERAL_SETTINGS);

  // Unsaved changes navigation guard
  const [pendingTab, setPendingTab] = useState<SettingsSectionTab | null>(null);
  const [isUnsavedDialogOpen, setIsUnsavedDialogOpen] = useState(false);

  // Toast / notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Load from storage
  useEffect(() => {
    const loaded = loadGeneralSettings();
    setSavedSettings(loaded);
    setCurrentSettings(loaded);
  }, []);

  // Determine if dirty
  const isDirty = JSON.stringify(savedSettings) !== JSON.stringify(currentSettings);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Switch tab guard
  const handleTabChange = (newTab: SettingsSectionTab) => {
    if (newTab === activeTab) return;

    if (isDirty) {
      setPendingTab(newTab);
      setIsUnsavedDialogOpen(true);
    } else {
      setActiveTab(newTab);
    }
  };

  // Discard changes
  const handleDiscard = () => {
    setCurrentSettings(JSON.parse(JSON.stringify(savedSettings)));
    setIsUnsavedDialogOpen(false);
    if (pendingTab) {
      setActiveTab(pendingTab);
      setPendingTab(null);
    }
    showToast('Unsaved changes discarded.');
  };

  // Save changes
  const handleSave = () => {
    saveGeneralSettings(currentSettings);
    setSavedSettings(JSON.parse(JSON.stringify(currentSettings)));
    showToast('Settings saved successfully.');
  };

  // Danger zone reset
  const handleResetToDefaults = () => {
    saveGeneralSettings(INITIAL_GENERAL_SETTINGS);
    setSavedSettings(JSON.parse(JSON.stringify(INITIAL_GENERAL_SETTINGS)));
    setCurrentSettings(JSON.parse(JSON.stringify(INITIAL_GENERAL_SETTINGS)));
    showToast('CRM settings restored to factory defaults.');
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xl text-xs font-medium animate-in slide-in-from-top-3 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <SettingsHeader
        breadcrumbs={[
          { label: 'Settings' },
          { label: 'General Settings' },
        ]}
        title="General Settings"
        subtitle="Manage company information, lead stages, notification alerts, and communication channels."
      />

      {/* Two-Panel Layout */}
      <SettingsLayout activeTab={activeTab} onTabChange={handleTabChange}>
        {/* Active Section Content */}
        {activeTab === 'company' && (
          <CompanySettings
            data={currentSettings.company}
            onChange={(company) =>
              setCurrentSettings({ ...currentSettings, company })
            }
          />
        )}

        {activeTab === 'crm' && (
          <CRMSettings
            data={currentSettings.crm}
            onChange={(crm) => setCurrentSettings({ ...currentSettings, crm })}
          />
        )}

        {activeTab === 'leads' && (
          <LeadSettings
            statuses={currentSettings.leadStatuses}
            sources={currentSettings.leadSources}
            onUpdateStatuses={(leadStatuses) =>
              setCurrentSettings({ ...currentSettings, leadStatuses })
            }
            onUpdateSources={(leadSources) =>
              setCurrentSettings({ ...currentSettings, leadSources })
            }
          />
        )}

        {activeTab === 'pipeline' && (
          <PipelineSettings
            stages={currentSettings.pipelineStages}
            onChange={(pipelineStages) =>
              setCurrentSettings({ ...currentSettings, pipelineStages })
            }
          />
        )}

        {activeTab === 'communication' && (
          <CommunicationSettings
            data={currentSettings.communication}
            onChange={(communication) =>
              setCurrentSettings({ ...currentSettings, communication })
            }
          />
        )}

        {activeTab === 'followups' && (
          <FollowupSettings
            data={currentSettings.followups}
            onChange={(followups) =>
              setCurrentSettings({ ...currentSettings, followups })
            }
          />
        )}

        {activeTab === 'notifications' && (
          <NotificationSettings
            notifications={currentSettings.notifications}
            onChange={(notifications) =>
              setCurrentSettings({ ...currentSettings, notifications })
            }
          />
        )}

        {activeTab === 'email' && (
          <EmailSettings
            data={currentSettings.email}
            onChange={(email) =>
              setCurrentSettings({ ...currentSettings, email })
            }
          />
        )}

        {activeTab === 'appearance' && (
          <AppearanceSettings
            data={currentSettings.appearance}
            onChange={(appearance) =>
              setCurrentSettings({ ...currentSettings, appearance })
            }
          />
        )}

        {/* Danger Zone at the bottom of General Settings */}
        <DangerZone onResetToDefaults={handleResetToDefaults} />
      </SettingsLayout>

      {/* Audit Trail Log Preview */}
      <AuditLogPreview />

      {/* Sticky Save / Discard Bar when changes exist */}
      <SettingsSaveBar
        hasChanges={isDirty}
        onSave={handleSave}
        onDiscard={handleDiscard}
      />

      {/* Unsaved Changes Navigation Guard Dialog */}
      <UnsavedChangesDialog
        isOpen={isUnsavedDialogOpen}
        onDiscard={handleDiscard}
        onStay={() => {
          setIsUnsavedDialogOpen(false);
          setPendingTab(null);
        }}
      />
    </div>
  );
};

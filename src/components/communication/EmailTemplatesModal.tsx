import React, { useState, useEffect } from 'react';
import {
  X,
  FileText,
  Copy,
  Check,
  Loader2,
  Plus,
  Pencil,
  Trash2,
  AlertTriangle,
  ShieldCheck,
} from 'lucide-react';
import { EmailTemplate } from '../../types/communication';
import { fetchEmailTemplates, deleteEmailTemplate } from '../../services/emailService';
import { CreateTemplateModal } from './CreateTemplateModal';

interface EmailTemplatesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplateForCompose?: (template: EmailTemplate) => void;
}

type ModalMode = 'view' | 'create' | 'edit' | 'confirmDelete';

export const EmailTemplatesModal: React.FC<EmailTemplatesModalProps> = ({
  isOpen,
  onClose,
  onSelectTemplateForCompose,
}) => {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<ModalMode>('view');
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<EmailTemplate | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const MAX_TEMPLATES = 25;

  const loadTemplates = (keepSelected?: EmailTemplate | null) => {
    setLoading(true);
    fetchEmailTemplates()
      .then((data) => {
        if (data && data.length > 0) {
          setTemplates(data);
          if (keepSelected) {
            const refreshed = data.find((t) => t.id === keepSelected.id);
            setSelectedTemplate(refreshed || data[0]);
          } else {
            setSelectedTemplate((prev) =>
              prev ? data.find((t) => t.id === prev.id) || data[0] : data[0]
            );
          }
        } else {
          setTemplates([]);
          setSelectedTemplate(null);
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (isOpen) {
      setMode('view');
      setDeleteTarget(null);
      setDeleteError('');
      loadTemplates();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // ── Create ──────────────────────────────────────────────────────────────────
  const handleTemplateCreated = (newTpl: EmailTemplate) => {
    setTemplates((prev) => [newTpl, ...prev]);
    setSelectedTemplate(newTpl);
    setMode('view');
  };

  // ── Edit ────────────────────────────────────────────────────────────────────
  const handleTemplateUpdated = (updated: EmailTemplate) => {
    setTemplates((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    setSelectedTemplate(updated);
    setMode('view');
  };

  const openEdit = (tpl: EmailTemplate) => {
    setEditingTemplate(tpl);
    setMode('edit');
  };

  // ── Delete ───────────────────────────────────────────────────────────────────
  const openDeleteConfirm = (tpl: EmailTemplate) => {
    setDeleteTarget(tpl);
    setDeleteError('');
    setMode('confirmDelete');
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    setDeleteError('');
    try {
      const ok = await deleteEmailTemplate(deleteTarget.id);
      if (ok) {
        const remaining = templates.filter((t) => t.id !== deleteTarget.id);
        setTemplates(remaining);
        // Auto-select neighbour
        const deletedIdx = templates.findIndex((t) => t.id === deleteTarget.id);
        const next = remaining[deletedIdx] || remaining[deletedIdx - 1] || remaining[0] || null;
        setSelectedTemplate(next);
        setDeleteTarget(null);
        setMode('view');
      } else {
        setDeleteError('Server returned failure. Please try again.');
      }
    } catch (err: any) {
      setDeleteError(err?.message || 'Failed to delete. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  // ── Copy body ────────────────────────────────────────────────────────────────
  const handleCopy = () => {
    if (!selectedTemplate) return;
    navigator.clipboard?.writeText(selectedTemplate.body);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const atLimit = templates.length >= MAX_TEMPLATES;

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150"
        onClick={mode === 'view' ? onClose : undefined}
        role="dialog"
        aria-modal="true"
        aria-label="Email Templates Library"
      >
        <div
          className="w-full max-w-3xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden text-slate-800 dark:text-slate-100 transition-colors"
          style={{ maxHeight: '90vh', height: '90vh' }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* ── Modal Header ─────────────────────────────────────────────────── */}
          <div className="flex-shrink-0 flex items-center justify-between px-5 py-3.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/70">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-[#5B4DB7] dark:text-purple-400 flex items-center justify-center border border-purple-200/50 dark:border-purple-800/50">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Business Email Templates
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Standardized B2B communication templates with CRM variable tags
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  if (atLimit) return;
                  setMode('create');
                }}
                disabled={atLimit}
                title={atLimit ? `Maximum ${MAX_TEMPLATES} templates reached` : 'Create new template'}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white rounded-lg shadow-2xs transition-opacity cursor-pointer ${
                  atLimit
                    ? 'bg-slate-400 dark:bg-slate-600 opacity-60 cursor-not-allowed'
                    : 'bg-gradient-to-r from-[#0A2558] to-[#4f46e5] hover:opacity-95'
                }`}
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create Own Template</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* ── Body: 2-column layout ─────────────────────────────────────────── */}
          <div className="flex-1 min-h-0 overflow-hidden grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-200 dark:divide-slate-800">

            {/* ── LEFT: Template List (fixed height, scrollable) ────────────── */}
            <div className="flex flex-col min-h-0 overflow-hidden">
              {/* Column header — not scrollable */}
              <div className="flex-shrink-0 px-3 pt-3 pb-1 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center justify-between">
                <span>
                  Available Templates ({templates.length}/{MAX_TEMPLATES})
                </span>
                {loading && <Loader2 className="w-3 h-3 animate-spin text-[#5B4DB7]" />}
              </div>

              {/* Scrollable list — fills remaining height */}
              <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-1 min-h-0">
                {templates.length === 0 && !loading && (
                  <div className="p-4 text-center text-xs text-slate-400 dark:text-slate-500">
                    No templates found in database.
                  </div>
                )}
                {templates.map((tpl) => {
                  const isSelected = selectedTemplate?.id === tpl.id;
                  return (
                    <div
                      key={tpl.id}
                      className={`group w-full text-left rounded-lg text-xs transition-colors border ${
                        isSelected
                          ? 'bg-purple-50 dark:bg-purple-950/60 border-purple-200 dark:border-purple-800/60'
                          : 'border-transparent hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      {/* Clickable row for preview */}
                      <button
                        type="button"
                        onClick={() => setSelectedTemplate(tpl)}
                        className="w-full text-left p-2.5 flex items-center justify-between cursor-pointer"
                      >
                        <div className="truncate pr-1 flex-1 min-w-0">
                          <div className={`truncate font-medium ${isSelected ? 'text-[#5B4DB7] dark:text-purple-300' : 'text-slate-700 dark:text-slate-300'}`}>
                            {tpl.name}
                          </div>
                          <div className="text-[10px] text-slate-400 dark:text-slate-500 flex items-center gap-1">
                            <span>{tpl.category}</span>
                            {tpl.isDefault && (
                              <ShieldCheck className="w-2.5 h-2.5 text-blue-400" title="Default template" />
                            )}
                          </div>
                        </div>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 flex-shrink-0 ml-1">
                          {tpl.variables.length} vars
                        </span>
                      </button>

                      {/* Edit / Delete action row — visible on hover or when selected */}
                      <div className={`flex items-center gap-1 px-2 pb-2 ${isSelected ? 'flex' : 'hidden group-hover:flex'}`}>
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); openEdit(tpl); }}
                          title="Edit template"
                          className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-md text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 border border-blue-200 dark:border-blue-800/50 transition-colors cursor-pointer"
                        >
                          <Pencil className="w-2.5 h-2.5" />
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); openDeleteConfirm(tpl); }}
                          title="Delete template permanently"
                          className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-md text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200 dark:border-rose-800/50 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-2.5 h-2.5" />
                          Delete
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Limit badge */}
              {atLimit && (
                <div className="flex-shrink-0 mx-3 mb-3 flex items-center gap-1.5 p-2 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 text-[10px] text-amber-700 dark:text-amber-400">
                  <AlertTriangle className="w-3 h-3 flex-shrink-0" />
                  <span>Max {MAX_TEMPLATES} templates reached. Delete one to create more.</span>
                </div>
              )}
            </div>

            {/* ── RIGHT: Template Preview (scrollable) ─────────────────────── */}
            <div className="md:col-span-2 flex flex-col min-h-0 overflow-hidden">
              {/* Delete confirmation overlay */}
              {mode === 'confirmDelete' && deleteTarget && (
                <div className="flex-1 flex flex-col items-center justify-center p-6 space-y-4">
                  <div className="w-14 h-14 rounded-full bg-rose-50 dark:bg-rose-950/40 flex items-center justify-center border border-rose-200 dark:border-rose-800">
                    <Trash2 className="w-7 h-7 text-rose-500" />
                  </div>
                  <div className="text-center space-y-1.5">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      Permanently Delete Template?
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                        "{deleteTarget.name}"
                      </span>{' '}
                      will be permanently removed from the database. This action cannot be undone.
                    </p>
                    {deleteTarget.isDefault && (
                      <p className="text-[11px] text-amber-600 dark:text-amber-400 flex items-center justify-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        This is a default system template.
                      </p>
                    )}
                  </div>
                  {deleteError && (
                    <div className="w-full p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs text-center">
                      {deleteError}
                    </div>
                  )}
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => { setMode('view'); setDeleteTarget(null); setDeleteError(''); }}
                      disabled={isDeleting}
                      className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleConfirmDelete}
                      disabled={isDeleting}
                      className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-xs cursor-pointer transition-colors disabled:opacity-50"
                    >
                      {isDeleting ? (
                        <><Loader2 className="w-3.5 h-3.5 animate-spin" /><span>Deleting...</span></>
                      ) : (
                        <><Trash2 className="w-3.5 h-3.5" /><span>Yes, Delete Permanently</span></>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Normal preview */}
              {mode !== 'confirmDelete' && (
                <div className="flex-1 overflow-y-auto p-5 flex flex-col justify-between space-y-4">
                  {selectedTemplate ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                          {selectedTemplate.name}
                          {selectedTemplate.isDefault && (
                            <ShieldCheck className="w-3.5 h-3.5 text-blue-400" title="Default template" />
                          )}
                        </h4>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-medium text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800/60 px-2 py-0.5 rounded-full">
                            {selectedTemplate.category}
                          </span>
                          <button
                            type="button"
                            onClick={() => openEdit(selectedTemplate)}
                            className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 border border-blue-200 dark:border-blue-800/50 transition-colors cursor-pointer"
                          >
                            <Pencil className="w-3 h-3" />
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => openDeleteConfirm(selectedTemplate)}
                            className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200 dark:border-rose-800/50 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3 h-3" />
                            Delete
                          </button>
                        </div>
                      </div>

                      <div>
                        <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
                          Subject Template
                        </span>
                        <div className="p-2.5 bg-slate-50 dark:bg-slate-950/60 rounded-lg text-xs font-mono text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800">
                          {selectedTemplate.subject}
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                            Body Template
                          </span>
                          <button
                            type="button"
                            onClick={handleCopy}
                            className="inline-flex items-center gap-1 text-[11px] text-[#5B4DB7] dark:text-purple-400 hover:underline cursor-pointer"
                          >
                            {copied ? <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3 h-3" />}
                            <span>{copied ? 'Copied' : 'Copy Body'}</span>
                          </button>
                        </div>
                        <div className="p-3.5 bg-slate-50 dark:bg-slate-950/60 rounded-xl text-xs font-mono text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto">
                          {selectedTemplate.body}
                        </div>
                      </div>

                      <div>
                        <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1.5">
                          Template Placeholders
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {selectedTemplate.variables.map((v) => (
                            <span
                              key={v}
                              className="text-[11px] font-mono px-2 py-0.5 rounded bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/60"
                            >
                              {`{{${v}}}`}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-8 text-center text-xs text-slate-400 dark:text-slate-500">
                      {loading ? 'Loading templates...' : 'No template selected or available.'}
                    </div>
                  )}

                  <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-3.5 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                    >
                      Close
                    </button>
                    {onSelectTemplateForCompose && selectedTemplate && (
                      <button
                        type="button"
                        onClick={() => {
                          onSelectTemplateForCompose(selectedTemplate);
                          onClose();
                        }}
                        className="px-4 py-1.5 text-xs font-semibold text-white bg-[#5B4DB7] hover:bg-[#4E41A2] dark:bg-purple-600 dark:hover:bg-purple-700 rounded-lg shadow-xs cursor-pointer transition-colors"
                      >
                        Use Template in Composer
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Create Template modal */}
      {mode === 'create' && (
        <CreateTemplateModal
          isOpen={true}
          onClose={() => setMode('view')}
          onTemplateCreated={handleTemplateCreated}
        />
      )}

      {/* Edit Template modal */}
      {mode === 'edit' && editingTemplate && (
        <CreateTemplateModal
          isOpen={true}
          onClose={() => { setMode('view'); setEditingTemplate(null); }}
          editTemplate={editingTemplate}
          onTemplateUpdated={handleTemplateUpdated}
        />
      )}
    </>
  );
};

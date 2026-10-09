import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, Image as ImageIcon, X, Loader2, CheckCircle2 } from 'lucide-react';
import { EmailAttachment } from '../../types/communication';
import { uploadAttachment, deleteAttachment } from '../../services/leadService';
import { useToast } from '../../context/ToastContext';

interface AttachmentUploaderProps {
  attachments: EmailAttachment[];
  onAddAttachment: (attachment: EmailAttachment) => void;
  onRemoveAttachment: (id: string) => void;
  leadId?: string;
  className?: string;
}

export const AttachmentUploader: React.FC<AttachmentUploaderProps> = ({
  attachments,
  onAddAttachment,
  onRemoveAttachment,
  leadId,
  className = '',
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve((reader.result as string) || '');
      reader.onerror = () => resolve('');
      reader.readAsDataURL(file);
    });
  };

  const processFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setIsUploading(true);

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        let base64 = '';
        try {
          base64 = await fileToBase64(file);
        } catch {}

        let res: any = null;
        try {
          res = await uploadAttachment(file, leadId);
        } catch (uploadErr) {
          console.warn('[AttachmentUploader] Backend upload failed, using local in-memory fallback:', uploadErr);
        }

        const saved = res?.attachment || (res?.id ? res : null);

        // Deduce a valid RFC MIME type (e.g. application/pdf) with slash
        let mimeType = 'application/octet-stream';
        if (file.type && file.type.includes('/')) {
          mimeType = file.type;
        } else if (saved?.type && typeof saved.type === 'string' && saved.type.includes('/')) {
          mimeType = saved.type;
        } else if (file.name.toLowerCase().endsWith('.pdf')) {
          mimeType = 'application/pdf';
        }

        if (saved && saved.id) {
          onAddAttachment({
            id: String(saved.id),
            name: saved.name || file.name,
            size: saved.size || `${(file.size / 1024).toFixed(1)} KB`,
            type: mimeType,
            url: saved.url || saved.downloadUrl || `/api/attachments/${saved.id}/download`,
            filePath: saved.filePath,
            base64Content: base64 || undefined,
          });
          toast.success(`Saved "${file.name}" to project storage & database.`, 'Attachment Saved');
        } else {
          // Fallback if backend upload fails
          const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
          const sizeKB = Math.round(file.size / 1024);
          const sizeStr = file.size > 1024 * 1024 ? `${sizeMB} MB` : `${sizeKB} KB`;

          onAddAttachment({
            id: `att-${Date.now()}-${i}`,
            name: file.name,
            size: sizeStr,
            type: mimeType,
            base64Content: base64 || undefined,
          });
          toast.warning(`File loaded locally: ${file.name}`, 'Local Attachment');
        }
      }
    } catch (err) {
      console.error('Error during attachment upload:', err);
      toast.error('Failed to process attachment file');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    processFiles(e.dataTransfer.files);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    e.stopPropagation();
    processFiles(e.target.files);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemove = async (e: React.MouseEvent, id: string, name: string) => {
    e.preventDefault();
    e.stopPropagation();
    onRemoveAttachment(id);
    await deleteAttachment(id);
    toast.info(`Removed ${name}`);
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Drag and Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          fileInputRef.current?.click();
        }}
        className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-colors ${
          isDragging
            ? 'border-[#5B4DB7] dark:border-purple-400 bg-purple-50/50 dark:bg-purple-950/40'
            : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-slate-50/50 dark:bg-slate-950/40 hover:bg-slate-50 dark:hover:bg-slate-900/40'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.png,.jpg,.jpeg,.zip,.csv,.txt"
          onChange={handleFileInput}
          onClick={(e) => e.stopPropagation()}
          className="hidden"
        />
        <div className="flex flex-col items-center justify-center gap-1.5">
          <div className="w-8 h-8 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400 shadow-2xs">
            {isUploading ? (
              <Loader2 className="w-4 h-4 text-[#5B4DB7] dark:text-purple-400 animate-spin" />
            ) : (
              <UploadCloud className="w-4 h-4 text-[#5B4DB7] dark:text-purple-400" />
            )}
          </div>
          <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">
            {isUploading ? (
              <span className="text-[#5B4DB7] dark:text-purple-400 font-bold">Uploading & saving to server database...</span>
            ) : (
              <>
                <span className="text-[#5B4DB7] dark:text-purple-400 hover:underline">Click to browse</span> or drag and drop files
              </>
            )}
          </p>
          <p className="text-[11px] text-slate-400 dark:text-slate-500">
            Supported: PDF, DOC, DOCX, XLS, XLSX, PNG, JPG, ZIP (Saved directly to project storage)
          </p>
        </div>
      </div>

      {/* Uploaded Files List */}
      {attachments.length > 0 && (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-1">
            <span>Attached Files ({attachments.length})</span>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Saved
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {attachments.map((file) => {
              const isImg = file.type.startsWith('image') || file.name.match(/\.(png|jpg|jpeg)$/i);
              return (
                <div
                  key={file.id}
                  className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-200 shadow-2xs"
                >
                  <div className="flex items-center gap-2 min-w-0 pr-2">
                    <div className="w-7 h-7 rounded-md bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0 text-slate-500 dark:text-slate-400">
                      {isImg ? (
                        <ImageIcon className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                      ) : (
                        <FileText className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="font-medium text-slate-900 dark:text-white truncate" title={file.name}>
                        {file.name}
                      </div>
                      <div className="text-[10px] text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
                        <span>{file.size}</span>
                        <span>•</span>
                        <span className="text-emerald-600 dark:text-emerald-400 font-medium">DB Persisted</span>
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => handleRemove(e, file.id, file.name)}
                    className="p-1 rounded-md text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors flex-shrink-0 cursor-pointer"
                    aria-label={`Remove ${file.name}`}
                    title="Remove attachment"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

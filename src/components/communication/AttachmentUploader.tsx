import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, Image as ImageIcon, X, Paperclip } from 'lucide-react';
import { EmailAttachment } from '../../types/communication';

interface AttachmentUploaderProps {
  attachments: EmailAttachment[];
  onAddAttachment: (attachment: EmailAttachment) => void;
  onRemoveAttachment: (id: string) => void;
  className?: string;
}

export const AttachmentUploader: React.FC<AttachmentUploaderProps> = ({
  attachments,
  onAddAttachment,
  onRemoveAttachment,
  className = '',
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const processFiles = (files: FileList | null) => {
    if (!files) return;
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
      const sizeKB = Math.round(file.size / 1024);
      const sizeStr = file.size > 1024 * 1024 ? `${sizeMB} MB` : `${sizeKB} KB`;

      onAddAttachment({
        id: `att-${Date.now()}-${i}`,
        name: file.name,
        size: sizeStr,
        type: file.type || 'application/octet-stream',
      });
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    processFiles(e.dataTransfer.files);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    processFiles(e.target.files);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Drag and Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-colors ${
          isDragging
            ? 'border-[#5B4DB7] bg-purple-50/50'
            : 'border-slate-200 hover:border-slate-300 bg-slate-50/50 hover:bg-slate-50'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"
          onChange={handleFileInput}
          className="hidden"
        />
        <div className="flex flex-col items-center justify-center gap-1.5">
          <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-500 shadow-2xs">
            <UploadCloud className="w-4 h-4 text-[#5B4DB7]" />
          </div>
          <p className="text-xs font-semibold text-slate-700">
            <span className="text-[#5B4DB7] hover:underline">Click to browse</span> or drag and drop files
          </p>
          <p className="text-[11px] text-slate-400">
            Supported: PDF, DOC, DOCX, XLS, XLSX, PNG, JPG (up to 25MB)
          </p>
        </div>
      </div>

      {/* Uploaded Files List */}
      {attachments.length > 0 && (
        <div className="space-y-1.5">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 px-1">
            Attached Files ({attachments.length})
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {attachments.map((file) => {
              const isImg = file.type.startsWith('image') || file.name.match(/\.(png|jpg|jpeg)$/i);
              return (
                <div
                  key={file.id}
                  className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200 text-xs text-slate-700 shadow-2xs"
                >
                  <div className="flex items-center gap-2 min-w-0 pr-2">
                    <div className="w-7 h-7 rounded-md bg-slate-100 flex items-center justify-center flex-shrink-0 text-slate-500">
                      {isImg ? (
                        <ImageIcon className="w-3.5 h-3.5 text-blue-600" />
                      ) : (
                        <FileText className="w-3.5 h-3.5 text-red-600" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="font-medium text-slate-900 truncate" title={file.name}>
                        {file.name}
                      </div>
                      <div className="text-[10px] text-slate-400">{file.size}</div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveAttachment(file.id);
                    }}
                    className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors flex-shrink-0"
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

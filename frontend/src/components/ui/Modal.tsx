import React from 'react';
import { ExclamationTriangleIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface ModalProps {
  isOpen: boolean;
  title: string;
  children: React.ReactNode;
  onClose?: () => void;
  closeOnBackdrop?: boolean;
  maxWidth?: string;
}

export function Modal({ isOpen, title, children, onClose, closeOnBackdrop = true, maxWidth = 'max-w-lg' }: ModalProps) {
  if (!isOpen) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={closeOnBackdrop ? onClose : undefined}
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div
        className={`relative w-full ${maxWidth} glass-card p-6 animate-bounce-in`}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-white">{title}</h3>
          {onClose && (
            <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
              <XMarkIcon className="w-5 h-5" />
            </button>
          )}
        </div>
        {children}
      </div>
    </div>
  );
}

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: 'danger' | 'primary';
}

export function ConfirmDialog({
  isOpen, title, message,
  confirmLabel = 'Confirm', cancelLabel = 'Cancel',
  onConfirm, onCancel, variant = 'primary'
}: ConfirmDialogProps) {
  return (
    <Modal isOpen={isOpen} title={title} onClose={onCancel} closeOnBackdrop={false}>
      <div className="text-gray-300 mb-6 leading-relaxed">{message}</div>
      <div className="flex gap-3 justify-end">
        <button onClick={onCancel} className="btn-secondary">
          {cancelLabel}
        </button>
        <button
          onClick={onConfirm}
          className={variant === 'danger' ? 'btn-danger' : 'btn-primary'}
        >
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
}

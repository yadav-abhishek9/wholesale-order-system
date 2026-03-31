// CREATE NEW FILE: frontend/src/components/ConfirmDialog.jsx
// Beautiful custom confirmation dialog to replace window.confirm

import { AlertTriangle, X } from 'lucide-react';

const ConfirmDialog = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'danger' // 'danger' or 'warning'
}) => {
  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[9999] animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className={`${
          type === 'danger' 
            ? 'bg-gradient-to-r from-red-600 to-pink-600' 
            : 'bg-gradient-to-r from-orange-600 to-yellow-500'
        } p-6`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-xl">
                <AlertTriangle size={24} className="text-white" />
              </div>
              <h3 className="text-xl font-bold text-white">{title}</h3>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-gray-700 text-lg mb-6">{message}</p>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={handleConfirm}
              className={`flex-1 py-3 rounded-xl font-bold text-white ${
                type === 'danger'
                  ? 'bg-gradient-to-r from-red-600 to-pink-600 hover:shadow-lg'
                  : 'bg-gradient-to-r from-orange-600 to-yellow-500 hover:shadow-lg'
              } transform hover:scale-[1.02] active:scale-[0.98] transition-all`}
            >
              {confirmText}
            </button>
            <button
              onClick={onClose}
              className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-200 transition-all"
            >
              {cancelText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
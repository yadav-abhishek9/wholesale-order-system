// CREATE NEW FILE: frontend/src/components/Alert.jsx
// Beautiful custom alert component to replace browser alerts

import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';
import { useState, useEffect } from 'react';

const Alert = ({ type = 'success', message, onClose, duration = 3000 }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      if (onClose) onClose();
    }, 300);
  };

  const config = {
    success: {
      icon: CheckCircle,
      bg: 'from-green-500 to-emerald-600',
      iconBg: 'bg-white/20'
    },
    error: {
      icon: XCircle,
      bg: 'from-red-500 to-pink-600',
      iconBg: 'bg-white/20'
    },
    warning: {
      icon: AlertTriangle,
      bg: 'from-orange-500 to-yellow-500',
      iconBg: 'bg-white/20'
    },
    info: {
      icon: Info,
      bg: 'from-blue-500 to-indigo-600',
      iconBg: 'bg-white/20'
    }
  };

  const { icon: Icon, bg, iconBg } = config[type];

  return (
    <div
      className={`fixed top-4 right-4 z-[9999] transition-all duration-300 ${
        isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full'
      }`}
    >
      <div className={`bg-gradient-to-r ${bg} text-white rounded-2xl shadow-2xl p-4 min-w-[300px] max-w-md`}>
        <div className="flex items-start gap-3">
          <div className={`${iconBg} p-2 rounded-xl`}>
            <Icon size={24} />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-white">{message}</p>
          </div>
          <button
            onClick={handleClose}
            className="text-white/80 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

// Alert Manager Component
let showAlertFunction = null;

export const AlertContainer = () => {
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    showAlertFunction = (type, message, duration) => {
      const id = Date.now();
      setAlerts((prev) => [...prev, { id, type, message, duration }]);
    };
  }, []);

  const removeAlert = (id) => {
    setAlerts((prev) => prev.filter((alert) => alert.id !== id));
  };

  return (
    <>
      {alerts.map((alert, index) => (
        <div
          key={alert.id}
          style={{ top: `${16 + index * 80}px` }}
          className="fixed right-4 z-[9999]"
        >
          <Alert
            type={alert.type}
            message={alert.message}
            duration={alert.duration}
            onClose={() => removeAlert(alert.id)}
          />
        </div>
      ))}
    </>
  );
};

// Helper function to show alerts
export const showAlert = (type, message, duration = 3000) => {
  if (showAlertFunction) {
    showAlertFunction(type, message, duration);
  } else {
    // Fallback to browser alert if component not mounted
    alert(message);
  }
};

export default Alert;
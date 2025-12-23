import React, { useEffect, useState } from 'react';

interface NotificationToastProps {
  message: string;
  type: 'success' | 'info';
  onClose: () => void;
}

const NotificationToast: React.FC<NotificationToastProps> = ({ message, type, onClose }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Fade in
    setVisible(true);

    const timer = setTimeout(() => {
      // Start fade out
      setVisible(false);
      // Fully close after transition
      setTimeout(onClose, 300);
    }, 5000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 300);
  };
  
  const typeStyles = {
    info: 'bg-blue-500',
    success: 'bg-accent',
  };

  return (
    <div
      role="alert"
      aria-live="assertive"
      className={`fixed top-5 left-5 w-auto max-w-sm p-4 rounded-lg shadow-xl text-white ${typeStyles[type]} transition-opacity duration-300 ${visible ? 'opacity-100' : 'opacity-0'} z-[100]`}
    >
      <div className="flex items-center justify-between">
        <p className="font-medium">{message}</p>
        <button onClick={handleClose} className="ml-4 mr-[-8px] mt-[-8px] text-xl font-bold opacity-80 hover:opacity-100">&times;</button>
      </div>
    </div>
  );
};

export default NotificationToast;

import React from 'react';
import { DownloadIcon, CloseIcon } from './icons';

interface ImageLightboxProps {
  imageUrl: string | null;
  onClose: () => void;
}

const ImageLightbox: React.FC<ImageLightboxProps> = ({ imageUrl, onClose }) => {
  if (!imageUrl) return null;

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `attachment-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center z-[110]"
      onClick={onClose}
    >
      <div 
        className="relative max-w-[90vw] max-h-[90vh] bg-white p-2 rounded-lg shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <img src={imageUrl} alt="Attachment preview" className="max-w-full max-h-full object-contain rounded" style={{maxHeight: '85vh'}} />
        <div className="absolute top-2 left-2 flex gap-2">
            <button 
                onClick={handleDownload} 
                className="p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-75 transition-colors"
                title="تحميل الصورة"
            >
                <DownloadIcon className="w-6 h-6" />
            </button>
            <button 
                onClick={onClose} 
                className="p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-75 transition-colors"
                title="إغلاق"
            >
                <CloseIcon className="w-6 h-6" />
            </button>
        </div>
      </div>
    </div>
  );
};

export default ImageLightbox;

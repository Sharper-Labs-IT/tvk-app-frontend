import React from 'react';
import { Download, FileSpreadsheet, Loader2 } from 'lucide-react';

interface ExportButtonsProps {
  onExportExcel: () => void;
  onExportPDF: () => void;
  isLoading?: boolean;
  disabled?: boolean;
}

const ExportButtons: React.FC<ExportButtonsProps> = ({
  onExportExcel,
  onExportPDF,
  isLoading = false,
  disabled = false,
}) => {
  return (
    <div className="flex gap-3 flex-wrap">
      <button
        onClick={onExportExcel}
        disabled={disabled || isLoading}
        className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <FileSpreadsheet className="w-4 h-4" />
        )}
        Export to Excel
      </button>

      <button
        onClick={onExportPDF}
        disabled={disabled || isLoading}
        className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Download className="w-4 h-4" />
        )}
        Export to PDF
      </button>
    </div>
  );
};

export default ExportButtons;

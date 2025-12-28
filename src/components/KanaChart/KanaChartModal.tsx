/**
 * KanaChartModal Component
 * Modal wrapper for the KanaChart component
 */

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import KanaChart from './KanaChart';

interface KanaChartModalProps {
  type: 'hiragana' | 'katakana';
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const KanaChartModal: React.FC<KanaChartModalProps> = ({
  type,
  open,
  onOpenChange,
}) => {
  const title = type === 'hiragana' ? 'Hiragana Chart' : 'Katakana Chart';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <KanaChart type={type} />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default KanaChartModal;


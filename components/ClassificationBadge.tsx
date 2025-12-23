
import React from 'react';
import { CustomerClassification } from '../types';

const classificationStyles: Record<CustomerClassification, string> = {
    [CustomerClassification.Bronze]: 'bg-badge-warning-bg text-badge-warning-text',
    [CustomerClassification.Silver]: 'bg-badge-muted-bg text-badge-muted-text',
    [CustomerClassification.Gold]: 'bg-badge-gold-bg text-badge-gold-text',
    [CustomerClassification.Platinum]: 'bg-badge-info-bg text-badge-info-text',
};

const ClassificationBadge: React.FC<{ classification: CustomerClassification }> = ({ classification }) => {
  return (
    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${classificationStyles[classification]}`}>
      {classification}
    </span>
  );
};

export default ClassificationBadge;

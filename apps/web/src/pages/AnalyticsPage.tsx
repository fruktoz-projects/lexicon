import React from 'react';
import { AnalyticsOverview } from '../components/analytics/AnalyticsOverview';

export const AnalyticsPage: React.FC = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      <AnalyticsOverview />
    </div>
  );
};

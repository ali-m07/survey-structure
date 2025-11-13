import React from 'react';

interface AIInsightCardProps {
  title: string;
  insight: string;
  confidence?: number;
  actions?: Array<{ label: string; onClick: () => void }>;
}

export const AIInsightCard: React.FC<AIInsightCardProps> = ({
  title,
  insight,
  confidence,
  actions,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-700 mb-4">{insight}</p>
      {confidence && (
        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Confidence</span>
            <span>{confidence}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full"
              style={{ width: `${confidence}%` }}
            />
          </div>
        </div>
      )}
      {actions && actions.length > 0 && (
        <div className="flex gap-2">
          {actions.map((action, index) => (
            <button
              key={index}
              onClick={action.onClick}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              {action.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};


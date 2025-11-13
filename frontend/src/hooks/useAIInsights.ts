import { useState } from 'react';

interface Insight {
  insights: string;
  key_points: string[];
  recommendations: string[];
}

export function useAIInsights() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateInsights = async (context: string, data: any) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/v1/ai/insights/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          context,
          data,
          insight_type: 'executive_summary',
        }),
      });

      if (response.ok) {
        const insights = await response.json();
        return { success: true, data: insights };
      } else {
        const errorData = await response.json();
        setError(errorData.detail || 'Failed to generate insights');
        return { success: false, error: errorData.detail };
      }
    } catch (err) {
      setError('Failed to generate insights');
      return { success: false, error: 'Failed to generate insights' };
    } finally {
      setLoading(false);
    }
  };

  const analyzeSentiment = async (text: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/v1/ai/sentiment/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ text, language: 'en' }),
      });

      if (response.ok) {
        const result = await response.json();
        return { success: true, data: result };
      } else {
        return { success: false, error: 'Failed to analyze sentiment' };
      }
    } catch (err) {
      return { success: false, error: 'Failed to analyze sentiment' };
    } finally {
      setLoading(false);
    }
  };

  const chatWithAI = async (prompt: string, model: string = 'gemma3') => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/v1/ai/models/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ prompt, model }),
      });

      if (response.ok) {
        const result = await response.json();
        return { success: true, data: result.response };
      } else {
        return { success: false, error: 'Failed to get AI response' };
      }
    } catch (err) {
      return { success: false, error: 'Failed to get AI response' };
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    generateInsights,
    analyzeSentiment,
    chatWithAI,
  };
}


import { useState, useEffect } from 'react';
import useSWR from 'swr';

interface Survey {
  id: string;
  title: string;
  description: string;
  status: string;
  participant_count: number;
  submission_count: number;
}

const fetcher = (url: string) =>
  fetch(url, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  }).then((res) => res.json());

export function useSurvey(surveyId?: string) {
  const { data, error, mutate } = useSWR<Survey>(
    surveyId ? `/api/v1/survey/surveys/${surveyId}/` : null,
    fetcher
  );

  const createSurvey = async (surveyData: Partial<Survey>) => {
    const response = await fetch('/api/v1/survey/surveys/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(surveyData),
    });

    if (response.ok) {
      const newSurvey = await response.json();
      mutate();
      return { success: true, data: newSurvey };
    } else {
      return { success: false, error: 'Failed to create survey' };
    }
  };

  const publishSurvey = async (id: string) => {
    const response = await fetch(`/api/v1/survey/surveys/${id}/publish/`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });

    if (response.ok) {
      mutate();
      return { success: true };
    } else {
      return { success: false, error: 'Failed to publish survey' };
    }
  };

  return {
    survey: data,
    loading: !error && !data,
    error,
    createSurvey,
    publishSurvey,
    refresh: mutate,
  };
}

export function useSurveys() {
  const { data, error, mutate } = useSWR<Survey[]>(
    '/api/v1/survey/surveys/',
    fetcher
  );

  return {
    surveys: data || [],
    loading: !error && !data,
    error,
    refresh: mutate,
  };
}


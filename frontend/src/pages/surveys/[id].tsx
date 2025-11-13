import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';

interface Section {
  id: number;
  title: string;
  description: string;
  order: number;
  questions: Question[];
}

interface Question {
  id: number;
  question_text: string;
  question_type: string;
  is_required: boolean;
  order: number;
  options: any[];
}

interface Survey {
  id: number;
  title: string;
  description: string;
  status: string;
  sections: Section[];
  participant_count: number;
  submission_count: number;
}

export default function SurveyDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [survey, setSurvey] = useState<Survey | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchSurvey();
    }
  }, [id]);

  const fetchSurvey = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:8003/api/v1/survey/surveys/${id}/`);
      if (response.ok) {
        const data = await response.json();
        setSurvey(data);
      }
    } catch (error) {
      console.error('Error fetching survey:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading survey...</p>
        </div>
      </div>
    );
  }

  if (!survey) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Survey not found</h1>
          <Link href="/surveys" className="text-blue-600 hover:text-blue-800">
            Back to Surveys
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Head>
        <title>{survey.title} - Survey Details</title>
      </Head>

      {/* Navigation */}
      <nav className="bg-white shadow-md mb-8">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="text-2xl font-bold text-blue-600">
              Enterprise Experience Platform
            </Link>
            <div className="flex gap-4">
              <Link href="/surveys" className="text-gray-700 hover:text-blue-600">
                Surveys
              </Link>
              <Link href={`/surveys/${id}/edit`} className="text-blue-600 font-semibold">
                Edit Survey
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{survey.title}</h1>
              <p className="text-gray-600 mb-4">{survey.description}</p>
              <div className="flex gap-4 text-sm text-gray-500">
                <span>Status: <span className="font-semibold">{survey.status}</span></span>
                <span>Participants: <span className="font-semibold">{survey.participant_count}</span></span>
                <span>Submissions: <span className="font-semibold">{survey.submission_count}</span></span>
              </div>
            </div>
            <Link
              href={`/surveys/${id}/edit`}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Edit Survey
            </Link>
          </div>
        </div>

        {/* Sections and Questions */}
        {survey.sections && survey.sections.length > 0 ? (
          <div className="space-y-6">
            {survey.sections.map((section) => (
              <div key={section.id} className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-semibold text-gray-800 mb-2">{section.title}</h2>
                {section.description && (
                  <p className="text-gray-600 mb-4">{section.description}</p>
                )}
                
                {section.questions && section.questions.length > 0 ? (
                  <div className="space-y-4 mt-4">
                    {section.questions.map((question, idx) => (
                      <div key={question.id} className="border-l-4 border-blue-500 pl-4 py-2">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-sm font-semibold text-gray-500">
                                Q{idx + 1}
                              </span>
                              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                                {question.question_type.replace('_', ' ').toUpperCase()}
                              </span>
                              {question.is_required && (
                                <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded">
                                  Required
                                </span>
                              )}
                            </div>
                            <p className="text-gray-800 font-medium">{question.question_text}</p>
                            {question.options && question.options.length > 0 && (
                              <div className="mt-2 space-y-1">
                                {question.options.map((option: any, optIdx: number) => (
                                  <div key={optIdx} className="text-sm text-gray-600">
                                    • {typeof option === 'string' ? option : option.label || option.value}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 italic mt-4">No questions in this section yet.</p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">No sections yet</h2>
            <p className="text-gray-600 mb-6">Add sections and questions to build your survey.</p>
            <Link
              href={`/surveys/${id}/edit`}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors inline-block"
            >
              Add Sections & Questions
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}


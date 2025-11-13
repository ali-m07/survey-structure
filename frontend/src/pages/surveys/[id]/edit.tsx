import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';

interface Section {
  id?: number;
  title: string;
  description: string;
  order: number;
  questions: Question[];
}

interface Question {
  id?: number;
  question_text: string;
  question_type: string;
  is_required: boolean;
  order: number;
  options: string[];
  section?: number;
}

interface Survey {
  id: number;
  title: string;
  description: string;
  status: string;
  sections: Section[];
}

const QUESTION_TYPES = [
  { value: 'text', label: 'Text Input' },
  { value: 'multiple_choice', label: 'Multiple Choice' },
  { value: 'single_choice', label: 'Single Choice' },
  { value: 'rating', label: 'Rating (1-5)' },
  { value: 'scale', label: 'Likert Scale' },
  { value: 'matrix', label: 'Matrix' },
  { value: 'ranking', label: 'Ranking' },
  { value: 'date', label: 'Date' },
];

const LIKERT_OPTIONS = [
  'Strongly Disagree',
  'Disagree',
  'Neutral',
  'Agree',
  'Strongly Agree'
];

export default function EditSurvey() {
  const router = useRouter();
  const { id } = router.query;
  const [survey, setSurvey] = useState<Survey | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sections, setSections] = useState<Section[]>([]);
  const [showAddSection, setShowAddSection] = useState(false);
  const [showAddQuestion, setShowAddQuestion] = useState<number | null>(null);
  const [newSection, setNewSection] = useState({ title: '', description: '' });
  const [newQuestion, setNewQuestion] = useState<Partial<Question>>({
    question_text: '',
    question_type: 'text',
    is_required: false,
    options: [],
  });

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
        setSections(data.sections || []);
      }
    } catch (error) {
      console.error('Error fetching survey:', error);
    } finally {
      setLoading(false);
    }
  };

  const addSection = async () => {
    if (!newSection.title.trim()) return;

    try {
      const sectionData = {
        survey: id,
        title: newSection.title,
        description: newSection.description,
        order: sections.length,
      };

      const response = await fetch('http://localhost:8003/api/v1/survey/sections/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sectionData),
      });

      if (response.ok) {
        const newSectionData = await response.json();
        setSections([...sections, { ...newSectionData, questions: [] }]);
        setNewSection({ title: '', description: '' });
        setShowAddSection(false);
      }
    } catch (error) {
      console.error('Error adding section:', error);
      alert('Failed to add section');
    }
  };

  const addQuestion = async (sectionId: number) => {
    if (!newQuestion.question_text?.trim()) return;

    try {
      // Auto-populate options for Likert scale
      let options = newQuestion.options || [];
      if (newQuestion.question_type === 'scale') {
        options = LIKERT_OPTIONS;
      } else if (newQuestion.question_type === 'rating') {
        options = ['1', '2', '3', '4', '5'];
      } else if (newQuestion.question_type === 'multiple_choice' || newQuestion.question_type === 'single_choice') {
        // Options should be provided by user
        if (!options || options.length === 0) {
          alert('Please add at least one option for this question type');
          return;
        }
      }

      const questionData = {
        section: sectionId,
        question_text: newQuestion.question_text,
        question_type: newQuestion.question_type,
        is_required: newQuestion.is_required || false,
        order: sections.find(s => s.id === sectionId)?.questions.length || 0,
        options: options,
      };

      const response = await fetch('http://localhost:8003/api/v1/survey/questions/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(questionData),
      });

      if (response.ok) {
        const newQuestionData = await response.json();
        setSections(sections.map(section =>
          section.id === sectionId
            ? { ...section, questions: [...(section.questions || []), newQuestionData] }
            : section
        ));
        setNewQuestion({
          question_text: '',
          question_type: 'text',
          is_required: false,
          options: [],
        });
        setShowAddQuestion(null);
      }
    } catch (error) {
      console.error('Error adding question:', error);
      alert('Failed to add question');
    }
  };

  const addQuestionOption = () => {
    const option = prompt('Enter option text:');
    if (option) {
      setNewQuestion({
        ...newQuestion,
        options: [...(newQuestion.options || []), option],
      });
    }
  };

  const removeQuestionOption = (index: number) => {
    setNewQuestion({
      ...newQuestion,
      options: newQuestion.options?.filter((_, i) => i !== index) || [],
    });
  };

  const deleteSection = async (sectionId: number) => {
    if (!confirm('Are you sure you want to delete this section?')) return;

    try {
      const response = await fetch(`http://localhost:8003/api/v1/survey/sections/${sectionId}/`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setSections(sections.filter(s => s.id !== sectionId));
      }
    } catch (error) {
      console.error('Error deleting section:', error);
    }
  };

  const deleteQuestion = async (sectionId: number, questionId: number) => {
    if (!confirm('Are you sure you want to delete this question?')) return;

    try {
      const response = await fetch(`http://localhost:8003/api/v1/survey/questions/${questionId}/`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setSections(sections.map(section =>
          section.id === sectionId
            ? { ...section, questions: section.questions.filter(q => q.id !== questionId) }
            : section
        ));
      }
    } catch (error) {
      console.error('Error deleting question:', error);
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
        <title>Edit {survey.title} - Survey Builder</title>
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
              <Link href={`/surveys/${id}`} className="text-gray-700 hover:text-blue-600">
                View Survey
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{survey.title}</h1>
          <p className="text-gray-600">{survey.description}</p>
        </div>

        {/* Sections */}
        <div className="space-y-6">
          {sections.map((section, sectionIdx) => (
            <div key={section.id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                    Section {sectionIdx + 1}: {section.title}
                  </h2>
                  {section.description && (
                    <p className="text-gray-600">{section.description}</p>
                  )}
                </div>
                <button
                  onClick={() => deleteSection(section.id!)}
                  className="text-red-600 hover:text-red-800 text-sm"
                >
                  Delete Section
                </button>
              </div>

              {/* Questions */}
              {section.questions && section.questions.length > 0 && (
                <div className="space-y-3 mb-4">
                  {section.questions.map((question, qIdx) => (
                    <div key={question.id} className="border-l-4 border-blue-500 pl-4 py-2 bg-gray-50 rounded">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-semibold text-gray-500">Q{qIdx + 1}</span>
                            <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">
                              {question.question_type.replace('_', ' ')}
                            </span>
                            {question.is_required && (
                              <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded">
                                Required
                              </span>
                            )}
                          </div>
                          <p className="text-gray-800 font-medium">{question.question_text}</p>
                          {question.options && question.options.length > 0 && (
                            <div className="mt-2 text-sm text-gray-600">
                              Options: {question.options.join(', ')}
                            </div>
                          )}
                        </div>
                        <button
                          onClick={() => deleteQuestion(section.id!, question.id!)}
                          className="text-red-600 hover:text-red-800 text-sm ml-4"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Add Question */}
              {showAddQuestion === section.id ? (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-50">
                  <h3 className="font-semibold text-gray-800 mb-4">Add Question</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Question Text
                      </label>
                      <textarea
                        value={newQuestion.question_text}
                        onChange={(e) => setNewQuestion({ ...newQuestion, question_text: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        rows={2}
                        placeholder="Enter your question..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Question Type
                      </label>
                      <select
                        value={newQuestion.question_type}
                        onChange={(e) => {
                          const type = e.target.value;
                          setNewQuestion({
                            ...newQuestion,
                            question_type: type,
                            options: type === 'scale' ? LIKERT_OPTIONS : type === 'rating' ? ['1', '2', '3', '4', '5'] : [],
                          });
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      >
                        {QUESTION_TYPES.map((type) => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    {(newQuestion.question_type === 'multiple_choice' || newQuestion.question_type === 'single_choice') && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Options
                        </label>
                        <div className="space-y-2">
                          {newQuestion.options?.map((option, idx) => (
                            <div key={idx} className="flex items-center gap-2">
                              <input
                                type="text"
                                value={option}
                                onChange={(e) => {
                                  const newOptions = [...(newQuestion.options || [])];
                                  newOptions[idx] = e.target.value;
                                  setNewQuestion({ ...newQuestion, options: newOptions });
                                }}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                                placeholder="Option text"
                              />
                              <button
                                onClick={() => removeQuestionOption(idx)}
                                className="text-red-600 hover:text-red-800"
                              >
                                Remove
                              </button>
                            </div>
                          ))}
                          <button
                            onClick={addQuestionOption}
                            className="text-blue-600 hover:text-blue-800 text-sm"
                          >
                            + Add Option
                          </button>
                        </div>
                      </div>
                    )}
                    {(newQuestion.question_type === 'scale' || newQuestion.question_type === 'rating') && (
                      <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded">
                        {newQuestion.question_type === 'scale' 
                          ? `Likert Scale options: ${LIKERT_OPTIONS.join(', ')}`
                          : `Rating options: 1, 2, 3, 4, 5`}
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="required"
                        checked={newQuestion.is_required}
                        onChange={(e) => setNewQuestion({ ...newQuestion, is_required: e.target.checked })}
                        className="rounded"
                      />
                      <label htmlFor="required" className="text-sm text-gray-700">
                        Required question
                      </label>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => addQuestion(section.id!)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Add Question
                      </button>
                      <button
                        onClick={() => {
                          setShowAddQuestion(null);
                          setNewQuestion({
                            question_text: '',
                            question_type: 'text',
                            is_required: false,
                            options: [],
                          });
                        }}
                        className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowAddQuestion(section.id!)}
                  className="w-full border-2 border-dashed border-gray-300 rounded-lg p-4 text-gray-600 hover:border-blue-500 hover:text-blue-600 transition-colors"
                >
                  + Add Question to this Section
                </button>
              )}
            </div>
          ))}

          {/* Add Section */}
          {showAddSection ? (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Add New Section</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Section Title
                  </label>
                  <input
                    type="text"
                    value={newSection.title}
                    onChange={(e) => setNewSection({ ...newSection, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="e.g., Demographics, Experience, Feedback"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Section Description (optional)
                  </label>
                  <textarea
                    value={newSection.description}
                    onChange={(e) => setNewSection({ ...newSection, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    rows={2}
                    placeholder="Brief description of this section"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={addSection}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Add Section
                  </button>
                  <button
                    onClick={() => {
                      setShowAddSection(false);
                      setNewSection({ title: '', description: '' });
                    }}
                    className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowAddSection(true)}
              className="w-full border-2 border-dashed border-gray-300 rounded-lg p-8 text-gray-600 hover:border-blue-500 hover:text-blue-600 transition-colors bg-white"
            >
              + Add New Section
            </button>
          )}
        </div>

        {/* Save Button */}
        <div className="mt-8 flex justify-end gap-4">
          <Link
            href={`/surveys/${id}`}
            className="bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Cancel
          </Link>
          <Link
            href={`/surveys/${id}`}
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
          >
            Save & View Survey
          </Link>
        </div>
      </main>
    </div>
  );
}


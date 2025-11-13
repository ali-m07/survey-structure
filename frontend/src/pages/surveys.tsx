import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';

interface Survey {
  id: string;
  title: string;
  description: string;
  status: string;
  participant_count: number;
  submission_count: number;
  created_at: string;
  blockchain_hash?: string;
}

export default function Surveys() {
  const router = useRouter();
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newSurvey, setNewSurvey] = useState({
    title: '',
    description: '',
    status: 'draft',
  });

  React.useEffect(() => {
    fetchSurveys();
  }, []);

  const fetchSurveys = async () => {
    try {
      setLoading(true);
      // Try to fetch from the survey service
      const response = await fetch('http://localhost:8003/api/v1/survey/surveys/', {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setSurveys(Array.isArray(data) ? data : data.results || []);
      } else {
        // If service is not available, show empty state with message
        console.log('Survey service not available');
        setSurveys([]);
      }
    } catch (error) {
      console.error('Error fetching surveys:', error);
      setSurveys([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSurvey = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:8003/api/v1/survey/surveys/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newSurvey),
      });

      if (response.ok) {
        const createdSurvey = await response.json();
        setSurveys([...surveys, createdSurvey]);
        setShowCreateModal(false);
        setNewSurvey({ title: '', description: '', status: 'draft' });
      } else {
        alert('Failed to create survey. Please check if the survey service is running.');
      }
    } catch (error) {
      console.error('Error creating survey:', error);
      alert('Failed to create survey. Please check if the survey service is running.');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'closed':
        return 'bg-red-100 text-red-800';
      case 'archived':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Head>
        <title>Surveys - Enterprise Experience Platform</title>
        <meta name="description" content="Manage and create surveys" />
      </Head>

      {/* Navigation */}
      <nav className="bg-white shadow-md mb-8">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="text-2xl font-bold text-blue-600">
              Enterprise Experience Platform
            </Link>
            <div className="flex gap-4">
              <Link href="/" className="text-gray-700 hover:text-blue-600">
                Home
              </Link>
              <Link href="/surveys" className="text-blue-600 font-semibold">
                Surveys
              </Link>
              <Link href="/analytics" className="text-gray-700 hover:text-blue-600">
                Analytics
              </Link>
              <Link href="/ai-insights" className="text-gray-700 hover:text-blue-600">
                AI Insights
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Surveys</h1>
            <p className="text-gray-600">Create and manage your surveys</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            + Create Survey
          </button>
        </div>

        {/* Surveys List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading surveys...</p>
          </div>
        ) : surveys.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">No Surveys Yet</h2>
            <p className="text-gray-600 mb-6">
              Get started by creating your first survey. Surveys help you gather feedback and insights from your team.
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create Your First Survey
            </button>
            <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>Note:</strong> Make sure the Survey Engine Service is running on port 8003 to create and manage surveys.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {surveys.map((survey) => (
              <div
                key={survey.id}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-semibold text-gray-800">{survey.title}</h3>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                      survey.status
                    )}`}
                  >
                    {survey.status}
                  </span>
                </div>
                <p className="text-gray-600 mb-4 line-clamp-2">{survey.description}</p>
                <div className="flex justify-between text-sm text-gray-500 mb-4">
                  <span>Participants: {survey.participant_count || 0}</span>
                  <span>Submissions: {survey.submission_count || 0}</span>
                </div>
                {survey.blockchain_hash && (
                  <div className="mb-4">
                    <p className="text-xs text-gray-500">Blockchain: Verified ✓</p>
                  </div>
                )}
                <div className="flex gap-2">
                  <Link
                    href={`/surveys/${survey.id}`}
                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm text-center"
                  >
                    View
                  </Link>
                  <Link
                    href={`/surveys/${survey.id}/edit`}
                    className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors text-sm text-center"
                  >
                    Edit
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create Survey Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full mx-4">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Create New Survey</h2>
              <form onSubmit={handleCreateSurvey}>
                <div className="mb-4">
                  <label className="block text-gray-700 font-medium mb-2">Title</label>
                  <input
                    type="text"
                    value={newSurvey.title}
                    onChange={(e) => setNewSurvey({ ...newSurvey, title: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 font-medium mb-2">Description</label>
                  <textarea
                    value={newSurvey.description}
                    onChange={(e) => setNewSurvey({ ...newSurvey, description: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={4}
                    required
                  />
                </div>
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Create Survey
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}


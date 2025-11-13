import React from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';

export default function Reports() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Head>
        <title>Reports - Enterprise Experience Platform</title>
        <meta name="description" content="Generate and view reports" />
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
              <Link href="/surveys" className="text-gray-700 hover:text-blue-600">
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
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Reports</h1>
          <p className="text-gray-600">Generate and view comprehensive reports</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Report Generator</h2>
          <p className="text-gray-600 mb-6">
            Create detailed reports based on survey data, analytics, and insights.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <button className="bg-blue-600 text-white px-6 py-4 rounded-lg hover:bg-blue-700 transition-colors text-left">
              <h3 className="text-lg font-semibold mb-2">Survey Reports</h3>
              <p className="text-sm opacity-90">Generate reports from survey responses</p>
            </button>
            <button className="bg-green-600 text-white px-6 py-4 rounded-lg hover:bg-green-700 transition-colors text-left">
              <h3 className="text-lg font-semibold mb-2">Analytics Reports</h3>
              <p className="text-sm opacity-90">Create analytics and trend reports</p>
            </button>
            <button className="bg-purple-600 text-white px-6 py-4 rounded-lg hover:bg-purple-700 transition-colors text-left">
              <h3 className="text-lg font-semibold mb-2">AI Insights Reports</h3>
              <p className="text-sm opacity-90">Generate AI-powered insight reports</p>
            </button>
            <button className="bg-orange-600 text-white px-6 py-4 rounded-lg hover:bg-orange-700 transition-colors text-left">
              <h3 className="text-lg font-semibold mb-2">Executive Summary</h3>
              <p className="text-sm opacity-90">Create executive summary reports</p>
            </button>
          </div>

          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Note:</strong> Report generation features will be available once surveys and data are available.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}


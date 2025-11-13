import React from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';

export default function Analytics() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Head>
        <title>Analytics - Enterprise Experience Platform</title>
        <meta name="description" content="View analytics and insights" />
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
              <Link href="/analytics" className="text-blue-600 font-semibold">
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
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Analytics</h1>
          <p className="text-gray-600">View detailed analytics and insights</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Analytics Dashboard</h2>
          <p className="text-gray-600 mb-6">
            This page will display comprehensive analytics including survey responses, engagement metrics, and trend analysis.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-blue-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Total Surveys</h3>
              <p className="text-3xl font-bold text-blue-600">0</p>
            </div>
            <div className="bg-green-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Total Responses</h3>
              <p className="text-3xl font-bold text-green-600">0</p>
            </div>
            <div className="bg-purple-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Response Rate</h3>
              <p className="text-3xl font-bold text-purple-600">0%</p>
            </div>
          </div>

          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Note:</strong> Analytics data will be displayed here once surveys are created and responses are collected.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}


import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';

export default function Home() {
  const router = useRouter();
  const [services, setServices] = useState<Array<{name: string; status: string; url: string}>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkServices();
  }, []);

  const checkServices = async () => {
    const serviceList = [
      { name: 'AI/ML Service', url: 'http://localhost:8004/health', port: 8004 },
      { name: 'Identity Service', url: 'http://localhost:8001/health', port: 8001 },
      { name: 'Organization Service', url: 'http://localhost:8002/health', port: 8002 },
      { name: 'Survey Engine Service', url: 'http://localhost:8003/health', port: 8003 },
      { name: 'Blockchain Service', url: 'http://localhost:8012/health', port: 8012 },
      { name: 'Notification Service', url: 'http://localhost:8009/health', port: 8009 },
    ];

    const statuses = await Promise.all(
      serviceList.map(async (service) => {
        try {
          const response = await fetch(service.url);
          const data = await response.json();
          return {
            name: service.name,
            status: response.ok ? '✅ Running' : '❌ Error',
            url: `http://localhost:${service.port}`,
          };
        } catch (error) {
          return {
            name: service.name,
            status: '❌ Not Running',
            url: `http://localhost:${service.port}`,
          };
        }
      })
    );

    setServices(statuses);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Head>
        <title>Enterprise Experience Platform</title>
        <meta name="description" content="Enterprise Experience Platform - Home" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Navigation */}
      <nav className="bg-white shadow-md mb-8">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="text-2xl font-bold text-blue-600">
              Enterprise Experience Platform
            </Link>
            <div className="flex gap-4">
              <Link href="/" className="text-blue-600 font-semibold">
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
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Enterprise Experience Platform
          </h1>
          <p className="text-xl text-gray-600">
            Comprehensive platform for employee engagement and experience management
          </p>
        </div>

        {/* Service Status Cards */}
        <div className="mb-8">
          <h2 className="text-3xl font-semibold text-gray-800 mb-6">Service Status</h2>
          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-gray-600">Checking services...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((service, index) => (
                <div
                  key={index}
                  className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
                >
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">{service.name}</h3>
                  <p className="text-lg mb-4">{service.status}</p>
                  <a
                    href={service.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 underline"
                  >
                    {service.url}
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h2 className="text-3xl font-semibold text-gray-800 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button
              onClick={() => router.push('/surveys')}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create Survey
            </button>
            <button
              onClick={() => router.push('/analytics')}
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
            >
              View Analytics
            </button>
            <button
              onClick={() => router.push('/ai-insights')}
              className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
            >
              AI Insights
            </button>
            <button
              onClick={() => router.push('/reports')}
              className="bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition-colors"
            >
              Generate Reports
            </button>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">🤖 AI-Powered Insights</h3>
            <p className="text-gray-600">
              Leverage Gemma3 AI model for sentiment analysis, predictive analytics, and generative insights.
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">📊 Survey Engine</h3>
            <p className="text-gray-600">
              Create and manage surveys with advanced customization options and real-time analytics.
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">🔗 Blockchain Integration</h3>
            <p className="text-gray-600">
              Tamper-proof records and secure data storage using blockchain technology.
            </p>
          </div>
        </div>

        {/* Test AI Service */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-8">
          <h2 className="text-3xl font-semibold text-gray-800 mb-4">Test AI Service (Gemma3)</h2>
          <p className="text-gray-600 mb-4">
            Test the AI/ML service directly from the browser
          </p>
          <a
            href="http://localhost:8004/docs"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
          >
            Open AI Service API Docs
          </a>
        </div>
      </main>

      <footer className="text-center py-8 text-gray-600">
        <p>Enterprise Experience Platform © 2024</p>
      </footer>
    </div>
  );
}


import React, { useState, useEffect } from 'react';
import { 
  Upload, 
  FileText, 
  BarChart3, 
  Download, 
  Camera, 
  Phone, 
  CheckCircle, 
  XCircle,
  TrendingUp,
  Clock
} from 'lucide-react';
import { Toaster } from 'react-hot-toast';
import { API_BASE_URL } from '../config';
import ScreenshotUpload from './ScreenshotUpload';
import PhoneNumbersList from './PhoneNumbersList';
import ExportData from './ExportData';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('upload');
  const [stats, setStats] = useState({
    screenshots: {
      total: 0,
      processed: 0,
      unprocessed: 0
    },
    phoneNumbers: {
      total: 0,
      valid: 0,
      invalid: 0
    }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const [screenshotStatsRes, phoneStatsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/screenshots/stats`),
        fetch(`${API_BASE_URL}/api/phone-numbers/stats`)
      ]);

      if (!screenshotStatsRes.ok || !phoneStatsRes.ok) {
        throw new Error('Failed to fetch statistics');
      }

      const [screenshotStats, phoneStats] = await Promise.all([
        screenshotStatsRes.json(),
        phoneStatsRes.json()
      ]);

      setStats({
        screenshots: {
          total: screenshotStats.data.totalScreenshots,
          processed: screenshotStats.data.processedScreenshots,
          unprocessed: screenshotStats.data.unprocessedScreenshots
        },
        phoneNumbers: {
          total: phoneStats.data.totalPhoneNumbers,
          valid: phoneStats.data.validPhoneNumbers,
          invalid: phoneStats.data.invalidPhoneNumbers
        }
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
      toast.error('Failed to fetch statistics');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'upload', label: 'Upload Screenshot', icon: Upload },
    { id: 'phone-numbers', label: 'Phone Numbers', icon: Phone },
    { id: 'export', label: 'Export Data', icon: Download }
  ];

  const StatCard = ({ title, value, icon: Icon, color, subtitle }) => (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'upload':
        return <ScreenshotUpload onUploadSuccess={fetchStats} />;
      case 'phone-numbers':
        return <PhoneNumbersList />;
      case 'export':
        return <ExportData />;
      default:
        return <ScreenshotUpload onUploadSuccess={fetchStats} />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Chrome Extension Dashboard</h1>
              <p className="text-gray-600 mt-1">Manage screenshots and extracted phone numbers</p>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Clock className="h-4 w-4" />
              <span>Last updated: {new Date().toLocaleTimeString()}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Screenshots"
            value={stats.screenshots.total}
            icon={Camera}
            color="bg-blue-500"
            subtitle={`${stats.screenshots.processed} processed`}
          />
          <StatCard
            title="Phone Numbers Found"
            value={stats.phoneNumbers.total}
            icon={Phone}
            color="bg-green-500"
            subtitle={`${stats.phoneNumbers.valid} valid`}
          />
          <StatCard
            title="Processing Rate"
            value={stats.screenshots.total > 0 ? Math.round((stats.screenshots.processed / stats.screenshots.total) * 100) : 0}
            icon={TrendingUp}
            color="bg-purple-500"
            subtitle="% of screenshots processed"
          />
          <StatCard
            title="Validity Rate"
            value={stats.phoneNumbers.total > 0 ? Math.round((stats.phoneNumbers.valid / stats.phoneNumbers.total) * 100) : 0}
            icon={CheckCircle}
            color="bg-orange-500"
            subtitle="% of valid numbers"
          />
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {renderContent()}
          </div>
        </div>
      </div>
      
      {/* Toast notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#10B981',
              secondary: '#fff',
            },
          },
          error: {
            duration: 5000,
            iconTheme: {
              primary: '#EF4444',
              secondary: '#fff',
            },
          },
        }}
      />
    </div>
  );
};

export default Dashboard;

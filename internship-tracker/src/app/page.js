'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, Settings, Plus, Send, Target, Flame } from 'lucide-react';

const InternshipTracker = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [applications, setApplications] = useState([]);
  const [settings, setSettings] = useState({
    email: '',
    discord: '',
    phone: '',
    instagram: '',
    channels: []
  });
  const [newApplication, setNewApplication] = useState('');
  const [streak, setStreak] = useState(0);
  const [loading, setLoading] = useState(false);

  // Load data on component mount
  useEffect(() => {
    loadApplications();
    loadSettings();
  }, []);

  const loadApplications = async () => {
    try {
      const response = await fetch('/api/applications');
      if (response.ok) {
        const data = await response.json();
        setApplications(data.applications || []);
        setStreak(data.streak || 0);
      }
    } catch (error) {
      console.error('Error loading applications:', error);
    }
  };

  const loadSettings = async () => {
    try {
      const response = await fetch('/api/settings');
      if (response.ok) {
        const data = await response.json();
        setSettings(data);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const handleSettingsChange = (field, value) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleChannelToggle = (channel) => {
    setSettings(prev => ({
      ...prev,
      channels: prev.channels.includes(channel)
        ? prev.channels.filter(c => c !== channel)
        : [...prev.channels, channel]
    }));
  };

  const handleAddApplication = async () => {
    if (!newApplication.trim()) return;

    setLoading(true);
    try {
      const response = await fetch('/api/applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: newApplication,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setApplications(prev => [result.application, ...prev]);
        setNewApplication('');
        setStreak(result.streak);
      }
    } catch (error) {
      console.error('Error adding application:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        alert('Settings saved successfully!');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTestNotification = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/test-notification', {
        method: 'POST',
      });

      if (response.ok) {
        alert('Test notification sent!');
      }
    } catch (error) {
      console.error('Error sending test notification:', error);
    } finally {
      setLoading(false);
    }
  };

  const extractCompanyName = (url) => {
    try {
      const domain = new URL(url).hostname;
      return domain.split('.')[0].charAt(0).toUpperCase() + domain.split('.')[0].slice(1);
    } catch {
      return 'Unknown Company';
    }
  };

  const getApplicationsForDate = (date) => {
    return applications.filter(app => app.date === date);
  };

  const getHeatmapColor = (count) => {
    if (count === 0) return 'bg-gray-100';
    if (count === 1) return 'bg-green-200';
    if (count === 2) return 'bg-green-300';
    if (count === 3) return 'bg-green-400';
    return 'bg-green-500';
  };

  const generateHeatmapData = () => {
    const data = [];
    const today = new Date();

    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateString = date.toISOString().split('T')[0];
      const count = getApplicationsForDate(dateString).length;

      data.push({
        date: dateString,
        count,
        day: date.getDate(),
        month: date.toLocaleDateString('en-US', { month: 'short' })
      });
    }

    return data;
  };

  const heatmapData = generateHeatmapData();
  const todayApplications = getApplicationsForDate(new Date().toISOString().split('T')[0]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Target className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">Internship Tracker</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 bg-orange-100 px-3 py-1 rounded-full">
                <Flame className="h-4 w-4 text-orange-600" />
                <span className="text-sm font-medium text-orange-700">{streak} day streak</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex space-x-1 bg-white rounded-lg p-1 shadow-sm mb-6">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${activeTab === 'dashboard'
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
              }`}
          >
            <Calendar className="h-4 w-4" />
            <span>Dashboard</span>
          </button>
          <button
            onClick={() => setActiveTab('add')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${activeTab === 'add'
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
              }`}
          >
            <Plus className="h-4 w-4" />
            <span>Add Application</span>
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${activeTab === 'settings'
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
              }`}
          >
            <Settings className="h-4 w-4" />
            <span>Settings</span>
          </button>
        </div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Applications</p>
                    <p className="text-3xl font-bold text-blue-600">{applications.length}</p>
                  </div>
                  <Target className="h-8 w-8 text-blue-600 opacity-60" />
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Today's Applications</p>
                    <p className="text-3xl font-bold text-green-600">{todayApplications.length}</p>
                  </div>
                  <Calendar className="h-8 w-8 text-green-600 opacity-60" />
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Current Streak</p>
                    <p className="text-3xl font-bold text-orange-600">{streak}</p>
                  </div>
                  <Flame className="h-8 w-8 text-orange-600 opacity-60" />
                </div>
              </div>
            </div>

            {/* Heatmap */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Application Activity (Last 30 Days)</h3>
              <div className="grid grid-cols-10 gap-2">
                {heatmapData.map((day, index) => (
                  <div key={index} className="text-center">
                    <div
                      className={`w-8 h-8 rounded ${getHeatmapColor(day.count)} border border-gray-200 flex items-center justify-center text-xs font-medium`}
                      title={`${day.date}: ${day.count} applications`}
                    >
                      {day.day}
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between mt-4 text-sm text-gray-600">
                <span>Less</span>
                <div className="flex space-x-1">
                  <div className="w-3 h-3 bg-gray-100 rounded"></div>
                  <div className="w-3 h-3 bg-green-200 rounded"></div>
                  <div className="w-3 h-3 bg-green-300 rounded"></div>
                  <div className="w-3 h-3 bg-green-400 rounded"></div>
                  <div className="w-3 h-3 bg-green-500 rounded"></div>
                </div>
                <span>More</span>
              </div>
            </div>

            {/* Recent Applications */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Applications</h3>
              <div className="space-y-3">
                {applications.slice(0, 10).map((app) => (
                  <div key={app._id} className="flex items-center justify-between py-3 px-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-blue-600">
                          {app.company?.charAt(0) || 'U'}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{app.company}</p>
                        <p className="text-sm text-gray-600">{app.date}</p>
                      </div>
                    </div>
                    <a
                      href={app.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      View Job
                    </a>
                  </div>
                ))}
                {applications.length === 0 && (
                  <p className="text-gray-500 text-center py-8">No applications yet. Add your first one!</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Add Application Tab */}
        {activeTab === 'add' && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Application</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Job Application URL
                </label>
                <input
                  type="url"
                  value={newApplication}
                  onChange={(e) => setNewApplication(e.target.value)}
                  placeholder="https://company.com/careers/job-id"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <button
                onClick={handleAddApplication}
                disabled={loading}
                className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                <Plus className="h-4 w-4" />
                <span>{loading ? 'Adding...' : 'Add Application'}</span>
              </button>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Notification Settings</h3>

            <div className="space-y-6">
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-4">Contact Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input
                      type="email"
                      value={settings.email}
                      onChange={(e) => handleSettingsChange('email', e.target.value)}
                      placeholder="your.email@example.com"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Discord Webhook</label>
                    <input
                      type="url"
                      value={settings.discord}
                      onChange={(e) => handleSettingsChange('discord', e.target.value)}
                      placeholder="https://discord.com/api/webhooks/..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                    <input
                      type="tel"
                      value={settings.phone}
                      onChange={(e) => handleSettingsChange('phone', e.target.value)}
                      placeholder="+1 (555) 123-4567"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Instagram Handle</label>
                    <input
                      type="text"
                      value={settings.instagram}
                      onChange={(e) => handleSettingsChange('instagram', e.target.value)}
                      placeholder="@username"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-md font-medium text-gray-900 mb-4">Notification Channels</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { key: 'email', label: 'Email', icon: '📧' },
                    { key: 'discord', label: 'Discord', icon: '💬' },
                    { key: 'phone', label: 'SMS', icon: '📱' },
                    { key: 'instagram', label: 'Instagram', icon: '📸' }
                  ].map((channel) => (
                    <label key={channel.key} className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="checkbox"
                        checked={settings.channels.includes(channel.key)}
                        onChange={() => handleChannelToggle(channel.key)}
                        className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="text-lg">{channel.icon}</span>
                      <span className="text-sm font-medium text-gray-900">{channel.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex items-center space-x-4 pt-4">
                <button
                  onClick={handleSaveSettings}
                  disabled={loading}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Save Settings'}
                </button>
                <button
                  onClick={handleTestNotification}
                  disabled={loading}
                  className="flex items-center space-x-2 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  <Send className="h-4 w-4" />
                  <span>{loading ? 'Sending...' : 'Send Test Notification'}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InternshipTracker;
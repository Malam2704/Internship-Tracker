'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Calendar, ExternalLink, Target, Flame, Trash2 } from 'lucide-react';

const InternshipTracker = () => {
    const [applications, setApplications] = useState([]);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [newApplication, setNewApplication] = useState({
        url: '',
        company: '',
        position: ''
    });

    // Load data from localStorage on mount
    useEffect(() => {
        const savedApplications = localStorage.getItem('internship-applications');
        if (savedApplications) {
            setApplications(JSON.parse(savedApplications));
        }
    }, []);

    // Save to localStorage whenever applications change
    useEffect(() => {
        localStorage.setItem('internship-applications', JSON.stringify(applications));
    }, [applications]);

    const extractCompanyName = (url) => {
        try {
            const domain = new URL(url).hostname;
            const parts = domain.split('.');
            const companyPart = parts.find(part =>
                part !== 'www' &&
                part !== 'com' &&
                part !== 'org' &&
                part !== 'net' &&
                part !== 'careers' &&
                part !== 'jobs'
            );
            return companyPart ? companyPart.charAt(0).toUpperCase() + companyPart.slice(1) : 'Unknown';
        } catch {
            return 'Unknown';
        }
    };

    const handleAddApplication = () => {
        if (!newApplication.url.trim()) return;

        const application = {
            id: Date.now(),
            url: newApplication.url,
            company: newApplication.company || extractCompanyName(newApplication.url),
            position: newApplication.position || 'Software Engineer Intern',
            date: new Date().toISOString().split('T')[0],
            dateApplied: new Date().toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            })
        };

        setApplications(prev => [application, ...prev]);
        setNewApplication({ url: '', company: '', position: '' });
        setIsDialogOpen(false);
    };

    const handleDeleteApplication = (id) => {
        setApplications(prev => prev.filter(app => app.id !== id));
    };

    const calculateStreak = () => {
        if (applications.length === 0) return 0;

        const today = new Date();
        let streak = 0;

        for (let i = 0; i < 365; i++) {
            const checkDate = new Date(today);
            checkDate.setDate(today.getDate() - i);
            const dateString = checkDate.toISOString().split('T')[0];

            const hasApplication = applications.some(app => app.date === dateString);

            if (hasApplication) {
                streak++;
            } else if (i > 0) {
                break;
            }
        }

        return streak;
    };

    const getApplicationsForDate = (daysAgo) => {
        const date = new Date();
        date.setDate(date.getDate() - daysAgo);
        const dateString = date.toISOString().split('T')[0];
        return applications.filter(app => app.date === dateString);
    };

    const getHeatmapColor = (count) => {
        if (count === 0) return 'bg-gray-100 border-gray-200';
        if (count === 1) return 'bg-green-200 border-green-300';
        if (count === 2) return 'bg-green-300 border-green-400';
        if (count === 3) return 'bg-green-400 border-green-500';
        return 'bg-green-500 border-green-600';
    };

    const todayApplications = getApplicationsForDate(0);
    const streak = calculateStreak();

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                                <Target className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Internship Tracker</h1>
                                <p className="text-sm text-gray-500">Track your internship applications</p>
                            </div>
                        </div>

                        <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2 bg-gradient-to-r from-orange-100 to-red-100 px-4 py-2 rounded-full border border-orange-200 shadow-sm">
                                <Flame className="h-4 w-4 text-orange-600" />
                                <span className="text-sm font-semibold text-orange-700">{streak} day streak</span>
                            </div>

                            <button
                                onClick={() => setIsDialogOpen(true)}
                                className="flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-4 py-2 rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-200"
                            >
                                <Plus className="h-4 w-4" />
                                <span>Add Application</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Add Application Modal */}
            {isDialogOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center space-x-2">
                                    <Target className="h-5 w-5 text-blue-600" />
                                    <h2 className="text-lg font-semibold text-gray-900">Add New Application</h2>
                                </div>
                                <button
                                    onClick={() => setIsDialogOpen(false)}
                                    className="text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Job Application URL *
                                    </label>
                                    <input
                                        type="url"
                                        placeholder="https://company.com/careers/job-id"
                                        value={newApplication.url}
                                        onChange={(e) => setNewApplication(prev => ({ ...prev, url: e.target.value }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Company Name (optional)
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Auto-detected from URL"
                                        value={newApplication.company}
                                        onChange={(e) => setNewApplication(prev => ({ ...prev, company: e.target.value }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Position (optional)
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Software Engineer Intern"
                                        value={newApplication.position}
                                        onChange={(e) => setNewApplication(prev => ({ ...prev, position: e.target.value }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                    />
                                </div>

                                <div className="flex space-x-3 pt-4">
                                    <button
                                        onClick={() => setIsDialogOpen(false)}
                                        className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleAddApplication}
                                        disabled={!newApplication.url.trim()}
                                        className="flex-1 flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <Plus className="h-4 w-4" />
                                        <span>Add Application</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-blue-700 mb-1">Total Applications</p>
                                <p className="text-3xl font-bold text-blue-900">{applications.length}</p>
                            </div>
                            <Target className="h-8 w-8 text-blue-600 opacity-60" />
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-green-700 mb-1">Today's Applications</p>
                                <p className="text-3xl font-bold text-green-900">{todayApplications.length}</p>
                            </div>
                            <Calendar className="h-8 w-8 text-green-600 opacity-60" />
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6 border border-orange-200 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-orange-700 mb-1">Current Streak</p>
                                <p className="text-3xl font-bold text-orange-900">{streak}</p>
                            </div>
                            <Flame className="h-8 w-8 text-orange-600 opacity-60" />
                        </div>
                    </div>
                </div>

                {/* Activity Heatmap */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="mb-6">
                        <div className="flex items-center space-x-2 mb-2">
                            <Calendar className="h-5 w-5 text-gray-700" />
                            <h3 className="text-lg font-semibold text-gray-900">Activity Heatmap</h3>
                        </div>
                        <p className="text-sm text-gray-500">Your application activity over the past 30 days</p>
                    </div>

                    <div className="grid grid-cols-10 gap-2 mb-4">
                        {Array.from({ length: 30 }, (_, i) => {
                            const count = getApplicationsForDate(29 - i).length;
                            const date = new Date();
                            date.setDate(date.getDate() - (29 - i));
                            return (
                                <div
                                    key={i}
                                    className={`h-8 w-8 rounded-lg border-2 flex items-center justify-center text-xs font-medium transition-all hover:scale-105 cursor-pointer ${getHeatmapColor(count)}`}
                                    title={`${date.toDateString()}: ${count} applications`}
                                >
                                    {date.getDate()}
                                </div>
                            );
                        })}
                    </div>

                    <div className="flex items-center justify-between text-sm text-gray-600">
                        <span>Less</span>
                        <div className="flex space-x-1">
                            <div className="w-3 h-3 bg-gray-100 border border-gray-200 rounded"></div>
                            <div className="w-3 h-3 bg-green-200 border border-green-300 rounded"></div>
                            <div className="w-3 h-3 bg-green-300 border border-green-400 rounded"></div>
                            <div className="w-3 h-3 bg-green-400 border border-green-500 rounded"></div>
                            <div className="w-3 h-3 bg-green-500 border border-green-600 rounded"></div>
                        </div>
                        <span>More</span>
                    </div>
                </div>

                {/* Applications Table */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                    <div className="p-6 border-b border-gray-200">
                        <div className="flex items-center space-x-2 mb-2">
                            <Target className="h-5 w-5 text-gray-700" />
                            <h3 className="text-lg font-semibold text-gray-900">Your Applications</h3>
                        </div>
                        <p className="text-sm text-gray-500">All your internship applications in one place</p>
                    </div>

                    <div className="p-6">
                        {applications.length === 0 ? (
                            <div className="text-center py-12">
                                <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">No applications yet</h3>
                                <p className="text-gray-500 mb-4">Start tracking your internship applications</p>
                                <button
                                    onClick={() => setIsDialogOpen(true)}
                                    className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-4 py-2 rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-200"
                                >
                                    <Plus className="h-4 w-4" />
                                    <span>Add Your First Application</span>
                                </button>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-gray-200">
                                            <th className="text-left py-3 px-4 font-semibold text-gray-700">Company</th>
                                            <th className="text-left py-3 px-4 font-semibold text-gray-700">Position</th>
                                            <th className="text-left py-3 px-4 font-semibold text-gray-700">Date Applied</th>
                                            <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                                            <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {applications.map((app) => (
                                            <tr key={app.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                                <td className="py-4 px-4">
                                                    <div className="flex items-center space-x-3">
                                                        <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-semibold text-sm shadow-sm">
                                                            {app.company.charAt(0)}
                                                        </div>
                                                        <div className="font-medium text-gray-900">{app.company}</div>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-4">
                                                    <div className="font-medium text-gray-900">{app.position}</div>
                                                </td>
                                                <td className="py-4 px-4">
                                                    <div className="text-gray-600">{app.dateApplied}</div>
                                                </td>
                                                <td className="py-4 px-4">
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-300">
                                                        Applied
                                                    </span>
                                                </td>
                                                <td className="py-4 px-4">
                                                    <div className="flex items-center space-x-2">
                                                        <a
                                                            href={app.url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="inline-flex items-center justify-center w-8 h-8 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                                            title="View application"
                                                        >
                                                            <ExternalLink className="h-3 w-3 text-gray-600" />
                                                        </a>
                                                        <button
                                                            onClick={() => handleDeleteApplication(app.id)}
                                                            className="inline-flex items-center justify-center w-8 h-8 border border-red-300 rounded-lg hover:bg-red-50 transition-colors text-red-600 hover:text-red-700"
                                                            title="Delete application"
                                                        >
                                                            <Trash2 className="h-3 w-3" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InternshipTracker;
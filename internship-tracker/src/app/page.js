'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Calendar, ExternalLink, Target, Flame, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

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
    <div className="min-h-screen bg-gray-50/50">
      {/* Header */}
      <div className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Target className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Internship Tracker</h1>
                <p className="text-sm text-gray-500">Track your internship applications</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 bg-gradient-to-r from-orange-100 to-red-100 px-4 py-2 rounded-full border border-orange-200">
                <Flame className="h-4 w-4 text-orange-600" />
                <span className="text-sm font-semibold text-orange-700">{streak} day streak</span>
              </div>

              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Application
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle className="flex items-center space-x-2">
                      <Target className="h-5 w-5 text-blue-600" />
                      <span>Add New Application</span>
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="url">Job Application URL *</Label>
                      <Input
                        id="url"
                        placeholder="https://company.com/careers/job-id"
                        value={newApplication.url}
                        onChange={(e) => setNewApplication(prev => ({ ...prev, url: e.target.value }))}
                        className="focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="company">Company Name (optional)</Label>
                      <Input
                        id="company"
                        placeholder="Auto-detected from URL"
                        value={newApplication.company}
                        onChange={(e) => setNewApplication(prev => ({ ...prev, company: e.target.value }))}
                        className="focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="position">Position (optional)</Label>
                      <Input
                        id="position"
                        placeholder="Software Engineer Intern"
                        value={newApplication.position}
                        onChange={(e) => setNewApplication(prev => ({ ...prev, position: e.target.value }))}
                        className="focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <Button
                      onClick={handleAddApplication}
                      className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                      disabled={!newApplication.url.trim()}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Application
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-blue-100">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-blue-700">Total Applications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-3xl font-bold text-blue-900">{applications.length}</div>
                <Target className="h-8 w-8 text-blue-600 opacity-60" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-gradient-to-br from-green-50 to-green-100">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-green-700">Today's Applications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-3xl font-bold text-green-900">{todayApplications.length}</div>
                <Calendar className="h-8 w-8 text-green-600 opacity-60" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-gradient-to-br from-orange-50 to-orange-100">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-orange-700">Current Streak</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-3xl font-bold text-orange-900">{streak}</div>
                <Flame className="h-8 w-8 text-orange-600 opacity-60" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Activity Heatmap */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5" />
              <span>Activity Heatmap (Last 30 Days)</span>
            </CardTitle>
            <CardDescription>Your application activity over the past month</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-10 gap-2">
              {Array.from({ length: 30 }, (_, i) => {
                const count = getApplicationsForDate(29 - i).length;
                const date = new Date();
                date.setDate(date.getDate() - (29 - i));
                return (
                  <div
                    key={i}
                    className={`h-8 w-8 rounded-lg border-2 flex items-center justify-center text-xs font-medium transition-all hover:scale-105 ${getHeatmapColor(count)}`}
                    title={`${date.toDateString()}: ${count} applications`}
                  >
                    {date.getDate()}
                  </div>
                );
              })}
            </div>
            <div className="flex items-center justify-between mt-4 text-sm text-gray-600">
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
          </CardContent>
        </Card>

        {/* Applications Table */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="h-5 w-5" />
              <span>Your Applications</span>
            </CardTitle>
            <CardDescription>All your internship applications in one place</CardDescription>
          </CardHeader>
          <CardContent>
            {applications.length === 0 ? (
              <div className="text-center py-12">
                <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No applications yet</h3>
                <p className="text-gray-500 mb-4">Start tracking your internship applications</p>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Your First Application
                    </Button>
                  </DialogTrigger>
                </Dialog>
              </div>
            ) : (
              <div className="rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50/50">
                      <TableHead className="font-semibold">Company</TableHead>
                      <TableHead className="font-semibold">Position</TableHead>
                      <TableHead className="font-semibold">Date Applied</TableHead>
                      <TableHead className="font-semibold">Status</TableHead>
                      <TableHead className="font-semibold">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {applications.map((app) => (
                      <TableRow key={app.id} className="hover:bg-gray-50/50">
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-semibold text-sm">
                              {app.company.charAt(0)}
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">{app.company}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium text-gray-900">{app.position}</div>
                        </TableCell>
                        <TableCell>
                          <div className="text-gray-600">{app.dateApplied}</div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-300">
                            Applied
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              asChild
                              className="h-8 px-2"
                            >
                              <a href={app.url} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteApplication(app.id)}
                              className="h-8 px-2 text-red-600 hover:text-red-700 hover:border-red-300"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default InternshipTracker;
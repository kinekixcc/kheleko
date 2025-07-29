import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  TestTube, 
  Database, 
  Trash2, 
  CheckCircle, 
  Users, 
  Trophy, 
  Eye,
  RefreshCw,
  Download,
  Upload
} from 'lucide-react';
import { Button } from './Button';
import { Card } from './Card';
import { loadSampleData, clearAllData } from '../../utils/sampleData';
import toast from 'react-hot-toast';

export const TestingPanel: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [dataStats, setDataStats] = useState({
    tournaments: 0,
    registrations: 0
  });

  const updateStats = () => {
    const tournaments = JSON.parse(localStorage.getItem('tournaments') || '[]');
    const registrations = JSON.parse(localStorage.getItem('organizer_registrations_organizer-001') || '[]');
    
    setDataStats({
      tournaments: tournaments.length,
      registrations: registrations.length
    });
  };

  React.useEffect(() => {
    updateStats();
  }, []);

  const handleLoadSampleData = () => {
    loadSampleData();
    
    // Also generate player stats for the current user if logged in
    const currentUser = JSON.parse(localStorage.getItem('adminSession') || localStorage.getItem('organizerSession') || '{}');
    if (currentUser.id) {
      const { playerStatsManager } = require('../../utils/playerStatsManager');
      playerStatsManager.generateSampleData(currentUser.id);
    }
    
    updateStats();
    toast.success('Sample data loaded! Check tournaments and dashboards.');
  };

  const handleClearData = () => {
    if (confirm('Are you sure you want to clear all data? This cannot be undone.')) {
      clearAllData();
      updateStats();
      toast.success('All data cleared!');
      // Refresh the page to reset the app state
      window.location.reload();
    }
  };

  const handleExportData = () => {
    const data = {
      tournaments: JSON.parse(localStorage.getItem('tournaments') || '[]'),
      registrations: JSON.parse(localStorage.getItem('organizer_registrations_organizer-001') || '[]')
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'tournament_data.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast.success('Data exported successfully!');
  };

  if (!isVisible) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setIsVisible(true)}
          className="bg-purple-600 hover:bg-purple-700 text-white shadow-lg"
          size="sm"
        >
          <TestTube className="h-4 w-4 mr-2" />
          Testing Panel
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-80"
      >
        <Card className="p-4 bg-purple-50 border-purple-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <TestTube className="h-5 w-5 text-purple-600" />
              <h3 className="font-semibold text-purple-900">Testing Panel</h3>
            </div>
            <button
              onClick={() => setIsVisible(false)}
              className="text-purple-600 hover:text-purple-800"
            >
              ×
            </button>
          </div>

          {/* Data Stats */}
          <div className="mb-4 p-3 bg-white rounded-lg border">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Current Data</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex items-center space-x-1">
                <Trophy className="h-3 w-3 text-blue-600" />
                <span>{dataStats.tournaments} Tournaments</span>
              </div>
              <div className="flex items-center space-x-1">
                <Users className="h-3 w-3 text-green-600" />
                <span>{dataStats.registrations} Registrations</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-2">
            <Button
              onClick={handleLoadSampleData}
              className="w-full bg-green-600 hover:bg-green-700 text-white"
              size="sm"
            >
              <Database className="h-4 w-4 mr-2" />
              Load Sample Data
            </Button>

            <Button
              onClick={updateStats}
              variant="outline"
              className="w-full"
              size="sm"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Stats
            </Button>

            <Button
              onClick={handleExportData}
              variant="outline"
              className="w-full"
              size="sm"
            >
              <Download className="h-4 w-4 mr-2" />
              Export Data
            </Button>

            <Button
              onClick={handleClearData}
              variant="outline"
              className="w-full text-red-600 hover:text-red-800 border-red-300 hover:border-red-400"
              size="sm"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear All Data
            </Button>
          </div>

          {/* Testing Guide */}
          <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="text-sm font-semibold text-blue-900 mb-2">
              🧪 Testing Guide
            </h4>
            <div className="text-xs text-blue-800 space-y-1">
              <p>1. Click "Load Sample Data"</p>
              <p>2. Login as organizer: mahatsabin611@gmail.com</p>
              <p>3. Check Tournament Map & Details</p>
              <p>4. Test registration flow</p>
              <p>5. Check dashboards</p>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};
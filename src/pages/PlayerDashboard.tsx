import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  CalendarDays, 
  MapPin, 
  Star, 
  Clock, 
  TrendingUp, 
  Trophy, 
  Users, 
  Award,
  Target,
  BarChart3,
  Medal,
  Zap,
  Settings,
  Eye,
  Plus
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { playerStatsManager } from '../utils/playerStatsManager';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { PlayerAchievement } from '../types';

export const PlayerDashboard: React.FC = () => {
  const { user } = useAuth();
  const [selectedTab, setSelectedTab] = React.useState<'overview' | 'stats' | 'achievements' | 'profile'>('overview');
  const [playerStats, setPlayerStats] = React.useState<any>(null);
  const [achievements, setAchievements] = React.useState<PlayerAchievement[]>([]);
  const [playerProfile, setPlayerProfile] = React.useState<any>(null);

  React.useEffect(() => {
    if (user?.id) {
      // Load player statistics
      const stats = playerStatsManager.getPlayerStats(user.id);
      setPlayerStats(stats);
      
      // Load achievements
      const playerAchievements = playerStatsManager.getPlayerAchievements(user.id);
      setAchievements(playerAchievements);
      
      // Load profile
      const profile = playerStatsManager.getPlayerProfile(user.id);
      setPlayerProfile(profile);
      
      // Generate sample data if no stats exist (for testing)
      if (stats.totalTournaments === 0) {
        playerStatsManager.generateSampleData(user.id);
        // Reload stats after generating sample data
        setTimeout(() => {
          const newStats = playerStatsManager.getPlayerStats(user.id);
          setPlayerStats(newStats);
          const newAchievements = playerStatsManager.getPlayerAchievements(user.id);
          setAchievements(newAchievements);
        }, 100);
      }
    }
  }, [user?.id]);

  // Get approved tournaments that are available for registration
  const getAvailableTournaments = () => {
    try {
      const tournaments = JSON.parse(localStorage.getItem('tournaments') || '[]');
      return tournaments.filter((t: any) => t.status === 'approved' || t.status === 'pending_approval');
    } catch (error) {
      return [];
    }
  };

  // Get player's tournament registrations (mock for now - would come from database)
  const getPlayerRegistrations = () => {
    try {
      const registrations = JSON.parse(localStorage.getItem(`player_registrations_${user?.id}`) || '[]');
      return registrations;
    } catch (error) {
      return [];
    }
  };

  const availableTournaments = getAvailableTournaments();
  const playerRegistrations = getPlayerRegistrations();

  // Use real statistics from playerStatsManager
  const tournamentsJoined = playerStats?.totalTournaments || 0;
  const matchesWon = playerStats?.matchesWon || 0;
  const hoursPlayed = playerStats?.hoursPlayed || 0;
  const playerRating = playerStats?.overallRating || 0;

  const stats = [
    {
      icon: <CalendarDays className="h-6 w-6" />,
      title: 'Tournaments Joined',
      value: String(tournamentsJoined),
      change: tournamentsJoined > 0 ? `${tournamentsJoined} total joined` : 'No tournaments joined yet',
      color: 'text-blue-600'
    },
    {
      icon: <Trophy className="h-6 w-6" />,
      title: 'Matches Won',
      value: String(matchesWon),
      change: matchesWon > 0 ? `${matchesWon} victories` : 'No matches won yet',
      color: 'text-green-600'
    },
    {
      icon: <Star className="h-6 w-6" />,
      title: 'Player Rating',
      value: playerRating.toFixed(1),
      change: tournamentsJoined > 0 ? 'Based on performance' : 'Join tournaments to get rated',
      color: 'text-yellow-600'
    },
    {
      icon: <Clock className="h-6 w-6" />,
      title: 'Hours Played',
      value: String(hoursPlayed),
      change: hoursPlayed > 0 ? `${hoursPlayed} hours total` : 'No playing time recorded',
      color: 'text-purple-600'
    }
  ];

  const getBadgeColor = (color: string) => {
    const colors: { [key: string]: string } = {
      gold: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      silver: 'bg-gray-100 text-gray-800 border-gray-300',
      bronze: 'bg-orange-100 text-orange-800 border-orange-300',
      blue: 'bg-blue-100 text-blue-800 border-blue-300',
      green: 'bg-green-100 text-green-800 border-green-300',
      purple: 'bg-purple-100 text-purple-800 border-purple-300'
    };
    return colors[color] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'registered':
        return 'bg-blue-100 text-blue-800';
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      case 'won':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.full_name}!
          </h1>
          <p className="text-gray-600">
            Ready to join your next tournament? Here's your player dashboard
          </p>
        </motion.div>

        {/* Navigation Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.05 }}
          className="mb-8"
        >
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'overview', label: 'Overview', icon: <Eye className="h-4 w-4" /> },
                { id: 'stats', label: 'Statistics', icon: <BarChart3 className="h-4 w-4" /> },
                { id: 'achievements', label: 'Achievements', icon: <Award className="h-4 w-4" /> },
                { id: 'profile', label: 'Profile', icon: <Settings className="h-4 w-4" /> }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedTab(tab.id as any)}
                  className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                    selectedTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          {stats.map((stat, index) => (
            <Card key={index} className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    {stat.title}
                  </p>
                  <p className="text-3xl font-bold text-gray-900">
                    {stat.value}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    {stat.change}
                  </p>
                </div>
                <div className={`${stat.color}`}>
                  {stat.icon}
                </div>
              </div>
            </Card>
          ))}
        </motion.div>

        {/* Tab Content */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {selectedTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Available Tournaments */}
              <div className="lg:col-span-2">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  Available Tournaments
                </h2>
                {availableTournaments.length > 0 && (
                  <Button variant="outline" size="sm">
                    View All
                  </Button>
                )}
              </div>
              
              {availableTournaments.length === 0 ? (
                <div className="text-center py-12">
                  <Trophy className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No tournaments available
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Check back later for new tournaments to join
                  </p>
                  <Button variant="outline">
                    <MapPin className="mr-2 h-4 w-4" />
                    Find Facilities
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {availableTournaments.slice(0, 3).map((tournament: any) => (
                    <div
                      key={tournament.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                    >
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">
                          {tournament.name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {tournament.sport_type} • {tournament.venue_name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {tournament.start_date} to {tournament.end_date} • Entry: रू {tournament.entry_fee}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Open
                        </span>
                        <Link to={`/tournament/${tournament.id}/register`}>
                          <Button size="sm">
                            Register
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
              </div>

          {/* Quick Actions */}
              <div>
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Quick Actions
              </h2>
              
              <div className="space-y-4">
                <Link to="/tournament-map" className="w-full">
                  <Button className="w-full justify-start" variant="outline">
                    <Trophy className="mr-2 h-4 w-4" />
                    Find Tournaments
                  </Button>
                </Link>
                <Button className="w-full justify-start" variant="outline">
                  <Users className="mr-2 h-4 w-4" />
                  Join Team
                </Button>
                <Link to="/facilities" className="w-full">
                  <Button className="w-full justify-start" variant="outline">
                    <MapPin className="mr-2 h-4 w-4" />
                    Find Facilities
                  </Button>
                </Link>
                <Button className="w-full justify-start" variant="outline">
                  <Star className="mr-2 h-4 w-4" />
                  Rate Performance
                </Button>
              </div>
            </Card>

            {/* My Tournaments */}
            <Card className="p-6 mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                My Tournaments
              </h3>
              
              {playerRegistrations.length === 0 ? (
                <div className="text-center py-6">
                  <Trophy className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500 text-sm">No tournaments joined yet</p>
                  <p className="text-gray-400 text-xs mt-1">
                    Register for tournaments to see them here
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {playerRegistrations.slice(0, 3).map((registration: any, index: number) => (
                    <div key={index} className="flex justify-between items-center">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {registration.tournament_name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {registration.sport_type}
                        </p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(registration.status)}`}>
                        {registration.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Performance Summary */}
            <Card className="p-6 mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Performance Summary
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Tournaments Joined</span>
                  <span className="font-medium">{tournamentsJoined}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Matches Won</span>
                  <span className="font-medium">{matchesWon}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Win Rate</span>
                  <span className="font-medium">
                    {playerStats?.winRate ? `${playerStats.winRate.toFixed(1)}%` : '0%'}
                  </span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="text-gray-900 font-medium">Player Rating</span>
                  <span className="font-bold text-yellow-600">{playerRating.toFixed(1)}</span>
                </div>
              </div>
            </Card>
              </div>
            </div>
          )}

          {selectedTab === 'stats' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Detailed Statistics */}
              <Card className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-6">Detailed Statistics</h3>
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{playerStats?.totalMatches || 0}</div>
                      <div className="text-sm text-gray-600">Total Matches</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{playerStats?.winRate?.toFixed(1) || 0}%</div>
                      <div className="text-sm text-gray-600">Win Rate</div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Performance by Sport</h4>
                    <div className="space-y-3">
                      {['Football', 'Basketball', 'Cricket'].map(sport => {
                        const sportStats = playerStatsManager.getSportStats(user?.id || '', sport);
                        return (
                          <div key={sport} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div>
                              <p className="font-medium text-gray-900">{sport}</p>
                              <p className="text-sm text-gray-600">{sportStats.tournaments} tournaments</p>
                            </div>
                            <div className="text-right">
                              <p className="font-medium text-gray-900">{sportStats.wins}/{sportStats.matches}</p>
                              <p className="text-sm text-gray-600">W/L</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </Card>

              {/* Progress Chart */}
              <Card className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-6">Progress Overview</h3>
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-gray-600">Tournament Experience</span>
                      <span className="text-sm font-medium">{tournamentsJoined}/50</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min((tournamentsJoined / 50) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-gray-600">Skill Rating</span>
                      <span className="text-sm font-medium">{playerRating.toFixed(0)}/5000</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-yellow-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min((playerRating / 5000) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-gray-600">Playing Time</span>
                      <span className="text-sm font-medium">{hoursPlayed}h</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min((hoursPlayed / 100) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {selectedTab === 'achievements' && (
            <div className="space-y-6">
              <Card className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-6">Your Achievements</h3>
                
                {achievements.length === 0 ? (
                  <div className="text-center py-12">
                    <Award className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h4 className="text-lg font-medium text-gray-900 mb-2">No achievements yet</h4>
                    <p className="text-gray-600">Participate in tournaments to earn achievements!</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {achievements.map((achievement, index) => (
                      <div
                        key={achievement.id}
                        className={`p-4 rounded-lg border-2 ${getBadgeColor(achievement.badge_color)}`}
                      >
                        <div className="flex items-center mb-2">
                          {achievement.type === 'tournament_winner' && <Trophy className="h-5 w-5 mr-2" />}
                          {achievement.type === 'tournament_runner_up' && <Medal className="h-5 w-5 mr-2" />}
                          {achievement.type === 'milestone' && <Target className="h-5 w-5 mr-2" />}
                          {achievement.type === 'fair_play' && <Zap className="h-5 w-5 mr-2" />}
                          <h4 className="font-semibold">{achievement.title}</h4>
                        </div>
                        <p className="text-sm mb-2">{achievement.description}</p>
                        <p className="text-xs opacity-75">
                          {new Date(achievement.earned_date).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </div>
          )}

          {selectedTab === 'profile' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-6">Player Profile</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                    <textarea
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Tell us about yourself..."
                      defaultValue={playerProfile?.bio || ''}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Skill Level</label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                      <option value="beginner">Beginner</option>
                      <option value="intermediate" selected>Intermediate</option>
                      <option value="advanced">Advanced</option>
                      <option value="professional">Professional</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Your location"
                      defaultValue={playerProfile?.location || ''}
                    />
                  </div>
                  
                  <Button className="w-full">
                    <Settings className="mr-2 h-4 w-4" />
                    Update Profile
                  </Button>
                </div>
              </Card>
              
              <Card className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-6">Privacy Settings</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">Show Statistics</p>
                      <p className="text-sm text-gray-600">Allow others to see your performance stats</p>
                    </div>
                    <input type="checkbox" defaultChecked className="h-4 w-4 text-blue-600 rounded" />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">Show Achievements</p>
                      <p className="text-sm text-gray-600">Display your achievements on profile</p>
                    </div>
                    <input type="checkbox" defaultChecked className="h-4 w-4 text-blue-600 rounded" />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">Show Contact Info</p>
                      <p className="text-sm text-gray-600">Allow organizers to contact you</p>
                    </div>
                    <input type="checkbox" className="h-4 w-4 text-blue-600 rounded" />
                  </div>
                </div>
              </Card>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};
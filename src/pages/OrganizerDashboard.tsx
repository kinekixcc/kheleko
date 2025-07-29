import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, Users, Trophy, DollarSign, Plus, Settings, BarChart3, Clock, CheckCircle, XCircle, User, Phone, Mail, Eye, UserCheck, UserX, Download, Filter, Search } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { RevenueAnalytics } from '../components/monetization/RevenueAnalytics';
import { SubscriptionPlans } from '../components/monetization/SubscriptionPlans';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import toast from 'react-hot-toast';

export const OrganizerDashboard: React.FC = () => {
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  const navigate = useNavigate();
  const [selectedTab, setSelectedTab] = React.useState<'tournaments' | 'participants' | 'revenue' | 'subscription'>('tournaments');
  const [selectedTournament, setSelectedTournament] = React.useState<string>('all');
  const [searchTerm, setSearchTerm] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<string>('all');
  const [registrations, setRegistrations] = React.useState<any[]>([]);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [itemsPerPage, setItemsPerPage] = React.useState(10);

  // Load registrations on component mount and when user changes
  React.useEffect(() => {
    const loadRegistrations = () => {
      try {
        const stored = localStorage.getItem(`organizer_registrations_${user?.id}`);
        const regs = stored ? JSON.parse(stored) : [];
        setRegistrations(regs);
      } catch (error) {
        console.error('Error loading registrations:', error);
        setRegistrations([]);
      }
    };

    if (user?.id) {
      loadRegistrations();
    }
  }, [user?.id]);

  // Get registrations for this organizer's tournaments
  const getOrganizerRegistrations = () => {
    return registrations;
  };

  // Get tournaments created by this organizer
  const getOrganizerTournaments = () => {
    try {
      const tournaments = JSON.parse(localStorage.getItem('tournaments') || '[]');
      return tournaments.filter((t: any) => t.organizer_id === user?.id);
    } catch (error) {
      return [];
    }
  };

  const organizerTournaments = getOrganizerTournaments();
  const organizerRegistrations = getOrganizerRegistrations();

  // Filter registrations based on selected filters
  const filteredRegistrations = organizerRegistrations.filter((registration: any) => {
    const matchesSearch = registration.player_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         registration.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         registration.tournament_name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTournament = selectedTournament === 'all' || registration.tournament_id === selectedTournament;
    const matchesStatus = statusFilter === 'all' || registration.status === statusFilter;
    
    return matchesSearch && matchesTournament && matchesStatus;
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredRegistrations.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedRegistrations = filteredRegistrations.slice(startIndex, endIndex);

  // Calculate statistics based on real data
  const activeTournaments = organizerTournaments.filter((t: any) => t.status === 'approved').length;
  const pendingTournaments = organizerTournaments.filter((t: any) => t.status === 'pending_approval').length;
  const rejectedTournaments = organizerTournaments.filter((t: any) => t.status === 'rejected').length;
  const totalParticipants = organizerTournaments.reduce((sum: number, t: any) => sum + (t.current_participants || 0), 0);
  const totalRevenue = organizerTournaments
    .filter((t: any) => t.status === 'approved')
    .reduce((sum: number, t: any) => sum + (t.entry_fee * (t.current_participants || 0)), 0);

  const stats = [
    {
      icon: <Trophy className="h-6 w-6" />,
      title: 'Active Tournaments',
      value: String(activeTournaments),
      change: activeTournaments > 0 ? `${activeTournaments} live tournaments` : 'No active tournaments',
      color: 'text-blue-600'
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: 'Total Participants',
      value: String(totalParticipants),
      change: totalParticipants > 0 ? `Across all tournaments` : 'No participants yet',
      color: 'text-green-600'
    },
    {
      icon: <DollarSign className="h-6 w-6" />,
      title: 'Revenue',
      value: `रू ${totalRevenue.toLocaleString()}`,
      change: totalRevenue > 0 ? 'From entry fees' : 'No revenue yet',
      color: 'text-yellow-600'
    },
    {
      icon: <Calendar className="h-6 w-6" />,
      title: 'Total Tournaments',
      value: String(organizerTournaments.length),
      change: organizerTournaments.length > 0 ? `${pendingTournaments} pending approval` : 'Create your first tournament',
      color: 'text-purple-600'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'pending_approval':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'active':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'pending_approval':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Trophy className="h-4 w-4 text-blue-600" />;
    }
  };

  const handleApproveParticipant = (registrationId: string) => {
    const registrations = getOrganizerRegistrations();
    const updatedRegistrations = registrations.map((reg: any) => 
      reg.id === registrationId ? { ...reg, status: 'confirmed' } : reg
    );
    localStorage.setItem(`organizer_registrations_${user?.id}`, JSON.stringify(updatedRegistrations));
    
    // Find the registration to get player details
    const registration = registrations.find((reg: any) => reg.id === registrationId);
    if (registration) {
      addNotification({
        type: 'tournament_registration_success',
        title: 'Registration Confirmed!',
        message: `Your registration for "${registration.tournament_name}" has been confirmed by the organizer.`,
        userId: registration.player_id,
        tournamentId: registration.tournament_id,
        tournamentName: registration.tournament_name,
        targetRole: 'player'
      });
    }
    
    window.location.reload(); // Refresh to show updated data
  };

  const handleRejectParticipant = (registrationId: string) => {
    console.log('Rejecting participant:', registrationId);
    
    // Update registration status
    const updatedRegistrations = registrations.map((reg: any) => 
      reg.id === registrationId ? { ...reg, status: 'rejected' } : reg
    );
    
    // Update state immediately
    setRegistrations(updatedRegistrations);
    
    // Save to localStorage
    localStorage.setItem(`organizer_registrations_${user?.id}`, JSON.stringify(updatedRegistrations));
    
    // Find the registration to get player details
    const registration = registrations.find((reg: any) => reg.id === registrationId);
    if (registration) {
      addNotification({
        type: 'tournament_rejected',
        title: 'Registration Rejected',
        message: `Your registration for "${registration.tournament_name}" has been rejected by the organizer.`,
        userId: registration.player_id,
        tournamentId: registration.tournament_id,
        tournamentName: registration.tournament_name,
        targetRole: 'player'
      });
    }

    console.log('Participant rejected successfully');
  };

  const exportRegistrations = () => {
    const csvContent = [
      ['Player Name', 'Email', 'Phone', 'Age', 'Experience', 'Team', 'Tournament', 'Status', 'Registration Date'],
      ...filteredRegistrations.map((reg: any) => [
        reg.player_name,
        reg.email,
        reg.phone,
        reg.age,
        reg.experience_level,
        reg.team_name || 'Individual',
        reg.tournament_name,
        reg.status,
        new Date(reg.registration_date).toLocaleDateString()
      ])
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'tournament_registrations.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Organizer Dashboard
              </h1>
              <p className="text-gray-600">
                Welcome back, {user?.full_name}! Manage your tournaments and events
              </p>
            </div>
            <Button 
              className="bg-blue-600 hover:bg-blue-700"
              onClick={() => navigate('/create-tournament')}
            >
              <Plus className="mr-2 h-4 w-4" />
              Create Tournament
            </Button>
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

        {/* Navigation Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-8"
        >
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setSelectedTab('tournaments')}
                className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                  selectedTab === 'tournaments'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Trophy className="h-4 w-4" />
                <span>Your Tournaments</span>
              </button>
              <button
                onClick={() => setSelectedTab('participants')}
                className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                  selectedTab === 'participants'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Users className="h-4 w-4" />
                <span>Manage Participants</span>
                {organizerRegistrations.length > 0 && (
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                    {organizerRegistrations.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setSelectedTab('revenue')}
                className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                  selectedTab === 'revenue'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <DollarSign className="h-4 w-4" />
                <span>Revenue Analytics</span>
              </button>
              <button
                onClick={() => setSelectedTab('subscription')}
                className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                  selectedTab === 'subscription'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Trophy className="h-4 w-4" />
                <span>Subscription</span>
              </button>
            </nav>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="lg:col-span-2"
          >
            {selectedTab === 'tournaments' ? (
              /* Your Tournaments Tab */
              <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Your Tournaments
                  </h2>
                  {organizerTournaments.length > 0 && (
                    <Button variant="outline" size="sm">
                      View All
                    </Button>
                  )}
                </div>
                
                {organizerTournaments.length === 0 ? (
                  <div className="text-center py-12">
                    <Trophy className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No tournaments yet
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Create your first tournament to get started with organizing events
                    </p>
                    <Button 
                      onClick={() => navigate('/create-tournament')}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Create Your First Tournament
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {organizerTournaments.map((tournament: any) => (
                      <div
                        key={tournament.id}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                      >
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            {getStatusIcon(tournament.status)}
                            <h3 className="font-medium text-gray-900">
                              {tournament.name}
                            </h3>
                          </div>
                          <p className="text-sm text-gray-600">
                            {tournament.sport_type} • {tournament.current_participants || 0}/{tournament.max_participants} participants
                          </p>
                          <p className="text-sm text-gray-500">
                            {tournament.start_date} to {tournament.end_date} • Entry: रू {tournament.entry_fee}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(tournament.status)}`}
                          >
                            {tournament.status.replace('_', ' ')}
                          </span>
                          <Button variant="ghost" size="sm">
                            <Settings className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            ) : selectedTab === 'participants' ? (
              /* Manage Participants Tab */
              <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Participant Management
                  </h2>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={exportRegistrations}
                      disabled={filteredRegistrations.length === 0}
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Export CSV
                    </Button>
                    <span className="text-sm text-gray-500">
                      {filteredRegistrations.length} of {organizerRegistrations.length} registrations
                    </span>
                  </div>
                </div>
                
                {/* Filters */}
                {organizerRegistrations.length > 0 && (
                  <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Search Participants
                        </label>
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                          <Input
                            type="text"
                            placeholder="Search by name, email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Tournament
                        </label>
                        <select
                          value={selectedTournament}
                          onChange={(e) => setSelectedTournament(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="all">All Tournaments</option>
                          {organizerTournaments.map((tournament: any) => (
                            <option key={tournament.id} value={tournament.id}>
                              {tournament.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Status
                        </label>
                        <select
                          value={statusFilter}
                          onChange={(e) => setStatusFilter(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="all">All Status</option>
                          <option value="registered">Pending Review</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="rejected">Rejected</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Items per page
                        </label>
                        <select
                          value={itemsPerPage}
                          onChange={(e) => {
                            setItemsPerPage(Number(e.target.value));
                            setCurrentPage(1);
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value={10}>10 per page</option>
                          <option value={25}>25 per page</option>
                          <option value={50}>50 per page</option>
                          <option value={100}>100 per page</option>
                        </select>
                      </div>
                      
                      <div className="flex items-end">
                        <Button
                          variant="outline"
                          onClick={() => {
                            setSearchTerm('');
                            setSelectedTournament('all');
                            setStatusFilter('all');
                            setCurrentPage(1);
                          }}
                          className="w-full"
                        >
                          Clear Filters
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
                
                {organizerRegistrations.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No registrations yet
                    </h3>
                    <p className="text-gray-600">
                      Player registrations will appear here once they sign up for your tournaments
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Registration Stats */}
                    <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-4">
                          <span className="text-blue-800">
                            <strong>Showing:</strong> {startIndex + 1}-{Math.min(endIndex, filteredRegistrations.length)} of {filteredRegistrations.length} registrations
                          </span>
                          {filteredRegistrations.length !== organizerRegistrations.length && (
                            <span className="text-blue-600">
                              (Filtered from {organizerRegistrations.length} total)
                            </span>
                          )}
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">
                            {filteredRegistrations.filter(r => r.status === 'registered').length} Pending
                          </span>
                          <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                            {filteredRegistrations.filter(r => r.status === 'confirmed').length} Confirmed
                          </span>
                          <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">
                            {filteredRegistrations.filter(r => r.status === 'rejected').length} Rejected
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Registrations List */}
                    <div className="space-y-3">
                    {filteredRegistrations.length === 0 ? (
                      <div className="text-center py-8">
                        <Filter className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          No registrations match your filters
                        </h3>
                        <p className="text-gray-600">
                          Try adjusting your search criteria or filters
                        </p>
                      </div>
                    ) : (
                      paginatedRegistrations.map((registration: any) => (
                        <div
                          key={registration.id}
                          className={`p-4 rounded-lg border transition-all hover:shadow-md ${
                            registration.status === 'confirmed' ? 'bg-green-50 border-green-200' :
                            registration.status === 'rejected' ? 'bg-red-50 border-red-200' :
                            'bg-blue-50 border-blue-200'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-2">
                                <User className={`h-4 w-4 ${
                                  registration.status === 'confirmed' ? 'text-green-600' :
                                  registration.status === 'rejected' ? 'text-red-600' :
                                  'text-blue-600'
                                }`} />
                                <h4 className="font-semibold text-gray-900">
                                  {registration.player_name}
                                </h4>
                                <span className={`px-2 py-1 text-xs rounded-full ${
                                  registration.experience_level === 'professional' ? 'bg-purple-100 text-purple-800' :
                                  registration.experience_level === 'advanced' ? 'bg-orange-100 text-orange-800' :
                                  registration.experience_level === 'intermediate' ? 'bg-blue-100 text-blue-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  {registration.experience_level}
                                </span>
                                {registration.team_name && (
                                  <span className="px-2 py-1 bg-indigo-100 text-indigo-800 text-xs rounded-full">
                                    Team: {registration.team_name}
                                  </span>
                                )}
                              </div>
                              
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm text-gray-600">
                                <div className="flex items-center space-x-1">
                                  <Trophy className="h-3 w-3 mr-1" />
                                  <span className="truncate">{registration.tournament_name}</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <Mail className="h-3 w-3 mr-1" />
                                  <span className="truncate">{registration.email}</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <Phone className="h-3 w-3 mr-1" />
                                  <span>{registration.phone}</span>
                                </div>
                              </div>
                              
                              <p className="text-xs text-gray-500 mt-2">
                                Age: {registration.age} • Registered: {new Date(registration.registration_date).toLocaleDateString()}
                              </p>
                            </div>
                            
                            <div className="flex items-center space-x-3 ml-4">
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                registration.status === 'registered' ? 'bg-yellow-100 text-yellow-800' :
                                registration.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                                registration.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {registration.status === 'registered' ? 'Pending Review' : 
                                 registration.status === 'confirmed' ? 'Confirmed' :
                                 registration.status === 'rejected' ? 'Rejected' : registration.status}
                              </span>
                              
                              {registration.status === 'registered' && (
                                <div className="flex space-x-2">
                                  <Button
                                    size="sm"
                                    onClick={() => handleApproveParticipant(registration.id)}
                                    className="bg-green-600 hover:bg-green-700 text-white px-3 py-1"
                                    title="Approve Registration"
                                  >
                                    <UserCheck className="h-4 w-4 mr-1" />
                                    Approve
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleRejectParticipant(registration.id)}
                                    className="text-red-600 hover:text-red-800 border-red-300 hover:border-red-400 px-3 py-1"
                                    title="Reject Registration"
                                  >
                                    <UserX className="h-4 w-4 mr-1" />
                                    Reject
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          {registration.medical_conditions && (
                            <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                              <p className="text-xs text-yellow-800">
                                <strong>⚠️ Medical Note:</strong> {registration.medical_conditions}
                              </p>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                      <div className="mt-6 flex items-center justify-between">
                        <div className="text-sm text-gray-600">
                          Page {currentPage} of {totalPages}
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                            disabled={currentPage === 1}
                          >
                            Previous
                          </Button>
                          
                          {/* Page Numbers */}
                          <div className="flex space-x-1">
                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                              const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                              return (
                                <button
                                  key={pageNum}
                                  onClick={() => setCurrentPage(pageNum)}
                                  className={`px-3 py-1 text-sm rounded ${
                                    currentPage === pageNum
                                      ? 'bg-blue-600 text-white'
                                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                  }`}
                                >
                                  {pageNum}
                                </button>
                              );
                            })}
                          </div>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                            disabled={currentPage === totalPages}
                          >
                            Next
                          </Button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </Card>
            ) : selectedTab === 'revenue' ? (
            /* Revenue Analytics Tab */
            <RevenueAnalytics userType="organizer" />
          ) : selectedTab === 'subscription' ? (
            /* Subscription Tab */
            <div>
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Subscription Plans</h2>
                <p className="text-gray-600">Upgrade your plan to unlock more features and grow your tournaments</p>
              </div>
              <SubscriptionPlans
                userType="organizer"
                currentPlan="free"
                onSelectPlan={(planId) => {
                  console.log('Selected plan:', planId);
                  toast.success('Plan selection feature coming soon!');
                }}
              />
            </div>
          ) : null}
          </motion.div>

          {/* Quick Actions Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Quick Actions
              </h2>
              
              <div className="space-y-4">
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  onClick={() => navigate('/create-tournament')}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Create Tournament
                </Button>
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  onClick={() => setSelectedTab('participants')}
                >
                  <Users className="mr-2 h-4 w-4" />
                  Manage Participants
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Calendar className="mr-2 h-4 w-4" />
                  Schedule Events
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <BarChart3 className="mr-2 h-4 w-4" />
                  View Analytics
                </Button>
              </div>
            </Card>

            {/* Summary Card */}
            <Card className="p-6 mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Summary
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Tournaments</span>
                  <span className="font-medium">{organizerTournaments.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Active</span>
                  <span className="font-medium text-green-600">{activeTournaments}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Pending Approval</span>
                  <span className="font-medium text-yellow-600">{pendingTournaments}</span>
                </div>
                {rejectedTournaments > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Rejected</span>
                    <span className="font-medium text-red-600">{rejectedTournaments}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Registrations</span>
                  <span className="font-medium text-blue-600">{organizerRegistrations.length}</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="text-gray-900 font-medium">Total Revenue</span>
                  <span className="font-bold text-green-600">रू {totalRevenue.toLocaleString()}</span>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
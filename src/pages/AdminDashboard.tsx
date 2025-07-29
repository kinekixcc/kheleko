import React, { useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { 
  Users, 
  Trophy, 
  MapPin, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Eye,
  Filter,
  Search,
  Calendar,
  DollarSign,
  AlertCircle,
  UserCheck,
  Building,
  Download,
  Image as ImageIcon,
  FileText,
  Phone,
  Mail,
  X,
  ExternalLink,
  Info,
  Trash2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { RevenueAnalytics } from '../components/monetization/RevenueAnalytics';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Tournament } from '../types';

interface TournamentDetailsModalProps {
  tournament: Tournament | null;
  isOpen: boolean;
  onClose: () => void;
  onApprove: (id: string) => void;
  onReject: (id: string, reason: string) => void;
}

const TournamentDetailsModal: React.FC<TournamentDetailsModalProps> = ({
  tournament,
  isOpen,
  onClose,
  onApprove,
  onReject
}) => {
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);

  if (!isOpen || !tournament) return null;

  const handleReject = () => {
    if (!rejectReason.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }
    onReject(tournament.id, rejectReason);
    setShowRejectForm(false);
    setRejectReason('');
    onClose();
  };

  const handleApprove = () => {
    onApprove(tournament.id);
    onClose();
  };

  const downloadFile = (fileName: string, fileType: 'image' | 'pdf') => {
    try {
      // Get the file data from localStorage
      const tournaments = JSON.parse(localStorage.getItem('tournaments') || '[]');
      const currentTournament = tournaments.find((t: any) => t.id === tournament?.id);
      
      if (!currentTournament) {
        toast.error('Tournament data not found');
        return;
      }

      let fileData = null;
      let mimeType = '';
      let downloadFileName = fileName;

      if (fileType === 'image') {
        // Get image data from tournament
        const imageIndex = currentTournament.images?.indexOf(fileName);
        if (imageIndex !== -1 && currentTournament.imageData && currentTournament.imageData[imageIndex]) {
          fileData = currentTournament.imageData[imageIndex];
          mimeType = 'image/jpeg'; // Default to JPEG
          
          // Determine actual mime type from data URL
          if (fileData.startsWith('data:image/png')) mimeType = 'image/png';
          else if (fileData.startsWith('data:image/gif')) mimeType = 'image/gif';
          else if (fileData.startsWith('data:image/webp')) mimeType = 'image/webp';
        }
      } else if (fileType === 'pdf') {
        // Get PDF data from tournament
        if (currentTournament.pdfData) {
          fileData = currentTournament.pdfData;
          mimeType = 'application/pdf';
        }
      }

      if (!fileData) {
        toast.error(`${fileType === 'image' ? 'Image' : 'PDF'} file not found or corrupted`);
        return;
      }

      // Convert data URL to blob
      const byteCharacters = atob(fileData.split(',')[1]);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: mimeType });

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = downloadFileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success(`${fileName} downloaded successfully!`);
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download file. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{tournament.name}</h2>
            <div className="flex items-center space-x-2 mt-1">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                tournament.status === 'pending_approval' ? 'bg-yellow-100 text-yellow-800' :
                tournament.status === 'approved' ? 'bg-green-100 text-green-800' :
                tournament.status === 'rejected' ? 'bg-red-100 text-red-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {tournament.status.replace('_', ' ')}
              </span>
              <span className="text-sm text-gray-500">
                Submitted: {new Date(tournament.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-6 w-6 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-8">
          {/* Basic Information */}
          <section>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Info className="h-5 w-5 mr-2 text-blue-600" />
              Tournament Information
            </h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Sport/Game Type</label>
                  <p className="text-gray-900">{tournament.sport_type}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Tournament Format</label>
                  <p className="text-gray-900">{(tournament as any).tournament_type?.replace('_', ' ') || 'Not specified'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Max Participants</label>
                  <p className="text-gray-900">{tournament.max_participants}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Entry Fee</label>
                  <p className="text-gray-900">रू {tournament.entry_fee}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Prize Pool</label>
                  <p className="text-gray-900">रू {tournament.prize_pool}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Registration Deadline</label>
                  <p className="text-gray-900">{tournament.registration_deadline}</p>
                </div>
              </div>
              <div className="mt-4">
                <label className="text-sm font-medium text-gray-700">Description</label>
                <p className="text-gray-900 mt-1">{tournament.description}</p>
              </div>
            </div>
          </section>

          {/* Dates */}
          <section>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-blue-600" />
              Tournament Schedule
            </h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Start Date</label>
                  <p className="text-gray-900">{tournament.start_date}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">End Date</label>
                  <p className="text-gray-900">{tournament.end_date}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Registration Deadline</label>
                  <p className="text-gray-900">{tournament.registration_deadline}</p>
                </div>
              </div>
            </div>
          </section>

          {/* Location Details */}
          <section>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <MapPin className="h-5 w-5 mr-2 text-blue-600" />
              Venue Information
            </h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Venue Name</label>
                  <p className="text-gray-900">{(tournament as any).venue_name || tournament.facility_name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Province</label>
                  <p className="text-gray-900">{(tournament as any).province || 'Not specified'}</p>
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-gray-700">Address</label>
                  <p className="text-gray-900">{(tournament as any).venue_address || 'Not specified'}</p>
                </div>
                {(tournament as any).latitude && (tournament as any).longitude && (
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium text-gray-700">Coordinates</label>
                    <p className="text-gray-900">
                      {(tournament as any).latitude}, {(tournament as any).longitude}
                      <button
                        onClick={() => window.open(`https://www.google.com/maps?q=${(tournament as any).latitude},${(tournament as any).longitude}`, '_blank')}
                        className="ml-2 text-blue-600 hover:text-blue-800"
                      >
                        <ExternalLink className="h-4 w-4 inline" />
                      </button>
                    </p>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Organizer Details */}
          <section>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <UserCheck className="h-5 w-5 mr-2 text-blue-600" />
              Organizer Information
            </h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Organizer Name</label>
                  <p className="text-gray-900">{tournament.organizer_name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Contact Phone</label>
                  <p className="text-gray-900 flex items-center">
                    <Phone className="h-4 w-4 mr-1" />
                    {(tournament as any).contact_phone || 'Not provided'}
                  </p>
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-gray-700">Contact Email</label>
                  <p className="text-gray-900 flex items-center">
                    <Mail className="h-4 w-4 mr-1" />
                    {(tournament as any).contact_email || 'Not provided'}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Rules & Requirements */}
          <section>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <FileText className="h-5 w-5 mr-2 text-blue-600" />
              Rules & Requirements
            </h3>
            <div className="bg-gray-50 rounded-lg p-4 space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Tournament Rules</label>
                <p className="text-gray-900 mt-1 whitespace-pre-wrap">{tournament.rules}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Participation Requirements</label>
                <p className="text-gray-900 mt-1 whitespace-pre-wrap">{tournament.requirements}</p>
              </div>
            </div>
          </section>

          {/* Media & Files */}
          <section>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <ImageIcon className="h-5 w-5 mr-2 text-blue-600" />
              Media & Documents
            </h3>
            <div className="bg-gray-50 rounded-lg p-4">
              {/* Tournament Images */}
              {(tournament as any).images && (tournament as any).images.length > 0 && (
                <div className="mb-6">
                  <label className="text-sm font-medium text-gray-700 mb-3 block">Tournament Images</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {(tournament as any).images.map((imageName: string, index: number) => (
                      <div key={index} className="relative group">
                        <div className="aspect-video bg-gray-200 rounded-lg flex items-center justify-center">
                          <ImageIcon className="h-8 w-8 text-gray-400" />
                        </div>
                        <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                          <Button
                            size="sm"
                            onClick={() => downloadFile(imageName, 'image')}
                            className="bg-white text-gray-900 hover:bg-gray-100"
                          >
                            <Download className="h-4 w-4 mr-1" />
                            Download
                          </Button>
                        </div>
                        <p className="text-xs text-gray-600 mt-1 truncate">{imageName}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* PDF Document */}
              {(tournament as any).pdf_document && (
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-3 block">Tournament Document</label>
                  <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200">
                    <div className="flex items-center">
                      <FileText className="h-8 w-8 text-red-500 mr-3" />
                      <div>
                        <p className="font-medium text-gray-900">{(tournament as any).pdf_document}</p>
                        <p className="text-sm text-gray-500">PDF Document</p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => downloadFile((tournament as any).pdf_document, 'pdf')}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </Button>
                  </div>
                </div>
              )}

              {/* No Media Message */}
              {(!((tournament as any).images && (tournament as any).images.length > 0) && !(tournament as any).pdf_document) && (
                <div className="text-center py-8">
                  <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">No media files uploaded</p>
                </div>
              )}
            </div>
          </section>

          {/* Admin Notes */}
          {(tournament as any).admin_notes && (
            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <AlertCircle className="h-5 w-5 mr-2 text-orange-600" />
                Admin Notes
              </h3>
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <p className="text-orange-800">{(tournament as any).admin_notes}</p>
              </div>
            </section>
          )}
        </div>

        {/* Action Buttons */}
        {tournament.status === 'pending_approval' && (
          <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6">
            {showRejectForm ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reason for Rejection
                  </label>
                  <textarea
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Please provide a detailed reason for rejecting this tournament..."
                  />
                </div>
                <div className="flex justify-end space-x-3">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowRejectForm(false);
                      setRejectReason('');
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleReject}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    Confirm Rejection
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex justify-end space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setShowRejectForm(true)}
                  className="text-red-600 hover:text-red-800 border-red-300 hover:border-red-400"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject Tournament
                </Button>
                <Button
                  onClick={handleApprove}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approve Tournament
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  const [selectedTab, setSelectedTab] = useState<'overview' | 'tournaments' | 'facilities' | 'users' | 'revenue'>('tournaments');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('pending_approval');
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Get tournaments from localStorage and merge with mock data
  const getStoredTournaments = () => {
    try {
      const stored = localStorage.getItem('tournaments');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading tournaments from localStorage:', error);
      return [];
    }
  };

  // Mock data + stored tournaments
  const pendingCount = getStoredTournaments().filter((t: any) => t.status === 'pending_approval').length;
  const approvedCount = getStoredTournaments().filter((t: any) => t.status === 'approved').length;
  const rejectedCount = getStoredTournaments().filter((t: any) => t.status === 'rejected').length;
  const totalTournaments = getStoredTournaments().length;

  const stats = [
    {
      icon: <Trophy className="h-6 w-6" />,
      title: 'Pending Tournaments',
      value: String(pendingCount),
      change: pendingCount > 0 ? `${pendingCount} awaiting review` : 'No pending tournaments',
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    },
    {
      icon: <CheckCircle className="h-6 w-6" />,
      title: 'Approved Tournaments',
      value: String(approvedCount),
      change: approvedCount > 0 ? `${approvedCount} active tournaments` : 'No approved tournaments',
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      icon: <XCircle className="h-6 w-6" />,
      title: 'Rejected Tournaments',
      value: String(rejectedCount),
      change: rejectedCount > 0 ? `${rejectedCount} rejected` : 'No rejected tournaments',
      color: 'text-red-600',
      bgColor: 'bg-red-100'
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: 'Total Tournaments',
      value: String(totalTournaments),
      change: totalTournaments > 0 ? `${totalTournaments} total submissions` : 'No tournaments yet',
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    }
  ];


  // Combine stored tournaments with mock data
  const allTournaments = getStoredTournaments();
  
  const handleApproveTournament = (tournamentId: string) => {
    // Update tournament status in localStorage
    const tournaments = getStoredTournaments();
    const updatedTournaments = tournaments.map((t: any) => 
      t.id === tournamentId ? { ...t, status: 'approved', updated_at: new Date().toISOString() } : t
    );
    localStorage.setItem('tournaments', JSON.stringify(updatedTournaments));
    
    // Find the tournament to get details for notification
    const tournament = allTournaments.find(t => t.id === tournamentId);
    if (tournament) {
      // Add notification for organizer
      addNotification({
        type: 'tournament_approved',
        title: 'Tournament Approved!',
        message: `Your tournament "${tournament.name}" has been approved and is now live.`,
        userId: tournament.organizer_id,
        tournamentId: tournament.id,
        tournamentName: tournament.name,
        targetRole: 'organizer'
      });

      // Add notification for players about new tournament
      addNotification({
        type: 'new_tournament_available',
        title: 'New Tournament Available!',
        message: `${tournament.name} is now open for registration. Sport: ${tournament.sport_type}`,
        tournamentId: tournament.id,
        tournamentName: tournament.name,
        targetRole: 'player'
      });
    }

    console.log('Approving tournament:', tournamentId);
    toast.success('Tournament approved successfully!');
  };

  const handleRejectTournament = (tournamentId: string, reason: string) => {
    // Update tournament status in localStorage
    const tournaments = getStoredTournaments();
    const updatedTournaments = tournaments.map((t: any) => 
      t.id === tournamentId ? { 
        ...t, 
        status: 'rejected', 
        admin_notes: reason,
        updated_at: new Date().toISOString()
      } : t
    );
    localStorage.setItem('tournaments', JSON.stringify(updatedTournaments));
    
    // Find the tournament to get details for notification
    const tournament = allTournaments.find(t => t.id === tournamentId);
    if (tournament) {
      // Add notification for organizer
      addNotification({
        type: 'tournament_rejected',
        title: 'Tournament Rejected',
        message: `Your tournament "${tournament.name}" was rejected. Reason: ${reason}`,
        userId: tournament.organizer_id,
        tournamentId: tournament.id,
        tournamentName: tournament.name,
        targetRole: 'organizer'
      });
    }

    console.log('Rejecting tournament:', tournamentId, 'Reason:', reason);
    toast.error('Tournament rejected.');
  };

  const handleDeleteTournament = (tournamentId: string) => {
    if (!confirm('Are you sure you want to delete this tournament? This action cannot be undone.')) {
      return;
    }

    try {
      // Get current tournaments
      const tournaments = getStoredTournaments();
      
      // Find the tournament to get details for notification
      const tournament = tournaments.find((t: any) => t.id === tournamentId);
      
      // Remove the tournament from the list
      const updatedTournaments = tournaments.filter((t: any) => t.id !== tournamentId);
      localStorage.setItem('tournaments', JSON.stringify(updatedTournaments));
      
      // Clean up organizer registrations
      if (tournament) {
        const organizerRegistrations = JSON.parse(localStorage.getItem('organizerRegistrations') || '{}');
        if (organizerRegistrations[tournament.organizer_id]) {
          organizerRegistrations[tournament.organizer_id] = organizerRegistrations[tournament.organizer_id].filter(
            (reg: any) => reg.tournamentId !== tournamentId
          );
          localStorage.setItem('organizerRegistrations', JSON.stringify(organizerRegistrations));
        }
        
        // Clean up player registrations
        const playerRegistrations = JSON.parse(localStorage.getItem('playerRegistrations') || '{}');
        Object.keys(playerRegistrations).forEach(playerId => {
          playerRegistrations[playerId] = playerRegistrations[playerId].filter(
            (reg: any) => reg.tournamentId !== tournamentId
          );
        });
        localStorage.setItem('playerRegistrations', JSON.stringify(playerRegistrations));
        
        // Notify the organizer
        addNotification({
          type: 'tournament_deleted',
          title: 'Tournament Deleted',
          message: `Your tournament "${tournament.name}" has been deleted by the administrator.`,
          userId: tournament.organizer_id,
          tournamentId: tournament.id,
          tournamentName: tournament.name,
          targetRole: 'organizer'
        });
      }
      
      toast.success('Tournament deleted successfully!');
    } catch (error) {
      console.error('Error deleting tournament:', error);
      toast.error('Failed to delete tournament. Please try again.');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending_approval':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
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

  const filteredTournaments = allTournaments.filter(tournament => {
    const matchesSearch = tournament.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tournament.organizer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tournament.sport_type.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || tournament.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleViewDetails = (tournament: Tournament) => {
    setSelectedTournament(tournament);
    setShowDetailsModal(true);
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
                Admin Dashboard
              </h1>
              <p className="text-gray-600">
                Welcome back, {user?.full_name}! Manage tournaments, facilities, and users
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-orange-500" />
              <span className="text-sm text-orange-600 font-medium">
                {pendingCount > 0 ? `${pendingCount} tournaments awaiting approval` : 'No pending tournaments'}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Navigation Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-8"
        >
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'overview', label: 'Overview', icon: <Users className="h-4 w-4" /> },
                { id: 'tournaments', label: 'Tournaments', icon: <Trophy className="h-4 w-4" /> },
                { id: 'facilities', label: 'Facilities', icon: <MapPin className="h-4 w-4" /> },
                { id: 'users', label: 'Users', icon: <UserCheck className="h-4 w-4" /> },
                { id: 'revenue', label: 'Revenue', icon: <DollarSign className="h-4 w-4" /> }
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

        {/* Overview Tab */}
        {selectedTab === 'overview' && (
          <>
            {/* Stats Grid */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
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
                    <div className={`p-3 rounded-full ${stat.bgColor}`}>
                      <div className={stat.color}>
                        {stat.icon}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </motion.div>

            {/* Recent Activity */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Card className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">
                  Recent Activity
                </h2>
                <div className="space-y-4">
                  {allTournaments.length === 0 ? (
                    <div className="text-center py-8">
                      <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No tournament activity yet</p>
                      <p className="text-sm text-gray-400 mt-1">
                        Tournament submissions and approvals will appear here
                      </p>
                    </div>
                  ) : (
                    allTournaments
                      .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
                      .slice(0, 5)
                      .map((tournament) => (
                        <div key={tournament.id} className={`flex items-center space-x-3 p-3 rounded-lg ${
                          tournament.status === 'pending_approval' ? 'bg-yellow-50' :
                          tournament.status === 'approved' ? 'bg-green-50' :
                          tournament.status === 'rejected' ? 'bg-red-50' : 'bg-gray-50'
                        }`}>
                          {tournament.status === 'pending_approval' && <Clock className="h-5 w-5 text-yellow-600" />}
                          {tournament.status === 'approved' && <CheckCircle className="h-5 w-5 text-green-600" />}
                          {tournament.status === 'rejected' && <XCircle className="h-5 w-5 text-red-600" />}
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {tournament.status === 'pending_approval' && 'New tournament submitted for approval'}
                              {tournament.status === 'approved' && 'Tournament approved'}
                              {tournament.status === 'rejected' && 'Tournament rejected'}
                            </p>
                            <p className="text-xs text-gray-500">
                              {tournament.name} • {new Date(tournament.updated_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      ))
                  )}
                </div>
              </Card>
            </motion.div>
          </>
        )}

        {/* Tournaments Tab */}
        {selectedTab === 'tournaments' && (
          <>
            {/* Search and Filters */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mb-6"
            >
              <Card className="p-6">
                <div className="flex flex-col lg:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                      <Input
                        type="text"
                        placeholder="Search tournaments, organizers, or sports..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  
                  <div className="flex gap-4">
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="all">All Status</option>
                      <option value="pending_approval">Pending Approval</option>
                      <option value="approved">Approved</option>
                      <option value="rejected">Rejected</option>
                      <option value="active">Active</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Tournaments List */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="space-y-6"
            >
              {filteredTournaments.map((tournament, index) => (
                <Card key={tournament.id} className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-xl font-semibold text-gray-900">
                          {tournament.name}
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(tournament.status)}`}>
                          {tournament.status.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-gray-600 mb-3">{tournament.description}</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-500">
                        <div className="flex items-center space-x-2">
                          <Trophy className="h-4 w-4" />
                          <span>{tournament.sport_type}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Users className="h-4 w-4" />
                          <span>{tournament.max_participants} participants max</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4" />
                          <span>{tournament.start_date} to {tournament.end_date}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-4 w-4" />
                          <span>{tournament.facility_name}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <DollarSign className="h-4 w-4" />
                          <span>Entry: रू {tournament.entry_fee}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Trophy className="h-4 w-4" />
                          <span>Prize: रू {tournament.prize_pool}</span>
                        </div>
                      </div>
                      
                      <div className="mt-3 text-sm">
                        <span className="font-medium text-gray-700">Organizer: </span>
                        <span className="text-gray-600">{tournament.organizer_name}</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-end space-x-3 mt-6 pt-4 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-blue-600 hover:text-blue-800"
                      onClick={() => handleViewDetails(tournament)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Full Details
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-800 border-red-300 hover:border-red-400"
                      onClick={() => handleDeleteTournament(tournament.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                    {tournament.status === 'pending_approval' && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-800 border-red-300 hover:border-red-400"
                          onClick={() => handleRejectTournament(tournament.id, 'Admin review required')}
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Reject
                        </Button>
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700 text-white"
                          onClick={() => handleApproveTournament(tournament.id)}
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Approve
                        </Button>
                      </>
                    )}
                  </div>
                </Card>
              ))}
            </motion.div>

            {/* Empty State */}
            {filteredTournaments.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12"
              >
                <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No tournaments found
                </h3>
                <p className="text-gray-600 mb-4">
                  Try adjusting your search criteria or filters
                </p>
                <Button variant="outline" onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                }}>
                  Clear Filters
                </Button>
              </motion.div>
            )}
          </>
        )}

        {/* Facilities Tab */}
        {selectedTab === 'facilities' && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Facility Management
              </h2>
              <p className="text-gray-600">
                Facility management features will be implemented here. This will include:
              </p>
              <ul className="list-disc list-inside text-gray-600 mt-2 space-y-1">
                <li>Approve/reject new facility registrations</li>
                <li>Monitor facility performance and ratings</li>
                <li>Handle facility disputes and issues</li>
                <li>Update facility status and availability</li>
              </ul>
            </Card>
          </motion.div>
        )}

        {/* Users Tab */}
        {selectedTab === 'users' && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                User Management
              </h2>
              <p className="text-gray-600">
                User management features will be implemented here. This will include:
              </p>
              <ul className="list-disc list-inside text-gray-600 mt-2 space-y-1">
                <li>View and manage user accounts</li>
                <li>Handle user reports and disputes</li>
                <li>Monitor user activity and engagement</li>
                <li>Manage user roles and permissions</li>
              </ul>
            </Card>
          </motion.div>
        )}

        {/* Revenue Tab */}
        {selectedTab === 'revenue' && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <RevenueAnalytics userType="platform" />
          </motion.div>
        )}
      </div>

      {/* Tournament Details Modal */}
      <TournamentDetailsModal
        tournament={selectedTournament}
        isOpen={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false);
          setSelectedTournament(null);
        }}
        onApprove={handleApproveTournament}
        onReject={handleRejectTournament}
      />
    </div>
  );
};
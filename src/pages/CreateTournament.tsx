import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { 
  ArrowLeft, 
  MapPin, 
  Calendar, 
  Users, 
  DollarSign, 
  Upload, 
  FileText,
  Image as ImageIcon,
  Trophy,
  Clock,
  Info,
  X,
  Search
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { PlatformFeeCalculator } from '../components/monetization/PlatformFeeCalculator';
import { SPORTS_TYPES, NEPAL_PROVINCES } from '../types';

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const tournamentSchema = z.object({
  name: z.string().min(3, 'Tournament name must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  sport_type: z.string().min(1, 'Please select a sport'),
  tournament_type: z.enum(['single_elimination', 'double_elimination', 'round_robin', 'swiss', 'league']),
  start_date: z.string().min(1, 'Start date is required'),
  end_date: z.string().min(1, 'End date is required'),
  registration_deadline: z.string().min(1, 'Registration deadline is required'),
  max_participants: z.number().min(2, 'Minimum 2 participants required').max(1000, 'Maximum 1000 participants allowed'),
  entry_fee: z.number().min(0, 'Entry fee cannot be negative'),
  prize_pool: z.number().min(0, 'Prize pool cannot be negative'),
  venue_name: z.string().min(1, 'Venue name is required'),
  venue_address: z.string().min(5, 'Venue address must be at least 5 characters'),
  province: z.string().min(1, 'Please select a province'),
  district: z.string().min(1, 'Please select a district'),
  rules: z.string().min(20, 'Rules must be at least 20 characters'),
  requirements: z.string().min(10, 'Requirements must be at least 10 characters'),
  contact_phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  contact_email: z.string().email('Please enter a valid email address'),
  latitude: z.number().optional(),
  longitude: z.number().optional()
});

type TournamentForm = z.infer<typeof tournamentSchema>;

interface LocationMarkerProps {
  position: [number, number] | null;
  setPosition: (position: [number, number]) => void;
  onLocationSelect: (lat: number, lng: number) => void;
}

const LocationMarker: React.FC<LocationMarkerProps> = ({ position, setPosition, onLocationSelect }) => {
  useMapEvents({
    click(e) {
      const newPosition: [number, number] = [e.latlng.lat, e.latlng.lng];
      setPosition(newPosition);
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });

  return position === null ? null : (
    <Marker position={position} />
  );
};

export const CreateTournament: React.FC = () => {
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [mapPosition, setMapPosition] = useState<[number, number] | null>([27.7172, 85.3240]); // Kathmandu default
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [selectedPDF, setSelectedPDF] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string[]>([]);
  const [locationAddress, setLocationAddress] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [isPremiumListing, setIsPremiumListing] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    getValues
  } = useForm<TournamentForm>({
    resolver: zodResolver(tournamentSchema),
    defaultValues: {
      entry_fee: 0,
      prize_pool: 0,
      max_participants: 16,
      tournament_type: 'single_elimination'
    }
  });

  const selectedProvince = watch('province');
  const entryFee = watch('entry_fee') || 0;
  const maxParticipants = watch('max_participants') || 0;

  const getDistrictsForProvince = (provinceName: string) => {
    const province = NEPAL_PROVINCES.find(p => p.name === provinceName);
    return province ? province.districts : [];
  };

  // Reverse geocoding function
  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
      );
      const data = await response.json();
      
      if (data && data.display_name) {
        setLocationAddress(data.display_name);
        
        // Try to auto-fill venue address if empty
        const currentAddress = getValues('venue_address');
        if (!currentAddress) {
          setValue('venue_address', data.display_name);
        }
      }
    } catch (error) {
      console.error('Reverse geocoding failed:', error);
    }
  };

  // Search location function
  const searchLocation = async () => {
    if (!searchQuery.trim()) return;
    
    setSearchLoading(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery + ', Nepal')}&limit=1`
      );
      const data = await response.json();
      
      if (data && data.length > 0) {
        const result = data[0];
        const newPosition: [number, number] = [parseFloat(result.lat), parseFloat(result.lon)];
        setMapPosition(newPosition);
        setLocationAddress(result.display_name);
        
        // Auto-fill venue address
        setValue('venue_address', result.display_name);
        
        toast.success('Location found!');
      } else {
        toast.error('Location not found. Try a different search term.');
      }
    } catch (error) {
      toast.error('Search failed. Please try again.');
    } finally {
      setSearchLoading(false);
    }
  };

  const handleLocationSelect = (lat: number, lng: number) => {
    reverseGeocode(lat, lng);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length + selectedImages.length > 5) {
      toast.error('Maximum 5 images allowed');
      return;
    }

    const validFiles = files.filter(file => {
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} is too large. Maximum 5MB per image.`);
        return false;
      }
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} is not a valid image file.`);
        return false;
      }
      return true;
    });

    setSelectedImages(prev => [...prev, ...validFiles]);

    // Create previews
    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(prev => [...prev, e.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handlePDFUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error('PDF file must be less than 10MB');
      return;
    }

    if (file.type !== 'application/pdf') {
      toast.error('Only PDF files are allowed');
      return;
    }

    setSelectedPDF(file);
    toast.success('PDF uploaded successfully');
  };

  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
    setImagePreview(prev => prev.filter((_, i) => i !== index));
  };

  const removePDF = () => {
    setSelectedPDF(null);
    if (pdfInputRef.current) {
      pdfInputRef.current.value = '';
    }
  };

  const onSubmit = async (data: TournamentForm) => {
    console.log('Form submission started', data);
    setLoading(true);
    
    try {
      // Add map coordinates if selected
      if (mapPosition) {
        data.latitude = mapPosition[0];
        data.longitude = mapPosition[1];
      }

      // Create tournament object with all required fields
      const tournamentData = {
        id: `tournament_${Date.now()}`,
        name: data.name,
        description: data.description,
        sport_type: data.sport_type,
        tournament_type: data.tournament_type,
        organizer_id: user?.id || 'unknown',
        organizer_name: user?.full_name || 'Unknown Organizer',
        facility_id: 'facility_1', // Mock facility ID
        facility_name: data.venue_name,
        start_date: data.start_date,
        end_date: data.end_date,
        registration_deadline: data.registration_deadline,
        max_participants: data.max_participants,
        current_participants: 0,
        entry_fee: data.entry_fee,
        prize_pool: data.prize_pool,
        rules: data.rules,
        requirements: data.requirements,
        status: 'pending_approval' as const,
        venue_address: data.venue_address,
        province: data.province,
        district: data.district,
        contact_phone: data.contact_phone,
        contact_email: data.contact_email,
        latitude: data.latitude,
        longitude: data.longitude,
        images: selectedImages.map(file => file.name),
        pdf_document: selectedPDF?.name,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Convert PDF to base64 if exists
      if (selectedPDF) {
        const reader = new FileReader();
        reader.onload = (e) => {
          saveTournamentData(tournamentData);
        };
        reader.readAsDataURL(selectedPDF);
      } else {
        saveTournamentData(tournamentData);
      }
    } catch (error) {
      console.error('Tournament creation error:', error);
      toast.error('Failed to create tournament. Please try again.');
      setLoading(false);
    }
  };

  const saveTournamentData = async (tournamentData: any) => {
    try {
      console.log('Tournament Data to be saved:', tournamentData);

      // Store in localStorage for now (in real app, this would go to Supabase)
      const existingTournaments = JSON.parse(localStorage.getItem('tournaments') || '[]');
      existingTournaments.push(tournamentData);
      localStorage.setItem('tournaments', JSON.stringify(existingTournaments));

      console.log('Tournament saved to localStorage');

      // Add notification for admin about new tournament submission
      addNotification({
        type: 'tournament_submitted',
        title: 'New Tournament Submitted',
        message: `${tournamentData.name} has been submitted for approval by ${tournamentData.organizer_name}`,
        tournamentId: tournamentData.id,
        tournamentName: tournamentData.name,
        targetRole: 'admin'
      });

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      toast.success('Tournament created successfully! Awaiting admin approval.');
      navigate('/organizer-dashboard');
    } catch (error) {
      console.error('Tournament creation error:', error);
      toast.error('Failed to create tournament. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Button
            variant="ghost"
            onClick={() => navigate('/organizer-dashboard')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Tournament</h1>
          <p className="text-gray-600">Fill out all the details to create your tournament</p>
        </motion.div>

        {/* Single Page Form */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="p-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              {/* Basic Information Section */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                  <Info className="h-5 w-5 mr-2 text-blue-600" />
                  Basic Information
                </h2>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="lg:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tournament Name *
                    </label>
                    <input
                      type="text"
                      {...register('name')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter tournament name"
                    />
                    {errors.name && (
                      <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                    )}
                  </div>

                  <div className="lg:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description *
                    </label>
                    <textarea
                      {...register('description')}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Describe your tournament..."
                    />
                    {errors.description && (
                      <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sport/Game Type *
                    </label>
                    <select
                      {...register('sport_type')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select a sport/game</option>
                      <optgroup label="Physical Sports">
                        {SPORTS_TYPES.filter(sport => 
                          !['Dota 2', 'League of Legends', 'Counter-Strike 2', 'Valorant', 'PUBG Mobile',
                           'Mobile Legends', 'Free Fire', 'Call of Duty', 'Fortnite', 'Apex Legends',
                           'Overwatch 2', 'FIFA', 'NBA 2K', 'Rocket League', 'Street Fighter',
                           'Tekken', 'Mortal Kombat', 'Chess.com', 'Clash Royale', 'Clash of Clans',
                           'Among Us', 'Fall Guys', 'Minecraft', 'Roblox', 'Genshin Impact'].includes(sport)
                        ).map(sport => (
                          <option key={sport} value={sport}>{sport}</option>
                        ))}
                      </optgroup>
                      <optgroup label="Esports">
                        {['Dota 2', 'League of Legends', 'Counter-Strike 2', 'Valorant', 'PUBG Mobile',
                          'Mobile Legends', 'Free Fire', 'Call of Duty', 'Fortnite', 'Apex Legends',
                          'Overwatch 2', 'FIFA', 'NBA 2K', 'Rocket League', 'Street Fighter',
                          'Tekken', 'Mortal Kombat', 'Chess.com', 'Clash Royale', 'Clash of Clans',
                          'Among Us', 'Fall Guys', 'Minecraft', 'Roblox', 'Genshin Impact'].map(sport => (
                          <option key={sport} value={sport}>{sport}</option>
                        ))}
                      </optgroup>
                    </select>
                    {errors.sport_type && (
                      <p className="mt-1 text-sm text-red-600">{errors.sport_type.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tournament Format *
                    </label>
                    <select
                      {...register('tournament_type')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="single_elimination">Single Elimination</option>
                      <option value="double_elimination">Double Elimination</option>
                      <option value="round_robin">Round Robin</option>
                      <option value="swiss">Swiss System</option>
                      <option value="league">League Format</option>
                    </select>
                    {errors.tournament_type && (
                      <p className="mt-1 text-sm text-red-600">{errors.tournament_type.message}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Tournament Details Section */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                  <Trophy className="h-5 w-5 mr-2 text-blue-600" />
                  Tournament Details
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Start Date *
                    </label>
                    <input
                      type="date"
                      {...register('start_date')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    {errors.start_date && (
                      <p className="mt-1 text-sm text-red-600">{errors.start_date.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      End Date *
                    </label>
                    <input
                      type="date"
                      {...register('end_date')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    {errors.end_date && (
                      <p className="mt-1 text-sm text-red-600">{errors.end_date.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Registration Deadline *
                    </label>
                    <input
                      type="date"
                      {...register('registration_deadline')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    {errors.registration_deadline && (
                      <p className="mt-1 text-sm text-red-600">{errors.registration_deadline.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Max Participants *
                    </label>
                    <input
                      type="number"
                      {...register('max_participants', { valueAsNumber: true })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      min="2"
                      max="1000"
                    />
                    {errors.max_participants && (
                      <p className="mt-1 text-sm text-red-600">{errors.max_participants.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Entry Fee (रू)
                    </label>
                    <input
                      type="number"
                      {...register('entry_fee', { valueAsNumber: true })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      min="0"
                    />
                    {errors.entry_fee && (
                      <p className="mt-1 text-sm text-red-600">{errors.entry_fee.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Prize Pool (रू)
                    </label>
                    <input
                      type="number"
                      {...register('prize_pool', { valueAsNumber: true })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      min="0"
                    />
                    {errors.prize_pool && (
                      <p className="mt-1 text-sm text-red-600">{errors.prize_pool.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tournament Rules *
                    </label>
                    <textarea
                      {...register('rules')}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Specify the rules and regulations for your tournament..."
                    />
                    {errors.rules && (
                      <p className="mt-1 text-sm text-red-600">{errors.rules.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Participation Requirements *
                    </label>
                    <textarea
                      {...register('requirements')}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="What do participants need to bring or have to participate?"
                    />
                    {errors.requirements && (
                      <p className="mt-1 text-sm text-red-600">{errors.requirements.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contact Phone *
                    </label>
                    <input
                      type="tel"
                      {...register('contact_phone')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="+977-1-4567890"
                    />
                    {errors.contact_phone && (
                      <p className="mt-1 text-sm text-red-600">{errors.contact_phone.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contact Email *
                    </label>
                    <input
                      type="email"
                      {...register('contact_email')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="tournament@example.com"
                    />
                    {errors.contact_email && (
                      <p className="mt-1 text-sm text-red-600">{errors.contact_email.message}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Location Section */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                  <MapPin className="h-5 w-5 mr-2 text-blue-600" />
                  Location Details
                </h2>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Venue Name *
                    </label>
                    <input
                      type="text"
                      {...register('venue_name')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter venue name"
                    />
                    {errors.venue_name && (
                      <p className="mt-1 text-sm text-red-600">{errors.venue_name.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Search Location
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Search for a location in Nepal..."
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), searchLocation())}
                      />
                      <Button
                        type="button"
                        onClick={searchLocation}
                        disabled={searchLoading || !searchQuery.trim()}
                        className="px-4"
                      >
                        {searchLoading ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        ) : (
                          <Search className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Venue Address *
                  </label>
                  <textarea
                    {...register('venue_address')}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter complete venue address"
                  />
                  {errors.venue_address && (
                    <p className="mt-1 text-sm text-red-600">{errors.venue_address.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Province *
                    </label>
                    <select
                      {...register('province')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select Province</option>
                      {NEPAL_PROVINCES.map(province => (
                        <option key={province.id} value={province.name}>
                          {province.name}
                        </option>
                      ))}
                    </select>
                    {errors.province && (
                      <p className="mt-1 text-sm text-red-600">{errors.province.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      District *
                    </label>
                    <select
                      {...register('district')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      disabled={!selectedProvince}
                    >
                      <option value="">Select District</option>
                      {selectedProvince && getDistrictsForProvince(selectedProvince).map(district => (
                        <option key={district} value={district}>
                          {district}
                        </option>
                      ))}
                    </select>
                    {errors.district && (
                      <p className="mt-1 text-sm text-red-600">{errors.district.message}</p>
                    )}
                  </div>
                </div>

                {/* Selected Location Display */}
                {locationAddress && (
                  <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-start space-x-2">
                      <MapPin className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-blue-900">Selected Location:</p>
                        <p className="text-sm text-blue-700">{locationAddress}</p>
                        {mapPosition && (
                          <p className="text-xs text-blue-600 mt-1">
                            Coordinates: {mapPosition[0].toFixed(6)}, {mapPosition[1].toFixed(6)}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Location on Map
                  </label>
                  <p className="text-sm text-gray-500 mb-3">
                    Click on the map to mark the exact location of your tournament venue
                  </p>
                  
                  <div className="h-64 rounded-lg overflow-hidden border border-gray-300">
                    <MapContainer
                      center={mapPosition || [27.7172, 85.3240]}
                      zoom={13}
                      style={{ height: '100%', width: '100%' }}
                    >
                      <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      />
                      <LocationMarker 
                        position={mapPosition} 
                        setPosition={setMapPosition}
                        onLocationSelect={handleLocationSelect}
                      />
                    </MapContainer>
                  </div>
                </div>
              </div>

              {/* Media & Files Section */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                  <Upload className="h-5 w-5 mr-2 text-blue-600" />
                  Media & Files (Optional)
                </h2>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Image Upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tournament Images
                    </label>
                    <p className="text-sm text-gray-500 mb-3">
                      Upload up to 5 images. Maximum 5MB per image.
                    </p>
                    
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors">
                      <input
                        ref={imageInputRef}
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                      <ImageIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-600 text-sm mb-2">Click to upload images</p>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => imageInputRef.current?.click()}
                      >
                        Choose Images
                      </Button>
                    </div>

                    {/* Image Previews */}
                    {imagePreview.length > 0 && (
                      <div className="grid grid-cols-2 gap-2 mt-4">
                        {imagePreview.map((preview, index) => (
                          <div key={index} className="relative">
                            <img
                              src={preview}
                              alt={`Preview ${index + 1}`}
                              className="w-full h-20 object-cover rounded-lg"
                            />
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* PDF Upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tournament Document
                    </label>
                    <p className="text-sm text-gray-500 mb-3">
                      Upload a PDF document with detailed tournament information. Maximum 10MB.
                    </p>
                    
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors">
                      <input
                        ref={pdfInputRef}
                        type="file"
                        accept=".pdf"
                        onChange={handlePDFUpload}
                        className="hidden"
                      />
                      <FileText className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-600 text-sm mb-2">Click to upload PDF document</p>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => pdfInputRef.current?.click()}
                      >
                        Choose PDF
                      </Button>
                    </div>

                    {/* PDF Preview */}
                    {selectedPDF && (
                      <div className="mt-4 p-3 bg-gray-50 rounded-lg flex items-center justify-between">
                        <div className="flex items-center">
                          <FileText className="h-6 w-6 text-red-500 mr-2" />
                          <div>
                            <p className="font-medium text-gray-900 text-sm">{selectedPDF.name}</p>
                            <p className="text-xs text-gray-500">
                              {(selectedPDF.size / (1024 * 1024)).toFixed(2)} MB
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={removePDF}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-6 border-t">
                {/* Revenue Calculator */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Projection</h3>
                  <PlatformFeeCalculator
                    entryFee={entryFee}
                    participants={maxParticipants}
                    isPremiumListing={isPremiumListing}
                  />
                </div>
                
                {/* Submit Section */}
                <div className="flex flex-col justify-end">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                    <h4 className="font-medium text-blue-900 mb-2">Platform Benefits</h4>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• Secure payment processing</li>
                      <li>• Participant management tools</li>
                      <li>• Marketing and promotion</li>
                      <li>• 24/7 customer support</li>
                    </ul>
                  </div>
                  
                  <Button 
                    type="submit" 
                    loading={loading}
                    size="lg"
                    className="w-full"
                  >
                    {loading ? 'Creating Tournament...' : 'Create Tournament'}
                  </Button>
                </div>
              </div>
            </form>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};
// Sample tournament data for testing
export const sampleTournaments = [
  {
    id: 'tournament_001',
    name: 'Kathmandu Football Championship 2025',
    description: 'The biggest football tournament in Kathmandu valley. Join teams from across the city to compete for the ultimate prize. This tournament features professional-level competition with experienced referees and live streaming.',
    sport_type: 'Football',
    tournament_type: 'single_elimination',
    organizer_id: 'organizer-001',
    organizer_name: 'Sabin Mahat',
    facility_id: 'facility_001',
    facility_name: 'Dasharath Stadium',
    venue_name: 'Dasharath Stadium',
    venue_address: 'Tripureshwor, Kathmandu, Nepal',
    province: 'Bagmati Province',
    district: 'Kathmandu',
    start_date: '2025-02-15',
    end_date: '2025-02-25',
    registration_deadline: '2025-02-10',
    max_participants: 32,
    current_participants: 18,
    entry_fee: 2500,
    prize_pool: 150000,
    rules: `Tournament Rules:
1. Each team must have 11 players + 5 substitutes
2. Matches will be 90 minutes (45 min each half)
3. Standard FIFA rules apply
4. Yellow/Red card system in effect
5. Knockout format - single elimination
6. Semi-finals and finals will have extra time if needed
7. All players must have valid ID proof
8. Team captain must attend pre-tournament briefing`,
    requirements: `Requirements:
• Team registration fee: रू 2,500
• All players must be 16+ years old
• Valid government ID required
• Team jersey (home/away colors)
• Football boots and shin guards mandatory
• Medical certificate for all players
• Team insurance recommended
• Arrive 30 minutes before match time`,
    status: 'approved',
    contact_phone: '+977-9841234567',
    contact_email: 'sabin@khelkheleko.com',
    latitude: 27.6915,
    longitude: 85.3146,
    images: ['tournament_001_1.jpg', 'tournament_001_2.jpg'],
    imageData: [
      'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=',
      'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k='
    ],
    created_at: '2025-01-15T10:00:00Z',
    updated_at: '2025-01-15T10:00:00Z'
  },
  {
    id: 'tournament_002',
    name: 'Pokhara Basketball League',
    description: 'Annual basketball tournament featuring the best teams from Pokhara and surrounding areas. Fast-paced action with professional courts and equipment.',
    sport_type: 'Basketball',
    tournament_type: 'round_robin',
    organizer_id: 'organizer-002',
    organizer_name: 'Basketball Nepal',
    facility_id: 'facility_002',
    facility_name: 'Pokhara Sports Complex',
    venue_name: 'Pokhara Sports Complex',
    venue_address: 'Bagar, Pokhara, Nepal',
    province: 'Gandaki Province',
    district: 'Kaski',
    start_date: '2025-03-01',
    end_date: '2025-03-10',
    registration_deadline: '2025-02-25',
    max_participants: 16,
    current_participants: 12,
    entry_fee: 1500,
    prize_pool: 75000,
    rules: `Basketball Tournament Rules:
1. Standard FIBA rules apply
2. 4 quarters of 10 minutes each
3. 5 players per team on court
4. Maximum 12 players per roster
5. Round-robin format followed by playoffs
6. Shot clock: 24 seconds
7. Foul limit: 5 personal fouls per player
8. Technical fouls result in immediate ejection`,
    requirements: `Requirements:
• Team registration fee: रू 1,500
• All players must be 15+ years old
• Basketball shoes mandatory
• Team uniform required
• Valid ID for all players
• Team captain must attend briefing
• Medical clearance recommended`,
    status: 'approved',
    contact_phone: '+977-9856789012',
    contact_email: 'info@basketballnepal.com',
    latitude: 28.2096,
    longitude: 83.9856,
    images: ['tournament_002_1.jpg'],
    imageData: [
      'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k='
    ],
    created_at: '2025-01-10T14:30:00Z',
    updated_at: '2025-01-10T14:30:00Z'
  },
  {
    id: 'tournament_003',
    name: 'Chitwan Cricket Cup',
    description: 'T20 cricket tournament in the heart of Nepal. Experience cricket at its finest with professional umpires and live commentary.',
    sport_type: 'Cricket',
    tournament_type: 'double_elimination',
    organizer_id: 'organizer-003',
    organizer_name: 'Chitwan Cricket Association',
    facility_id: 'facility_003',
    facility_name: 'Chitwan Cricket Ground',
    venue_name: 'Chitwan Cricket Ground',
    venue_address: 'Bharatpur, Chitwan, Nepal',
    province: 'Bagmati Province',
    district: 'Chitwan',
    start_date: '2025-04-15',
    end_date: '2025-04-25',
    registration_deadline: '2025-04-10',
    max_participants: 24,
    current_participants: 8,
    entry_fee: 3000,
    prize_pool: 200000,
    rules: `Cricket Tournament Rules:
1. T20 format - 20 overs per side
2. Standard ICC rules apply
3. 11 players per team + 4 substitutes
4. Powerplay: First 6 overs
5. Double elimination format
6. DRS not available
7. Rain rule: DLS method
8. All matches day/night format`,
    requirements: `Requirements:
• Team registration fee: रू 3,000
• Cricket whites/colored clothing
• All protective gear mandatory
• Valid ID for all players
• Team must have certified coach
• Insurance coverage required
• Minimum 13 players per squad`,
    status: 'approved',
    contact_phone: '+977-9812345678',
    contact_email: 'cricket@chitwan.com',
    latitude: 27.6244,
    longitude: 84.4289,
    images: [],
    imageData: [],
    created_at: '2025-01-20T09:15:00Z',
    updated_at: '2025-01-20T09:15:00Z'
  }
];

export const sampleParticipants = [
  {
    id: 'reg_001',
    tournament_id: 'tournament_001',
    tournament_name: 'Kathmandu Football Championship 2025',
    sport_type: 'Football',
    organizer_id: 'organizer-001',
    player_id: 'player_001',
    player_name: 'Rajesh Shrestha',
    email: 'rajesh@example.com',
    phone: '+977-9841111111',
    age: 24,
    experience_level: 'advanced',
    team_name: 'Kathmandu United',
    emergency_contact: '+977-9841111112',
    medical_conditions: '',
    registration_date: '2025-01-16T10:00:00Z',
    status: 'confirmed',
    entry_fee_paid: true,
    payment_status: 'completed'
  },
  {
    id: 'reg_002',
    tournament_id: 'tournament_001',
    tournament_name: 'Kathmandu Football Championship 2025',
    sport_type: 'Football',
    organizer_id: 'organizer-001',
    player_id: 'player_002',
    player_name: 'Sita Gurung',
    email: 'sita@example.com',
    phone: '+977-9842222222',
    age: 22,
    experience_level: 'intermediate',
    team_name: 'Valley Warriors',
    emergency_contact: '+977-9842222223',
    medical_conditions: 'Mild asthma - carries inhaler',
    registration_date: '2025-01-17T14:30:00Z',
    status: 'confirmed',
    entry_fee_paid: true,
    payment_status: 'completed'
  },
  {
    id: 'reg_003',
    tournament_id: 'tournament_002',
    tournament_name: 'Pokhara Basketball League',
    sport_type: 'Basketball',
    organizer_id: 'organizer-002',
    player_id: 'player_003',
    player_name: 'Arjun Thapa',
    email: 'arjun@example.com',
    phone: '+977-9843333333',
    age: 26,
    experience_level: 'professional',
    team_name: 'Pokhara Lakers',
    emergency_contact: '+977-9843333334',
    medical_conditions: '',
    registration_date: '2025-01-18T11:15:00Z',
    status: 'registered',
    entry_fee_paid: false,
    payment_status: 'pending'
  }
];

// Function to load sample data
export const loadSampleData = () => {
  // Load tournaments
  const existingTournaments = JSON.parse(localStorage.getItem('tournaments') || '[]');
  const mergedTournaments = [...existingTournaments];
  
  sampleTournaments.forEach(sampleTournament => {
    const exists = mergedTournaments.find(t => t.id === sampleTournament.id);
    if (!exists) {
      mergedTournaments.push(sampleTournament);
    }
  });
  
  localStorage.setItem('tournaments', JSON.stringify(mergedTournaments));
  
  // Load sample participants for organizer
  const organizerId = 'organizer-001';
  const existingRegistrations = JSON.parse(localStorage.getItem(`organizer_registrations_${organizerId}`) || '[]');
  const mergedRegistrations = [...existingRegistrations];
  
  sampleParticipants.forEach(participant => {
    const exists = mergedRegistrations.find(r => r.id === participant.id);
    if (!exists && participant.organizer_id === organizerId) {
      mergedRegistrations.push(participant);
    }
  });
  
  localStorage.setItem(`organizer_registrations_${organizerId}`, JSON.stringify(mergedRegistrations));
  
  console.log('✅ Sample data loaded successfully!');
  console.log(`📊 Loaded ${sampleTournaments.length} tournaments`);
  console.log(`👥 Loaded ${sampleParticipants.length} participants`);
};

// Function to clear all data (for testing)
export const clearAllData = () => {
  localStorage.removeItem('tournaments');
  localStorage.removeItem('organizer_registrations_organizer-001');
  localStorage.removeItem('player_registrations_player_001');
  console.log('🗑️ All sample data cleared');
};
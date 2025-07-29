import { PlayerStats, PlayerAchievement, PlayerProfile } from '../types';

export class PlayerStatsManager {
  private static instance: PlayerStatsManager;
  
  static getInstance(): PlayerStatsManager {
    if (!PlayerStatsManager.instance) {
      PlayerStatsManager.instance = new PlayerStatsManager();
    }
    return PlayerStatsManager.instance;
  }

  // Get player statistics
  getPlayerStats(playerId: string): {
    totalTournaments: number;
    totalMatches: number;
    matchesWon: number;
    hoursPlayed: number;
    overallRating: number;
    winRate: number;
  } {
    try {
      const stats = JSON.parse(localStorage.getItem(`player_stats_${playerId}`) || '[]') as PlayerStats[];
      const registrations = JSON.parse(localStorage.getItem(`player_registrations_${playerId}`) || '[]');
      
      const totalTournaments = registrations.length;
      const totalMatches = stats.reduce((sum, stat) => sum + stat.matches_played, 0);
      const matchesWon = stats.reduce((sum, stat) => sum + stat.matches_won, 0);
      const hoursPlayed = stats.reduce((sum, stat) => sum + stat.hours_played, 0);
      
      // Calculate overall rating based on performance
      const overallRating = this.calculateOverallRating(stats, totalTournaments, matchesWon, totalMatches);
      const winRate = totalMatches > 0 ? (matchesWon / totalMatches) * 100 : 0;

      return {
        totalTournaments,
        totalMatches,
        matchesWon,
        hoursPlayed,
        overallRating,
        winRate
      };
    } catch (error) {
      console.error('Error getting player stats:', error);
      return {
        totalTournaments: 0,
        totalMatches: 0,
        matchesWon: 0,
        hoursPlayed: 0,
        overallRating: 0,
        winRate: 0
      };
    }
  }

  // Calculate overall rating
  private calculateOverallRating(stats: PlayerStats[], tournaments: number, wins: number, matches: number): number {
    if (tournaments === 0) return 0;
    
    const baseRating = 1000; // Starting rating
    const tournamentBonus = tournaments * 50; // 50 points per tournament
    const winBonus = wins * 25; // 25 points per win
    const participationBonus = matches * 5; // 5 points per match played
    
    // Performance multiplier based on win rate
    const winRate = matches > 0 ? wins / matches : 0;
    const performanceMultiplier = 1 + (winRate * 0.5); // Up to 50% bonus for 100% win rate
    
    const totalRating = (baseRating + tournamentBonus + winBonus + participationBonus) * performanceMultiplier;
    
    // Cap at 5000 and round to 1 decimal
    return Math.min(Math.round(totalRating * 10) / 10, 5000);
  }

  // Add tournament result
  addTournamentResult(playerId: string, tournamentId: string, tournamentName: string, sportType: string, result: {
    matchesPlayed: number;
    matchesWon: number;
    hoursPlayed: number;
    position?: number;
    performanceRating?: number;
  }): void {
    try {
      const stats = JSON.parse(localStorage.getItem(`player_stats_${playerId}`) || '[]') as PlayerStats[];
      
      const newStat: PlayerStats = {
        id: `stat_${Date.now()}`,
        player_id: playerId,
        tournament_id: tournamentId,
        tournament_name: tournamentName,
        sport_type: sportType,
        matches_played: result.matchesPlayed,
        matches_won: result.matchesWon,
        matches_lost: result.matchesPlayed - result.matchesWon,
        hours_played: result.hoursPlayed,
        performance_rating: result.performanceRating || 0,
        achievements: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      stats.push(newStat);
      localStorage.setItem(`player_stats_${playerId}`, JSON.stringify(stats));

      // Check for achievements
      this.checkAndAwardAchievements(playerId, newStat, result.position);
    } catch (error) {
      console.error('Error adding tournament result:', error);
    }
  }

  // Check and award achievements
  private checkAndAwardAchievements(playerId: string, stat: PlayerStats, position?: number): void {
    const achievements: PlayerAchievement[] = [];

    // Tournament Winner
    if (position === 1) {
      achievements.push({
        id: `achievement_${Date.now()}_winner`,
        player_id: playerId,
        type: 'tournament_winner',
        title: 'Tournament Champion',
        description: `Won ${stat.tournament_name}`,
        tournament_id: stat.tournament_id,
        tournament_name: stat.tournament_name,
        earned_date: new Date().toISOString(),
        badge_color: 'gold'
      });
    }

    // Runner-up
    if (position === 2) {
      achievements.push({
        id: `achievement_${Date.now()}_runner`,
        player_id: playerId,
        type: 'tournament_runner_up',
        title: 'Tournament Runner-up',
        description: `Finished 2nd in ${stat.tournament_name}`,
        tournament_id: stat.tournament_id,
        tournament_name: stat.tournament_name,
        earned_date: new Date().toISOString(),
        badge_color: 'silver'
      });
    }

    // Perfect Record
    if (stat.matches_played > 0 && stat.matches_won === stat.matches_played && stat.matches_played >= 3) {
      achievements.push({
        id: `achievement_${Date.now()}_perfect`,
        player_id: playerId,
        type: 'fair_play',
        title: 'Perfect Record',
        description: `Won all ${stat.matches_played} matches in ${stat.tournament_name}`,
        tournament_id: stat.tournament_id,
        tournament_name: stat.tournament_name,
        earned_date: new Date().toISOString(),
        badge_color: 'purple'
      });
    }

    // Milestone achievements
    const playerStats = this.getPlayerStats(playerId);
    
    // First Tournament
    if (playerStats.totalTournaments === 1) {
      achievements.push({
        id: `achievement_${Date.now()}_first`,
        player_id: playerId,
        type: 'milestone',
        title: 'First Steps',
        description: 'Completed your first tournament',
        earned_date: new Date().toISOString(),
        badge_color: 'blue'
      });
    }

    // 10 Tournaments
    if (playerStats.totalTournaments === 10) {
      achievements.push({
        id: `achievement_${Date.now()}_veteran`,
        player_id: playerId,
        type: 'milestone',
        title: 'Tournament Veteran',
        description: 'Participated in 10 tournaments',
        earned_date: new Date().toISOString(),
        badge_color: 'green'
      });
    }

    // Save achievements
    if (achievements.length > 0) {
      const existingAchievements = JSON.parse(localStorage.getItem(`player_achievements_${playerId}`) || '[]');
      existingAchievements.push(...achievements);
      localStorage.setItem(`player_achievements_${playerId}`, JSON.stringify(existingAchievements));
    }
  }

  // Get player achievements
  getPlayerAchievements(playerId: string): PlayerAchievement[] {
    try {
      return JSON.parse(localStorage.getItem(`player_achievements_${playerId}`) || '[]');
    } catch (error) {
      console.error('Error getting achievements:', error);
      return [];
    }
  }

  // Get player profile
  getPlayerProfile(playerId: string): PlayerProfile | null {
    try {
      const profile = localStorage.getItem(`player_profile_${playerId}`);
      return profile ? JSON.parse(profile) : null;
    } catch (error) {
      console.error('Error getting player profile:', error);
      return null;
    }
  }

  // Update player profile
  updatePlayerProfile(playerId: string, profileData: Partial<PlayerProfile>): void {
    try {
      const existingProfile = this.getPlayerProfile(playerId);
      const updatedProfile: PlayerProfile = {
        id: existingProfile?.id || `profile_${Date.now()}`,
        user_id: playerId,
        bio: profileData.bio || existingProfile?.bio || '',
        favorite_sports: profileData.favorite_sports || existingProfile?.favorite_sports || [],
        skill_level: profileData.skill_level || existingProfile?.skill_level || 'beginner',
        location: profileData.location || existingProfile?.location || '',
        date_of_birth: profileData.date_of_birth || existingProfile?.date_of_birth,
        height: profileData.height || existingProfile?.height,
        weight: profileData.weight || existingProfile?.weight,
        preferred_position: profileData.preferred_position || existingProfile?.preferred_position,
        social_links: profileData.social_links || existingProfile?.social_links || {},
        privacy_settings: profileData.privacy_settings || existingProfile?.privacy_settings || {
          show_stats: true,
          show_achievements: true,
          show_contact: false
        },
        created_at: existingProfile?.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      localStorage.setItem(`player_profile_${playerId}`, JSON.stringify(updatedProfile));
    } catch (error) {
      console.error('Error updating player profile:', error);
    }
  }

  // Get sport-specific stats
  getSportStats(playerId: string, sportType: string): {
    tournaments: number;
    matches: number;
    wins: number;
    hours: number;
    rating: number;
  } {
    try {
      const stats = JSON.parse(localStorage.getItem(`player_stats_${playerId}`) || '[]') as PlayerStats[];
      const sportStats = stats.filter(stat => stat.sport_type === sportType);
      
      const tournaments = sportStats.length;
      const matches = sportStats.reduce((sum, stat) => sum + stat.matches_played, 0);
      const wins = sportStats.reduce((sum, stat) => sum + stat.matches_won, 0);
      const hours = sportStats.reduce((sum, stat) => sum + stat.hours_played, 0);
      const rating = this.calculateOverallRating(sportStats, tournaments, wins, matches);

      return { tournaments, matches, wins, hours, rating };
    } catch (error) {
      console.error('Error getting sport stats:', error);
      return { tournaments: 0, matches: 0, wins: 0, hours: 0, rating: 0 };
    }
  }

  // Generate sample data for testing
  generateSampleData(playerId: string): void {
    // Sample tournament results
    const sampleResults = [
      {
        tournamentId: 'tournament_001',
        tournamentName: 'Kathmandu Football Championship 2025',
        sportType: 'Football',
        matchesPlayed: 5,
        matchesWon: 3,
        hoursPlayed: 8,
        position: 3,
        performanceRating: 4.2
      },
      {
        tournamentId: 'tournament_002',
        tournamentName: 'Pokhara Basketball League',
        sportType: 'Basketball',
        matchesPlayed: 4,
        matchesWon: 4,
        hoursPlayed: 6,
        position: 1,
        performanceRating: 4.8
      },
      {
        tournamentId: 'tournament_003',
        tournamentName: 'Chitwan Cricket Cup',
        sportType: 'Cricket',
        matchesPlayed: 3,
        matchesWon: 1,
        hoursPlayed: 12,
        position: 8,
        performanceRating: 3.5
      }
    ];

    sampleResults.forEach(result => {
      this.addTournamentResult(playerId, result.tournamentId, result.tournamentName, result.sportType, result);
    });

    // Sample profile
    this.updatePlayerProfile(playerId, {
      bio: 'Passionate sports player from Nepal. Love competing in various tournaments and meeting new people through sports.',
      favorite_sports: ['Football', 'Basketball', 'Cricket'],
      skill_level: 'intermediate',
      location: 'Kathmandu, Nepal',
      preferred_position: 'Midfielder',
      privacy_settings: {
        show_stats: true,
        show_achievements: true,
        show_contact: false
      }
    });
  }
}

export const playerStatsManager = PlayerStatsManager.getInstance();
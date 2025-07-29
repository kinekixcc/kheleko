import React, { createContext, useContext, useEffect, useState } from 'react';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, fullName: string, role: 'player' | 'organizer' | 'admin', phone?: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    const getSession = async () => {
      // Check for admin session first
      const adminSession = localStorage.getItem('adminSession');
      if (adminSession) {
        setUser(JSON.parse(adminSession));
        setLoading(false);
        return;
      }
      
      // Check for organizer session
      const organizerSession = localStorage.getItem('organizerSession');
      if (organizerSession) {
        setUser(JSON.parse(organizerSession));
        setLoading(false);
        return;
      }
      
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(mapSupabaseUser(session.user));
      }
      setLoading(false);
    };

    getSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setUser(mapSupabaseUser(session.user));
        } else {
          setUser(null);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const mapSupabaseUser = (supabaseUser: SupabaseUser): User => ({
    id: supabaseUser.id,
    email: supabaseUser.email!,
    full_name: supabaseUser.user_metadata.full_name || '',
    role: supabaseUser.user_metadata.role || 'player',
    phone: supabaseUser.user_metadata.phone,
    created_at: supabaseUser.created_at
  });

  const signIn = async (email: string, password: string) => {
    // Check for mock accounts first before hitting Supabase
    if (email === 'adminsabin@gmail.com' && password === 'windows8.1') {
      const mockAdminUser: User = {
        id: 'admin-001',
        email: 'adminsabin@gmail.com',
        full_name: 'Admin Sabin',
        role: 'admin',
        created_at: new Date().toISOString()
      };
      setUser(mockAdminUser);
      localStorage.setItem('adminSession', JSON.stringify(mockAdminUser));
      return { error: null };
    }
    
    if (email === 'mahatsabin611@gmail.com' && password === 'windows8.1') {
      const mockOrganizerUser: User = {
        id: 'organizer-001',
        email: 'mahatsabin611@gmail.com',
        full_name: 'Sabin Mahat',
        role: 'organizer',
        created_at: new Date().toISOString()
      };
      setUser(mockOrganizerUser);
      localStorage.setItem('organizerSession', JSON.stringify(mockOrganizerUser));
      return { error: null };
    }
    
    // Check if Supabase is properly configured before attempting authentication
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseAnonKey || 
        supabaseUrl.includes('your-project') || 
        supabaseAnonKey.includes('your-anon-key') ||
        supabaseUrl.includes('placeholder') ||
        supabaseAnonKey.includes('placeholder')) {
      return { error: { message: 'Please use mock accounts for testing: adminsabin@gmail.com or mahatsabin611@gmail.com (password: windows8.1)' } };
    }
    
    // Only try Supabase if properly configured and not a mock account
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        // If Supabase returns invalid credentials, suggest using mock accounts
        if (error.message.includes('Invalid login credentials')) {
          return { error: { message: 'Invalid credentials. For testing, use: adminsabin@gmail.com or mahatsabin611@gmail.com (password: windows8.1)' } };
        }
        return { error };
      }
      
      return { error };
    } catch (err) {
      // If Supabase throws an error, suggest using mock accounts
      return { error: { message: 'Authentication service error. Please use mock accounts: adminsabin@gmail.com or mahatsabin611@gmail.com (password: windows8.1)' } };
    }
  };

  const signUp = async (email: string, password: string, fullName: string, role: 'player' | 'organizer', phone?: string) => {
    // Handle mock organizer signup
    if (email === 'mahatsabin611@gmail.com' && password === 'windows8.1') {
      const mockOrganizerUser: User = {
        id: 'organizer-001',
        email: 'mahatsabin611@gmail.com',
        full_name: fullName || 'Sabin Mahat',
        role: 'organizer',
        phone: phone,
        created_at: new Date().toISOString()
      };
      setUser(mockOrganizerUser);
      localStorage.setItem('organizerSession', JSON.stringify(mockOrganizerUser));
      return { error: null };
    }
    
    // For other accounts, try Supabase
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            phone: phone,
            role: role
          }
        }
      });
      return { error };
    } catch (err) {
      // If Supabase is not configured, allow local registration for testing
      const mockUser: User = {
        id: `user-${Date.now()}`,
        email,
        full_name: fullName,
        role,
        phone,
        created_at: new Date().toISOString()
      };
      setUser(mockUser);
      localStorage.setItem(`${role}Session`, JSON.stringify(mockUser));
      return { error: null };
    }
  };

  const signOut = async () => {
    // Clear admin session
    localStorage.removeItem('adminSession');
    // Clear organizer session
    localStorage.removeItem('organizerSession');
    
    // Only call Supabase signOut for real users (not mock users)
    if (user && !user.id.startsWith('admin-') && !user.id.startsWith('organizer-') && !user.id.startsWith('user-')) {
      try {
        await supabase.auth.signOut();
      } catch (error) {
        // Ignore logout errors - user will still be logged out locally
        console.warn('Supabase logout error (ignored):', error);
      }
    }
    
    setUser(null);
  };

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
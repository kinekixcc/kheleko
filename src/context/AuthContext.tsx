
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
    const getSession = async () => {
      const adminSession = localStorage.getItem('adminSession');
      if (adminSession) {
        setUser(JSON.parse(adminSession));
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
    // Special handling for admin account
    if (email === 'adminsabin@gmail.com' && password === 'windows8.1') {
      const adminUser: User = {
        id: 'admin-001',
        email: 'adminsabin@gmail.com',
        full_name: 'Admin Sabin',
        role: 'admin',
        created_at: new Date().toISOString()
      };
      setUser(adminUser);
      localStorage.setItem('adminSession', JSON.stringify(adminUser));
      return { error: null };
    }

    // All other users: normal Supabase sign-in
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      return { error };
    } catch (err) {
      return { error: { message: 'Authentication service error.' } };
    }
  };

  const signUp = async (email: string, password: string, fullName: string, role: 'player' | 'organizer' | 'admin', phone?: string) => {
    // Admin account cannot be registered via signup
    if (email === 'adminsabin@gmail.com') {
      return { error: { message: 'This email is reserved for admin.' } };
    }

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
      return { error: { message: 'Sign up failed.' } };
    }
  };

  const signOut = async () => {
    localStorage.removeItem('adminSession');
    if (user && !user.id.startsWith('admin-')) {
      try {
        await supabase.auth.signOut();
      } catch (error) {
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

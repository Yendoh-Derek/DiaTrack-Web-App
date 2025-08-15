
import React, { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from "@supabase/supabase-js";

interface Clinician {
  id: string;
  user_id: string;
  work_id: string;
  display_name: string;
  email: string;
  specialization?: string;
  license_number?: string;
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  currentUser: User | null;
  session: Session | null;
  loading: boolean;
  clinician: Clinician | null;
  signUp: (email: string, password: string, name: string, workId: string, specialization?: string, licenseNumber?: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithWorkId: (workId: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  getClinicianProfile: () => Promise<void>;
  checkEmailVerification: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [clinician, setClinician] = useState<Clinician | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session);
        setSession(session);
        setCurrentUser(session?.user ?? null);
        
        if (session?.user) {
          await getClinicianProfile();
        } else {
          setClinician(null);
        }
        setLoading(false);
      }
    );

    // Check for existing session
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        console.log('Existing session:', session);
        setSession(session);
        setCurrentUser(session?.user ?? null);
        
        if (session?.user) {
          await getClinicianProfile();
        }
      } catch (error) {
        console.error('Error checking session:', error);
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    // Set a timeout to prevent infinite loading - increased from 5s to 10s
    const timeout = setTimeout(() => {
      if (loading) {
        console.warn('Auth loading timeout, forcing loading to false');
        setLoading(false);
      }
    }, 10000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, [loading]); // Added loading dependency to prevent stale closure

  // Get clinician profile from database
  const getClinicianProfile = async () => {
    if (!currentUser) return;
    
    try {
      const { data, error } = await supabase
        .from('clinicians')
        .select('*')
        .eq('user_id', currentUser.id)
        .single();

      if (error) {
        console.error('Error fetching clinician profile:', error);
        // Try to create profile automatically if missing and user is authenticated
        await createClinicianIfMissing();
        return;
      }

      if (data) {
        console.log('Found clinician profile:', data);
        setClinician(data);
      } else {
        // If not found, attempt to create from metadata
        await createClinicianIfMissing();
      }
    } catch (error) {
      console.error('Error in getClinicianProfile:', error);
      setClinician(null);
    }
  };

  // Helper: Create clinician profile from authenticated user metadata if missing
  const createClinicianIfMissing = async () => {
    try {
      const { data: existing } = await supabase
        .from('clinicians')
        .select('id')
        .eq('user_id', currentUser!.id)
        .maybeSingle();

      if (existing) return; // Already exists

      const meta = currentUser!.user_metadata || {};
      const displayName = meta.display_name || currentUser!.email?.split('@')[0] || 'Clinician';
      const workId = meta.work_id || `WK-${currentUser!.id.slice(0, 6).toUpperCase()}`;
      const specialization = meta.specialization || null;
      const licenseNumber = meta.license_number || null;

      const { data: created, error: createError } = await supabase
        .from('clinicians')
        .insert({
          user_id: currentUser!.id,
          work_id: workId,
          display_name: displayName,
          email: currentUser!.email,
          specialization,
          license_number: licenseNumber
        })
        .select()
        .single();

      if (createError) {
        console.error('Auto-create clinician failed:', createError);
        return;
      }

      console.log('Auto-created clinician profile:', created);
      setClinician(created);
    } catch (err) {
      console.error('createClinicianIfMissing error:', err);
    }
  };

  // Sign up with email and password for clinicians
  const signUp = async (email: string, password: string, name: string, workId: string, specialization?: string, licenseNumber?: string) => {
    try {
      console.log('Starting signup process for:', email);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: name,
            work_id: workId,
            specialization,
            license_number: licenseNumber
          }
        }
      });

      if (error) {
        console.error('Supabase auth signup error:', error);
        throw error;
      }

      console.log('Auth signup successful:', data);

      // Only create clinician profile immediately if session exists (email confirmation not required)
      if (data.session && data.user) {
        try {
          console.log('Creating clinician profile for user:', data.user.id);
          const { data: clinicianData, error: clinicianError } = await supabase
            .from('clinicians')
            .insert({
              user_id: data.user.id,
              work_id: workId,
              display_name: name,
              email: email,
              specialization: specialization || null,
              license_number: licenseNumber || null
            })
            .select()
            .single();

          if (clinicianError) {
            console.error('Error creating clinician profile:', clinicianError);
          } else if (clinicianData) {
            console.log('Clinician profile created successfully:', clinicianData);
            setClinician(clinicianData);
          }
        } catch (error) {
          console.error('Error creating clinician profile:', error);
        }
      }

      // Check if email confirmation is required
      if (data.user && !data.session) {
        // Email confirmation required
        toast({
          title: "Account Created Successfully!",
          description: "Please check your email to verify your account before signing in.",
        });
      } else if (data.session) {
        // User is automatically signed in (email confirmation not required)
        toast({
          title: "Account Created Successfully!",
          description: "You are now signed in.",
        });
        navigate('/dashboard');
      }

      return Promise.resolve();
    } catch (error: any) {
      console.error('Signup error:', error);
      const errorMessage = error.message || 'Failed to create account';
      toast({
        title: "Sign Up Error",
        description: errorMessage,
        variant: "destructive"
      });
      return Promise.reject(error);
    }
  };

  // Sign in with email and password
  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "You are now logged in.",
      });

      navigate('/dashboard');
      return Promise.resolve();
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to sign in';
      toast({
        title: "Sign In Error",
        description: errorMessage,
        variant: "destructive"
      });
      return Promise.reject(error);
    }
  };

  // Sign in with work ID
  const signInWithWorkId = async (workId: string, password: string) => {
    try {
      // First, find the clinician by work ID
      const { data: clinicianData, error: clinicianError } = await supabase
        .from('clinicians')
        .select('*')
        .eq('work_id', workId)
        .single();

      if (clinicianError || !clinicianData) {
        // Clinician profile not found - this could happen if:
        // 1. User just signed up and profile creation failed
        // 2. Work ID is incorrect
        // 3. Database tables don't exist yet
        throw new Error('Work ID not found. If you just signed up, try using your email and password instead. Otherwise, please check your work ID.');
      }

      // Now sign in with email and password
      const { data, error } = await supabase.auth.signInWithPassword({
        email: clinicianData.email,
        password
      });

      if (error) {
        // Password is incorrect
        if (error.message.includes('Invalid login credentials')) {
          throw new Error('Password is incorrect. Please check your password.');
        }
        throw error;
      }

      toast({
        title: "Success",
        description: "You are now logged in.",
      });

      navigate('/dashboard');
      return Promise.resolve();
    } catch (error: any) {
      const errorMessage = error.message || 'Invalid work ID or password';
      toast({
        title: "Sign In Error",
        description: errorMessage,
        variant: "destructive"
      });
      return Promise.reject(error);
    }
  };

  // Sign in with Google
  const signInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`
        }
      });

      if (error) throw error;
      
      return Promise.resolve();
    } catch (error: any) {
      toast({
        title: "Google Sign In Error",
        description: error.message,
        variant: "destructive"
      });
      return Promise.reject(error);
    }
  };

  // Log out
  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setClinician(null);
      navigate('/login');
      return Promise.resolve();
    } catch (error: any) {
      toast({
        title: "Logout Error",
        description: error.message,
        variant: "destructive"
      });
      return Promise.reject(error);
    }
  };

  // Reset password
  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });

      if (error) throw error;
      
      toast({
        title: "Password Reset",
        description: "Check your email for password reset instructions.",
      });
      
      return Promise.resolve();
    } catch (error: any) {
      toast({
        title: "Password Reset Error",
        description: error.message,
        variant: "destructive"
      });
      return Promise.reject(error);
    }
  };

  // Check if email is verified
  const checkEmailVerification = async () => {
    if (!currentUser) return false;
    const { data, error } = await supabase.auth.getUser();
    if (error) {
      console.error('Error checking email verification:', error);
      return false;
    }
    return data.user?.email_confirmed_at !== null;
  };

  const value = {
    currentUser,
    session,
    loading,
    clinician,
    signUp,
    signIn,
    signInWithWorkId,
    signInWithGoogle,
    logout,
    resetPassword,
    getClinicianProfile,
    checkEmailVerification
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;

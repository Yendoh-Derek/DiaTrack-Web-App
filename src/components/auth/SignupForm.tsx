
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from 'react-router-dom';
import { useAuth } from "@/context/AuthContext";
import { UserPlus, Mail, Key, Lock, User, Badge, GraduationCap, FileText } from "lucide-react";

const SignupForm = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [workId, setWorkId] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [signupSuccess, setSignupSuccess] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { signUp, signInWithGoogle } = useAuth();

  // Reset form after successful signup
  const resetForm = () => {
    setName('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setWorkId('');
    setSpecialization('');
    setLicenseNumber('');
  };

  // Validation functions
  const isValidWorkId = (value: string) => {
    // Allow alphanumeric plus dashes/underscores, 3-16 chars
    return /^[A-Za-z0-9-_]{3,16}$/.test(value);
  };

  const isValidLicenseNumber = (value: string) => {
    // Optional: allow alphanumeric 6-20 chars
    return value === '' || /^[A-Za-z0-9-]{6,20}$/.test(value);
  };

  const handleWorkIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.trim();
    setWorkId(value);
  };

  const handleLicenseNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.trim();
    setLicenseNumber(value);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !email || !password || !confirmPassword || !workId) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    if (!isValidWorkId(workId)) {
      toast({
        title: "Error",
        description: "Work ID should be 3-16 characters (letters, numbers, '-', '_').",
        variant: "destructive"
      });
      return;
    }

    if (!isValidLicenseNumber(licenseNumber)) {
      toast({
        title: "Error",
        description: "License number should be 6-20 characters (letters, numbers, '-').",
        variant: "destructive"
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords don't match.",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Use real signup function from AuthContext
      await signUp(email, password, name, workId, specialization, licenseNumber);
      
      // Show success state
      setSignupSuccess(true);
      resetForm();
      
      // Don't navigate immediately - user needs to verify email first
      // The AuthContext will handle the session management
    } catch (error) {
      console.error('Signup error:', error);
      // Error toast is already handled by AuthContext
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    
    try {
      // Use real Google sign-in from AuthContext
      await signInWithGoogle();
      
      // The redirect will be handled by Supabase OAuth
      // No need to navigate manually
    } catch (error) {
      console.error('Google sign-in error:', error);
      // Error toast is already handled by AuthContext
    } finally {
      setIsLoading(false);
    }
  };
  
  // If signup was successful, show success message
  if (signupSuccess) {
    return (
      <div className="w-full text-center space-y-6">
        <div className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center">
          <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div>
          <h3 className="text-2xl font-bold text-white mb-2">Account Created Successfully!</h3>
          <p className="text-gray-300 mb-6">
            Please check your email to verify your account before signing in.
          </p>
          <Button 
            onClick={() => setSignupSuccess(false)}
            className="bg-diabetesSense-accent hover:bg-diabetesSense-accent/90 text-white"
          >
            Create Another Account
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSignup} className="w-full space-y-5">
      <div className="space-y-3">
        <div className="relative">
          <User className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="bg-secondary border-none h-12 pl-10 text-foreground placeholder:text-muted-foreground"
          />
        </div>
        <div className="relative">
          <Mail className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-secondary border-none h-12 pl-10 text-foreground placeholder:text-muted-foreground"
          />
        </div>
        <div className="relative">
          <Badge className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Work ID (e.g., DY001)"
            value={workId}
            onChange={handleWorkIdChange}
            className="bg-secondary border-none h-12 pl-10 text-foreground placeholder:text-muted-foreground"
          />
        </div>
        <div className="relative">
          <GraduationCap className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Specialization (e.g., Endocrinology, General Practice)"
            value={specialization}
            onChange={(e) => setSpecialization(e.target.value)}
            className="bg-secondary border-none h-12 pl-10 text-foreground placeholder:text-muted-foreground"
          />
        </div>
        <div className="relative">
          <FileText className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="License Number (optional)"
            value={licenseNumber}
            onChange={handleLicenseNumberChange}
            className="bg-secondary border-none h-12 pl-10 text-foreground placeholder:text-muted-foreground"
          />
        </div>
        <div className="relative">
          <Key className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="bg-secondary border-none h-12 pl-10 text-foreground placeholder:text-muted-foreground"
          />
        </div>
        <div className="relative">
          <Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
          <Input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="bg-secondary border-none h-12 pl-10 text-foreground placeholder:text-muted-foreground"
          />
        </div>
      </div>
      
      <Button 
        type="submit" 
        disabled={isLoading} 
        className="w-full bg-diabetesSense-accent hover:bg-diabetesSense-accent/90 text-white py-6 rounded-xl font-medium text-lg"
      >
        <UserPlus className="mr-2 h-5 w-5" />
        {isLoading ? "Creating Account..." : "Sign Up"}
      </Button>
      
      <div className="relative my-4">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-700"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="bg-diabetesSense-background px-2 text-gray-400">or continue with</span>
        </div>
      </div>

      <Button 
        type="button" 
        onClick={handleGoogleSignIn}
        disabled={isLoading} 
        variant="outline"
        className="w-full bg-white text-gray-800 py-6 rounded-xl font-medium text-lg border-none hover:bg-white"
      >
        <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          <path fill="none" d="M1 1h22v22H1z" />
        </svg>
        Sign up with Google
      </Button>
    </form>
  );
};

export default SignupForm;

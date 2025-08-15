
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { User, Key, LogIn, Mail, AlertCircle } from "lucide-react";

const LoginForm = () => {
  const [loginMethod, setLoginMethod] = useState<'email' | 'workId'>('email');
  const [email, setEmail] = useState('');
  const [workId, setWorkId] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { signIn, signInWithWorkId, signInWithGoogle } = useAuth();

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: "Error",
        description: "Please enter both email and password.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    try {
      await signIn(email, password);
      // Navigation is handled by AuthContext after successful login
    } catch (error) {
      console.error('Email login error:', error);
      toast({
        title: "Login Failed",
        description: "Please check your email and password. If you just signed up, make sure to verify your email first.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleWorkIdLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!workId || !password) {
      toast({
        title: "Error",
        description: "Please enter both work ID and password.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    try {
      await signInWithWorkId(workId, password);
      // Navigation is handled by AuthContext after successful login
    } catch (error) {
      console.error('Work ID login error:', error);
      toast({
        title: "Login Failed",
        description: "Work ID login failed. Try using your email and password instead, or contact support if the issue persists.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    
    try {
      await signInWithGoogle();
      // The redirect will be handled by Supabase OAuth
    } catch (error) {
      console.error('Google sign-in error:', error);
      // Error toast is already handled by AuthContext
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    if (loginMethod === 'email') {
      handleEmailLogin(e);
    } else {
      handleWorkIdLogin(e);
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Login Method Toggle */}
      <div className="flex space-x-2 p-1 bg-secondary rounded-lg">
        <Button
          type="button"
          variant={loginMethod === 'email' ? 'default' : 'ghost'}
          onClick={() => setLoginMethod('email')}
          className="flex-1"
        >
          <Mail className="w-4 h-4 mr-2" />
          Email Login
        </Button>
        <Button
          type="button"
          variant={loginMethod === 'workId' ? 'default' : 'ghost'}
          onClick={() => setLoginMethod('workId')}
          className="flex-1"
        >
          <User className="w-4 h-4 mr-2" />
          Work ID Login
        </Button>
      </div>

      {/* Help Text */}
      <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
        <div className="flex items-start space-x-2">
          <AlertCircle className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-800 dark:text-blue-200">
            <p className="font-medium">Just signed up?</p>
            <p>Use your <strong>email and password</strong> to login. Work ID login will be available after your profile is fully set up.</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {loginMethod === 'email' ? (
          <div className="relative">
            <Mail className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
            <Input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-secondary border-none h-12 pl-10 text-foreground placeholder:text-muted-foreground"
            />
          </div>
        ) : (
          <div className="relative">
            <User className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Work ID"
              value={workId}
              onChange={(e) => setWorkId(e.target.value)}
              className="bg-secondary border-none h-12 pl-10 text-foreground placeholder:text-muted-foreground"
            />
          </div>
        )}
        
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
        
        <Button 
          type="submit" 
          disabled={isLoading} 
          className="w-full bg-diabetesSense-accent hover:bg-diabetesSense-accent/90 text-white py-6 rounded-xl font-medium text-lg"
        >
          <LogIn className="mr-2 h-5 w-5" />
          {isLoading ? "Signing In..." : "Sign In"}
        </Button>
      </form>

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
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.08z" />
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          <path fill="none" d="M1 1h22v22H1z" />
        </svg>
        Sign in with Google
      </Button>
    </div>
  );
};

export default LoginForm;

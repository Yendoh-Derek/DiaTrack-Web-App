
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { useEffect } from "react";

import Index from "./pages/Index";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import PatientsPage from "./pages/PatientsPage";
import PatientHistoryPage from "./pages/PatientHistoryPage";
import NotFound from "./pages/NotFound";
import AssessmentPage from "./pages/AssessmentPage";
import ChatbotPage from "./pages/ChatbotPage";
import HistoryPage from "./pages/HistoryPage";
import SettingsPage from "./pages/SettingsPage";

const queryClient = new QueryClient();

const AppContent = () => {
  const { loading } = useAuth();

  useEffect(() => {
    console.log('AppContent rendered, loading:', loading);
  }, [loading]);

  if (loading) {
    return (
      <div className="min-h-screen bg-diabetesSense-background flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block relative">
            <div className="w-24 h-24 rounded-full bg-diabetesSense-background flex items-center justify-center mb-4 border-2 border-diabetesSense-accent/30">
              <span className="text-4xl font-bold text-diabetesSense-accent">DT</span>
              <div className="absolute -inset-1 rounded-full border border-diabetesSense-accent/20 animate-pulse"></div>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white">Loading DiaTrack...</h1>
          <p className="text-gray-400 mt-2">Please wait...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/login" element={<Login />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/patients" element={<PatientsPage />} />
      <Route path="/patient-history/:patientId" element={<PatientHistoryPage />} />
      <Route path="/assessment" element={<AssessmentPage />} />
      <Route path="/chatbot" element={<ChatbotPage />} />
      <Route path="/history" element={<HistoryPage />} />
      <Route path="/settings" element={<SettingsPage />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => {
  useEffect(() => {
    console.log('App component mounted');
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <TooltipProvider>
            <div className="min-h-screen bg-diabetesSense-background">
              <AppContent />
            </div>
            <Toaster />
            <Sonner />
          </TooltipProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;

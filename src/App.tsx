
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import { ThemeProvider } from "@/context/ThemeContext";

import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import PatientsPage from "./pages/PatientsPage";
import PatientHistoryPage from "./pages/PatientHistoryPage";
import NotFound from "./pages/NotFound";
import AssessmentPage from "./pages/AssessmentPage";
import ChatbotPage from "./pages/ChatbotPage";
import HistoryPage from "./pages/HistoryPage";
import SettingsPage from "./pages/SettingsPage";
import { preloadModel } from "@/services/ml/onnxModel";
import { ensureSeeded } from "@/stores/demoStore";

const App = () => {
  useEffect(() => {
    ensureSeeded();
    preloadModel();
  }, []);

  return (
    <ThemeProvider>
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <TooltipProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/patients" element={<PatientsPage />} />
            <Route path="/patient-history/:patientId" element={<PatientHistoryPage />} />
            <Route path="/assessment" element={<AssessmentPage />} />
            <Route path="/chatbot" element={<ChatbotPage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Toaster />
        </TooltipProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
};

export default App;

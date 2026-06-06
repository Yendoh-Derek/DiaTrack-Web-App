import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import { ThemeProvider } from "@/context/ThemeContext.tsx";

import Index from "./pages/Index.tsx";
import Dashboard from "./pages/Dashboard.tsx";
import PatientsPage from "./pages/PatientsPage.tsx";
import PatientHistoryPage from "./pages/PatientHistoryPage.tsx";
import NotFound from "./pages/NotFound.tsx";
import AssessmentPage from "./pages/AssessmentPage.tsx";
import ChatbotPage from "./pages/ChatbotPage.tsx";
import HistoryPage from "./pages/HistoryPage.tsx";
import SettingsPage from "./pages/SettingsPage.tsx";
import { preloadModel } from "@/services/ml/onnxModel.ts";
import { ensureSeeded } from "@/stores/demoStore.ts";

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
            <Route
              path="/patient-history/:patientId"
              element={<PatientHistoryPage />}
            />
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

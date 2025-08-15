
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import MainNav from '@/components/navigation/MainNav';
import ProfileSettings from '@/components/settings/ProfileSettings';
import { Separator } from "@/components/ui/separator";

const SettingsPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-diabetesSense-background flex flex-col">
      <MainNav />
      
      <div className="flex-1 p-4 md:p-6">
        <header className="mb-6">
          <h1 className="text-2xl font-bold text-white">Settings</h1>
          <p className="text-gray-400">Manage your account and preferences</p>
        </header>
        
        <Card className="card-gradient border border-white/10 mb-6">
          <CardHeader>
            <CardTitle>Account Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <ProfileSettings />
          </CardContent>
        </Card>
        
        <Card className="card-gradient border border-white/10 mb-6">
          <CardHeader>
            <CardTitle>Diabetes Sense App</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-white mb-2">About</h3>
              <p className="text-gray-300">Diabetes Sense helps you monitor and understand your risk for Type 2 Diabetes through personalized assessments and recommendations.</p>
            </div>
            
            <Separator className="bg-white/10" />
            
            <div>
              <h3 className="text-lg font-medium text-white mb-2">Privacy Policy</h3>
              <p className="text-gray-300 mb-4">Your health data is stored locally on your device. We do not share your personal information with third parties.</p>
              <a href="#" className="text-diabetesSense-accent hover:underline">Read full privacy policy</a>
            </div>
            
            <Separator className="bg-white/10" />
            
            <div>
              <h3 className="text-lg font-medium text-white mb-2">Terms of Service</h3>
              <p className="text-gray-300 mb-4">By using this application, you agree to our terms of service.</p>
              <a href="#" className="text-diabetesSense-accent hover:underline">Read terms of service</a>
            </div>
            
            <Separator className="bg-white/10" />
            
            <div>
              <h3 className="text-lg font-medium text-white mb-2">App Version</h3>
              <p className="text-gray-300">Version 1.0.0</p>
            </div>
          </CardContent>
        </Card>
        
        <div className="text-center text-sm text-gray-500 mt-8">
          <p>© {new Date().getFullYear()} Diabetes Sense. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;

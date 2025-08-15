
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

interface UserProfile {
  name: string;
  email: string;
  workId: string;
  specialization: string;
  licenseNumber: string;
}

const ProfileSettings = () => {
  const { clinician, currentUser, logout } = useAuth();
  const [profileForm, setProfileForm] = useState<UserProfile>({
    name: '',
    email: '',
    workId: '',
    specialization: '',
    licenseNumber: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (clinician && currentUser) {
      setProfileForm({
        name: clinician.display_name || '',
        email: clinician.email || currentUser.email || '',
        workId: clinician.work_id || '',
        specialization: clinician.specialization || '',
        licenseNumber: clinician.license_number || ''
      });
    }
  }, [clinician, currentUser]);

  const handleChange = (field: keyof UserProfile, value: string) => {
    setProfileForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    if (!profileForm.name || !profileForm.email) {
      toast({
        title: "Error",
        description: "Name and email are required.",
        variant: "destructive"
      });
      return;
    }

    try {
      // TODO: Implement real profile update API call
      toast({
        title: "Success",
        description: "Profile updated successfully."
      });
      setIsEditing(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to update profile.",
        variant: "destructive"
      });
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            value={profileForm.name}
            onChange={(e) => handleChange('name', e.target.value)}
            disabled={!isEditing}
            className={!isEditing ? "bg-secondary border-none opacity-70" : "bg-secondary border-none"}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={profileForm.email}
            onChange={(e) => handleChange('email', e.target.value)}
            disabled={!isEditing}
            className={!isEditing ? "bg-secondary border-none opacity-70" : "bg-secondary border-none"}
          />
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-3">
        {isEditing ? (
          <>
            <Button onClick={handleSave} className="flex-1 bg-diabetesSense-accent hover:bg-diabetesSense-accent/90">
              Save Changes
            </Button>
            <Button 
              onClick={() => setIsEditing(false)} 
              variant="outline" 
              className="flex-1 border-gray-600 bg-transparent text-gray-300 hover:bg-gray-800"
            >
              Cancel
            </Button>
          </>
        ) : (
          <Button onClick={() => setIsEditing(true)} className="flex-1 bg-diabetesSense-accent hover:bg-diabetesSense-accent/90">
            Edit Profile
          </Button>
        )}
      </div>
      
      <div className="pt-4 border-t border-gray-800">
        <Button onClick={handleLogout} variant="destructive" className="w-full">
          Log Out
        </Button>
      </div>
    </div>
  );
};

export default ProfileSettings;

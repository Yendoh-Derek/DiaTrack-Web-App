
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";

interface AssessmentData {
  age: number | string;
  gender: number | string;
  bmi: number | string;
  hypertension: number;
  heart_disease: number;
  smoking_history: string;
  HbA1c_level: number | string;
  blood_glucose_level: number | string;
}

interface AssessmentFormProps {
  onSubmit: (score: number) => void;
}

const AssessmentForm = ({ onSubmit }: AssessmentFormProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<AssessmentData>({
    age: '',
    gender: '',
    bmi: '',
    hypertension: 0,
    heart_disease: 0,
    smoking_history: '',
    HbA1c_level: '',
    blood_glucose_level: '',
  });

  const handleChange = (field: keyof AssessmentData, value: string | number | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: field === 'hypertension' || field === 'heart_disease' ? (value ? 1 : 0) : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simple validation
    const requiredFields = ['age', 'gender', 'bmi', 'smoking_history', 'HbA1c_level', 'blood_glucose_level'];
    const missingFields = requiredFields.filter(field => !formData[field as keyof AssessmentData]);
    
    if (missingFields.length > 0) {
      toast({
        title: "Missing information",
        description: `Please complete all required fields.`,
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Simulated API request
      setTimeout(() => {
        // Generate a random score for demo purposes
        // In a real app, this would be the response from your API
        const mockScore = Math.random();
        onSubmit(mockScore);
        setIsLoading(false);
        
        toast({
          title: "Assessment completed",
          description: "Your risk assessment has been calculated.",
        });
      }, 1500);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process assessment. Please try again.",
        variant: "destructive"
      });
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="space-y-2">
          <Label htmlFor="age">Age</Label>
          <Input
            id="age"
            type="number"
            placeholder="Enter your age"
            value={formData.age}
            onChange={(e) => handleChange('age', e.target.value ? Number(e.target.value) : '')}
            className="bg-secondary border-none"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="gender">Gender</Label>
          <Select 
            value={formData.gender.toString()} 
            onValueChange={(value) => handleChange('gender', Number(value))}
          >
            <SelectTrigger id="gender" className="bg-secondary border-none">
              <SelectValue placeholder="Select gender" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">Female</SelectItem>
              <SelectItem value="1">Male</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="bmi">BMI</Label>
          <Input
            id="bmi"
            type="number"
            step="0.1"
            placeholder="Enter your BMI"
            value={formData.bmi}
            onChange={(e) => handleChange('bmi', e.target.value ? Number(e.target.value) : '')}
            className="bg-secondary border-none"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="smoking">Smoking History</Label>
          <Select 
            value={formData.smoking_history} 
            onValueChange={(value) => handleChange('smoking_history', value)}
          >
            <SelectTrigger id="smoking" className="bg-secondary border-none">
              <SelectValue placeholder="Select smoking history" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="never">Never</SelectItem>
              <SelectItem value="current">Current</SelectItem>
              <SelectItem value="former">Former</SelectItem>
              <SelectItem value="ever">Ever</SelectItem>
              <SelectItem value="not current">Not Current</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="hba1c">HbA1c Level</Label>
          <Input
            id="hba1c"
            type="number"
            step="0.1"
            placeholder="Enter HbA1c level"
            value={formData.HbA1c_level}
            onChange={(e) => handleChange('HbA1c_level', e.target.value ? Number(e.target.value) : '')}
            className="bg-secondary border-none"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="glucose">Blood Glucose Level</Label>
          <Input
            id="glucose"
            type="number"
            placeholder="Enter blood glucose level"
            value={formData.blood_glucose_level}
            onChange={(e) => handleChange('blood_glucose_level', e.target.value ? Number(e.target.value) : '')}
            className="bg-secondary border-none"
          />
        </div>
        
        <div className="flex items-center justify-between space-x-2">
          <Label htmlFor="hypertension">Hypertension</Label>
          <Switch
            id="hypertension"
            checked={formData.hypertension === 1}
            onCheckedChange={(checked) => handleChange('hypertension', checked)}
          />
        </div>
        
        <div className="flex items-center justify-between space-x-2">
          <Label htmlFor="heart-disease">Heart Disease</Label>
          <Switch
            id="heart-disease"
            checked={formData.heart_disease === 1}
            onCheckedChange={(checked) => handleChange('heart_disease', checked)}
          />
        </div>
      </div>
      
      <Button 
        type="submit" 
        disabled={isLoading} 
        className="w-full bg-diabetesSense-accent hover:bg-diabetesSense-accent/90 text-white py-6 rounded-xl font-medium"
      >
        {isLoading ? "Processing..." : "Submit Assessment"}
      </Button>
    </form>
  );
};

export default AssessmentForm;

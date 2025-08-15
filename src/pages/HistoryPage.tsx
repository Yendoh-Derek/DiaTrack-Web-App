
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import MainNav from '@/components/navigation/MainNav';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';

interface Assessment {
  id: string;
  date: string;
  score: number;
  bmi?: number;
  bmiCategory?: string;
  glucose?: string;
  hba1c?: string;
  recommendations?: string[];
}

const HistoryPage = () => {
  const navigate = useNavigate();
  const [assessmentHistory, setAssessmentHistory] = useState<Assessment[]>([]);
  const [selectedAssessment, setSelectedAssessment] = useState<Assessment | null>(null);
  
  useEffect(() => {
    // For demo purposes, we'll create some mock history data
    const mockHistory: Assessment[] = [];
    
    // Get last assessment from local storage
    const lastAssessment = localStorage.getItem('lastAssessment');
    if (lastAssessment) {
      const assessment = JSON.parse(lastAssessment);
      
      // Add the actual last assessment
      mockHistory.push({
        id: 'current',
        date: assessment.date,
        score: assessment.score,
        bmi: assessment.bmi,
        bmiCategory: assessment.bmiCategory,
        glucose: assessment.glucose,
        hba1c: assessment.hba1c,
        recommendations: [
          "Maintain a balanced diet rich in fiber",
          "Exercise for at least 30 minutes daily",
          "Monitor your blood glucose weekly"
        ]
      });
      
      // Generate some historical data
      const today = new Date();
      for (let i = 1; i <= 5; i++) {
        const pastDate = new Date(today);
        pastDate.setMonth(today.getMonth() - i);
        
        const historicalScore = Math.max(0.1, assessment.score + (Math.random() * 0.2 - 0.1));
        const recommendations = [];
        
        // Generate different recommendations based on the historical score
        if (historicalScore < 0.3) {
          recommendations.push(
            "Continue maintaining healthy eating habits",
            "Stay physically active",
            "Have annual check-ups"
          );
        } else if (historicalScore < 0.6) {
          recommendations.push(
            "Increase physical activity to 45 minutes daily",
            "Reduce refined carbohydrate intake",
            "Monitor blood pressure monthly"
          );
        } else {
          recommendations.push(
            "Consult with healthcare provider",
            "Monitor blood glucose twice weekly",
            "Follow a strict low-glycemic diet"
          );
        }
        
        mockHistory.push({
          id: `past-${i}`,
          date: pastDate.toLocaleDateString(),
          score: historicalScore,
          bmi: assessment.bmi ? Math.max(18, assessment.bmi + (Math.random() * 2 - 1)) : undefined,
          glucose: assessment.glucose ? String(parseInt(assessment.glucose) + Math.floor(Math.random() * 20 - 10)) : undefined,
          hba1c: assessment.hba1c ? String((parseFloat(assessment.hba1c) + (Math.random() * 0.4 - 0.2)).toFixed(1)) : undefined,
          recommendations
        });
      }
      
      // Sort by date (newest first)
      mockHistory.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }
    
    setAssessmentHistory(mockHistory);
  }, []);
  
  const formatData = (data: Assessment[]) => {
    return [...data].reverse().map(item => ({
      name: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      score: parseFloat((item.score * 100).toFixed(1)),
      bmi: item.bmi,
      glucose: item.glucose ? parseInt(item.glucose) : undefined,
      hba1c: item.hba1c ? parseFloat(item.hba1c) : undefined
    }));
  };

  const getScoreColor = (score: number): string => {
    if (score < 30) return "#27AE60";  // low risk (green)
    if (score < 60) return "#F2C94C";  // moderate risk (yellow)
    return "#EB5757";  // high risk (red)
  };

  const handleRowClick = (assessment: Assessment) => {
    setSelectedAssessment(assessment);
  };

  return (
    <div className="min-h-screen bg-diabetesSense-background flex flex-col">
      <MainNav />
      
      <div className="flex-1 p-4 md:p-6 overflow-y-auto">
        <header className="mb-6">
          <h1 className="text-2xl font-bold text-white">History</h1>
          <p className="text-gray-400">Track your progress over time</p>
        </header>
        
        {assessmentHistory.length > 0 ? (
          <>
            <Card className="card-gradient border border-white/10 mb-6 animate-fade-in">
              <CardHeader>
                <CardTitle>Risk Score History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={formatData(assessmentHistory)}
                      margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                      <XAxis dataKey="name" stroke="#8E9196" />
                      <YAxis stroke="#8E9196" domain={[0, 100]} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'rgba(11, 29, 52, 0.9)', 
                          border: '1px solid rgba(255,255,255,0.2)',
                          borderRadius: '8px',
                          color: '#fff'
                        }} 
                        formatter={(value: number) => [`${value}`, 'Risk Score']}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="score" 
                        stroke="#2F80ED" 
                        strokeWidth={3} 
                        dot={{ 
                          stroke: "#2F80ED", 
                          strokeWidth: 2, 
                          r: 4, 
                          fill: 'rgba(11, 29, 52, 1)' 
                        }} 
                        activeDot={{ r: 6 }} 
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <Card className="card-gradient border border-white/10 animate-fade-in" style={{ animationDelay: '0.1s' }}>
                <CardHeader>
                  <CardTitle>Glucose Levels</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-48 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={formatData(assessmentHistory)}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                        <XAxis dataKey="name" stroke="#8E9196" />
                        <YAxis stroke="#8E9196" />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'rgba(11, 29, 52, 0.9)', 
                            border: '1px solid rgba(255,255,255,0.2)',
                            borderRadius: '8px',
                            color: '#fff'
                          }}
                          formatter={(value: number) => [`${value} mg/dL`, 'Glucose']} 
                        />
                        <Bar dataKey="glucose" fill="#F2C94C" barSize={20} radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="card-gradient border border-white/10 animate-fade-in" style={{ animationDelay: '0.2s' }}>
                <CardHeader>
                  <CardTitle>HbA1c Levels</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-48 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={formatData(assessmentHistory)}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                        <XAxis dataKey="name" stroke="#8E9196" />
                        <YAxis stroke="#8E9196" domain={['dataMin - 0.5', 'dataMax + 0.5']} />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'rgba(11, 29, 52, 0.9)', 
                            border: '1px solid rgba(255,255,255,0.2)',
                            borderRadius: '8px',
                            color: '#fff'
                          }}
                          formatter={(value: number) => [`${value}%`, 'HbA1c']} 
                        />
                        <Line type="monotone" dataKey="hba1c" stroke="#EB5757" strokeWidth={2} dot={{ fill: '#0B1D34', stroke: '#EB5757', strokeWidth: 2, r: 4 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <Card className="card-gradient border border-white/10 animate-fade-in" style={{ animationDelay: '0.3s' }}>
              <CardHeader>
                <CardTitle>Assessment History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="text-left py-3 px-4">Date</th>
                        <th className="text-left py-3 px-4">Risk Score</th>
                        <th className="text-left py-3 px-4">BMI</th>
                        <th className="text-left py-3 px-4">Glucose</th>
                        <th className="text-left py-3 px-4">HbA1c</th>
                      </tr>
                    </thead>
                    <tbody>
                      {assessmentHistory.map((assessment, index) => (
                        <tr 
                          key={assessment.id} 
                          className="border-b border-white/5 cursor-pointer hover:bg-white/5 transition-colors"
                          onClick={() => handleRowClick(assessment)}
                        >
                          <td className="py-3 px-4">{assessment.date}</td>
                          <td className="py-3 px-4">
                            <div className="flex items-center">
                              <div 
                                className="w-3 h-3 rounded-full mr-2" 
                                style={{ backgroundColor: getScoreColor(assessment.score * 100) }}
                              ></div>
                              {(assessment.score * 100).toFixed(1)}
                            </div>
                          </td>
                          <td className="py-3 px-4">{assessment.bmi?.toFixed(1) || 'N/A'}</td>
                          <td className="py-3 px-4">{assessment.glucose || 'N/A'} mg/dL</td>
                          <td className="py-3 px-4">{assessment.hba1c || 'N/A'}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {selectedAssessment && (
              <Card className="card-gradient border border-white/10 mt-6 animate-fade-in">
                <CardHeader>
                  <CardTitle className="flex justify-between items-center">
                    <span>Assessment Details - {selectedAssessment.date}</span>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setSelectedAssessment(null)}
                      className="text-gray-400 hover:text-white hover:bg-transparent"
                    >
                      ×
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-center mb-6">
                      <div 
                        className="inline-flex items-center justify-center rounded-full w-20 h-20 text-3xl font-bold" 
                        style={{ 
                          backgroundColor: getScoreColor(selectedAssessment.score * 100),
                          color: selectedAssessment.score * 100 < 60 ? '#000' : '#fff'
                        }}
                      >
                        {Math.round(selectedAssessment.score * 100)}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <div className="bg-white/5 p-4 rounded-lg">
                        <div className="text-sm text-gray-400">BMI</div>
                        <div className="text-xl font-bold text-white">
                          {selectedAssessment.bmi?.toFixed(1) || 'N/A'}
                        </div>
                        <div className="text-xs text-gray-500">
                          {selectedAssessment.bmiCategory || 'Not specified'}
                        </div>
                      </div>
                      <div className="bg-white/5 p-4 rounded-lg">
                        <div className="text-sm text-gray-400">Glucose</div>
                        <div className="text-xl font-bold text-white">
                          {selectedAssessment.glucose || 'N/A'} <span className="text-sm">mg/dL</span>
                        </div>
                        <div className="text-xs text-gray-500">
                          {parseInt(selectedAssessment.glucose || '0') > 125 ? 'Elevated' : 'Normal'}
                        </div>
                      </div>
                      <div className="bg-white/5 p-4 rounded-lg">
                        <div className="text-sm text-gray-400">HbA1c</div>
                        <div className="text-xl font-bold text-white">
                          {selectedAssessment.hba1c || 'N/A'}<span className="text-sm">%</span>
                        </div>
                        <div className="text-xs text-gray-500">
                          {parseFloat(selectedAssessment.hba1c || '0') > 5.7 ? 'Pre-diabetic range' : 'Normal range'}
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium mb-2 text-white">Recommendations</h3>
                      <ul className="space-y-2">
                        {selectedAssessment.recommendations?.map((recommendation, idx) => (
                          <li key={idx} className="bg-white/5 p-3 rounded flex items-start">
                            <span className="text-diabetesSense-accent mr-2">•</span>
                            <span className="text-gray-300">{recommendation}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        ) : (
          <Card className="card-gradient border border-white/10">
            <CardContent className="p-8 text-center">
              <p className="text-gray-300 mb-4">No assessment history found.</p>
              <Button 
                onClick={() => navigate('/assessment')} 
                className="bg-diabetesSense-accent hover:bg-diabetesSense-accent/90"
              >
                Take Risk Assessment
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default HistoryPage;

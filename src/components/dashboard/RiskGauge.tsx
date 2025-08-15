
import { useEffect, useState } from 'react';

interface RiskGaugeProps {
  score: number;
  size?: number;
}

const RiskGauge = ({ score, size = 200 }: RiskGaugeProps) => {
  const [animatedScore, setAnimatedScore] = useState(0);
  const percentage = score * 100;
  const radius = (size - 20) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (animatedScore / 100) * circumference;
  
  const getRiskLevel = (score: number) => {
    if (score < 0.3) return { level: 'Low', color: 'circle-low' };
    if (score < 0.7) return { level: 'Moderate', color: 'circle-moderate' };
    return { level: 'High', color: 'circle-high' };
  };
  
  const { level, color } = getRiskLevel(score);
  
  useEffect(() => {
    // Animate the score from 0 to the actual value
    const timer = setTimeout(() => {
      setAnimatedScore(score * 100);
    }, 100);
    
    return () => clearTimeout(timer);
  }, [score]);
  
  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <circle
            className="circle-bg"
            cx={size/2}
            cy={size/2}
            r={radius}
          />
          <circle
            className={`circle ${color}`}
            cx={size/2}
            cy={size/2}
            r={radius}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-bold text-white">{Math.round(animatedScore)}</span>
          <span className="text-lg text-gray-300">Risk Score</span>
        </div>
      </div>
      <div 
        className={`mt-2 px-4 py-1 rounded-full text-white text-sm font-medium
          ${level === 'Low' ? 'bg-diabetesSense-low' : 
            level === 'Moderate' ? 'bg-diabetesSense-moderate' : 'bg-diabetesSense-high'}`}
      >
        {level} Risk
      </div>
    </div>
  );
};

export default RiskGauge;

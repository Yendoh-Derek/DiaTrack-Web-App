
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InfoIcon } from 'lucide-react';

interface FeatureContribution {
  name: string;
  contribution: number;
  description: string;
  color: string;
}

interface ModelInterpretabilityProps {
  features: FeatureContribution[];
}

const ModelInterpretability: React.FC<ModelInterpretabilityProps> = ({ features }) => {
  // Sort features by contribution (highest first)
  const sortedFeatures = [...features].sort((a, b) => Math.abs(b.contribution) - Math.abs(a.contribution));
  
  // Calculate the sum of absolute values for normalization
  const totalContribution = sortedFeatures.reduce((sum, feature) => sum + Math.abs(feature.contribution), 0);
  
  return (
    <Card className="card-gradient border border-white/10">
      <CardHeader className="flex flex-row items-center space-x-4 pb-2">
        <InfoIcon className="h-6 w-6 text-diabetesSense-accent" />
        <div>
          <CardTitle className="text-xl">Risk Factor Analysis</CardTitle>
          <p className="text-sm text-gray-400">Understanding what contributes to your risk</p>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-gray-300 text-sm mb-4">
          This analysis shows how different factors contribute to your diabetes risk score. 
          Longer bars indicate a stronger influence on your risk assessment.
        </p>
        
        <div className="space-y-4">
          {sortedFeatures.map((feature, index) => {
            // Normalize the contribution to a percentage (0-100)
            const contributionPercent = (Math.abs(feature.contribution) / totalContribution) * 100;
            
            // Determine if this is increasing or decreasing risk
            const isIncreasing = feature.contribution > 0;
            
            return (
              <div key={index} className="space-y-1">
                <div className="flex justify-between items-center text-sm">
                  <span className="font-medium text-white">{feature.name}</span>
                  <span className={`font-medium ${isIncreasing ? 'text-diabetesSense-high' : 'text-diabetesSense-low'}`}>
                    {isIncreasing ? '+' : '-'}{Math.abs(feature.contribution).toFixed(1)}%
                  </span>
                </div>
                
                <div className="h-2 w-full bg-secondary/50 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${feature.color}`} 
                    style={{ width: `${contributionPercent}%` }}
                  ></div>
                </div>
                
                <p className="text-xs text-gray-400 mt-1">{feature.description}</p>
              </div>
            );
          })}
        </div>
        
        <div className="text-xs text-center mt-6 text-gray-400">
          <p>This analysis is based on your latest assessment data and the diabetes risk prediction model.</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ModelInterpretability;

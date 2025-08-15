import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Activity, BarChart3, AlertCircle, CheckCircle, Info } from "lucide-react";
import { RiskPredictionResult } from '@/services/riskPredictionService';

interface RiskAssessmentResultsProps {
  result: RiskPredictionResult;
  onClose: () => void;
  onSaveToHistory?: () => void;
}

const RiskAssessmentResults: React.FC<RiskAssessmentResultsProps> = ({ 
  result, 
  onClose, 
  onSaveToHistory 
}) => {
  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'Critical':
        return 'bg-red-600 hover:bg-red-700';
      case 'High':
        return 'bg-orange-600 hover:bg-orange-700';
      case 'Moderate':
        return 'bg-yellow-600 hover:bg-yellow-700';
      case 'Low':
        return 'bg-green-600 hover:bg-green-700';
      default:
        return 'bg-gray-600 hover:bg-gray-700';
    }
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 0.8) return 'text-green-400';
    if (score >= 0.6) return 'text-yellow-400';
    return 'text-red-400';
  };

  const formatPercentage = (value: number) => {
    return (value * 100).toFixed(1);
  };

  const getFeatureIcon = (contribution: number) => {
    if (contribution > 0.3) return <AlertTriangle className="w-4 h-4 text-red-400" />;
    if (contribution > 0.15) return <Activity className="w-4 h-4 text-orange-400" />;
    if (contribution > 0.05) return <BarChart3 className="w-4 h-4 text-yellow-400" />;
    return <CheckCircle className="w-4 h-4 text-green-400" />;
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-diabetesSense-background rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <Card className="border border-white/10 bg-gradient-to-br from-diabetesSense-background to-diabetesSense-background/80">
          <CardHeader className="border-b border-white/10">
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl font-bold text-white flex items-center">
                <Activity className="h-6 w-6 mr-3 text-diabetesSense-accent" />
                Diabetes Risk Assessment Results
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-white hover:bg-white/10"
              >
                ✕
              </Button>
            </div>
          </CardHeader>

          <CardContent className="p-6 space-y-6">
            {/* Summary Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Prediction Result */}
              <Card className="bg-secondary/30 border border-white/10">
                <CardContent className="p-4 text-center">
                  <div className="text-sm text-gray-400 mb-2">Prediction Result</div>
                  <Badge 
                    className={`text-lg px-4 py-2 ${
                      result.prediction_result === 'Positive' 
                        ? 'bg-red-600 hover:bg-red-700' 
                        : 'bg-green-600 hover:bg-green-700'
                    }`}
                  >
                    {result.prediction_result}
                  </Badge>
                </CardContent>
              </Card>

              {/* Risk Level */}
              <Card className="bg-secondary/30 border border-white/10">
                <CardContent className="p-4 text-center">
                  <div className="text-sm text-gray-400 mb-2">Risk Level</div>
                  <Badge className={`text-lg px-4 py-2 ${getRiskLevelColor(result.risk_level)}`}>
                    {result.risk_level}
                  </Badge>
                </CardContent>
              </Card>

              {/* Confidence Score */}
              <Card className="bg-secondary/30 border border-white/10">
                <CardContent className="p-4 text-center">
                  <div className="text-sm text-gray-400 mb-1 tracking-wide">Confidence Score</div>
                  <div className={`text-2xl md:text-3xl font-extrabold ${getConfidenceColor(result.confidence_score)}`}>
                    {formatPercentage(result.confidence_score)}%
                  </div>
                  <div className="text-[11px] text-gray-400 mt-1 uppercase tracking-wider">
                    Interval: {formatPercentage(result.confidence_interval.lower)}% - {formatPercentage(result.confidence_interval.upper)}%
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Flagged Conditions */}
            {result.flagged_conditions.length > 0 && (
              <Card className="bg-red-500/10 border border-red-500/30">
                <CardHeader>
                  <CardTitle className="text-red-400 flex items-center">
                    <AlertTriangle className="h-5 w-5 mr-2" />
                    Flagged Conditions Requiring Attention
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {result.flagged_conditions.map((condition, index) => (
                      <div key={index} className="flex items-start space-x-2 p-3 bg-red-500/20 rounded-lg">
                        <AlertCircle className="h-4 w-4 text-red-400 mt-0.5 flex-shrink-0" />
                        <span className="text-red-200 text-sm">{condition}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Feature Contributions (SHAP Values) */}
            <Card className="bg-secondary/30 border border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2 text-diabetesSense-accent" />
                  Feature Contributions to Risk Assessment
                </CardTitle>
                <p className="text-sm text-gray-400">
                  Ranked by their contribution to the overall risk prediction
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {result.feature_contributions.map((feature, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
                      <div className="flex items-center space-x-3 flex-1">
                        <div className="flex items-center space-x-2">
                          {getFeatureIcon(feature.contribution)}
                          <span className="text-white font-medium">{feature.name}</span>
                          {feature.risk_factor && (
                            <Badge variant="outline" className="text-xs border-red-400 text-red-400">
                              Risk Factor
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <div className="text-white font-semibold">
                            {formatPercentage(feature.contribution)}%
                          </div>
                          <div className="text-xs text-gray-400">Contribution</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* SHAP Values Visualization */}
                <div className="mt-6 p-4 bg-white/5 rounded-lg">
                  <h4 className="text-white font-semibold mb-3">SHAP Values Breakdown</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {Object.entries(result.shap_values).map(([key, value]) => (
                      <div key={key} className="text-center">
                        <div className="text-xs text-gray-400 uppercase tracking-wider">
                          {key.replace(/_/g, ' ')}
                        </div>
                        <div className="text-lg font-bold text-white">
                          {formatPercentage(value)}%
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recommendations */}
            <Card className="bg-secondary/30 border border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Info className="h-5 w-5 mr-2 text-diabetesSense-accent" />
                  Personalized Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="p-4 md:p-5 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                  <p className="text-blue-200 text-sm leading-relaxed">
                    {result.recommendations}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button
                onClick={onClose}
                className="flex-1 bg-diabetesSense-accent hover:bg-diabetesSense-accent/90 text-white"
              >
                Close Results
              </Button>
              {onSaveToHistory && (
                <Button
                  onClick={onSaveToHistory}
                  variant="outline"
                  className="flex-1 border-white/20 text-white hover:bg-white/10"
                >
                  Save to History
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RiskAssessmentResults;

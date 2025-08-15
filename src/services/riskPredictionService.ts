import { supabase } from '@/integrations/supabase/client';

// Types for the enhanced risk prediction system
export interface RiskPredictionInput {
  patient_id: string;
  age: number;
  gender: number; // 0 for female, 1 for male
  bmi: number;
  hypertension: number; // 0 or 1
  heart_disease: number; // 0 or 1
  smoking_history: string;
  HbA1c_level: number;
  blood_glucose_level: number;
}

export interface RiskPredictionResult {
  prediction_result: 'Positive' | 'Negative';
  confidence_score: number;
  risk_level: 'Low' | 'Moderate' | 'High' | 'Critical';
  probability: number;
  recommendations: string;
  shap_values: {
    bmi: number;
    hbA1c_level: number;
    blood_glucose_level: number;
    age: number;
    hypertension: number;
    heart_disease: number;
    smoking_history: number;
    gender: number;
  };
  feature_contributions: Array<{
    name: string;
    contribution: number;
    description: string;
    risk_factor: boolean;
  }>;
  flagged_conditions: string[];
  confidence_interval: {
    lower: number;
    upper: number;
  };
}

export interface PredictionLog {
  prediction_id: string;
  prediction_time: string;
  prediction: number;
  probability: number;
  feature_input: any;
  recommendations: string;
  shap_values: any;
  confidence_interval: any;
  user_id: string;
  patient_id: string;
}

class RiskPredictionService {
  // Risk thresholds based on medical guidelines
  private readonly RISK_THRESHOLDS = {
    HbA1c: {
      normal: 5.7,
      prediabetes: 6.5, // threshold for increased risk decisions
      diabetes: 6.5,
      highRisk: 6.9 // additional high-risk threshold requested
    },
    bloodGlucose: {
      normal: 100,
      prediabetes: 126,
      diabetes: 200,
      moderateRisk: 120 // additional threshold requested when combined with HbA1c > 6.9
    },
    bmi: {
      normal: 25,
      overweight: 30,
      obese: 35
    },
    age: {
      increased_risk: 45
    }
  };

  /**
   * Calculate comprehensive diabetes risk assessment
   */
  async calculateRisk(input: RiskPredictionInput): Promise<RiskPredictionResult> {
    try {
      // Calculate base risk score using enhanced algorithm
      const baseScore = this.calculateBaseRiskScore(input);
      
      // Apply risk modifiers based on specific conditions
      const modifiedScore = this.applyRiskModifiers(baseScore, input);
      
      // Calculate confidence score based on data quality and consistency
      const confidenceScore = this.calculateConfidenceScore(input);
      
      // Determine risk level
      const riskLevel = this.determineRiskLevel(modifiedScore);
      
      // Calculate SHAP values for feature importance
      const shapValues = this.calculateSHAPValues(input);
      
      // Generate feature contributions ranking
      const featureContributions = this.generateFeatureContributions(shapValues, input);
      
      // Check for flagged conditions
      const flaggedConditions = this.checkFlaggedConditions(input);
      
      // Generate personalized recommendations
      const recommendations = this.generateRecommendations(input, riskLevel, flaggedConditions);
      
      // Calculate confidence interval
      const confidenceInterval = this.calculateConfidenceInterval(modifiedScore, confidenceScore);
      
      // Determine final prediction result (Positive/Negative)
      const forcePositive = this.shouldForcePositive(input);
      const predictionResult = forcePositive ? 'Positive' : (modifiedScore > 0.5 ? 'Positive' : 'Negative');
      
      const result: RiskPredictionResult = {
        prediction_result: predictionResult,
        confidence_score: confidenceScore,
        risk_level: riskLevel,
        probability: modifiedScore,
        recommendations,
        shap_values: shapValues,
        feature_contributions: featureContributions,
        flagged_conditions: flaggedConditions,
        confidence_interval: confidenceInterval
      };

      // Log the prediction to database
      await this.logPrediction(input, result);

      return result;
    } catch (error) {
      console.error('Error calculating risk:', error);
      throw new Error('Failed to calculate risk assessment');
    }
  }

  /**
   * Enforce positive classification for specific combinations per request and international criteria
   */
  private shouldForcePositive(input: RiskPredictionInput): boolean {
    // Requested rule: HbA1c > 6.9 AND blood glucose >= 120 => Positive
    if (input.HbA1c_level > this.RISK_THRESHOLDS.HbA1c.highRisk && input.blood_glucose_level >= this.RISK_THRESHOLDS.bloodGlucose.moderateRisk) {
      return true;
    }

    // Requested rule: blood glucose >= 200 AND HbA1c >= 5.9 => Positive
    if (input.blood_glucose_level >= this.RISK_THRESHOLDS.bloodGlucose.diabetes && input.HbA1c_level >= 5.9) {
      return true;
    }

    // International criteria: HbA1c ≥ 6.5 OR fasting glucose ≥ 126 typically indicate diabetes
    if (input.HbA1c_level >= this.RISK_THRESHOLDS.HbA1c.diabetes || input.blood_glucose_level >= this.RISK_THRESHOLDS.bloodGlucose.prediabetes) {
      return true;
    }

    return false;
  }

  /**
   * Calculate base risk score using enhanced algorithm
   */
  private calculateBaseRiskScore(input: RiskPredictionInput): number {
    let score = 0;

    // HbA1c contribution (highest weight)
    if (input.HbA1c_level >= this.RISK_THRESHOLDS.HbA1c.diabetes) {
      score += 0.35; // Critical risk
    } else if (input.HbA1c_level > this.RISK_THRESHOLDS.HbA1c.highRisk) {
      score += 0.30; // Very high risk (requested rule)
    } else if (input.HbA1c_level >= this.RISK_THRESHOLDS.HbA1c.normal) {
      score += 0.15; // Moderate risk
    }

    // Blood glucose contribution
    if (input.blood_glucose_level >= this.RISK_THRESHOLDS.bloodGlucose.diabetes) {
      score += 0.25; // Critical risk
    } else if (input.blood_glucose_level >= this.RISK_THRESHOLDS.bloodGlucose.prediabetes) {
      score += 0.20; // High risk
    } else if (input.blood_glucose_level >= this.RISK_THRESHOLDS.bloodGlucose.moderateRisk) {
      score += 0.12; // Moderate risk (requested rule)
    } else if (input.blood_glucose_level >= this.RISK_THRESHOLDS.bloodGlucose.normal) {
      score += 0.10; // Borderline
    }

    // BMI contribution
    if (input.bmi >= this.RISK_THRESHOLDS.bmi.obese) {
      score += 0.20; // High risk
    } else if (input.bmi >= this.RISK_THRESHOLDS.bmi.overweight) {
      score += 0.15; // Moderate risk
    } else if (input.bmi >= this.RISK_THRESHOLDS.bmi.normal) {
      score += 0.05; // Low risk
    }

    // Age contribution
    if (input.age >= this.RISK_THRESHOLDS.age.increased_risk) {
      score += 0.10; // Moderate risk
    }

    // Medical conditions
    if (input.hypertension) score += 0.15;
    if (input.heart_disease) score += 0.15;

    // Smoking history
    if (input.smoking_history === 'current') {
      score += 0.10;
    } else if (input.smoking_history === 'former') {
      score += 0.05;
    }

    // Gender (males have slightly higher risk)
    if (input.gender === 1) {
      score += 0.05;
    }

    return Math.min(score, 1.0); // Cap at 1.0
  }

  /**
   * Apply risk modifiers for specific high-risk combinations
   */
  private applyRiskModifiers(baseScore: number, input: RiskPredictionInput): number {
    let modifiedScore = baseScore;

    // Critical flag: Blood glucose > 200 AND HbA1c >= 6.5
    if (input.blood_glucose_level > 200 && input.HbA1c_level >= 6.5) {
      modifiedScore += 0.20; // Significant risk increase
    }

    // High risk combination: Elevated HbA1c + High BMI
    if (input.HbA1c_level >= 6.0 && input.bmi >= 30) {
      modifiedScore += 0.15;
    }

    // Age + HbA1c combination
    if (input.age >= 45 && input.HbA1c_level >= 5.7) {
      modifiedScore += 0.10;
    }

    // Multiple comorbidities
    if (input.hypertension && input.heart_disease) {
      modifiedScore += 0.10;
    }

    return Math.min(modifiedScore, 1.0);
  }

  /**
   * Calculate confidence score based on data quality
   */
  private calculateConfidenceScore(input: RiskPredictionInput): number {
    let confidence = 0.8; // Base confidence

    // Reduce confidence for extreme values that might be data entry errors
    if (input.HbA1c_level > 15 || input.HbA1c_level < 3) {
      confidence -= 0.2;
    }
    if (input.blood_glucose_level > 600 || input.blood_glucose_level < 50) {
      confidence -= 0.2;
    }
    if (input.bmi > 60 || input.bmi < 15) {
      confidence -= 0.1;
    }
    if (input.age > 100 || input.age < 10) {
      confidence -= 0.1;
    }

    // Increase confidence for consistent risk indicators
    if (input.HbA1c_level >= 6.5 && input.blood_glucose_level >= 200) {
      confidence += 0.1;
    }

    return Math.max(0.5, Math.min(confidence, 1.0));
  }

  /**
   * Determine risk level based on score
   */
  private determineRiskLevel(score: number): 'Low' | 'Moderate' | 'High' | 'Critical' {
    if (score >= 0.8) return 'Critical';
    if (score >= 0.6) return 'High';
    if (score >= 0.4) return 'Moderate';
    return 'Low';
  }

  /**
   * Calculate SHAP values for feature importance
   */
  private calculateSHAPValues(input: RiskPredictionInput) {
    // Calculate relative importance of each feature
    const totalRisk = this.calculateBaseRiskScore(input);
    
    if (totalRisk === 0) {
      return {
        bmi: 0,
        hbA1c_level: 0,
        blood_glucose_level: 0,
        age: 0,
        hypertension: 0,
        heart_disease: 0,
        smoking_history: 0,
        gender: 0
      };
    }

    // Calculate individual feature contributions
    let hba1cContribution = 0;
    if (input.HbA1c_level >= this.RISK_THRESHOLDS.HbA1c.diabetes) {
      hba1cContribution = 0.35;
    } else if (input.HbA1c_level >= this.RISK_THRESHOLDS.HbA1c.prediabetes) {
      hba1cContribution = 0.25;
    } else if (input.HbA1c_level >= this.RISK_THRESHOLDS.HbA1c.normal) {
      hba1cContribution = 0.15;
    }

    let glucoseContribution = 0;
    if (input.blood_glucose_level >= this.RISK_THRESHOLDS.bloodGlucose.diabetes) {
      glucoseContribution = 0.25;
    } else if (input.blood_glucose_level >= this.RISK_THRESHOLDS.bloodGlucose.prediabetes) {
      glucoseContribution = 0.20;
    } else if (input.blood_glucose_level >= this.RISK_THRESHOLDS.bloodGlucose.normal) {
      glucoseContribution = 0.10;
    }

    let bmiContribution = 0;
    if (input.bmi >= this.RISK_THRESHOLDS.bmi.obese) {
      bmiContribution = 0.20;
    } else if (input.bmi >= this.RISK_THRESHOLDS.bmi.overweight) {
      bmiContribution = 0.15;
    } else if (input.bmi >= this.RISK_THRESHOLDS.bmi.normal) {
      bmiContribution = 0.05;
    }

    const ageContribution = input.age >= this.RISK_THRESHOLDS.age.increased_risk ? 0.10 : 0;
    const hypertensionContribution = input.hypertension ? 0.15 : 0;
    const heartDiseaseContribution = input.heart_disease ? 0.15 : 0;
    const smokingContribution = input.smoking_history === 'current' ? 0.10 : 
                               input.smoking_history === 'former' ? 0.05 : 0;
    const genderContribution = input.gender === 1 ? 0.05 : 0;

    // Normalize contributions to sum to 1
    const totalContribution = hba1cContribution + glucoseContribution + bmiContribution + 
                             ageContribution + hypertensionContribution + heartDiseaseContribution + 
                             smokingContribution + genderContribution;

    if (totalContribution === 0) {
      return {
        bmi: 0,
        hbA1c_level: 0,
        blood_glucose_level: 0,
        age: 0,
        hypertension: 0,
        heart_disease: 0,
        smoking_history: 0,
        gender: 0
      };
    }

    return {
      bmi: bmiContribution / totalContribution,
      hbA1c_level: hba1cContribution / totalContribution,
      blood_glucose_level: glucoseContribution / totalContribution,
      age: ageContribution / totalContribution,
      hypertension: hypertensionContribution / totalContribution,
      heart_disease: heartDiseaseContribution / totalContribution,
      smoking_history: smokingContribution / totalContribution,
      gender: genderContribution / totalContribution
    };
  }

  /**
   * Generate ranked feature contributions
   */
  private generateFeatureContributions(shapValues: any, input: RiskPredictionInput) {
    const features = [
      { name: 'HbA1c Level', key: 'hbA1c_level', value: input.HbA1c_level, unit: '%' },
      { name: 'Blood Glucose', key: 'blood_glucose_level', value: input.blood_glucose_level, unit: 'mg/dL' },
      { name: 'BMI', key: 'bmi', value: input.bmi, unit: 'kg/m²' },
      { name: 'Age', key: 'age', value: input.age, unit: 'years' },
      { name: 'Hypertension', key: 'hypertension', value: input.hypertension, unit: '' },
      { name: 'Heart Disease', key: 'heart_disease', value: input.heart_disease, unit: '' },
      { name: 'Smoking History', key: 'smoking_history', value: input.smoking_history, unit: '' },
      { name: 'Gender', key: 'gender', value: input.gender === 1 ? 'Male' : 'Female', unit: '' }
    ];

    return features
      .map(feature => ({
        name: feature.name,
        contribution: shapValues[feature.key] || 0,
        description: this.generateFeatureDescription(feature, input),
        risk_factor: this.isRiskFactor(feature, input)
      }))
      .sort((a, b) => b.contribution - a.contribution);
  }

  /**
   * Generate description for each feature
   */
  private generateFeatureDescription(feature: any, input: RiskPredictionInput): string {
    switch (feature.key) {
      case 'hbA1c_level':
        if (input.HbA1c_level >= 6.5) return 'Critical: HbA1c indicates diabetes';
        if (input.HbA1c_level >= 5.7) return 'Elevated: HbA1c in prediabetes range';
        return 'Normal: HbA1c within healthy range';
      
      case 'blood_glucose_level':
        if (input.blood_glucose_level >= 200) return 'Critical: Blood glucose indicates diabetes';
        if (input.blood_glucose_level >= 126) return 'Elevated: Blood glucose in prediabetes range';
        if (input.blood_glucose_level >= 100) return 'Borderline: Blood glucose above normal';
        return 'Normal: Blood glucose within healthy range';
      
      case 'bmi':
        if (input.bmi >= 35) return 'Critical: BMI indicates severe obesity';
        if (input.bmi >= 30) return 'High: BMI indicates obesity';
        if (input.bmi >= 25) return 'Moderate: BMI indicates overweight';
        return 'Normal: BMI within healthy range';
      
      case 'age':
        if (input.age >= 65) return 'High: Advanced age increases diabetes risk';
        if (input.age >= 45) return 'Moderate: Age increases diabetes risk';
        return 'Low: Age is not a significant risk factor';
      
      case 'hypertension':
        return input.hypertension ? 'High: Hypertension is a diabetes risk factor' : 'Low: No hypertension';
      
      case 'heart_disease':
        return input.heart_disease ? 'High: Heart disease is a diabetes risk factor' : 'Low: No heart disease';
      
      case 'smoking_history':
        if (input.smoking_history === 'current') return 'High: Current smoking increases diabetes risk';
        if (input.smoking_history === 'former') return 'Moderate: Former smoking may affect risk';
        return 'Low: No smoking history';
      
      case 'gender':
        return input.gender === 1 ? 'Moderate: Male gender has slightly higher risk' : 'Low: Female gender has lower risk';
      
      default:
        return 'Feature contribution to risk assessment';
    }
  }

  /**
   * Check if a feature is a risk factor
   */
  private isRiskFactor(feature: any, input: RiskPredictionInput): boolean {
    switch (feature.key) {
      case 'hbA1c_level':
        return input.HbA1c_level >= 5.7;
      case 'blood_glucose_level':
        return input.blood_glucose_level >= 100;
      case 'bmi':
        return input.bmi >= 25;
      case 'age':
        return input.age >= 45;
      case 'hypertension':
        return input.hypertension === 1;
      case 'heart_disease':
        return input.heart_disease === 1;
      case 'smoking_history':
        return input.smoking_history === 'current' || input.smoking_history === 'former';
      case 'gender':
        return input.gender === 1;
      default:
        return false;
    }
  }

  /**
   * Check for flagged conditions that require immediate attention
   */
  private checkFlaggedConditions(input: RiskPredictionInput): string[] {
    const flags: string[] = [];

    // Critical flags
    if (input.blood_glucose_level > 200 && input.HbA1c_level >= 6.5) {
      flags.push('CRITICAL: Blood glucose > 200 mg/dL AND HbA1c ≥ 6.5% - Immediate medical attention required');
    }

    // Requested additional flags
    if (input.HbA1c_level > 6.9 && input.blood_glucose_level >= 120) {
      flags.push('HIGH RISK: HbA1c > 6.9% with Blood glucose ≥ 120 mg/dL');
    }

    if (input.blood_glucose_level >= 200 && input.HbA1c_level >= 5.9) {
      flags.push('HIGH RISK: Blood glucose ≥ 200 mg/dL with HbA1c ≥ 5.9%');
    }

    if (input.HbA1c_level >= 6.5) {
      flags.push('HIGH RISK: HbA1c ≥ 6.5% indicates diabetes');
    }

    if (input.blood_glucose_level > 200) {
      flags.push('HIGH RISK: Blood glucose > 200 mg/dL indicates diabetes');
    }

    if (input.bmi >= 35) {
      flags.push('HIGH RISK: Severe obesity (BMI ≥ 35)');
    }

    if (input.HbA1c_level >= 5.7 && input.blood_glucose_level >= 126) {
      flags.push('MODERATE RISK: Both HbA1c and blood glucose in prediabetes range');
    }

    if (input.age >= 45 && input.bmi >= 30) {
      flags.push('MODERATE RISK: Age ≥ 45 and obesity combination');
    }

    return flags;
  }

  /**
   * Generate personalized recommendations
   */
  private generateRecommendations(input: RiskPredictionInput, riskLevel: string, flaggedConditions: string[]): string {
    let recommendations = '';

    // Critical recommendations for flagged conditions
    if (flaggedConditions.some(flag => flag.includes('CRITICAL'))) {
      recommendations += 'URGENT: Immediate medical consultation required. ';
    }

    // Risk level specific recommendations
    switch (riskLevel) {
      case 'Critical':
        recommendations += 'Immediate medical intervention required. Consult healthcare provider within 24 hours. ';
        break;
      case 'High':
        recommendations += 'Schedule medical consultation within 1 week. ';
        break;
      case 'Moderate':
        recommendations += 'Schedule medical consultation within 2 weeks. ';
        break;
      case 'Low':
        recommendations += 'Continue regular health monitoring. ';
        break;
    }

    // Specific condition recommendations
    if (input.HbA1c_level >= 6.5) {
      recommendations += 'Diabetes diagnosis likely - immediate lifestyle changes and medical management required. ';
    } else if (input.HbA1c_level >= 5.7) {
      recommendations += 'Prediabetes detected - focus on diet, exercise, and weight management. ';
    }

    if (input.blood_glucose_level > 200) {
      recommendations += 'Elevated blood glucose requires immediate attention and monitoring. ';
    }

    if (input.bmi >= 30) {
      recommendations += 'Weight management through diet and exercise is crucial. ';
    }

    if (input.hypertension) {
      recommendations += 'Blood pressure management is essential for diabetes prevention. ';
    }

    if (input.smoking_history === 'current') {
      recommendations += 'Smoking cessation is strongly recommended. ';
    }

    // General lifestyle recommendations
    recommendations += 'Focus on balanced nutrition, regular physical activity, and stress management. ';

    return recommendations.trim();
  }

  /**
   * Calculate confidence interval
   */
  private calculateConfidenceInterval(score: number, confidence: number): { lower: number; upper: number } {
    const margin = (1 - confidence) * 0.5;
    return {
      lower: Math.max(0, score - margin),
      upper: Math.min(1, score + margin)
    };
  }

  /**
   * Log prediction to database
   */
  private async logPrediction(input: RiskPredictionInput, result: RiskPredictionResult): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.warn('No authenticated user found for prediction logging');
        return;
      }

      const predictionLog = {
        prediction_id: crypto.randomUUID(),
        prediction_time: new Date().toISOString(),
        prediction: result.probability,
        probability: result.confidence_score,
        feature_input: input,
        recommendations: result.recommendations,
        shap_values: result.shap_values,
        confidence_interval: result.confidence_interval,
        user_id: user.id,
        patient_id: input.patient_id
      };

      const { error } = await supabase
        .from('prediction_logs')
        .insert(predictionLog);

      if (error) {
        console.error('Error logging prediction:', error);
      }
    } catch (error) {
      console.error('Error logging prediction:', error);
    }
  }

  /**
   * Get prediction history for a patient
   */
  async getPatientPredictionHistory(patientId: string): Promise<PredictionLog[]> {
    try {
      const { data, error } = await supabase
        .from('prediction_logs')
        .select('*')
        .eq('patient_id', patientId)
        .order('prediction_time', { ascending: false });

      if (error) {
        console.error('Error fetching prediction history:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching prediction history:', error);
      return [];
    }
  }

  /**
   * Get prediction history for current user
   */
  async getUserPredictionHistory(): Promise<PredictionLog[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('prediction_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('prediction_time', { ascending: false });

      if (error) {
        console.error('Error fetching user prediction history:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching user prediction history:', error);
      return [];
    }
  }
}

export const riskPredictionService = new RiskPredictionService();

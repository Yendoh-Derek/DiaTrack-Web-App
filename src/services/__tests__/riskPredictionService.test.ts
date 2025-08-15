import { riskPredictionService, RiskPredictionInput } from '../riskPredictionService';

// Mock test data for demonstration
const testCases = [
  {
    name: "High Risk Patient - Diabetes Indicators",
    input: {
      patient_id: "test001",
      age: 55,
      gender: 1, // Male
      bmi: 32,
      hypertension: 1,
      heart_disease: 0,
      smoking_history: "former",
      HbA1c_level: 7.2,
      blood_glucose_level: 250
    },
    expected: {
      prediction_result: "Positive",
      risk_level: "Critical",
      has_critical_flag: true
    }
  },
  {
    name: "Critical Risk Patient - Both Thresholds Exceeded",
    input: {
      patient_id: "test002",
      age: 60,
      gender: 0, // Female
      bmi: 38,
      hypertension: 1,
      heart_disease: 1,
      smoking_history: "current",
      HbA1c_level: 6.8,
      blood_glucose_level: 220
    },
    expected: {
      prediction_result: "Positive",
      risk_level: "Critical",
      has_critical_flag: true
    }
  },
  {
    name: "Moderate Risk Patient - Prediabetes",
    input: {
      patient_id: "test003",
      age: 45,
      gender: 1, // Male
      bmi: 28,
      hypertension: 0,
      heart_disease: 0,
      smoking_history: "never",
      HbA1c_level: 6.0,
      blood_glucose_level: 115
    },
    expected: {
      prediction_result: "Positive",
      risk_level: "Moderate",
      has_critical_flag: false
    }
  },
  {
    name: "Low Risk Patient - Healthy Indicators",
    input: {
      patient_id: "test004",
      age: 35,
      gender: 0, // Female
      bmi: 22,
      hypertension: 0,
      heart_disease: 0,
      smoking_history: "never",
      HbA1c_level: 5.2,
      blood_glucose_level: 85
    },
    expected: {
      prediction_result: "Negative",
      risk_level: "Low",
      has_critical_flag: false
    }
  }
];

describe('Risk Prediction Service', () => {
  testCases.forEach((testCase) => {
    test(testCase.name, async () => {
      const result = await riskPredictionService.calculateRisk(testCase.input);
      
      // Test prediction result
      expect(result.prediction_result).toBe(testCase.expected.prediction_result);
      
      // Test risk level
      expect(result.risk_level).toBe(testCase.expected.risk_level);
      
      // Test critical flag
      const hasCriticalFlag = result.flagged_conditions.some(flag => 
        flag.includes('CRITICAL') || flag.includes('HIGH RISK')
      );
      expect(hasCriticalFlag).toBe(testCase.expected.has_critical_flag);
      
      // Test confidence score
      expect(result.confidence_score).toBeGreaterThan(0.5);
      expect(result.confidence_score).toBeLessThanOrEqual(1.0);
      
      // Test probability
      expect(result.probability).toBeGreaterThanOrEqual(0);
      expect(result.probability).toBeLessThanOrEqual(1);
      
      // Test SHAP values
      expect(result.shap_values).toBeDefined();
      expect(Object.keys(result.shap_values)).toHaveLength(8);
      
      // Test feature contributions
      expect(result.feature_contributions).toBeDefined();
      expect(result.feature_contributions.length).toBeGreaterThan(0);
      
      // Test recommendations
      expect(result.recommendations).toBeDefined();
      expect(result.recommendations.length).toBeGreaterThan(0);
      
      // Test confidence interval
      expect(result.confidence_interval.lower).toBeLessThanOrEqual(result.confidence_interval.upper);
      expect(result.confidence_interval.lower).toBeGreaterThanOrEqual(0);
      expect(result.confidence_interval.upper).toBeLessThanOrEqual(1);
    });
  });

  test('Critical flag for blood glucose > 200 AND HbA1c >= 6.5', async () => {
    const criticalInput: RiskPredictionInput = {
      patient_id: "critical001",
      age: 50,
      gender: 1,
      bmi: 30,
      hypertension: 0,
      heart_disease: 0,
      smoking_history: "never",
      HbA1c_level: 6.8,
      blood_glucose_level: 220
    };

    const result = await riskPredictionService.calculateRisk(criticalInput);
    
    // Should have critical flag
    const hasCriticalFlag = result.flagged_conditions.some(flag => 
      flag.includes('CRITICAL: Blood glucose > 200 mg/dL AND HbA1c ≥ 6.5%')
    );
    expect(hasCriticalFlag).toBe(true);
    
    // Should be high risk
    expect(result.risk_level).toBe('Critical');
    expect(result.prediction_result).toBe('Positive');
  });

  test('Feature contributions are ranked correctly', async () => {
    const input: RiskPredictionInput = {
      patient_id: "ranking001",
      age: 55,
      gender: 1,
      bmi: 35,
      hypertension: 1,
      heart_disease: 0,
      smoking_history: "current",
      HbA1c_level: 6.2,
      blood_glucose_level: 140
    };

    const result = await riskPredictionService.calculateRisk(input);
    
    // Feature contributions should be sorted by contribution (descending)
    for (let i = 1; i < result.feature_contributions.length; i++) {
      expect(result.feature_contributions[i-1].contribution)
        .toBeGreaterThanOrEqual(result.feature_contributions[i].contribution);
    }
    
    // HbA1c should have high contribution for prediabetes
    const hba1cFeature = result.feature_contributions.find(f => f.name === 'HbA1c Level');
    expect(hba1cFeature).toBeDefined();
    expect(hba1cFeature!.contribution).toBeGreaterThan(0.1);
  });

  test('Confidence score reflects data quality', async () => {
    // Normal data should have high confidence
    const normalInput: RiskPredictionInput = {
      patient_id: "normal001",
      age: 40,
      gender: 0,
      bmi: 24,
      hypertension: 0,
      heart_disease: 0,
      smoking_history: "never",
      HbA1c_level: 5.5,
      blood_glucose_level: 90
    };

    const normalResult = await riskPredictionService.calculateRisk(normalInput);
    expect(normalResult.confidence_score).toBeGreaterThan(0.7);

    // Extreme values should reduce confidence
    const extremeInput: RiskPredictionInput = {
      patient_id: "extreme001",
      age: 150, // Impossible age
      gender: 0,
      bmi: 80, // Impossible BMI
      hypertension: 0,
      heart_disease: 0,
      smoking_history: "never",
      HbA1c_level: 20, // Impossible HbA1c
      blood_glucose_level: 800 // Impossible glucose
    };

    const extremeResult = await riskPredictionService.calculateRisk(extremeInput);
    expect(extremeResult.confidence_score).toBeLessThan(0.7);
  });

  test('Risk modifiers are applied correctly', async () => {
    // Test age + HbA1c combination modifier
    const ageHba1cInput: RiskPredictionInput = {
      patient_id: "modifier001",
      age: 50, // >= 45
      gender: 0,
      bmi: 25,
      hypertension: 0,
      heart_disease: 0,
      smoking_history: "never",
      HbA1c_level: 6.0, // >= 5.7
      blood_glucose_level: 95
    };

    const result = await riskPredictionService.calculateRisk(ageHba1cInput);
    
    // Should have moderate or higher risk due to combination
    expect(['Moderate', 'High', 'Critical']).toContain(result.risk_level);
    
    // Should have recommendations mentioning age and HbA1c
    expect(result.recommendations.toLowerCase()).toContain('age');
    expect(result.recommendations.toLowerCase()).toContain('hba1c');
  });
});

// Performance test
describe('Performance Tests', () => {
  test('Risk calculation is fast', async () => {
    const input: RiskPredictionInput = {
      patient_id: "perf001",
      age: 45,
      gender: 1,
      bmi: 28,
      hypertension: 0,
      heart_disease: 0,
      smoking_history: "never",
      HbA1c_level: 5.8,
      blood_glucose_level: 105
    };

    const startTime = performance.now();
    await riskPredictionService.calculateRisk(input);
    const endTime = performance.now();
    
    const duration = endTime - startTime;
    expect(duration).toBeLessThan(100); // Should complete in less than 100ms
  });

  test('Multiple calculations are consistent', async () => {
    const input: RiskPredictionInput = {
      patient_id: "consistency001",
      age: 50,
      gender: 0,
      bmi: 30,
      hypertension: 1,
      heart_disease: 0,
      smoking_history: "former",
      HbA1c_level: 6.1,
      blood_glucose_level: 120
    };

    const results = [];
    for (let i = 0; i < 5; i++) {
      results.push(await riskPredictionService.calculateRisk(input));
    }

    // All results should be identical for the same input
    const firstResult = results[0];
    results.forEach(result => {
      expect(result.probability).toBe(firstResult.probability);
      expect(result.risk_level).toBe(firstResult.risk_level);
      expect(result.confidence_score).toBe(firstResult.confidence_score);
    });
  });
});

// Edge case tests
describe('Edge Cases', () => {
  test('Handles minimum values correctly', async () => {
    const minInput: RiskPredictionInput = {
      patient_id: "min001",
      age: 18,
      gender: 0,
      bmi: 18.5,
      hypertension: 0,
      heart_disease: 0,
      smoking_history: "never",
      HbA1c_level: 4.0,
      blood_glucose_level: 70
    };

    const result = await riskPredictionService.calculateRisk(minInput);
    expect(result.risk_level).toBe('Low');
    expect(result.prediction_result).toBe('Negative');
  });

  test('Handles maximum values correctly', async () => {
    const maxInput: RiskPredictionInput = {
      patient_id: "max001",
      age: 100,
      gender: 1,
      bmi: 50,
      hypertension: 1,
      heart_disease: 1,
      smoking_history: "current",
      HbA1c_level: 12.0,
      blood_glucose_level: 500
    };

    const result = await riskPredictionService.calculateRisk(maxInput);
    expect(result.risk_level).toBe('Critical');
    expect(result.prediction_result).toBe('Positive');
    expect(result.confidence_score).toBeLessThan(0.8); // Lower confidence for extreme values
  });

  test('Handles zero values correctly', async () => {
    const zeroInput: RiskPredictionInput = {
      patient_id: "zero001",
      age: 0,
      gender: 0,
      bmi: 0,
      hypertension: 0,
      heart_disease: 0,
      smoking_history: "never",
      HbA1c_level: 0,
      blood_glucose_level: 0
    };

    const result = await riskPredictionService.calculateRisk(zeroInput);
    expect(result).toBeDefined();
    expect(result.risk_level).toBeDefined();
    expect(result.confidence_score).toBeLessThan(0.8); // Lower confidence for invalid data
  });
});

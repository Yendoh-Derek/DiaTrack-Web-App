import { supabase } from '@/integrations/supabase/client';

export interface PatientHistoryResponse {
  success: boolean;
  data?: any[];
  error?: string;
}

export const patientHistoryAPI = {
  // Get patient history from prediction_logs table
  async getPatientHistory(patientId: string): Promise<PatientHistoryResponse> {
    try {
      const { data, error } = await supabase
        .from('prediction_logs')
        .select('*')
        .eq('patient_id', patientId)
        .order('prediction_time', { ascending: false });

      if (error) {
        console.error('Error fetching patient history:', error);
        return {
          success: false,
          error: error.message
        };
      }

      return {
        success: true,
        data: data || []
      };
    } catch (error) {
      console.error('Error in getPatientHistory:', error);
      return {
        success: false,
        error: 'Failed to fetch patient history'
      };
    }
  },

  // TODO: Replace with actual API endpoint when provided
  // This is a placeholder for the external API endpoint
  async getPatientHistoryFromAPI(patientId: string): Promise<PatientHistoryResponse> {
    try {
      // Replace this URL with the actual API endpoint
      const response = await fetch(`/api/patient-history/${patientId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // Add any required authentication headers
          // 'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return {
        success: true,
        data: data
      };
    } catch (error) {
      console.error('Error fetching from API:', error);
      return {
        success: false,
        error: 'Failed to fetch patient history from API'
      };
    }
  }
};

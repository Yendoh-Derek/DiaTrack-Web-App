import { supabase } from '@/integrations/supabase/client';

export const checkDatabaseTables = async () => {
  try {
    // Check if clinicians table exists and is accessible
    const { data: cliniciansData, error: cliniciansError } = await supabase
      .from('clinicians')
      .select('count')
      .limit(1);

    if (cliniciansError) {
      console.error('Clinicians table error:', cliniciansError);
      return {
        clinicians: false,
        patients: false,
        prediction_logs: false,
        error: cliniciansError.message
      };
    }

    // Check if patients table exists and is accessible
    const { data: patientsData, error: patientsError } = await supabase
      .from('patients')
      .select('count')
      .limit(1);

    if (patientsError) {
      console.error('Patients table error:', patientsError);
      return {
        clinicians: true,
        patients: false,
        prediction_logs: false,
        error: patientsError.message
      };
    }

    // Check if prediction_logs table exists and is accessible
    const { data: predictionLogsData, error: predictionLogsError } = await supabase
      .from('prediction_logs')
      .select('count')
      .limit(1);

    if (predictionLogsError) {
      console.error('Prediction logs table error:', predictionLogsError);
      return {
        clinicians: true,
        patients: true,
        prediction_logs: false,
        error: predictionLogsError.message
      };
    }

    return {
      clinicians: true,
      patients: true,
      prediction_logs: true,
      error: null
    };
  } catch (error) {
    console.error('Database check error:', error);
    return {
      clinicians: false,
      patients: false,
      prediction_logs: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

export const createTestPatient = async (clinicianId: string) => {
  try {
    const testPatient = {
      clinician_id: clinicianId,
      patient_id: 'TEST001',
      first_name: 'Test',
      last_name: 'Patient',
      date_of_birth: '1990-01-01',
      gender: 'Other',
      contact_number: '+1234567890',
      email: 'test.patient@example.com',
      address: '123 Test Street, Test City',
      emergency_contact: '+1234567891'
    };

    const { data, error } = await supabase
      .from('patients')
      .insert(testPatient)
      .select()
      .single();

    if (error) {
      console.error('Error creating test patient:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error creating test patient:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
};

export const createDatabaseTables = async () => {
  try {
    // This function would be used to create tables if they don't exist
    // For now, we'll just return a message that tables should be created via migrations
    return {
      success: false,
      message: 'Database tables should be created using Supabase migrations. Please run the SQL from DATABASE_SETUP.md in your Supabase SQL Editor.'
    };
  } catch (error) {
    console.error('Create tables error:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

export const testSupabaseConnection = async () => {
  try {
    // Test basic connection
    const { data, error } = await supabase.from('clinicians').select('count').limit(1);
    if (error) {
      return { success: false, error: error.message, type: 'database' };
    }
    
    // Test auth connection
    const { data: authData, error: authError } = await supabase.auth.getSession();
    if (authError) {
      return { success: false, error: authError.message, type: 'authentication' };
    }
    
    return { success: true, message: 'Supabase connection working properly', session: authData.session };
  } catch (error) {
    console.error('Supabase connection test error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error', type: 'connection' };
  }
};

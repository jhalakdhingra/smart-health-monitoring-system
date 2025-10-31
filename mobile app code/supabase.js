// ====================================================
// SUPABASE CONFIGURATION
// ====================================================
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://oiugvnbvttsfjhxhgodj.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9pdWd2bmJ2dHRzZmpoeGhnb2RqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA4NjA0NTIsImV4cCI6MjA3NjQzNjQ1Mn0.dJoQcEm4gRuZ1BNYLwKNLpgPNsiKo-ljo1PaJgZS3kU';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export const getLatestReading = async () => {
  try {
    const { data, error } = await supabase
      .from('sensor_readings')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching data:', error);
    return { data: null, error };
  }
};

export const getReadingsHistory = async (limit = 20) => {
  try {
    const { data, error } = await supabase
      .from('sensor_readings')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching history:', error);
    return { data: null, error };
  }
};

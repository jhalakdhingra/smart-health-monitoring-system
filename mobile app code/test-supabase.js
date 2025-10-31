// Quick test to check Supabase connection and see latest data
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://oiugvnbvttsfjhxhgodj.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9pdWd2bmJ2dHRzZmpoeGhnb2RqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA4NjA0NTIsImV4cCI6MjA3NjQzNjQ1Mn0.dJoQcEm4gRuZ1BNYLwKNLpgPNsiKo-ljo1PaJgZS3kU';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testConnection() {
  console.log('🔍 Testing Supabase connection...\n');
  
  try {
    const { data, error } = await supabase
      .from('sensor_readings')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(3);

    if (error) {
      console.error('❌ Error:', error);
      return;
    }

    if (!data || data.length === 0) {
      console.log('⚠️ No data found in sensor_readings table');
      return;
    }

    console.log(`✅ Found ${data.length} recent records:\n`);
    
    data.forEach((record, index) => {
      const date = new Date(record.created_at);
      const hoursAgo = Math.round((Date.now() - date.getTime()) / (1000 * 60 * 60));
      
      console.log(`Record ${index + 1}:`);
      console.log(`  📅 Time: ${date.toLocaleString()} (${hoursAgo}h ago)`);
      console.log(`  ❤️  Heart Rate: ${record.heart_rate} BPM`);
      console.log(`  🩸 SpO2: ${record.spo2}%`);
      console.log(`  🌡️  Body Temp: ${record.body_temp}°C`);
      console.log(`  🌡️  Room Temp: ${record.room_temp}°C`);
      console.log(`  💧 Humidity: ${record.humidity}%`);
      console.log(`  📈 ECG: ${record.ecg_value}`);
      console.log(`  ⚡ GSR: ${record.gsr_value}`);
      console.log('');
    });

    const latestDate = new Date(data[0].created_at);
    const hoursAgo = Math.round((Date.now() - latestDate.getTime()) / (1000 * 60 * 60));
    
    if (hoursAgo > 1) {
      console.log(`⚠️  WARNING: Last update was ${hoursAgo} hours ago!`);
      console.log('📡 Your Arduino/ESP32 may not be uploading data.');
      console.log('💡 Solution: Power on your Arduino and ESP32 to start getting live data!');
    } else {
      console.log('✅ Data is fresh! Your sensors are working.');
    }

  } catch (err) {
    console.error('❌ Connection error:', err.message);
  }
}

testConnection();

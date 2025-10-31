// ====================================================
// HOME SCREEN - Dashboard
// ====================================================
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Heart, Droplet, Thermometer, Wind, CloudRain, Activity, Zap, RefreshCw, AlertCircle } from 'lucide-react-native';
import SensorCard from '../components/SensorCard';
import VitalSign from '../components/VitalSign';
import { getLatestReading } from '../config/supabase';
import { formatTime, getTimeDifference } from '../utils/helpers';

export default function HomeScreen() {
  const [sensorData, setSensorData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      const { data, error } = await getLatestReading();
      
      if (error) {
        setError('Failed to fetch data');
        console.error(error);
      } else if (data) {
        setSensorData(data);
        setLastUpdate(data.created_at);
        setError(null);
      }
    } catch (err) {
      setError('Connection error');
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 2000);
    return () => clearInterval(interval);
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.loadingText}>Loading sensor data...</Text>
      </View>
    );
  }

  if (error && !sensorData) {
    return (
      <View style={styles.centerContainer}>
        <AlertCircle size={64} color="#F44336" style={styles.errorIcon} />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchData}>
          <RefreshCw size={20} color="#fff" style={{ marginRight: 8 }} />
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      <LinearGradient
        colors={['#1e3a8a', '#1e40af']}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.headerTitle}>Health Monitor</Text>
            <Text style={styles.headerSubtitle}>Real-time Patient Vitals</Text>
          </View>
          <TouchableOpacity onPress={onRefresh} style={styles.refreshButton}>
            <RefreshCw size={24} color="#fff" />
          </TouchableOpacity>
        </View>
        {lastUpdate && (
          <View style={styles.updateBadge}>
            <Text style={styles.updateText}>
              Last updated {getTimeDifference(lastUpdate)}
            </Text>
          </View>
        )}
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.quickStats}>
          <VitalSign
            type="heartRate"
            value={sensorData?.heart_rate || 0}
            label="Heart Rate"
          />
          <VitalSign
            type="spo2"
            value={sensorData?.spo2 || 0}
            label="SpO2"
          />
          <VitalSign
            type="bodyTemp"
            value={sensorData?.body_temp || 0}
            label="Body Temp"
          />
        </View>

        <View style={styles.sensorSection}>
          <Text style={styles.sectionTitle}>Vital Signs</Text>
          
          <SensorCard
            type="heartRate"
            value={sensorData?.heart_rate || 0}
          />
          
          <SensorCard
            type="spo2"
            value={sensorData?.spo2 || 0}
          />
          
          <SensorCard
            type="bodyTemp"
            value={sensorData?.body_temp || 0}
          />
        </View>

        <View style={styles.sensorSection}>
          <Text style={styles.sectionTitle}>Environment</Text>
          
          <SensorCard
            type="roomTemp"
            value={sensorData?.room_temp || 0}
          />
          
          <SensorCard
            type="humidity"
            value={sensorData?.humidity || 0}
          />
        </View>

        <View style={styles.sensorSection}>
          <Text style={styles.sectionTitle}>Advanced Readings</Text>
          
          <SensorCard
            type="ecg"
            value={sensorData?.ecg_value || 0}
          />
          
          <SensorCard
            type="gsr"
            value={sensorData?.gsr_value || 0}
          />
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Last reading: {lastUpdate ? formatTime(lastUpdate) : 'N/A'}
          </Text>
          <Text style={styles.footerText}>
            Auto-refresh: Every 2 seconds
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f1f5f9',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
  },
  header: {
    paddingTop: 50,
    paddingBottom: 24,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
  },
  refreshButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 10,
    borderRadius: 12,
  },
  updateBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  updateText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  quickStats: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: -20,
    borderRadius: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  sensorSection: {
    marginTop: 20,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 12,
    letterSpacing: 0.3,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  errorIcon: {
    marginBottom: 16,
  },
  errorText: {
    fontSize: 16,
    color: '#F44336',
    marginBottom: 24,
    fontWeight: '500',
  },
  retryButton: {
    backgroundColor: '#1e40af',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
    elevation: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  footer: {
    padding: 24,
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 24,
    borderRadius: 16,
    elevation: 2,
  },
  footerText: {
    fontSize: 13,
    color: '#666',
    marginVertical: 3,
    fontWeight: '500',
  },
});

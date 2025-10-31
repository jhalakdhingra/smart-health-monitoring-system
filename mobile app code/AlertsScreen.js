// ====================================================
// ALERTS SCREEN - Professional Design
// ====================================================
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Bell, AlertTriangle, Heart, Droplet, Thermometer } from 'lucide-react-native';
import { getReadingsHistory } from '../config/supabase';
import { isNormalRange, formatValue, getSensorName, formatTime } from '../utils/helpers';

const getSensorIcon = (type, color = '#fff') => {
  const iconProps = { size: 24, color, strokeWidth: 2.5 };
  switch (type) {
    case 'heartRate': return <Heart {...iconProps} />;
    case 'spo2': return <Droplet {...iconProps} />;
    case 'bodyTemp': return <Thermometer {...iconProps} />;
    default: return <Heart {...iconProps} />;
  }
};

export default function AlertsScreen() {
  const [alerts, setAlerts] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 3000);
    return () => clearInterval(interval);
  }, []);

  const fetchAlerts = async () => {
    const { data } = await getReadingsHistory(50);
    if (data) {
      const abnormalReadings = [];
      
      data.forEach((reading) => {
        if (reading.heart_rate && isNormalRange('heartRate', reading.heart_rate) !== 'normal') {
          abnormalReadings.push({
            id: `${reading.id}-hr`,
            type: 'heartRate',
            value: reading.heart_rate,
            status: isNormalRange('heartRate', reading.heart_rate),
            timestamp: reading.created_at,
          });
        }
        
        if (reading.spo2 && isNormalRange('spo2', reading.spo2) !== 'normal') {
          abnormalReadings.push({
            id: `${reading.id}-spo2`,
            type: 'spo2',
            value: reading.spo2,
            status: isNormalRange('spo2', reading.spo2),
            timestamp: reading.created_at,
          });
        }
        
        if (reading.body_temp && isNormalRange('bodyTemp', reading.body_temp) !== 'normal') {
          abnormalReadings.push({
            id: `${reading.id}-temp`,
            type: 'bodyTemp',
            value: reading.body_temp,
            status: isNormalRange('bodyTemp', reading.body_temp),
            timestamp: reading.created_at,
          });
        }
      });
      
      setAlerts(abnormalReadings);
    }
    setRefreshing(false);
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchAlerts();
  };

  const getAlertColor = (status) => {
    return status === 'critical' ? '#F44336' : '#FF9800';
  };

  const getAlertMessage = (type, value, status) => {
    const statusText = status === 'critical' ? 'CRITICAL' : 'WARNING';
    return `${statusText}: ${getSensorName(type)} is ${formatValue(type, value)}`;
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      <LinearGradient
        colors={['#1e3a8a', '#1e40af']}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerContent}>
          <Bell size={32} color="#fff" strokeWidth={2.5} />
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>Health Alerts</Text>
            <Text style={styles.headerSubtitle}>
              {alerts.length} active alert{alerts.length !== 1 ? 's' : ''}
            </Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            colors={['#1e40af']}
            tintColor="#1e40af"
          />
        }
      >
        {alerts.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconContainer}>
              <Bell size={64} color="#94a3b8" strokeWidth={2} />
            </View>
            <Text style={styles.emptyTitle}>All Clear!</Text>
            <Text style={styles.emptyText}>
              No abnormal readings detected
            </Text>
          </View>
        ) : (
          alerts.map((alert) => (
            <View
              key={alert.id}
              style={[
                styles.alertCard,
                { borderLeftColor: getAlertColor(alert.status) },
              ]}
            >
              <View style={styles.alertHeader}>
                <View style={[styles.alertIconContainer, { backgroundColor: getAlertColor(alert.status) + '20' }]}>
                  {getSensorIcon(alert.type, getAlertColor(alert.status))}
                </View>
                <View style={styles.alertInfo}>
                  <View style={styles.alertTopRow}>
                    <AlertTriangle size={16} color={getAlertColor(alert.status)} strokeWidth={2.5} />
                    <Text style={[styles.alertStatus, { color: getAlertColor(alert.status) }]}>
                      {alert.status.toUpperCase()}
                    </Text>
                  </View>
                  <Text style={styles.alertMessage}>
                    {getAlertMessage(alert.type, alert.value, alert.status)}
                  </Text>
                  <Text style={styles.alertTime}>
                    {formatTime(alert.timestamp)}
                  </Text>
                </View>
              </View>
            </View>
          ))
        )}

        {alerts.length > 0 && (
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Auto-refresh: Every 3 seconds
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerText: {
    marginLeft: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 4,
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
  },
  alertCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    padding: 20,
    borderLeftWidth: 5,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  alertIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  alertInfo: {
    flex: 1,
  },
  alertTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  alertStatus: {
    fontSize: 13,
    fontWeight: '700',
    marginLeft: 6,
    letterSpacing: 0.5,
  },
  alertMessage: {
    fontSize: 16,
    color: '#1e3a8a',
    marginBottom: 6,
    fontWeight: '600',
    lineHeight: 22,
  },
  alertTime: {
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 100,
  },
  emptyIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1e3a8a',
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  emptyText: {
    fontSize: 15,
    color: '#64748b',
    fontWeight: '500',
    lineHeight: 22,
  },
  footer: {
    padding: 24,
    alignItems: 'center',
    backgroundColor: '#ffffff',
    marginTop: 20,
    marginHorizontal: 16,
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#1e3a8a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  footerText: {
    fontSize: 13,
    color: '#94a3b8',
    fontWeight: '500',
  },
});

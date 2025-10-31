// ====================================================
// SENSOR CARD COMPONENT - Modern Design with Lucide Icons
// ====================================================
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Heart, Droplet, Thermometer, Wind, CloudRain, Activity, Zap } from 'lucide-react-native';
import { formatValue, getSensorName, isNormalRange, getStatusColor } from '../utils/helpers';

const getSensorIcon = (type) => {
  const iconProps = { size: 32, color: '#fff', strokeWidth: 2.5 };
  switch (type) {
    case 'heartRate': return <Heart {...iconProps} />;
    case 'spo2': return <Droplet {...iconProps} />;
    case 'bodyTemp': return <Thermometer {...iconProps} />;
    case 'roomTemp': return <Wind {...iconProps} />;
    case 'humidity': return <CloudRain {...iconProps} />;
    case 'ecg': return <Activity {...iconProps} />;
    case 'gsr': return <Zap {...iconProps} />;
    default: return <Activity {...iconProps} />;
  }
};

const getGradientColors = (type) => {
  // Professional royal navy blue to lighter blue gradient for all cards
  return ['#1e3a8a', '#2563eb'];
};

export default function SensorCard({ type, value }) {
  const status = isNormalRange(type, value);
  const statusColor = getStatusColor(status);
  const gradientColors = getGradientColors(type);
  
  return (
    <LinearGradient
      colors={gradientColors}
      style={styles.card}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View style={styles.iconContainer}>
        {getSensorIcon(type)}
      </View>
      
      <View style={styles.infoContainer}>
        <Text style={styles.label}>{getSensorName(type)}</Text>
        <Text style={styles.value}>{formatValue(type, value)}</Text>
      </View>

      <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    marginBottom: 16,
    borderRadius: 20,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  infoContainer: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '600',
    marginBottom: 4,
    letterSpacing: 0.3,
  },
  value: {
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 0.5,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#fff',
  },
});

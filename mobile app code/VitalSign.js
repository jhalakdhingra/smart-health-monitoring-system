// ====================================================
// VITAL SIGN COMPONENT - Modern Design
// ====================================================
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Heart, Droplet, Thermometer } from 'lucide-react-native';
import { formatValue } from '../utils/helpers';

const getSensorIcon = (type) => {
  const iconProps = { size: 28, color: '#1e40af', strokeWidth: 2.5 };
  switch (type) {
    case 'heartRate': return <Heart {...iconProps} />;
    case 'spo2': return <Droplet {...iconProps} />;
    case 'bodyTemp': return <Thermometer {...iconProps} />;
    default: return <Heart {...iconProps} />;
  }
};

export default function VitalSign({ type, value, label }) {
  return (
    <View style={styles.container}>
      <View style={styles.iconCircle}>
        {getSensorIcon(type)}
      </View>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{formatValue(type, value)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
    margin: 4,
    borderRadius: 16,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  iconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#eff6ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 11,
    color: '#666',
    marginBottom: 4,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  value: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1a1a1a',
    letterSpacing: 0.3,
  },
});

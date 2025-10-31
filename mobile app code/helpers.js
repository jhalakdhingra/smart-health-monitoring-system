// ====================================================
// HELPER FUNCTIONS
// ====================================================

export const formatTime = (timestamp) => {
  if (!timestamp) return 'N/A';
  const date = new Date(timestamp);
  return date.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit',
    second: '2-digit'
  });
};

export const getTimeDifference = (timestamp) => {
  if (!timestamp) return 'N/A';
  const now = new Date();
  const then = new Date(timestamp);
  const diff = Math.floor((now - then) / 1000);
  
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  return `${Math.floor(diff / 3600)}h ago`;
};

export const isNormalRange = (type, value) => {
  const ranges = {
    heartRate: { min: 60, max: 100 },
    spo2: { min: 95, max: 100 },
    bodyTemp: { min: 36.1, max: 37.2 },
    roomTemp: { min: 18, max: 30 },
    humidity: { min: 30, max: 70 },
  };
  
  if (!ranges[type]) return 'normal';
  
  const { min, max } = ranges[type];
  if (value < min || value > max) return 'critical';
  if (value < min + (max - min) * 0.1 || value > max - (max - min) * 0.1) return 'warning';
  return 'normal';
};

export const getStatusColor = (status) => {
  switch (status) {
    case 'normal': return '#4CAF50';
    case 'warning': return '#FF9800';
    case 'critical': return '#F44336';
    default: return '#2196F3';
  }
};

export const formatValue = (type, value) => {
  if (value === null || value === undefined) return 'N/A';
  
  switch (type) {
    case 'bodyTemp':
    case 'roomTemp':
      return `${value.toFixed(1)}°C`;
    case 'humidity':
      return `${value.toFixed(1)}%`;
    case 'heartRate':
      return `${value} BPM`;
    case 'spo2':
      return `${value}%`;
    case 'ecg':
    case 'gsr':
      return value.toString();
    default:
      return value.toString();
  }
};

export const getSensorIcon = (type) => {
  switch (type) {
    case 'heartRate': return '❤️';
    case 'spo2': return '🩸';
    case 'bodyTemp': return '🌡️';
    case 'roomTemp': return '🏠';
    case 'humidity': return '💧';
    case 'ecg': return '📊';
    case 'gsr': return '⚡';
    default: return '📱';
  }
};

export const getSensorName = (type) => {
  switch (type) {
    case 'heartRate': return 'Heart Rate';
    case 'spo2': return 'Blood Oxygen';
    case 'bodyTemp': return 'Body Temp';
    case 'roomTemp': return 'Room Temp';
    case 'humidity': return 'Humidity';
    case 'ecg': return 'ECG Value';
    case 'gsr': return 'GSR Value';
    default: return type;
  }
};

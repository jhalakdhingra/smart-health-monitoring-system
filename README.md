Project Overview
The **Smart Health Monitoring System** is a comprehensive IoT-based solution designed to revolutionize home healthcare by providing real-time monitoring of vital health parameters. This project integrates medical-grade sensors, cloud connectivity, and intelligent interfaces (web dashboard + mobile app) to deliver affordable, accessible, and professional health monitoring for everyone.
Problem Statement
-68% of medical emergencies occur due to delayed detection of vital sign abnormalities
- Hospital-grade monitors cost ₹50,000-₹2,00,000 - unaffordable for most households
- Lack of continuous monitoring for elderly and chronic disease patients at home
- No integrated solution combining multiple vital parameters with real-time alerts

Our Solution
A portable, affordable, multi-platform health monitoring ecosystem featuring:
- **Hardware**: Arduino Mega + ESP32 + 6 medical sensors
- **Backend**: Supabase cloud database with REST API
- **Web Dashboard**: Dual interfaces for patients and doctors
- **Mobile App**: React Native cross-platform application
- **AI Integration**: Health analysis and predictive insights

 Web Dashboard (Dual Interface)
 Patient Dashboard
**Features:**
1. **Real-Time Readings Display**
   - Live sensor data with color-coded status indicators
   - Auto-refresh every 5 seconds
   - Visual graphs for ECG and GSR trends

2. **🔍 Run Health Analysis**
   - Instant health assessment of all vitals
   - Classification: Normal ✅ | Warning ⚠️ | Critical 🚨
   - Personalized health score

3. **📄 Generate Report (AI-Powered)**
   - One-click PDF download with complete readings
   - AI prediction engine analyzes data patterns
   - Actionable health recommendations
   - Preventive care suggestions

4. **🔊 Voice Assistant**
   - Text-to-speech report narration in English
   - Hands-free accessibility for elderly users
   - Reads vital signs and health status aloud
  
   5. **📚 Report History**
   - Archive of all past health reports
   - Date-wise filtering and search
   - Track health trends over time
   - Export functionality

👨‍⚕️ Doctor Dashboard
**Features:**
1. **Patient Management**
   - Complete patient list with health status
   - Quick search and filtering
   - Patient profile access

2. **🚨 Critical Alerts Priority Queue**
   - Real-time critical patient alerts
   - Automatic prioritization (most critical first)
   - One-click patient details access
   - Alert acknowledgment system

3. **Doctor Actions**
   - Run health analysis for any patient
   - Generate patient reports remotely
   - View patient history
   - Add medical notes and prescriptions

4. **Dashboard Analytics**
   - Total patients monitored
   - Critical alerts count
   - Average health scores
   - Trend analysis graphs

## 📱 Mobile Application (React Native + Expo)

### 3-Tab Interface

#### 📊 Dashboard Tab
- **Real-time vital signs display**
  - Large sensor cards with gradient design
  - Heart Rate, SpO₂, Body Temp, Room Temp, Humidity, ECG, GSR
  - Color-coded status: Green (Normal) | Orange (Warning) | Red (Critical)
- **Last updated timestamp**
- **Pull-to-refresh** for manual sync
- **Quick stats overview**

  #### 📈 Trends Tab
- **5 Interactive Line Charts**
  - Heart Rate trends
  - Blood Oxygen (SpO₂) trends
  - Body Temperature trends
  - ECG signal patterns
  - GSR stress level patterns
- **Auto-refresh every 5 seconds**
- **Smooth animations**
- **Time-series visualization**
- **Zoom and pan gestures**

  #### 🔔 Alerts Tab
- **Intelligent Alert System**
  - Critical alerts (🔴 Red): Immediate attention required
  - Warning alerts (🟠 Orange): Monitor closely
- **Alert History** with timestamps
- **Sensor-specific icons** for quick identification
- **Alert details**: Sensor name, value, threshold crossed
- **Empty state**: "All vitals normal" message

 Core Features
- ✅ **Real-time Monitoring**: 2-second data upload intervals
- ✅ **Multi-Parameter**: 7 vital signs in one device
- ✅ **Dual Interface**: Separate dashboards for patients and doctors
- ✅ **Cross-Platform**: Mobile (iOS/Android) + Web
- ✅ **AI-Powered**: Intelligent health analysis and predictions
- ✅ **Voice Assistant**: Accessibility for elderly users
- ✅ **Report Generation**: PDF downloads with AI insights
- ✅ **Alert System**: Critical health warnings with prioritization
- ✅ **Cloud Storage**: Unlimited data retention
- ✅ **Offline Capability**: Local caching for poor connectivity


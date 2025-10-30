/*
 * ===============================================
 * MEDICAL KIT - ESP32 WiFi MODULE CODE
 * ===============================================
 * 
 * Purpose:
 * - Receive sensor data from Arduino Mega via Serial
 * - Connect to WiFi network
 * - Send data to Supabase database via REST API
 * 
 * Hardware:
 * - ESP32 Development Board
 * - Connected to Arduino Mega via Serial (RX/TX default pins)
 * 
 * Communication:
 * - Serial (USB/default) for Arduino Mega communication and debugging
 * 
 * Author: Medical Kit Team
 * Date: October 2025
 */

// ========== LIBRARIES ==========
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

// ========== WiFi CREDENTIALS ==========
// IMPORTANT: ESP32 only works with 2.4GHz WiFi (NOT 5GHz)
// Make sure your WiFi is 2.4GHz before uploading!

// TRY OPTION 1: Your phone hotspot
const char* ssid = "OnePlus Nord CE 2 Lite 5G";             // Your phone's hotspot name
const char* password = "25619@22";       // Your phone's hotspot password

// IF OPTION 1 DOESN'T WORK, TRY OPTION 2: Uncomment these lines and comment the above
// const char* ssid = "YourHomeWiFiName";     // Your home WiFi name
// const char* password = "YourHomeWiFiPassword"; // Your home WiFi password

// ========== SUPABASE CONFIGURATION ==========
// REPLACE WITH YOUR SUPABASE DETAILS
const char* supabaseUrl = "https://oiugvnbvttsfjhxhgodj.supabase.co";
const char* supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9pdWd2bmJ2dHRzZmpoeGhnb2RqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA4NjA0NTIsImV4cCI6MjA3NjQzNjQ1Mn0.dJoQcEm4gRuZ1BNYLwKNLpgPNsiKo-ljo1PaJgZS3kU";

// Supabase REST API endpoint
String supabaseEndpoint = String(supabaseUrl) + "/rest/v1/sensor_readings";

// ========== SENSOR DATA VARIABLES ==========
struct SensorData {
  float bodyTemp;
  float roomTemp;
  float humidity;
  int heartRate;
  int spo2;
  int ecgValue;
  int gsrValue;
  unsigned long timestamp;
};

SensorData currentData;

// ========== TIMING VARIABLES ==========
unsigned long lastDataReceived = 0;
unsigned long lastUpload = 0;
const unsigned long UPLOAD_INTERVAL = 2000;  // Upload every 2 seconds
const unsigned long DATA_TIMEOUT = 5000;     // Data timeout after 5 seconds

// ========== STATUS FLAGS ==========
bool wifiConnected = false;
bool dataAvailable = false;

// ========== SETUP FUNCTION ==========
void setup() {
  // Initialize Serial Communication
  Serial.begin(9600);   // Match Arduino Mega Serial3 baud rate (9600)
  
  delay(3000);
  
  Serial.println("\n\n=======================================");
  Serial.println("MEDICAL KIT - ESP32 WiFi MODULE");
  Serial.println("=======================================");
  
  // Connect to WiFi
  connectToWiFi();
  
  // Initialize sensor data
  currentData.bodyTemp = 0.0;
  currentData.roomTemp = 0.0;
  currentData.humidity = 0.0;
  currentData.heartRate = 0;
  currentData.spo2 = 0;
  currentData.ecgValue = 0;
  currentData.gsrValue = 0;
  currentData.timestamp = 0;
  
  Serial.println("\nESP32 Ready!");
  Serial.println("Waiting for data from Arduino Mega...\n");
}

// ========== MAIN LOOP ==========
void loop() {
  unsigned long currentMillis = millis();
  
  // Check WiFi connection
  if (WiFi.status() != WL_CONNECTED) {
    wifiConnected = false;
    Serial.println("WiFi disconnected! Reconnecting...");
    connectToWiFi();
  } else {
    wifiConnected = true;
  }
  
  // Read data from Arduino Mega
  if (Serial.available()) {
    readDataFromArduino();
  }
  
  // Upload data to Supabase at regular intervals
  if (wifiConnected && dataAvailable && (currentMillis - lastUpload >= UPLOAD_INTERVAL)) {
    lastUpload = currentMillis;
    uploadToSupabase();
  }
  
  // Check for data timeout
  if (dataAvailable && (currentMillis - lastDataReceived > DATA_TIMEOUT)) {
    Serial.println("Warning: No data received from Arduino for 5 seconds");
  }
  
  delay(350);
}

// ========== CONNECT TO WiFi ==========
void connectToWiFi() {
  Serial.println("\n========== WiFi Connection Attempt ==========");
  Serial.print("Trying to connect to SSID: '");
  Serial.print(ssid);
  Serial.println("'");
  Serial.print("Password (first 3 chars): ");
  if (strlen(password) >= 3) {
    Serial.print(password[0]);
    Serial.print(password[1]);
    Serial.print(password[2]);
  }
  Serial.print("... (length: ");
  Serial.print(strlen(password));
  Serial.println(")");
  
  // Disconnect any existing connection
  WiFi.disconnect(true);
  delay(1000);
  
  // Scan for available networks
  Serial.println("\nScanning for WiFi networks...");
  int networksFound = WiFi.scanNetworks();
  Serial.print("Found ");
  Serial.print(networksFound);
  Serial.println(" networks:");
  
  bool ssidFound = false;
  for (int i = 0; i < networksFound; i++) {
    Serial.print("  ");
    Serial.print(i + 1);
    Serial.print(": ");
    Serial.print(WiFi.SSID(i));
    Serial.print(" (");
    Serial.print(WiFi.RSSI(i));
    Serial.print(" dBm) ");
    Serial.println(WiFi.encryptionType(i) == WIFI_AUTH_OPEN ? "Open" : "Encrypted");
    
    if (WiFi.SSID(i) == String(ssid)) {
      ssidFound = true;
      Serial.println("     ^^^ THIS IS YOUR NETWORK! ^^^");
    }
  }
  
  if (!ssidFound) {
    Serial.println("\n⚠️  WARNING: Your SSID not found in scan!");
    Serial.println("Check: Is WiFi turned on? Is SSID spelled correctly?");
  }
  
  Serial.println("\nAttempting connection...");
  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, password);
  
  Serial.print("Connecting");
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 60) {
    delay(500);
    Serial.print(".");
    attempts++;
    
    if (attempts % 20 == 0) {
      Serial.print("\nStatus: ");
      switch(WiFi.status()) {
        case WL_NO_SSID_AVAIL: Serial.print("Network not found"); break;
        case WL_CONNECT_FAILED: Serial.print("Wrong password"); break;
        case WL_CONNECTION_LOST: Serial.print("Connection lost"); break;
        case WL_DISCONNECTED: Serial.print("Disconnected"); break;
        default: Serial.print(WiFi.status());
      }
      Serial.print("\nStill trying");
    }
  }
  
  Serial.println();
  
  if (WiFi.status() == WL_CONNECTED) {
    wifiConnected = true;
    Serial.println("\n✓✓✓ WiFi Connected Successfully! ✓✓✓");
    Serial.print("IP Address: ");
    Serial.println(WiFi.localIP());
    Serial.print("Signal Strength: ");
    Serial.print(WiFi.RSSI());
    Serial.println(" dBm");
    Serial.print("Gateway: ");
    Serial.println(WiFi.gatewayIP());
    Serial.println("==========================================\n");
  } else {
    wifiConnected = false;
    Serial.println("\n✗✗✗ WiFi Connection Failed! ✗✗✗");
    Serial.print("Final Status: ");
    switch(WiFi.status()) {
      case WL_NO_SSID_AVAIL: 
        Serial.println("Network not found!");
        Serial.println("→ Make sure WiFi is turned on");
        Serial.println("→ Move ESP32 closer to router");
        break;
      case WL_CONNECT_FAILED: 
        Serial.println("Wrong password!");
        Serial.println("→ Double-check password (case-sensitive)");
        break;
      default:
        Serial.print("Error code ");
        Serial.println(WiFi.status());
    }
    Serial.println("==========================================\n");
  }
}

// ========== READ DATA FROM ARDUINO ==========
void readDataFromArduino() {
  static String receivedData = "";
  
  // Read all available characters
  while (Serial.available() > 0) {
    char c = Serial.read();
    
    if (c == '\n' || c == '\r') {
      // End of message, process it
      if (receivedData.length() > 0) {
        processArduinoData(receivedData);
        receivedData = "";  // Clear for next message
      }
    } else {
      // Add character to buffer
      receivedData += c;
    }
    
    // Safety: prevent buffer overflow
    if (receivedData.length() > 200) {
      Serial.println("Error: Buffer overflow, clearing...");
      receivedData = "";
    }
  }
}

// ========== PROCESS ARDUINO DATA ==========
void processArduinoData(String receivedData) {
  receivedData.trim();
  
  // Debug: Show what was received
  Serial.print("Raw received (");
  Serial.print(receivedData.length());
  Serial.print(" chars): ");
  Serial.println(receivedData);
  
  // Expected format: {"bodyTemp":36.5,"heartRate":72,"spo2":98,"roomTemp":25,"humidity":55,"ecg":512,"gsr":285}
  if (receivedData.startsWith("{") && receivedData.endsWith("}")) {
    // Parse JSON data
    StaticJsonDocument<1024> doc;  // Increased buffer size
    DeserializationError error = deserializeJson(doc, receivedData);
    
    if (error) {
      Serial.print("JSON parsing failed: ");
      Serial.println(error.c_str());
      Serial.print("Received: ");
      Serial.println(receivedData);
      return;
    }
    
    // Extract values from JSON
    currentData.bodyTemp = doc["bodyTemp"] | 0.0;
    currentData.heartRate = doc["heartRate"] | 0;
    currentData.spo2 = doc["spo2"] | 0;
    currentData.roomTemp = doc["roomTemp"] | 0.0;
    currentData.humidity = doc["humidity"] | 0.0;
    currentData.ecgValue = doc["ecg"] | 0;
    currentData.gsrValue = doc["gsr"] | 0;
    currentData.timestamp = millis();
    
    dataAvailable = true;
    lastDataReceived = millis();
    
    // Debug output
    Serial.println("\n========== RECEIVED DATA ==========");
    Serial.printf("Body Temp: %.2f °C\n", currentData.bodyTemp);
    Serial.printf("Heart Rate: %d BPM\n", currentData.heartRate);
    Serial.printf("SpO2: %d %%\n", currentData.spo2);
    Serial.printf("Room Temp: %.2f °C\n", currentData.roomTemp);
    Serial.printf("Humidity: %.2f %%\n", currentData.humidity);
    Serial.printf("ECG: %d\n", currentData.ecgValue);
    Serial.printf("GSR: %d\n", currentData.gsrValue);
    Serial.println("===================================\n");
  } else {
    // Invalid format - only show if it's not empty
    if (receivedData.length() > 0) {
      Serial.print("Error: Invalid data format received: ");
      Serial.println(receivedData);
    }
  }
}

// ========== UPLOAD TO SUPABASE ==========
void uploadToSupabase() {
  if (!wifiConnected) {
    Serial.println("Cannot upload: WiFi not connected");
    return;
  }
  
  HTTPClient http;
  
  // Begin HTTP connection
  http.begin(supabaseEndpoint);
  
  // Set headers
  http.addHeader("Content-Type", "application/json");
  http.addHeader("apikey", supabaseKey);
  http.addHeader("Authorization", String("Bearer ") + supabaseKey);
  http.addHeader("Prefer", "return=representation");
  
  // Create JSON document
  StaticJsonDocument<1024> doc;  // Increased buffer size from 512 to 1024
  
  doc["body_temp"] = currentData.bodyTemp;
  doc["room_temp"] = currentData.roomTemp;
  doc["humidity"] = currentData.humidity;
  doc["heart_rate"] = currentData.heartRate;
  doc["spo2"] = currentData.spo2;
  doc["ecg_value"] = currentData.ecgValue;
  doc["gsr_value"] = currentData.gsrValue;
  
  // Serialize JSON to string
  String jsonPayload;
  serializeJson(doc, jsonPayload);
  
  Serial.println("\n--- UPLOADING TO SUPABASE ---");
  Serial.print("Endpoint: ");
  Serial.println(supabaseEndpoint);
  Serial.print("Payload: ");
  Serial.println(jsonPayload);
  
  // Send POST request
  int httpResponseCode = http.POST(jsonPayload);
  
  // Handle response
  if (httpResponseCode > 0) {
    String response = http.getString();
    
    Serial.print("Response Code: ");
    Serial.println(httpResponseCode);
    
    if (httpResponseCode == 201 || httpResponseCode == 200) {
      Serial.println("✓ Data uploaded successfully!");
      Serial.print("Response: ");
      Serial.println(response);
    } else {
      Serial.println("✗ Upload failed with error code: " + String(httpResponseCode));
      Serial.print("Response: ");
      Serial.println(response);
    }
  } else {
    Serial.print("✗ HTTP Request failed, error: ");
    Serial.println(http.errorToString(httpResponseCode));
  }
  
  Serial.println("------------------------------\n");
  
  // Free resources
  http.end();
}

// ========== GET FORMATTED TIME ==========
String getFormattedTime() {
  unsigned long seconds = millis() / 1000;
  unsigned long minutes = seconds / 60;
  unsigned long hours = minutes / 60;
  
  seconds = seconds % 60;
  minutes = minutes % 60;
  hours = hours % 24;
  
  char timeStr[9];
  sprintf(timeStr, "%02lu:%02lu:%02lu", hours, minutes, seconds);
  return String(timeStr);
}
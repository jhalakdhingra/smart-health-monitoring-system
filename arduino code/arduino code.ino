#include <Wire.h>
#include <Adafruit_MLX90614.h>
#include <MAX30105.h>
#include <spo2_algorithm.h>
#include <heartRate.h>
#include <DHT.h>
#include <LiquidCrystal_I2C.h>

// ---------------- Pin Definitions ----------------
#define DHT_PIN 3
#define ECG_LO_PLUS 5
#define ECG_LO_MINUS 4
#define ECG_OUTPUT A0
#define GSR_PIN A1

// ---------------- Sensor Initialization ----------------
Adafruit_MLX90614 mlx = Adafruit_MLX90614();
MAX30105 particleSensor;
DHT dht(DHT_PIN, DHT22);
LiquidCrystal_I2C lcd(0x27, 20, 4);

// ---------------- Sensor Data Structure ----------------
struct SensorData {
  float bodyTemp;
  float heartRate;
  float spo2;
  float roomTemp;
  float humidity;
  int ecgValue;
  int gsrValue;
} sensorData;

// ---------------- Heart Rate & SpO2 Variables ----------------
#define BUFFER_SIZE 25           // smaller buffer for faster update
uint32_t irBuffer[BUFFER_SIZE];
uint32_t redBuffer[BUFFER_SIZE];
int bufferIndex = 0;
int samplesCollected = 0;
int32_t spo2;
int8_t validSPO2;
int32_t heartRate;
int8_t validHeartRate;

// ---------------- Moving Average ----------------
#define AVG_SIZE 3              // very small for near-instant update
float hrHistory[AVG_SIZE] = {0};
float spo2History[AVG_SIZE] = {0};
int avgIndex = 0;

// ---------------- Timing ----------------
unsigned long lastLCDUpdate = 0;
unsigned long lastSensorRead = 0;
unsigned long lastESP32Send = 0;  // NEW: Track ESP32 data sending
const unsigned long sensorInterval = 100; // 100ms = 10 readings/sec
const unsigned long esp32Interval = 100;  // NEW: Send to ESP32 every 100ms

// ---------------- Display Mode ----------------
// Set to true for Serial Plotter (graphs), false for Serial Monitor (text)
bool PLOTTER_MODE = false;  // Change to true to see ECG graph in Serial Plotter

// ---------------- Setup ----------------
void setup() {
  Serial.begin(115200);
  Serial3.begin(9600);  // ESP32 communication
  Wire.begin();

  if (!mlx.begin()) { while (1); }
  if (!particleSensor.begin(Wire, I2C_SPEED_FAST)) { while (1); }
  particleSensor.setup();
  particleSensor.setPulseAmplitudeRed(0x0A);
  particleSensor.setPulseAmplitudeIR(0x0A);
  dht.begin();

  pinMode(ECG_LO_PLUS, INPUT);
  pinMode(ECG_LO_MINUS, INPUT);

  lcd.init();
  lcd.backlight();
  lcd.clear();
  lcd.setCursor(2, 1);
  lcd.print("MEDICAL KIT");
  lcd.setCursor(5, 2);
  lcd.print("Initializing...");
  delay(1000);
  lcd.clear();
}

// ---------------- Loop ----------------
void loop() {
  unsigned long now = millis();

  // ---------------- Read sensors periodically ----------------
  if (now - lastSensorRead >= sensorInterval) {
    lastSensorRead = now;
    readSensors();
  }

  // ---------------- Update LCD ----------------
  if (now - lastLCDUpdate > 300) { // update LCD faster
    updateLCD();
    lastLCDUpdate = now;
  }

  // ---------------- Send data to ESP32 ----------------
  if (now - lastESP32Send >= esp32Interval) {
    lastESP32Send = now;
    sendDataToESP32();
  }
}

// ---------------- Read All Sensors ----------------
void readSensors() {
  sensorData.bodyTemp = mlx.readObjectTempC();

  // MAX30102 per-sample read
  if (particleSensor.check()) {
    redBuffer[bufferIndex] = particleSensor.getRed();
    irBuffer[bufferIndex] = particleSensor.getIR();
    bufferIndex = (bufferIndex + 1) % BUFFER_SIZE;

    if (samplesCollected < BUFFER_SIZE) samplesCollected++;

    if (samplesCollected >= 5) { // compute HR/SPO2 after few samples
      maxim_heart_rate_and_oxygen_saturation(irBuffer, samplesCollected, redBuffer,
                                             &spo2, &validSPO2, &heartRate, &validHeartRate);

      // ---------------- Instant moving average ----------------
      if (validHeartRate) hrHistory[avgIndex] = heartRate;
      if (validSPO2) spo2History[avgIndex] = spo2;

      avgIndex = (avgIndex + 1) % AVG_SIZE;

      float hrSum = 0, spo2Sum = 0;
      for (int i = 0; i < AVG_SIZE; i++) {
        hrSum += hrHistory[i];
        spo2Sum += spo2History[i];
      }
      sensorData.heartRate = hrSum / AVG_SIZE;
      sensorData.spo2 = spo2Sum / AVG_SIZE;
    }
  }

  // DHT22
  sensorData.roomTemp = dht.readTemperature();
  sensorData.humidity = dht.readHumidity();
  if (isnan(sensorData.roomTemp)) sensorData.roomTemp = 0;
  if (isnan(sensorData.humidity)) sensorData.humidity = 0;

  // ECG & GSR
  sensorData.ecgValue = analogRead(ECG_OUTPUT);
  sensorData.gsrValue = analogRead(GSR_PIN);

  // ---------------- Serial Output ----------------
  if (PLOTTER_MODE) {
    // For Serial Plotter - Print ONLY ECG value (or any single value you want to graph)
    Serial.println(sensorData.ecgValue);
  } else {
    // For Serial Monitor - Print formatted text
    Serial.print("BT:"); Serial.print(sensorData.bodyTemp,1);
    Serial.print("C HR:"); Serial.print(sensorData.heartRate,0);
    Serial.print(" SpO2:"); Serial.print(sensorData.spo2,0);
    Serial.print("% ECG:"); Serial.print(sensorData.ecgValue);
    Serial.print(" GSR:"); Serial.print(sensorData.gsrValue);
    Serial.print(" RT:"); Serial.print(sensorData.roomTemp,1);
    Serial.print("C Hum:"); Serial.println(sensorData.humidity,1);
  }
}

// ---------------- LCD Display Update ----------------
void updateLCD() {
  lcd.setCursor(0, 0);
  lcd.print("BT:");
  lcd.print(sensorData.bodyTemp, 1);
  lcd.print("C  HR:");
  lcd.print(sensorData.heartRate, 0);
  lcd.print("bpm");

  lcd.setCursor(0, 1);
  lcd.print("SpO2:");
  lcd.print(sensorData.spo2, 0);
  lcd.print("%  ECG:");
  lcd.print(sensorData.ecgValue);

  lcd.setCursor(0, 2);
  lcd.print("RT:");
  lcd.print(sensorData.roomTemp, 1);
  lcd.print("C  Hum:");
  lcd.print(sensorData.humidity, 1);
  lcd.print("%");

  lcd.setCursor(0, 3);
  lcd.print("GSR:");
  lcd.print(sensorData.gsrValue);
  lcd.print("     ");
}

// ---------------- Send Data to ESP32 ----------------
void sendDataToESP32() {
  String jsonData = "{";
  jsonData += "\"bodyTemp\":" + String(sensorData.bodyTemp) + ",";
  jsonData += "\"heartRate\":" + String(sensorData.heartRate) + ",";
  jsonData += "\"spo2\":" + String(sensorData.spo2) + ",";
  jsonData += "\"roomTemp\":" + String(sensorData.roomTemp) + ",";
  jsonData += "\"humidity\":" + String(sensorData.humidity) + ",";
  jsonData += "\"ecg\":" + String(sensorData.ecgValue) + ",";
  jsonData += "\"gsr\":" + String(sensorData.gsrValue);
  jsonData += "}";
  
  Serial3.println(jsonData);
  Serial3.flush();  // Wait for transmission to complete
}
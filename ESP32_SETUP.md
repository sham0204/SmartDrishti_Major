# ESP32 Setup for SmartDrishti

## 1. Arduino IDE Installation

1. Download and install the Arduino IDE from [arduino.cc](https://www.arduino.cc/en/software)
2. Launch the Arduino IDE

## 2. ESP32 Board Support Installation

1. Open Arduino IDE
2. Go to `File` > `Preferences`
3. In the "Additional Boards Manager URLs" field, add:
   ```
   https://dl.espressif.com/dl/package_esp32_index.json
   ```
4. Click "OK"
5. Go to `Tools` > `Board` > `Boards Manager`
6. Search for "ESP32"
7. Install "ESP32 by Espressif Systems"

## 3. Required Libraries Installation

Install these libraries through the Library Manager:

1. Go to `Tools` > `Manage Libraries...` (or press Ctrl+Shift+I)
2. Search for and install:
   - `Firebase ESP32 Client` by mobizt
   - `ArduinoJson` by Benoit Blanchon

Alternatively, install via Sketch > Include Library > Manage Libraries

## 4. Board Selection

1. Connect your ESP32 to your computer via USB
2. Go to `Tools` > `Board` > `ESP32 Arduino`
3. Select your specific ESP32 board (e.g., "ESP32 Dev Module")
4. Go to `Tools` > `Port` and select the port corresponding to your ESP32

## 5. Configure the Sketch

Before uploading the sketch, update these values in the code:

```cpp
// Firebase configuration
#define FIREBASE_HOST "your-project.firebaseio.com"
#define FIREBASE_AUTH "your-database-secret"

// Wi-Fi configuration
#define WIFI_SSID "your_wifi_ssid"
#define WIFI_PASSWORD "your_wifi_password"

// Device ID
#define DEVICE_ID "esp32_01"
```

## 6. Circuit Connections

Connect these components to your ESP32:

- LED1: GPIO 2 (with 220Ω resistor to ground)
- LED2: GPIO 4 (with 220Ω resistor to ground)
- FAN: GPIO 5 (with appropriate transistor/driver circuit)

Note: For actual fan control, you'll need a transistor or MOSFET driver as the ESP32 cannot directly drive motors.

## 7. Upload the Sketch

1. Open the [esp32_firebase.ino](file:///c%3A/Users/manis/Downloads/Next_js%20project-20251126T021557Z-1-001/Next_js%20project/SmartDrishti/esp32/esp32_firebase.ino) file in Arduino IDE
2. Verify the code by clicking the checkmark icon
3. Upload the code by clicking the arrow icon
4. Open the Serial Monitor (Ctrl+Shift+M) to see debug output

## 8. Troubleshooting

Common issues and solutions:

1. **Upload failed**: 
   - Hold BOOT button while pressing EN button
   - Check correct board and port selection
   - Try different USB cables

2. **Wi-Fi connection fails**:
   - Verify SSID and password
   - Check Wi-Fi signal strength
   - Ensure router supports 2.4GHz band

3. **Firebase connection fails**:
   - Verify FIREBASE_HOST and FIREBASE_AUTH values
   - Check internet connectivity
   - Confirm Firebase Realtime Database is enabled

4. **Commands not received**:
   - Verify DEVICE_ID matches between ESP32 and web app
   - Check Firebase database rules
   - Confirm user authentication is working
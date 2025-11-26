import { redirect } from "next/navigation";
import ProjectInfoLayout from "../../../components/ui/ProjectInfoLayout";
import { requireUser } from "../../../lib/auth";

// Force dynamic rendering to prevent static generation issues
export const dynamic = "force-dynamic";

export default async function WaterLevelInfoPage() {
  try {
    await requireUser();
  } catch {
    redirect("/login?from=/projects/water-level");
  }

  const codeSample = `// Example ESP32 firmware snippet (placeholder)
void setup() {
  Serial.begin(115200);
  // Initialize WiFi, sensor, etc.
}

void loop() {
  int levelPercent = readWaterLevelSensor();
  postToSmartDrishti(levelPercent);
  delay(5000);
}`;

  return (
    <ProjectInfoLayout
      projectKey="water-level"
      title="Water Level Detector"
      description="Measure and visualize water tank levels using sensors and stream the readings to SmartDrishti over HTTP."
      pinout="Connect the sensor output to an analog pin (e.g., A0) on your ESP32/Arduino. Share common GND and power the sensor with 3.3V/5V as per datasheet."
      components={[
        "ESP32 / Arduino",
        "Water level or ultrasonic sensor",
        "Jumper wires",
        "Power supply",
        "WiFi connectivity"
      ]}
      working="The sensor reports a signal proportional to the water depth. The microcontroller normalizes it to a percentage and periodically pushes it to SmartDrishti."
      procedure={`1. Wire the sensor and verify readings locally.\n2. Configure WiFi credentials and your SmartDrishti API key.\n3. Post level data every few seconds via HTTPS.\n4. Watch the live dashboard update instantly.`}
      codeSample={codeSample}
      conclusion="You will learn how to acquire sensor data, interpret it, and present it in a modern web dashboard."
      referenceUrl="https://example.com/water-level-reference"
    />
  );
}
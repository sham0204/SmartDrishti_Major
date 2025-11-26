import { redirect } from "next/navigation";
import ProjectInfoLayout from "../../../components/ui/ProjectInfoLayout";
import { requireUser } from "../../../lib/auth";

// Force dynamic rendering to prevent static generation issues
export const dynamic = "force-dynamic";

export default async function HomeAppliancesInfoPage() {
  try {
    await requireUser();
  } catch {
    redirect("/login?from=/projects/home-appliances");
  }

  const codeSample = `// Example ESP32 polling snippet (placeholder)
void loop() {
  DesiredState state = fetchDesiredState();
  digitalWrite(LED1_PIN, state.led1);
  digitalWrite(LED2_PIN, state.led2);
  analogWrite(FAN1_PIN, state.fan1 ? 255 : 0);
  reportBack(state);
  delay(3000);
}`;

  return (
    <ProjectInfoLayout
      projectKey="home-appliances"
      title="Home Appliances Monitoring System"
      description="Toggle LEDs and fans remotely while keeping a full audit trail of device state via SmartDrishti."
      pinout="Use digital pins (with resistors) for LEDs and a driver/relay for the fan. Provide a common ground across power supplies."
      components={[
        "ESP32 / Arduino",
        "2x LEDs with resistors",
        "1x DC fan + driver/relay",
        "Power supply",
        "WiFi connectivity"
      ]}
      working="The device polls SmartDrishti for the latest desired state, updates outputs, and then reports its actual state for history tracking."
      procedure={`1. Wire the actuators and verify manual control.\n2. Configure WiFi + SmartDrishti API credentials.\n3. Poll the desired-state endpoint and apply responses to hardware.\n4. Submit device state updates after each change.`}
      codeSample={codeSample}
      conclusion="This lab demonstrates cloud-to-device control loops and telemetry reporting for smart homes."
      referenceUrl="https://example.com/home-appliances-reference"
    />
  );
}
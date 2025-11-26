import Esp32Controller from "@/components/ui/Esp32Controller";

// Force dynamic rendering to prevent static generation issues
export const dynamic = "force-dynamic";

export default function Esp32ControlPage() {
  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8">ESP32 Device Control</h1>
        <Esp32Controller deviceId="esp32_01" />
      </div>
    </div>
  );
}
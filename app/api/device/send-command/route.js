import { NextResponse } from "next/server";
import { db } from "@/lib/firebaseAdmin";
import { requireUser } from "@/lib/auth";

// Force dynamic rendering for API routes
export const dynamic = "force-dynamic";

export async function POST(request) {
  try {
    // Authenticate user
    const user = await requireUser();
    
    // Parse request body
    const { deviceId, command } = await request.json();
    
    // Validate inputs
    if (!deviceId || !command) {
      return NextResponse.json(
        { error: "Device ID and command are required" },
        { status: 400 }
      );
    }
    
    // Validate command format
    const validCommands = [
      "LED1_ON", "LED1_OFF", "LED2_ON", "LED2_OFF",
      "FAN_ON", "FAN_OFF"
    ];
    
    const isBlinkCommand = command.startsWith("LED1_BLINK:");
    const isValidCommand = validCommands.includes(command) || isBlinkCommand;
    
    if (!isValidCommand) {
      return NextResponse.json(
        { error: "Invalid command" },
        { status: 400 }
      );
    }
    
    // Write command to Firebase Realtime Database
    const commandRef = db.ref(`devices/${deviceId}/commands`);
    await commandRef.push({
      command,
      timestamp: Date.now(),
      userId: user.id
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error sending command:", error);
    return NextResponse.json(
      { error: "Failed to send command" },
      { status: 500 }
    );
  }
}
# Prisma State Logging for ESP32 Devices

To log ESP32 device state changes into the Prisma database, you can extend the Firebase integration with the following approach:

## 1. Update the Send Command API Route

Modify [app/api/device/send-command/route.js](file:///c%3A/Users/manis/Downloads/Next_js%20project-20251126T021557Z-1-001/Next_js%20project/SmartDrishti/app/api/device/send-command/route.js) to also save commands to the database:

```javascript
import { NextResponse } from "next/server";
import { db } from "@/lib/firebaseAdmin";
import { requireUser } from "@/lib/auth";
import prisma from "@/lib/prisma"; // Add this import

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
    const firebaseResult = await commandRef.push({
      command,
      timestamp: Date.now(),
      userId: user.id
    });
    
    // Log command to Prisma database
    const project = await prisma.project.findUnique({
      where: { key: "esp32-devices" } // You might need to create this project
    });
    
    if (project) {
      await prisma.applianceState.create({
        data: {
          userId: user.id,
          projectId: project.id,
          led1: command === "LED1_ON" || command.startsWith("LED1_BLINK:"),
          led2: command === "LED2_ON",
          fan1: command === "FAN_ON",
          source: "WEB" // or "DEVICE" if coming from ESP32
        }
      });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error sending command:", error);
    return NextResponse.json(
      { error: "Failed to send command" },
      { status: 500 }
    );
  }
}
```

## 2. Create a Firebase Listener for State Changes

Create a new file [lib/firebaseStateListener.js](file:///c%3A/Users/manis/Downloads/Next_js%20project-20251126T021557Z-1-001/Next_js%20project/SmartDrishti/lib/firebaseStateListener.js):

```javascript
// lib/firebaseStateListener.js
import { db } from "@/lib/firebaseAdmin";
import prisma from "@/lib/prisma";

// Listen for state changes and log to Prisma
export function initStateLogging(deviceId = "esp32_01") {
  const stateRef = db.ref(`devices/${deviceId}/state`);
  
  stateRef.on("value", async (snapshot) => {
    const state = snapshot.val();
    if (!state) return;
    
    try {
      // Find the project for ESP32 devices
      const project = await prisma.project.findUnique({
        where: { key: "esp32-devices" }
      });
      
      if (!project) {
        console.warn("ESP32 project not found in database");
        return;
      }
      
      // Get the user who last sent a command (simplified approach)
      // In a real implementation, you'd track this more precisely
      const lastUser = await prisma.user.findFirst({
        orderBy: { id: "asc" } // Simplified - get first user
      });
      
      if (!lastUser) {
        console.warn("No user found for state logging");
        return;
      }
      
      // Log state to Prisma database
      await prisma.applianceState.create({
        data: {
          userId: lastUser.id,
          projectId: project.id,
          led1: state.led1 || false,
          led2: state.led2 || false,
          fan1: state.fan || false,
          source: "DEVICE"
        }
      });
      
      console.log(`State logged for device ${deviceId}`);
    } catch (error) {
      console.error("Error logging state to database:", error);
    }
  });
}
```

## 3. Initialize the Listener in Your Application

You can initialize the listener in your server.js or in a Next.js API route that runs once:

```javascript
// In server.js or an initialization API route
import { initStateLogging } from "@/lib/firebaseStateListener";

// Start listening for state changes
initStateLogging("esp32_01");
```

## 4. Database Schema Considerations

The above code assumes you have an "esp32-devices" project in your database. You may need to:

1. Add this project via your seed script or Prisma Studio
2. Adjust the logic to associate state changes with the correct user
3. Add additional fields to track more device-specific information

## 5. Alternative Approach: Scheduled Polling

If you prefer a scheduled approach instead of real-time listeners:

```javascript
// lib/pollFirebaseState.js
import { db } from "@/lib/firebaseAdmin";
import prisma from "@/lib/prisma";

export async function pollAndLogState(deviceId = "esp32_01") {
  try {
    const stateRef = db.ref(`devices/${deviceId}/state`);
    const snapshot = await stateRef.once("value");
    const state = snapshot.val();
    
    if (!state) return;
    
    // Similar logic to above for finding project and user
    const project = await prisma.project.findUnique({
      where: { key: "esp32-devices" }
    });
    
    if (project) {
      const lastUser = await prisma.user.findFirst({
        orderBy: { id: "asc" }
      });
      
      if (lastUser) {
        await prisma.applianceState.create({
          data: {
            userId: lastUser.id,
            projectId: project.id,
            led1: state.led1 || false,
            led2: state.led2 || false,
            fan1: state.fan || false,
            source: "DEVICE"
          }
        });
      }
    }
  } catch (error) {
    console.error("Error polling and logging state:", error);
  }
}

// Run this function periodically (e.g., every 30 seconds)
// setInterval(() => pollAndLogState(), 30000);
```

## Notes

1. This implementation requires creating an "esp32-devices" project in your database
2. The user association is simplified and should be improved for production use
3. Error handling should be enhanced for production environments
4. Consider rate limiting to prevent database overload
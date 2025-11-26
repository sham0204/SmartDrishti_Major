"use client";

import { useState, useEffect } from "react";
import Button from "@/components/ui/Button";

// Conditional Firebase import (only in browser)
let database, ref, onValue, off;
if (typeof window !== "undefined") {
  try {
    ({ database, ref, onValue, off } = require("@/lib/firebaseClient"));
  } catch (e) {
    console.warn("Firebase not available in this environment");
  }
}

export default function Esp32Controller({ deviceId = "esp32_01" }) {
  const [state, setState] = useState({
    led1: false,
    led2: false,
    fan: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Listen for state updates from Firebase
  useEffect(() => {
    if (!database) return;

    const stateRef = ref(database, `devices/${deviceId}/state`);
    
    const unsubscribe = onValue(stateRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setState({
          led1: data.led1 || false,
          led2: data.led2 || false,
          fan: data.fan || false
        });
      }
    });

    return () => {
      if (unsubscribe) unsubscribe();
      else off(stateRef);
    };
  }, [deviceId]);

  const sendCommand = async (command) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch("/api/device/send-command", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ deviceId, command })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Failed to send command");
      }
      
      console.log("Command sent successfully:", command);
    } catch (err) {
      setError(err.message);
      console.error("Error sending command:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">ESP32 Device Controller</h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          Error: {error}
        </div>
      )}
      
      <div className="grid grid-cols-1 gap-4">
        {/* LED 1 Control */}
        <div className="flex items-center justify-between p-4 border rounded">
          <span className="font-medium">LED 1</span>
          <Button
            onClick={() => sendCommand(state.led1 ? "LED1_OFF" : "LED1_ON")}
            disabled={loading}
            className={`px-4 py-2 rounded ${
              state.led1 
                ? "bg-green-500 hover:bg-green-600" 
                : "bg-gray-300 hover:bg-gray-400"
            }`}
          >
            {state.led1 ? "ON" : "OFF"}
          </Button>
        </div>
        
        {/* LED 2 Control */}
        <div className="flex items-center justify-between p-4 border rounded">
          <span className="font-medium">LED 2</span>
          <Button
            onClick={() => sendCommand(state.led2 ? "LED2_OFF" : "LED2_ON")}
            disabled={loading}
            className={`px-4 py-2 rounded ${
              state.led2 
                ? "bg-green-500 hover:bg-green-600" 
                : "bg-gray-300 hover:bg-gray-400"
            }`}
          >
            {state.led2 ? "ON" : "OFF"}
          </Button>
        </div>
        
        {/* Fan Control */}
        <div className="flex items-center justify-between p-4 border rounded">
          <span className="font-medium">Fan</span>
          <Button
            onClick={() => sendCommand(state.fan ? "FAN_OFF" : "FAN_ON")}
            disabled={loading}
            className={`px-4 py-2 rounded ${
              state.fan 
                ? "bg-green-500 hover:bg-green-600" 
                : "bg-gray-300 hover:bg-gray-400"
            }`}
          >
            {state.fan ? "ON" : "OFF"}
          </Button>
        </div>
        
        {/* Blink LED 1 */}
        <div className="flex items-center justify-between p-4 border rounded">
          <span className="font-medium">Blink LED 1 (1s)</span>
          <Button
            onClick={() => sendCommand("LED1_BLINK:1000")}
            disabled={loading}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded"
          >
            BLINK
          </Button>
        </div>
      </div>
      
      {/* Current State Display */}
      <div className="mt-6 p-4 bg-gray-50 rounded">
        <h3 className="font-bold mb-2">Current Device State:</h3>
        <div className="grid grid-cols-3 gap-2">
          <div className={`p-2 text-center rounded ${state.led1 ? "bg-green-200" : "bg-gray-200"}`}>
            LED 1: {state.led1 ? "ON" : "OFF"}
          </div>
          <div className={`p-2 text-center rounded ${state.led2 ? "bg-green-200" : "bg-gray-200"}`}>
            LED 2: {state.led2 ? "ON" : "OFF"}
          </div>
          <div className={`p-2 text-center rounded ${state.fan ? "bg-green-200" : "bg-gray-200"}`}>
            FAN: {state.fan ? "ON" : "OFF"}
          </div>
        </div>
      </div>
      
      {loading && (
        <div className="mt-4 text-center text-gray-500">
          Sending command...
        </div>
      )}
    </div>
  );
}
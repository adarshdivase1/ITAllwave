import { GoogleGenAI } from "@google/genai";
import { AVDevice } from "../types";

// Helper to get formatted date
const getTimestamp = () => new Date().toLocaleString();

export const analyzeDeviceIssue = async (device: AVDevice, userQuery?: string): Promise<string> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    return "Error: API Key is missing. Please check your environment configuration.";
  }

  const ai = new GoogleGenAI({ apiKey });

  // Construct a prompt context based on device telemetry
  const context = `
    You are Nexus AI, an expert Enterprise AV Network Engineer and Systems Integrator.
    Your goal is to diagnose issues with Audio-Visual equipment based on telemetry data.
    
    Current Device Telemetry:
    - ID: ${device.id}
    - Name: ${device.name}
    - Model: ${device.manufacturer} ${device.model}
    - Firmware: ${device.firmware}
    - Status: ${device.status}
    - Power: ${device.powerState}
    - Uptime: ${(device.uptimeSeconds / 3600).toFixed(1)} hours
    - Temperature: ${device.temperature.toFixed(1)}°C
    - CPU Load: ${device.cpuLoad.toFixed(1)}%
    - Memory: ${device.memoryUsage.toFixed(1)}%
    - Network: IP ${device.network.ip} / MAC ${device.network.mac}
    
    Recent Logs:
    ${device.logs.map(l => `[${l.timestamp}] [${l.level}] ${l.message} ${l.code ? `(Code: ${l.code})` : ''}`).join('\n')}
    
    Task:
    ${userQuery ? `Answer the user's specific question: "${userQuery}"` : "Analyze the device status and logs. Identify any anomalies, potential root causes, and recommend specific troubleshooting steps (e.g., specific CLI commands, reboot sequence, cable checks)."}
    
    Keep the tone professional, technical but accessible, and concise. Format with Markdown.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-latest',
      contents: context,
    });
    return response.text || "Analysis complete, but no text returned.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Failed to run diagnostic analysis. Please check network connection and API key.";
  }
};

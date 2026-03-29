import { NextResponse } from "next/server";

const HEX_API_KEY = process.env.HEX_API_KEY || "";
const HEX_PROJECT_ID = process.env.HEX_PROJECT_ID || "";

// Data based on BTS Air Travel Consumer Reports, crisis-period elevated rates
const MOCK_DATA = {
  airportCancellations: [
    { airport: "ORD", rate: 8.4 },
    { airport: "JFK", rate: 6.8 },
    { airport: "SFO", rate: 6.2 },
    { airport: "DFW", rate: 4.5 },
    { airport: "ATL", rate: 3.9 },
  ],
  costTrends: [
    { date: "Mar 1", cost: 285 },
    { date: "Mar 5", cost: 310 },
    { date: "Mar 9", cost: 345 },
    { date: "Mar 13", cost: 320 },
    { date: "Mar 17", cost: 380 },
    { date: "Mar 21", cost: 410 },
    { date: "Mar 25", cost: 435 },
    { date: "Mar 29", cost: 395 },
  ],
  disruptionCauses: [
    { name: "Weather", value: 35 },
    { name: "Staffing/ATC", value: 30 },
    { name: "Mechanical", value: 20 },
    { name: "Other", value: 15 },
  ],
  stats: {
    totalCanceled: 140000,
    avgLoss: 280,
    avgSaved: 185,
  },
};

export async function GET() {
  // Attempt Hex API call
  if (HEX_API_KEY && HEX_PROJECT_ID) {
    try {
      const res = await fetch(
        `https://app.hex.tech/api/v1/run/${HEX_PROJECT_ID}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${HEX_API_KEY}`,
          },
          body: JSON.stringify({ inputParams: {} }),
        }
      );
      if (res.ok) {
        const hexData = await res.json();
        if (hexData?.data) {
          return NextResponse.json(hexData.data);
        }
      }
    } catch {
      // Fall through to mock data
    }
  }

  return NextResponse.json(MOCK_DATA);
}

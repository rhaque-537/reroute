import { NextResponse } from "next/server";

const HEX_API_KEY = process.env.HEX_API_KEY || "";
const HEX_PROJECT_ID = process.env.HEX_PROJECT_ID || "";

const MOCK_DATA = {
  airportCancellations: [
    { airport: "JFK", rate: 18.2 },
    { airport: "LAX", rate: 14.7 },
    { airport: "ORD", rate: 22.1 },
    { airport: "DFW", rate: 11.3 },
    { airport: "ATL", rate: 16.8 },
  ],
  costTrends: [
    { date: "Mar 1", cost: 245 },
    { date: "Mar 5", cost: 267 },
    { date: "Mar 9", cost: 312 },
    { date: "Mar 13", cost: 289 },
    { date: "Mar 17", cost: 334 },
    { date: "Mar 21", cost: 356 },
    { date: "Mar 25", cost: 378 },
    { date: "Mar 29", cost: 341 },
  ],
  disruptionCauses: [
    { name: "TSA Staffing", value: 34 },
    { name: "Weather", value: 28 },
    { name: "Mechanical", value: 22 },
    { name: "Other", value: 16 },
  ],
  stats: {
    totalCanceled: 12847,
    avgLoss: 340,
    avgSaved: 247,
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

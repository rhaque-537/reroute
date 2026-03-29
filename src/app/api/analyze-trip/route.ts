import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { origin = "JFK", destination = "DFW", date = "2026-04-02" } = body;

  const riskData = {
    origin,
    destination,
    date,
    disruptionProbability: 0.34,
    weatherRisk: "moderate",
    tsaStaffingStatus: "critical",
    tsaStaffingLevel: 0.72,
    historicalCancellationRate: 0.12,
    recommendedActions: [
      "Book flexible fare with free cancellation",
      "Identify backup transportation (bus/train routes)",
      "Set up flight alerts for real-time monitoring",
      "Consider travel insurance for this route",
      "Arrive at airport 3 hours early due to TSA staffing levels",
    ],
    alternativeRoutes: [
      { mode: "flight", via: "CLT", addedTime: "1.5h", risk: "low" },
      { mode: "train", via: "Amtrak", addedTime: "10h", risk: "none" },
      { mode: "bus", via: "Greyhound", addedTime: "6h", risk: "none" },
    ],
    alerts: [
      "TSA staffing at JFK currently at 72% — expect longer security lines",
      "American Airlines has canceled 12% of DFW-bound flights this week",
    ],
  };

  return NextResponse.json(riskData);
}

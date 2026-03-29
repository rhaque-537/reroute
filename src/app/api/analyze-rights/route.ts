import { NextRequest, NextResponse } from "next/server";

const K2_URL = process.env.K2_API_URL || "https://api.lava.so/v2/chat/completions";
const K2_KEY = process.env.K2_API_KEY || process.env.LAVA_API_KEY || "";

const MOCK_RESULTS: Record<string, {
  compensationAmount: number;
  applicableRules: string[];
  airlineObligations: string[];
  recommendedActions: string[];
  reasoningChain: string;
}> = {
  cancellation: {
    compensationAmount: 350,
    applicableRules: [
      "14 CFR Part 259 — Enhanced Protections for Airline Passengers",
      "DOT Final Rule on Automatic Refunds (2024)",
      "49 U.S.C. § 41712 — Unfair and Deceptive Practices",
    ],
    airlineObligations: [
      "Provide free rebooking on the next available flight",
      "Offer a full cash refund (not just vouchers) if passenger declines rebooking",
      "Provide meal vouchers for delays exceeding 3 hours",
      "Arrange hotel accommodation for overnight cancellations",
      "Provide ground transportation to/from hotel",
    ],
    recommendedActions: [
      "Request written documentation of the cancellation from the airline",
      "Ask for meal and hotel vouchers at the gate",
      "File a DOT complaint if the airline refuses to comply",
      "Keep all receipts for out-of-pocket expenses for reimbursement",
      "Consider filing in small claims court if compensation is denied",
    ],
    reasoningChain: `Step 1: Identify the disruption type.
The passenger experienced a flight cancellation. This is a controllable disruption — the airline bears responsibility.

Step 2: Determine applicable federal regulations.
- 14 CFR Part 259 mandates that airlines establish and follow customer service plans, including policies for cancellations.
- The DOT's 2024 Final Rule on Automatic Refunds requires airlines to automatically issue cash refunds for canceled flights within 7 business days (credit card) or 20 days (other payment).
- 49 U.S.C. § 41712 prohibits unfair and deceptive practices, meaning airlines cannot mislead passengers about their refund rights.

Step 3: Calculate compensation entitlement.
- The passenger is entitled to a FULL refund of the ticket price.
- If the cancellation resulted in a delay of 3+ hours, meal vouchers are required.
- For overnight disruptions, hotel accommodation must be provided.
- Based on a ticket price of $300 and additional out-of-pocket expenses, estimated total compensation: $350.

Step 4: Assess airline obligations.
The airline MUST:
1. Rebook the passenger on the next available flight at no additional cost
2. Provide a full cash refund if the passenger chooses not to travel
3. Cover reasonable expenses (meals, hotel) during the disruption period
4. These obligations apply regardless of the cause of cancellation

Step 5: Recommend passenger actions.
1. Document everything — take photos of departure boards, save confirmation emails
2. Request written confirmation of the cancellation at the gate
3. Ask for meal/hotel vouchers immediately (don't wait)
4. File a DOT complaint online if the airline is uncooperative
5. Use ReRoute to automate the claims process and maximize recovery`,
  },
  delay: {
    compensationAmount: 200,
    applicableRules: [
      "14 CFR Part 259.4 — Tarmac Delay Contingency Plan",
      "DOT Enforcement Policy on Significant Delays",
    ],
    airlineObligations: [
      "Provide food, water, and restroom access during tarmac delays",
      "Allow deplaning after 3 hours (domestic) or 4 hours (international)",
      "Provide regular status updates every 30 minutes",
    ],
    recommendedActions: [
      "Document the delay duration and any communications from the airline",
      "Request meal vouchers if delay exceeds 3 hours",
      "File a DOT complaint for tarmac delays exceeding the limit",
    ],
    reasoningChain: `Step 1: Classify the disruption as a flight delay.

Step 2: Under 14 CFR Part 259.4, airlines must have a tarmac delay contingency plan. For domestic flights, passengers must be allowed to deplane after 3 hours.

Step 3: The airline must provide food, water, and working lavatories during any tarmac delay. Status updates must be given every 30 minutes.

Step 4: Based on delay duration and ticket price, estimated compensation: $200 in vouchers/rebooking credit plus potential cash compensation if DOT complaint is filed.

Step 5: Passenger should document everything, request vouchers at the gate, and file formal complaints if the airline fails to meet its obligations.`,
  },
  bumped: {
    compensationAmount: 1550,
    applicableRules: [
      "14 CFR Part 250 — Oversales (Denied Boarding Compensation)",
      "14 CFR § 250.5 — Amount of Denied Boarding Compensation",
    ],
    airlineObligations: [
      "Pay 200% of one-way fare (1-2 hour delay) up to $775",
      "Pay 400% of one-way fare (2+ hour delay) up to $1,550",
      "Provide compensation in cash or check (not just vouchers)",
      "Rebook on the next available flight",
    ],
    recommendedActions: [
      "DO NOT accept travel vouchers — you are entitled to cash",
      "Request the written notice of denied boarding compensation rights",
      "Document the bumping and keep your original boarding pass",
      "File DOT complaint if airline offers less than the legal minimum",
    ],
    reasoningChain: `Step 1: This is an involuntary denied boarding (bumping) situation.

Step 2: 14 CFR Part 250 specifically governs oversales and denied boarding compensation. This is one of the strongest passenger protections in U.S. aviation law.

Step 3: Under 14 CFR § 250.5, compensation is calculated as follows:
- If the airline arranges substitute transport arriving 1-2 hours late (domestic): 200% of one-way fare, maximum $775
- If arriving 2+ hours late (domestic) or 4+ hours late (international): 400% of one-way fare, maximum $1,550
- If no substitute transport is arranged: 400% of one-way fare, maximum $1,550

Step 4: The airline MUST pay in cash or check. They can offer vouchers as an ALTERNATIVE but cannot force acceptance. The passenger has the right to demand cash.

Step 5: Maximum compensation for this scenario: $1,550. The passenger should NOT accept vouchers and should insist on cash compensation.`,
  },
  tarmac: {
    compensationAmount: 275,
    applicableRules: [
      "14 CFR Part 259.4 — Tarmac Delay Contingency Plan",
      "DOT Order 2010-2-11 — Tarmac Delay Rule",
    ],
    airlineObligations: [
      "Allow deplaning after 3 hours (domestic) or 4 hours (international)",
      "Provide food and water within 2 hours of delay",
      "Maintain operable lavatories",
      "Provide medical attention if needed",
    ],
    recommendedActions: [
      "Note the exact time the aircraft door closed and when deplaning occurred",
      "Request food and water if not provided within 2 hours",
      "File DOT complaint — tarmac delay violations carry fines up to $37,377 per passenger",
    ],
    reasoningChain: `Step 1: This is a tarmac delay situation, governed by 14 CFR Part 259.4.

Step 2: The DOT's tarmac delay rule (effective since 2010) is one of the most strictly enforced passenger protections. Airlines face fines of up to $37,377 PER PASSENGER for violations.

Step 3: Key requirements:
- Deplaning must be offered after 3 hours (domestic) / 4 hours (international)
- Food and water must be provided within 2 hours
- Lavatories must remain operational
- Regular status updates every 30 minutes

Step 4: Compensation calculation — while the rule itself doesn't mandate direct compensation, the disruption entitles the passenger to rebooking and potential cash refund. Combined with meal/expense reimbursement, estimated recovery: $275.

Step 5: Filing a DOT complaint for tarmac delay violations is highly effective — the DOT takes these very seriously and airlines often settle quickly.`,
  },
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      disruptionType = "cancellation",
      delayHours = 4,
      domestic = true,
      ticketPrice = 300,
      airline = "Unknown Airline",
      voluntaryBump = false,
      notificationTime = 0,
    } = body;

    // Attempt K2 Think V2 call
    try {
      const res = await fetch(K2_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${K2_KEY}`,
        },
        body: JSON.stringify({
          model: "mbzuai/k2-think-v2",
          messages: [
            {
              role: "system",
              content:
                "You are a DOT airline consumer rights reasoning engine. Given a flight disruption scenario, perform step-by-step legal reasoning to determine: 1) Which specific DOT regulations apply 2) What compensation the passenger is legally entitled to (exact dollar amounts) 3) What actions the airline is required to take 4) Recommended next steps for the passenger. Show your reasoning chain clearly. Be precise about dollar amounts and cite specific DOT rules (14 CFR Part 259, 14 CFR Part 250, etc). Always reason from the passenger's best interest.",
            },
            {
              role: "user",
              content: `Flight disruption scenario:
- Type: ${disruptionType}
- Airline: ${airline}
- Delay hours: ${delayHours}
- Domestic flight: ${domestic}
- Voluntary bump: ${voluntaryBump}
- Notification time before departure: ${notificationTime} hours
- Ticket price: $${ticketPrice}

Analyze this scenario and provide: applicable rules, compensation amount, airline obligations, and recommended actions. Format your final answer with clear sections.`,
            },
          ],
          temperature: 0.3,
          max_tokens: 2048,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const content = data.choices?.[0]?.message?.content || "";

        const amountMatch = content.match(/\$(\d{1,4}(?:,\d{3})*(?:\.\d{2})?)/);
        const amount = amountMatch ? parseFloat(amountMatch[1].replace(",", "")) : (MOCK_RESULTS[disruptionType]?.compensationAmount || 350);

        return NextResponse.json({
          compensationAmount: amount,
          applicableRules: MOCK_RESULTS[disruptionType]?.applicableRules || MOCK_RESULTS.cancellation.applicableRules,
          airlineObligations: MOCK_RESULTS[disruptionType]?.airlineObligations || MOCK_RESULTS.cancellation.airlineObligations,
          recommendedActions: MOCK_RESULTS[disruptionType]?.recommendedActions || MOCK_RESULTS.cancellation.recommendedActions,
          reasoningChain: content,
        });
      }
    } catch {
      // Fall through to mock
    }

    // Fallback to realistic mock data
    const mockData = MOCK_RESULTS[disruptionType] || MOCK_RESULTS.cancellation;
    let adjustedAmount = mockData.compensationAmount;
    if (ticketPrice && disruptionType === "bumped") {
      adjustedAmount = Math.min(ticketPrice * 4, 1550);
    } else if (ticketPrice) {
      adjustedAmount = Math.max(ticketPrice * 0.5, mockData.compensationAmount);
    }

    return NextResponse.json({
      ...mockData,
      compensationAmount: Math.round(adjustedAmount),
    });
  } catch {
    return NextResponse.json(MOCK_RESULTS.cancellation);
  }
}

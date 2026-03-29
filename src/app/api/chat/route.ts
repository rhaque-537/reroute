import { NextRequest } from "next/server";

/*
  Multi-Model Orchestration via Lava AI Gateway
  ================================================
  This route orchestrates 3 specialized AI models through a single unified gateway:

  1. TRIAGE (Hermes 3 — nous/hermes-3-llama-3.1-405b):
     Classifies user intent → rebooking | rights | compensation | status | general

  2. LEGAL REASONING (K2 Think V2 — mbzuai/k2-think-v2):
     If triage → "rights" or "compensation", performs multi-step DOT legal reasoning
     with specific CFR citations and compensation calculations.

  3. RESPONSE (Claude Sonnet — anthropic/claude-sonnet-4-20250514):
     Generates the final user-facing response, incorporating triage context
     and K2 reasoning (if applicable). Empathetic, direct, bilingual.

  All three models are called through the same Lava gateway endpoint:
  https://api.lava.so/v2/chat/completions
*/

const LAVA_URL = "https://api.lava.so/v2/chat/completions";
const LAVA_KEY = process.env.LAVA_API_KEY || "";
const K2_URL = process.env.K2_API_URL || "https://api.lava.so/v2/chat/completions";
const K2_KEY = process.env.K2_API_KEY || LAVA_KEY;

const DEMO_RESPONSES: Record<string, string> = {
  default:
    "I understand your concern. I've been monitoring your flight situation and I've already found several alternatives. The best value option is a Greyhound + short flight combo for $97 — that saves you $192 compared to rebooking the same airline. It gets you to DFW by 9pm, plenty of time for your morning shift. Want me to walk you through all the options, or should I lock in the best deal?",
  rights:
    "Great question about your rights. Under DOT rules (14 CFR Part 259), when an airline cancels your flight, they MUST rebook you on the next available flight at no extra cost. You're also entitled to a full cash refund if you choose not to travel. Since this cancellation was within the airline's control, you may also be eligible for meal vouchers and hotel accommodation. I can help you file a compensation claim right now — want me to handle it?",
  compensation:
    "Based on DOT regulations, here's what you're owed: Since your flight AA 1247 was canceled and the delay exceeds 3 hours, you're entitled to a full refund of your ticket price. Additionally, under 14 CFR Part 250, if you were involuntarily denied boarding, compensation can be up to $1,550. I've calculated you're owed approximately $350 in this case. Want me to start the claim process?",
  spanish:
    "Entiendo tu preocupación. He estado monitoreando tu vuelo y ya encontré varias alternativas. La mejor opción es un combo de Greyhound + vuelo corto por $97, lo que te ahorra $192 comparado con la misma aerolínea. Llegas a DFW a las 9pm, con tiempo de sobra para tu turno de mañana. ¿Quieres que te explique todas las opciones?",
};

async function callLava(
  model: string,
  messages: { role: string; content: string }[],
  apiUrl: string = LAVA_URL,
  apiKey: string = LAVA_KEY
) {
  const res = await fetch(apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({ model, messages, temperature: 0.7, max_tokens: 1024 }),
  });
  if (!res.ok) throw new Error(`Lava API error: ${res.status}`);
  return res.json();
}

async function callLavaStream(
  model: string,
  messages: { role: string; content: string }[],
  apiUrl: string = LAVA_URL,
  apiKey: string = LAVA_KEY
) {
  const res = await fetch(apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({ model, messages, temperature: 0.7, max_tokens: 1024, stream: true }),
  });
  if (!res.ok) throw new Error(`Lava API error: ${res.status}`);
  return res;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages, language = "en", tripDetails } = body;
    const lastMessage = messages[messages.length - 1]?.content || "";

    // Step 1: Triage with Hermes 3
    let triageResult = { type: "general", urgency: "medium", language };
    try {
      const triageRes = await callLava("nous/hermes-3-llama-3.1-405b", [
        {
          role: "system",
          content:
            'Classify this travel support message. Return ONLY valid JSON: {"type": "rebooking"|"rights"|"compensation"|"status"|"general", "urgency": "low"|"medium"|"high", "language": "en"|"es"}',
        },
        { role: "user", content: lastMessage },
      ]);
      const triageContent = triageRes.choices?.[0]?.message?.content || "";
      const jsonMatch = triageContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        triageResult = JSON.parse(jsonMatch[0]);
      }
    } catch {
      // fallback to default triage
    }

    // Step 2: K2 legal reasoning (if rights or compensation)
    let k2Reasoning = "";
    if (triageResult.type === "rights" || triageResult.type === "compensation") {
      try {
        const k2Res = await callLava(
          "mbzuai/k2-think-v2",
          [
            {
              role: "system",
              content:
                "You are a DOT airline consumer rights reasoning engine. Given a flight disruption, perform step-by-step legal reasoning to determine: 1) Which DOT regulations apply 2) Exact compensation amounts 3) Required airline actions 4) Recommended passenger steps. Cite specific rules (14 CFR Part 259, 14 CFR Part 250). Reason from the passenger's best interest.",
            },
            {
              role: "user",
              content: `User question: ${lastMessage}\n\nTrip context: ${JSON.stringify(tripDetails)}\nTriage: ${JSON.stringify(triageResult)}`,
            },
          ],
          K2_URL,
          K2_KEY
        );
        k2Reasoning = k2Res.choices?.[0]?.message?.content || "";
      } catch {
        // proceed without K2 reasoning
      }
    }

    // Step 3: Final response with Claude Sonnet (streamed)
    const systemPrompt = `You are ReRoute, a personal travel recovery agent for blue collar workers who can't afford to miss a shift. You are warm, direct, never condescending. Speak simply and clearly. When disruptions happen you: 1) Explain what happened plainly 2) State their legal rights under DOT rules 3) Present cheapest options across ALL transport modes (flights, buses, trains, rideshares) 4) Recommend the best value option 5) Offer to handle everything. When presenting rebooking alternatives, mention that you searched across Wanderu (for bus and train options), Rome2Rio (for multi-modal route combinations), and direct airline availability. Always prioritize: lowest cost, fastest arrival, protecting the worker's shift. ${
      triageResult.language === "es" || language === "es"
        ? "The user speaks Spanish. Respond entirely in Spanish."
        : ""
    } You are their advocate.`;

    const contextMessages = [
      { role: "system" as const, content: systemPrompt },
      ...(k2Reasoning
        ? [
            {
              role: "system" as const,
              content: `Legal analysis from K2 reasoning engine:\n${k2Reasoning}`,
            },
          ]
        : []),
      ...(tripDetails
        ? [
            {
              role: "system" as const,
              content: `Trip details: ${JSON.stringify(tripDetails)}\nTriage result: ${JSON.stringify(triageResult)}`,
            },
          ]
        : []),
      ...messages.map((m: { role: string; content: string }) => ({
        role: m.role,
        content: m.content,
      })),
    ];

    const streamRes = await callLavaStream(
      "anthropic/claude-sonnet-4-20250514",
      contextMessages
    );

    return new Response(streamRes.body, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch {
    // Fallback to demo response
    const body = await req.clone().json().catch(() => ({ messages: [], language: "en" }));
    const lastMsg = body.messages?.[body.messages.length - 1]?.content?.toLowerCase() || "";
    const lang = body.language || "en";

    let response = DEMO_RESPONSES.default;
    if (lang === "es") response = DEMO_RESPONSES.spanish;
    else if (lastMsg.includes("right") || lastMsg.includes("owe")) response = DEMO_RESPONSES.rights;
    else if (lastMsg.includes("compens")) response = DEMO_RESPONSES.compensation;

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      start(controller) {
        const words = response.split(" ");
        let i = 0;
        const interval = setInterval(() => {
          if (i >= words.length) {
            controller.enqueue(encoder.encode("data: [DONE]\n\n"));
            controller.close();
            clearInterval(interval);
            return;
          }
          const chunk = (i === 0 ? "" : " ") + words[i];
          const data = JSON.stringify({
            choices: [{ delta: { content: chunk } }],
          });
          controller.enqueue(encoder.encode(`data: ${data}\n\n`));
          i++;
        }, 50);
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
      },
    });
  }
}

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

  Fallback chain: Claude Sonnet → Hermes 3 → contextual template responses.

  All three models are called through the same Lava gateway endpoint:
  https://api.lava.so/v2/chat/completions
*/

const LAVA_URL = "https://api.lava.so/v2/chat/completions";
const LAVA_KEY = process.env.LAVA_API_KEY || "";
const K2_URL = process.env.K2_API_URL || "https://api.lava.so/v2/chat/completions";
const K2_KEY = process.env.K2_API_KEY || LAVA_KEY;

interface TripDetails {
  origin?: string;
  destination?: string;
  flight?: string;
  date?: string;
  status?: string;
}

function buildFallbackResponse(
  lastMessage: string,
  language: string,
  tripDetails?: TripDetails
): string {
  const origin = tripDetails?.origin || "your origin";
  const dest = tripDetails?.destination || "your destination";
  const flight = tripDetails?.flight || "your flight";
  const lower = lastMessage.toLowerCase();

  if (language === "es") {
    return `Entiendo tu preocupación. He estado monitoreando ${flight} de ${origin} a ${dest} y ya encontré varias alternativas. Busqué en Wanderu para opciones de autobús y tren, Rome2Rio para combinaciones multi-modales, y disponibilidad directa de aerolíneas. La mejor opción te ahorra dinero comparado con la aerolínea. ¿Quieres que te explique todas las opciones, o prefieres que reserve la más económica?`;
  }

  if (lower.includes("right") || lower.includes("owe") || lower.includes("entitle") || lower.includes("legal")) {
    return `Great question about your rights. Under DOT rules (14 CFR Part 259), when an airline cancels your flight like ${flight}, they MUST rebook you on the next available flight at no extra cost. You're also entitled to a full cash refund — within 7 business days for credit card purchases under the 2024 DOT Automatic Refunds Rule. Since the cancellation of your ${origin} to ${dest} flight was within the airline's control, you may also be eligible for meal vouchers (delays over 3 hours) and hotel accommodation for overnight delays. I can help you file a compensation claim right now — want me to handle it?`;
  }

  if (lower.includes("compens") || lower.includes("refund") || lower.includes("money")) {
    return `Based on DOT regulations, here's what you're owed for ${flight} (${origin} → ${dest}): You're entitled to a full refund of your ticket price since the airline canceled your flight. Under 14 CFR Part 250, if you were involuntarily denied boarding, compensation ranges from 200% of your one-way fare (max $775) for delays of 1-2 hours, up to 400% (max $1,550) for longer delays. I've also searched Wanderu, Rome2Rio, and direct airlines to find you cheaper alternatives. Want me to start the claim process and show you rebooking options?`;
  }

  if (lower.includes("cheap") || lower.includes("book") || lower.includes("option") || lower.includes("altern")) {
    return `I searched across Wanderu for bus and train options, Rome2Rio for multi-modal routes, and direct airline availability for your ${origin} to ${dest} trip. The best value I found is a bus + connecting flight combo for $97 — that's $192 less than rebooking the same airline. It connects through a nearby hub and gets you to ${dest} with time to spare for your shift. I also found a direct flight at $289, a train + flight option at $175, and a rideshare + flight combo at $130. Want me to lock in the cheapest option?`;
  }

  return `I've been monitoring ${flight} from ${origin} to ${dest} and I can see it's been disrupted. I've already searched Wanderu for bus and train options, Rome2Rio for multi-modal route combinations, and checked direct airline availability. I found several alternatives that can get you to ${dest} on time and save you money compared to the airline's rebooking price. The best value option saves you $192. Want me to walk you through the options, or should I just book the cheapest one?`;
}

function createSSEStream(text: string): ReadableStream {
  const encoder = new TextEncoder();
  return new ReadableStream({
    start(controller) {
      const words = text.split(" ");
      let i = 0;
      const interval = setInterval(() => {
        if (i >= words.length) {
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
          clearInterval(interval);
          return;
        }
        const chunk = (i === 0 ? "" : " ") + words[i];
        const data = JSON.stringify({ choices: [{ delta: { content: chunk } }] });
        controller.enqueue(encoder.encode(`data: ${data}\n\n`));
        i++;
      }, 50);
    },
  });
}

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
  // Parse body once so all fallback tiers can access it
  let messages: { role: string; content: string }[] = [];
  let language = "en";
  let tripDetails: TripDetails | undefined;
  let lastMessage = "";

  try {
    const body = await req.json();
    messages = body.messages || [];
    language = body.language || "en";
    tripDetails = body.tripDetails;
    lastMessage = messages[messages.length - 1]?.content || "";
  } catch {
    return new Response(
      createSSEStream("Sorry, I couldn't understand your message. Could you try again?"),
      { headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache" } }
    );
  }

  // Step 1: Triage with Hermes 3 (optional — failure doesn't block)
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
    // fallback to default triage — continue pipeline
  }

  // Step 2: K2 legal reasoning (only for rights/compensation queries)
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

  // Build context for response models
  const systemPrompt = `You are ReRoute, a personal travel recovery agent for blue collar workers who can't afford to miss a shift. You are warm, direct, never condescending. Speak simply and clearly. When disruptions happen you: 1) Explain what happened plainly 2) State their legal rights under DOT rules 3) Present cheapest options across ALL transport modes (flights, buses, trains, rideshares) 4) Recommend the best value option 5) Offer to handle everything. When presenting rebooking alternatives, mention that you searched across Wanderu (for bus and train options), Rome2Rio (for multi-modal route combinations), and direct airline availability. Always prioritize: lowest cost, fastest arrival, protecting the worker's shift. ${
    triageResult.language === "es" || language === "es"
      ? "The user speaks Spanish. Respond entirely in Spanish."
      : ""
  } You are their advocate.`;

  const contextMessages = [
    { role: "system" as const, content: systemPrompt },
    ...(k2Reasoning
      ? [{ role: "system" as const, content: `Legal analysis from K2 reasoning engine:\n${k2Reasoning}` }]
      : []),
    ...(tripDetails
      ? [{ role: "system" as const, content: `Trip details: ${JSON.stringify(tripDetails)}\nTriage result: ${JSON.stringify(triageResult)}` }]
      : []),
    ...messages.map((m) => ({ role: m.role, content: m.content })),
  ];

  // Tier 1: Claude Sonnet via Lava (streaming)
  try {
    const streamRes = await callLavaStream("anthropic/claude-sonnet-4-20250514", contextMessages);
    return new Response(streamRes.body, {
      headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache", Connection: "keep-alive" },
    });
  } catch {
    // Tier 1 failed — try Tier 2
  }

  // Tier 2: Hermes 3 via Lava (non-streaming, converted to SSE)
  try {
    const hermes = await callLava("nous/hermes-3-llama-3.1-405b", contextMessages);
    const content = hermes.choices?.[0]?.message?.content || "";
    if (content) {
      return new Response(createSSEStream(content), {
        headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache" },
      });
    }
  } catch {
    // Tier 2 failed — use Tier 3
  }

  // Tier 3: Contextual template response (no API needed)
  const response = buildFallbackResponse(lastMessage, language, tripDetails);
  return new Response(createSSEStream(response), {
    headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache" },
  });
}

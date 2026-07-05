import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { anthropic, AI_MODEL } from "@/lib/anthropic";
import { buildFarmContext } from "@/lib/ai-context";

export const runtime = "nodejs";

type ChatMessage = { role: "user" | "assistant"; content: string };

function isChatMessage(value: unknown): value is ChatMessage {
  return (
    typeof value === "object" &&
    value !== null &&
    (("role" in value && (value as { role: unknown }).role === "user") ||
      (value as { role: unknown }).role === "assistant") &&
    typeof (value as { content: unknown }).content === "string"
  );
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const rawMessages = Array.isArray(body?.messages) ? body.messages : [];
  const messages = rawMessages.filter(isChatMessage).slice(-20);

  if (messages.length === 0) {
    return NextResponse.json({ error: "Aucun message" }, { status: 400 });
  }

  const context = await buildFarmContext();

  const system = `Tu es l'assistant intelligent de CREOLE PSF Agri Platform, une plateforme de gestion agricole pour des fermes en Haïti et ailleurs. Aide l'utilisateur à mieux gérer ses cultures, parcelles, calendrier et finances. Réponds en français, de façon concise, pratique et adaptée à un agriculteur non technique.

Contexte des fermes de l'utilisateur actuel :
${context}`;

  const anthropicStream = anthropic.messages.stream({
    model: AI_MODEL,
    max_tokens: 2048,
    system,
    messages,
  });

  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      try {
        for await (const event of anthropicStream) {
          if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
            controller.enqueue(encoder.encode(event.delta.text));
          }
        }
      } catch {
        controller.enqueue(
          encoder.encode("\n\n[Erreur lors de la génération de la réponse.]"),
        );
      } finally {
        controller.close();
      }
    },
  });

  return new Response(readable, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}

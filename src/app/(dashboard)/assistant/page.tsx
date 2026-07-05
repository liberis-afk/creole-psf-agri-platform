"use client";

import { useState } from "react";

type ChatMessage = { role: "user" | "assistant"; content: string };

export default function AssistantPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || loading) return;

    const nextMessages: ChatMessage[] = [...messages, { role: "user", content: text }];
    setMessages([...nextMessages, { role: "assistant", content: "" }]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages }),
      });

      if (!res.ok || !res.body) {
        throw new Error("request failed");
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let assistantText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        assistantText += decoder.decode(value, { stream: true });
        const textSoFar = assistantText;
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = { role: "assistant", content: textSoFar };
          return updated;
        });
      }
    } catch {
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          role: "assistant",
          content: "Désolé, une erreur est survenue.",
        };
        return updated;
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex h-[calc(100vh-3rem)] flex-col gap-4">
      <div>
        <h1 className="text-2xl font-semibold">Assistant IA</h1>
        <p className="text-sm opacity-70">
          Posez vos questions sur vos cultures, parcelles ou pratiques agricoles.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto rounded border border-black/10 p-4 dark:border-white/10">
        {messages.length === 0 ? (
          <p className="text-sm opacity-70">
            Exemple : « Quand dois-je récolter mon maïs planté le 1er juin ? »
          </p>
        ) : (
          <div className="flex flex-col gap-4">
            {messages.map((m, i) => (
              <div key={i} className={m.role === "user" ? "text-right" : "text-left"}>
                <p
                  className={`inline-block max-w-[80%] whitespace-pre-wrap rounded px-3 py-2 text-sm ${
                    m.role === "user"
                      ? "bg-foreground text-background"
                      : "bg-black/5 dark:bg-white/10"
                  }`}
                >
                  {m.content || "…"}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      <form onSubmit={sendMessage} className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Écrivez votre question..."
          className="flex-1 rounded border border-black/20 px-3 py-2 dark:border-white/20"
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded bg-foreground px-4 py-2 text-background disabled:opacity-50"
        >
          {loading ? "..." : "Envoyer"}
        </button>
      </form>
    </div>
  );
}

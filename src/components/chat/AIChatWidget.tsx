"use client";

import { useState, useRef, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const INITIAL_MESSAGE: Message = {
  role: "assistant",
  content: "Olá! 👋 Sou seu assistente de pratos. Me diga o que você está com vontade de comer e eu recomendo algo do nosso cardápio!",
};

const LOGIN_MESSAGE: Message = {
  role: "assistant",
  content: "Para receber recomendações personalizadas, você precisa estar logado. 🔐\n\nFaça login para continuar!",
};

export function AIChatWidget() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const isLoggedIn = status === "authenticated" && !!session?.user;

  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Atualiza mensagem inicial conforme status de login
  useEffect(() => {
    setMessages([isLoggedIn ? INITIAL_MESSAGE : LOGIN_MESSAGE]);
  }, [isLoggedIn]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    if (open && isLoggedIn) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [open, isLoggedIn]);

  async function sendMessage() {
    const text = input.trim();
    if (!text || loading) return;

    const userMessage: Message = { role: "user", content: text };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    const history = newMessages.slice(1).map((m) => ({
      role: m.role,
      content: m.content,
    }));

    try {
      const response = await fetch("/api/chat/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, history: history.slice(0, -1) }),
      });

      if (!response.ok) throw new Error("Erro na resposta");

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantText = "";

      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      while (reader) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n").filter((l) => l.startsWith("data: "));

        for (const line of lines) {
          const data = line.replace("data: ", "").trim();
          if (data === "[DONE]") break;

          try {
            const parsed = JSON.parse(data);
            const delta = parsed.choices?.[0]?.delta?.content ?? "";
            assistantText += delta;

            setMessages((prev) => {
              const updated = [...prev];
              updated[updated.length - 1] = {
                role: "assistant",
                content: assistantText,
              };
              return updated;
            });
          } catch {
            // chunk parcial, ignora
          }
        }
      }
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Desculpe, ocorreu um erro. Tente novamente em instantes. 😕",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") sendMessage();
  }

  return (
    <>
      {/* Botão flutuante */}
      <button
        onClick={() => setOpen((prev) => !prev)}
        aria-label="Abrir assistente de pratos"
        style={{
          position: "fixed",
          bottom: "24px",
          right: "24px",
          zIndex: 1000,
          width: "56px",
          height: "56px",
          borderRadius: "50%",
          background: "linear-gradient(135deg, #f97316, #ea580c)",
          border: "none",
          cursor: "pointer",
          boxShadow: "0 4px 20px rgba(249,115,22,0.45)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "transform 0.2s, box-shadow 0.2s",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.transform = "scale(1.08)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)";
        }}
      >
        {open ? (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2a5 5 0 0 1 5 5c0 1.5-.6 2.8-1.6 3.8L15 20H9l-.4-9.2A5 5 0 0 1 7 7a5 5 0 0 1 5-5z" />
            <line x1="9" y1="20" x2="15" y2="20" />
            <line x1="12" y1="12" x2="12" y2="15" />
          </svg>
        )}
      </button>

      {/* Painel do chat */}
      {open && (
        <div
          style={{
            position: "fixed",
            bottom: "90px",
            right: "24px",
            zIndex: 999,
            width: "360px",
            maxWidth: "calc(100vw - 48px)",
            height: "480px",
            borderRadius: "16px",
            background: "#fff",
            boxShadow: "0 8px 40px rgba(0,0,0,0.18)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            animation: "slideUp 0.22s ease",
          }}
        >
          {/* Header */}
          <div
            style={{
              background: "linear-gradient(135deg, #f97316, #ea580c)",
              padding: "16px 18px",
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                background: "rgba(255,255,255,0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "18px",
              }}
            >
              🍽️
            </div>
            <div>
              <div style={{ color: "#fff", fontWeight: 700, fontSize: "14px", lineHeight: 1.2 }}>
                Assistente Culinário
              </div>
              <div style={{ color: "rgba(255,255,255,0.8)", fontSize: "11px" }}>
                {isLoggedIn ? "Recomendações personalizadas" : "Faça login para continuar"}
              </div>
            </div>
          </div>

          {/* Mensagens */}
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "16px",
              display: "flex",
              flexDirection: "column",
              gap: "12px",
              background: "#fafafa",
            }}
          >
            {messages.map((msg, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
                }}
              >
                <div
                  style={{
                    maxWidth: "80%",
                    padding: "10px 14px",
                    borderRadius: msg.role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                    background: msg.role === "user" ? "linear-gradient(135deg, #f97316, #ea580c)" : "#fff",
                    color: msg.role === "user" ? "#fff" : "#1a1a1a",
                    fontSize: "13.5px",
                    lineHeight: "1.5",
                    boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                  }}
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {/* Botão de login quando não autenticado */}
            {!isLoggedIn && status !== "loading" && (
              <div style={{ display: "flex", justifyContent: "flex-start" }}>
                <button
                  onClick={() => router.push("/login")}
                  style={{
                    padding: "10px 20px",
                    borderRadius: "10px",
                    border: "none",
                    background: "linear-gradient(135deg, #f97316, #ea580c)",
                    color: "#fff",
                    fontSize: "13.5px",
                    fontWeight: 600,
                    cursor: "pointer",
                    boxShadow: "0 2px 8px rgba(249,115,22,0.35)",
                    transition: "opacity 0.15s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")}
                  onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
                >
                  Fazer login →
                </button>
              </div>
            )}

            {/* Indicador de digitação */}
            {loading && (
              <div style={{ display: "flex", justifyContent: "flex-start" }}>
                <div
                  style={{
                    padding: "10px 16px",
                    borderRadius: "16px 16px 16px 4px",
                    background: "#fff",
                    boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
                    display: "flex",
                    gap: "4px",
                    alignItems: "center",
                  }}
                >
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      style={{
                        width: "7px",
                        height: "7px",
                        borderRadius: "50%",
                        background: "#f97316",
                        display: "inline-block",
                        animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Input — só aparece se logado */}
          {isLoggedIn ? (
            <div
              style={{
                padding: "12px 14px",
                borderTop: "1px solid #f0f0f0",
                display: "flex",
                gap: "8px",
                background: "#fff",
              }}
            >
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ex: quero algo leve e barato..."
                disabled={loading}
                style={{
                  flex: 1,
                  border: "1.5px solid #e5e7eb",
                  borderRadius: "10px",
                  padding: "9px 13px",
                  fontSize: "13.5px",
                  outline: "none",
                  transition: "border-color 0.15s",
                  color: "#1a1a1a",
                  background: loading ? "#f9f9f9" : "#fff",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#f97316")}
                onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
              />
              <button
                onClick={sendMessage}
                disabled={loading || !input.trim()}
                style={{
                  width: "38px",
                  height: "38px",
                  borderRadius: "10px",
                  border: "none",
                  background: loading || !input.trim() ? "#e5e7eb" : "linear-gradient(135deg, #f97316, #ea580c)",
                  cursor: loading || !input.trim() ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  transition: "background 0.15s",
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              </button>
            </div>
          ) : (
            <div
              style={{
                padding: "10px 14px",
                borderTop: "1px solid #f0f0f0",
                background: "#fff",
                textAlign: "center",
                fontSize: "11px",
                color: "#9ca3af",
              }}
            >
              Recomendações personalizadas para usuários logados
            </div>
          )}
        </div>
      )}

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(16px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.5; }
          40%            { transform: scale(1);   opacity: 1; }
        }
      `}</style>
    </>
  );
}
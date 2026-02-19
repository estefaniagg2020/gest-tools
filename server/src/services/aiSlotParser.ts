export interface ParsedTimeWindow {
  dayOfWeek: number;
  startHour: number;
  endHour: number;
}

export interface ParsedSlotQuery {
  windows: ParsedTimeWindow[];
  durationMinutes?: number;
}

const SYSTEM_PROMPT = `Eres un asistente para una aplicación española de gestión de citas.
Tu tarea es analizar una descripción en lenguaje natural de la disponibilidad horaria de un cliente y convertirla en un JSON estructurado.

El cliente puede describir su disponibilidad con frases como:
- "lunes y martes de 10 a 14, miércoles de 8 a 10"
- "monday and wednesday from 9 to 11"
- "dilluns i dimarts de 10 a 14"
- "disponible los martes por la mañana y viernes por la tarde"

Responde ÚNICAMENTE con un JSON válido, sin markdown, sin explicaciones fuera del JSON.

Formato de respuesta:
{
  "windows": [
    { "dayOfWeek": 1, "startHour": 10, "endHour": 14 },
    { "dayOfWeek": 3, "startHour": 8, "endHour": 10 }
  ],
  "durationMinutes": 60
}

Reglas:
- dayOfWeek: 0=domingo, 1=lunes, 2=martes, 3=miércoles, 4=jueves, 5=viernes, 6=sábado
- startHour y endHour: números decimales en formato 24h (ej: 9.5 = 9:30, 14 = 14:00)
- durationMinutes: duración de la cita si se menciona, si no se menciona usa 60
- Si se menciona "mañana" usa 9-13, "tarde" usa 15-20, "mediodía" usa 13-15
- Genera una entrada por cada combinación día+franja horaria
- Si no puedes interpretar ninguna disponibilidad, devuelve: { "windows": [], "durationMinutes": 60 }`;

const validateAndFilter = (raw: ParsedSlotQuery): ParsedSlotQuery => {
  const validWindows = (raw.windows ?? []).filter(
    (w) =>
      typeof w.dayOfWeek === "number" &&
      w.dayOfWeek >= 0 &&
      w.dayOfWeek <= 6 &&
      typeof w.startHour === "number" &&
      typeof w.endHour === "number" &&
      w.endHour > w.startHour,
  );
  return { windows: validWindows, durationMinutes: raw.durationMinutes ?? 60 };
};

const parseWithGroq = async (text: string, apiKey: string): Promise<ParsedSlotQuery> => {
  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "llama-3.1-8b-instant",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: `Disponibilidad del cliente: "${text}"` },
      ],
      temperature: 0.1,
      max_tokens: 512,
      response_format: { type: "json_object" },
    }),
  });

  if (!response.ok) {
    const err = await response.text().catch(() => "");
    throw new Error(`Groq API error ${response.status}: ${err}`);
  }

  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };

  const rawText = data.choices?.[0]?.message?.content ?? "";
  try {
    return validateAndFilter(JSON.parse(rawText) as ParsedSlotQuery);
  } catch {
    throw new Error("Groq no devolvió JSON válido");
  }
};

const GEMINI_MODELS = [
  "gemini-1.5-flash",
  "gemini-1.5-flash-latest",
  "gemini-1.5-flash-001",
  "gemini-pro",
];

const parseWithGemini = async (text: string, apiKey: string): Promise<ParsedSlotQuery> => {
  let lastError: Error = new Error("Gemini: ningún modelo disponible");

  for (const model of GEMINI_MODELS) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    let response: Response;
    try {
      response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            { parts: [{ text: `${SYSTEM_PROMPT}\n\nDisponibilidad del cliente: "${text}"` }] },
          ],
          generationConfig: { temperature: 0.1, maxOutputTokens: 512 },
        }),
      });
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      continue;
    }

    if (!response.ok) {
      const errText = await response.text().catch(() => "");
      lastError = new Error(`Gemini API error ${response.status} (${model}): ${errText}`);
      continue;
    }

    const data = (await response.json()) as {
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
    };

    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
    const jsonText = rawText.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    try {
      return validateAndFilter(JSON.parse(jsonText) as ParsedSlotQuery);
    } catch {
      lastError = new Error(`Gemini (${model}) no devolvió JSON válido`);
      continue;
    }
  }

  throw lastError;
};

export const parseSlotQueryWithAI = async (text: string): Promise<ParsedSlotQuery> => {
  const groqKey = process.env.GROQ_API_KEY;
  const geminiKey = process.env.GEMINI_API_KEY;

  if (!groqKey && !geminiKey) {
    throw new Error(
      "Configura GROQ_API_KEY en server/.env (gratis en console.groq.com) para usar el buscador de huecos con IA",
    );
  }

  if (groqKey) {
    try {
      return await parseWithGroq(text, groqKey);
    } catch (err) {
      console.error("[aiSlotParser] Groq falló:", err);
      if (!geminiKey) throw err;
      console.warn("[aiSlotParser] Intentando Gemini como fallback...");
    }
  }

  return await parseWithGemini(text, geminiKey!);
};

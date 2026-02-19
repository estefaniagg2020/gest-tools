export interface DiscoveredService {
  id: string;
  name: string;
  duration: number;
  price: number;
  description?: string;
}

export interface DiscoveredCategory {
  id: string;
  label: string;
  icon: string;
  services: DiscoveredService[];
}

export interface DiscoveryResult {
  valid: boolean;
  reason?: string;
  professionId: string;
  professionLabel: string;
  categories: DiscoveredCategory[];
}

const SYSTEM_PROMPT = `Eres un asistente para una aplicación española de gestión de negocios con agenda de citas.
Tu tarea es evaluar si una profesión o tipo de negocio puede gestionar citas o servicios con clientes, y si es así, generar datos de ejemplo útiles.

Responde ÚNICAMENTE con un JSON válido, sin markdown, sin explicaciones fuera del JSON.

Formato de respuesta:
{
  "valid": true,
  "professionLabel": "Nombre normalizado en español",
  "professionId": "slug-en-minusculas-sin-acentos",
  "categories": [
    {
      "id": "slug-categoria",
      "label": "Nombre categoría",
      "icon": "emoji_representativo",
      "services": [
        {
          "id": "slug-servicio",
          "name": "Nombre del servicio",
          "duration": 30,
          "price": 25.00,
          "description": "Descripción breve opcional"
        }
      ]
    }
  ]
}

Si la profesión NO gestiona citas ni servicios con clientes (ej: agricultor, programador freelance, escritor), responde:
{ "valid": false, "reason": "Esta profesión no suele gestionar citas o agenda de clientes", "professionLabel": "", "professionId": "", "categories": [] }

Reglas:
- professionId: slug en minúsculas, sin acentos, sin espacios (usa guiones), máximo 30 caracteres
- 2 a 4 categorías por profesión
- 2 a 5 servicios por categoría
- Precios en euros, realistas para el mercado español
- Duración en minutos (entero)
- IDs únicos: usa prefijo de profesión, ej: "podologia-consulta-general"`;

const slugify = (text: string): string =>
  text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 30);

export const discoverProfessionWithAI = async (
  professionName: string,
): Promise<DiscoveryResult> => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY no configurada en el servidor");
  }

  const url = `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

  const body = {
    contents: [
      {
        parts: [
          {
            text: `${SYSTEM_PROMPT}\n\nProfesión a evaluar: "${professionName}"`,
          },
        ],
      },
    ],
    generationConfig: {
      temperature: 0.3,
      maxOutputTokens: 2048,
    },
  };

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const err = await response.text().catch(() => "");
    throw new Error(`Gemini API error ${response.status}: ${err}`);
  }

  const data = (await response.json()) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };

  const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
  const jsonText = rawText.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

  let result: DiscoveryResult;
  try {
    result = JSON.parse(jsonText) as DiscoveryResult;
  } catch {
    throw new Error("La IA no devolvió JSON válido");
  }

  if (result.valid && result.professionId) {
    result.professionId = slugify(result.professionId || result.professionLabel);
  }

  return result;
};

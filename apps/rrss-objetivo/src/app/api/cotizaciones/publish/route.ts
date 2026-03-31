import { NextResponse } from "next/server";

const WEBHOOK_URL = "https://cesarreyesjaramillo.com/api/webhooks/cotizaciones";
const WEBHOOK_SECRET = "CesarQuotes2026";

const WEBHOOK_HEADERS = {
  "Content-Type": "application/json",
  Authorization: `Bearer ${WEBHOOK_SECRET}`,
};

/**
 * Realiza un fetch preservando headers en caso de redirect.
 * Node.js borra el header Authorization al seguir un redirect automáticamente.
 */
async function fetchWithRedirect(url: string, bodyStr: string, maxRedirects = 5): Promise<Response> {
  let currentUrl = url;

  for (let i = 0; i < maxRedirects; i++) {
    const response = await fetch(currentUrl, {
      method: "POST",
      headers: WEBHOOK_HEADERS,
      body: bodyStr,
      redirect: "manual", // NO seguimos automáticamente para preservar el header
    });

    // 3xx → redirigir manualmente con headers completos
    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get("location");
      if (!location) break;
      currentUrl = location.startsWith("http") ? location : new URL(location, currentUrl).toString();
      console.log(`[Cotizaciones/Publish] Redirect ${response.status} → ${currentUrl}`);
      continue;
    }

    return response;
  }

  throw new Error("Demasiados redirects al llamar al webhook.");
}

/**
 * POST /api/cotizaciones/publish
 * Proxy server-side que reenvía la cotización al webhook externo.
 * Resuelve el bloqueo CORS y el problema de pérdida de Authorization en redirects.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!body.id) {
      return NextResponse.json(
        { success: false, message: "El ID de la cotización es obligatorio." },
        { status: 400 }
      );
    }

    const bodyStr = JSON.stringify(body);
    console.log(`[Cotizaciones/Publish] Enviando cotización ID: ${body.id} → ${WEBHOOK_URL}`);

    const response = await fetchWithRedirect(WEBHOOK_URL, bodyStr);

    const rawText = await response.text();
    console.log(`[Cotizaciones/Publish] Status: ${response.status} | Body: ${rawText.substring(0, 300)}`);

    let resData: any = {};
    try {
      resData = JSON.parse(rawText);
    } catch {
      resData = { message: rawText || `HTTP ${response.status}` };
    }

    if (response.ok && resData.success) {
      return NextResponse.json({ success: true, url: resData.url });
    }

    return NextResponse.json(
      {
        success: false,
        message: resData.message || `Error del servidor remoto: ${response.status}`,
        debug: { status: response.status, body: rawText.substring(0, 500) },
      },
      { status: response.status }
    );
  } catch (error: any) {
    console.error("[Cotizaciones/Publish] Error:", error.message);
    return NextResponse.json(
      { success: false, message: error.message || "Error interno del servidor." },
      { status: 500 }
    );
  }
}

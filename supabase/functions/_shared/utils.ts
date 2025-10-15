// deno-lint-ignore-file no-explicit-any
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.46.1";
import { encode as encodeHex } from "https://deno.land/std@0.224.0/encoding/hex.ts";

type Json = Record<string, any>;

export const cors = (origin?: string) => {
  const allowedOrigins = [
    "https://marketrepstg.wpenginepowered.com",
    "https://thereport.wpenginepowered.com",
  ];
  const requestOrigin = origin || "";
  const allowedOrigin = allowedOrigins.includes(requestOrigin)
    ? requestOrigin
    : allowedOrigins[0];
  return {
    "access-control-allow-origin": allowedOrigin,
    "access-control-allow-methods": "GET,POST,OPTIONS",
    "access-control-allow-headers": "authorization,content-type,x-admin-token,apikey,x-client-info",
    "access-control-max-age": "86400",
    "access-control-allow-credentials": "true",
    "cache-control": "no-store",
    "content-type": "application/json",
  } as HeadersInit;
};

export const ok = (data: Json, origin?: string) =>
  new Response(JSON.stringify(data), { status: 200, headers: cors(origin) });

export const created = (data: Json, origin?: string) =>
  new Response(JSON.stringify(data), { status: 201, headers: cors(origin) });

export const bad = (msg: string, origin?: string, status = 400) =>
  new Response(JSON.stringify({ error: msg }), { status, headers: cors(origin) });

export const methodNotAllowed = (origin?: string) =>
  bad("method_not_allowed", origin, 405);

export const service = (authHeader?: string) => {
  const url = Deno.env.get("SUPABASE_URL")!;
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  return createClient(url, key, {
    global: authHeader ? { headers: { Authorization: authHeader } } : undefined,
  });
};

export const getUser = async (authHeader?: string) => {
  const url = Deno.env.get("SUPABASE_URL")!;
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supa = createClient(url, key, {
    global: authHeader ? { headers: { Authorization: authHeader } } : undefined,
  });
  const {
    data: { user },
  } = await supa.auth.getUser();
  return user;
};

export const lower = (s?: string | null) => (s || "").toLowerCase();

export const normalizeHeader = (s: string) =>
  s
    .trim()
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .replace(/\s+/g, "_");

export const isActiveMemberFromHubSpot = (val?: string | null) =>
  (val || "").toLowerCase() === "active";

export const requireAdmin = (req: Request) => {
  const token = req.headers.get("x-admin-token");
  const expected = Deno.env.get("ADMIN_TOKEN");
  return !!expected && token === expected;
};

export const json = async (req: Request) => {
  try {
    return await req.json();
  } catch {
    return {};
  }
};

export const sha256Hex = async (...parts: string[]) => {
  const data = new TextEncoder().encode(parts.join("|"));
  const digest = await crypto.subtle.digest("SHA-256", data);
  return new TextDecoder().decode(encodeHex(new Uint8Array(digest)));
};

// Tiny helper to read CSV text from multipart/form-data ("file") or a plain text body
export const readCsvFromRequest = async (req: Request): Promise<string> => {
  const ctype = req.headers.get("content-type") || "";
  if (ctype.includes("multipart/form-data")) {
    const form = await req.formData();
    const f = form.get("file");
    if (f && typeof f !== "string") {
      const b = await f.arrayBuffer();
      return new TextDecoder().decode(b);
    }
    const url = form.get("csv_url");
    if (typeof url === "string" && url.startsWith("http")) {
      const r = await fetch(url);
      return await r.text();
    }
    return "";
  }
  // fallback: read entire body as text
  return await req.text();
};

// super-naive CSV reader (no quotes/escapes support). For MVP / admin-only.
export const parseCsv = (csv: string) => {
  const lines = csv.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length === 0) return { headers: [] as string[], rows: [] as string[][] };
  const headers = lines[0].split(",").map((h) => h.trim());
  const rows = lines.slice(1).map((ln) => ln.split(",").map((v) => v.trim()));
  return { headers, rows };
};

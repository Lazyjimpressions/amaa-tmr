// TMR Supabase Bridge client
// Loads Supabase JS (ESM), handles auth, calls /me, and toggles member-only UI.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.46.1";

const cfg = window.TMR_SB || {};
let supabase = null;

function cacheSet(key, value, ttlSec = 300) {
  try {
    const exp = Date.now() + (ttlSec * 1000);
    sessionStorage.setItem(key, JSON.stringify({ value, exp }));
  } catch {}
}
function cacheGet(key) {
  try {
    const raw = sessionStorage.getItem(key);
    if (!raw) return null;
    const { value, exp } = JSON.parse(raw);
    if (Date.now() > exp) return null;
    return value;
  } catch { return null; }
}

async function initSupabase() {
  if (!cfg.supabaseUrl || !cfg.supabaseAnonKey) {
    console.warn("[TMR] Missing Supabase config");
    return null;
  }
  supabase = createClient(cfg.supabaseUrl, cfg.supabaseAnonKey, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
  });
  return supabase;
}

function showMemberOnly(isMember) {
  const memberBlocks = document.querySelectorAll('[data-tmr-guard="member-only"]');
  const fallbacks    = document.querySelectorAll('[data-tmr-fallback="not-member"]');
  memberBlocks.forEach(el => { el.hidden = !isMember; });
  fallbacks.forEach(el => { el.hidden = isMember; });
}

async function fetchMembership(session) {
  const cacheKey = "tmr_membership_v1";
  const cached = cacheGet(cacheKey);
  if (cached) return cached;

  if (!cfg.efBase) {
    console.warn("[TMR] Missing efBase config");
    return { is_member: false };
  }
  const res = await fetch(`${cfg.efBase}/me`, {
    headers: { authorization: `Bearer ${session?.access_token}` },
  }).catch(() => null);
  if (!res || !res.ok) return { is_member: false };

  const data = await res.json();
  cacheSet(cacheKey, data, cfg.cacheTtlSec || 300);
  return data;
}

async function ensureUI() {
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    // Not logged in
    showMemberOnly(false);
    window.TMRUser = { isLoggedIn: false, isMember: false };
    return;
  }

  const me = await fetchMembership(session);
  const isMember = !!me.is_member;
  showMemberOnly(isMember);
  window.TMRUser = {
    isLoggedIn: true,
    isMember,
    email: me.email || null,
    membership_level: me.membership_level || null
  };
}

function wireLogin() {
  const form = document.getElementById("tmr-login-form");
  if (!form) return;
  const status = form.querySelector(".tmr-login-status");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = new FormData(form).get("email");
    if (!email) return;
    status.textContent = "Sending magic link…";

    const { error } = await supabase.auth.signInWithOtp({
      email: String(email),
      options: { emailRedirectTo: cfg.siteOrigin || window.location.origin }
    });

    if (error) {
      status.textContent = "Error sending link. Please try again.";
      console.error(error);
    } else {
      status.textContent = "Check your inbox for the magic link.";
    }
  });
}

function wireLogout() {
  const btn = document.getElementById("tmr-logout-btn");
  if (!btn) return;
  btn.addEventListener("click", async () => {
    await supabase.auth.signOut();
    sessionStorage.removeItem("tmr_membership_v1");
    window.location.reload();
  });
}

(async function main() {
  await initSupabase();
  if (!supabase) return;

  // handle session changes (e.g., after magic-link)
  supabase.auth.onAuthStateChange(async (_evt, _session) => {
    sessionStorage.removeItem("tmr_membership_v1");
    await ensureUI();
  });

  document.addEventListener("DOMContentLoaded", async () => {
    wireLogin();
    wireLogout();
    await ensureUI();
  });
})();

// Supabase Edge Function: post-comment
// Secrets to set: FIREBASE_PROJECT_ID, HANDLE_SECRET, ADMIN_UIDS (comma-separated Firebase UIDs) (SUPABASE_URL / SERVICE_ROLE_KEY are built in).
// Turn OFF "Verify JWT" for this function: callers send a Firebase token, not a Supabase one.
import { createClient } from "npm:@supabase/supabase-js@2";
import { createRemoteJWKSet, jwtVerify } from "npm:jose@5";

const PROJECT_ID = Deno.env.get("FIREBASE_PROJECT_ID")!;
const HANDLE_SECRET = Deno.env.get("HANDLE_SECRET")!;
const MAX_POSTS_PER_TOPIC = 10;
const ADMIN_UIDS = (Deno.env.get("ADMIN_UIDS") ?? "").split(",").map((s) => s.trim()).filter(Boolean);

const JWKS = createRemoteJWKSet(
  new URL("https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com"),
);
const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const reply = (status: number, data: unknown) =>
  new Response(JSON.stringify(data), { status, headers: { ...CORS, "Content-Type": "application/json" } });

const ADJ = ["Sage", "Swift", "Bold", "Calm", "Bright", "Clever", "Gentle", "Keen", "Lucky", "Noble", "Quiet", "Witty"];
const ANIMALS = ["Falcon", "Lion", "Heron", "Otter", "Zebra", "Eagle", "Panther", "Gazelle", "Owl", "Fox", "Tiger", "Crane"];

// Same student + same topic = same handle. Can't be forged without HANDLE_SECRET.
async function handleFor(uid: string, topicId: string) {
  const key = await crypto.subtle.importKey(
    "raw", new TextEncoder().encode(HANDLE_SECRET), { name: "HMAC", hash: "SHA-256" }, false, ["sign"],
  );
  const sig = new Uint8Array(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(`${uid}:${topicId}`)));
  return `${ADJ[sig[0] % ADJ.length]} ${ANIMALS[sig[1] % ANIMALS.length]} ${(sig[2] % 90) + 10}`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return reply(405, { error: "Method not allowed." });

  let uid: string;
  try {
    const token = (req.headers.get("Authorization") ?? "").replace(/^Bearer\s+/i, "");
    const { payload } = await jwtVerify(token, JWKS, {
      issuer: `https://securetoken.google.com/${PROJECT_ID}`,
      audience: PROJECT_ID,
    });
    uid = payload.sub!;
  } catch {
    return reply(401, { error: "Please log in again." });
  }

  const { action, topic_id, body, text, date, id } = await req.json().catch(() => ({}));

  const isAdmin = ADMIN_UIDS.includes(uid);
  if (action === "whoami") return reply(200, { admin: isAdmin, uid });
  if (typeof action === "string" && action.startsWith("admin_")) {
    if (!isAdmin) return reply(403, { error: "Admins only." });
    if (action === "admin_list") {
      const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Africa/Lagos" }).format(new Date());
      const { data: suggestions } = await admin.from("topic_suggestions").select("id, suggestion, created_at").order("created_at");
      const { data: topics } = await admin.from("topics").select("id, title, release_date").gte("release_date", today).order("release_date");
      return reply(200, { suggestions: suggestions ?? [], topics: topics ?? [] });
    }
    if (action === "admin_add_topic") {
      const title = String(text ?? "").trim();
      const start = new Date(`${date}T00:00:00+01:00`); // topic opens at midnight Lagos time
      if (title.length < 3 || title.length > 200 || !/^\d{4}-\d{2}-\d{2}$/.test(String(date)) || isNaN(start.getTime())) {
        return reply(400, { error: "Enter a title (3 to 200 characters) and a valid date." });
      }
      const closes_at = new Date(start.getTime() + 24 * 3600_000).toISOString(); // closes at the end of its day
      const { error } = await admin.from("topics").insert({ title, release_date: date, closes_at, approved: true });
      if (error) return reply(400, { error: error.code === "23505" ? "A topic is already scheduled for that date." : "Could not add the topic." });
      if (id) await admin.from("topic_suggestions").delete().eq("id", id);
      return reply(200, { ok: true });
    }
    if (action === "admin_delete_suggestion") {
      await admin.from("topic_suggestions").delete().eq("id", id);
      return reply(200, { ok: true });
    }
    if (action === "admin_delete_post") {
      await admin.from("posts").delete().eq("id", id);
      return reply(200, { ok: true });
    }
    return reply(400, { error: "Unknown admin action." });
  }


  if (action === "suggest") {
    const s = String(text ?? "").trim();
    if (s.length < 3 || s.length > 200) return reply(400, { error: "Suggestions must be 3 to 200 characters." });
    const { error } = await admin.from("topic_suggestions").insert({ uid, suggestion: s });
    return error ? reply(500, { error: "Could not save your suggestion." }) : reply(200, { ok: true });
  }
  if (action !== "post") return reply(400, { error: "Unknown action." });

  const clean = String(body ?? "").trim();
  if (clean.length < 1 || clean.length > 500) return reply(400, { error: "Posts must be 1 to 500 characters." });

  const { data: topic } = await admin.from("topics").select("id, closes_at, approved").eq("id", topic_id).maybeSingle();
  if (!topic || !topic.approved) return reply(404, { error: "Topic not found." });
  if (new Date(topic.closes_at) <= new Date()) return reply(403, { error: "Comments on this topic are closed." });

  const { count } = await admin.from("post_authors").select("post_id", { count: "exact", head: true })
    .eq("topic_id", topic.id).eq("uid", uid);
  if ((count ?? 0) >= MAX_POSTS_PER_TOPIC) return reply(429, { error: "You've hit the post limit for this topic." });

  const { data: post, error } = await admin.from("posts")
    .insert({ topic_id: topic.id, handle: await handleFor(uid, topic.id), body: clean }).select("id").single();
  if (error) return reply(500, { error: "Could not post. Try again." });

  const { error: aErr } = await admin.from("post_authors").insert({ post_id: post.id, topic_id: topic.id, uid });
  if (aErr) {
    await admin.from("posts").delete().eq("id", post.id);
    return reply(500, { error: "Could not post. Try again." });
  }
  return reply(200, { ok: true });
});

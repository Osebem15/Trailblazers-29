// Trailblazers '29 portal: Assignments, Polls and site search.
// Loaded after app.js. It adds its own sidebar items, pages, dashboard tiles and search button,
// so index.html only needs the two include lines.
(function () {
  "use strict";

  // ── Test admins ─────────────────────────────────────────────────────────
  // Anyone listed here sees the admin buttons (add assignment, new poll, delete, close).
  // Put your matric number between the quotes, for example ["240805001"].
  // The real admins (course reps) are picked up automatically from the existing admin list.
  const TEST_ADMIN_MATRICS = [];
  const TEST_ADMIN_EMAILS = ["admin@student.local"];

  const DATA_FILE = "tb-data.json";
  const LAGOS = "Africa/Lagos";

  // ── Small helpers ───────────────────────────────────────────────────────
  const $ = (id) => document.getElementById(id);
  const norm = (s) => String(s || "").toLowerCase().replace(/[^a-z0-9]/g, "");

  function h(tag, attrs, ...kids) {
    const el = document.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach((k) => {
        const v = attrs[k];
        if (v == null || v === false) return;
        if (k === "class") el.className = v;
        else if (k === "text") el.textContent = v;
        else if (k.slice(0, 2) === "on") el.addEventListener(k.slice(2), v);
        else el.setAttribute(k, v === true ? "" : v);
      });
    }
    kids.flat().forEach((c) => {
      if (c == null || c === false) return;
      el.append(c.nodeType ? c : document.createTextNode(String(c)));
    });
    return el;
  }
  const icon = (cls) => h("i", { class: "fa-solid " + cls, "aria-hidden": "true" });

  function me() {
    return {
      email: (localStorage.getItem("logged_in_user_email") || "").toLowerCase(),
      matric: localStorage.getItem("logged_in_user_matric") || ""
    };
  }
  const voterId = () => me().matric || me().email;

  function lsGet(key, fallback) {
    try { const v = JSON.parse(localStorage.getItem(key)); return v == null ? fallback : v; }
    catch (e) { return fallback; }
  }
  function lsSet(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* storage full or blocked */ }
  }
  const uid = () => (window.crypto && crypto.randomUUID ? crypto.randomUUID() : "l" + Date.now() + Math.random().toString(16).slice(2));

  const dateFmt = new Intl.DateTimeFormat("en-GB", {
    weekday: "short", day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit", hour12: true, timeZone: LAGOS
  });
  const whenText = (iso) => dateFmt.format(new Date(iso));

  function relText(iso) {
    const ms = new Date(iso) - Date.now();
    const abs = Math.abs(ms);
    const min = Math.round(abs / 60000), hr = Math.round(abs / 3600000), day = Math.round(abs / 86400000);
    let span;
    if (min < 1) return ms >= 0 ? "due now" : "just passed";
    if (min < 60) span = min + (min === 1 ? " minute" : " minutes");
    else if (hr < 24) span = hr + (hr === 1 ? " hour" : " hours");
    else span = day + (day === 1 ? " day" : " days");
    return ms >= 0 ? "in " + span : span + " ago";
  }

  function toast(text, isError) {
    let t = $("tbxToast");
    if (!t) {
      t = h("div", { id: "tbxToast", class: "tbx-toast", role: "status" });
      document.body.appendChild(t);
    }
    t.textContent = text;
    t.className = "tbx-toast show" + (isError ? " error" : "");
    clearTimeout(toast._t);
    toast._t = setTimeout(() => { t.className = "tbx-toast"; }, 3200);
  }

  // ── Who is an admin ─────────────────────────────────────────────────────
  function localAdmin() {
    const m = me();
    if (TEST_ADMIN_EMAILS.indexOf(m.email) !== -1) return true;
    if (m.matric && TEST_ADMIN_MATRICS.map(norm).indexOf(norm(m.matric)) !== -1) return true;
    try { if (typeof window.tbIsAdmin === "function" && window.tbIsAdmin()) return true; } catch (e) { /* ignore */ }
    return false;
  }
  async function isAdmin() {
    if (localAdmin()) return true;
    if (window.forumIsAdmin === true) return true;
    if (window.forumIsAdmin === undefined && typeof window.forumCall === "function") {
      try { window.forumIsAdmin = (await window.forumCall({ action: "whoami" })).admin === true; }
      catch (e) { /* not an admin or not reachable */ }
    }
    return window.forumIsAdmin === true;
  }

  // ── Course list (for the add form and for search) ───────────────────────
  let dataPromise = null;
  function loadData() {
    if (!dataPromise) {
      dataPromise = fetch(DATA_FILE).then((r) => r.json()).catch(() => ({}));
    }
    return dataPromise;
  }

  // ── Data layer ──────────────────────────────────────────────────────────
  // Uses the Supabase tables when they exist. Until they do, it falls back to a test mode that
  // keeps everything on this device only, so the screens can be tried right away.
  const L_ASSIGN = "tbx_local_assignments", L_POLLS = "tbx_local_polls", L_VOTES = "tbx_local_votes";

  function isMissingTable(err) {
    const msg = String((err && err.message) || "");
    return (err && (err.code === "PGRST205" || err.code === "42P01" || err.code === "PGRST202")) ||
      /could not find the (table|function)|does not exist|schema cache/i.test(msg);
  }
  function friendly(err) {
    if (err && err.code === "42501") return "The database refused this. Run the Assignments and Polls SQL again.";
    return (err && err.message) || "Something went wrong. Try again.";
  }

  const Store = {
    mode: null,   // "server" or "local"
    sb() { return window.tbSupabase || null; },

    async ensureMode() {
      if (this.mode === "server") return;
      const sb = this.sb();
      if (!sb) { this.mode = "local"; return; }
      const { error } = await sb.from("assignments").select("id").limit(1);
      if (!error) { this.mode = "server"; return; }
      if (isMissingTable(error)) { this.mode = "local"; return; }
      throw error;
    },

    // Assignments
    async listAssignments() {
      await this.ensureMode();
      if (this.mode === "local") return lsGet(L_ASSIGN, []);
      const { data, error } = await this.sb().from("assignments").select("*").order("due_at", { ascending: true }).limit(300);
      if (error) throw error;
      return data || [];
    },
    async addAssignment(a) {
      if (this.mode === "local") {
        const list = lsGet(L_ASSIGN, []);
        list.push(Object.assign({ id: uid(), created_at: new Date().toISOString(), created_by: me().email }, a));
        lsSet(L_ASSIGN, list);
        return;
      }
      const { error } = await this.sb().from("assignments").insert([Object.assign({ created_by: me().email }, a)]);
      if (error) throw error;
    },
    async updateAssignment(id, fields) {
      if (this.mode === "local") {
        lsSet(L_ASSIGN, lsGet(L_ASSIGN, []).map((x) => (x.id === id ? Object.assign({}, x, fields) : x)));
        return;
      }
      const { error } = await this.sb().from("assignments").update(fields).eq("id", id);
      if (error) throw error;
    },
    async deleteAssignment(id) {
      if (this.mode === "local") { lsSet(L_ASSIGN, lsGet(L_ASSIGN, []).filter((x) => x.id !== id)); return; }
      const { error } = await this.sb().from("assignments").delete().eq("id", id);
      if (error) throw error;
    },

    // Polls
    async listPolls() {
      await this.ensureMode();
      const voter = voterId();
      if (this.mode === "local") return this._localPolls(voter);
      const sb = this.sb();
      const { data, error } = await sb.from("polls")
        .select("id,question,allow_multiple,closes_at,closed,created_at,poll_options(id,label,position)")
        .order("created_at", { ascending: false }).limit(20);
      if (error) throw error;
      return Promise.all((data || []).map(async (p) => {
        const [c, m, n] = await Promise.all([
          sb.rpc("poll_counts", { p_poll: p.id }),
          sb.rpc("my_votes", { p_poll: p.id, p_voter: voter }),
          sb.rpc("poll_voter_count", { p_poll: p.id })
        ]);
        if (c.error) throw c.error;
        if (m.error) throw m.error;
        if (n.error) throw n.error;
        const counts = {};
        (c.data || []).forEach((r) => { counts[r.option_id] = Number(r.votes); });
        return {
          id: p.id, question: p.question, allow_multiple: p.allow_multiple, closes_at: p.closes_at,
          closed: p.closed, created_at: p.created_at,
          options: (p.poll_options || []).slice().sort((a, b) => a.position - b.position),
          counts, mine: new Set((m.data || []).map((r) => r.option_id)), voters: Number(n.data || 0)
        };
      }));
    },
    async listPollsLite() {
      await this.ensureMode();
      if (this.mode === "local") return lsGet(L_POLLS, []);
      const { data, error } = await this.sb().from("polls")
        .select("id,question,allow_multiple,closes_at,closed,created_at,poll_options(id,label,position)")
        .order("created_at", { ascending: false }).limit(20);
      if (error) throw error;
      return (data || []).map((p) => Object.assign({}, p, { options: p.poll_options || [] }));
    },
    _localPolls(voter) {
      const votes = lsGet(L_VOTES, []);
      return lsGet(L_POLLS, []).slice().sort((a, b) => (a.created_at < b.created_at ? 1 : -1)).map((p) => {
        const mine = new Set(), counts = {}, who = new Set();
        votes.filter((v) => v.poll === p.id).forEach((v) => {
          counts[v.option] = (counts[v.option] || 0) + 1;
          who.add(v.voter);
          if (v.voter === voter) mine.add(v.option);
        });
        return Object.assign({}, p, { counts, mine, voters: who.size });
      });
    },
    async addPoll(p) {
      if (this.mode === "local") {
        const polls = lsGet(L_POLLS, []);
        polls.push({
          id: uid(), question: p.question, allow_multiple: p.allow_multiple, closes_at: p.closes_at, closed: false,
          created_at: new Date().toISOString(), options: p.options.map((label, i) => ({ id: uid(), label, position: i }))
        });
        lsSet(L_POLLS, polls);
        return;
      }
      const sb = this.sb();
      const { data, error } = await sb.from("polls").insert([{
        question: p.question, allow_multiple: p.allow_multiple, closes_at: p.closes_at, created_by: me().email
      }]).select("id").single();
      if (error) throw error;
      const { error: e2 } = await sb.from("poll_options").insert(
        p.options.map((label, i) => ({ poll_id: data.id, label, position: i }))
      );
      if (e2) { await sb.from("polls").delete().eq("id", data.id); throw e2; }
    },
    async closePoll(id) {
      if (this.mode === "local") {
        lsSet(L_POLLS, lsGet(L_POLLS, []).map((p) => (p.id === id ? Object.assign({}, p, { closed: true }) : p)));
        return;
      }
      const { error } = await this.sb().from("polls").update({ closed: true }).eq("id", id);
      if (error) throw error;
    },
    async deletePoll(id) {
      if (this.mode === "local") {
        lsSet(L_POLLS, lsGet(L_POLLS, []).filter((p) => p.id !== id));
        lsSet(L_VOTES, lsGet(L_VOTES, []).filter((v) => v.poll !== id));
        return;
      }
      const { error } = await this.sb().from("polls").delete().eq("id", id);
      if (error) throw error;
    },
    async vote(poll, optionIds) {
      const voter = voterId();
      const ids = Array.from(optionIds || []);
      if (!ids.length) throw new Error("Pick an answer first.");
      if (this.mode === "local") {
        const open = !poll.closed && (!poll.closes_at || new Date(poll.closes_at) > new Date());
        if (!open) throw new Error("This poll is closed.");
        const votes = lsGet(L_VOTES, []);
        if (votes.some((v) => v.poll === poll.id && v.voter === voter)) throw new Error("You have already voted in this poll.");
        if (!poll.allow_multiple && ids.length > 1) throw new Error("Pick only one answer.");
        ids.forEach((o) => votes.push({ poll: poll.id, option: o, voter }));
        lsSet(L_VOTES, votes);
        return;
      }
      const { error } = await this.sb().rpc("cast_vote", { p_poll: poll.id, p_options: ids, p_voter: voter });
      if (error) throw error;
    }
  };

  // ── Page plumbing: sidebar items, pages, dashboard tiles ────────────────
  const PAGES = {
    assignmentsView: { label: "Assignments", icon: "fa-list-check" },
    pollsView: { label: "Polls", icon: "fa-square-poll-vertical" }
  };

  function closeMobileMenu() {
    const sb = document.querySelector(".dashboard-sidebar");
    const ov = $("sidebar-overlay");
    if (sb) sb.classList.remove("mobile-open");
    if (ov) ov.classList.remove("active");
  }

  function openView(id) {
    closeMobileMenu();
    if (typeof window.switchToView === "function") window.switchToView(id);
    document.querySelectorAll(".sidebar-grid-menu .menu-item").forEach((item) => {
      const span = item.querySelector("span");
      const mine = PAGES[id] && span && span.textContent.trim() === PAGES[id].label;
      if (mine) item.classList.add("active");
    });
    if (id === "assignmentsView") Assignments.load();
    if (id === "pollsView") Polls.load();
  }
  window.tbxOpenView = openView;

  function installPages() {
    const nav = document.querySelector(".sidebar-grid-menu");
    const anchor = $("galleryView");
    const grid = document.querySelector(".quick-access-box-grid");
    if (!nav || !anchor) return false;

    Object.keys(PAGES).forEach((id) => {
      const p = PAGES[id];
      nav.appendChild(h("div", { class: "menu-item", role: "button", tabindex: "0", onclick: () => openView(id),
        onkeydown: (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openView(id); } } },
        icon(p.icon), h("span", { text: p.label })));
      if (grid) {
        grid.appendChild(h("div", { class: "access-box", role: "button", tabindex: "0", onclick: () => openView(id),
          onkeydown: (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openView(id); } } },
          icon(p.icon), h("span", { text: p.label })));
      }
      anchor.parentNode.appendChild(h("div", { id, class: "view-panel", style: "display: none;" }));
    });
    return true;
  }

  // Shared bits for both pages
  function modeBanner() {
    return Store.mode === "local"
      ? h("div", { class: "tbx-banner", role: "note" },
          icon("fa-flask"),
          h("span", { text: "Test mode. The server tables are not set up yet, so what you add here is saved on this device only." }))
      : null;
  }
  function stateBox(text, retry) {
    return h("div", { class: "tbx-state" }, h("p", { text }),
      retry ? h("button", { type: "button", class: "tbx-btn", onclick: retry }, icon("fa-rotate-right"), " Try again") : null);
  }
  function field(label, control, hint) {
    const isPicker = control.classList && control.classList.contains("tbx-dt");
    return h(isPicker ? "div" : "label", { class: "tbx-field" }, h("span", { class: "tbx-label", text: label }), control,
      hint ? h("small", { text: hint }) : null);
  }
  function toLocalInput(d) {
    const p = (n) => String(n).padStart(2, "0");
    return d.getFullYear() + "-" + p(d.getMonth() + 1) + "-" + p(d.getDate()) + "T" + p(d.getHours()) + ":" + p(d.getMinutes());
  }


  // ── Date and time picker: calendar plus an alarm-style time row, shown as dd/mm/yyyy ──
  const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const pad2 = (n) => String(n).padStart(2, "0");
  const sameDay = (a, b) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  const dmy = (d) => pad2(d.getDate()) + "/" + pad2(d.getMonth() + 1) + "/" + d.getFullYear();

  function dtPicker(opts) {
    const o = Object.assign({ optional: false, initial: null, defaultHour: 11, defaultMinute: 59, defaultPm: true }, opts || {});
    let date = o.initial ? new Date(o.initial.getFullYear(), o.initial.getMonth(), o.initial.getDate()) : null;
    let view = date ? new Date(date.getFullYear(), date.getMonth(), 1) : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const today = new Date(); today.setHours(0, 0, 0, 0);

    const dateBtn = h("button", { type: "button", class: "tbx-input tbx-dt-date", "aria-haspopup": "dialog", "aria-expanded": "false" });
    const label = h("span", { class: "tbx-dt-text" });
    dateBtn.append(icon("fa-calendar-days"), label);

    const hourSel = h("select", { class: "tbx-input tbx-dt-sel", "aria-label": "Hour" });
    for (let i = 1; i <= 12; i++) hourSel.appendChild(h("option", { value: String(i), text: String(i) }));
    const minSel = h("select", { class: "tbx-input tbx-dt-sel", "aria-label": "Minute" });
    for (let i = 0; i < 60; i++) minSel.appendChild(h("option", { value: String(i), text: pad2(i) }));
    const apSel = h("select", { class: "tbx-input tbx-dt-sel", "aria-label": "AM or PM" });
    apSel.append(h("option", { value: "AM", text: "AM" }), h("option", { value: "PM", text: "PM" }));
    const setTime = (hh, mm, pm) => { hourSel.value = String(hh); minSel.value = String(mm); apSel.value = pm ? "PM" : "AM"; };
    if (o.initial) setTime(o.initial.getHours() % 12 || 12, o.initial.getMinutes(), o.initial.getHours() >= 12);
    else setTime(o.defaultHour, o.defaultMinute, o.defaultPm);

    const pop = h("div", { class: "tbx-cal", role: "dialog", "aria-label": "Choose a date", hidden: true });
    const wrap = h("div", { class: "tbx-dt" },
      h("div", { class: "tbx-dt-row" }, dateBtn),
      h("div", { class: "tbx-dt-row tbx-dt-time" }, icon("fa-clock"), hourSel, h("span", { class: "tbx-dt-colon", text: ":" }), minSel, apSel),
      pop);

    function refresh() {
      label.textContent = date ? dmy(date) : "dd/mm/yyyy";
      dateBtn.classList.toggle("is-empty", !date);
      [hourSel, minSel, apSel].forEach((s2) => { s2.disabled = !date; });
    }
    function close() { pop.hidden = true; dateBtn.setAttribute("aria-expanded", "false"); }
    function open() { pop.hidden = false; dateBtn.setAttribute("aria-expanded", "true"); drawCal(); }
    function pick(d) {
      date = d; refresh(); close();
      if (o.optional && !wrap.dataset.timeTouched) setTime(o.defaultHour, o.defaultMinute, o.defaultPm);
    }
    function drawCal() {
      const head = h("div", { class: "tbx-cal-head" });
      const prev = h("button", { type: "button", class: "tbx-icon-btn", "aria-label": "Previous month" }, icon("fa-chevron-left"));
      const next = h("button", { type: "button", class: "tbx-icon-btn", "aria-label": "Next month" }, icon("fa-chevron-right"));
      prev.disabled = !o.allowPast && view <= new Date(today.getFullYear(), today.getMonth(), 1);
      prev.addEventListener("click", () => { view = new Date(view.getFullYear(), view.getMonth() - 1, 1); drawCal(); });
      next.addEventListener("click", () => { view = new Date(view.getFullYear(), view.getMonth() + 1, 1); drawCal(); });
      head.append(prev, h("strong", { class: "tbx-cal-title", text: MONTHS[view.getMonth()] + " " + view.getFullYear() }), next);

      const grid = h("div", { class: "tbx-cal-grid", role: "grid" });
      DAYS.forEach((d) => grid.appendChild(h("span", { class: "tbx-cal-dow", text: d })));
      const first = new Date(view.getFullYear(), view.getMonth(), 1);
      const lead = (first.getDay() + 6) % 7;
      for (let i = 0; i < lead; i++) grid.appendChild(h("span", { class: "tbx-cal-gap" }));
      const count = new Date(view.getFullYear(), view.getMonth() + 1, 0).getDate();
      for (let n = 1; n <= count; n++) {
        const d = new Date(view.getFullYear(), view.getMonth(), n);
        const b = h("button", { type: "button", class: "tbx-cal-day" + (date && sameDay(d, date) ? " sel" : "") + (sameDay(d, today) ? " today" : ""), text: String(n) });
        if (d < today && !o.allowPast) b.disabled = true;
        else b.addEventListener("click", () => pick(d));
        grid.appendChild(b);
      }
      const foot = h("div", { class: "tbx-cal-foot" },
        h("button", { type: "button", class: "tbx-btn", onclick: () => pick(new Date(today)) }, "Today"),
        o.optional ? h("button", { type: "button", class: "tbx-btn", onclick: () => { date = null; refresh(); close(); } }, "Clear") : null);
      pop.replaceChildren(head, grid, foot);
    }

    dateBtn.addEventListener("click", () => { if (pop.hidden) open(); else close(); });
    [hourSel, minSel, apSel].forEach((s2) => s2.addEventListener("change", () => { wrap.dataset.timeTouched = "1"; }));
    document.addEventListener("click", (e) => { if (!pop.hidden && !e.composedPath().includes(wrap)) close(); });
    wrap.addEventListener("keydown", (e) => { if (e.key === "Escape" && !pop.hidden) { close(); dateBtn.focus(); } });
    refresh();

    wrap.getDate = () => {
      if (!date) return null;
      const hh = (Number(hourSel.value) % 12) + (apSel.value === "PM" ? 12 : 0);
      return new Date(date.getFullYear(), date.getMonth(), date.getDate(), hh, Number(minSel.value), 0, 0);
    };
    wrap.focusPicker = () => dateBtn.focus();
    return wrap;
  }

  // ── Assignments ─────────────────────────────────────────────────────────
  const Assignments = {
    items: [], state: "idle", admin: false, course: "", showPast: false, formOpen: false, editing: null,
    doneKey() { return "tbx_done_" + voterId(); },
    done() { return new Set(lsGet(this.doneKey(), [])); },
    toggleDone(id) {
      const s = this.done();
      if (s.has(id)) s.delete(id); else s.add(id);
      lsSet(this.doneKey(), Array.from(s));
    },

    async load() {
      this.state = "loading";
      this.render();
      try {
        const [items, admin] = await Promise.all([Store.listAssignments(), isAdmin()]);
        this.items = items; this.admin = admin; this.state = "ready";
        Sync.set(items);
      } catch (e) {
        console.error("Assignments failed to load:", e);
        this.state = "error";
      }
      this.render();
    },

    render() {
      const root = $("assignmentsView");
      if (!root) return;
      const now = Date.now();
      const open = this.items.filter((a) => new Date(a.due_at) >= now);
      const card = h("div", { class: "matrix-card tbx-card" });
      card.appendChild(h("div", { class: "table-header-row" },
        h("h3", null, icon("fa-list-check"), " Assignments"),
        this.state === "ready" ? h("span", { class: "total-units-badge", text: open.length + " open" }) : null));
      const banner = modeBanner();
      if (banner) card.appendChild(banner);

      if (this.state === "loading") { card.appendChild(stateBox("Loading assignments...")); root.replaceChildren(card); return; }
      if (this.state === "error") { card.appendChild(stateBox("Could not load assignments. Check your connection and try again.", () => this.load())); root.replaceChildren(card); return; }

      if (this.admin) {
        card.appendChild(h("div", { class: "tbx-toolbar" },
          h("button", { type: "button", class: "btn-primary tbx-add", "aria-expanded": String(this.formOpen),
            onclick: () => { this.formOpen = !this.formOpen; this.editing = null; this.render(); } },
            icon(this.formOpen ? "fa-xmark" : "fa-plus"), this.formOpen ? " Cancel" : " Add assignment")));
        if (this.formOpen) card.appendChild(this.form(this.editing ? this.items.find((x) => x.id === this.editing) : null));
      }

      const courses = Array.from(new Set(this.items.map((a) => a.course_code))).sort();
      if (this.items.length) {
        const sel = h("select", { class: "tbx-input", "aria-label": "Filter by course", onchange: (e) => { this.course = e.target.value; this.render(); } },
          h("option", { value: "", text: "All courses" }),
          courses.map((c) => h("option", { value: c, text: c, selected: c === this.course ? true : null })));
        const chk = h("label", { class: "tbx-check" },
          h("input", { type: "checkbox", checked: this.showPast ? true : null, onchange: (e) => { this.showPast = e.target.checked; this.render(); } }),
          h("span", { text: "Show past assignments" }));
        card.appendChild(h("div", { class: "tbx-filters" }, sel, chk));
      }

      const done = this.done();
      const visible = this.items.filter((a) => !this.course || a.course_code === this.course);
      const upcoming = visible.filter((a) => new Date(a.due_at) >= now).sort((a, b) => new Date(a.due_at) - new Date(b.due_at));
      const past = visible.filter((a) => new Date(a.due_at) < now).sort((a, b) => new Date(b.due_at) - new Date(a.due_at));

      if (!this.items.length) {
        card.appendChild(stateBox(this.admin
          ? "No assignments yet. Use Add assignment to post the first one."
          : "No assignments have been posted. Check back after your course rep adds one."));
      } else if (!upcoming.length && !(this.showPast && past.length)) {
        card.appendChild(stateBox("Nothing is due. You are all caught up."));
      }
      if (upcoming.length) card.appendChild(h("div", { class: "tbx-list" }, upcoming.map((a) => this.item(a, done))));
      if (this.showPast && past.length) {
        card.appendChild(h("h4", { class: "tbx-subhead", text: "Past" }));
        card.appendChild(h("div", { class: "tbx-list" }, past.map((a) => this.item(a, done))));
      }
      root.replaceChildren(card);
    },

    item(a, done) {
      const ms = new Date(a.due_at) - Date.now();
      const tone = ms < 0 ? "late" : ms < 48 * 3600000 ? "soon" : "";
      const isDone = done.has(a.id);
      const el = h("article", { class: "tbx-item" + (isDone ? " is-done" : "") + (ms < 0 ? " is-past" : "") });
      const note = a.note ? h("p", { class: "tbx-note", text: a.note }) : null;
      el.appendChild(h("div", { class: "tbx-item-top" },
        h("span", { class: "tbx-tag", text: a.course_code }),
        h("span", { class: "tbx-due " + tone }, icon("fa-clock"), " ", relText(a.due_at))));
      el.appendChild(h("h4", { class: "tbx-item-title", text: a.title }));
      el.appendChild(h("p", { class: "tbx-meta", text: "Due " + whenText(a.due_at) }));
      if (note) el.appendChild(note);
      const actions = h("div", { class: "tbx-item-actions" },
        h("button", { type: "button", class: "tbx-btn", role: "checkbox", "aria-checked": String(isDone),
          onclick: () => { this.toggleDone(a.id); this.render(); } },
          icon(isDone ? "fa-square-check" : "fa-square"), isDone ? " Done" : " Mark as done"));
      if (this.admin) {
        const edit = h("button", { type: "button", class: "tbx-btn" }, icon("fa-pen"), " Edit");
        edit.addEventListener("click", () => {
          this.editing = a.id; this.formOpen = true; this.render();
          const f = $("assignmentsView").querySelector(".tbx-form");
          if (f) f.scrollIntoView({ behavior: "smooth", block: "start" });
        });
        actions.appendChild(edit);
        actions.appendChild(this.deleteButton(a));
      }
      el.appendChild(actions);
      return el;
    },

    deleteButton(a) {
      const btn = h("button", { type: "button", class: "tbx-btn danger" }, icon("fa-trash"), " Delete");
      let armed = false;
      btn.addEventListener("click", async () => {
        if (!armed) {
          armed = true; btn.textContent = "Tap again to delete"; btn.classList.add("armed");
          setTimeout(() => { if (armed) { armed = false; btn.replaceChildren(icon("fa-trash"), " Delete"); btn.classList.remove("armed"); } }, 3500);
          return;
        }
        btn.disabled = true;
        try { await Store.deleteAssignment(a.id); toast("Assignment deleted."); await this.load(); }
        catch (e) { btn.disabled = false; toast(friendly(e), true); }
      });
      return btn;
    },

    form(edit) {
      const tomorrow = new Date(Date.now() + 86400000); tomorrow.setHours(23, 59, 0, 0);
      const course = h("input", { class: "tbx-input", id: "tbxACourse", list: "tbxCourseList", maxlength: "20", placeholder: "ACC 210", autocomplete: "off", required: true, value: edit ? edit.course_code : "" });
      const list = h("datalist", { id: "tbxCourseList" });
      loadData().then((d) => (d.courses || []).forEach((c) => { if (c.code) list.appendChild(h("option", { value: c.code, label: c.title || "" })); }));
      const title = h("input", { class: "tbx-input", id: "tbxATitle", maxlength: "200", placeholder: "What is the assignment?", required: true, value: edit ? edit.title : "" });
      const due = dtPicker({ initial: edit ? new Date(edit.due_at) : tomorrow, allowPast: !!edit });
      const note = h("textarea", { class: "tbx-input", id: "tbxANote", maxlength: "1000", rows: "3", placeholder: "Any detail students should know (optional)" });
      if (edit && edit.note) note.value = edit.note;
      const msg = h("p", { class: "tbx-formmsg", role: "alert" });
      const submit = h("button", { type: "submit", class: "btn-primary tbx-submit" }, edit ? "Save changes" : "Post assignment");
      const form = h("form", { class: "tbx-form", novalidate: true },
        field("Course", course, "Pick from the list or type a course code"), list,
        field("Title", title), field("Due date and time", due, "Pick a date, then set the time"), field("Short note", note), msg, submit);
      form.addEventListener("submit", async (e) => {
        e.preventDefault();
        msg.textContent = "";
        const code = course.value.trim().toUpperCase(), t = title.value.trim(), n = note.value.trim();
        const d = due.getDate();
        if (code.length < 3) { msg.textContent = "Enter the course code, for example ACC 210."; course.focus(); return; }
        if (t.length < 3) { msg.textContent = "Give the assignment a title of at least 3 characters."; title.focus(); return; }
        if (!d) { msg.textContent = "Choose a due date and time."; due.focusPicker(); return; }
        const unchangedTime = edit && d.getTime() === new Date(edit.due_at).getTime();
        if (d < new Date() && !unchangedTime) { msg.textContent = "That time has already passed. Pick a later time."; due.focusPicker(); return; }
        submit.disabled = true; submit.textContent = edit ? "Saving..." : "Posting...";
        try {
          const fields = { course_code: code, title: t, note: n || null, due_at: d.toISOString() };
          if (edit) await Store.updateAssignment(edit.id, fields); else await Store.addAssignment(fields);
          this.formOpen = false; this.editing = null; toast(edit ? "Assignment updated." : "Assignment posted."); await this.load();
        } catch (err) {
          console.error(err); msg.textContent = friendly(err);
          submit.disabled = false; submit.textContent = edit ? "Save changes" : "Post assignment";
        }
      });
      return form;
    }
  };

  // ── Polls ───────────────────────────────────────────────────────────────
  const Polls = {
    items: [], state: "idle", admin: false, formOpen: false,

    async load() {
      this.state = "loading";
      this.render();
      try {
        const [items, admin] = await Promise.all([Store.listPolls(), isAdmin()]);
        this.items = items; this.admin = admin; this.state = "ready";
      } catch (e) {
        console.error("Polls failed to load:", e);
        this.state = "error";
      }
      this.render();
    },

    draft: {},

    isOpen(p) { return !p.closed && (!p.closes_at || new Date(p.closes_at) > new Date()); },

    render() {
      const root = $("pollsView");
      if (!root) return;
      const card = h("div", { class: "matrix-card tbx-card" });
      const openCount = this.items.filter((p) => this.isOpen(p)).length;
      card.appendChild(h("div", { class: "table-header-row" },
        h("h3", null, icon("fa-square-poll-vertical"), " Polls"),
        this.state === "ready" ? h("span", { class: "total-units-badge", text: openCount + " open" }) : null));
      const banner = modeBanner();
      if (banner) card.appendChild(banner);

      if (this.state === "loading") { card.appendChild(stateBox("Loading polls...")); root.replaceChildren(card); return; }
      if (this.state === "error") { card.appendChild(stateBox("Could not load polls. Check your connection and try again.", () => this.load())); root.replaceChildren(card); return; }

      if (this.admin) {
        card.appendChild(h("div", { class: "tbx-toolbar" },
          h("button", { type: "button", class: "btn-primary tbx-add", "aria-expanded": String(this.formOpen),
            onclick: () => { this.formOpen = !this.formOpen; this.render(); } },
            icon(this.formOpen ? "fa-xmark" : "fa-plus"), this.formOpen ? " Cancel" : " New poll")));
        if (this.formOpen) card.appendChild(this.form());
      }
      if (!this.items.length) {
        card.appendChild(stateBox(this.admin ? "No polls yet. Use New poll to ask the class something." : "There are no polls right now."));
      } else {
        const sorted = this.items.slice().sort((a, b) => (this.isOpen(b) - this.isOpen(a)));
        card.appendChild(h("div", { class: "tbx-list" }, sorted.map((p) => this.pollCard(p))));
      }
      root.replaceChildren(card);
    },

    pollCard(p) {
      const open = this.isOpen(p);
      const voted = p.mine.size > 0;
      const canVote = open && !voted;
      const showResults = !open || voted || this.admin;
      const total = p.options.reduce((n, o) => n + (p.counts[o.id] || 0), 0);
      const draft = this.draft[p.id] || (this.draft[p.id] = new Set());
      const el = h("article", { class: "tbx-item tbx-poll" + (open ? "" : " is-past") });
      const status = !open ? "Closed"
        : p.closes_at ? "Closes " + whenText(p.closes_at) : "Open until the admin closes it";
      el.appendChild(h("div", { class: "tbx-item-top" },
        h("span", { class: "tbx-tag" + (open ? "" : " muted"), text: open ? "Open" : "Closed" }),
        h("span", { class: "tbx-meta", text: status })));
      el.appendChild(h("h4", { class: "tbx-item-title", text: p.question }));
      const err = h("p", { class: "tbx-formmsg", role: "alert" });
      const group = h("div", { class: "tbx-options", role: p.allow_multiple ? "group" : "radiogroup", "aria-label": p.question });
      const submit = h("button", { type: "button", class: "btn-primary tbx-submit" }, "Submit vote");
      submit.disabled = draft.size === 0;
      p.options.forEach((o) => {
        const n = p.counts[o.id] || 0;
        const pct = total ? Math.round((n / total) * 100) : 0;
        const chosen = p.mine.has(o.id) || (canVote && draft.has(o.id));
        const btn = h("button", {
          type: "button", class: "tbx-option" + (chosen ? " chosen" : "") + (showResults ? " with-results" : ""),
          role: p.allow_multiple ? "checkbox" : "radio", "aria-checked": String(chosen), disabled: canVote ? null : true
        },
          showResults ? h("span", { class: "tbx-bar", style: "width:" + pct + "%" }) : null,
          h("span", { class: "tbx-mark" }, chosen ? icon("fa-check") : null),
          h("span", { class: "tbx-opt-label", text: o.label }),
          showResults ? h("span", { class: "tbx-opt-count", text: pct + "% (" + n + ")" }) : null);
        if (canVote) btn.addEventListener("click", () => {
          if (p.allow_multiple) { if (draft.has(o.id)) draft.delete(o.id); else draft.add(o.id); }
          else { draft.clear(); draft.add(o.id); }
          err.textContent = "";
          group.querySelectorAll(".tbx-option").forEach((b, i) => {
            const on = draft.has(p.options[i].id);
            b.classList.toggle("chosen", on); b.setAttribute("aria-checked", String(on));
            b.querySelector(".tbx-mark").replaceChildren(...(on ? [icon("fa-check")] : []));
          });
          submit.disabled = draft.size === 0;
        });
        group.appendChild(btn);
      });
      el.appendChild(group);
      el.appendChild(err);
      if (canVote) {
        submit.addEventListener("click", () => this.cast(p, el, err));
        el.appendChild(submit);
      }
      if (showResults) el.appendChild(h("p", { class: "tbx-meta", text: p.voters + (p.voters === 1 ? " student voted" : " students voted") }));
      if (this.admin) {
        const acts = h("div", { class: "tbx-item-actions" });
        if (open) {
          const closeBtn = h("button", { type: "button", class: "tbx-btn" }, icon("fa-lock"), " Close poll");
          closeBtn.addEventListener("click", async () => {
            closeBtn.disabled = true;
            try { await Store.closePoll(p.id); toast("Poll closed."); await this.load(); }
            catch (e) { closeBtn.disabled = false; toast(friendly(e), true); }
          });
          acts.appendChild(closeBtn);
        }
        const del = h("button", { type: "button", class: "tbx-btn danger" }, icon("fa-trash"), " Delete");
        let armed = false;
        del.addEventListener("click", async () => {
          if (!armed) {
            armed = true; del.textContent = "Tap again to delete"; del.classList.add("armed");
            setTimeout(() => { if (armed) { armed = false; del.replaceChildren(icon("fa-trash"), " Delete"); del.classList.remove("armed"); } }, 3500);
            return;
          }
          del.disabled = true;
          try { await Store.deletePoll(p.id); toast("Poll deleted."); await this.load(); }
          catch (e) { del.disabled = false; toast(friendly(e), true); }
        });
        acts.appendChild(del);
        el.appendChild(acts);
      }
      return el;
    },

    async cast(p, el, errEl) {
      const picks = Array.from(this.draft[p.id] || []);
      if (!picks.length) { errEl.textContent = "Pick an answer first."; return; }
      errEl.textContent = "";
      el.setAttribute("aria-busy", "true");
      el.querySelectorAll("button").forEach((b) => { b.disabled = true; });
      try {
        await Store.vote(p, picks);
        delete this.draft[p.id];
        toast("Vote recorded.");
        const fresh = (await Store.listPolls()).find((x) => x.id === p.id);
        const idx = this.items.findIndex((x) => x.id === p.id);
        if (fresh && idx !== -1) { this.items[idx] = fresh; el.replaceWith(this.pollCard(fresh)); }
        else await this.load();
      } catch (e) {
        console.error(e);
        el.removeAttribute("aria-busy");
        errEl.textContent = friendly(e);
        const fresh = (await Store.listPolls().catch(() => [])).find((x) => x.id === p.id);
        if (fresh && fresh.mine.size) { delete this.draft[p.id]; const idx = this.items.findIndex((x) => x.id === p.id); if (idx !== -1) this.items[idx] = fresh; el.replaceWith(this.pollCard(fresh)); }
        else el.replaceWith(this.pollCard(p));
      }
    },

    form() {
      const q = h("input", { class: "tbx-input", maxlength: "300", placeholder: "What do you want to ask the class?", required: true });
      const optsBox = h("div", { class: "tbx-optlist" });
      const addBtn = h("button", { type: "button", class: "tbx-btn" }, icon("fa-plus"), " Add option");
      const inputs = [];
      const addOption = () => {
        if (inputs.length >= 8) return;
        const inp = h("input", { class: "tbx-input", maxlength: "120", placeholder: "Option " + (inputs.length + 1), "aria-label": "Option " + (inputs.length + 1) });
        const rm = h("button", { type: "button", class: "tbx-icon-btn", "aria-label": "Remove option" }, icon("fa-xmark"));
        const row = h("div", { class: "tbx-optrow" }, inp, rm);
        rm.addEventListener("click", () => {
          if (inputs.length <= 2) return;
          inputs.splice(inputs.indexOf(inp), 1); row.remove();
          inputs.forEach((x, i) => { x.placeholder = "Option " + (i + 1); x.setAttribute("aria-label", "Option " + (i + 1)); });
          addBtn.disabled = false;
        });
        inputs.push(inp); optsBox.appendChild(row);
        if (inputs.length >= 8) addBtn.disabled = true;
      };
      addOption(); addOption();
      addBtn.addEventListener("click", () => { addOption(); inputs[inputs.length - 1].focus(); });
      const multi = h("input", { type: "checkbox" });
      const closes = dtPicker({ optional: true });
      const msg = h("p", { class: "tbx-formmsg", role: "alert" });
      const submit = h("button", { type: "submit", class: "btn-primary tbx-submit" }, "Post poll");
      const form = h("form", { class: "tbx-form", novalidate: true },
        field("Question", q),
        h("div", { class: "tbx-field" }, h("span", { class: "tbx-label", text: "Options (2 to 8)" }), optsBox, addBtn),
        h("label", { class: "tbx-check" }, multi, h("span", { text: "Allow more than one answer" })),
        field("Closing date and time (optional)", closes, "Leave the date empty to keep it open until you close it"),
        msg, submit);
      form.addEventListener("submit", async (e) => {
        e.preventDefault();
        msg.textContent = "";
        const question = q.value.trim();
        const labels = inputs.map((i) => i.value.trim()).filter(Boolean);
        const lower = labels.map((l) => l.toLowerCase());
        if (question.length < 3) { msg.textContent = "Write the question first."; q.focus(); return; }
        if (labels.length < 2) { msg.textContent = "Add at least two options."; return; }
        if (new Set(lower).size !== lower.length) { msg.textContent = "Two options are the same. Make each one different."; return; }
        let closesAt = null;
        const closeD = closes.getDate();
        if (closeD) {
          if (closeD <= new Date()) { msg.textContent = "The closing time must be in the future."; closes.focusPicker(); return; }
          closesAt = closeD.toISOString();
        }
        submit.disabled = true; submit.textContent = "Posting...";
        try {
          await Store.addPoll({ question, options: labels, allow_multiple: multi.checked, closes_at: closesAt });
          this.formOpen = false; toast("Poll posted."); await this.load();
        } catch (err) {
          console.error(err); msg.textContent = friendly(err);
          submit.disabled = false; submit.textContent = "Post poll";
        }
      });
      return form;
    }
  };


  // ── Keep assignments visible in the Notices tab and on the profile calendar ──
  const Sync = {
    items: [], tries: 0, last: 0,
    set(items) { this.items = items || []; this.last = Date.now(); this.paint(); },
    async refresh() {
      if (!window.tbSupabase && this.tries++ < 12) { setTimeout(() => this.refresh(), 800); return; }
      try { this.set(await Store.listAssignments()); } catch (e) { /* leave what is shown */ }
    },
    keyOf(iso) { return new Intl.DateTimeFormat("en-CA", { timeZone: LAGOS }).format(new Date(iso)); },
    byKey() {
      const m = {};
      this.items.slice().sort((a, b) => new Date(a.due_at) - new Date(b.due_at)).forEach((a) => { (m[this.keyOf(a.due_at)] = m[this.keyOf(a.due_at)] || []).push(a); });
      return m;
    },
    paint() { this.paintNotices(); this.markCalendar(); this.enhanceFocused(); },

    paintNotices() {
      const container = $("noticesContainer");
      if (!container || !container.parentNode) return;
      let holder = $("tbxNoticeAssign");
      if (!holder) { holder = h("div", { id: "tbxNoticeAssign" }); container.parentNode.insertBefore(holder, container); }
      const upcoming = this.items.filter((a) => new Date(a.due_at) >= Date.now())
        .sort((a, b) => new Date(a.due_at) - new Date(b.due_at)).slice(0, 12);
      if (!upcoming.length) { holder.replaceChildren(); return; }
      const open = h("button", { type: "button", class: "tbx-btn" }, "Open Assignments ", icon("fa-arrow-right"));
      open.addEventListener("click", () => openView("assignmentsView"));
      const cards = upcoming.map((a) => h("article", { class: "matrix-card notice-card-important" },
        h("div", { class: "notice-card-header" },
          h("span", { class: "course-code-tag", text: "ASSIGNMENT" }),
          h("small", { class: "notice-date" }, icon("fa-clock"), " Due " + whenText(a.due_at))),
        h("h4", { class: "notice-title", text: a.course_code + ": " + a.title }),
        h("p", { class: "notice-text", text: (a.note ? a.note + "\n" : "") + "Due " + relText(a.due_at).replace(/^in /, "in ") + "." })));
      holder.replaceChildren(
        h("div", { class: "tbx-notice-head" }, h("h4", { class: "tbx-subhead", text: "Assignments due" }), open),
        h("div", { class: "notices-grid" }, cards));
    },

    markCalendar() {
      const grid = $("calendarGridDays"), label = $("calendarMonthYearText");
      if (!grid || !label) return;
      const m = /([A-Za-z]+)\s+(\d{4})/.exec(label.textContent || "");
      const mi = m ? MONTHS.indexOf(m[1]) : -1;
      grid.querySelectorAll(".tbx-due-day").forEach((el) => {
        el.classList.remove("tbx-due-day");
        if (el.dataset.tbxEv) { el.classList.remove("has-event"); delete el.dataset.tbxEv; }
        el.removeAttribute("title");
      });
      if (mi < 0) return;
      const map = this.byKey();
      grid.querySelectorAll(".day-num:not(.muted)").forEach((el) => {
        const key = m[2] + "-" + pad2(mi + 1) + "-" + pad2(Number(el.textContent));
        const list = map[key];
        if (!list) return;
        el.classList.add("tbx-due-day");
        if (!el.classList.contains("has-event")) { el.classList.add("has-event"); el.dataset.tbxEv = "1"; }
        el.title = list.length + (list.length === 1 ? " assignment due" : " assignments due");
      });
    },

    enhanceFocused() {
      const titleEl = $("focusedEventTitle"), dateEl = $("focusedEventDate"), textEl = $("focusedEventText");
      if (!titleEl || !dateEl || !textEl) return;
      const m = /([A-Za-z]+)\s+(\d{1,2}),\s*(\d{4})/.exec(dateEl.textContent || "");
      const mi = m ? MONTHS.indexOf(m[1]) : -1;
      if (mi < 0) return;
      const list = this.byKey()[m[3] + "-" + pad2(mi + 1) + "-" + pad2(Number(m[2]))] || [];
      const MARK = "Assignments due:";
      const NONE = "There are no events scheduled for today.";
      let base = textEl.textContent || "";
      const at = base.indexOf("\n\n" + MARK);
      if (at >= 0) base = base.slice(0, at); else if (base.indexOf(MARK) === 0) base = "";
      const titleTxt = (titleEl.textContent || "").trim();
      const mineTitle = /^\d+ assignments? due$/.test(titleTxt);
      const noEvents = /No Scheduled Events/.test(titleTxt) || mineTitle;
      let nextText, nextTitle = null;
      if (!list.length) {
        nextText = base || NONE;
        if (mineTitle) nextTitle = "No Scheduled Events";
      } else {
        const lines = list.map((a) => "• " + a.course_code + ": " + a.title + " (" + new Intl.DateTimeFormat("en-GB", { hour: "numeric", minute: "2-digit", hour12: true, timeZone: LAGOS }).format(new Date(a.due_at)) + ")").join("\n");
        const own = base && base !== NONE;
        nextText = (own ? base + "\n\n" : "") + MARK + "\n" + lines;
        if (noEvents) nextTitle = list.length + (list.length === 1 ? " assignment due" : " assignments due");
      }
      if (nextText !== textEl.textContent) textEl.textContent = nextText;
      if (nextTitle && nextTitle !== titleTxt) {
        const dot = h("span", { class: "blue-indicator-dot" });
        if (nextTitle === "No Scheduled Events") dot.style.background = "#8b949e";
        titleEl.replaceChildren(dot, document.createTextNode(" " + nextTitle));
      }
    },

    init() {
      const watch = (id, opts, fn) => {
        const el = $(id);
        if (!el || el.dataset.tbxWatch) return;
        el.dataset.tbxWatch = "1";
        let queued = false;
        new MutationObserver(() => { if (queued) return; queued = true; requestAnimationFrame(() => { queued = false; fn(); }); }).observe(el, opts);
      };
      watch("calendarGridDays", { childList: true }, () => this.markCalendar());
      watch("calendarFocusedEventCard", { childList: true, subtree: true, characterData: true }, () => this.enhanceFocused());
      const orig = window.switchToView;
      if (typeof orig === "function" && !orig.__tbx) {
        const wrapped = function (id) {
          const r = orig.apply(this, arguments);
          if ((id === "noticesView" || id === "dashboardHomeView") && Date.now() - Sync.last > 15000) Sync.refresh();
          return r;
        };
        wrapped.__tbx = true;
        window.switchToView = wrapped;
      }
      this.refresh();
    }
  };

  // ── Search ──────────────────────────────────────────────────────────────
  const TABS = [
    { label: "My Profile", view: "dashboardHomeView", icon: "fa-user", kw: "profile dashboard home academic calendar" },
    { label: "Courses", view: "coursesView", icon: "fa-book-open", kw: "registered courses lecturers units" },
    { label: "Timetable", view: "timetableView", icon: "fa-calendar-days", kw: "class schedule venue lecture time" },
    { label: "Results", view: "resultsView", icon: "fa-chart-simple", kw: "grades scores cgpa gpa" },
    { label: "Fees", view: "feesView", icon: "fa-naira-sign", kw: "dues payment receipt money" },
    { label: "Notices", view: "noticesView", icon: "fa-bell", kw: "announcements news notifications" },
    { label: "Documents", view: "documentsView", icon: "fa-folder-closed", kw: "materials notes upload lecture notes handouts" },
    { label: "Gallery", view: "galleryView", icon: "fa-images", kw: "photos pictures events" },
    { label: "Forum", view: "forumView", icon: "fa-comments", kw: "discussion daily topic" },
    { label: "Assignments", view: "assignmentsView", icon: "fa-list-check", kw: "homework deadline due" },
    { label: "Polls", view: "pollsView", icon: "fa-square-poll-vertical", kw: "vote voting" },
    { label: "TB AI", href: "ai.html", icon: "fa-robot", kw: "tutor support chat assistant ask questions" }
  ];

  const SRC = { at: 0, loading: null, tb: {}, notices: [], materials: [], assignments: [], polls: [], failed: false };

  function loadSources() {
    if (SRC.loading) return SRC.loading;
    if (Date.now() - SRC.at < 120000) return Promise.resolve();
    const sb = window.tbSupabase;
    SRC.loading = (async () => {
      let failed = false;
      const guard = async (p, fallback) => {
        try { const r = await p; if (r && r.error) throw r.error; return r && r.data !== undefined ? r.data : r; }
        catch (e) { failed = true; return fallback; }
      };
      const [tb, notices, materials, assignments, polls] = await Promise.all([
        loadData(),
        sb ? guard(sb.from("announcements").select("title,content,date,category").order("created_at", { ascending: false }).limit(60), []) : [],
        sb ? guard(sb.from("course_materials").select("courseCode,topicName,fileName,fileUrl").limit(1000), []) : [],
        guard(Store.listAssignments(), []),
        guard(Store.listPollsLite(), [])
      ]);
      SRC.tb = tb || {}; SRC.notices = notices || []; SRC.materials = materials || [];
      SRC.assignments = assignments || []; SRC.polls = polls || []; SRC.failed = failed; SRC.at = Date.now();
      SRC.loading = null;
    })();
    return SRC.loading;
  }

  function buildIndex() {
    const out = [];
    const add = (group, title, sub, extra, action, ic) =>
      out.push({ group, title, sub, icon: ic, action, hay: (title + " " + sub + " " + extra).toLowerCase() });

    TABS.forEach((t) => add("Pages", t.label, "Open " + t.label, t.kw, t.href ? { href: t.href } : { view: t.view }, t.icon));

    (SRC.tb.courses || []).forEach((c) => {
      if (!c.code) return;
      add("Courses", c.code + " " + (c.title || ""), "Course", c.description || "", { view: "coursesView" }, "fa-book-open");
      (c.topics || []).forEach((t) => add("Courses", t, c.code + " topic", "", { view: "documentsView" }, "fa-list-ul"));
    });
    const faq = (SRC.tb.department && SRC.tb.department.faq) || [];
    faq.forEach((f) => add("Questions", f.q, "Tap to read the answer", f.a, { faq: f.a }, "fa-circle-question"));

    SRC.notices.forEach((n) => add("Notices", n.title || "Notice", (n.date || "") + (n.category ? " · " + n.category : ""),
      n.content || "", { view: "noticesView" }, "fa-bell"));
    SRC.materials.forEach((m) => {
      if (!/^https?:\/\//i.test(String(m.fileUrl || ""))) return;
      add("Materials", m.fileName || "File", [m.courseCode, m.topicName].filter(Boolean).join(" · "), "", { url: m.fileUrl }, "fa-file-lines");
    });
    SRC.assignments.forEach((a) => add("Assignments", a.title, a.course_code + " · due " + whenText(a.due_at), a.note || "",
      { view: "assignmentsView" }, "fa-list-check"));
    SRC.polls.forEach((p) => add("Polls", p.question, Polls.isOpen(p) ? "Open poll" : "Closed poll",
      p.options.map((o) => o.label).join(" "), { view: "pollsView" }, "fa-square-poll-vertical"));
    document.querySelectorAll("#galleryGrid .gallery-card").forEach((g) => {
      const cap = g.getAttribute("data-caption");
      if (cap) add("Gallery", cap, g.getAttribute("data-category") || "Photo", "", { view: "galleryView" }, "fa-image");
    });
    return out;
  }

  function highlight(text, terms) {
    const lower = text.toLowerCase();
    const marks = [];
    terms.forEach((t) => {
      let i = lower.indexOf(t);
      while (i !== -1) { marks.push([i, i + t.length]); i = lower.indexOf(t, i + t.length); }
    });
    if (!marks.length) return [text];
    marks.sort((a, b) => a[0] - b[0]);
    const merged = [marks[0].slice()];
    marks.slice(1).forEach((m) => {
      const last = merged[merged.length - 1];
      if (m[0] <= last[1]) last[1] = Math.max(last[1], m[1]); else merged.push(m.slice());
    });
    const parts = []; let pos = 0;
    merged.forEach(([s, e]) => {
      if (s > pos) parts.push(text.slice(pos, s));
      parts.push(h("mark", { text: text.slice(s, e) }));
      pos = e;
    });
    if (pos < text.length) parts.push(text.slice(pos));
    return parts;
  }

  const GROUP_ORDER = ["Pages", "Assignments", "Polls", "Notices", "Materials", "Courses", "Questions", "Gallery"];
  const PER_GROUP = 5;

  function search(query) {
    const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
    const index = buildIndex();
    if (!terms.length) return { terms, groups: [{ name: "Go to", items: index.filter((i) => i.group === "Pages") }] };
    const scored = [];
    index.forEach((it) => {
      const t = it.title.toLowerCase();
      let score = 0;
      for (const term of terms) {
        if (it.hay.indexOf(term) === -1) return;
        score += (t.indexOf(term) !== -1 ? 3 : 1) + (t.indexOf(term) === 0 ? 2 : 0);
      }
      scored.push({ it, score });
    });
    scored.sort((a, b) => b.score - a.score);
    const groups = GROUP_ORDER.map((name) => ({
      name, items: scored.filter((s) => s.it.group === name).map((s) => s.it).slice(0, PER_GROUP)
    })).filter((g) => g.items.length);
    return { terms, groups };
  }

  function pick(item, rowEl) {
    const a = item.action;
    if (a.faq !== undefined) {
      const open = rowEl.nextElementSibling && rowEl.nextElementSibling.classList.contains("tbx-faq");
      if (open) { rowEl.nextElementSibling.remove(); rowEl.setAttribute("aria-expanded", "false"); }
      else { rowEl.after(h("p", { class: "tbx-faq", text: a.faq })); rowEl.setAttribute("aria-expanded", "true"); }
      return;
    }
    closeAll();
    if (a.href) { window.location.href = a.href; return; }
    if (a.url) { window.open(a.url, "_blank", "noopener"); return; }
    if (a.view) openView(a.view);
  }

  function renderResults(box, query) {
    const { terms, groups } = search(query);
    const frag = document.createDocumentFragment();
    if (terms.length && !groups.length) {
      frag.appendChild(h("p", { class: "tbx-empty", text: 'Nothing found for "' + query.trim() + '". Try a course code, a topic or a notice title.' }));
    }
    groups.forEach((g) => {
      frag.appendChild(h("div", { class: "tbx-group", text: g.name }));
      g.items.forEach((it) => {
        const row = h("button", { type: "button", class: "tbx-res", "aria-expanded": it.action.faq !== undefined ? "false" : null },
          icon(it.icon),
          h("span", { class: "tbx-res-text" },
            h("span", { class: "tbx-res-title" }, highlight(it.title, terms)),
            it.sub ? h("span", { class: "tbx-res-sub", text: it.sub }) : null));
        row.addEventListener("click", () => pick(it, row));
        frag.appendChild(row);
      });
    });
    if (SRC.failed && terms.length) frag.appendChild(h("p", { class: "tbx-note-small", text: "Some results could not be loaded. Check your connection." }));
    box.replaceChildren(frag);
  }

  function wireResults(input, box) {
    let timer = null;
    const run = () => renderResults(box, input.value);
    input.addEventListener("input", () => { clearTimeout(timer); timer = setTimeout(run, 110); });
    input.addEventListener("focus", () => { loadSources().then(run); run(); });
    input.addEventListener("keydown", (e) => {
      if (e.key === "ArrowDown") { e.preventDefault(); const f = box.querySelector(".tbx-res"); if (f) f.focus(); }
      if (e.key === "Enter") { const f = box.querySelector(".tbx-res"); if (f) { e.preventDefault(); f.click(); } }
    });
    box.addEventListener("keydown", (e) => {
      const rows = Array.from(box.querySelectorAll(".tbx-res"));
      const i = rows.indexOf(document.activeElement);
      if (i === -1) return;
      if (e.key === "ArrowDown") { e.preventDefault(); if (rows[i + 1]) rows[i + 1].focus(); }
      if (e.key === "ArrowUp") { e.preventDefault(); if (i === 0) input.focus(); else rows[i - 1].focus(); }
    });
    return run;
  }

  let sheet = null, sheetInput = null, inline = null, inlineInput = null;
  const desktopMQ = window.matchMedia("(hover: hover) and (pointer: fine) and (min-width: 769px)");

  function closeAll() {
    if (sheet) { sheet.classList.remove("open"); document.body.classList.remove("tbx-lock"); }
    if (inline) inline.classList.remove("open");
    if (inlineInput) inlineInput.blur();
  }

  function openSearch() {
    if (desktopMQ.matches && inlineInput) { inline.classList.add("open"); inlineInput.focus(); inlineInput.select(); return; }
    sheet.classList.add("open");
    document.body.classList.add("tbx-lock");
    sheetInput.focus();
    loadSources().then(() => renderResults(sheet.querySelector(".tbx-results"), sheetInput.value));
  }

  function installSearch() {
    const actions = document.querySelector(".top-nav-actions");
    if (!actions) return;

    inlineInput = h("input", { class: "tbx-search-input", type: "search", placeholder: "Search the portal", "aria-label": "Search the portal", autocomplete: "off", spellcheck: "false" });
    const drop = h("div", { class: "tbx-drop", role: "region", "aria-label": "Search results" });
    const btn = h("button", { type: "button", class: "tbx-search-btn", "aria-label": "Search", title: "Search (press /)" }, icon("fa-magnifying-glass"));
    inline = h("div", { class: "tbx-search" }, inlineInput, btn, drop);
    actions.insertBefore(inline, actions.firstChild);

    const runInline = wireResults(inlineInput, drop);
    inlineInput.addEventListener("focus", () => inline.classList.add("open"));
    btn.addEventListener("click", () => { if (desktopMQ.matches) { inline.classList.add("open"); inlineInput.focus(); } else openSearch(); });
    drop.addEventListener("mousedown", (e) => e.preventDefault());   // keep focus in the box while clicking a result
    document.addEventListener("mousedown", (e) => { if (inline && !inline.contains(e.target)) inline.classList.remove("open"); });
    inlineInput.addEventListener("keydown", (e) => { if (e.key === "Escape") { inline.classList.remove("open"); inlineInput.blur(); } });

    sheetInput = h("input", { class: "tbx-sheet-input", type: "search", placeholder: "Search the portal", "aria-label": "Search the portal", autocomplete: "off", spellcheck: "false" });
    const results = h("div", { class: "tbx-results" });
    const close = h("button", { type: "button", class: "tbx-sheet-close", "aria-label": "Close search" }, icon("fa-xmark"));
    sheet = h("div", { class: "tbx-sheet", role: "dialog", "aria-modal": "true", "aria-label": "Search" },
      h("div", { class: "tbx-sheet-bar" }, icon("fa-magnifying-glass"), sheetInput, close), results);
    document.body.appendChild(sheet);
    wireResults(sheetInput, results);
    close.addEventListener("click", closeAll);
    sheet.addEventListener("keydown", (e) => { if (e.key === "Escape") closeAll(); });

    document.addEventListener("keydown", (e) => {
      const typing = /^(input|textarea|select)$/i.test((document.activeElement || {}).tagName || "") || (document.activeElement || {}).isContentEditable;
      if (((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") || (e.key === "/" && !typing)) {
        if (!$("LoggedInView") || $("LoggedInView").style.display === "none") return;
        e.preventDefault(); openSearch();
      }
    });
    runInline();
  }

  // ── Start ───────────────────────────────────────────────────────────────
  function start() {
    if (installPages()) installSearch();
    Sync.init();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();

  window.__tbxTest = { Store, Assignments, Polls, Sync, search, buildIndex, SRC };
})();

/* Splash controller: hide the splash once the portal view is up */
(function () {
  var KEY = "tbWasIn";
  function done() {
    var d = document.documentElement;
    d.classList.remove("tb-splash-on");
  }
  function inView() {
    var v = document.getElementById("LoggedInView");
    return v && v.style.display !== "none" && getComputedStyle(v).display !== "none";
  }
  function check() {
    if (inView()) { try { localStorage.setItem(KEY, "1"); } catch (e) {} done(); return true; }
    return false;
  }
  function start() {
    var v = document.getElementById("LoggedInView");
    if (!check() && v) {
      new MutationObserver(function () { if (check()) this.disconnect(); }).observe(v, { attributes: true, attributeFilter: ["style", "class"] });
    }
    // Not signed in anymore (or very slow network): stop waiting
    setTimeout(function () {
      if (!inView()) { try { localStorage.removeItem(KEY); } catch (e) {} }
      done();
    }, 6000);
    ["logoutBtn", "modalLogoutBtn"].forEach(function (id) {
      var b = document.getElementById(id);
      if (b) b.addEventListener("click", function () { try { localStorage.removeItem(KEY); } catch (e) {} });
    });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start); else start();
})();
(() => {
  "use strict";

  const STORAGE_KEY = "sagu-tes-online";
  const LETTERS = "ABCDEF";
  const $ = (id) => document.getElementById(id);

  // ---------- State ----------
  let state = null;   // { peserta, order, optionOrders, answers, flags, current, endsAt, finished }
  let timerId = null;

  // ---------- Util ----------
  const shuffle = (arr) => {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };
  const range = (n) => Array.from({ length: n }, (_, i) => i);
  const save = () => { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (e) {} };
  const load = () => { try { return JSON.parse(localStorage.getItem(STORAGE_KEY)); } catch (e) { return null; } };
  const clear = () => { try { localStorage.removeItem(STORAGE_KEY); } catch (e) {} };

  const show = (screen) => {
    ["screenStart", "screenExam", "screenResult"].forEach((id) => ($(id).hidden = id !== screen));
    $("timer").hidden = screen !== "screenExam";
    window.scrollTo(0, 0);
  };

  // ---------- Halaman Mulai ----------
  function initStart() {
    $("examTitle").textContent = EXAM_CONFIG.title;
    $("examDesc").textContent = EXAM_CONFIG.description;
    $("infoCount").textContent = QUESTIONS.length;
    $("infoTime").textContent = EXAM_CONFIG.durationMinutes;
    $("infoPass").textContent = EXAM_CONFIG.passingScore;
    $("year").textContent = new Date().getFullYear();
    document.title = `${EXAM_CONFIG.title} — SAGU`;
  }

  $("formStart").addEventListener("submit", (e) => {
    e.preventDefault();
    const n = QUESTIONS.length;
    state = {
      peserta: { name: $("inpName").value.trim(), id: $("inpId").value.trim() },
      order: EXAM_CONFIG.shuffleQuestions ? shuffle(range(n)) : range(n),
      optionOrders: QUESTIONS.map((q) =>
        EXAM_CONFIG.shuffleOptions ? shuffle(range(q.options.length)) : range(q.options.length)
      ),
      answers: Array(n).fill(null), // indeks pilihan asli per soal asli
      flags: Array(n).fill(false),
      current: 0,
      endsAt: Date.now() + EXAM_CONFIG.durationMinutes * 60 * 1000,
      finished: false
    };
    save();
    startExam();
  });

  // ---------- Ujian ----------
  function startExam() {
    buildNav();
    renderQuestion();
    show("screenExam");
    tick();
    clearInterval(timerId);
    timerId = setInterval(tick, 1000);
  }

  function tick() {
    const left = Math.max(0, state.endsAt - Date.now());
    const m = Math.floor(left / 60000);
    const s = Math.floor((left % 60000) / 1000);
    $("timerValue").textContent = `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
    $("timer").classList.toggle("warning", left <= 60000);
    if (left <= 0) finish();
  }

  function buildNav() {
    const grid = $("navGrid");
    grid.innerHTML = "";
    state.order.forEach((_, i) => {
      const b = document.createElement("button");
      b.className = "nav-btn";
      b.textContent = i + 1;
      b.addEventListener("click", () => goTo(i));
      grid.appendChild(b);
    });
  }

  function renderQuestion() {
    const pos = state.current;
    const qi = state.order[pos];
    const q = QUESTIONS[qi];

    $("qNumber").textContent = `Soal ${pos + 1} dari ${state.order.length}`;
    $("qText").textContent = q.question;

    const box = $("qOptions");
    box.innerHTML = "";
    state.optionOrders[qi].forEach((oi, displayIdx) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "option" + (state.answers[qi] === oi ? " selected" : "");
      btn.setAttribute("role", "radio");
      btn.setAttribute("aria-checked", state.answers[qi] === oi);
      btn.innerHTML = `<span class="letter">${LETTERS[displayIdx]}</span><span class="text"></span>`;
      btn.querySelector(".text").textContent = q.options[oi];
      btn.addEventListener("click", () => selectAnswer(qi, oi));
      box.appendChild(btn);
    });

    $("btnPrev").disabled = pos === 0;
    $("btnNext").disabled = pos === state.order.length - 1;
    $("btnFlag").classList.toggle("active", state.flags[qi]);
    updateStatus();
  }

  function updateStatus() {
    const answered = state.answers.filter((a) => a !== null).length;
    const total = state.order.length;
    $("qProgress").textContent = `${answered} / ${total} dijawab`;
    $("progressBar").style.width = `${(answered / total) * 100}%`;

    [...$("navGrid").children].forEach((b, i) => {
      const qi = state.order[i];
      b.classList.toggle("answered", state.answers[qi] !== null && !state.flags[qi]);
      b.classList.toggle("flagged", state.flags[qi]);
      b.classList.toggle("current", i === state.current);
    });
  }

  function selectAnswer(qi, oi) {
    state.answers[qi] = state.answers[qi] === oi ? null : oi; // klik ulang = batal pilih
    save();
    renderQuestion();
  }

  function goTo(pos) {
    if (pos < 0 || pos >= state.order.length) return;
    state.current = pos;
    save();
    renderQuestion();
  }

  $("btnPrev").addEventListener("click", () => goTo(state.current - 1));
  $("btnNext").addEventListener("click", () => goTo(state.current + 1));
  $("btnFlag").addEventListener("click", () => {
    const qi = state.order[state.current];
    state.flags[qi] = !state.flags[qi];
    save();
    renderQuestion();
  });

  // Navigasi keyboard: ← → dan huruf A–F
  document.addEventListener("keydown", (e) => {
    if ($("screenExam").hidden || !$("modal").hidden) return;
    if (e.target.tagName === "INPUT") return;
    if (e.key === "ArrowLeft") goTo(state.current - 1);
    else if (e.key === "ArrowRight") goTo(state.current + 1);
    else {
      const idx = LETTERS.indexOf(e.key.toUpperCase());
      const qi = state.order[state.current];
      const opts = state.optionOrders[qi];
      if (idx >= 0 && idx < opts.length) selectAnswer(qi, opts[idx]);
    }
  });

  // ---------- Konfirmasi ----------
  $("btnFinish").addEventListener("click", () => {
    const empty = state.answers.filter((a) => a === null).length;
    const flagged = state.flags.filter(Boolean).length;
    const parts = [];
    if (empty) parts.push(`${empty} soal belum dijawab`);
    if (flagged) parts.push(`${flagged} soal ditandai ragu-ragu`);
    $("modalText").textContent = parts.length
      ? `Masih ada ${parts.join(" dan ")}. Jawaban tidak bisa diubah setelah dikumpulkan.`
      : "Semua soal sudah dijawab. Jawaban tidak bisa diubah setelah dikumpulkan.";
    $("modal").hidden = false;
    $("modalOk").focus();
  });
  $("modalCancel").addEventListener("click", () => ($("modal").hidden = true));
  $("modalOk").addEventListener("click", () => {
    $("modal").hidden = true;
    finish();
  });

  // ---------- Hasil ----------
  function finish() {
    clearInterval(timerId);
    state.finished = true;
    save();
    renderResult();
  }

  function renderResult() {
    let correct = 0, empty = 0;
    QUESTIONS.forEach((q, i) => {
      if (state.answers[i] === null) empty++;
      else if (state.answers[i] === q.answer) correct++;
    });
    const total = QUESTIONS.length;
    const wrong = total - correct - empty;
    const score = Math.round((correct / total) * 100);
    const pass = score >= EXAM_CONFIG.passingScore;

    $("resPeserta").textContent = `${state.peserta.name} · ${state.peserta.id}`;
    $("resScore").textContent = score;
    $("resCorrect").textContent = correct;
    $("resWrong").textContent = wrong;
    $("resEmpty").textContent = empty;
    const st = $("resStatus");
    st.textContent = pass ? "LULUS" : "BELUM LULUS";
    st.className = "status center " + (pass ? "pass" : "fail");

    $("reviewList").hidden = true;
    $("btnReview").textContent = "Lihat Pembahasan";
    show("screenResult");
  }

  function renderReview() {
    const list = $("reviewList");
    list.innerHTML = "";
    state.order.forEach((qi, pos) => {
      const q = QUESTIONS[qi];
      const picked = state.answers[qi];
      const ok = picked === q.answer;
      const item = document.createElement("div");
      item.className = "review-item" + (ok ? "" : " wrong");

      const h = document.createElement("h4");
      const title = document.createElement("span");
      title.textContent = `${pos + 1}. ${q.question}`;
      const tag = document.createElement("span");
      tag.className = "tag" + (ok ? " ok" : "");
      tag.textContent = picked === null ? "Kosong" : ok ? "Benar" : "Salah";
      h.append(title, tag);
      item.appendChild(h);

      const ul = document.createElement("ul");
      state.optionOrders[qi].forEach((oi, d) => {
        const li = document.createElement("li");
        li.textContent = `${LETTERS[d]}. ${q.options[oi]}`;
        if (oi === q.answer) li.className = "correct";
        else if (oi === picked) li.className = "picked-wrong";
        ul.appendChild(li);
      });
      item.appendChild(ul);

      if (q.explain) {
        const p = document.createElement("p");
        p.className = "explain";
        p.textContent = q.explain;
        item.appendChild(p);
      }
      list.appendChild(item);
    });
  }

  $("btnReview").addEventListener("click", () => {
    const list = $("reviewList");
    if (list.hidden) renderReview();
    list.hidden = !list.hidden;
    $("btnReview").textContent = list.hidden ? "Lihat Pembahasan" : "Sembunyikan Pembahasan";
  });

  $("btnRestart").addEventListener("click", () => {
    clear();
    state = null;
    $("formStart").reset();
    show("screenStart");
  });

  // ---------- Boot: lanjutkan sesi jika halaman di-refresh ----------
  initStart();
  const saved = load();
  if (saved && saved.order && saved.order.length === QUESTIONS.length) {
    state = saved;
    if (state.finished) renderResult();
    else if (Date.now() >= state.endsAt) finish();
    else startExam();
  } else {
    show("screenStart");
  }
})();

'use strict';

/* ══════════════════════════════════════════════════════
   QUESTION BANK  (15 questions → 10 picked randomly)
   Options are further shuffled per-student at runtime.
══════════════════════════════════════════════════════ */
const BANK = [
  { q:"Which data structure follows Last In, First Out (LIFO) order?",
    opts:["Queue","Stack","Linked List","Binary Tree"], ans:1 },
  { q:"What does HTML stand for?",
    opts:["Hyper Text Markup Language","High Tech Modern Language","Hyper Transfer Markup Link","Home Tool Markup Language"], ans:0 },
  { q:"Which CSS property changes the font size of text?",
    opts:["text-style","font-size","text-size","font-scale"], ans:1 },
  { q:"In JavaScript, which keyword declares a block-scoped variable?",
    opts:["var","int","let","def"], ans:2 },
  { q:"Which HTTP method is typically used to submit form data to a server?",
    opts:["GET","PUT","PATCH","POST"], ans:3 },
  { q:"In OOP, the concept of bundling data and methods inside a class is called:",
    opts:["Inheritance","Polymorphism","Abstraction","Encapsulation"], ans:3 },
  { q:"What does SQL stand for?",
    opts:["Structured Query Language","Simple Question Logic","Standard Query Line","System Queue Language"], ans:0 },
  { q:"Which of the following is NOT a JavaScript framework or library?",
    opts:["React","Angular","Django","Vue"], ans:2 },
  { q:"What is the average-case time complexity of binary search?",
    opts:["O(n)","O(n²)","O(log n)","O(1)"], ans:2 },
  { q:"Which HTML tag is used to link an external CSS stylesheet?",
    opts:["<style>","<link>","<css>","<script>"], ans:1 },
  { q:"What does API stand for?",
    opts:["Application Programming Interface","Applied Program Interaction","Automated Processing Input","Application Process Integration"], ans:0 },
  { q:"Which of these is a document-oriented (NoSQL) database?",
    opts:["MySQL","PostgreSQL","MongoDB","SQLite"], ans:2 },
  { q:"In Git, which command creates a new branch and switches to it in one step?",
    opts:["git branch -n","git checkout -b","git switch --create","git new branch"], ans:1 },
  { q:"What does the 'C' stand for in CSS?",
    opts:["Computer","Custom","Cascading","Creative"], ans:2 },
  { q:"Which sorting algorithm typically has the best average-case performance?",
    opts:["Bubble Sort","Insertion Sort","Quick Sort","Selection Sort"], ans:2 },
];

const PICK    = 10;
const TIMEOUT = 30;
const MAX_VIO = 3;
const CIRCUMF = 2 * Math.PI * 28.5;   // r=28.5 → 179.07
const LETTERS = ['A','B','C','D'];


/* ══════════════════════════════════════════
   CLASS: Watermark
   Canvas overlay — diagonal tiled name/ID/time
══════════════════════════════════════════ */
class Watermark {
  constructor(canvas) {
    this.cvs  = canvas;
    this.ctx  = canvas.getContext('2d');
    this.name = '';
    this.id   = '';
    this.time = '';
    this._active   = false;
    this._onResize = () => this._draw();
  }

  update(name, id, time) {
    this.name = name;
    this.id   = id;
    this.time = time;
    if (this._active) this._draw();
  }

  start() {
    this._active = true;
    this._draw();
    window.addEventListener('resize', this._onResize);
  }

  stop() {
    this._active = false;
    this.ctx.clearRect(0, 0, this.cvs.width, this.cvs.height);
    window.removeEventListener('resize', this._onResize);
  }

  _draw() {
    const cvs = this.cvs;
    cvs.width  = window.innerWidth;
    cvs.height = window.innerHeight;
    const ctx = this.ctx;
    const W   = cvs.width, H = cvs.height;

    ctx.save();
    ctx.translate(W / 2, H / 2);
    ctx.rotate(-Math.PI / 6);
    ctx.translate(-W / 2, -H / 2);

    ctx.fillStyle = '#00C4B4';
    ctx.textAlign = 'center';

    const cSp  = 260, rSp = 100;
    const cols = Math.ceil(W / cSp) + 3;
    const rows = Math.ceil(H / rSp) + 6;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = (c - 1) * cSp + cSp / 2;
        const y = (r - 3) * rSp + 14;
        ctx.font = 'bold 12px Inter,sans-serif';
        ctx.fillText(this.name || 'Student Name', x, y);
        ctx.font = '600 11px Inter,sans-serif';
        ctx.fillText(this.id ? 'ID: ' + this.id : 'ID: ——', x, y + 16);
        if (this.time) {
          ctx.font = '11px Inter,sans-serif';
          ctx.fillText(this.time, x, y + 31);
        }
      }
    }
    ctx.restore();
  }
}


/* ══════════════════════════════════════════
   CLASS: SecurityManager
   Tab-switch, blur, keyboard, clipboard lockdown
══════════════════════════════════════════ */
class SecurityManager {
  constructor(onViolation) {
    this.onViolation = onViolation;
    this._active     = false;
    this._cooldown   = false;
    this._blurTimer  = null;
    this._h          = {};
  }

  activate() {
    if (this._active) return;
    this._active = true;

    this._h.vis = () => {
      if (document.visibilityState === 'hidden') this._fire('tab_switch');
    };

    this._h.blur = () => {
      if (!this._active) return;
      clearTimeout(this._blurTimer);
      this._blurTimer = setTimeout(() => {
        if (!document.hasFocus()) this._fire('window_blur');
      }, 400);
    };
    this._h.focus = () => clearTimeout(this._blurTimer);

    this._h.ctx  = (e) => e.preventDefault();

    this._h.key = (e) => {
      if (/^F\d{1,2}$/.test(e.key)) { e.preventDefault(); return; }
      if (e.key === 'PrintScreen')   { e.preventDefault(); return; }

      const ctrl = e.ctrlKey || e.metaKey;
      const blocked = [
        {ctrl:true,shift:true,key:'I'},{ctrl:true,shift:true,key:'J'},
        {ctrl:true,shift:true,key:'C'},{ctrl:true,key:'U'},
        {ctrl:true,key:'C'},{ctrl:true,key:'X'},{ctrl:true,key:'V'},
        {ctrl:true,key:'A'},{ctrl:true,key:'F'},
        {ctrl:true,key:'T'},{ctrl:true,key:'N'},{ctrl:true,key:'W'},
        {ctrl:true,key:'S'},{ctrl:true,key:'P'},{ctrl:true,key:'H'},
        {ctrl:true,key:'R'},{ctrl:true,shift:true,key:'R'},
      ];
      for (const b of blocked) {
        const shiftOk = b.shift ? e.shiftKey : true;
        if (ctrl && shiftOk && e.key.toUpperCase() === b.key) {
          e.preventDefault(); return;
        }
      }
    };

    this._h.copy  = (e) => e.preventDefault();
    this._h.cut   = (e) => e.preventDefault();
    this._h.paste = (e) => e.preventDefault();
    this._h.drag  = (e) => e.preventDefault();

    document.addEventListener('visibilitychange', this._h.vis);
    window.addEventListener('blur',               this._h.blur);
    window.addEventListener('focus',              this._h.focus);
    document.addEventListener('contextmenu',      this._h.ctx);
    document.addEventListener('keydown',          this._h.key);
    document.addEventListener('copy',             this._h.copy);
    document.addEventListener('cut',              this._h.cut);
    document.addEventListener('paste',            this._h.paste);
    document.addEventListener('dragstart',        this._h.drag);
  }

  deactivate() {
    this._active = false;
    document.removeEventListener('visibilitychange', this._h.vis);
    window.removeEventListener('blur',               this._h.blur);
    window.removeEventListener('focus',              this._h.focus);
    document.removeEventListener('contextmenu',      this._h.ctx);
    document.removeEventListener('keydown',          this._h.key);
    document.removeEventListener('copy',             this._h.copy);
    document.removeEventListener('cut',              this._h.cut);
    document.removeEventListener('paste',            this._h.paste);
    document.removeEventListener('dragstart',        this._h.drag);
  }

  _fire(type) {
    if (!this._active || this._cooldown) return;
    this._cooldown = true;
    setTimeout(() => { this._cooldown = false; }, 4200);
    this.onViolation(type);
  }
}


/* ══════════════════════════════════════════
   CLASS: QuizTimer
   Countdown with pause/resume support
══════════════════════════════════════════ */
class QuizTimer {
  constructor(duration, onTick, onExpire) {
    this.duration  = duration;
    this.onTick    = onTick;
    this.onExpire  = onExpire;
    this.remaining = duration;
    this._iv       = null;
  }

  start(fromRemaining) {
    this.stop();
    this.remaining = (fromRemaining !== undefined) ? fromRemaining : this.duration;
    this.onTick(this.remaining, this.duration);
    this._iv = setInterval(() => {
      this.remaining--;
      this.onTick(this.remaining, this.duration);
      if (this.remaining <= 0) { this.stop(); this.onExpire(); }
    }, 1000);
  }

  stop() { clearInterval(this._iv); this._iv = null; }
  get rem() { return this.remaining; }
}


/* ══════════════════════════════════════════
   CLASS: Proctor
   Webcam access + periodic + on-demand snapshots
══════════════════════════════════════════ */
class Proctor {
  /**
   * @param {HTMLVideoElement} videoEl  — live preview element in the header
   * @param {function} onSnap           — called with (totalCount) after each snapshot
   */
  constructor(videoEl, onSnap) {
    this._video   = videoEl;
    this._onSnap  = onSnap || null;
    this.stream   = null;
    this.snapshots = [];     // [{time, label, dataUrl}]
    this._iv      = null;
    this.active   = false;
  }

  /** Request camera; resolves true/false */
  async start() {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 320 }, height: { ideal: 240 }, facingMode: 'user' },
        audio: false
      });
      this._video.srcObject = this.stream;
      await this._video.play();
      this.active = true;

      // First snapshot after 2 s (camera needs a moment to focus)
      setTimeout(() => this.snap('exam_start'), 2000);

      // Periodic snapshot every 60 s
      this._iv = setInterval(() => this.snap('periodic'), 60_000);

      return true;
    } catch (e) {
      this.active = false;
      return false;
    }
  }

  /** Take a snapshot now with an optional label */
  snap(label = 'manual') {
    if (!this.active || !this._video || this._video.readyState < 2) return;

    const cvs = document.createElement('canvas');
    cvs.width  = 320;
    cvs.height = 240;
    cvs.getContext('2d').drawImage(this._video, 0, 0, 320, 240);

    this.snapshots.push({
      time:    new Date().toISOString(),
      label,
      dataUrl: cvs.toDataURL('image/jpeg', 0.65)
    });

    if (this._onSnap) this._onSnap(this.snapshots.length);
  }

  stop() {
    clearInterval(this._iv);
    if (this.stream) this.stream.getTracks().forEach(t => t.stop());
    this.active = false;
  }
}


/* ══════════════════════════════════════════
   CLASS: ReportExporter
   Builds + downloads JSON and PDF audit reports
══════════════════════════════════════════ */
class ReportExporter {
  constructor(app) { this.app = app; }

  /* ── Assemble the data object ── */
  _build() {
    const a = this.app;
    const total   = a.answers.length;
    const correct = a.answers.filter(x => !x.skipped && x.sel === x.correct).length;
    const wrong   = a.answers.filter(x => !x.skipped && x.sel !== x.correct).length;
    const skipped = a.answers.filter(x => x.skipped).length;
    const pct     = total ? Math.round((correct / total) * 100) : 0;

    return {
      meta: {
        title:       'SecureQuiz Exam Report',
        generatedAt: new Date().toISOString(),
        version:     '2.0',
        checksum:    null   // filled in by exportJSON
      },
      student: {
        name: a.studentName,
        id:   a.studentId
      },
      summary: {
        score:      pct,
        correct,
        wrong,
        skipped,
        total,
        passed:     pct >= 50 && !a.terminated,
        terminated: a.terminated,
        violations: a.violations
      },
      questions: a.answers.map((ans, i) => ({
        index:         i + 1,
        question:      ans.q,
        options:       ans.displayOpts,
        correctAnswer: ans.correctText,
        studentAnswer: ans.selText || '(skipped)',
        result:        ans.skipped ? 'skipped' : (ans.sel === ans.correct ? 'correct' : 'wrong'),
        timeSpentSec:  ans.timeSpent
      })),
      violations: a.violationLog,
      snapshots:  a.proctor
        ? a.proctor.snapshots.map(s => ({ time: s.time, label: s.label, dataUrl: s.dataUrl }))
        : []
    };
  }

  /* ── SHA-256 of a string ── */
  async _sha256(str) {
    const buf  = new TextEncoder().encode(str);
    const hash = await crypto.subtle.digest('SHA-256', buf);
    return Array.from(new Uint8Array(hash))
      .map(b => b.toString(16).padStart(2, '0')).join('');
  }

  /* ── Download JSON ── */
  async exportJSON() {
    const data = this._build();

    // Hash everything except the checksum field itself
    const { meta: { checksum: _c, ...metaRest }, ...rest } = data;
    const checksum = await this._sha256(JSON.stringify({ meta: metaRest, ...rest }));
    data.meta.checksum = checksum;

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `SecureQuiz_${this.app.studentId}_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    return checksum;   // returned so PDF can embed it
  }

  /* ── Open printable HTML report → Save as PDF ── */
  async exportPDF() {
    const data     = this._build();
    // compute checksum for embedding in PDF too
    const { meta: { checksum: _c, ...metaRest }, ...rest } = data;
    const checksum = await this._sha256(JSON.stringify({ meta: metaRest, ...rest }));
    data.meta.checksum = checksum;

    const win = window.open('', '_blank');
    if (!win) { alert('Please allow pop-ups to export the PDF report.'); return; }
    win.document.write(this._buildHTML(data));
    win.document.close();
    setTimeout(() => win.print(), 700);
  }

  /* ── Generate printable HTML ── */
  _buildHTML(data) {
    const fmtTime = iso => new Date(iso).toLocaleTimeString('en-GB',
      { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const fmtDT = iso => new Date(iso).toLocaleString();

    /* Question rows */
    const qRows = data.questions.map(q => {
      const icon = q.result === 'correct' ? '✅' : (q.result === 'skipped' ? '⏭' : '❌');
      const optsHtml = (q.options || []).map((o, i) => {
        const isCorrect = o === q.correctAnswer;
        const isStudent = o === q.studentAnswer;
        let style = 'display:block;padding:2px 0;';
        if (isCorrect) style += 'color:#1B8A4F;font-weight:bold;';
        if (isStudent && !isCorrect) style += 'color:#C0392B;font-weight:bold;';
        return `<span style="${style}">${LETTERS[i]}. ${o}</span>`;
      }).join('');

      return `<tr>
        <td>${q.index}</td>
        <td>${q.question}</td>
        <td><div style="font-size:10px;line-height:1.8">${optsHtml}</div></td>
        <td>${q.studentAnswer}</td>
        <td>${q.correctAnswer}</td>
        <td style="text-align:center;font-size:1.1em">${icon}</td>
        <td style="text-align:center">${q.timeSpentSec}s</td>
      </tr>`;
    }).join('');

    /* Violation rows */
    const vRows = data.violations.length
      ? data.violations.map(v => `<tr>
          <td>${v.n}</td>
          <td>${fmtDT(v.time)}</td>
          <td>${v.type === 'tab_switch' ? 'Tab Switch' : 'Window Blur'}</td>
          <td>Q${v.qIdx + 1}</td>
        </tr>`).join('')
      : '<tr><td colspan="4" style="text-align:center;color:#888;padding:12px">No violations recorded</td></tr>';

    /* Snapshot grid */
    const snapGrid = data.snapshots.length
      ? `<div style="display:flex;flex-wrap:wrap;gap:14px;margin-top:8px">
          ${data.snapshots.map(s => `
            <div style="text-align:center">
              <img src="${s.dataUrl}" style="width:160px;height:120px;object-fit:cover;border:1px solid #ddd;border-radius:5px;display:block">
              <p style="font-size:10px;color:#888;margin-top:4px">${fmtDT(s.time)}<br><em>${s.label}</em></p>
            </div>`).join('')}
        </div>`
      : '<p style="color:#888;font-size:11px;margin-top:6px">Camera was not available or access was denied.</p>';

    const passColor = data.summary.passed ? '#1B8A4F' : '#C0392B';
    const verdict   = data.summary.terminated
      ? 'TERMINATED' : (data.summary.passed ? 'PASSED' : 'FAILED');

    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Exam Report — ${data.student.name}</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:Arial,sans-serif;font-size:12px;color:#1a1a1a;padding:32px;background:#fff}
  h1{font-size:20px;color:#0D1B2A}
  h2{font-size:13px;color:#0D1B2A;margin:22px 0 8px;
     border-bottom:2px solid #00C4B4;padding-bottom:4px;text-transform:uppercase;letter-spacing:.06em}
  .header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:22px}
  .tagline{font-size:10px;color:#888;text-transform:uppercase;letter-spacing:.1em;margin-top:2px}
  .meta-right{text-align:right;font-size:10px;color:#555;line-height:2}
  .score-row{display:flex;gap:14px;margin-bottom:22px;padding:14px 16px;
             background:#f5f7fa;border-radius:8px;border:1px solid #ddd}
  .sc{flex:1;text-align:center}
  .sc .n{font-size:22px;font-weight:bold;line-height:1.1}
  .sc .l{font-size:9px;color:#888;text-transform:uppercase;letter-spacing:.06em;margin-top:2px}
  .ok{color:#1B8A4F} .bad{color:#C0392B} .neu{color:#E67E22}
  table{width:100%;border-collapse:collapse;margin-bottom:12px;font-size:11px}
  th{background:#0D1B2A;color:#fff;padding:7px 9px;text-align:left;font-size:10px;letter-spacing:.04em}
  td{padding:6px 9px;border-bottom:1px solid #eee;vertical-align:top;line-height:1.5}
  tr:nth-child(even) td{background:#fafafa}
  .sig{margin-top:22px;padding:12px 14px;background:#f5f7fa;border:1px solid #ddd;
       border-radius:6px;font-size:10px;color:#666;word-break:break-all;line-height:1.8}
  .sig strong{color:#333;display:block;margin-bottom:3px;font-size:11px}
  @media print{body{padding:12px}@page{margin:.8cm}}
</style>
</head>
<body>

<div class="header">
  <div>
    <h1>📋 SecureQuiz</h1>
    <div class="tagline">Exam Audit Report</div>
  </div>
  <div class="meta-right">
    <div><strong>Generated:</strong> ${fmtDT(data.meta.generatedAt)}</div>
    <div><strong>Student:</strong> ${data.student.name}</div>
    <div><strong>ID:</strong> ${data.student.id}</div>
  </div>
</div>

<h2>Score Summary</h2>
<div class="score-row">
  <div class="sc"><div class="n" style="color:${passColor}">${data.summary.score}%</div><div class="l">Score</div></div>
  <div class="sc"><div class="n ok">${data.summary.correct}</div><div class="l">Correct</div></div>
  <div class="sc"><div class="n bad">${data.summary.wrong}</div><div class="l">Wrong</div></div>
  <div class="sc"><div class="n neu">${data.summary.skipped}</div><div class="l">Skipped</div></div>
  <div class="sc"><div class="n ${data.summary.violations > 0 ? 'bad' : ''}">${data.summary.violations}</div><div class="l">Violations</div></div>
  <div class="sc"><div class="n" style="color:${passColor}">${verdict}</div><div class="l">Verdict</div></div>
</div>

<h2>Question Breakdown</h2>
<table>
  <thead>
    <tr><th>#</th><th>Question</th><th>Options</th><th>Student Answer</th><th>Correct Answer</th><th>Result</th><th>Time</th></tr>
  </thead>
  <tbody>${qRows}</tbody>
</table>

<h2>Security Violations</h2>
<table>
  <thead>
    <tr><th>#</th><th>Timestamp</th><th>Type</th><th>At Question</th></tr>
  </thead>
  <tbody>${vRows}</tbody>
</table>

<h2>Webcam Snapshots (${data.snapshots.length})</h2>
${snapGrid}

<div class="sig">
  <strong>🔐 Report Integrity Signature</strong>
  This report was auto-generated by SecureQuiz on ${fmtDT(data.meta.generatedAt)}.
  Any modification to this document invalidates its authenticity.
  Verify against the exported JSON file using the checksum below.<br><br>
  <strong>SHA-256:</strong> ${data.meta.checksum || 'not computed'}
</div>

</body>
</html>`;
  }
}


/* ══════════════════════════════════════════
   CLASS: QuizApp   (main controller)
══════════════════════════════════════════ */
class QuizApp {
  constructor() {
    const $ = id => document.getElementById(id);

    /* screens */
    this.scSetup  = $('scSetup');
    this.scQuiz   = $('scQuiz');
    this.scResult = $('scResult');

    /* setup inputs */
    this.inpName = $('inp-name');
    this.inpId   = $('inp-id');

    /* quiz elements */
    this.hdrName  = $('hdr-name');
    this.hdrQn    = $('hdr-qn');
    this.tRing    = $('tRing');
    this.tNum     = $('tNum');
    this.progFill = $('progFill');
    this.progLbl  = $('progLbl');
    this.qEyebrow = $('qEyebrow');
    this.qText    = $('qText');
    this.optsGrid = $('optsGrid');
    this.nextBtn  = $('nextBtn');
    this.vioBadge = $('vioBadge');
    this.vioLbl   = $('vioLbl');

    /* overlays */
    this.vioOverlay = $('vio');
    this.vioMsg     = $('vio-msg');
    this.vioCnt     = $('vio-cnt');
    this.termDiv    = $('term');

    /* camera */
    this.camBox      = $('camBox');
    this.camFeed     = $('camFeed');
    this.snapCountEl = $('snapCount');

    /* result */
    this.rCard    = $('rCard');
    this.scoreRing= $('scoreRing');
    this.scorePct = $('scorePct');
    this.rVerdict = $('rVerdict');
    this.rSub     = $('rSub');
    this.rCorrect = $('rCorrect');
    this.rWrong   = $('rWrong');
    this.rVios    = $('rVios');
    this.bdList   = $('bdList');

    /* ── state ── */
    this.studentName  = '';
    this.studentId    = '';
    this.questions    = [];
    this.idx          = 0;
    this.selected     = null;
    this.answers      = [];
    this.violations   = 0;
    this.violationLog = [];    // detailed log for export
    this.terminated   = false;
    this._qStart      = null;  // question start timestamp (ms)

    /* ── sub-systems ── */
    this.wm       = new Watermark($('wm'));
    this.sec      = new SecurityManager(t => this._onViolation(t));
    this.tmr      = null;
    this.proctor  = null;
    this.exporter = null;

    this._bind();
  }

  /* ─── Bind UI events ─── */
  _bind() {
    document.getElementById('startBtn').addEventListener('click', () => this._start());
    [this.inpName, this.inpId].forEach(el =>
      el.addEventListener('keydown', e => { if (e.key === 'Enter') this._start(); })
    );
    this.nextBtn.addEventListener('click', () => this._next());
    document.getElementById('restartBtn').addEventListener('click', () => this._restart());
    document.getElementById('termSeeBtn').addEventListener('click', () => {
      this.termDiv.classList.remove('show');
      this._showResults();
    });
    document.getElementById('exportJSON').addEventListener('click', () => {
      if (this.exporter) this.exporter.exportJSON();
    });
    document.getElementById('exportPDF').addEventListener('click', () => {
      if (this.exporter) this.exporter.exportPDF();
    });
  }

  /* ─── Start exam ─── */
  _start() {
    const name = this.inpName.value.trim();
    const id   = this.inpId.value.trim();

    this.inpName.classList.toggle('err', !name);
    this.inpId.classList.toggle('err',   !id);
    if (!name || !id) return;

    this.studentName  = name;
    this.studentId    = id;
    this.idx          = 0;
    this.answers      = [];
    this.violations   = 0;
    this.violationLog = [];
    this.terminated   = false;

    /* ── FEATURE 1: Shuffle questions AND shuffle each question's options ── */
    this.questions = this._shuffle([...BANK]).slice(0, PICK).map(q => {
      // Create a shuffled index mapping for this question's options
      const idxArr   = [0, 1, 2, 3];
      const shuffled = this._shuffle([...idxArr]);         // e.g. [2,0,3,1]
      return {
        ...q,
        displayOpts: shuffled.map(i => q.opts[i]),         // reordered option texts
        displayAns:  shuffled.indexOf(q.ans)               // new index of correct answer
      };
    });

    this.proctor = new Proctor(this.camFeed, count => this._onSnap(count));
    this.proctor.start().then(ok => {
      if (ok) {
        this.camBox.classList.add('on');
        this.hdrName.textContent = name;
        this._showScreen('quiz');
        this.wm.update(name, id, '');
        this.wm.start();
        this.sec.activate();
        this._loadQ();
      } else {
        alert('Camera access is required to start the quiz. Please allow camera access and try again.');
        if (this.proctor) { this.proctor.stop(); this.proctor = null; }
      }
    });
  }

  /* ─── Load a question ─── */
  _loadQ() {
    if (this.idx >= this.questions.length) { this._endQuiz(); return; }

    const q = this.questions[this.idx];
    this.selected = null;
    this._qStart  = Date.now();   // record question start time

    /* header + progress */
    this.hdrQn.textContent    = `${this.idx + 1} / ${this.questions.length}`;
    const pct                  = Math.round((this.idx / this.questions.length) * 100);
    this.progFill.style.width  = pct + '%';
    this.progLbl.textContent   = pct + '%';

    /* question text */
    this.qEyebrow.textContent = `Question ${this.idx + 1}`;
    this.qText.textContent    = q.q;

    /* ── render shuffled options ── */
    this.optsGrid.innerHTML = '';
    q.displayOpts.forEach((text, i) => {
      const btn = document.createElement('button');
      btn.className = 'opt';
      btn.innerHTML = `<span class="opt-letter">${LETTERS[i]}</span><span>${text}</span>`;
      btn.addEventListener('click', () => this._pick(i));
      this.optsGrid.appendChild(btn);
    });

    /* next button */
    this.nextBtn.classList.remove('on');
    this.nextBtn.textContent = this.idx === this.questions.length - 1 ? 'Finish ✓' : 'Next →';

    /* take a webcam snapshot for every question */
    if (this.proctor) this.proctor.snap(`question_${this.idx + 1}`);

    /* timer */
    if (this.tmr) this.tmr.stop();
    this.tmr = new QuizTimer(TIMEOUT, (rem, tot) => this._tickUI(rem, tot), () => this._timeUp());
    this.tmr.start();
    this._wmTick();
  }

  /* ─── Student picks an option ─── */
  _pick(pickedIdx) {
    if (this.selected !== null) return;
    this.selected = pickedIdx;

    const btns   = this.optsGrid.querySelectorAll('.opt');
    const correct = this.questions[this.idx].displayAns;   // ← uses shuffled correct index

    btns.forEach((b, i) => {
      b.classList.add('locked');
      if (i === correct)                    b.classList.add('ok');
      else if (i === pickedIdx)             b.classList.add('bad');
    });
    btns[pickedIdx].classList.add('sel');
    this.nextBtn.classList.add('on');
  }

  /* ─── Advance to next question ─── */
  _next() {
    if (this.tmr) this.tmr.stop();

    const q         = this.questions[this.idx];
    const timeSpent = Math.round((Date.now() - this._qStart) / 1000);

    this.answers.push({
      q:           q.q,
      displayOpts: q.displayOpts,
      sel:         this.selected,
      correct:     q.displayAns,
      correctText: q.displayOpts[q.displayAns],
      selText:     this.selected !== null ? q.displayOpts[this.selected] : null,
      skipped:     this.selected === null,
      timeSpent
    });

    this.idx++;
    this._loadQ();
  }

  /* ─── Timer UI update ─── */
  _tickUI(rem, tot) {
    this.tNum.textContent = rem;
    const offset = CIRCUMF * (1 - rem / tot);
    this.tRing.style.strokeDashoffset = offset;

    let stroke = 'var(--accent)', textClr = 'var(--text)';
    if      (rem <= 5)  { stroke = 'var(--warn)';  textClr = 'var(--warn)'; }
    else if (rem <= 10) { stroke = '#FFC107';       textClr = '#FFC107'; }

    this.tRing.style.stroke = stroke;
    this.tNum.style.color   = textClr;
    this._wmTick();
  }

  /* ─── Timer expired → auto-advance ─── */
  _timeUp() {
    const correct = this.questions[this.idx].displayAns;
    this.optsGrid.querySelectorAll('.opt').forEach((b, i) => {
      b.classList.add('locked');
      if (i === correct) b.classList.add('ok');
    });
    this.nextBtn.classList.add('on');
    setTimeout(() => this._next(), 1400);
  }

  /* ─── Watermark second tick ─── */
  _wmTick() {
    const t = new Date().toLocaleTimeString('en-GB',
      { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    this.wm.update(this.studentName, this.studentId, `Q${this.idx + 1}  •  ${t}`);
  }

  /* ─── Security violation ─── */
  _onViolation(type) {
    if (this.terminated) return;
    const isFirstQ = this.idx === 0;
    if (isFirstQ) {
      if (this.proctor) this.proctor.snap('violation_first_question');
      return;
    }

    this.violations++;

    /* ── log violation for report ── */
    this.violationLog.push({
      n:    this.violations,
      type,
      time: new Date().toISOString(),
      qIdx: this.idx
    });

    /* ── snap camera on violation ── */
    if (this.proctor) this.proctor.snap('violation');

    this._updateVioUI();

    if (this.violations >= MAX_VIO) { this._terminate(); return; }

    const savedRem  = this.tmr ? this.tmr.rem : TIMEOUT;
    if (this.tmr) this.tmr.stop();

    const label = type === 'tab_switch' ? 'Tab switch detected' : 'Window focus lost';
    this.vioMsg.textContent = `${label} — Violation ${this.violations}/${MAX_VIO}. Resuming in`;
    this._updateVioDotsUI();
    this.vioOverlay.classList.add('show');

    let cd = 3;
    this.vioCnt.textContent = cd;
    const iv = setInterval(() => {
      cd--;
      this.vioCnt.textContent = cd;
      if (cd <= 0) {
        clearInterval(iv);
        this.vioOverlay.classList.remove('show');
        if (!this.terminated) this.tmr.start(savedRem);
      }
    }, 1000);
  }

  /* ─── Terminate (3 violations) ─── */
  _terminate() {
    this.terminated = true;
    if (this.tmr)     this.tmr.stop();
    if (this.proctor) this.proctor.snap('terminated');
    this.sec.deactivate();
    this.vioOverlay.classList.remove('show');

    for (let i = this.idx; i < this.questions.length; i++) {
      const q = this.questions[i];
      this.answers.push({
        q:           q.q,
        displayOpts: q.displayOpts,
        sel:         null,
        correct:     q.displayAns,
        correctText: q.displayOpts[q.displayAns],
        selText:     null,
        skipped:     true,
        timeSpent:   0,
        term:        true
      });
    }
    this.idx = this.questions.length;
    this.wm.stop();
    this.termDiv.classList.add('show');
  }

  /* ─── Normal end ─── */
  _endQuiz() {
    if (this.tmr)     this.tmr.stop();
    if (this.proctor) this.proctor.snap('exam_end');
    this.sec.deactivate();
    this.wm.stop();
    this._showResults();
  }

  /* ─── Show results screen ─── */
  _showResults() {
    if (this.proctor) this.proctor.stop();
    this._showScreen('result');

    /* ── FEATURE 3: init exporter ── */
    this.exporter = new ReportExporter(this);

    const total   = this.answers.length;
    const correct = this.answers.filter(a => !a.skipped && a.sel === a.correct).length;
    const wrong   = this.answers.filter(a => !a.skipped && a.sel !== a.correct).length;
    const pct     = total ? Math.round((correct / total) * 100) : 0;
    const pass    = pct >= 50 && !this.terminated;
    const cls     = this.terminated ? 'term' : (pass ? 'pass' : 'fail');

    this.rCard.className    = `rcard ${cls}`;
    this.scoreRing.className= `score-ring ${cls}`;
    this.scorePct.textContent = pct + '%';
    this.rVerdict.textContent = this.terminated
      ? '⛔ Exam Terminated'
      : (pass ? '🎉 Passed!' : '❌ Not Passed');
    this.rSub.textContent = this.terminated
      ? `Stopped after ${MAX_VIO} security violations.`
      : `${correct} correct out of ${total} questions · ${pct}%`;

    this.rCorrect.textContent = correct;
    this.rWrong.textContent   = wrong;
    this.rVios.textContent    = this.violations;

    this.bdList.innerHTML = '';
    this.answers.forEach((a, i) => {
      const ok   = !a.skipped && a.sel === a.correct;
      const icon = a.skipped ? '⏭' : (ok ? '✅' : '❌');
      const div  = document.createElement('div');
      div.className = 'bd-item';
      div.innerHTML =
        `<div class="bd-icon">${icon}</div>` +
        `<div class="bd-q">${i + 1}. ${a.q} <span style="opacity:.5;font-size:.78em">(${a.timeSpent}s)</span></div>`;
      this.bdList.appendChild(div);
    });
  }

  /* ─── Restart ─── */
  _restart() {
    this.inpName.value = '';
    this.inpId.value   = '';
    if (this.proctor) { this.proctor.stop(); this.proctor = null; }
    this.wm.stop();
    this.sec.deactivate();
    this.termDiv.classList.remove('show');
    this.camBox.classList.remove('on');
    this.snapCountEl.textContent = '0';
    this._showScreen('setup');
  }

  /* ─── Camera snap callback ─── */
  _onSnap(count) {
    this.snapCountEl.textContent = count;
  }

  /* ─── Violation UI ─── */
  _updateVioUI() {
    this.vioLbl.textContent = `${this.violations} violation${this.violations !== 1 ? 's' : ''}`;
    if (this.violations > 0) this.vioBadge.classList.add('hit');
  }

  _updateVioDotsUI() {
    for (let i = 0; i < MAX_VIO; i++) {
      const dot = document.getElementById('vd' + i);
      if (dot) dot.classList.toggle('hit', i < this.violations);
    }
  }

  /* ─── Screen switcher ─── */
  _showScreen(name) {
    this.scSetup.classList.remove('on');
    this.scQuiz.classList.remove('on');
    this.scResult.classList.remove('on');
    ({ setup: this.scSetup, quiz: this.scQuiz, result: this.scResult })[name]
      ?.classList.add('on');
  }

  /* ─── Fisher-Yates shuffle ─── */
  _shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }
}

/* ── Boot ── */
document.addEventListener('DOMContentLoaded', () => new QuizApp());

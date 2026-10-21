// 生成「股东大会」dry-run patch：不写题库，只输出 before/after 字段全文。
// 输入：audit/outbox/qoder_shareholders_scan.json + questions/*.json
// 输出：audit/outbox/qoder_shareholders_patch.json / .md
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT = path.resolve(__dirname, '..');
const QDIR = path.join(ROOT, 'questions');
const OUTDIR = path.join(ROOT, 'audit', 'outbox');
const TERM = '股东大会';

const FIELD_ORDER = { question: 0, 'options.A': 1, 'options.B': 2, 'options.C': 3, 'options.D': 4, analysis: 5 };

function getField(q, field) {
  if (field === 'question' || field === 'analysis') return q[field];
  if (field.startsWith('options.')) return q.options ? q.options[field.slice(8)] : undefined;
  throw new Error('unknown field ' + field);
}

function setField(q, field, value) {
  if (field === 'question' || field === 'analysis') { q[field] = value; return; }
  if (field.startsWith('options.')) { q.options[field.slice(8)] = value; return; }
  throw new Error('unknown field ' + field);
}

function countTerm(text, term = TERM) {
  let n = 0, i = 0;
  while ((i = text.indexOf(term, i)) !== -1) { n++; i += term.length; }
  return n;
}

function sha(obj) {
  return crypto.createHash('sha256').update(JSON.stringify(obj)).digest('hex').slice(0, 16);
}

function guardFor(q, field) {
  const key = field.startsWith('options.') ? field.slice(8) : null;
  return sha({
    answer: q.answer,
    type: q.type,
    year: q.year,
    subject: q.subject,
    question: field === 'question' ? null : q.question,
    options: key ? { ...q.options, [key]: null } : q.options,
    analysis: field === 'analysis' ? null : q.analysis,
  });
}

function loadQuestions() {
  const qMap = new Map();
  const fileMap = new Map();
  const subjectCounts = {};
  for (const f of fs.readdirSync(QDIR).filter(x => x.endsWith('.json') && x !== 'index.json')) {
    const arr = JSON.parse(fs.readFileSync(path.join(QDIR, f), 'utf8'));
    subjectCounts[f.replace(/\.json$/, '')] = arr.length;
    for (const q of arr) {
      if (qMap.has(q.id)) throw new Error(`duplicate id ${q.id}`);
      qMap.set(q.id, q);
      fileMap.set(q.id, 'questions/' + f);
    }
  }
  return { qMap, fileMap, subjectCounts };
}

const scan = JSON.parse(fs.readFileSync(path.join(OUTDIR, 'qoder_shareholders_scan.json'), 'utf8'));
const { qMap, fileMap, subjectCounts } = loadQuestions();

const patches = [];
const problems = [];

for (const row of scan.rows) {
  const q = qMap.get(row.id);
  if (!q) { problems.push(`missing question ${row.id}`); continue; }

  const byField = new Map();
  for (const o of row.occ) {
    if (o.action !== 'replace' && o.action !== 'rewrite') continue;
    if (!byField.has(o.field)) byField.set(o.field, []);
    byField.get(o.field).push(o);
  }

  for (const [field, occs] of byField) {
    const before = getField(q, field);
    if (typeof before !== 'string') { problems.push(`${row.id} ${field} not string`); continue; }

    const edits = occs.map(o => {
      if (before.slice(o.offset, o.offset + TERM.length) !== TERM) {
        problems.push(`${row.id} ${field} offset ${o.offset} mismatch: ${JSON.stringify(before.slice(o.offset, o.offset + 8))}`);
        return null;
      }
      if (o.action === 'replace') {
        return { start: o.offset, end: o.offset + TERM.length, to: '股东会', action: 'replace' };
      }
      const prev2 = before.slice(o.offset - 2, o.offset);
      const prev1 = before.slice(o.offset - 1, o.offset);
      if (prev2 === '或者') return { start: o.offset - 2, end: o.offset + TERM.length, to: '', action: 'rewrite' };
      if (prev1 === '、') return { start: o.offset - 1, end: o.offset + TERM.length, to: '', action: 'rewrite' };
      problems.push(`${row.id} ${field} rewrite without connector at ${o.offset}`);
      return { start: o.offset, end: o.offset + TERM.length, to: '股东会', action: 'rewrite' };
    }).filter(Boolean);

    edits.sort((a, b) => b.start - a.start);
    for (const e of edits) e.from = before.slice(e.start, e.end);

    let after = before;
    for (const e of edits) after = after.slice(0, e.start) + e.to + after.slice(e.end);

    const expectedRemaining = row.occ.filter(o => o.field === field && (o.action === 'keep' || o.action === 'keep+footnote')).length;
    const actualRemaining = countTerm(after);
    if (actualRemaining !== expectedRemaining) {
      problems.push(`${row.id} ${field}: remaining ${actualRemaining} != expected ${expectedRemaining}`);
    }
    if (after === before) problems.push(`${row.id} ${field}: no change`);

    patches.push({
      id: row.id,
      subject: row.subject,
      year: row.year,
      type: row.type,
      answer: row.answer,
      field,
      actions: [...new Set(occs.map(o => o.action))],
      occurrences: occs.length,
      expectedRemaining,
      guard: guardFor(q, field),
      edits: edits.map(e => ({ start: e.start, end: e.end, from: e.from, to: e.to, action: e.action })),
      before,
      after,
    });
  }
}

patches.sort((a, b) => a.id - b.id || (FIELD_ORDER[a.field] ?? 99) - (FIELD_ORDER[b.field] ?? 99));

// ---- 全局不变量：在副本上模拟落库 ----
const clone = new Map();
for (const [id, q] of qMap) clone.set(id, JSON.parse(JSON.stringify(q)));
for (const p of patches) setField(clone.get(p.id), p.field, p.after);

let totalQuestions = 0;
let remaining = 0;
for (const q of clone.values()) {
  totalQuestions++;
  for (const field of ['question', 'options.A', 'options.B', 'options.C', 'options.D', 'analysis']) {
    const v = getField(q, field);
    if (typeof v === 'string') remaining += countTerm(v);
  }
}

const scanKeep = scan.rows.reduce((n, r) => n + r.occ.filter(o => o.action === 'keep' || o.action === 'keep+footnote').length, 0);
const scanChange = scan.rows.reduce((n, r) => n + r.occ.filter(o => o.action === 'replace' || o.action === 'rewrite').length, 0);

// 除 patch 字段外不得有任何差异
const changedFields = new Set(patches.map(p => `${p.id}|${p.field}`));
const unexpectedDiffs = [];
for (const [id, q] of qMap) {
  const q2 = clone.get(id);
  for (const field of ['question', 'options.A', 'options.B', 'options.C', 'options.D', 'analysis']) {
    const a = getField(q, field), b = getField(q2, field);
    if (a !== b && !changedFields.has(`${id}|${field}`)) unexpectedDiffs.push(`${id} ${field}`);
  }
}

// 答案分布不变
const dist = m => {
  const d = {};
  for (const q of m.values()) d[q.answer] = (d[q.answer] || 0) + 1;
  return d;
};
const distBefore = dist(qMap), distAfter = dist(clone);

const checks = {
  patchFields: patches.length,
  patchesByQuestion: new Set(patches.map(p => p.id)).size,
  edits: patches.reduce((n, p) => n + p.edits.length, 0),
  scanChange,
  totalQuestions,
  termBefore: scan.rows.reduce((n, r) => n + r.count, 0),
  termAfter: remaining,
  termKeptExpected: scanKeep,
  unexpectedDiffs,
  answerDistributionStable: JSON.stringify(distBefore) === JSON.stringify(distAfter),
  subjectCounts,
  problems,
  pass: problems.length === 0 &&
        patches.reduce((n, p) => n + p.edits.length, 0) === scanChange &&
        remaining === scanKeep &&
        unexpectedDiffs.length === 0 &&
        JSON.stringify(distBefore) === JSON.stringify(distAfter),
};

const out = {
  meta: {
    generatedAt: new Date().toISOString(),
    term: TERM,
    note: 'dry-run only; 不写 questions/*.json',
    ...checks,
  },
  patches,
};

fs.writeFileSync(path.join(OUTDIR, 'qoder_shareholders_patch.json'), JSON.stringify(out, null, 2), 'utf8');

const md = [];
md.push('# 「股东大会」dry-run patch');
md.push('');
md.push(`- 生成：${out.meta.generatedAt}`);
md.push(`- 范围：**${checks.patchesByQuestion} 题 / ${checks.patchFields} 字段 / ${checks.edits} 处编辑**`);
md.push(`- 全库「股东大会」：${checks.termBefore} → **${checks.termAfter}**（保留项 ${checks.termKeptExpected}）`);
md.push(`- 题目总数：${checks.totalQuestions}`);
md.push(`- 答案分布不变：${checks.answerDistributionStable ? '是' : '否'}`);
md.push(`- 非 patch 字段差异：${checks.unexpectedDiffs.length ? checks.unexpectedDiffs.join(', ') : '无'}`);
md.push(`- 自检：**${checks.pass ? 'PASS' : 'FAIL'}**`);
if (problems.length) {
  md.push('');
  md.push('## 问题');
  for (const p of problems) md.push(`- ${p}`);
}
md.push('');
for (const p of patches) {
  md.push(`## ${p.id} · ${p.subject} · ${p.field} · ${p.actions.join('+')} ×${p.occurrences}`);
  md.push('');
  md.push('**before**');
  md.push('');
  md.push('```text');
  md.push(p.before);
  md.push('```');
  md.push('');
  md.push('**after**');
  md.push('');
  md.push('```text');
  md.push(p.after);
  md.push('```');
  md.push('');
  md.push('edits：' + p.edits.map(e => `[${e.start},${e.end}) “${e.from}”→“${e.to}”`).join('；'));
  md.push('');
}
fs.writeFileSync(path.join(OUTDIR, 'qoder_shareholders_patch.md'), md.join('\n'), 'utf8');

console.log(JSON.stringify(checks, null, 2));

// 自校验：核对 dry-run patch 与题库当前状态，不写任何文件到 questions/。
// 用法：node audit/qoder_shareholders_patch_check.js
// 状态：pending=待落库；applied=已落库；stale=题库已变动，需重新生成 patch。
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT = path.resolve(__dirname, '..');
const QDIR = path.join(ROOT, 'questions');
const OUTDIR = path.join(ROOT, 'audit', 'outbox');
const TERM = '股东大会';

const patchDoc = JSON.parse(fs.readFileSync(path.join(OUTDIR, 'qoder_shareholders_patch.json'), 'utf8'));
const scan = JSON.parse(fs.readFileSync(path.join(OUTDIR, 'qoder_shareholders_scan.json'), 'utf8'));

function getField(q, field) {
  if (field === 'question' || field === 'analysis') return q[field];
  if (field.startsWith('options.')) return q.options ? q.options[field.slice(8)] : undefined;
  throw new Error('unknown field ' + field);
}
function setField(q, field, v) {
  if (field === 'question' || field === 'analysis') { q[field] = v; return; }
  if (field.startsWith('options.')) { q.options[field.slice(8)] = v; return; }
  throw new Error('unknown field ' + field);
}
function sha(obj) {
  return crypto.createHash('sha256').update(JSON.stringify(obj)).digest('hex').slice(0, 16);
}
function guardFor(q, field) {
  const key = field.startsWith('options.') ? field.slice(8) : null;
  return sha({
    answer: q.answer, type: q.type, year: q.year, subject: q.subject,
    question: field === 'question' ? null : q.question,
    options: key ? { ...q.options, [key]: null } : q.options,
    analysis: field === 'analysis' ? null : q.analysis,
  });
}
function countTerm(text) {
  let n = 0, i = 0;
  while ((i = text.indexOf(TERM, i)) !== -1) { n++; i += TERM.length; }
  return n;
}
function applyEdits(before, edits) {
  let after = before;
  for (const e of [...edits].sort((a, b) => b.start - a.start)) {
    if (after.slice(e.start, e.end) !== e.from) throw new Error(`edit mismatch at ${e.start}: ${JSON.stringify(after.slice(e.start, e.end))}`);
    after = after.slice(0, e.start) + e.to + after.slice(e.end);
  }
  return after;
}

const qMap = new Map();
const subjectCounts = {};
for (const f of fs.readdirSync(QDIR).filter(x => x.endsWith('.json') && x !== 'index.json')) {
  const arr = JSON.parse(fs.readFileSync(path.join(QDIR, f), 'utf8'));
  subjectCounts[f.replace(/\.json$/, '')] = arr.length;
  for (const q of arr) {
    if (qMap.has(q.id)) throw new Error(`duplicate id ${q.id}`);
    qMap.set(q.id, q);
  }
}

const failures = [];
const warnings = [];
const results = [];
const statuses = { pending: 0, applied: 0, stale: 0 };

for (const p of patchDoc.patches) {
  const q = qMap.get(p.id);
  if (!q) { failures.push(`${p.id} ${p.field}: question not found`); continue; }
  const cur = getField(q, p.field);
  const status = cur === p.before ? 'pending' : cur === p.after ? 'applied' : 'stale';
  statuses[status]++;
  if (status === 'stale') failures.push(`${p.id} ${p.field}: stale（当前内容与 before/after 均不符）`);

  if (guardFor(q, p.field) !== p.guard) failures.push(`${p.id} ${p.field}: guard 不符（答案/其他字段被改动）`);

  let rebuilt;
  try { rebuilt = applyEdits(p.before, p.edits); }
  catch (e) { failures.push(`${p.id} ${p.field}: edits 无法复现（${e.message}）`); continue; }
  if (rebuilt !== p.after) failures.push(`${p.id} ${p.field}: before+edits ≠ after`);

  const remaining = countTerm(p.after);
  if (remaining !== p.expectedRemaining) failures.push(`${p.id} ${p.field}: after 剩余 ${remaining} ≠ ${p.expectedRemaining}`);
  if (p.edits.length !== p.occurrences) failures.push(`${p.id} ${p.field}: edits ${p.edits.length} ≠ occurrences ${p.occurrences}`);

  results.push({ id: p.id, field: p.field, status, edits: p.edits.length, remaining });
}

// 覆盖度：patch 必须与 scan 的 replace/rewrite 逐处一一对应
const scanKeys = new Set();
for (const r of scan.rows) for (const o of r.occ) {
  if (o.action === 'replace' || o.action === 'rewrite') scanKeys.add(`${r.id}|${o.field}|${o.offset}|${o.action}`);
}
const patchKeys = new Set();
for (const p of patchDoc.patches) for (const e of p.edits) {
  const termOffset = e.end - TERM.length;
  patchKeys.add(`${p.id}|${p.field}|${termOffset}|${e.action}`);
}
for (const k of scanKeys) if (!patchKeys.has(k)) failures.push('漏 patch: ' + k);
for (const k of patchKeys) if (!scanKeys.has(k)) failures.push('多余 patch: ' + k);

// 全局：全 pending 时模拟落库；全 applied 时直接读库
const allPending = statuses.pending === patchDoc.patches.length && statuses.stale === 0;
const allApplied = statuses.applied === patchDoc.patches.length && statuses.stale === 0;

let termBefore = 0, termAfter = 0, totalQuestions = 0;
if (allPending) {
  const clone = new Map();
  for (const [id, q] of qMap) clone.set(id, JSON.parse(JSON.stringify(q)));
  for (const p of patchDoc.patches) setField(clone.get(p.id), p.field, p.after);
  for (const q of qMap.values()) for (const f of ['question', 'options.A', 'options.B', 'options.C', 'options.D', 'analysis']) {
    const v = getField(q, f); if (typeof v === 'string') termBefore += countTerm(v);
  }
  for (const q of clone.values()) { totalQuestions++; for (const f of ['question', 'options.A', 'options.B', 'options.C', 'options.D', 'analysis']) {
    const v = getField(q, f); if (typeof v === 'string') termAfter += countTerm(v);
  } }
} else if (allApplied) {
  for (const q of qMap.values()) { totalQuestions++; for (const f of ['question', 'options.A', 'options.B', 'options.C', 'options.D', 'analysis']) {
    const v = getField(q, f); if (typeof v === 'string') termAfter += countTerm(v);
  } }
  termBefore = termAfter + patchDoc.meta.edits;
} else {
  failures.push(`patch 状态不完整：pending=${statuses.pending} applied=${statuses.applied} stale=${statuses.stale}`);
}

const expectedAfter = patchDoc.meta.termKeptExpected;
if (termAfter !== expectedAfter) failures.push(`全库「股东大会」剩余 ${termAfter} ≠ 预期 ${expectedAfter}`);
if (totalQuestions !== 9730) failures.push(`题目总数 ${totalQuestions} ≠ 9730`);
if (patchDoc.meta.termBefore !== 75) warnings.push(`meta.termBefore=${patchDoc.meta.termBefore}（预期 75）`);

const lines = [];
lines.push('「股东大会」patch 自校验');
lines.push(`时间：${new Date().toISOString()}`);
lines.push(`patch：${patchDoc.patches.length} 字段 / ${patchDoc.meta.patchesByQuestion} 题 / ${patchDoc.meta.edits} 处`);
lines.push(`状态：pending=${statuses.pending} applied=${statuses.applied} stale=${statuses.stale}`);
lines.push(`全库「股东大会」：${termBefore} → ${termAfter}（预期 ${expectedAfter}）`);
lines.push(`题目总数：${totalQuestions}`);
lines.push(`逐处覆盖：scan ${scanKeys.size} / patch ${patchKeys.size}`);
lines.push(`结果：${failures.length ? 'FAIL' : 'PASS'}`);
if (warnings.length) { lines.push('', 'WARN'); for (const w of warnings) lines.push('- ' + w); }
if (failures.length) { lines.push('', 'FAILURES'); for (const f of failures) lines.push('- ' + f); }
lines.push('', '逐字段：');
for (const r of results) lines.push(`- ${r.id} ${r.field} ${r.status} edits=${r.edits} remaining=${r.remaining}`);

const report = lines.join('\n');
fs.writeFileSync(path.join(OUTDIR, 'qoder_shareholders_patch_check.txt'), report, 'utf8');
console.log(report);
process.exit(failures.length ? 1 : 0);

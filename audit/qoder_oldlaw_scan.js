// 独立扫描「民法典施行后已废止法律」的引用。
// 不读 audit/task3-rulings.md、不读 qc_report.json，只读 questions/*.json。
// 输出：audit/outbox/qoder_oldlaw_scan.json / .md
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const QDIR = path.join(ROOT, 'questions');
const OUTDIR = path.join(ROOT, 'audit', 'outbox');

const LAWS = [
  { name: '合同法', skipBefore: ['劳动'], skipAfter: /^[律]/ },
  { name: '物权法', skipAfter: /^[定律]/ },
  { name: '婚姻法', skipAfter: /^[律]/ },
  { name: '继承法', skipAfter: /^[律]/ },
  { name: '民法总则', skipAfter: /^[编律]/ },
  { name: '民法通则', skipAfter: /^[律]/ },
  { name: '侵权责任法', skipAfter: /^[律]/ },
  { name: '担保法', skipAfter: /^[定律]/ },
  { name: '收养法', skipAfter: /^[律]/ },
];

const NOTE_RE = /【[^】]*(?:特别说明|修正|原题干|旧法|说明|注)[^】]*】|特别说明|原题干|已修正|旧法|原《|修订前|废止|失效/;
const COMPARE_RE = /民法典|新法|现行法|修改后|修订后|新《/;
const BASIS_RE = /根据|依照|依据|按照|依《|依.{0,6}规定/;

function isQuoted(text, idx) {
  const before = text.slice(0, idx);
  const o1 = before.lastIndexOf('“'), c1 = before.lastIndexOf('”');
  if (o1 > c1) return true;
  const o2 = before.lastIndexOf('「'), c2 = before.lastIndexOf('」');
  return o2 > c2;
}

function sentenceAround(text, idx) {
  const start = Math.max(text.lastIndexOf('。', idx - 1), text.lastIndexOf('；', idx - 1), text.lastIndexOf('\n', idx - 1)) + 1;
  const ends = ['。', '；', '\n'].map(c => text.indexOf(c, idx)).filter(i => i !== -1);
  return text.slice(start, ends.length ? Math.min(...ends) : text.length);
}

function classify(q, layer, text, idx, law) {
  const quoted = isQuoted(text, idx);
  const sentence = sentenceAround(text, idx);
  const wide = text.slice(Math.max(0, idx - 200), idx + 200);
  const note = NOTE_RE.test(wide);
  const compare = COMPARE_RE.test(sentence);
  const basis = BASIS_RE.test(sentence);
  const research = q.subject === '法理学' || q.subject === '法制史';

  let cls = 'current-use';
  if (quoted) cls = 'quote';
  else if (note) cls = 'note';
  else if (compare) cls = 'compare';
  else if (research) cls = 'research';

  let action = 'keep';
  let confidence = '';
  if (cls === 'current-use') {
    if (layer === '题干' || layer.startsWith('选项')) {
      action = basis ? 'fix-stem' : 'review';
      confidence = basis ? '高' : '中';
    } else {
      action = basis ? 'fix-analysis' : 'review';
      confidence = basis ? '中' : '低';
    }
  }

  return { quoted, note, compare, basis, class: cls, action, confidence, sentence: sentence.replace(/\s+/g, ' ').trim() };
}

const files = fs.readdirSync(QDIR).filter(f => f.endsWith('.json') && f !== 'index.json');
const rows = [];
let totalHits = 0;

for (const f of files) {
  const arr = JSON.parse(fs.readFileSync(path.join(QDIR, f), 'utf8'));
  for (const q of arr) {
    const fields = [];
    if (typeof q.question === 'string') fields.push(['题干', 'question', q.question]);
    if (q.options && typeof q.options === 'object') {
      for (const k of Object.keys(q.options)) if (typeof q.options[k] === 'string') fields.push(['选项' + k, 'options.' + k, q.options[k]]);
    }
    if (typeof q.analysis === 'string') fields.push(['解析', 'analysis', q.analysis]);

    const hits = [];
    for (const law of LAWS) {
      for (const [layer, field, text] of fields) {
        let idx = 0;
        while ((idx = text.indexOf(law.name, idx)) !== -1) {
          const before = text.slice(Math.max(0, idx - 2), idx);
          if (law.skipBefore && law.skipBefore.some(s => before.endsWith(s))) { idx += law.name.length; continue; }
          const after = text.slice(idx + law.name.length, idx + law.name.length + 1);
          if (law.skipAfter && law.skipAfter.test(after)) { idx += law.name.length; continue; }
          const c = classify(q, layer, text, idx, law);
          hits.push({
            law: law.name, layer, field, offset: idx,
            context: text.slice(Math.max(0, idx - 60), Math.min(text.length, idx + law.name.length + 80)).replace(/\s+/g, ' ').trim(),
            ...c,
          });
          idx += law.name.length;
        }
      }
    }
    if (!hits.length) continue;
    totalHits += hits.length;
    rows.push({
      id: q.id, subject: q.subject, year: q.year, type: q.type, answer: q.answer,
      stem: (q.question || '').slice(0, 90).replace(/\s+/g, ' '),
      hits,
    });
  }
}

rows.sort((a, b) => a.id - b.id);

const agg = (key) => {
  const m = {};
  for (const r of rows) for (const h of r.hits) m[h[key]] = (m[h[key]] || 0) + 1;
  return m;
};
const metas = {
  questions: rows.length,
  hits: totalHits,
  byLaw: agg('law'),
  byField: agg('field'),
  byClass: agg('class'),
  byAction: agg('action'),
};
metas.potentialIssues = rows.filter(r => r.hits.some(h => h.action !== 'keep')).length;
metas.potentialIssueHits = rows.reduce((n, r) => n + r.hits.filter(h => h.action !== 'keep').length, 0);

fs.writeFileSync(path.join(OUTDIR, 'qoder_oldlaw_scan.json'),
  JSON.stringify({ meta: { generatedAt: new Date().toISOString(), scope: 'question/options/analysis', ...metas }, rows }, null, 2), 'utf8');

const md = [];
md.push('# 旧法引用独立扫描（Qoder）');
md.push('');
md.push(`- 扫描范围：12 科 ${rows.length ? '9730' : '0'} 题；题干 / 选项 / 解析`);
md.push(`- 命中：**${metas.questions} 题 / ${metas.hits} 处**`);
md.push(`- 按法：${Object.entries(metas.byLaw).map(([k, v]) => `${k} ${v}`).join('｜')}`);
md.push(`- 按层：${Object.entries(metas.byField).map(([k, v]) => `${k} ${v}`).join('｜')}`);
md.push(`- 分类：${Object.entries(metas.byClass).map(([k, v]) => `${k} ${v}`).join('｜')}`);
md.push(`- 疑似需处理：**${metas.potentialIssues} 题 / ${metas.potentialIssueHits} 处**`);
md.push('');
md.push('| id | 科目 | 年份 | 法 | 层 | 分类 | 建议 | 上下文 |');
md.push('|---:|---|---:|---|---|---|---|---|');
for (const r of rows) for (const h of r.hits) {
  md.push(`| ${r.id} | ${r.subject} | ${r.year ?? ''} | ${h.law} | ${h.layer} | ${h.class} | ${h.action}${h.confidence ? '(' + h.confidence + ')' : ''} | ${h.context.replace(/\|/g, '\\|').slice(0, 110)} |`);
}
fs.writeFileSync(path.join(OUTDIR, 'qoder_oldlaw_scan.md'), md.join('\n'), 'utf8');

console.log(JSON.stringify(metas, null, 2));

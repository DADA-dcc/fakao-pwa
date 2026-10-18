# -*- coding: utf-8 -*-
"""法考题库结构与内容缺陷扫描器

覆盖全部 12 个科目，检测六类可机械判定的缺陷：
  A 占位解析        B 缺共享案情材料      C 答案格式异常
  D 选项异常        E 法条条号越界        F 重复题

用法：python audit/scan.py [--json out.json] [--subject 刑法]
"""
import json, io, os, re, sys, argparse, hashlib
from collections import defaultdict, Counter

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
QDIR = os.path.join(ROOT, 'questions')

# 各部法律现行条文总数（用于识别明显越界的条号引用）
LAW_MAX = {
    '刑法': 452, '刑事诉讼法': 308, '民事诉讼法': 284, '行政诉讼法': 103,
    '民法典': 1260, '宪法': 143, '行政处罚法': 86, '行政许可法': 83,
    '行政强制法': 71, '公司法': 266, '合伙企业法': 109, '个人独资企业法': 48,
    '企业破产法': 136, '票据法': 111, '证券法': 226, '保险法': 187,
    '著作权法': 67, '专利法': 82, '商标法': 73, '反不正当竞争法': 33,
    '反垄断法': 70, '消费者权益保护法': 63, '产品质量法': 74,
    '劳动法': 107, '劳动合同法': 98, '土地管理法': 87, '城市房地产管理法': 73,
    '环境保护法': 70, '税收征收管理法': 94, '法官法': 66, '检察官法': 68,
    '律师法': 60, '公证法': 47, '仲裁法': 80, '国家赔偿法': 42,
    '监察法': 69, '立法法': 105, '全国人民代表大会组织法': 47,
    '刑法修正案（十一）': 48, '刑法修正案（十二）': 8,
}

PLACEHOLDER_PAT = re.compile(
    r'请参考相关法条与教材解析|legal knowledge|请参考官方公布|参考官方公布|'
    r'详细解析请参考|详见官方解析|请见解析|详见解析|暂无解析|无解析|待补充|待完善|TODO'
)

CASE_REF_PAT = re.compile(r'^(根据|依据|结合|针对|就)?(上述|以上|前述|该|此)(案情|材料|事实|案例|案例材料|描述)')
SHARED_PAT = re.compile(r'上述案情|上述材料|以上材料|前述材料|根据上述|结合上述|据此回答|基于上述')

ARTICLE_PAT = re.compile(r'《([^》]{2,24})》\s*第\s*([一二三四五六七八九十百千零〇\d]+)\s*条')
CN_NUM = {'零': 0, '〇': 0, '一': 1, '二': 2, '三': 3, '四': 4, '五': 5,
          '六': 6, '七': 7, '八': 8, '九': 9}


def cn2int(s):
    if s.isdigit():
        return int(s)
    total, section, num = 0, 1, 0
    for ch in s:
        if ch in CN_NUM:
            num = CN_NUM[ch]
        elif ch == '十':
            section = (num or 1) * 10
            total += section
            num = 0
        elif ch == '百':
            total += (num or 1) * 100
            num = 0
        elif ch == '千':
            total += (num or 1) * 1000
            num = 0
    return total + num


def load(subject_filter=None):
    out = []
    for fn in sorted(os.listdir(QDIR)):
        if not fn.endswith('.json') or fn == 'index.json':
            continue
        subj = fn[:-5]
        if subject_filter and subj != subject_filter:
            continue
        data = json.load(io.open(os.path.join(QDIR, fn), encoding='utf-8'))
        for idx, q in enumerate(data):
            q['_subject_file'] = subj
            q['_order'] = idx
            out.append(q)
    return out


def norm_text(s):
    return re.sub(r'[\s，。、；：（）()《》「」“”"\'’‘·—\-0-9A-D]', '', s or '')


def scan(qs):
    issues = defaultdict(list)
    seen = {}

    for q in qs:
        qid = str(q.get('id'))
        subj = q.get('_subject_file')
        qtype = q.get('type') or ''
        opts = q.get('options') or {}
        ans = (q.get('answer') or '').strip()
        ana = (q.get('analysis') or '').strip()
        stem = (q.get('question') or '').strip()
        rec = {'id': qid, 'subject': subj, 'type': qtype, 'year': q.get('year')}

        # A 占位解析
        if not ana:
            issues['A_empty_analysis'].append(dict(rec, note='解析为空'))
        elif PLACEHOLDER_PAT.search(ana):
            issues['A_placeholder'].append(dict(rec, note=ana[:44]))
        elif len(ana) < 20:
            issues['A_too_short'].append(dict(rec, note=ana))

        # B 缺共享材料（分案题）
        if re.search(r'事实[一二三四五六七八九十]', stem):
            issues['B_missing_material'].append(dict(rec, note='引用分案事实: ' + stem[:44]))
        elif SHARED_PAT.search(stem) and len(stem) < 60:
            issues['B_missing_material'].append(dict(rec, note=stem[:44]))
        elif CASE_REF_PAT.match(stem) and len(stem) < 50:
            issues['B_missing_material'].append(dict(rec, note=stem[:44]))
        elif len(stem) <= 40 and re.search(r'[甲乙丙丁]', stem) and not re.search(r'[年月日]', stem):
            issues['B_short_stem_person'].append(dict(rec, note=stem[:44]))

        # C 答案格式（主观题无选项无标准答案，跳过）
        is_subjective = '主观' in qtype
        keys = set(opts.keys()) if isinstance(opts, dict) else set()
        if not is_subjective:
            if not ans:
                issues['C_empty_answer'].append(dict(rec, note='答案为空'))
            else:
                letters = set(re.findall(r'[A-D]', ans.upper()))
                if keys and not letters.issubset(keys):
                    issues['C_answer_not_in_options'].append(
                        dict(rec, note='答案 %s 不在选项 %s' % (ans, ''.join(sorted(keys)))))
                if '单选' in qtype and len(letters) > 1:
                    issues['C_type_mismatch'].append(dict(rec, note='单选多答 %s' % ans))
                if ('多选' in qtype or '不定项' in qtype) and len(letters) == 1:
                    issues['C_type_mismatch'].append(dict(rec, note='%s单答 %s' % (qtype, ans)))
                if '哪些' in stem and '单选' in qtype:
                    issues['C_type_mismatch'].append(dict(rec, note='题干"哪些"但标为单选'))

        # D 选项异常（主观题跳过）
        if not is_subjective:
            if not isinstance(opts, dict) or len(opts) < 2:
                issues['D_bad_options'].append(dict(rec, note='选项数 %s' % (len(opts) if isinstance(opts, dict) else 'n/a')))
            else:
                bad_keys = [k for k in opts.keys() if k not in ('A', 'B', 'C', 'D')]
                if bad_keys:
                    issues['D_bad_option_key'].append(dict(rec, note='异常选项键 %s' % bad_keys))
                vals = [str(v).strip() for v in opts.values()]
                if any(not v for v in vals):
                    issues['D_bad_options'].append(dict(rec, note='存在空选项'))
                dup = [v for v, c in Counter(vals).items() if c > 1 and v]
                if dup:
                    issues['D_bad_options'].append(dict(rec, note='重复选项: %s' % dup[0][:30]))

        # E 法条条号越界
        for law, num in ARTICLE_PAT.findall(ana + stem):
            n = cn2int(num)
            base = re.sub(r'（.*?）', '', law)
            if base in LAW_MAX and n > LAW_MAX[base]:
                issues['E_article_out_of_range'].append(
                    dict(rec, note='%s第%d条（上限%d）' % (base, n, LAW_MAX[base])))
            elif base == '刑法' and n > 452:
                issues['E_article_out_of_range'].append(dict(rec, note='刑法第%d条' % n))

        # F 重复题
        key = hashlib.md5(norm_text(stem).encode('utf-8')).hexdigest()
        if key in seen:
            issues['F_duplicate'].append(dict(rec, note='与 id %s 题干相同' % seen[key]))
        else:
            seen[key] = qid

    # G 同一法条「同款」被引述为不同内容（排除不同款，避免把多款法条误判为冲突）
    quoted = defaultdict(set)
    where = defaultdict(list)
    QUOTE_PAT = re.compile(
        r'《([^》]{2,24})》\s*第\s*([一二三四五六七八九十百千零〇\d]+)\s*条'
        r'(?:\s*第\s*([一二三四五六七八九十\d]+)\s*款)?[^“"「]{0,12}[“"「]([^”"」]{8,40})')
    for q in qs:
        blob = (q.get('analysis') or '') + (q.get('question') or '')
        for law, num, para, txt in QUOTE_PAT.findall(blob):
            n = cn2int(num)
            p = cn2int(para) if para else 0
            base = re.sub(r'（.*?）', '', law)
            k = (base, n, p)
            quoted[k].add(norm_text(txt)[:12])
            where[k].append(str(q.get('id')))
    for (law, n, p), variants in quoted.items():
        if len(variants) > 1:
            issues['G_article_quote_conflict'].append({
                'id': ','.join(where[(law, n, p)][:4]),
                'subject': '',
                'type': '', 'year': '',
                'note': '%s第%d条%s 被引作 %d 种不同内容: %s' % (
                    law, n, ('第%d款' % p) if p else '', len(variants),
                    ' / '.join(sorted(variants))[:60])
            })

    return issues


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--json')
    ap.add_argument('--subject')
    ap.add_argument('--top', type=int, default=5)
    args = ap.parse_args()

    qs = load(args.subject)
    issues = scan(qs)

    total = len(qs)
    print('扫描题目总数: %d' % total)
    print('-' * 62)
    for k in sorted(issues):
        print('%-28s %5d' % (k, len(issues[k])))
    print('-' * 62)

    by_subj = defaultdict(Counter)
    for k, arr in issues.items():
        for r in arr:
            by_subj[r['subject']][k] += 1
    print('按科目:')
    for subj in sorted(by_subj, key=lambda s: -sum(by_subj[s].values())):
        c = by_subj[subj]
        print('  %-22s %s' % (subj, dict(c)))

    if args.json:
        payload = {'total': total, 'counts': {k: len(v) for k, v in issues.items()},
                   'by_subject': {s: dict(c) for s, c in by_subj.items()},
                   'items': {k: v for k, v in issues.items()}}
        io.open(args.json, 'w', encoding='utf-8').write(
            json.dumps(payload, ensure_ascii=False, indent=1))
        print('报告已写入', args.json)


if __name__ == '__main__':
    main()

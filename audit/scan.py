# -*- coding: utf-8 -*-
"""法考题库结构与内容缺陷扫描器

覆盖全部 12 个科目，检测六类可机械判定的缺陷：
  A 占位解析        B 缺共享案情材料      C 答案格式异常
  D 选项异常        E 法条条号越界        F 重复题

用法：python audit/scan.py [--json out.json] [--subject 刑法]
"""
import json, io, os, re, sys, argparse, hashlib, difflib
from collections import defaultdict, Counter

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
QDIR = os.path.join(ROOT, 'questions')

# 各部法律现行条文总数（用于识别明显越界的条号引用）
# 2026-11-11 核准（依据全国人大网现行全文 / 修改决定）：
#   立法法       105 -> 120：2023 年第二次修正，全文末条为第一百二十条
#   民事诉讼法   284 -> 306：2023 年第五次修正（2024-01-01 施行），涉外编扩充，
#                修改决定明载「将第二百八十八条改为第二百九十八条」
#                「增加一条，作为第三百零五条」，故取 306 留余量
#   法官法        66 ->  69：2019 年修订，全文末条为第六十九条
# 未核准项保持原值，不据推测修改。
LAW_MAX = {
    '刑法': 452, '刑事诉讼法': 308, '民事诉讼法': 306, '行政诉讼法': 103,
    '民法典': 1260, '宪法': 143, '行政处罚法': 86, '行政许可法': 83,
    '行政强制法': 71, '公司法': 266, '合伙企业法': 109, '个人独资企业法': 48,
    '企业破产法': 136, '票据法': 111, '证券法': 226, '保险法': 187,
    '著作权法': 67, '专利法': 82, '商标法': 73, '反不正当竞争法': 33,
    '反垄断法': 70, '消费者权益保护法': 63, '产品质量法': 74,
    '劳动法': 107, '劳动合同法': 98, '土地管理法': 87, '城市房地产管理法': 73,
    '环境保护法': 70, '税收征收管理法': 94, '法官法': 69, '检察官法': 68,
    '律师法': 60, '公证法': 47, '仲裁法': 80, '国家赔偿法': 42,
    '监察法': 69, '立法法': 120, '全国人民代表大会组织法': 47,
    '刑法修正案（十一）': 48, '刑法修正案（十二）': 8,
}

PLACEHOLDER_PAT = re.compile(
    r'请参考相关法条与教材解析|legal knowledge|请参考官方公布|参考官方公布|'
    r'详细解析请参考|详见官方解析|请见解析|详见解析|暂无解析|无解析|待补充|待完善|TODO'
)

# 解析中自称的正确答案。刻意不匹配单独的「答案为X」，避免把
# 「司法部原答案为ABD」「（原答案为CD）」等历史答案说明误判为冲突
# （2026-11-11 复核：旧规则报 62 条，收紧后真冲突 0 条）。
ANS_CLAIM_PAT = re.compile(
    "(?:正确答案(?:为|是|：|:)?|本题正确答案(?:为|是|：|:)?|故选|应选|故本题?选)\\s*"
    "[「『“\"'‘’]?([A-D][、,，\\s和及A-D]*)")

CASE_REF_PAT = re.compile(r'^(根据|依据|结合|针对|就)?(上述|以上|前述|该|此)(案情|材料|事实|案例|案例材料|描述)')
SHARED_PAT = re.compile(r'上述案情|上述材料|以上材料|前述材料|根据上述|结合上述|据此回答|基于上述')
FACT_REF_PAT = re.compile(r'事实([一二三四五六七八九十])')
# 已恢复题的题干结构：【共享案情】\n<案情正文>\n\n<原设问>
CASE_PREFIX = '【共享案情】'

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


# 2026-11-13 补「十/百/千」：原表缺这三项，导致「五年以上十年以下」与
# 「5年以上10年以下」归一化后仍不同，产生纯数字写法造成的假变体（全量核查 16 组）。
# 折成任意数字字符即可，因为下一步会抹掉全部数字。
CN_DIGIT = {'零': '0', '〇': '0', '一': '1', '二': '2', '三': '3', '四': '4',
            '五': '5', '六': '6', '七': '7', '八': '8', '九': '9', '两': '2',
            '十': '0', '百': '0', '千': '0'}

# 2026-11-14 补编辑序号：题库在摘引法条分项时，同一组「（一）（二）（三）」
# 有的题写成「①②③」、有的写成「（一）（二）」、还有「1. 2.」。原归一化只抹
# 中文数字与阿拉伯数字，圈码残留会把**同一句、同一分项**判成不同变体。
# 全量核查：9 组 same_segment 属此类纯序号差异，归一化后 7 组合并为单一变体、
# 2 组降为 different_excerpts；未新增任何 same_segment（无漏报）。
# 与 CN_DIGIT 同理折成数字后统一抹掉，不涉及汉字语义，因此不会掩盖
# 「投保人故意 / 意外」这类真实文字笔误。
CIRCLED_NUM = {}
for _start, _count in ((0x2460, 20),   # ①..⑳
                       (0x2474, 20),   # ⑴..⒇
                       (0x2488, 20),   # ⒈..⒛
                       (0x249C, 26),   # ⒜..⒵
                       (0x24B6, 26),   # Ⓐ..Ⓩ
                       (0x24D0, 26),   # ⓐ..ⓩ
                       (0x2160, 12),   # Ⅰ..Ⅻ
                       (0x2170, 12)):  # ⅰ..ⅻ
    for _i in range(_count):
        CIRCLED_NUM[chr(_start + _i)] = str(_i % 10)


def norm_quote(s):
    """法条引文专用归一化：抹掉一切「排版/编号」差异，只留下汉字序列。

    已消除的假变体来源（均为全量核查后逐项确认，不改动题库原文）：
      · 中文数字 / 阿拉伯数字 / 十百千        （2026-11-13）
      · 编辑分项序号 ① ⑴ ⒈ Ⓐ Ⅰ …          （2026-11-14，9 组）
      · {} 强调标记（题库刻意用于高亮采分点）（2026-11-14，64 组）
      · 半角逗号句号：{} 版引文常用半角标点  （2026-11-14）
    刻意**不抹**「…」：省略号位置代表不同摘引范围，抹掉反而会掩盖真实歧异。
    刻意**不抹任何汉字**：「投保人故意/意外」「征收/征用」等真实文字歧异仍会检出。
    """
    s = re.sub(r'[\s，。、；：（）()《》「」“”"\'’‘·—\-{}]', '', s or '')
    s = re.sub(r'[,.;:!?]', '', s)
    s = ''.join(CIRCLED_NUM.get(ch, CN_DIGIT.get(ch, ch)) for ch in s)
    return re.sub(r'[0-9A-D]', '', s)


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

        # B0 已标记为缺共享案情的题（前端已从练习池排除，数据仍保留）
        if q.get('incomplete'):
            issues['B_incomplete'].append(dict(rec, note='缺少共享案情，已排除出练习池'))

        # B 缺共享材料（分案题）
        # 2026-11-13 修正：判据必须区分「案情正文」与「设问」。补回案情的题，
        # 其 question = 【共享案情】案情\n\n设问，若对整串 stem 直接找「事实X」，
        # 会把案情正文里正常的「（事实一）」标注误判为缺材料（曾产生 34 条假阳性）。
        # 另外，题干本身自带完整案情的题（如 id 7845，263 字）也不算缺材料。
        if stem.startswith(CASE_PREFIX):
            head, sep, ask = stem.partition('\n\n')
            material = head[len(CASE_PREFIX):] if sep else ''
        else:
            material, ask = '', stem
        has_material = bool(material) or bool(q.get('case_material_source'))
        # 补录完整性：设问引用的「事实N」必须能在案情正文找到对应标注
        if has_material:
            missing = set(FACT_REF_PAT.findall(ask)) - set(FACT_REF_PAT.findall(material))
            # 案情采用「材料①」「协议二」等其他编号体系时不适用此校验
            if missing and FACT_REF_PAT.findall(material):
                issues['B_case_fact_mismatch'].append(dict(rec, note='设问引用事实%s，案情未标注' % ''.join(sorted(missing))))
        # 仅有「短设问且无案情」才算缺材料；长题干视为自带案情
        ask_short = len(ask) < 60
        if not has_material and ask_short and FACT_REF_PAT.search(ask):
            issues['B_missing_material'].append(dict(rec, note='引用分案事实: ' + ask[:44]))
        elif not has_material and SHARED_PAT.search(stem) and len(stem) < 60:
            issues['B_missing_material'].append(dict(rec, note=stem[:44]))
        elif not has_material and CASE_REF_PAT.match(stem) and len(stem) < 50:
            issues['B_missing_material'].append(dict(rec, note=stem[:44]))
        elif not has_material and len(stem) <= 40 and re.search(r'[甲乙丙丁]', stem) and not re.search(r'[年月日]', stem):
            # 短题干多数可独立作答（如「乙盗窃甲的手机后…」），仅作提示，不计硬缺陷
            issues['B_short_stem_hint'].append(dict(rec, note=stem[:44]))

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
                # 题干含「哪些」不等于多选：旧版多选真题常因法律修订后按现行法只剩一个
                # 正确答案，题库已同步把 type/answer 改为单选，但保留原题干措辞（如 2006
                # 卷二第 57 题，现行《刑法》第 358 条数罪并罚后答案由 AD 变 A）。
                # 此类仅作人工复核提示，不计入 C 类硬错误。
                if '哪些' in stem and '单选' in qtype:
                    issues['C_wording_hint'].append(dict(rec, note='题干"哪些"但标为单选（旧题新法，需人工复核）'))

        # H 解析自称答案与 answer 字段冲突
        claim = ANS_CLAIM_PAT.search(ana)
        if claim:
            claimed = set(re.findall(r'[A-D]', claim.group(1)))
            ans_letters = set(re.findall(r'[A-D]', ans.upper()))
            if claimed and ans_letters and claimed != ans_letters:
                issues['H_answer_analysis_conflict'].append(
                    dict(rec, note='answer=%s 解析自称=%s' % (
                        ''.join(sorted(ans_letters)), ''.join(sorted(claimed)))))

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

        # F 重复题：仅凭题干会把「下列哪一选项是正确的？」等模板化题干误判为重复，
        # 需联合选项内容判重（2026-11-11 复核：76 组虚高 -> 23 组真实重复）
        opts_blob = ('|'.join(norm_text(str(v)) for k, v in sorted(opts.items()))
                     if isinstance(opts, dict) else norm_text(str(opts)))
        key = hashlib.md5((norm_text(stem) + opts_blob).encode('utf-8')).hexdigest()
        if key in seen:
            issues['F_duplicate'].append(dict(rec, note='与 id %s 题干相同' % seen[key]))
        else:
            seen[key] = qid

    # G 同一法条「同款」引文变体（低置信提示，非错误）：中文/阿拉伯数字写法差异、
    # 同一条不同款被简写为同一条号、引文截断等都会产生变体，改题前须逐条人工核实
    quoted = defaultdict(set)
    where = defaultdict(list)
    QUOTE_PAT = re.compile(
        r'《([^》]{2,24})》\s*第\s*([一二三四五六七八九十百千零〇\d]+)\s*条'
        # 收紧：法条与引文之间不得跨句、跨行或跨【】注释，避免把下一句
        # 「B选项：\"煽动颠覆国家政权\"」误配给上一条法条（题 510 即此类）
        r'(?:\s*第\s*([一二三四五六七八九十\d]+)\s*款)?[^“"「。；！？\n【】]{0,6}[“"「]([^”"」]{8,40})')
    for q in qs:
        blob = (q.get('analysis') or '') + (q.get('question') or '')
        for law, num, para, txt in QUOTE_PAT.findall(blob):
            n = cn2int(num)
            p = cn2int(para) if para else 0
            base = re.sub(r'（.*?）', '', law)
            k = (base, n, p)
            quoted[k].add(norm_quote(txt)[:12])
            where[k].append(str(q.get('id')))
    for (law, n, p), variants in quoted.items():
        if len(variants) > 1:
            # 分流（2026-11-13）：同一法条被不同题从不同片段摘引属正常；
            # 存在「高度相似却不完全相同」的引文对才值得优先人工核查。
            # 不能只看起始字是否相同——「投保人故意/意外」这类开头笔误
            # 起始字就不同，按起点判定会被误标为正常摘引而漏掉真错误。
            vs = sorted(variants)
            similar = any(
                difflib.SequenceMatcher(None, vs[i], vs[j]).ratio() >= 0.85
                for i in range(len(vs)) for j in range(i + 1, len(vs)))
            kind = 'same_segment' if similar else 'different_excerpts'
            issues['G_quote_variant_hint'].append({
                'id': ','.join(where[(law, n, p)][:4]),
                'subject': '',
                'type': '', 'year': '',
                'kind': kind,
                'note': '[%s] %s第%d条%s 被引作 %d 种不同内容: %s' % (
                    kind, law, n, ('第%d款' % p) if p else '', len(variants),
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
    gkinds = Counter(r.get('kind') for r in issues.get('G_quote_variant_hint', []))
    if gkinds:
        print('  G 类分流: 同片段内容歧异(优先核查) %d / 不同片段正常摘引 %d' % (
            gkinds.get('same_segment', 0), gkinds.get('different_excerpts', 0)))
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

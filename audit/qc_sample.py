# -*- coding: utf-8 -*-
"""解析质量抽检：每批随机抽 20%，机器查 7 项，输出可疑清单。

用法：
  python audit/qc_sample.py                  # 每批随机 20%（默认种子 42）
  python audit/qc_sample.py --all            # 全量检查
  python audit/qc_sample.py --sample 0.3     # 每批 30%
  python audit/qc_sample.py --json audit/qc_report.json
  python audit/qc_sample.py --batch 民法     # 只查文件名含指定片段的批次

检查项：
  1. 长度 <120 或 >220 字
  2. 结尾「正确答案为X」与题库 answer 排序比对
  3. 占位词（请参考 / 详见教材 / legal knowledge 等）
  4. 英文残留（hence 等；常见缩写走白名单）
  5. 英文双引号 "（应使用「」）
  6. 「本题选 / 本题考查」等套话开头
  7. 已废止旧法名（《合同法》《物权法》《侵权责任法》《担保法》等）

只读 audit/inbox/*.json 和 questions/*.json，不写任何题库文件。
"""
import argparse
import io
import json
import os
import random
import re
import sys

# 同目录的 apply_all.py 提供题库加载与批次去重
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from apply_all import (INBOX, batch_files, dedupe_batches, fingerprint,  # noqa: E402
                       load_questions)

PLACEHOLDER = re.compile(
    r'请参考|详见教材|legal knowledge|请参考相关法条与教材解析|'
    r'请参考官方公布|详细解析请参考', re.I)
ANS_PAT = re.compile(r'正确答案为\s*([A-D]{1,4})')
ASCII_QUOTE = re.compile(r'"')
CLICHE = re.compile(r'^\s*(本题选|本题考查|本题考察|此题考查|此题考察)')
REPEALED = re.compile(
    r'《(合同法|物权法|侵权责任法|担保法|民法通则|婚姻法|继承法|收养法|'
    r'经济合同法|涉外经济合同法|技术合同法)》')
EN_WORD = re.compile(r'[A-Za-z]{2,}(?![0-9A-Za-z])')
CJK = re.compile(r'[\u4e00-\u9fff]')

# 常见法律/金融/贸易缩写，不算英文残留；可用 --allow 追加
ALLOW = {
    'WTO', 'WHO', 'WIPO', 'WCO', 'OECD', 'UN', 'UNCTAD', 'UNCITRAL',
    'IMF', 'GATT', 'GATS', 'TRIPS', 'TRIMS', 'BEPS', 'MAP', 'APA',
    'CPA', 'CFA', 'ACCA', 'CEO', 'CFO', 'COO', 'CTO', 'CIO', 'IPO',
    'PE', 'VC', 'GDP', 'CPI', 'PPI', 'PMI', 'RMB', 'USD', 'EUR', 'JPY',
    'SDR', 'VAT', 'GST', 'FDI', 'ODI', 'MOU', 'NDA', 'SPV', 'PPP',
    'BOT', 'TOT', 'ABS', 'MBS', 'CDO', 'CDS', 'REIT', 'REITS', 'ETF',
    'QFII', 'RQFII', 'QDII', 'CIPS', 'CHIPS', 'LIBOR', 'SOFR',
    'SHIBOR', 'LPR', 'MLF', 'SLF', 'OMO', 'SWIFT', 'UCP', 'UCP600',
    'ISBP', 'ISBP745', 'URR', 'URDG', 'ISP', 'ISP98', 'EUCP',
    'FOB', 'CIF', 'CFR', 'FCA', 'CPT', 'CIP', 'DAP', 'DDP', 'EXW',
    'CISG', 'PICC', 'UNIDROIT', 'INCOTERMS', 'ECHR', 'ICCPR',
    'ICESCR', 'ILO', 'TPP', 'CPTPP', 'RCEP', 'USMCA', 'NAFTA',
    'EU', 'UK', 'US', 'ISO', 'CE', 'AI', 'DNA', 'APP', 'PDF', 'LED',
    'CSR', 'ESG', 'PPP', 'P2P', 'O2O', 'B2B', 'B2C', 'C2C',
    # 知识产权/专利常用缩写
    'PCT', 'PLT', 'UPOV', 'EPO', 'USPTO', 'JPO', 'KIPO', 'CNIPA',
    'WCT', 'WPPT', 'TRIPs',
    # 银行/生活场景缩写
    'ATM', 'POS', 'USB', 'HTTP', 'URL',
}


def log(msg=''):
    print(msg)


def sample_ids(ids, rate, all_flag, rng):
    ids = sorted(ids, key=lambda x: (len(x), x))
    if all_flag:
        return ids
    k = max(1, int(round(len(ids) * rate)))
    return sorted(rng.sample(ids, k), key=lambda x: (len(x), x))


def check_one(text, q, min_len=120, max_len=220, count='all'):
    """返回 [(检查项, 说明), ...]。"""
    issues = []
    text = (text or '').strip()
    n = len(text)
    cjk = len(CJK.findall(text))
    eff = n if count == 'cjk' else n

    # 1. 长度
    if eff < min_len:
        issues.append(('长度', '%d 字 < %d（全长 %d / 汉字 %d）'
                       % (eff, min_len, n, cjk)))
    elif eff > max_len:
        issues.append(('长度', '%d 字 > %d（全长 %d / 汉字 %d）'
                       % (eff, max_len, n, cjk)))

    # 2. 结尾答案 + 一致性
    matches = list(ANS_PAT.finditer(text))
    if not matches:
        issues.append(('答案', '缺少「正确答案为X」'))
    else:
        m = matches[-1]
        tail = text[m.end():].strip()
        if tail not in ('', '。', '.'):
            issues.append(('答案', '答案句后仍有内容：%s' % tail[:24]))
        got = ''.join(sorted(m.group(1)))
        want = ''.join(sorted(re.findall(r'[A-D]',
                                         (q.get('answer') or '').upper())))
        if want and got != want:
            issues.append(('答案', '文中 %s / 题库 %s' % (got, want)))

    # 3. 占位词
    for m in PLACEHOLDER.finditer(text):
        issues.append(('占位词', '命中「%s」' % m.group(0)))
        break

    # 4. 英文残留：先去掉答案字母串，再按词扫描
    body = ANS_PAT.sub('', text)
    bad = []
    for tok in EN_WORD.findall(body):
        if tok.upper() not in ALLOW and tok.upper() not in bad:
            bad.append(tok.upper())
    if bad:
        issues.append(('英文残留', '、'.join(bad[:6]) +
                       (' 等 %d 个' % len(bad) if len(bad) > 6 else '')))

    # 5. 英文双引号
    if ASCII_QUOTE.search(text):
        i = text.find('"')
        issues.append(('英文引号', '…%s…' % text[max(0, i - 16):i + 17]))

    # 6. 套话开头
    m = CLICHE.match(text)
    if m:
        issues.append(('套话开头', '以「%s」开头' % m.group(1)))

    # 7. 已废止旧法名
    old = sorted(set(REPEALED.findall(text)))
    if old:
        issues.append(('旧法名', '、'.join('《%s》' % x for x in old)))

    return issues


def main():
    ap = argparse.ArgumentParser(description='解析质量抽检（只读）')
    ap.add_argument('--sample', type=float, default=0.2, help='抽样比例，默认 0.2')
    ap.add_argument('--all', action='store_true', help='全量检查')
    ap.add_argument('--seed', default='42', help='随机种子，默认 42')
    ap.add_argument('--batch', help='只查文件名包含该片段的批次')
    ap.add_argument('--min', type=int, default=120, dest='min_len')
    ap.add_argument('--max', type=int, default=220, dest='max_len')
    ap.add_argument('--allow', default='', help='追加英文白名单，逗号分隔')
    ap.add_argument('--json', dest='json_out', help='把完整结果写入 JSON 文件')
    ap.add_argument('--summary-only', action='store_true',
                    help='只打印汇总表，不逐条列出可疑项')
    ap.add_argument('--count', choices=['all', 'cjk'], default='all',
                    help='长度口径：all=含标点的全字符（默认），cjk=只算汉字')
    ap.add_argument('--length-table', action='store_true',
                    help='额外打印每批解析长度分布（按全量统计，不受抽样影响）')
    args = ap.parse_args()

    if hasattr(sys.stdout, 'reconfigure'):
        try:
            sys.stdout.reconfigure(encoding='utf-8', errors='replace')
        except Exception:
            pass

    global ALLOW
    ALLOW = set(ALLOW) | {x.strip().upper() for x in args.allow.split(',') if x.strip()}

    if not (0 < args.sample <= 1) and not args.all:
        ap.error('--sample 必须在 (0, 1] 之间')

    files, index = load_questions()
    fps = batch_files(args.batch)
    kept, skipped = dedupe_batches(fps)

    log('题库：%d 题；inbox：%d 批（去重后 %d）'
        % (len(index), len(fps), len(kept)))
    if skipped:
        for name, why in skipped:
            log('  跳过 %-40s %s' % (name, why))
    log('')

    rows, details, payload = [], [], []
    lens_rows = []
    for fp, name, batch in kept:
        rng = random.Random('%s|%s' % (args.seed, name))
        ids = sample_ids(batch.keys(), args.sample, args.all, rng)
        suspects = []
        for qid in ids:
            q = index.get(str(qid))
            if not q:
                suspects.append((qid, [('存在性', '题库无此 id')]))
                continue
            issues = check_one(batch[qid], q[1], args.min_len, args.max_len,
                               args.count)
            if issues:
                suspects.append((qid, issues))
        rows.append((name, len(batch), len(ids), len(suspects),
                     fingerprint(fp)[1]))
        lens = [len((batch[k] or '').strip()) for k in batch]
        cjks = [len(CJK.findall(batch[k] or '')) for k in batch]
        lens_rows.append((name, lens, cjks))
        if suspects:
            details.append((name, suspects))
            for qid, issues in suspects:
                payload.append({
                    'batch': name,
                    'id': qid,
                    'issues': [{'check': c, 'detail': d} for c, d in issues],
                })

    name_w = max([len(r[0]) for r in rows] + [12])
    header = '%-*s %6s %6s %6s' % (name_w, '批次', '条目', '抽样', '可疑')
    log(header)
    log('-' * len(header))
    for name, n, sn, bad, _h in rows:
        log('%-*s %6d %6d %6d' % (name_w, name, n, sn, bad))
    log('-' * len(header))
    log('%-*s %6d %6d %6d' % (
        name_w, '合计（%d 批）' % len(rows),
        sum(r[1] for r in rows), sum(r[2] for r in rows),
        sum(r[3] for r in rows)))

    if args.length_table and lens_rows:
        log('')
        log('解析长度分布（全量，口径=%s；不含标点总数见“汉字>上限”列）'
            % ('汉字' if args.count == 'cjk' else '全字符'))
        head = '%-*s %5s %5s %5s %5s %5s %5s %6s' % (
            name_w, '批次', '条数', '<%d' % args.min_len,
            '%d-%d' % (args.min_len, args.max_len), '>%d' % args.max_len,
            '中位', '最长', '汉字>上限')
        log(head)
        log('-' * len(head))
        acc = {'n': 0, 'lo': 0, 'ok': 0, 'hi': 0, 'hi_cjk': 0,
               'lens': []}
        for name, lens, cjks in lens_rows:
            lo = sum(1 for x in lens if x < args.min_len)
            ok = sum(1 for x in lens if args.min_len <= x <= args.max_len)
            hi = sum(1 for x in lens if x > args.max_len)
            hi_cjk = sum(1 for x in cjks if x > args.max_len)
            acc['n'] += len(lens)
            acc['lo'] += lo
            acc['ok'] += ok
            acc['hi'] += hi
            acc['hi_cjk'] += hi_cjk
            acc['lens'].extend(lens)
            log('%-*s %5d %5d %5d %5d %5d %5d %6d' % (
                name_w, name, len(lens), lo, ok, hi,
                sorted(lens)[len(lens) // 2], max(lens), hi_cjk))
        log('-' * len(head))
        all_lens = acc['lens']
        log('%-*s %5d %5d %5d %5d %5d %5d %6d' % (
            name_w, '合计', acc['n'], acc['lo'], acc['ok'], acc['hi'],
            sorted(all_lens)[len(all_lens) // 2] if all_lens else 0,
            max(all_lens) if all_lens else 0, acc['hi_cjk']))
        if acc['n']:
            log('超上限占比 %.1f%%（按汉字计 %.1f%%）'
                % (100.0 * acc['hi'] / acc['n'],
                   100.0 * acc['hi_cjk'] / acc['n']))

    if details and args.summary_only:
        log('')
        log('（--summary-only：逐条清单见 --json 输出）')
    elif details:
        log('')
        log('可疑清单：')
        for name, suspects in details:
            log('  [%s]' % name)
            for qid, issues in suspects:
                log('    %-8s' % qid)
                for c, d in issues:
                    log('      - %s：%s' % (c, d))
    else:
        log('')
        log('抽样范围内未发现可疑项。')

    if args.json_out:
        outp = args.json_out
        if not os.path.isabs(outp):
            outp = os.path.join(os.path.dirname(os.path.dirname(
                os.path.abspath(__file__))), outp)
        with io.open(outp, 'w', encoding='utf-8', newline='\n') as fh:
            fh.write(json.dumps({
                'seed': args.seed,
                'sample_rate': 1.0 if args.all else args.sample,
                'summary': [
                    {'batch': r[0], 'entries': r[1], 'sampled': r[2],
                     'suspects': r[3], 'sha1': r[4]} for r in rows],
                'suspects': payload,
            }, ensure_ascii=False, indent=1))
        log('')
        log('JSON 结果：%s' % outp)

    return 1 if payload else 0


if __name__ == '__main__':
    sys.exit(main())

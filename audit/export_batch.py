# -*- coding: utf-8 -*-
"""导出待补解析的批次，供其他 AI 协作处理。

产出两个文件：
  outbox/<name>_input.json   —— 交给其他 AI（含 id、题干、选项、答案、题型）
  outbox/<name>_prompt.md    —— 可直接复制的任务说明

用法：
  python audit/export_batch.py 民法 --size 40 --name minfa_03
  python audit/export_batch.py --all --size 40        # 按科目各导一批
"""
import json, io, os, re, sys, argparse

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
QDIR = os.path.join(ROOT, 'questions')
OUT = os.path.join(ROOT, 'audit', 'outbox')

PLACEHOLDER = re.compile(r'请参考相关法条与教材解析|legal knowledge|请参考官方公布|详细解析请参考')
# 法考不考的内容：税法、外汇、外贸、国资（CPA 独有）
SKIP = re.compile(r'印花税|企业所得税|增值税|营业税|契税|土地增值税|消费税|资源税|'
                  r'税收征收管理|出口退税|房产税|车船税|外汇管理|经常项目|资本项目|'
                  r'对外贸易|反倾销|反补贴|国有资产')

PROMPT_TPL = """# 任务：为法考题库补写试题解析

## 背景
这是一个法律职业资格考试（法考）刷题 App 的题库。以下题目当前没有解析，
需要你为每题补写一段 120–220 字的解析。

## 输入
同目录下的 `{name}_input.json`，每道题包含 id、question、options、answer、type。

## 要求
1. 解析必须以「正确答案为X」结尾，X 必须与输入中的 answer 完全一致（含多选如 ABD）
2. 逐项说明：正确选项为什么对、错误选项为什么错，要点到法条或制度依据
3. 长度 120–220 字，中文，不要写"本题选""本题考查"之类套话开头
4. 依据《民法典》《刑法》《刑事诉讼法》等现行有效法律，不要引用已废止的《合同法》《物权法》等旧法名称
5. 题干中引用法条原文时，一律使用「」而非英文双引号
6. 不要改动题目、选项和答案，只写解析

## 输出
严格输出一个 JSON 对象，键为题目 id（字符串），值为解析正文（字符串）。
不要输出任何解释文字、markdown 代码块标记或多余内容。示例：

{{"12345": "A项正确：……。B项错误：……。正确答案为A。", "12346": "……"}}

## 校验（我会用脚本检查）
- 不含"请参考""详见教材"等占位措辞
- 长度 ≥ 60 字
- 含「正确答案为X」且与 answer 一致
- id 必须存在于输入中
"""


def load_placeholders(subject, limit, skip_cpa_only):
    fp = os.path.join(QDIR, '%s.json' % subject)
    data = json.load(io.open(fp, encoding='utf-8'))
    out = []
    for q in data:
        ana = q.get('analysis') or ''
        if not PLACEHOLDER.search(ana):
            continue
        if skip_cpa_only:
            blob = (q.get('question') or '') + ' '.join(
                str(v) for v in (q.get('options') or {}).values())
            if SKIP.search(blob):
                continue
        out.append({
            'id': str(q.get('id')),
            'subject': q.get('subject') or subject,
            'type': q.get('type'),
            'year': q.get('year'),
            'question': q.get('question'),
            'options': q.get('options') or {},
            'answer': q.get('answer'),
        })
        if len(out) >= limit:
            break
    return out


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('subject', nargs='?')
    ap.add_argument('--size', type=int, default=40)
    ap.add_argument('--name')
    ap.add_argument('--all', action='store_true')
    ap.add_argument('--include-cpa-only', action='store_true',
                    help='包含法考不考的税法/外汇/外贸类题目')
    args = ap.parse_args()

    os.makedirs(OUT, exist_ok=True)
    targets = []
    if args.all:
        for fn in sorted(os.listdir(QDIR)):
            if fn.endswith('.json') and fn != 'index.json':
                targets.append(fn[:-5])
    elif args.subject:
        targets = [args.subject]
    else:
        ap.error('需指定科目或使用 --all')

    for subj in targets:
        items = load_placeholders(subj, args.size, not args.include_cpa_only)
        if not items:
            continue
        name = args.name if (args.name and len(targets) == 1) else '%s_%d' % (subj, len(items))
        fp_in = os.path.join(OUT, '%s_input.json' % name)
        fp_prompt = os.path.join(OUT, '%s_prompt.md' % name)
        io.open(fp_in, 'w', encoding='utf-8').write(
            json.dumps(items, ensure_ascii=False, indent=1))
        io.open(fp_prompt, 'w', encoding='utf-8').write(PROMPT_TPL.format(name=name))
        print('%-12s 导出 %3d 题 -> %s' % (subj, len(items), os.path.basename(fp_in)))

    print('\n输出目录: audit/outbox/')
    print('回收命令: python audit/apply_analysis.py audit/inbox/<name>_output.json')


if __name__ == '__main__':
    main()

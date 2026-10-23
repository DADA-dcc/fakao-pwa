# -*- coding: utf-8 -*-
"""T5 学科错标：识别并搬运放错学科文件的题目。

用法：
  python audit/fix_subject_tags.py --propose
      # 关键词分类 + CPA 标记，生成提案 audit/outbox/T5_subject_proposal.json（不落库）
  python audit/fix_subject_tags.py --propose --out audit/outbox/T5_subject_proposal.json
  python audit/fix_subject_tags.py --apply --map audit/outbox/T5_subject_map.json
      # 按人工确认的映射搬移题目：改 subject、移动文件、刷新 questions/index.json
  python audit/fix_subject_tags.py --apply --map ... --dry-run   # 只看动作，不写

映射文件格式（两种都支持）：
  {"1234": "刑法", "5678": "商经法"}
  {"民法": {"to": "商经法", "ids": ["1234", "5678"]}}

说明：
  * 提案只给建议，人工确认后再 --apply
  * --apply 会先给被改动的文件做 .bak 备份
  * 不改动题目内容（题干/选项/答案/解析一律不动）
"""
import argparse
import io
import json
import os
import re
import shutil
import sys
import time
from collections import defaultdict

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
QDIR = os.path.join(ROOT, 'questions')
OUTBOX = os.path.join(ROOT, 'audit', 'outbox')

# 关键词画像：strong=学科专属特征（权重 2），weak=通用法律用语（权重 0.5）
# 分类时要求 strong 命中 >= 2，避免"诉讼/原告/证据"这类跨科通用词造成误判
PROFILE = {
    '刑法': {
        'strong': ['刑法', '犯罪构成', '共同犯罪', '犯罪中止', '犯罪未遂', '正当防卫', '紧急避险',
                   '故意杀人', '故意伤害', '故意毁坏财物', '盗窃', '诈骗', '抢劫', '抢夺', '侵占',
                   '敲诈勒索', '强奸', '拐卖', '绑架', '放火', '爆炸', '投放危险物质', '危险驾驶',
                   '交通肇事', '走私', '受贿', '贪污', '挪用', '洗钱', '集资诈骗', '非法经营',
                   '开设赌场', '妨害公务', '袭警', '数罪并罚', '累犯', '自首', '立功', '缓刑',
                   '假释', '拘役', '有期徒刑', '无期徒刑', '罚金', '剥夺政治权利', '追诉时效',
                   '单位犯罪', '犯罪对象', '罪刑法定', '数罪', '刑罚执行', '缓刑考验期'],
        'weak': ['犯罪', '罪', '处罚', '刑罚', '量刑', '刑法典', '犯罪后', '故意', '过失'],
    },
    '刑诉法': {
        'strong': ['人民检察院', '侦查', '起诉', '辩护', '取保候审', '监视居住', '搜查', '扣押',
                   '查封', '冻结', '自诉', '附带民事诉讼', '速裁程序', '缺席审判', '非法证据排除',
                   '死刑复核', '抗诉', '不起诉', '强制措施', '刑事拘留', '提请批准逮捕', '认罪认罚',
                   '犯罪嫌疑人', '被告人', '证人出庭', '鉴定意见', '电子数据', '鉴定人', '公诉机关',
                   '审判监督程序', '一审程序', '二审程序', '羁押', '指定管辖', '级别管辖', '再审'],
        'weak': ['法院', '程序', '证据', '判决', '审理', '卷宗', '刑期', '羁押期限'],
    },
    '民诉法': {
        'strong': ['起诉状', '答辩状', '上诉状', '法庭辩论', '支付令', '公示催告', '小额诉讼',
                   '确认之诉', '给付之诉', '形成之诉', '第三人撤销之诉', '不予受理', '驳回起诉',
                   '民事判决书', '管辖权异议', '反诉', '共同诉讼', '举证责任', '质证', '缺席判决',
                   '撤诉', '和解协议', '调解书', '一审', '二审', '简易程序', '普通程序', '再审申请',
                   '诉讼标', '既判力', '主管', '案由', '原告', '被告', '第三人'],
        'weak': ['诉讼', '法院', '判决', '执行', '证据', '审理', '程序', '当事人'],
    },
    '行政法': {
        'strong': ['行政处罚', '行政许可', '行政复议', '行政诉讼', '行政机关', '行政强制', '行政征收',
                   '行政确认', '行政裁决', '政府信息公开', '治安管理', '行政拘留', '行政强制执行',
                   '行政赔偿', '国家赔偿', '具体行政行为', '行政处罚法', '行政许可法', '行政复议法',
                   '行政诉讼法', '规范性文件', '违法', '职权的', '执法', '行政处罚决定', '吊销',
                   '责令改正', '行政给付', '行政协议', '裁决', '处罚决定'],
        'weak': ['罚款', '没收', '责令', '处罚', '复议', '起诉', '义务', '许可'],
    },
    '宪法': {
        'strong': ['宪法', '全国人民代表大会', '全国人大常委会', '国务院', '中央军事委员会', '国家主席',
                   '监察委员会', '民族区域自治', '特别行政区', '基层群众自治', '统一战线', '政党',
                   '基本权利', '基本义务', '国家机构', '主权', '人大', '政协', '国家勋章', '国歌',
                   '宪法修正案', '制宪', '宪法法院', '合宪性'],
        'weak': ['权利', '义务', '国家', '选举', '立法', '制度'],
    },
    '民法': {
        'strong': ['民法典', '合同', '物权', '担保物权', '用益物权', '所有权', '侵权', '婚姻家庭',
                   '继承', '监护', '代理', '诉讼时效', '合同编', '物权编', '人格权', '不当得利',
                   '无因管理', '情势变更', '意思表示', '法定继承', '遗嘱', '买卖合同', '租赁合同',
                   '承揽合同', '定金', '违约金', '缔约过失', '保证', '抵押', '质权', '留置', '夫妻共同财产',
                   '收养', '抚养', '赡养', '法定代表', '善意取得', '物权变动', '合同解除', '违约责任'],
        'weak': ['权利', '义务', '责任', '当事人', '法律', '规定', '行为'],
    },
    '知识产权法': {
        'strong': ['专利', '商标', '著作权', '版权', '发明', '实用新型', '外观设计', '作品',
                   '邻接权', '商业秘密', '不正当竞争', '地理标志', '驰名商标', '在先使用权',
                   '专利法', '商标法', '著作权法', '技术方案', '商标注册', '专利权', '商标权',
                   '著作权人', '保护期', '临时保护', '反向工程'],
        'weak': ['侵权', '保护', '作品', '使用'],
    },
    '商经法': {
        'strong': ['公司', '合伙', '证券', '票据', '保险', '银行', '破产', '金融', '上市', '股东',
                   '董事', '监事', '发起人', '有限公司', '股份', '债券', '期货', '人寿', '责任保险',
                   '商业银行', '重整', '和解', '债权人', '基金管理人', '信托', '反垄断', '经营者集中',
                   '拍卖', '招标投标', '保险合同', '再保险', '代位求偿', '股东会', '监事会', '公积金',
                   '关联交易', '清算', '减资', '增资', '上市公司', '保荐'],
        'weak': ['企业', '合同', '公司', '责任', '资金'],
    },
    '国际法': {
        'strong': ['国际条约', '外交', '领事', '联合国', '国际法', '维也纳', '海牙', '冲突法',
                   '涉外', '缔约', '国际争端', '仲裁', '庇护', '难民', '国际惯例', '国际承认',
                   '引渡', '领事馆', '条约义务', '国际私法', '涉外民事', '反致', '公共秩序', '域外'],
        'weak': ['条约', '国家', '协定', '国际', '适用', '冲突'],
    },
    '法理学': {
        'strong': ['法理学', '法的概念', '法律原则', '法律规则', '法的效力', '法律解释', '法的价值',
                   '法与道德', '法社会学', '法律关系', '法的渊源', '法的效力范围', '法理学',
                   '法律方法', '法教义学', '法律解释方法', '法律思维'],
        'weak': ['法治', '法律', '价值', '原则', '方法', '解释', '规范'],
    },
    '法制史': {
        'strong': ['秦汉', '隋唐', '唐律', '宋刑统', '大明律', '清律', '罗马法', '法制史', '汉律',
                   '魏晋', '北齐', '开元律', '中华民国', '秦律', '汉代', '唐代', '宋代', '元代',
                   '清代', '十恶', '八议', '春秋决狱', '制科'],
        'weak': ['古代', '朝代', '律令', '刑罚', '沿革'],
    },
    '司法制度与职业道德': {
        'strong': ['律师', '法官', '检察官', '司法考试', '法律职业', '职业道德', '执业纪律',
                   '司法制度', '仲裁员', '公证员', '司法行政', '律师协会', '职业伦理', '法律服务',
                   '司法行政部', '法官法', '检察官法', '律师法', '法律援助'],
        'weak': ['执业', '职业', '纪律', '考试', '制度', '行业'],
    },
}

# 法考不考、应移出法考学科的 CPA 特征
CPA_SIGNS = re.compile(
    r'印花税|企业所得税|增值税|营业税|契税|土地增值税|消费税|资源税|税收征收管理|'
    r'出口退税|房产税|车船税|外汇管理|经常项目|资本项目|对外贸易|反倾销|反补贴|国有资产|'
    r'海关|关税|增值税专用发票|纳税申报|税务登记')

STOP = {'题', '法', '的', '与', '及'}


def log(msg=''):
    print(msg)


def load_subjects():
    """返回 {科目: (文件路径, [题目...])}。"""
    out = {}
    for fn in sorted(os.listdir(QDIR)):
        if not fn.endswith('.json') or fn == 'index.json':
            continue
        data = json.load(io.open(os.path.join(QDIR, fn), encoding='utf-8'))
        if isinstance(data, dict):
            data = data.get('questions') or []
        out[os.path.splitext(fn)[0]] = (os.path.join(QDIR, fn), data)
    return out


def blob_of(q):
    return (q.get('question') or '') + ' ' + ' '.join(
        str(v) for v in (q.get('options') or {}).values())


def classify(text):
    """返回按得分排序的 [(学科, 得分, 强命中数, 命中词列表)]。

    得分 = 强特征命中数 * 2 + 弱特征命中数 * 0.5；强特征至少 2 个才算有效归属。
    """
    scored = []
    for subj, prof in PROFILE.items():
        strong = [k for k in prof['strong'] if k in text]
        weak = [k for k in prof['weak'] if k in text]
        if not strong and not weak:
            continue
        score = len(strong) * 2 + len(weak) * 0.5
        scored.append((subj, score, len(strong), strong + weak))
    scored.sort(key=lambda x: (-x[1], x[0]))
    return scored


def build_proposal(subjects, min_score=6.0, min_strong=2, min_margin=3.0):
    cpa_items, misfiled = [], []
    for subj, (fp, data) in subjects.items():
        for q in data:
            qid = str(q.get('id'))
            text = blob_of(q)
            cpa = bool(CPA_SIGNS.search(text)) or q.get('source') == 'CPA'
            if cpa:
                cpa_items.append({
                    'id': qid, 'file_subject': subj,
                    'subject_field': q.get('subject'),
                    'source_tag': q.get('source'),
                    'cpa_signs': sorted(set(CPA_SIGNS.findall(text)))[:5],
                    'question': (q.get('question') or '')[:90],
                })
            scored = classify(text)
            if not scored:
                continue
            top, score, nstrong, hits = scored[0]
            second = scored[1][1] if len(scored) > 1 else 0
            if top != subj and nstrong >= min_strong and score >= min_score \
                    and score - second >= min_margin:
                misfiled.append({
                    'id': qid, 'file_subject': subj,
                    'subject_field': q.get('subject'),
                    'guess_subject': top, 'score': score, 'strong': nstrong,
                    'runner_up': second,
                    'hits': hits[:8],
                    'question': (q.get('question') or '')[:90],
                })
    return cpa_items, misfiled


def load_map(path):
    data = json.load(io.open(path, encoding='utf-8'))
    mapping = {}
    if isinstance(data, dict):
        for k, v in data.items():
            if isinstance(v, dict) and 'ids' in v:
                to = v.get('to')
                for i in v['ids']:
                    mapping[str(i)] = to
            else:
                mapping[str(k)] = v
    return mapping


def apply_map(subjects, mapping, dry):
    moves = defaultdict(list)
    fixes = []
    unknown = []
    for qid, to in mapping.items():
        found = None
        for subj, (fp, data) in subjects.items():
            for q in data:
                if str(q.get('id')) == qid:
                    found = (subj, q)
                    break
            if found:
                break
        if not found:
            unknown.append(qid)
            continue
        frm, q = found
        if to == frm:
            if q.get('subject') != frm:
                fixes.append((qid, frm, to))
            continue
        moves[(frm, to)].append(q)
    if unknown:
        log('[提示] %d 个 id 在题库中找不到：%s'
            % (len(unknown), ', '.join(unknown[:10])))
    return moves, fixes, unknown


def main():
    ap = argparse.ArgumentParser(description='T5 学科错标识别与搬运')
    ap.add_argument('--propose', action='store_true', help='生成错标提案（不落库）')
    ap.add_argument('--out', default=os.path.join(OUTBOX, 'T5_subject_proposal.json'))
    ap.add_argument('--apply', action='store_true', help='按映射文件搬运题目')
    ap.add_argument('--map', dest='mapfile', help='人工确认的映射 JSON')
    ap.add_argument('--dry-run', action='store_true', help='只打印动作，不写文件')
    ap.add_argument('--min-score', type=float, default=6.0,
                    help='加权得分阈值，默认 6（强特征命中数*2 + 弱特征*0.5）')
    ap.add_argument('--min-strong', type=int, default=2,
                    help='最少强特征命中数，默认 2')
    ap.add_argument('--min-margin', type=float, default=3.0,
                    help='与第二名的最小分差，默认 3（调大更保守）')
    args = ap.parse_args()

    if hasattr(sys.stdout, 'reconfigure'):
        try:
            sys.stdout.reconfigure(encoding='utf-8', errors='replace')
        except Exception:
            pass

    subjects = load_subjects()
    total = sum(len(d) for _f, d in subjects.values())
    log('题库：%d 科 / %d 题' % (len(subjects), total))

    if args.propose:
        cpa_items, misfiled = build_proposal(subjects, args.min_score,
                                            args.min_strong, args.min_margin)
        outp = args.out
        if not os.path.isabs(outp):
            outp = os.path.join(ROOT, outp)
        data = {
            'generated': time.strftime('%Y-%m-%d %H:%M:%S'),
            'cpa_tagged': {
                'count': len(cpa_items),
                'note': 'CPA 来源题，法考学科不应收录；建议移出或删除（需人工确认去留）',
                'items': cpa_items,
            },
            'misfiled': {
                'count': len(misfiled),
                'note': '关键词分类与所在文件学科不一致，仅为建议，需人工确认',
                'items': misfiled,
            },
        }
        if not args.dry_run:
            os.makedirs(os.path.dirname(outp), exist_ok=True)
            with io.open(outp, 'w', encoding='utf-8', newline='\n') as fh:
                fh.write(json.dumps(data, ensure_ascii=False, indent=1))
        log('CPA 标记题：%d 条' % len(cpa_items))
        log('疑似错标题：%d 条' % len(misfiled))
        by_file = defaultdict(int)
        for m in misfiled:
            by_file['%s -> %s' % (m['file_subject'], m['guess_subject'])] += 1
        for k, v in sorted(by_file.items(), key=lambda x: -x[1]):
            log('   %-28s %d' % (k, v))
        log('提案文件：%s%s' % (outp, '' if args.dry_run else ''))
        return 0

    if args.apply:
        if not args.mapfile:
            ap.error('--apply 需要 --map <映射文件>')
        mapping = load_map(args.mapfile)
        moves, fixes, unknown = apply_map(subjects, mapping, args.dry_run)
        log('映射 %d 条；移动 %d 题；同科订正 subject 字段 %d 条'
            % (len(mapping), sum(len(v) for v in moves.values()), len(fixes)))
        for (frm, to), items in sorted(moves.items()):
            log('  %s -> %s : %d 题' % (frm, to, len(items)))
        if args.dry_run:
            log('--dry-run：未写入。')
            return 0

        stamp = time.strftime('%Y%m%d_%H%M%S')
        changed_files = set()
        for (frm, to), items in moves.items():
            src_fp, src_data = subjects[frm]
            if to not in subjects:
                # 新学科（如 CPA 暂存库）：新建文件
                src_fp_new = os.path.join(QDIR, '%s.json' % to)
                subjects[to] = (src_fp_new, [])
            dst_fp, dst_data = subjects[to]
            for q in items:
                src_data.remove(q)
                q['subject'] = to
                dst_data.append(q)
            changed_files.add(src_fp)
            changed_files.add(dst_fp)
        for qid, frm, to in fixes:
            for subj, (fp, data) in subjects.items():
                for q in data:
                    if str(q.get('id')) == qid:
                        q['subject'] = to
                        changed_files.add(fp)
                        break

        for fp in changed_files:
            shutil.copy2(fp, fp + '.bak.' + stamp)
        for subj, (fp, data) in subjects.items():
            with io.open(fp, 'w', encoding='utf-8', newline='\n') as fh:
                fh.write(json.dumps(data, ensure_ascii=False, indent=1))

        # 刷新 index.json
        idx_fp = os.path.join(QDIR, 'index.json')
        idx = json.load(io.open(idx_fp, encoding='utf-8'))
        subs = idx.setdefault('subjects', {})
        for subj, (fp, data) in subjects.items():
            entry = subs.setdefault(subj, {'file': os.path.basename(fp)})
            entry['file'] = os.path.basename(fp)
            entry['count'] = len(data)
            entry['size_mb'] = round(os.path.getsize(fp) / 1024.0 / 1024.0, 2)
        idx['total'] = sum(len(d) for _f, d in subjects.values())
        with io.open(idx_fp, 'w', encoding='utf-8', newline='\n') as fh:
            fh.write(json.dumps(idx, ensure_ascii=False, indent=1))
        log('已写入 %d 个题库文件 + index.json（备份后缀 .bak.%s）'
            % (len(changed_files), stamp))
        return 0

    ap.error('请指定 --propose 或 --apply --map <文件>')
    return 1


if __name__ == '__main__':
    sys.exit(main())

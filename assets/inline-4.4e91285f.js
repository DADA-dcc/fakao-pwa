
    // =========================================================================
    // 1. 内置精选法考真题与核心考点库（当部署在仓库根目录时自动加载 ./questions/index.json 等）
    // =========================================================================
    const FALLBACK_QUESTIONS = [
      {
        id: "MF_2024_01",
        subject: "民法",
        type: "多选",
        difficulty: "中",
        year: "2024真题精选",
        title: "甲将自己收藏的一幅名画借给乙展览，乙未经甲同意，以自己的名义将该画以市场合理价格卖给不知情的丙，并完成了交付。随后丙又将该画赠与丁并交付。根据《民法典》规定，下列哪些说法是正确的？",
        options: [
          { id: "A", text: "乙的行为属于无权处分，但乙与丙之间的买卖合同有效" },
          { id: "B", text: "丙基于善意取得制度取得该画的所有权，甲无权要求丙返还" },
          { id: "C", text: "因丁系无偿取得该画，故甲有权向丁主张返还原物" },
          { id: "D", text: "甲有权请求乙承担违约责任或者侵权损害赔偿责任" }
        ],
        answer: ["A", "B", "D"],
        explanation: "① 根据《民法典》第597条规定，因出卖人未取得处分权致使标的物所有权不能转移的，买受人可以解除合同并请求出卖人承担违约责任。无权处分不影响买卖合同本身的效力，故A项正确。\n② 根据《民法典》第311条善意取得制度，丙受让该动产时系善意、以合理价格转让且已完成交付，丙依法取得该画所有权，原所有权人甲的物权消灭，B项正确。\n③ 丙既已合法取得所有权，其后丙将画赠与丁属于有权处分！丁继受取得所有权，不再适用善意取得中的“合理价格”要件，甲无权向丁请求返还，故C项错误（高频陷阱）。\n④ 根据《民法典》第311条第2款及第186条，受让人依据善意取得所有权的，原所有权人有权向无处分权人乙请求损害赔偿（违约与侵权竞合），故D项正确。",
        lawBasis: ["《民法典》第311条（善意取得）", "《民法典》第597条（无权处分合同效力）"]
      },
      {
        id: "XF_2024_02",
        subject: "刑法",
        type: "单选",
        difficulty: "中",
        year: "2024真题精选",
        title: "甲深夜下班途中遭遇乙持刀抢劫，甲假意掏钱包，趁乙低头瞬间夺下匕首并反刺乙胸部一刀，致乙重伤倒地失去侵害能力。甲见乙随身携带的挎包掉落，便顺手拿走乙的挎包（内有现金8000元）逃离现场。关于甲的行为定性，下列哪一选项是正确的？",
        options: [
          { id: "A", text: "夺刀反刺行为属于防卫过当，拿走挎包构成抢劫罪" },
          { id: "B", text: "夺刀反刺行为属于正当防卫（特殊防卫），拿走挎包构成盗窃罪" },
          { id: "C", text: "夺刀反刺行为属于正当防卫，拿走挎包构成侵占罪" },
          { id: "D", text: "整体构成转化型抢劫罪，应当数罪并罚" }
        ],
        answer: ["B"],
        explanation: "① 根据《刑法》第20条第3款规定，对正在进行行凶、杀人、抢劫、强奸、绑架以及其他严重危及人身安全的暴力犯罪，采取防卫行为，造成不法侵害人伤亡的，不属于防卫过当，不负刑事责任。乙正在持刀抢劫，甲夺刀刺伤乙属于正当防卫（特殊防卫），不负刑事责任。\n② 乙倒地失去知觉或反抗能力后，其随身财物在客观上仍属于乙占有的财物（非遗忘物），甲在防卫结束后临时起意取走财物，没有再实施新的压制反抗的暴力手段，故不构成抢劫罪或侵占罪，而构成盗窃罪。因此B项正确。",
        lawBasis: ["《刑法》第20条第3款（特殊防卫）", "《刑法》第264条（盗窃罪）"]
      },
      {
        id: "XZF_2024_03",
        subject: "行政法",
        type: "多选",
        difficulty: "难",
        year: "2024新法必考",
        title: "某市市场监督管理局以甲公司生产销售不合格产品为由，作出没收违法所得并罚款15万元的行政处罚决定。甲公司不服。根据新修订的《行政复议法》，下列哪些说法是正确的？",
        options: [
          { id: "A", text: "甲公司应当先向该市人民政府申请行政复议，对复议决定不服方可向法院提起行政诉讼" },
          { id: "B", text: "该行政处罚不属于复议前置情形，甲公司可以直接向人民法院提起行政诉讼" },
          { id: "C", text: "若甲公司申请行政复议，行政复议机关应当为该市人民政府，不能向省级市场监管部门申请" },
          { id: "D", text: "因罚款数额较大，行政复议机关审理该案适用普通程序，应当当面或者通过互联网、电话等方式听取当事人的意见" }
        ],
        answer: ["B", "C", "D"],
        explanation: "① 根据《行政复议法》第23条，复议前置主要包括：当场作出的行政处罚决定、自然资源权属侵权决定、认为行政机关不履行法定职责、未依法公开政府信息等情形。本案市监局作出的一般程序15万元罚款不属于当场行政处罚，故不属于复议前置，A项错误，B项正确。\n② 根据新《行政复议法》第24条取消地方政府工作部门条条管辖改革（集中管辖），对县级以上地方各级人民政府工作部门作出的行政行为不服的，由本级人民政府管辖，不再向其上一级主管部门申请复议，故C项正确。\n③ 根据《行政复议法》第49条，普通程序审理行政复议案件，应当当面或者通过互联网、电话等方式听取当事人的意见，故D项正确。",
        lawBasis: ["《行政复议法》第23条（复议前置）", "《行政复议法》第24条（政府集中管辖）", "《行政复议法》第49条（听取意见义务）"]
      },
      {
        id: "XSF_2024_04",
        subject: "刑诉法",
        type: "单选",
        difficulty: "中",
        year: "2024真题精选",
        title: "犯罪嫌疑人王某涉嫌电信网络诈骗罪被审查起诉，王某自愿如实供述罪行，承认指控的犯罪事实，并在辩护人见证下签署了认罪认罚具结书。关于本案认罪认罚从宽制度的适用，下列哪一选项是不正确的？",
        options: [
          { id: "A", text: "人民检察院提出的量刑建议一般应当为确定刑量刑建议" },
          { id: "B", text: "若王某系盲、聋、哑人，签署认罪认罚具结书并非适用认罪认罚从宽制度的必经程序" },
          { id: "C", text: "人民法院经审理认为量刑建议明显不当的，可以直接依法改判，无需告知人民检察院调整量刑建议" },
          { id: "D", text: "即使王某认罪认罚，案件仍须达到事实清楚，证据确实、充分的法定证明标准" }
        ],
        answer: ["C"],
        explanation: "本题选非（注意题眼“不正确的”）！\n① 根据《刑事诉讼法》第201条第2款，人民法院经审理认为量刑建议明显不当，或者被告人、辩护人对量刑建议提出异议的，人民检察院可以调整量刑建议。人民检察院不调整量刑建议或者调整量刑建议后仍然明显不当的，人民法院应当依法作出判决。因此法院不能跳过告知检察院调整的程序而直接改判，C项说法错误，当选。\n② A、B、D三项均符合《刑事诉讼法》第173条、第174条及《认罪认罚从宽制度指导意见》的规定。",
        lawBasis: ["《刑事诉讼法》第174条", "《刑事诉讼法》第201条（量刑建议采纳与调整）"]
      },
      {
        id: "MSF_2024_05",
        subject: "民诉法",
        type: "多选",
        difficulty: "中",
        year: "2024真题精选",
        title: "住所地在A市甲区的宏达公司与住所地在B市乙区的腾飞公司在C市丙区签订了一份设备买卖合同，约定合同在D市丁区履行。后因腾飞公司迟延交货，宏达公司欲提起诉讼请求解除合同。合同中未约定管辖法院。关于本案管辖，下列哪些法院有管辖权？",
        options: [
          { id: "A", text: "A市甲区人民法院（原告宏达公司住所地）" },
          { id: "B", text: "B市乙区人民法院（被告腾飞公司住所地）" },
          { id: "C", text: "C市丙区人民法院（合同签订地）" },
          { id: "D", text: "D市丁区人民法院（约定的合同履行地）" }
        ],
        answer: ["B", "D"],
        explanation: "① 根据《民事诉讼法》第24条规定，因合同纠纷提起的诉讼，由被告住所地（B市乙区）或者合同履行地人民法院管辖，合同签订地（C市丙区）无管辖权，故B项正确，C项错误。\n② 根据《民诉法解释》第18条第1款规定，合同约定履行地点的，以约定的履行地点为合同履行地。本案明确约定了合同在D市丁区履行，即使尚未实际履行或仅诉请解除合同，约定的履行地D市丁区法院仍有管辖权，故D项正确，A项错误（不再适用争议标的为给付货币时的接收货币一方所在地规则，因为本案有明确约定的履行地，且诉请为解除合同）。",
        lawBasis: ["《民事诉讼法》第24条", "《民诉法解释》第18条（合同履行地确定规则）"]
      },
      {
        id: "SJJ_2024_06",
        subject: "商经法",
        type: "不定项",
        difficulty: "难",
        year: "2024新公司法必考",
        title: "2024年8月，甲、乙、丙共同出资设立星辰有限责任公司，注册资本1000万元，章程规定甲认缴500万元于2028年12月前缴足。2025年3月，星辰公司因经营不善不能清偿到期债务（欠债权人丁公司300万元）。根据2023年修订的《公司法》，下列哪些说法是正确的？",
        options: [
          { id: "A", text: "全体股东认缴的出资额应当自公司成立之日起五年内缴足" },
          { id: "B", text: "星辰公司或者已到期债权人丁公司有权要求甲提前缴纳出资（出资加速到期）" },
          { id: "C", text: "若甲将未届出资期限的股权转让给戊，则原则上由受让人戊承担缴纳该出资的义务；戊未按期足额缴纳的，甲承担补充责任" },
          { id: "D", text: "董事会对股东出资情况负有核查与催缴义务，未及时履行义务给公司造成损失的，负有责任的董事应当承担赔偿责任" }
        ],
        answer: ["A", "B", "C", "D"],
        explanation: "新《公司法》资本制度四大核心考点全覆盖：\n① 第47条：有限责任公司全体股东认缴的出资额由股东按照公司章程的规定自公司成立之日起五年内缴足，A正确。\n② 第54条（加速到期入法）：公司不能清偿到期债务的，公司或者已到期债权的债权人有权要求已认缴出资但未届出资期限的股东提前缴纳出资，B正确。\n③ 第88条第1款：股东转让已认缴出资但未届出资期限的股权的，由受让人承担缴纳该出资的义务；受让人未按期足额缴纳出资的，转让人对受让人未按期缴纳的出资承担补充责任，C正确。\n④ 第51条：董事会应当对股东的出资情况进行核查，发现未按期足额缴纳的应当书面催缴；未及时履行义务给公司造成损失的，负有责任的董事承担赔偿责任，D正确。",
        lawBasis: ["《公司法》(2023修订) 第47条、第51条、第54条、第88条"]
      },
      {
        id: "LLF_2024_07",
        subject: "法理学",
        type: "单选",
        difficulty: "易",
        year: "2024真题精选",
        title: "《民法典》第184条规定：“因自愿实施紧急救助行为造成受助人损害的，救助人不承担民事责任。”关于该条文所体现的法理，下列哪一选项是正确的？",
        options: [
          { id: "A", text: "该条文属于授权性规则，赋予救助人请求报酬的权利" },
          { id: "B", text: "该条文直接表达了一个完整的法律规范，证明法律条文等同于法律规则" },
          { id: "C", text: "该条文通过免除善意救助人的后顾之忧，体现了法律对社会主义核心价值观的制度化保障" },
          { id: "D", text: "法官适用该条文裁判案件时只需进行形式逻辑三段论推理，无需进行任何实质价值判断" }
        ],
        answer: ["C"],
        explanation: "① 《民法典》第184条（“好人法”条款）规定的是免责规则，旨在弘扬见义勇为、助人为乐的社会主义核心价值观，故C项正确，A项错误。\n② 法律条文是法律规则的文字载体，二者并非一一对应关系，B项错误。\n③ 认定是否属于“自愿实施”、“紧急救助”往往需要结合具体案情进行文义解释与实质价值衡量，D项错误。",
        lawBasis: ["法理学·法律规则与法律条文", "《民法典》第184条"]
      },
      {
        id: "SGF_2024_08",
        subject: "国际法",
        type: "单选",
        difficulty: "易",
        year: "2024真题精选",
        title: "中国公民甲与定居在瑞士的法国公民乙因位于中国上海的一处房产继承发生纠纷，甲向上海某法院提起诉讼。根据《涉外民事关系法律适用法》，关于该房产法定继承的法律适用，下列哪一说法是正确的？",
        options: [
          { id: "A", text: "适用被继承人死亡时经常居所地法律" },
          { id: "B", text: "适用不动产所在地法律，即中华人民共和国法律" },
          { id: "C", text: "由当事人协议选择适用中国法或瑞士法" },
          { id: "D", text: "适用被继承人本国法" }
        ],
        answer: ["B"],
        explanation: "根据《涉外民事关系法律适用法》第31条规定：“法定继承，适用被继承人死亡时经常居所地法律，但不动产法定继承，适用不动产所在地法律。”这一制度在国际私法上称为法定继承的“区别制”（同一制与区别制之分）。本案争议标的为位于上海的不动产法定继承，应当适用不动产所在地法即中国法，故B项正确。",
        lawBasis: ["《涉外民事关系法律适用法》第31条（法定继承区别制）"]
      },
      {
        id: "ZGF_2024_09",
        subject: "主观题",
        type: "主观题",
        difficulty: "难",
        year: "2024主观题综合案例",
        title: "【民商诉综合案例】2024年3月，甲公司向乙银行借款2000万元，丙公司提供连带责任保证（董事会决议通过，但未在保证合同中约定保证期间），丁以其名下市值1500万元的商铺设定抵押并办理了抵押登记。借款到期后甲公司无力偿还。乙银行于借款到期后第8个月向丙公司发出书面催收通知。请分析：\n（1）丙公司的保证期间如何确定？乙银行请求丙公司承担保证责任是否能够得到支持？\n（2）乙银行是否必须先实现丁的商铺抵押权，然后才能向保证人丙主张权利？为什么？",
        options: [],
        answer: ["主观解析"],
        explanation: "【参考采分点与法条依据】\n（1）丙公司不承担保证责任。\n依据《民法典》第692条第2款规定，当事人对保证期间没有约定或者约定不明确的，保证期间为主债务履行期限届满之日起六个月。本案未约定保证期间，依法为6个月。乙银行在主债务到期后第8个月才向连带责任保证人丙主张权利，保证期间已经届满；依据《民法典》第693条第2款，连带责任保证的债权人未在保证期间请求保证人承担保证责任的，保证人不再承担保证责任（保证期间属于除斥期间，不发生中断、中止）。\n\n（2）若保证期间未过，乙银行无需先实现丁的抵押权，可以选择直接要求丁承担担保物权或要求丙承担保证责任。\n依据《民法典》第392条（混合共同担保规则）：被担保的债权既有物的担保又有人的担保的，债务人不履行到期债务时，债权人应当按照约定实现债权；没有约定或者约定不明确，债务人自己提供物的担保的，债权人应当先就该物的担保实现债权；第三人提供物的担保的，债权人可以就物的担保实现债权，也可以请求保证人承担保证责任。本案抵押物商铺由第三人丁提供（非债务人甲自己提供），故物保与人保地位平等，乙银行有选择权。",
        lawBasis: ["《民法典》第392条（混合共同担保）", "《民法典》第692-693条（法定6个月保证期间）"]
      }
    ];

    const FALLBACK_KNOWLEDGE = [
      {
        subject: "民法",
        title: "善意取得 vs 遗失物追回规则",
        content: "1. 占有委托物（借用、保管、租赁）：适用《民法典》第311条善意取得（受让人善意 + 合理价格 + 不动产登记/动产交付）。一旦善意取得成立，其后转手无论有偿或无偿（如赠与），后手均继受取得所有权。\n2. 占有脱离物（遗失物、盗赃物）：依据《民法典》第312条，原则上不适用善意取得；权利人自知道或应当知道受让人之日起2年内有权请求返还。若受让人通过拍卖或向具有经营资格的经营者购得，权利人请求返还时应当支付受让人所付费用。"
      },
      {
        subject: "商经法",
        title: "2024新《公司法》四大核心必背",
        content: "1. 五年认缴制（第47条）：有限责任公司全体股东认缴出资额自成立之日起5年内缴足。\n2. 出资加速到期（第54条）：公司不能清偿到期债务，公司或已到期债权人均可要求未届期股东提前缴纳（无需达到破产原因）。\n3. 未届期股权转让责任（第88条）：受让人承担出资义务，转让人承担补充责任；瑕疵出资股权转让的，转让人与受让人（知情时）承担连带责任。\n4. 横向人格否认（第23条第2款）：股东利用其控制的两个以上公司滥用独立地位逃避债务，各公司对债务承担连带责任。"
      },
      {
        subject: "刑诉法",
        title: "认罪认罚具结书免签的三种情形",
        content: "犯罪嫌疑人自愿认罪，同意量刑建议和程序适用的，应当在辩护人或值班律师在场下签署具结书。但有下列情形之一的不需要签署（仍适用认罪认罚从宽）：\n① 犯罪嫌疑人是盲、聋、哑人，或者是尚未完全丧失辨认或者控制自己行为能力的精神病人的；\n② 未成年犯罪嫌疑人的法定代理人、辩护人对未成年人认罪认罚有异议的；\n③ 涉嫌犯罪线索尚未查清，需要进一步侦查或核实的。"
      },
      {
        subject: "行政法",
        title: "新《行政复议法》复议前置四大必考情形",
        content: "口诀：【当场罚、占资源、不履责、不公开】\n1. 对当场作出的行政处罚决定不服；\n2. 对行政机关作出的侵犯其已经依法取得的自然资源的所有权或者使用权的决定不服；\n3. 认为行政机关存在第11条规定的未履行法定职责情形；\n4. 申请政府信息公开，行政机关不予公开。"
      }
    ];

    const SUBJECT_LIST = [
      { key: "全部", label: "全部题目" },
      { key: "智能复习", label: "智能复习" },
      { key: "错题重做", label: "错题重做" },
      { key: "我的收藏", label: "我的收藏" },
      { key: "有笔记", label: "笔记题库" },
      { key: "民法", label: "民法" },
      { key: "刑法", label: "刑法" },
      { key: "行政法", label: "行政法" },
      { key: "刑诉法", label: "刑诉法" },
      { key: "民诉法", label: "民诉法" },
      { key: "知识产权法", label: "知识产权法" },
      { key: "商经法", label: "商经法" },
      { key: "宪法", label: "宪法" },
      { key: "法理学", label: "法理学" },
      { key: "国际法", label: "国际法" },{ key: "法制史", label: "法制史" },{ key: "司法制度与职业道德", label: "司法制度与职业道德" },
      { key: "主观题", label: "主观案例" }
    ];

    const SUBJECT_ICONS = {
      "全部": '<svg class="subj-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 7v14"/><path d="M3 18a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"/></svg>',
      "智能复习": '<svg class="subj-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l1.8 4.6L18 9l-4.2 1.4L12 15l-1.8-4.6L6 9l4.2-1.4z"/><path d="M18.5 14.5l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8z"/></svg>',
      "错题重做": '<svg class="subj-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M15 9l-6 6M9 9l6 6"/></svg>',
      "我的收藏": '<svg class="subj-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M12 3l2.7 6.3 6.8.6-5.2 4.5 1.6 6.6L12 17.8 6.1 21l1.6-6.6L2.5 9.9l6.8-.6z"/></svg>',
      "有笔记": '<svg class="subj-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z"/><path d="M8 2v20"/><path d="M12 7h5M12 11h5"/></svg>'
    };

    // =========================================================================
    // 2. IndexedDB + LocalStorage 双写守护引擎 (完美兼容原版 fakao_* 键名)
    // =========================================================================
    const STORAGE_KEYS = {
      PROGRESS: "fakao_progress",
      WRONG: "fakao_wrong_questions",
      FAVORITES: "fakao_favorites_v1",
      NOTES: "fakao_notes_v1",
      WRONG_REASONS: "fakao_wrong_reasons_v1",
      GIST: "fakao_gist_config",
      THEME: "fakao_theme",
      DEEPSEEK_KEY: "fakao_deepseek_key"
    };

    // AI 统一走 window.XS_AI（同源 /api/*，Cloudflare Pages Functions），
    // 密钥仅在服务端环境变量，前端不接触令牌；用户自备 DeepSeek Key 仅作可选兜底。

    const IDBEngine = {
      dbName: "FakaoGuardDB",
      storeName: "state_mirror",
      dbPromise: null,
      open() {
    if (this.dbPromise) return this.dbPromise;
    this.dbPromise = new Promise((resolve) => {
      let settled = false;
      const done = (v) => { if (settled) return; settled = true; clearTimeout(timer); resolve(v); };
      // P4-3：iOS Safari 升级后 indexedDB.open 偶发一直不返回，加 1.5s 超时视为不可用，避免启动卡死
      const timer = setTimeout(() => { done(null); this.dbPromise = null; }, 1500);
      try {
        if (!("indexedDB" in window)) return done(null);
        const req = indexedDB.open(this.dbName, 1);
        req.onupgradeneeded = (e) => {
          const db = e.target.result;
          if (!db.objectStoreNames.contains(this.storeName)) {
            db.createObjectStore(this.storeName);
          }
        };
        req.onsuccess = (e) => done(e.target.result);
        req.onerror = () => done(null);
      } catch (err) {
        done(null);
      }
    });
    return this.dbPromise;
  },
      async write(key, rawString) {
        const db = await this.open();
        if (!db) return;
        return new Promise((resolve) => {
          try {
            const tx = db.transaction(this.storeName, "readwrite");
            tx.objectStore(this.storeName).put(rawString, key);
            tx.oncomplete = () => resolve(true);
            tx.onerror = () => resolve(false);
          } catch (e) {
            resolve(false);
          }
        });
      },
      async read(key) {
        const db = await this.open();
        if (!db) return null;
        return new Promise((resolve) => {
          try {
            const tx = db.transaction(this.storeName, "readonly");
            const req = tx.objectStore(this.storeName).get(key);
            req.onsuccess = () => resolve(req.result ?? null);
            req.onerror = () => resolve(null);
          } catch (e) {
            resolve(null);
          }
        });
      },
      async del(key) {
        const db = await this.open();
        if (!db) return;
        return new Promise((resolve) => {
          try {
            const tx = db.transaction(this.storeName, "readwrite");
            tx.objectStore(this.storeName).delete(key);
            tx.oncomplete = () => resolve(true);
            tx.onerror = () => resolve(false);
          } catch (e) {
            resolve(false);
          }
        });
      }
    };

    // 凭据类键：只留在 localStorage 供本机使用，绝不镜像进 IndexedDB（少一份可被读取的副本）
    const SECRET_STORAGE_KEYS = new Set([STORAGE_KEYS.GIST, STORAGE_KEYS.DEEPSEEK_KEY]);
    // 一次性清理：把历史版本镜像进 IndexedDB 的凭据副本删掉
    try {
      setTimeout(() => {
        SECRET_STORAGE_KEYS.forEach((k) => {
          try { IDBEngine.del(k).catch(() => {}); } catch (e) {}
        });
      }, 1500);
    } catch (e) {}

    function safeLoadJSON(key, fallback) {
      try {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : fallback;
      } catch (e) {
        return fallback;
      }
    }

    // P4-8：批量写 —— 同 key 合并 + requestIdleCallback 延迟落盘，避免每答一题都同步全量序列化并双写阻塞主线程
const __pendingSaves = new Map();
let __saveScheduled = false;
function __flushSaves() {
  if (!__pendingSaves.size) { __saveScheduled = false; return; }
  const entries = Array.from(__pendingSaves.entries());
  __pendingSaves.clear();
  __saveScheduled = false;
  let ok = true;
  for (const [k, raw] of entries) {
    try {
      localStorage.setItem(k, raw);
    } catch (e) {
      ok = false;
    }
    if (!SECRET_STORAGE_KEYS.has(k)) {
      try {
        IDBEngine.write(k, raw);
      } catch (e) {
        ok = false;
      }
    }
  }
  if (!ok && typeof showToast === "function") {
    showToast("本地存储写入失败（可能是空间不足），数据未丢失，请尽快导出备份", "error");
  }
  const nowStr = new Date().toLocaleTimeString();
  const el = document.getElementById("idbSyncTimeText");
  if (el) el.textContent = (ok ? "IndexedDB 已双写 (" : "写入异常 (") + nowStr + ")";
}
function safeSaveJSON(key, data) {
  let raw;
  try {
    raw = JSON.stringify(data);
  } catch (e) {
    if (typeof showToast === "function") showToast("保存失败：数据序列化异常", "error");
    return false;
  }
  __pendingSaves.set(key, raw);
  if (!__saveScheduled) {
    __saveScheduled = true;
    const sched = (typeof window.requestIdleCallback === "function")
      ? window.requestIdleCallback
      : (cb) => setTimeout(cb, 50);
    try {
      sched(__flushSaves, { timeout: 800 });
    } catch (e) {
      __flushSaves();
    }
  }
  return true;
}
// P4-8：页面隐藏/卸载前立即落盘，避免延迟写窗口内丢数据
try {
  window.addEventListener("beforeunload", __flushSaves);
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") __flushSaves();
    // P4-13：页面切到后台时给 html 加 page-hidden，CSS 暂停常驻装饰动画，降低后台耗电
    try { document.documentElement.classList.toggle("page-hidden", document.visibilityState === "hidden"); } catch (e) {}
  });
} catch (e) {}
    // 申请持久化存储，降低浏览器在磁盘紧张时回收答题数据的概率
    try {
      if (navigator.storage && navigator.storage.persist) navigator.storage.persist();
    } catch (e) {}

    // =========================================================================
    // 3. 全局应用状态
    // =========================================================================
    let allQuestions = [...FALLBACK_QUESTIONS];
    let knowledgeBase = [...FALLBACK_KNOWLEDGE];
    // P2-7：按 id 建索引缓存（仅当 allQuestions 整体被替换时重建），
    // 避免在遍历错题/列表时反复 allQuestions.find 造成 O(N×M)
    let __qByIdRef = null;
    let __qByIdMap = new Map();
    function getQById(id) {
      if (__qByIdRef !== allQuestions) {
        __qByIdMap = new Map(allQuestions.map((q) => [String(q.id), q]));
        __qByIdRef = allQuestions;
      }
      return __qByIdMap.get(String(id));
    }
  // ── 按需加载知识点数据（首屏不拉 590KB 的 knowledge.json）──
  window.__loadKnowledgeBase = async function(){
    if (window.__kbLoaded || window.__kbLoading) return;
    window.__kbLoading = true;
    try {
        const kEndpoint = [".", "knowledge.json"].join("/");
        const kRes = await fetch(kEndpoint);
        if (kRes.ok) {
          const kData = await kRes.json();
          if (Array.isArray(kData) && kData.length > 0) {
            knowledgeBase = kData;
          } else if (kData && typeof kData === "object") {
            const flatK = [];
            Object.entries(kData).forEach(([subj, arr]) => {
              if (Array.isArray(arr)) {
                arr.forEach((item) => flatK.push(typeof item === "object" ? { subject: item.subject || subj, ...item } : { subject: subj, title: subj, content: String(item) }));
              }
            });
            if (flatK.length > 0) knowledgeBase = flatK;
          }
        }
      } catch (e) {}
    window.__kbLoading = false;
    window.__kbLoaded = true;
    try {
      const km = document.getElementById("knowledgeModal");
      if (km && !km.classList.contains("hidden")) renderKnowledgeAndNotesModal();
    } catch (e) {}
  };
    let filteredQuestions = [...allQuestions];
    let currentIndex = 0;

    // 筛选状态
    let currentSubject = "全部";
    let currentTypeFilter = "ALL";
    let currentDiffFilter = "ALL";
    let searchQuery = "";
let loadingSubjectName = null;   // P4-4：正在按需加载的科目（用于显示加载中骨架而非「暂无题目」）

    // P2-15：学习位置记忆
    const LAST_SUBJECT_KEY = "fk_last_subject";
    const LAST_POS_KEY = "fk_last_pos";
    let lastPosPending = null;    // 启动时读到、等待一次性恢复的 {subject,index,qid,qsubj}
    let lastPosWritable = false;  // 真实题库就绪并完成恢复判定后才允许写 fk_last_pos

    // P2-5：manifest shortcuts（/?go=wrong、/?go=review）启动跳转
    const GO_SHORTCUTS = { wrong: "错题重做", review: "智能复习" };
    let pendingGo = null;         // 待切换的目标视图；真实题库就绪后由 applyPendingGo() 一次性执行
    let pendingGoBase = null;     // 解析 go 时的 currentSubject；用户在题库就绪前自己换了科目则放弃跳转

    // 学习与交互模式
    let studyMode = "practice"; // 'practice' | 'recite' | 'exam'
    let isKeywordHighlight = true;
    let isInstantSingleCheck = true;
    let autoRemoveWrong = true;
// P3-3：开关状态持久化到 localStorage.fakao_settings（题眼高亮 / 单选即判 / 自动移出错题）
// P3-7：sw.js 版本只拉一次（verBadge 角标与更新横幅共用，避免各拉一次）
let __swVerPromise = null;
window.__fkSwVersion = function () {
  if (!__swVerPromise) {
    __swVerPromise = fetch([".", "sw.js"].join("/"), { cache: "no-store" })
      .then((r) => r.text())
      .then((t) => { const m = t.match(/CACHE_VERSION\s*=\s*["']([^"']+)["']/); return m ? m[1] : null; })
      .catch(() => null);
  }
  return __swVerPromise;
};
const SETTINGS_KEY = "fakao_settings";
function loadSettings() { try { return JSON.parse(localStorage.getItem(SETTINGS_KEY) || "{}") || {}; } catch (e) { return {}; } }
function saveSettings(patch) { try { const st = loadSettings(); Object.assign(st, patch); localStorage.setItem(SETTINGS_KEY, JSON.stringify(st)); } catch (e) {} }
(function initToggleSettings() {
  const st = loadSettings();
  if (typeof st.keywordHighlight === "boolean") isKeywordHighlight = st.keywordHighlight;
  if (typeof st.instantCheck === "boolean") isInstantSingleCheck = st.instantCheck;
  if (typeof st.autoRemoveWrong === "boolean") autoRemoveWrong = st.autoRemoveWrong;
  const apply = () => {
    const hb = document.getElementById("toggleHighlightBtn"); if (hb) { hb.classList.toggle("is-on", isKeywordHighlight); hb.classList.toggle("is-off", !isKeywordHighlight); hb.setAttribute("aria-pressed", String(isKeywordHighlight)); const t = document.getElementById("highlightStateText"); if (t) t.textContent = isKeywordHighlight ? "开" : "关"; }
    const ib = document.getElementById("toggleInstantCheckBtn"); if (ib) { ib.classList.toggle("is-on", isInstantSingleCheck); ib.classList.toggle("is-off", !isInstantSingleCheck); ib.setAttribute("aria-pressed", String(isInstantSingleCheck)); const t = document.getElementById("instantCheckText"); if (t) t.textContent = isInstantSingleCheck ? "开" : "关"; }
    const cb = document.getElementById("autoRemoveWrongCheckbox"); if (cb) cb.checked = autoRemoveWrong;
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", apply); else apply();
})();
    let currentSelectedOptions = new Set();

    // 答题卡分页 / 知识点检索状态
    const SHEET_PAGE_SIZE = 120;
    let sheetPage = 0;
    const KNOWLEDGE_PAGE_SIZE = 10;
    let knowledgePage = 0;
    let knowledgeQuery = "";
    let knowledgeSubject = "全部";

    // 持久化用户数据
    // userProgress[qid] = { answered: true, isCorrect: bool（主观题为 null）, subjective?: true, userAnswer: [...],
    //   attempts: 累计作答次数（仅统计用）, streak: 连续答对次数（驱动复习间隔）, nextReviewAt: timestamp, lastAnsweredAt: timestamp }
    // 复习间隔（P2-14）：客观题答对 streak+1，间隔取 REVIEW_INTERVAL_DAYS[min(streak,5)-1]（1/3/7/14/30 天）；
    //   答错 streak 归 0，间隔 0（立即到期）；主观题提交后固定 1 天。
    const REVIEW_INTERVAL_DAYS = [1, 3, 7, 14, 30];
    let userProgress = safeLoadJSON(STORAGE_KEYS.PROGRESS, {});
    // wrongQuestions: array of question IDs
    let wrongQuestions = safeLoadJSON(STORAGE_KEYS.WRONG, []);
    if (!Array.isArray(wrongQuestions)) wrongQuestions = [];
    // favorites: { [qid]: true }
    let favorites = safeLoadJSON(STORAGE_KEYS.FAVORITES, {});
    // notes: { [qid]: "笔记内容" }
    let userNotes = safeLoadJSON(STORAGE_KEYS.NOTES, {});
    // wrongReasons: { [qid]: "概念混淆" }
    let wrongReasons = safeLoadJSON(STORAGE_KEYS.WRONG_REASONS, {});
    // 错题本筛选状态；wrongPracticeIds 非空时「错题重做」只刷这一批题
    let wrongFilterSubject = "ALL";
    let wrongFilterReason = "ALL";
    // P2-8：错题列表分页状态。wrongListIds = 当前筛选下有效题目 id；卡片 data-wrong-idx 即其下标
    const WRONG_PAGE_SIZE = 50;
    let wrongListPage = 0;
    let wrongListIds = [];
    let wrongListDelegated = false;
    let wrongPracticeIds = null;

    // 模拟考场计时器
    let examSeconds = 0;
    let examInterval = null;

    // =========================================================================
    // 4. 工具函数：Toast 提示 & 题眼高亮处理
    // =========================================================================
    function showToast(msg, type = "info") {
      const container = document.getElementById("toastContainer");
      if (!container) return;
      const div = document.createElement("div");
      const bgMap = {
        info: "bg-slate-900 text-white",
        success: "bg-emerald-600 text-white",
        warn: "bg-amber-500 text-slate-950",
        error: "bg-rose-600 text-white"
      };
      div.className = `px-3.5 py-2 rounded-xl shadow-lg text-xs font-semibold transition-all duration-200 ${bgMap[type] || bgMap.info}`;
      div.textContent = msg;
      container.appendChild(div);
      setTimeout(() => {
        div.style.opacity = "0";
        setTimeout(() => div.remove(), 220);
      }, 2200);
    }

    function escapeHtml(str) {
      return String(str || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
    }

    function formatLegalHighlight(rawText) {
      const safe = escapeHtml(rawText);
      if (!isKeywordHighlight) return safe;

      // 1. 高亮《xxx》法条名称
      let out = safe.replace(/(《[^》]+》(?:第[零一二三四五六七八九十百千万0-9]+条(?:第[一二三四五六七八九0-9]+款)?)?)/g, '<span class="kw-law">$1</span>');
      // 2. 高亮否定词与法考题眼
      out = out.replace(/(不正确的是|错误的是|不属于|不构成|不承担|不负刑事责任|无效|不得|不能|无权|应当|必须)/g, '<span class="kw-neg">$1</span>');
      // 3. 高亮核心制度词
      out = out.replace(/(善意取得|无权处分|正当防卫|特殊防卫|防卫过当|认罪认罚|复议前置|加速到期|补充责任|连带责任|除斥期间|诉讼时效)/g, '<span class="kw-core">$1</span>');
      return out;
    }

    // 超长解析折叠：>600 字默认只显示前 400 字
    // 长解析折叠：阈值按视口「宽 + 高」动态计算，不能只看宽度。
    // 实测 1169 字解析（13px/1.95 行高）：
    //   360x740  全文 1306px = 1.8 屏   1280x800 全文 558px = 0.7 屏
    //   844x390  横屏 608px = 1.6 屏（又宽又矮，按宽度判断会漏折叠）
    // 原硬编码 600/400 字会让桌面端 2625 题做无谓折叠，且 400 字硬切
    // 有 97.1% 概率落在句子中间。改为「全文预计 > 1.3 屏才折叠，
    // 预览约 0.75 屏」，并在预览附近对齐到句末/段末。
    const FOLD_CALIBRATION = 1.2;  // 字数→行数估算系数（标点、换行、数字宽度）
    let lastExplanation = "";
    let explanationExpanded = false;

    function foldLimits() {
      const w = window.innerWidth || 1024;
      const h = window.innerHeight || 768;
      const isNarrow = w <= 640;
      const fs = isNarrow ? 12.5 : 13;
      const lineH = fs * (isNarrow ? 1.9 : 1.95);
      const contentW = Math.max(200, Math.min(w - 50, 860));
      const charsPerLine = Math.max(16, (contentW - 13) / fs);
      const unit = charsPerLine * (h / lineH) / FOLD_CALIBRATION;
      // 预览 0.65 屏：实测换行多的解析用 0.75 会涨到 0.88 屏；
      // 横屏/分屏（高 < 500）再收紧到 0.5，否则预览本身就近一屏，
      // 「展开全文」按钮会被挤到视口外。
      const previewRatio = h < 500 ? 0.5 : 0.65;
      return {
        preview: Math.max(180, Math.min(900, Math.round(unit * previewRatio))),
        limit: Math.max(420, Math.min(1600, Math.round(unit * 1.3)))
      };
    }

    // 在预览字数附近回溯到最近的句末/段末，避免把句子从中间切断
    function foldAtSentence(text, want) {
      if (text.length <= want) return text.length;
      const lo = Math.max(0, want - 90), hi = Math.min(text.length, want + 40);
      for (let i = hi - 1; i >= lo; i--) {
        if ("。！？；\n.!?;".indexOf(text[i]) >= 0) return i + 1;
      }
      for (let i = hi - 1; i >= lo; i--) {
        if (text[i] === "，" || text[i] === ",") return i + 1;
      }
      return want;
    }

    function renderExplanation(rawText) {
      lastExplanation = String(rawText || "");
      explanationExpanded = false;
      drawExplanation(false);
    }

    function drawExplanation(expanded) {
      const el = document.getElementById("explanationContent");
      if (!el) return;
      explanationExpanded = !!expanded;
      const full = lastExplanation;
      const { preview, limit } = foldLimits();
      if (explanationExpanded || full.length <= limit) {
        el.innerHTML = formatLegalHighlight(full);
        if (full.length > limit) {
          el.insertAdjacentHTML("beforeend", '<div class="mt-2"><button type="button" id="expFoldBtn" class="text-xs font-semibold text-blue-600 dark:text-blue-300 underline">收起 ▲</button></div>');
          const b = document.getElementById("expFoldBtn");
          if (b) b.onclick = () => drawExplanation(false);
        }
        return;
      }
      const cut = foldAtSentence(full, preview);
      el.innerHTML = formatLegalHighlight(full.slice(0, cut)) +
        '<div class="mt-2"><button type="button" id="expFoldBtn" class="text-xs font-semibold text-blue-600 dark:text-blue-300 underline">… 展开全文（共 ' + full.length + ' 字）▼</button></div>';
      const b = document.getElementById("expFoldBtn");
      if (b) b.onclick = () => drawExplanation(true);
    }

    // 旋转屏幕 / 分屏后按新视口重算阈值，保持用户当前的展开状态
    let foldResizeTimer = null;
    window.addEventListener("resize", () => {
      clearTimeout(foldResizeTimer);
      foldResizeTimer = setTimeout(() => {
        const box = document.getElementById("explanationBox");
        if (lastExplanation && box && !box.classList.contains("hidden")) {
          drawExplanation(explanationExpanded);
        }
      }, 180);
    });

    // iOS Safari 软键盘：window.innerHeight / vh 都按最大视口计算，键盘弹出时
    // 不会收缩；VisualViewport.height 才反映被键盘遮挡后的真实可视高度。
    // 同步两个量给 CSS 用：
    //   --app-vv-height  真实可视高度，供 35vh / 70vh 一类限高改用；
    //   --app-kb-inset   被键盘盖住的高度，供底部固定浮层上移。
    // 桌面 / Android 上 vv.height≈innerHeight、offsetTop≈0，两个量退化为
    // 「不变 / 0px」，不会引入位移；只有差异 >100px（键盘量级）才生效，
    // 避免缩放、地址栏收放带来的像素抖动。
    (function () {
      const root = document.documentElement;
      const sync = () => {
        const vv = window.visualViewport;
        const h = vv ? vv.height : window.innerHeight;
        root.style.setProperty('--app-vv-height', (h | 0) + 'px');
        const covered = vv ? window.innerHeight - (h + (vv.offsetTop || 0)) : 0;
        const inset = covered > 100 ? covered : 0;
        root.style.setProperty('--app-kb-inset', (inset | 0) + 'px');
      };
      sync();
      if (window.visualViewport) {
        window.visualViewport.addEventListener('resize', sync);
        window.visualViewport.addEventListener('scroll', sync);
      }
      window.addEventListener('resize', sync);
      window.addEventListener('orientationchange', sync);
    })();

    // 题干渲染：普通题保留高亮；【共享案情】题拆成「案情卡片 + 设问」。
    // 案情是作答必需信息，默认展开；用户可手动收起以便手机端查看选项。
    // 每次渲染都重置为展开，避免切到下一题时案情仍处于收起状态。
    const CASE_PREFIX = "【共享案情】";
    function renderQuestionTitle(el, raw) {
      const s = String(raw || "");
      if (!s.startsWith(CASE_PREFIX)) {
        el.innerHTML = formatLegalHighlight(s);
        return;
      }
      const body = s.slice(CASE_PREFIX.length).replace(/^[\r\n]+/, "");
      const sep = body.indexOf("\n\n");
      const material = (sep >= 0 ? body.slice(0, sep) : body).trim();
      const ask = (sep >= 0 ? body.slice(sep + 2) : "").trim();
      const chars = material.replace(/\s/g, "").length;
      el.innerHTML =
        '<div class="case-mat" id="caseMat">' +
          '<button type="button" class="case-mat-head" id="caseMatToggle" aria-expanded="true" aria-controls="caseMatBody">' +
            '<span class="case-mat-label">' +
              '<svg class="case-mat-chevron" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>' +
              '共享案情' +
              '<span class="case-mat-hint">约 ' + chars + ' 字 · 点击收起</span>' +
            '</span>' +
          '</button>' +
          '<div class="case-mat-body" id="caseMatBody">' + formatLegalHighlight(material) + '</div>' +
        '</div>' +
        (ask ? '<div class="case-ask">' + formatLegalHighlight(ask) + '</div>' : '');
      const card = el.querySelector("#caseMat");
      const toggle = el.querySelector("#caseMatToggle");
      const hint = toggle.querySelector(".case-mat-hint");
      toggle.addEventListener("click", () => {
        const collapsed = card.classList.toggle("is-collapsed");
        toggle.setAttribute("aria-expanded", String(!collapsed));
        hint.textContent = collapsed ? '点击展开' : '点击收起';
      });
    }

    // =========================================================================
    // 5. 外部题库自动探测（全面兼容单文件数组、分科清单、字典映射等所有 JSON 格式）
    // =========================================================================
    function isQuestionItem(obj) {
      return obj && typeof obj === "object" && Boolean(
        obj.title || obj.question || obj.stem || obj.content || obj.q || obj.body
      );
    }

    async function extractQuestionsFromData(data, defaultSubject = "") {
      if (!data) return [];
      if (Array.isArray(data)) {
        if (data.length === 0) return [];
        if (isQuestionItem(data[0])) {
          return data.map((item) => (defaultSubject && !item.subject ? { ...item, subject: defaultSubject } : item));
        }
        // 分科文件清单数组
        const merged = [];
        await Promise.allSettled(
          data.map(async (entry) => {
            const fname = typeof entry === "string" ? entry : (entry.file || entry.path || entry.url || entry.filename || `${entry.name || entry.subject}.json`);
            const subj = (typeof entry === "object" && (entry.subject || entry.name || entry.title)) || "";
            const subUrl = fname.startsWith(".") || fname.startsWith("/") || fname.startsWith("http")
              ? fname
              : [".", "questions", fname].join("/");
            const subRes = await fetch(subUrl);
            if (subRes.ok) {
              const subJson = await subRes.json();
              const subItems = await extractQuestionsFromData(subJson, subj);
              merged.push(...subItems);
            }
          })
        );
        return merged;
      }
      if (typeof data === "object") {
        if (Array.isArray(data.questions)) return extractQuestionsFromData(data.questions, defaultSubject);
        if (Array.isArray(data.items)) return extractQuestionsFromData(data.items, defaultSubject);
        if (Array.isArray(data.data)) return extractQuestionsFromData(data.data, defaultSubject);
        if (Array.isArray(data.files) || Array.isArray(data.subjects) || Array.isArray(data.list) || Array.isArray(data.categories)) {
          return extractQuestionsFromData(data.files || data.subjects || data.list || data.categories, defaultSubject);
        }
        // 字典映射结构：{ "民法": [...], "刑法": [...] } 或 { "民法": "minfa.json" }
        const dictMerged = [];
        const entries = Object.entries(data);
        await Promise.allSettled(
          entries.map(async ([k, v]) => {
            if (Array.isArray(v)) {
              const sub = await extractQuestionsFromData(v, k);
              dictMerged.push(...sub);
            } else if (typeof v === "string" && v.endsWith(".json")) {
              const subUrl = v.startsWith(".") || v.startsWith("/") ? v : [".", "questions", v].join("/");
              const subRes = await fetch(subUrl);
              if (subRes.ok) {
                const subJson = await subRes.json();
                const sub = await extractQuestionsFromData(subJson, k);
                dictMerged.push(...sub);
              }
            } else if (v && typeof v === "object" && (v.file || v.path || v.url)) {
              const sub = await extractQuestionsFromData([v], k);
              dictMerged.push(...sub);
            } else if (v && typeof v === "object") {
              // 嵌套字典：index.json 的 {version,total,subjects:{科目:{file:...}}}
              const sub = await extractQuestionsFromData(v, k);
              dictMerged.push(...sub);
            }
          })
        );
        return dictMerged;
      }
      return [];
    }

    // ── 题库 JSON 走 Worker 解析（失败自动回退主线程 fetch）──
    let __qWorker;
    let __qSeq = 0;
    const __qPending = new Map();
    function __getQWorker() {
      if (__qWorker !== undefined) return __qWorker;
      try {
        const w = new Worker([".", "workers", "questions-worker.js"].join("/"));
        w.onmessage = (ev) => {
          const d = ev.data || {};
          const p = __qPending.get(d.id);
          if (!p) return;
          __qPending.delete(d.id);
          clearTimeout(p.timer);
          p.resolve(d.ok ? d.json : null);
        };
        w.onerror = () => {
        try { w.terminate(); } catch (e) {}
        __qPending.forEach((pp) => { try { clearTimeout(pp.timer); } catch (e) {} pp.resolve(null); });
        __qPending.clear();
        __qWorker = null;
      };
        __qWorker = w;
      } catch (e) {
        __qWorker = null;
      }
      return __qWorker;
    }
    // 题库版本号：来自 questions/index.json 的 version 字段。
    // 分块请求统一附加 ?v=<version>，版本一变缓存键就变，无需再升 SW 版本即可让用户拿到新题库。
    let questionsVersion = "";
    function withQVersion(url) {
      if (!questionsVersion) return url;
      if (url.indexOf("/questions/") < 0) return url;
      if (/index\.json(\?|$)/.test(url)) return url;
      return url + (url.indexOf("?") >= 0 ? "&" : "?") + "v=" + encodeURIComponent(questionsVersion);
    }

    function fetchJsonViaWorker(rawUrl) {
      const url = withQVersion(rawUrl);
      const w = __getQWorker();
      if (!w) return fetch(url).then((r) => (r.ok ? r.json() : null)).catch(() => null);
      return new Promise((resolve) => {
        const id = ++__qSeq;
        const timer = setTimeout(() => {
        __qPending.delete(id);
        try { w.terminate(); } catch (e) {}
        __qWorker = null;
        resolve(null);
      }, 15000);
        __qPending.set(id, { resolve: resolve, timer: timer });
        try { w.postMessage({ id: id, url: new URL(url, location.href).href }); } catch (e) { __qPending.delete(id); clearTimeout(timer); __qWorker = null; resolve(null); }
      });
    }

    async function tryLoadExternalRepoData() {
      if (location.protocol !== "http:" && location.protocol !== "https:") return;

      let indexData = null;
      try {
        indexData = await fetchJsonViaWorker([".", "questions", "index.json"].join("/"));
        try { window.__fkIndexData = indexData; } catch (e) {}
        questionsVersion = (indexData && indexData.version) ? String(indexData.version) : "";
        // P2-1：通知 SW 清理旧版本题库分片缓存
        try {
          const notifyPrune = (worker) => { try { worker && worker.postMessage({ type: "PRUNE_QUESTION_CACHE", version: questionsVersion }); } catch (e) {} };
          if (navigator.serviceWorker) {
            if (navigator.serviceWorker.controller) notifyPrune(navigator.serviceWorker.controller);
            else navigator.serviceWorker.ready.then((reg) => notifyPrune(reg.active)).catch(() => {});
          }
        } catch (e) {}
      } catch (e) {}

      const subjMap = indexData && indexData.subjects && typeof indexData.subjects === "object" ? indexData.subjects : null;
      if (!subjMap) {
        try { return await legacyFullLoad(indexData); } catch (e) {}
        return;
      }

      const subjectNames = Object.keys(subjMap);
      const total = Number(indexData.total) || 0;
      const subtitle = document.getElementById("dataSourceSubtitle");
      const setSubtitle = (txt) => { if (subtitle) subtitle.textContent = txt; };

      const filesOf = (name) => {
        const meta = subjMap[name] || {};
        if (Array.isArray(meta.parts) && meta.parts.length) return meta.parts;
        if (meta.file) return [meta.file];
        return [];
      };

      // 网络预算：省流量/慢网/移动蜂窝下不后台拉全部题库，只加载当前科目
      // P1-13：iOS Safari / Firefox 没有 navigator.connection，此前会被误判成"不限流量"从而后台全量拉 23MB。
      // 现改为三态偏好（自动 / 强制开 / 强制关）；自动模式下若读不到网络 API，保守按省流量处理。
      const FRUGAL_KEY = "fk_frugal_mode";
      const readFrugalPref = () => { try { return localStorage.getItem(FRUGAL_KEY) || "auto"; } catch (e) { return "auto"; } };
      const connApi = navigator.connection || navigator.mozConnection || navigator.webkitConnection || null;
      const conn = connApi || {};
      const isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent || "");
      const rtt = Number(conn.rtt) || 0;
      const frugalPref = readFrugalPref();
      let frugal;
      if (frugalPref === "on") frugal = true;
      else if (frugalPref === "off") frugal = false;
      else if (!connApi) frugal = true;                                  // 读不到网络 API（iOS / Firefox）→ 保守省流量
      else if (conn.saveData) frugal = true;
      else if (/^(slow-2g|2g)$/.test(conn.effectiveType || "")) frugal = true;
      else if (conn.effectiveType === "3g" && rtt >= 600) frugal = true;
      else if (isMobile && conn.type === "cellular") frugal = true;
      else frugal = false;
      window.__fkFrugal = { pref: frugalPref, frugal: frugal, hasConnApi: !!connApi, effectiveType: conn.effectiveType || null };

      // P1-14：规范化结果按「原始对象」缓存，避免每次合并都把全部题目重新规范化
      // 只有带稳定 id 的题目才缓存（无 id 时 normalizeQuestion 依赖下标生成 id）
      const __normCache = new WeakMap();
      const __normStats = { computed: 0, reused: 0, items: 0 };
      // P2-6：把「题干+解析+选项+科目」的小写全文预计算一次，搜索时不再逐题拼接
      const __decorate = (n) => {
        try {
          n._search = (String(n.title || "") + " " + String(n.explanation || "") + " " +
            (n.options || []).map((o) => o.text || "").join(" ") + " " + String(n.subject || "")).toLowerCase();
        } catch (e) {}
        return n;
      };
      const __normOne = (q, idx) => {
        const cacheable = q && q.id !== undefined && q.id !== null && String(q.id) !== "";
        if (cacheable) {
          const hit = __normCache.get(q);
          if (hit) { __normStats.reused++; return hit; }
          const made = __decorate(normalizeQuestion(q, idx));
          __normCache.set(q, made);
          __normStats.computed++;
          return made;
        }
        __normStats.computed++;
        return __decorate(normalizeQuestion(q, idx));
      };
      const normalizeAll = (raw) => {
        const skipped = raw.filter((q) => q.incomplete).length;
        const playable = raw.filter((q) => !q.incomplete);
        const out = new Array(playable.length);
        for (let i = 0; i < playable.length; i++) out[i] = __normOne(playable[i], i);
        __normStats.items = out.length;
        window.__fkNormStats = { computed: __normStats.computed, reused: __normStats.reused, items: out.length };
        return { list: out, skipped };
      };

      // 已加载 / 已入队 的科目记录，供按需加载复用
      const loadedSubjects = new Set();
      const inflightSubjects = new Map();
      const loaded = [];

      // 合并去重：后台补齐与按需加载可能并发拉同一科，重复入队会导致题目重复
      const seenQuestionKeys = new Set();
      const questionKey = (q) => {
        if (!q || typeof q !== "object") return null;
        if (q.id !== undefined && q.id !== null && String(q.id) !== "") return "id:" + String(q.id);
        const t = q.title || q.question || q.content || q.q || "";
        return "txt:" + String(q.subject || "") + "|" + String(t).slice(0, 120);
      };
      const merge = (raw) => {
        if (!raw || !raw.length) return;
        for (const q of raw) {
          const key = questionKey(q);
          if (key === null) continue;
          if (seenQuestionKeys.has(key)) continue;
          seenQuestionKeys.add(key);
          loaded.push(q);
        }
      };

      const fetchSubject = async (name) => {
    const parts = filesOf(name);
    let failed = 0;
    for (const f of parts) {
      let ok = false;
      // P4-5：单块失败指数退避重试 2 次（共 3 次尝试），避免弱网下静默丢题
      for (let attempt = 0; attempt < 3 && !ok; attempt++) {
        try {
          const json = await fetchJsonViaWorker([".", "questions", f].join("/"));
          if (json) {
            const extracted = await extractQuestionsFromData(json, name);
            merge(Array.isArray(extracted) ? extracted : []);
            ok = true;
          }
        } catch (e) {}
        if (!ok && attempt < 2) await new Promise((r) => setTimeout(r, 400 * Math.pow(2, attempt)));
      }
      if (!ok) failed++;
    }
    return { failed, total: parts.length };
  };

      // 供科目筛选切换时调用：按需加载某一科
      window.__ensureSubject = async function (name) {
        if (!name || !subjectNames.includes(name)) return;
        if (loadedSubjects.has(name)) { applyFilters(false); return; }
        if (inflightSubjects.has(name)) { await inflightSubjects.get(name); return; }
        const p = (async () => {
          loadingSubjectName = name;
    let __subjRes = null;
    try { __subjRes = await fetchSubject(name); } finally { loadingSubjectName = null; }
    loadedSubjects.add(name);
          const norm = normalizeAll(loaded);
          allQuestions = norm.list;
          if (typeof currentIndex === "number" && currentIndex >= allQuestions.length) currentIndex = 0;
          applyFilters(false);
          restoreLastPosOnce();   // P2-15：优先科目失败时，由首个按需加载的科目完成恢复判定
          setSubtitle(`已加载 ${loadedSubjects.size}/${subjectNames.length} 科 · 共 ${norm.list.length} 题`);
    if (__subjRes && __subjRes.failed > 0) showToast(`「${name}」有 ${__subjRes.failed}/${__subjRes.total} 个分块加载失败，可刷新页面重试`, "warn");   // P4-5
        })();
        inflightSubjects.set(name, p);
        await p;
        inflightSubjects.delete(name);
      };
      // P2-20：只读查询「尚未加载的科目」，供错题本提示使用（subjectNames / loadedSubjects 是本函数局部变量）
      window.__fkMissingSubjects = () => subjectNames.filter((n) => !loadedSubjects.has(n));

      let priority = subjectNames[0];
      try {
        if (typeof currentSubject === "string" && subjectNames.includes(currentSubject)) priority = currentSubject;
        else {
          // P2-15：「全部 / 智能复习 / 收藏」等非单科视图，优先加载上次所在题目的科目，保证题号可恢复
          const pendSubj = lastPosPending && lastPosPending.qsubj;
          const saved = localStorage.getItem("fk_last_subject");
          if (pendSubj && subjectNames.includes(pendSubj)) priority = pendSubj;
          else if (saved && subjectNames.includes(saved)) priority = saved;
        }
      } catch (e) {}
      if (!subjectNames.includes(priority)) {
        let smallest = null;
        for (const n of subjectNames) {
          const mb = Number((subjMap[n] || {}).size_mb) || 99;
          if (!smallest || mb < smallest.mb) smallest = { n, mb };
        }
        if (smallest) priority = smallest.n;
      }

      setSubtitle("题库加载中…");

      // 1) 优先科目：逐块加载，第一块到达即可作答
      const prioParts = filesOf(priority);
      for (let k = 0; k < prioParts.length; k++) {
        try {
          const json = await fetchJsonViaWorker([".", "questions", prioParts[k]].join("/"));
          if (json) {
            const extracted = await extractQuestionsFromData(json, priority);
            merge(Array.isArray(extracted) ? extracted : []);
          }
        } catch (e) {}
        if (k === 0 && loaded.length) {
          const norm = normalizeAll(loaded);
          allQuestions = norm.list;
          applyFilters(false);
          setSubtitle(`已加载 ${priority}（${norm.list.length} 题）· 其余${frugal ? "科目切换时加载" : "题库后台加载中"}…`);
        }
      }
      loadedSubjects.add(priority);
      {
        const norm = normalizeAll(loaded);
        allQuestions = norm.list;
        applyFilters(false);
      }
      restoreLastPosOnce();   // P2-15：优先科目完整到位后一次性恢复题号

      // 2) 省流量模式到此为止；其余科目等用户切换时按需加载
      if (frugal) {
        setSubtitle(`已加载 ${priority}（${allQuestions.length} 题）· 省流量模式：其余科目切换时加载`);
        return;
      }

      // 3) 正常模式：后台串行补齐其余科目
      let rerenderTimer = null;
      const scheduleRerender = () => {
        if (rerenderTimer) return;
        rerenderTimer = setTimeout(() => {
          rerenderTimer = null;
          try {
            const cur = filteredQuestions[currentIndex];
            const anchorId = cur ? cur.id : null;
            const norm = normalizeAll(loaded);
            allQuestions = norm.list;
            // 保持用户当前这道题不变，且不重绘题干（后台补齐不应打断作答）；
            // 若首屏尚未渲染出任何题（anchorId 为空），则正常渲染
            applyFilters(false, anchorId, !!anchorId);
            // P2-20：错题本正显示「未加载科目」提示时才重建错题列表，避免提示与计数过期
            if (document.getElementById("wrongMissingHint")) renderWrongList();
          } catch (e) {}
        }, 400);
      };

      for (const name of subjectNames) {
        if (name === priority) continue;
        await fetchSubject(name);
        loadedSubjects.add(name);
        scheduleRerender();
      }

      const finalNorm = normalizeAll(loaded);
      allQuestions = finalNorm.list;
      // P1-14：全部科目加载完毕后释放原始 JSON 数组（归一化结果已足够），降低常驻内存。
      // 先取消可能仍挂起的后台重绘定时器，避免它读到已清空的 loaded。
      if (loadedSubjects.size >= subjectNames.length) {
        if (rerenderTimer) { clearTimeout(rerenderTimer); rerenderTimer = null; }
        try { loaded.length = 0; } catch (e) {}
      }
      {
        // 收尾同样保持当前题与作答状态，用户手动切题时才重绘
        const cur = filteredQuestions[currentIndex];
        applyFilters(false, cur ? cur.id : null, !!(cur && cur.id));
        if (document.getElementById("wrongMissingHint")) renderWrongList();   // P2-20：同上
      }
      if (finalNorm.list.length) {
        setSubtitle(`已加载仓库完整题库：共 ${finalNorm.list.length} 题${finalNorm.skipped ? `（已排除 ${finalNorm.skipped} 道缺共享案情的题）` : ""}`);
      } else if (total) {
        setSubtitle(`题库加载失败（预期 ${total} 题），请检查网络后刷新`);
      }
    }

    async function legacyFullLoad(indexData) {
      const expectedTotal = Number(indexData && indexData.total) || 0;
      const rawList = await extractQuestionsFromData(indexData);
      if (!rawList.length) return;
      const skipped = rawList.filter((q) => q.incomplete).length;
      const playable = rawList.filter((q) => !q.incomplete);
      allQuestions = playable.map((q, idx) => normalizeQuestion(q, idx));
      const subtitle = document.getElementById("dataSourceSubtitle");
      const suffix = skipped ? `（已排除 ${skipped} 道缺共享案情的题）` : "";
      if (subtitle) {
        subtitle.textContent = expectedTotal && rawList.length < expectedTotal * 0.9
          ? `已加载 ${rawList.length} / ${expectedTotal} 题：部分科目尚未缓存，请联网打开一次以补全离线题库${suffix}`
          : `已加载仓库完整题库：共 ${allQuestions.length} 题${suffix}`;
      }
      applyFilters(false);
      restoreLastPosOnce();   // P2-15
    }

    function normalizeQuestion(raw, idx) {
      const id = String(raw.id || raw.qid || raw.no || raw.number || `Q_${idx + 1}`);
      let opts = [];
      const rawOpts = raw.options ?? raw.opts ?? raw.choices ?? raw.items;
      if (Array.isArray(rawOpts)) {
        opts = rawOpts.map((o, i) => {
          const fallbackLetter = ["A", "B", "C", "D", "E", "F"][i] || String(i + 1);
          if (typeof o === "string") {
            const m = o.trim().match(/^([A-F])[.、．:：\s]+(.*)$/i);
            return m ? { id: m[1].toUpperCase(), text: m[2] } : { id: fallbackLetter, text: o };
          }
          return {
            id: String(o.id || o.key || o.label || o.value || fallbackLetter).toUpperCase(),
            text: String(o.text || o.content || o.label || o.name || "")
          };
        });
      } else if (rawOpts && typeof rawOpts === "object") {
        opts = Object.entries(rawOpts).map(([k, v]) => ({
          id: String(k).trim().toUpperCase(),
          text: String(v || "")
        }));
      } else {
        ["A", "B", "C", "D", "E", "F"].forEach((letter) => {
          const val = raw[letter] || raw[`option${letter}`] || raw[`opt${letter}`] || raw[letter.toLowerCase()];
          if (val) opts.push({ id: letter, text: String(val) });
        });
      }

      let rawAns = raw.answer ?? raw.correctAnswer ?? raw.ans ?? raw.correct ?? raw.right ?? raw.key ?? ["A"];
      let ans = [];
      if (Array.isArray(rawAns)) {
        ans = rawAns.map((a) => String(a).trim().toUpperCase());
      } else if (typeof rawAns === "string") {
        const cleanedAns = rawAns.trim().toUpperCase().replace(/[^A-F]/g, "");
        if (cleanedAns.length >= 1 && cleanedAns.length <= 6 && opts.length > 0) {
          ans = cleanedAns.split("");
        } else {
          ans = [rawAns.trim()];
        }
      } else {
        ans = [String(rawAns)];
      }

      let rawType = String(raw.type || raw.qtype || raw.question_type || raw.kind || "");
      let normalizedType = "单选";
      if (opts.length === 0 || rawType.includes("主观") || rawType.includes("案例") || rawType.includes("论述")) {
        normalizedType = "主观题";
      } else if (rawType.includes("不定项")) {
        normalizedType = "不定项";
      } else if (rawType.includes("多") || ans.length > 1) {
        normalizedType = "多选";
      } else {
        normalizedType = "单选";
      }

      let rawDiff = String(raw.difficulty || raw.diff || raw.level || "中");
      let normalizedDiff = "中";
      if (rawDiff.includes("易") || rawDiff.includes("简") || rawDiff.includes("基础") || rawDiff === "1" || rawDiff.toLowerCase() === "easy") normalizedDiff = "易";
      else if (rawDiff.includes("难") || rawDiff.includes("困") || rawDiff === "3" || rawDiff.toLowerCase() === "hard") normalizedDiff = "难";

      return {
        id,
        subject: raw.subject || raw.category || raw.cat || raw.course || "民法",
        type: normalizedType,
        difficulty: normalizedDiff,
        year: raw.year || raw.source || raw.tag || "历年真题",
        title: raw.title || raw.question || raw.stem || raw.content || raw.q || raw.body || "",
        options: opts,
        answer: ans,
        explanation: raw.explanation || raw.analysis || raw.exp || raw.parse || raw.detail || raw.solution || "暂无详细解析",
        lawBasis: Array.isArray(raw.lawBasis) ? raw.lawBasis : (raw.law ? [String(raw.law)] : []),
      // 三段式结构化解析（构建期批量生成；生成脚本未随仓库提供）
      analysisAI: (raw.analysis_ai && raw.analysis_ai.point)
        ? { point: raw.analysis_ai.point, trap: raw.analysis_ai.trap || "", law: raw.analysis_ai.law || "" }
        : null
      };
    }

    // =========================================================================
    // 6. 科目栏与筛选逻辑
    // =========================================================================
    function renderSubjectBar() {
      const bar = document.getElementById("subjectFilterBar");
      bar.innerHTML = "";
      SUBJECT_LIST.forEach((item) => {
        const btn = document.createElement("button");
        btn.type = "button";
        const isActive = currentSubject === item.key;
        btn.className = isActive
          ? "px-3 py-1.5 rounded-lg text-xs font-bold bg-[#1a3a6b] text-white shrink-0 shadow-xs transition inline-flex items-center gap-1"
          : "px-3 py-1.5 rounded-lg text-xs font-medium theme-subtle border hover:border-blue-400 shrink-0 transition inline-flex items-center gap-1";
        btn.innerHTML = (SUBJECT_ICONS[item.key] || "") + `<span>${item.label}</span>`;
        btn.addEventListener("click", () => {
          wrongPracticeIds = null;   // 从科目栏进入「错题重做」视为全部错题
          currentSubject = item.key; try { if (window.__ensureSubject && item.key && item.key !== "全部") window.__ensureSubject(item.key); } catch (e) {}
          persistLastSubject(item.key);   // P2-15：切换科目即写入
          lastPosPending = null;          // 用户主动切换：作废待恢复题号
          renderSubjectBar();
          applyFilters(true);
        });
        bar.appendChild(btn);
      });
    }

    // P2-13：主观题记录（新数据 subjective:true；旧数据 userAnswer=["主观已作答"]）不参与对错判定
    function isSubjectiveRecord(rec) {
      return !!rec && (rec.subjective === true
        || (Array.isArray(rec.userAnswer) && rec.userAnswer.length === 1 && rec.userAnswer[0] === "主观已作答"));
    }

    // P2-15：学习位置记忆（fk_last_subject / fk_last_pos）
    function persistLastSubject(key) {
      try { localStorage.setItem(LAST_SUBJECT_KEY, String(key)); } catch (e) {}
    }
    function persistLastPos() {
      // 真实题库就绪并完成一次恢复判定前禁止写，防止内置兜底题渲染冲掉保存值
      if (!lastPosWritable || allQuestions.length <= 20) return;
      const q = filteredQuestions[currentIndex];
      if (!q) return;
      try {
        localStorage.setItem(LAST_POS_KEY, JSON.stringify({ subject: currentSubject, index: currentIndex, qid: q.id, qsubj: q.subject || "" }));
        localStorage.setItem(LAST_SUBJECT_KEY, currentSubject);
      } catch (e) {}
    }
    function readLastPos() {
      try {
        const p = JSON.parse(localStorage.getItem(LAST_POS_KEY) || "null");
        if (p && typeof p.subject === "string" && Number.isInteger(p.index) && p.index >= 0) return p;
      } catch (e) {}
      return null;
    }
    // P2-5：去掉地址栏里的 go 参数，避免刷新反复触发
    function stripGoParam() {
      try {
        const u = new URL(location.href);
        if (!u.searchParams.has("go")) return;
        u.searchParams.delete("go");
        history.replaceState(history.state, "", u.pathname + u.search + u.hash);
      } catch (e) {}
    }
    // P2-5：执行快捷方式跳转。force=false 时要求真实题库（>20 题）已就绪，
    // 否则错题/复习列表会按内置兜底题算成空；force=true 用于题库加载结束后的兜底。
    function applyPendingGo(force) {
      if (!pendingGo) return;
      if (!force && allQuestions.length <= 20) return;
      const target = pendingGo;
      pendingGo = null;
      stripGoParam();
      if (currentSubject !== pendingGoBase) return;   // 用户已自行切换视图：尊重用户操作
      lastPosPending = null;                          // 快捷方式意图优先，不再恢复上次题号
      wrongPracticeIds = null;
      currentSubject = target;
      persistLastSubject(target);
      renderSubjectBar();
      applyFilters(true);
      const n = filteredQuestions.length;
      if (target === "错题重做") showToast(n ? `已打开错题重做（${n} 题）` : "错题本还是空的，先去刷几题吧", "info");
      else showToast(n ? `已打开智能复习（${n} 题到期）` : "暂无到期的复习题", "info");
      const card = document.getElementById("questionCard");
      const header = document.querySelector("header");
      if (card) {
        const y = card.getBoundingClientRect().top + window.scrollY - ((header ? header.offsetHeight : 0) + 12);
        window.scrollTo({ top: Math.max(0, y), behavior: "auto" });
      }
    }
    // 真实题库（allQuestions.length > 20）就绪后调用：一次性恢复题号，随即作废
    function restoreLastPosOnce() {
      applyPendingGo(false);                    // P2-5：快捷方式跳转优先于恢复上次位置（会作废 lastPosPending）
      if (lastPosWritable) return;              // 已判定过，之后的搜索/筛选不再被拉回旧题号
      if (allQuestions.length <= 20) return;    // 仍是内置兜底题，继续等
      const pos = lastPosPending;
      lastPosPending = null;
      lastPosWritable = true;
      const untouched = currentIndex === 0 && !searchQuery.trim()
        && currentTypeFilter === "ALL" && currentDiffFilter === "ALL";
      if (pos && untouched && pos.subject === currentSubject && filteredQuestions.length) {
        let idx = (pos.qid !== undefined && pos.qid !== null)
          ? filteredQuestions.findIndex((q) => String(q.id) === String(pos.qid))
          : -1;
        if (idx < 0 && pos.index < filteredQuestions.length) idx = pos.index;
        if (idx > 0) {
          currentIndex = idx;
          renderQuestion(currentIndex);   // 内部 persistLastPos 会写回最新位置
          showToast(`已回到上次位置：第 ${idx + 1} 题`, "info");
          return;
        }
      }
      persistLastPos();
    }

    function isDueForReview(qid) {
      const rec = userProgress[qid];
      if (!rec || !rec.answered) return false;
      if (!isSubjectiveRecord(rec) && !rec.isCorrect) return true;
      const now = Date.now();
      return rec.nextReviewAt ? now >= rec.nextReviewAt : false;
    }

    function applyFilters(resetIndex = true, preserveId = null, skipRender = false) {
      const qLower = searchQuery.trim().toLowerCase();
      const __wrongSet = currentSubject === "错题重做" ? new Set(wrongQuestions) : null;   // P4-9：转 Set 避免每题 O(M) includes
    filteredQuestions = allQuestions.filter((q) => {
        // 1. 科目或专项模式筛选
        if (currentSubject === "错题重做") {
          if (!__wrongSet.has(q.id)) return false;   // P4-9
          // 「按当前筛选重做」时只保留筛选出的那一批
          if (wrongPracticeIds && !wrongPracticeIds.includes(q.id)) return false;
        } else if (currentSubject === "我的收藏") {
          if (!favorites[q.id]) return false;
        } else if (currentSubject === "有笔记") {
          if (!userNotes[q.id] || !userNotes[q.id].trim()) return false;
        } else if (currentSubject === "智能复习") {
          if (!isDueForReview(q.id)) return false;
        } else if (currentSubject === "主观题") {
          if (q.type !== "主观题") return false;
        } else if (currentSubject !== "全部") {
          if ((currentSubject === '三国法' ? '国际法' : currentSubject) !== q.subject) return false;
        }

        // 2. 题型筛选
        if (currentTypeFilter !== "ALL" && q.type !== currentTypeFilter) {
          return false;
        }

        // 3. 难度筛选
        if (currentDiffFilter !== "ALL" && q.difficulty !== currentDiffFilter) {
          return false;
        }

        // 4. 关键词搜索（预计算的 _search 全文 + 实时笔记）
        if (qLower) {
      // P4-9：分开判断避免每次拼接大字符串（约 10MB/次分配）；基础命中即短路
      const base = q._search !== undefined
        ? q._search
        : `${q.title} ${q.explanation} ${(q.options || []).map((o) => o.text).join(" ")} ${q.subject}`.toLowerCase();
      if (!base.includes(qLower)) {
        const noteStr = userNotes[q.id];
        if (!noteStr || !String(noteStr).toLowerCase().includes(qLower)) return false;
      }
    }

        return true;
      });

      if (preserveId !== null && preserveId !== undefined) {
        const keptIdx = filteredQuestions.findIndex((q) => q.id === preserveId);
        if (keptIdx >= 0) {
          currentIndex = keptIdx;
        } else if (resetIndex || currentIndex >= filteredQuestions.length) {
          currentIndex = 0;
        }
      } else if (resetIndex || currentIndex >= filteredQuestions.length) {
        currentIndex = 0;
      }
      // skipRender=true 用于后台题库补齐：只更新列表与统计，不重绘当前题、也不重建错题列表（避免打断作答与 DOM 抖动）
      if (!skipRender) {
        renderQuestion(currentIndex);
        renderWrongList();
      }
      updateStats();
    }

    // =========================================================================
    // 7. 核心题目渲染与交互
    // =========================================================================
    // 主观题作答草稿：手机上输入长文本耗时长，原实现只在「提交答案」或
    // 「AI 批改」时才把文本写入进度，切题/刷新/误触返回即全部丢失。
    // safeSaveJSON 会序列化整个 userProgress（可能上万条记录），故必须防抖，
    // 并在切题前与失焦时立即落盘。
    let subjectiveDraftTimer = null;
    let subjectiveDraftQid = null;

    function saveSubjectiveDraft(immediate) {
      const el = document.getElementById("subjectiveInput");
      if (!el || !subjectiveDraftQid) return;
      const qid = subjectiveDraftQid;
      const text = el.value;
      const commit = () => {
        const rec = userProgress[qid] || {};
        rec.subjectiveText = text;
        userProgress[qid] = rec;
        safeSaveJSON(STORAGE_KEYS.PROGRESS, userProgress);
        const st = document.getElementById("subjectiveDraftStatus");
        if (st) st.textContent = text.trim() ? "✓ 草稿已自动保存" : "";
      };
      clearTimeout(subjectiveDraftTimer);
      if (immediate) commit();
      else subjectiveDraftTimer = setTimeout(commit, 600);
    }

    function updateSubjectiveCount() {
      const el = document.getElementById("subjectiveInput");
      const cnt = document.getElementById("subjectiveCharCount");
      if (el && cnt) cnt.textContent = el.value.trim().length + " 字";
    }

    // 外部重置/恢复进度前必须调用：否则 renderQuestion 开头的草稿落盘会把
    // textarea 里的旧内容写回新数据（清空不彻底 / 覆盖导入的备份），
    // 且尚未触发的 600ms 防抖回调也会在重置之后写回。
    function resetSubjectiveDraftState() {
      clearTimeout(subjectiveDraftTimer);
      subjectiveDraftTimer = null;
      subjectiveDraftQid = null;
      const el = document.getElementById("subjectiveInput");
      if (el) el.value = "";
      const st = document.getElementById("subjectiveDraftStatus");
      if (st) st.textContent = "";
      const cnt = document.getElementById("subjectiveCharCount");
      if (cnt) cnt.textContent = "0 字";
    }

    function renderQuestion(index) {
      saveSubjectiveDraft(true);   // 切题前立即落盘上一题草稿
      const card = document.getElementById("questionCard");
      const titleEl = document.getElementById("questionTitle");
      const optsContainer = document.getElementById("optionsContainer");
      const subjContainer = document.getElementById("subjectiveContainer");
      const expBox = document.getElementById("explanationBox");
      const aiBox = document.getElementById("aiResponseBox");

      if (aiBox) aiBox.classList.add("hidden");

      if (filteredQuestions.length === 0) {
        document.getElementById("qIndexBadge").textContent = "0 / 0";
        const emptyIco = (paths) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${paths}</svg>`;
        let eIcon = emptyIco('<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>');
        let eTitle = "当前筛选条件下暂无题目", eDesc = "试试切换科目，或点击上方“全部题目”清空筛选条件。";
      if (loadingSubjectName && currentSubject === loadingSubjectName) {
        eTitle = "正在加载「" + loadingSubjectName + "」…";
        eDesc = "首次进入该科目需下载题库分块，请稍候；已下载的部分会先显示。";
      }
        if (currentSubject === "我的收藏") {
          eIcon = emptyIco('<path d="M12 3l2.7 6.3 6.8.6-5.2 4.5 1.6 6.6L12 17.8 6.1 21l1.6-6.6L2.5 9.9l6.8-.6z"/>');
          eTitle = "还没有收藏的题目"; eDesc = "点击题目右上角的星标收藏重点题，考前随时回看。";
        } else if (currentSubject === "错题重做") {
          eIcon = emptyIco('<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/><path d="M9 7h6M9 11h6"/>');
          eTitle = "错题本还是空的"; eDesc = "答错的题目会自动收录到这里，方便集中攻克。";
        } else if (currentSubject === "智能复习") {
          eIcon = emptyIco('<path d="M12 3a4 4 0 0 0-4 4 4 4 0 0 0-2 7 4 4 0 0 0 6 4 4 4 0 0 0 6-4 4 4 0 0 0-2-7 4 4 0 0 0-4-4z"/><path d="M12 7v10"/>');
          eTitle = "暂无待复习题目"; eDesc = "按记忆曲线到期的题会自动出现在这里。";
        }
        titleEl.innerHTML = `<div class="empty-illust"><div class="empty-ico">${eIcon}</div><div class="empty-title">${eTitle}</div><div class="empty-desc">${eDesc}</div></div>`;
        ["qSubjectBadge", "qTypeBadge", "qDiffBadge", "qYearBadge"].forEach((id) => { const el = document.getElementById(id); if (el) el.style.display = "none"; });
        optsContainer.innerHTML = "";
        optsContainer.removeAttribute("role");   // P2-30：空容器不宣告为选项组
        subjContainer.classList.add("hidden");
        expBox.classList.add("hidden");
        document.getElementById("dockSheetProgress").textContent = "0/0";
        document.documentElement.style.setProperty("--q-progress", "0%");
        return;
      }

      const q = filteredQuestions[index];
      currentSelectedOptions.clear();
      ["qSubjectBadge", "qTypeBadge", "qDiffBadge", "qYearBadge"].forEach((id) => { const el = document.getElementById(id); if (el) el.style.display = ""; });

      // 恢复已答状态
      const record = userProgress[q.id];
  const __redoEl = document.getElementById("redoQuestionBtn");
  if (__redoEl) __redoEl.classList.toggle("hidden", !(record && record.answered && q.type !== "主观题"));
      if (record && Array.isArray(record.userAnswer)) {
        record.userAnswer.forEach((optId) => currentSelectedOptions.add(optId));
      }

      // 顶部徽章更新
      document.getElementById("qIndexBadge").textContent = `${index + 1} / ${filteredQuestions.length}`;
      document.getElementById("dockSheetProgress").textContent = `${index + 1}/${filteredQuestions.length}`;
      document.documentElement.style.setProperty("--q-progress", `${((index + 1) / filteredQuestions.length) * 100}%`);
      document.getElementById("qSubjectBadge").textContent = q.subject;
      document.getElementById("qTypeBadge").textContent = q.type.includes("题") ? q.type : `${q.type}题`;
      const diffStarMap = { 易: "★☆☆", 中: "★★☆", 难: "★★★" };
      const diffColorCls = {
        易: "bg-emerald-500/12 text-emerald-600 dark:text-emerald-300 border-emerald-500/30",
        中: "bg-amber-500/12 text-amber-600 dark:text-amber-300 border-amber-500/30",
        难: "bg-rose-500/12 text-rose-600 dark:text-rose-300 border-rose-500/30",
      };
      const qDiffBadge = document.getElementById("qDiffBadge");
      qDiffBadge.className = "px-2 py-0.5 rounded-md text-xs font-semibold border " + (diffColorCls[q.difficulty] || "theme-subtle border");
      qDiffBadge.innerHTML = `<span class="opacity-80 mr-0.5">难度</span><span class="tracking-tight">${diffStarMap[q.difficulty] || escapeHtml(q.difficulty || "")}</span>`;
      document.getElementById("qYearBadge").textContent = q.year || "历年真题";

      // 掌握状态显示
      const masteryEl = document.getElementById("qMasteryStatus");
      if (record && record.answered && isSubjectiveRecord(record)) {
        masteryEl.innerHTML = `<span class="mastery-chip mastery-idle"><span class="mastery-dot"></span>主观题已作答 · ${record.attempts || 1} 次 · 请对照采分点自评</span>`;
      } else if (record && record.answered) {
        masteryEl.innerHTML = record.isCorrect
          ? `<span class="mastery-chip mastery-ok"><span class="mastery-dot"></span>已掌握 · 作答 ${record.attempts || 1} 次</span>`
          : `<span class="mastery-chip mastery-bad"><span class="mastery-dot"></span>曾答错 · 建议复盘法条</span>`;
      } else {
        masteryEl.innerHTML = `<span class="mastery-chip mastery-idle"><span class="mastery-dot"></span>尚未作答</span>`;
      }

      // 收藏按钮状态
      const isFav = !!favorites[q.id];
      const starOn = '<svg class="nav-ico" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round" style="color:#f59e0b"><path d="M12 3l2.7 6.3 6.8.6-5.2 4.5 1.6 6.6L12 17.8 6.1 21l1.6-6.6L2.5 9.9l6.8-.6z"/></svg>';
      const starOff = '<svg class="nav-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M12 3l2.7 6.3 6.8.6-5.2 4.5 1.6 6.6L12 17.8 6.1 21l1.6-6.6L2.5 9.9l6.8-.6z"/></svg>';
      document.getElementById("favStarIcon").innerHTML = isFav ? starOn : starOff;
      document.getElementById("favBtnText").textContent = isFav ? "已收藏" : "收藏";
      document.getElementById("dockFavIcon").innerHTML = isFav ? starOn : starOff;

      // 错题移出按钮与错因标签状态
      const isWrong = wrongQuestions.includes(q.id);
      const removeWrongBtn = document.getElementById("removeWrongBtn");
      const wrongReasonSelect = document.getElementById("wrongReasonSelect");
      if (isWrong) {
        removeWrongBtn.classList.remove("hidden");
        wrongReasonSelect.classList.remove("hidden");
        wrongReasonSelect.value = wrongReasons[q.id] || "";
      } else {
        removeWrongBtn.classList.add("hidden");
        wrongReasonSelect.classList.add("hidden");
      }

      // 题干渲染（带题眼高亮；案情题额外做卡片分区与折叠）
      renderQuestionTitle(titleEl, q.title);

      // 随手笔记回填
      const noteInput = document.getElementById("questionNoteInput");
      noteInput.value = userNotes[q.id] || "";
      document.getElementById("noteSavedStatus").textContent = userNotes[q.id] ? "✓ 已保存笔记" : "";

      // 判断客观题 vs 主观题
      const showAnswerDirectly = studyMode === "recite" || (record && record.answered);

      if (q.type === "主观题" || !q.options || q.options.length === 0) {
        optsContainer.innerHTML = "";
        optsContainer.removeAttribute("role");   // P2-30：主观题无选项，不宣告为选项组
        subjContainer.classList.remove("hidden");
        const subjInput = document.getElementById("subjectiveInput");
        subjInput.value = (record && record.subjectiveText) || "";
        subjectiveDraftQid = q.id;
        subjInput.oninput = () => { updateSubjectiveCount(); saveSubjectiveDraft(false); };
        subjInput.onblur = () => saveSubjectiveDraft(true);
        updateSubjectiveCount();
        const st = document.getElementById("subjectiveDraftStatus");
        if (st) st.textContent = subjInput.value.trim() ? "✓ 草稿已自动保存" : "";
        const gBtn = document.getElementById("gradeSubjectiveBtn");
        if (gBtn) gBtn.classList.remove("hidden");
        const gBox = document.getElementById("gradeResultBox");
        if (gBox) {
          // 复用上次批改结果，切题回来不必重新调用 AI 接口
          const cached = record && record.gradeResult;
          if (cached) { renderGradeResult(cached); gBox.classList.remove("hidden"); }
          else gBox.classList.add("hidden");
        }
      } else {
        subjectiveDraftQid = null;
        subjContainer.classList.add("hidden");
        const gBtn2 = document.getElementById("gradeSubjectiveBtn");
        if (gBtn2) gBtn2.classList.add("hidden");
        const gBox2 = document.getElementById("gradeResultBox");
        if (gBox2) gBox2.classList.add("hidden");
        renderOptionsList(q, showAnswerDirectly);
      }

      // 解析框渲染
      if (showAnswerDirectly) {
        populateExplanation(q, record);
        expBox.classList.remove("hidden");
      } else {
        expBox.classList.add("hidden");
      }
      persistLastPos();   // P2-15：受 lastPosWritable 闸门控制，兜底题渲染不会写
    }

    function renderOptionsList(q, showJudgement) {
      const optsContainer = document.getElementById("optionsContainer");
      optsContainer.innerHTML = "";
      const correctSet = new Set(q.answer);
      // P2-30：与 handleOptionClick 的行为一致——只有「单选」是单选，其余（多选/不定项）可多选
      const isSingleChoice = q.type === "单选";
      optsContainer.setAttribute("role", isSingleChoice ? "radiogroup" : "group");

      q.options.forEach((opt) => {
        const row = document.createElement("button");
        row.type = "button";
        const isSelected = currentSelectedOptions.has(opt.id);
        const isRightOpt = correctSet.has(opt.id);

        let stateClass = "";
        let badgeHtml = `<span class="w-6 h-6 rounded-full border border-current flex items-center justify-center text-xs font-bold shrink-0">${escapeHtml(String(opt.id))}</span>`;

        if (showJudgement) {
          if (isRightOpt && isSelected) {
            stateClass = "is-correct";
            badgeHtml = `<span class="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold shrink-0">✓</span>`;
          } else if (isRightOpt && !isSelected) {
            stateClass = studyMode === "recite" ? "is-correct" : "is-missed";
            badgeHtml = `<span class="w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center text-xs font-bold shrink-0">${escapeHtml(String(opt.id))}</span>`;
          } else if (!isRightOpt && isSelected) {
            stateClass = "is-wrong";
            badgeHtml = `<span class="w-6 h-6 rounded-full bg-rose-600 text-white flex items-center justify-center text-xs font-bold shrink-0">✕</span>`;
          }
        } else if (isSelected) {
          stateClass = "is-selected";
          badgeHtml = `<span class="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold shrink-0">${escapeHtml(String(opt.id))}</span>`;
        }

        row.className = `option-row w-full text-left p-3 sm:p-3.5 rounded-xl flex items-start gap-3 ${stateClass}`;
        // P2-30：选项语义；每次点击都会整列重渲染，aria-checked 随之更新
        row.setAttribute("role", isSingleChoice ? "radio" : "checkbox");
        row.setAttribute("aria-checked", String(isSelected));
        row.innerHTML = `
          ${badgeHtml}
          <span class="text-sm sm:text-base leading-relaxed flex-1">${formatLegalHighlight(opt.text)}</span>
        `;

        row.addEventListener("click", () => {
          handleOptionClick(q, opt.id);
        });

        optsContainer.appendChild(row);
      });
    }

    function handleOptionClick(q, optId) {
      if (studyMode === "recite") {
        showToast("当前为背题模式，点击顶部“刷题模式”可重新作答", "info");
        return;
      }
  if (userProgress[q.id] && userProgress[q.id].answered) {
    showToast("本题已作答，点上方「重做」可重新作答", "info");
    return;
  }

      if (q.type === "单选") {
        currentSelectedOptions.clear();
        currentSelectedOptions.add(optId);
        if (isInstantSingleCheck) {
          submitAnswer();
          return;
        }
      } else {
        if (currentSelectedOptions.has(optId)) {
          currentSelectedOptions.delete(optId);
        } else {
          currentSelectedOptions.add(optId);
        }
      }
      renderOptionsList(q, false);
    }

    function submitAnswer() {
      if (filteredQuestions.length === 0) return;
      const q = filteredQuestions[currentIndex];

      if (q.type === "主观题" || !q.options || q.options.length === 0) {
        const subjInputEl = document.getElementById("subjectiveInput");
        const subjText = subjInputEl.value.trim();
        // P2-13：空白作答直接拦截，不写进度、不计已答
        if (!subjText) {
          showToast("请先写下作答要点再提交（可对照采分点自评）", "warn");
          try { subjInputEl.focus(); } catch (e) {}
          return;
        }
        const prev = userProgress[q.id] || { attempts: 0 };
        userProgress[q.id] = {
          ...prev,   // 保留已缓存的 gradeResult 等，避免「先批改再提交」丢失结果
          answered: true,
          subjective: true,   // P2-13：主观题无客观对错，不再记 isCorrect:true
          isCorrect: null,
          userAnswer: ["主观已作答"],
          subjectiveText: subjText,
          attempts: (prev.attempts || 0) + 1,
          lastAnsweredAt: Date.now(),
          nextReviewAt: Date.now() + 24 * 3600 * 1000
        };
        safeSaveJSON(STORAGE_KEYS.PROGRESS, userProgress);
        populateExplanation(q, userProgress[q.id]);
        document.getElementById("explanationBox").classList.remove("hidden");
        updateStats();
        showToast("已展开主观题采分点解析，请对照自评", "success");
        return;
      }

      if (currentSelectedOptions.size === 0) {
        showToast("请先至少选择一个选项后再提交", "warn");
        return;
      }

      const userArr = Array.from(currentSelectedOptions).sort();
      const correctArr = [...q.answer].sort();
      const isCorrect = userArr.join("") === correctArr.join("");

      const prev = userProgress[q.id] || { attempts: 0 };
      const attempts = (prev.attempts || 0) + 1;   // 累计作答次数：只用于统计展示，不参与间隔计算

      // 复习间隔（P2-14）：由「连续答对次数」streak 驱动
      // 答对：streak+1，间隔 = REVIEW_INTERVAL_DAYS[min(streak,5)-1] → 1/3/7/14/30 天
      // 答错：streak 归 0，间隔 0（立即到期，进入智能复习）
      // 旧记录没有 streak：上次客观题答对按 1 起算，否则按 0
      const prevStreak = Number.isInteger(prev.streak) && prev.streak >= 0
        ? prev.streak
        : (prev.isCorrect === true && !isSubjectiveRecord(prev) ? 1 : 0);
      const streak = isCorrect ? prevStreak + 1 : 0;
      const reviewDays = isCorrect ? REVIEW_INTERVAL_DAYS[Math.min(streak, REVIEW_INTERVAL_DAYS.length) - 1] : 0;

      userProgress[q.id] = {
        answered: true,
        isCorrect,
        userAnswer: userArr,
        attempts,
        streak,
        lastAnsweredAt: Date.now(),
        nextReviewAt: Date.now() + reviewDays * 24 * 3600 * 1000
      };
      safeSaveJSON(STORAGE_KEYS.PROGRESS, userProgress);

      // 维护错题本
      if (!isCorrect) {
        if (!wrongQuestions.includes(q.id)) {
          wrongQuestions.unshift(q.id);
          safeSaveJSON(STORAGE_KEYS.WRONG, wrongQuestions);
        }
      } else if (autoRemoveWrong && wrongQuestions.includes(q.id)) {
        wrongQuestions = wrongQuestions.filter((id) => id !== q.id);
        safeSaveJSON(STORAGE_KEYS.WRONG, wrongQuestions);
        showToast("恭喜答对！已自动从错题本移出", "success");
      }

      renderOptionsList(q, true);
      populateExplanation(q, userProgress[q.id]);
      document.getElementById("explanationBox").classList.remove("hidden");
      updateStats();
      renderWrongList();
    const __rb = document.getElementById("redoQuestionBtn"); if (__rb) __rb.classList.toggle("hidden", !(userProgress[q.id] && userProgress[q.id].answered && q.type !== "主观题"));
    }

    // 渲染三段式 AI 解析：考点 / 易错陷阱 / 法条定位
    function renderAnalysisAI(ai) {
      const box = document.getElementById("analysisAIBox");
      if (!box) return;
      box.innerHTML = "";
      if (!ai || (!ai.point && !ai.trap && !ai.law)) { box.classList.add("hidden"); return; }
      [["point", "考点", ai.point], ["trap", "易错陷阱", ai.trap], ["law", "法条定位", ai.law]]
        .forEach(([key, label, text]) => {
          if (!text) return;
          const row = document.createElement("div");
          row.className = "ai3 ai3-" + key;
          const l = document.createElement("div");
          l.className = "ai3-label";
          l.textContent = label;
          const b = document.createElement("div");
          b.className = "ai3-body";
          b.textContent = text;
          row.appendChild(l); row.appendChild(b);
          box.appendChild(row);
        });
      const note = document.createElement("div");
      note.className = "ai3-note";
      note.textContent = "AI 生成解析，请以法条原文为准";
      box.appendChild(note);
      box.classList.remove("hidden");
    }

    function populateExplanation(q, record) {
      document.getElementById("correctAnsSpan").textContent = q.answer.join("");
      const userAnsStr = record && Array.isArray(record.userAnswer) && record.userAnswer.length > 0
        ? record.userAnswer.join("")
        : (studyMode === "recite" ? "背题直看" : "未作答");
      const userSpan = document.getElementById("userAnsSpan");
      userSpan.textContent = userAnsStr;

      const verdictBadge = document.getElementById("resultVerdictBadge");
      if (studyMode === "recite" && (!record || !record.answered)) {
        verdictBadge.className = "px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-500/15 text-blue-600 dark:text-blue-300";
        verdictBadge.textContent = "背题模式 · 直接展示解析";
      } else if (record && record.answered && isSubjectiveRecord(record)) {
        verdictBadge.className = "px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400";
        verdictBadge.textContent = "主观题已提交 · 请对照采分点自评";
      } else if (record && record.isCorrect) {
        verdictBadge.className = "px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400";
        verdictBadge.textContent = "回答正确";
      } else {
        verdictBadge.className = "px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500/15 text-rose-600 dark:text-rose-400";
        verdictBadge.textContent = "回答错误（已加入错题本）";
      }

      renderExplanation(q.explanation);
      renderAnalysisAI(q.analysisAI);

      const basisContainer = document.getElementById("lawBasisBadge");
      basisContainer.innerHTML = "";
      (q.lawBasis || []).forEach((law) => {
        const tag = document.createElement("span");
        tag.className = "px-2 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-300 text-[11px] font-medium border border-blue-400/20";
        tag.textContent = law;
        basisContainer.appendChild(tag);
      });
    }

    // =========================================================================
    // 8. 切题、收藏、笔记、错题列表与统计更新
    // =========================================================================
    function prevQuestion() {
      if (filteredQuestions.length === 0) return;
      if (currentIndex > 0) {
        currentIndex--;
        const card = document.getElementById("questionCard");
        card.classList.remove("anim-slide-right");
        void card.offsetWidth;
        card.classList.add("anim-slide-right");
        renderQuestion(currentIndex);
      } else {
        showToast("已经是当前列表第一题", "info");
      }
    }

    function nextQuestion() {
      if (filteredQuestions.length === 0) return;
      if (currentIndex < filteredQuestions.length - 1) {
        currentIndex++;
        const card = document.getElementById("questionCard");
        card.classList.remove("anim-slide-left");
        void card.offsetWidth;
        card.classList.add("anim-slide-left");
        renderQuestion(currentIndex);
      } else {
        showToast("已到达当前列表最后一题", "info");
      }
    }

    function jumpToQuestion(idx) {
      if (idx >= 0 && idx < filteredQuestions.length) {
        currentIndex = idx;
        renderQuestion(currentIndex);
      }
    }

    function toggleFavoriteCurrent() {
      if (filteredQuestions.length === 0) return;
      const q = filteredQuestions[currentIndex];
      if (favorites[q.id]) {
        delete favorites[q.id];
        showToast("已取消收藏", "info");
      } else {
        favorites[q.id] = true;
        showToast("已加入收藏夹", "success");
      }
      safeSaveJSON(STORAGE_KEYS.FAVORITES, favorites);
      renderQuestion(currentIndex);
      updateStats();
    }

    // ===== 学习报告看板 =====
    function openStudyReport() {
      try { renderStudyReport(); } catch (e) { console.warn(e); }
      document.getElementById("reportModal").classList.remove("hidden");
    }
    function renderStudyReport() {
      const answeredIds = Object.keys(userProgress).filter((id) => userProgress[id] && userProgress[id].answered);
      const objectiveIds = answeredIds.filter((id) => !isSubjectiveRecord(userProgress[id]));   // P2-13
      const correctCount = objectiveIds.filter((id) => userProgress[id].isCorrect === true).length;
      const accuracy = objectiveIds.length ? Math.round((correctCount / objectiveIds.length) * 100) : 0;
      const favCount = Object.keys(favorites).filter((id) => favorites[id]).length;
      const dueCount = allQuestions.filter((q) => isDueForReview(q.id)).length;

      const ov = [
        ["已答", answeredIds.length, "text-blue-600 dark:text-blue-400"],
        ["正确率", accuracy + "%", "text-emerald-600 dark:text-emerald-400"],
        ["错题", wrongQuestions.length, "text-rose-500"],
        ["收藏", favCount, "text-amber-500"],
        ["待复习", dueCount, "text-indigo-500"]
      ];
      const ovBox = document.getElementById("reportOverview");
      ovBox.innerHTML = "";
      ov.forEach(([k, v, c]) => {
        const d = document.createElement("div");
        d.className = "theme-subtle border rounded-xl p-2 text-center";
        d.innerHTML = '<div class="text-lg font-bold ' + c + '">' + v + '</div><div class="text-[10px] theme-muted">' + k + "</div>";
        ovBox.appendChild(d);
      });

      const subj = {};
      allQuestions.forEach((q) => {
        const s = q.subject || "其他";
        if (!subj[s]) subj[s] = { total: 0, answered: 0, objAnswered: 0, correct: 0 };
        subj[s].total++;
        const r = userProgress[q.id];
        if (r && r.answered) {
          subj[s].answered++;
          if (!isSubjectiveRecord(r)) { subj[s].objAnswered++; if (r.isCorrect === true) subj[s].correct++; }   // P2-13
        }
      });
      const rows = Object.entries(subj).filter(([, v]) => v.answered > 0).sort((a, b) => b[1].answered - a[1].answered);
      const sBox = document.getElementById("reportSubjects");
      sBox.innerHTML = "";
      if (rows.length === 0) {
        sBox.innerHTML = '<div class="text-xs theme-muted">还没有答题记录，先刷几题吧。</div>';
      } else {
        rows.forEach(([name, v]) => {
          const acc = v.objAnswered ? Math.round((v.correct / v.objAnswered) * 100) : 0;
          const w = Math.max(2, acc);
          const subjCnt = v.answered - v.objAnswered;
          const d = document.createElement("div");
          d.innerHTML =
            '<div class="flex justify-between text-[11px] mb-0.5"><span>' + escapeHtml(name) + "</span>" +
            '<span class="theme-muted">' + (v.objAnswered ? v.correct + "/" + v.objAnswered + " · " + acc + "%" : "—") + (subjCnt ? " · 主观 " + subjCnt + " 题" : "") + "</span></div>" +
            '<div class="h-2 rounded-full bg-slate-200/70 dark:bg-slate-700/60 overflow-hidden">' +
            '<div class="h-full rounded-full" style="width:' + w + "%;background:linear-gradient(90deg,#34d399,#059669)\"></div></div>";
          sBox.appendChild(d);
        });
      }

      const tr = document.getElementById("reportTrend");
      tr.innerHTML = "";
      const now = new Date(); now.setHours(0, 0, 0, 0);
      const dayCounts = [];
      for (let i = 6; i >= 0; i--) {
        const d0 = new Date(now.getTime() - i * 86400000);
        const start = d0.getTime(), end = start + 86400000;
        const cnt = answeredIds.filter((id) => { const t = userProgress[id].lastAnsweredAt || 0; return t >= start && t < end; }).length;
        dayCounts.push({ label: (d0.getMonth() + 1) + "/" + d0.getDate(), cnt: cnt });
      }
      const maxC = Math.max(1, ...dayCounts.map((d) => d.cnt));
      dayCounts.forEach((d) => {
        const bar = document.createElement("div");
        bar.className = "flex-1 flex flex-col items-center justify-end gap-1";
        bar.innerHTML =
          '<div class="text-[10px] theme-muted">' + (d.cnt || "") + "</div>" +
          '<div class="w-full rounded-t-md" style="height:' + (Math.round((d.cnt / maxC) * 72) + 4) + 'px;background:linear-gradient(180deg,#60a5fa,#2563eb)"></div>' +
          '<div class="text-[10px] theme-muted">' + d.label + "</div>";
        tr.appendChild(bar);
      });

      const weak = Object.entries(subj)
        .filter(([, v]) => v.answered >= 3)
        .map(([name, v]) => ({ name: name, acc: Math.round((v.correct / v.answered) * 100), answered: v.answered }))
        .sort((a, b) => a.acc - b.acc)
        .slice(0, 3);
      const wBox = document.getElementById("reportWeak");
      wBox.innerHTML = "";
      if (weak.length === 0) {
        wBox.innerHTML = '<div class="text-xs theme-muted">答够 3 题以上的科目才会在此提示。</div>';
      } else {
        weak.forEach((x) => {
          const d = document.createElement("div");
          d.className = "flex justify-between items-center text-xs theme-subtle border rounded-lg px-2.5 py-1.5";
          d.innerHTML = '<span>' + escapeHtml(x.name) + ' <span class="theme-muted text-[10px]">已答' + x.answered + "</span></span>" +
            '<span class="font-bold ' + (x.acc < 60 ? "text-rose-500" : "text-amber-500") + '">' + x.acc + "%</span>";
          wBox.appendChild(d);
        });
      }
    }

    // ===== 语音朗读（浏览器 TTS，通勤听题） =====
    function speakCurrentQuestion() {
      try {
        if (!("speechSynthesis" in window)) { showToast("当前浏览器不支持语音朗读", "warn"); return; }
        if (window.speechSynthesis.speaking) { window.speechSynthesis.cancel(); showToast("已停止朗读", "info"); return; }
        if (filteredQuestions.length === 0) return;
        const q = filteredQuestions[currentIndex];
        const parts = [q.title || q.question || ""];
        const expShown = !document.getElementById("explanationBox").classList.contains("hidden");
        const expEl = document.getElementById("explanationContent");
        if (expShown && expEl && expEl.innerText.trim()) parts.push("解析：" + expEl.innerText.trim());
        const u = new SpeechSynthesisUtterance(parts.join("。"));
        u.lang = "zh-CN"; u.rate = 1;
        window.speechSynthesis.speak(u);
        showToast("开始朗读（再次点击可停止）", "info");
      } catch (e) { showToast("朗读失败", "error"); }
    }

    function updateStats() {
      const answeredIds = Object.keys(userProgress).filter((id) => userProgress[id] && userProgress[id].answered);
      // P2-13：正确率只统计客观题；主观题计入「已答」，不进正确率分母
      const objectiveIds = answeredIds.filter((id) => !isSubjectiveRecord(userProgress[id]));
      const correctIds = objectiveIds.filter((id) => userProgress[id].isCorrect === true);
      const accuracy = objectiveIds.length > 0 ? Math.round((correctIds.length / objectiveIds.length) * 100) : 0;
      const favCount = Object.keys(favorites).filter((id) => favorites[id]).length;
      const dueCount = allQuestions.filter((q) => isDueForReview(q.id)).length;

      document.getElementById("statAnswered").textContent = String(answeredIds.length);
      document.getElementById("statAccuracy").textContent = `${accuracy}%`;
      document.getElementById("statWrong").textContent = String(wrongQuestions.length);
      document.getElementById("statFav").textContent = String(favCount);
      document.getElementById("statReview").textContent = String(dueCount);
    }

    // 科目下拉只列出错题本中实际存在的科目，避免选到永远无结果的项
    function syncWrongFilterOptions() {
      const sel = document.getElementById("wrongFilterSubject");
      if (!sel) return;
      const subs = [...new Set(wrongQuestions
        .map((id) => { const q = getQById(id); return q && q.subject; })
        .filter(Boolean))].sort();
      const sig = subs.join("|");
      if (sel.dataset.sig === sig) return;
      sel.dataset.sig = sig;
      sel.innerHTML = '<option value="ALL">全部科目</option>' +
        subs.map((s) => '<option value="' + escapeHtml(s) + '">' + escapeHtml(s) + '</option>').join("");
      sel.value = (wrongFilterSubject === "ALL" || subs.includes(wrongFilterSubject)) ? wrongFilterSubject : "ALL";
      wrongFilterSubject = sel.value;
    }

    function getFilteredWrongIds() {
      return wrongQuestions.filter((qid) => {
        const q = getQById(qid);
        if (!q) return false;
        if (wrongFilterSubject !== "ALL" && q.subject !== wrongFilterSubject) return false;
        const reason = wrongReasons[qid] || "";
        if (wrongFilterReason === "__none__") return !reason;
        if (wrongFilterReason !== "ALL" && reason !== wrongFilterReason) return false;
        return true;
      });
    }

    // P2-8：错题列表分页 + 事件委托。
    // renderWrongList：重算筛选 / 计数（badge 仍为总数）并渲染当前页；切页只走 renderWrongListPage。
    function renderWrongList() {
      const container = document.getElementById("wrongQuestionsList");
      const badge = document.getElementById("wrongListCountBadge");
      syncWrongFilterOptions();
      const filtered = getFilteredWrongIds();
      const isFiltering = wrongFilterSubject !== "ALL" || wrongFilterReason !== "ALL";
      // P2-20：getFilteredWrongIds 已排除题库中查不到的错题，所以隐藏数直接从全部错题里统计；
      // 只有确实存在未加载科目（省流量 / 后台补齐中）时才归因为「未加载科目」，
      // 全部科目已加载仍查不到的（题目已从题库删除）不计入，避免出现点了也加载不出来的提示。
      const missingSubjects = typeof window.__fkMissingSubjects === "function" ? window.__fkMissingSubjects() : [];
      const visibleCount = filtered.length;
      const hiddenCount = missingSubjects.length
        ? wrongQuestions.reduce((n, qid) => (getQById(qid) ? n : n + 1), 0)
        : 0;
      badge.textContent = (isFiltering
        ? `${visibleCount} / ${wrongQuestions.length} 题`
        : `${wrongQuestions.length} 题`)
        + (hiddenCount > 0 ? `（另有 ${hiddenCount} 道在未加载科目）` : "");
      renderWrongMissingHint(hiddenCount);
      const practiceBtn = document.getElementById("wrongFilterPracticeBtn");
      if (practiceBtn) practiceBtn.disabled = filtered.length === 0;
      updateWrongCsvButtonState();
      bindWrongListDelegation();

      if (wrongQuestions.length === 0) {
        wrongListIds = [];
        wrongListPage = 0;
        container.innerHTML = `<div class="empty-illust"><div class="empty-ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/><path d="M9 7h6M9 11h6"/></svg></div><div class="empty-title">错题本空空如也</div><div class="empty-desc">答错的题目会自动收录于此，考前集中攻克薄弱点。</div></div>`;
        renderWrongPager(0, 0);
        return;
      }
      if (filtered.length === 0) {
        wrongListIds = [];
        wrongListPage = 0;
        container.innerHTML = '<div class="text-center py-6 text-xs theme-muted">当前筛选条件下没有错题<br><span class="opacity-70">可点击「清除筛选」查看全部 ' + wrongQuestions.length + ' 道</span></div>';
        renderWrongPager(0, 0);
        return;
      }

      wrongListIds = filtered.filter((qid) => !!getQById(qid));
      renderWrongListPage(false);
    }

    // P2-20：未加载科目提示条。每次 renderWrongList 先移除旧元素，再按需插到 #wrongListPager 之后。
    // 省流量默认行为不变：不自动下载，只在用户点击按钮后加载缺失科目。
    let wrongMissingLoading = false;   // 加载期间 renderWrongList 会被多次触发，重建时保持「加载中…」状态
    function renderWrongMissingHint(hiddenCount) {
      const old = document.getElementById("wrongMissingHint");
      if (old) old.remove();
      if (!(hiddenCount > 0)) return;
      const pager = document.getElementById("wrongListPager");
      if (!pager) return;
      const hint = document.createElement("div");
      hint.id = "wrongMissingHint";
      hint.className = "mt-2 p-2 rounded-lg theme-subtle border text-xs flex flex-wrap items-center justify-between gap-2";
      const text = document.createElement("span");
      text.className = "theme-muted";
      text.textContent = `还有 ${hiddenCount} 道错题位于未加载的科目`;
      const btn = document.createElement("button");
      btn.type = "button";
      btn.id = "wrongLoadMissingBtn";
      btn.className = "px-2 py-1 rounded-lg theme-subtle border font-medium hover:border-blue-400 transition shrink-0 disabled:opacity-40 disabled:cursor-not-allowed";
      btn.disabled = wrongMissingLoading;
      btn.textContent = wrongMissingLoading ? "加载中…" : "加载这些科目";
      btn.addEventListener("click", loadMissingWrongSubjects);
      hint.appendChild(text);
      hint.appendChild(btn);
      pager.insertAdjacentElement("afterend", hint);
    }

    async function loadMissingWrongSubjects() {
      if (wrongMissingLoading) return;
      if (typeof window.__ensureSubject !== "function" || typeof window.__fkMissingSubjects !== "function") return;
      const missing = window.__fkMissingSubjects();
      if (!missing.length) { renderWrongList(); return; }
      wrongMissingLoading = true;
      const btn = document.getElementById("wrongLoadMissingBtn");
      if (btn) { btn.disabled = true; btn.textContent = "加载中…"; }
      try {
        await Promise.all(missing.map((n) => window.__ensureSubject(n).catch(() => {})));
      } finally {
        wrongMissingLoading = false;
        renderWrongList();
        updateStats();
      }
    }

    // 只重绘当前页（最多 WRONG_PAGE_SIZE 张卡片）与分页条；页码越界自动夹紧
    function renderWrongListPage(resetScroll) {
      const container = document.getElementById("wrongQuestionsList");
      if (!container) return;
      const total = wrongListIds.length;
      const totalPages = Math.max(1, Math.ceil(total / WRONG_PAGE_SIZE));
      wrongListPage = Math.max(0, Math.min(wrongListPage, totalPages - 1));
      const start = wrongListPage * WRONG_PAGE_SIZE;
      const end = Math.min(start + WRONG_PAGE_SIZE, total);
      const parts = [];
      for (let i = start; i < end; i++) {
        const qid = wrongListIds[i];
        const q = getQById(qid);
        if (!q) continue;
        const reason = wrongReasons[qid] || "";
        parts.push(`<div class="wrong-card p-2.5 rounded-xl theme-subtle border flex items-center justify-between gap-2 text-xs transition" data-wrong-idx="${i}">
          <div class="min-w-0 flex-1 cursor-pointer">
            <div class="flex items-center gap-1.5 mb-0.5">
              <span class="px-1.5 py-0.2 rounded bg-rose-500/15 text-rose-600 dark:text-rose-400 font-semibold">${escapeHtml(q.subject)}</span>
              <span class="font-semibold">${escapeHtml(q.type)}</span>
              ${reason ? `<span class="px-1.5 py-0.2 rounded bg-amber-500/15 text-amber-700 dark:text-amber-300">${escapeHtml(reason)}</span>` : ""}
            </div>
            <div class="truncate theme-muted">${escapeHtml(q.title)}</div>
          </div>
          <button type="button" class="wrong-redo-btn px-2.5 py-1 rounded-lg text-white font-semibold shrink-0">去重做</button>
        </div>`);
      }
      container.innerHTML = parts.join("");
      if (resetScroll) container.scrollTop = 0;
      renderWrongPager(totalPages, total);
    }

    // 页码序列：首页、末页、当前页 ±1，断档处用 -1 表示省略号
    function getWrongPagerItems(cur, totalPages) {
      const pages = Array.from(new Set([0, cur - 1, cur, cur + 1, totalPages - 1]))
        .filter((p) => p >= 0 && p < totalPages)
        .sort((a, b) => a - b);
      const out = [];
      pages.forEach((p, i) => {
        if (i > 0 && p - pages[i - 1] > 1) out.push(-1);
        out.push(p);
      });
      return out;
    }

    function renderWrongPager(totalPages, total) {
      const pager = document.getElementById("wrongListPager");
      if (!pager) return;
      if (!totalPages || totalPages <= 1) {
        pager.style.display = "none";
        pager.innerHTML = "";
        return;
      }
      const cur = wrongListPage;
      const nums = getWrongPagerItems(cur, totalPages).map((p) => (p === -1
        ? '<span class="pager-info">…</span>'
        : `<button type="button" class="pager-btn" data-wrong-page="${p}"${p === cur ? ' aria-current="page" style="background:#2563eb;border-color:#2563eb;color:#fff"' : ""}>${p + 1}</button>`
      )).join("");
      pager.innerHTML = `<button type="button" class="pager-btn" data-wrong-page="${cur - 1}"${cur <= 0 ? " disabled" : ""}>上一页</button>
        <span class="inline-flex items-center gap-1 flex-wrap">${nums}</span>
        <span class="pager-info">第 ${cur + 1} / ${totalPages} 页 · 共 ${total} 条</span>
        <button type="button" class="pager-btn" data-wrong-page="${cur + 1}"${cur >= totalPages - 1 ? " disabled" : ""}>下一页</button>`;
      pager.style.display = "";
    }

    function openWrongQuestion(q) {
      const idxInFiltered = filteredQuestions.findIndex((f) => f.id === q.id);
      if (idxInFiltered !== -1) {
        jumpToQuestion(idxInFiltered);
      } else {
        currentSubject = "全部";
        currentTypeFilter = "ALL";
        currentDiffFilter = "ALL";
        searchQuery = "";
        document.getElementById("searchInput").value = "";
        renderSubjectBar();
        applyFilters(false);
        const newIdx = filteredQuestions.findIndex((f) => f.id === q.id);
        if (newIdx !== -1) jumpToQuestion(newIdx);
      }
      window.scrollTo({ top: 0, behavior: "smooth" });
    }

    // 事件委托：列表容器与分页条各绑一次，重绘不再逐卡 addEventListener
    function bindWrongListDelegation() {
      if (wrongListDelegated) return;
      const container = document.getElementById("wrongQuestionsList");
      const pager = document.getElementById("wrongListPager");
      if (!container) return;
      wrongListDelegated = true;
      container.addEventListener("click", (e) => {
        const card = e.target && e.target.closest ? e.target.closest("[data-wrong-idx]") : null;
        if (!card || !container.contains(card)) return;
        const q = getQById(wrongListIds[Number(card.getAttribute("data-wrong-idx"))]);
        if (q) openWrongQuestion(q);
      });
      if (pager) {
        pager.addEventListener("click", (e) => {
          const btn = e.target && e.target.closest ? e.target.closest("button[data-wrong-page]") : null;
          if (!btn || btn.disabled || !pager.contains(btn)) return;
          const p = Number(btn.getAttribute("data-wrong-page"));
          if (!Number.isFinite(p) || p === wrongListPage) return;
          wrongListPage = p;
          renderWrongListPage(true);
        });
      }
    }

    // =========================================================================
    // 9. 答题卡弹窗、知识点/笔记中心弹窗、AI 深度追问与数据导入导出
    // =========================================================================
    // ── 答题卡：进度概览 + 每页 120 题，避免一次渲染近万个按钮 ──
    function getSheetPageCount() {
      return Math.max(1, Math.ceil(filteredQuestions.length / SHEET_PAGE_SIZE));
    }

    function updateSheetOverview() {
      const total = filteredQuestions.length;
      let correct = 0;
      let wrong = 0;
      let subjDone = 0;   // P2-13：主观题算已答，但不计对/错
      filteredQuestions.forEach((q) => {
        const rec = userProgress[q.id];
        if (rec && rec.answered) {
          if (isSubjectiveRecord(rec)) subjDone++;
          else if (rec.isCorrect) correct++;
          else wrong++;
        }
      });
      const answered = correct + wrong + subjDone;
      const pct = total > 0 ? Math.round((answered / total) * 100) : 0;
      document.getElementById("sheetCorrectCount").textContent = String(correct);
      document.getElementById("sheetWrongCount").textContent = String(wrong);
      document.getElementById("sheetLeftCount").textContent = String(Math.max(0, total - answered));
      document.getElementById("sheetProgressPct").textContent = `${pct}%`;
      document.getElementById("sheetModalSub").textContent = `当前筛选 ${total} 题 · 每页 ${SHEET_PAGE_SIZE} 题 · 点击题号直接跳转`;
    }

    function renderAnswerSheetPage() {
      const grid = document.getElementById("answerSheetGrid");
      if (!grid) return;
      const total = filteredQuestions.length;
      const totalPages = getSheetPageCount();
      sheetPage = Math.max(0, Math.min(sheetPage, totalPages - 1));

      grid.innerHTML = "";
      updateSheetOverview();

      if (total === 0) {
        grid.innerHTML = `<div class="k-empty col-span-full">
          <div class="text-2xl mb-1.5 opacity-70">∅</div>
          <div class="text-xs font-bold">当前筛选下没有题目</div>
          <div class="text-[11px] theme-muted mt-1">调整科目、题型或搜索关键词后再打开答题卡。</div>
        </div>`;
      } else {
        const start = sheetPage * SHEET_PAGE_SIZE;
        const end = Math.min(start + SHEET_PAGE_SIZE, total);
        const frag = document.createDocumentFragment();
        for (let idx = start; idx < end; idx++) {
          const q = filteredQuestions[idx];
          const rec = userProgress[q.id];
          const isFav = !!favorites[q.id];
          const hasNote = !!(userNotes[q.id] && userNotes[q.id].trim());
          const btn = document.createElement("button");
          btn.type = "button";
          btn.dataset.idx = String(idx);

          let colorCls = "theme-subtle border";
          let mark = "";
          const isSubjRec = !!(rec && rec.answered && isSubjectiveRecord(rec));   // P2-13
          if (isSubjRec) {
            colorCls = "bg-blue-500/10 border-blue-400";
            mark = "✎";
          } else if (rec && rec.answered) {
            colorCls = rec.isCorrect ? "sheet-correct border-emerald-600" : "sheet-wrong border-rose-600";
            mark = rec.isCorrect ? "✓" : "✕";
          }
          const activeRing = idx === currentIndex ? "ring-2 ring-blue-500 ring-offset-1" : "";
          const favRing = isFav ? "ring-2 ring-amber-400" : "";

          btn.className = `rounded-lg text-xs font-bold flex flex-col items-center justify-center relative transition ${colorCls} ${activeRing} ${favRing}`;
          btn.setAttribute("aria-label", `第 ${idx + 1} 题${isSubjRec ? "，主观题已作答" : (rec && rec.answered ? (rec.isCorrect ? "，已答对" : "，已答错") : "，未作答")}${isFav ? "，已收藏" : ""}`);
          btn.innerHTML = `
            ${mark ? `<span class="absolute top-0.5 right-1 text-[10px] leading-none font-bold opacity-90">${mark}</span>` : ""}
            <span>${idx + 1}</span>
            ${hasNote ? `<svg class="w-2.5 h-2.5 mt-0.5 opacity-65" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H5a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h13a2 2 0 0 0 2-2v-6"/><path d="M18.4 2.6a2 2 0 0 1 3 3L11 16l-4 1 1-4z"/></svg>` : ""}
          `;
          frag.appendChild(btn);
        }
        grid.appendChild(frag);
      }

      document.getElementById("sheetPageInfo").textContent = `第 ${sheetPage + 1} / ${totalPages} 页`;
      document.getElementById("sheetPrevBtn").disabled = sheetPage <= 0;
      document.getElementById("sheetNextBtn").disabled = sheetPage >= totalPages - 1;
      const jumpInput = document.getElementById("sheetJumpInput");
      jumpInput.max = String(Math.max(1, total));
      jumpInput.placeholder = total > 0 ? `${currentIndex + 1}` : "—";
      jumpInput.value = "";
    }

    function openAnswerSheetModal() {
      sheetPage = Math.floor(currentIndex / SHEET_PAGE_SIZE);
      renderAnswerSheetPage();
      document.getElementById("answerSheetModal").classList.remove("hidden");
    }

    function goToSheetPage(page) {
      const totalPages = getSheetPageCount();
      sheetPage = Math.max(0, Math.min(page, totalPages - 1));
      renderAnswerSheetPage();
    }

    // ── 知识点中心：真实字段 point / detail，科目检索 + 折叠 + 分页 ──
    function getKnowledgePoint(k) {
      return k.point || k.title || k.name || "核心考点";
    }
    function getKnowledgeDetail(k) {
      return k.detail || k.content || k.desc || "";
    }

    function getKnowledgeSubjectCounts() {
      const map = new Map();
      knowledgeBase.forEach((k) => {
        const subject = (k.subject || "综合").trim() || "综合";
        map.set(subject, (map.get(subject) || 0) + 1);
      });
      return Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
    }

    function renderKnowledgeChips() {
      const wrap = document.getElementById("kSubjectChips");
      if (!wrap) return;
      const counts = getKnowledgeSubjectCounts();
      if (knowledgeSubject !== "全部" && !counts.some(([name]) => name === knowledgeSubject)) {
        knowledgeSubject = "全部";
      }
      const chips = [`<button type="button" class="k-chip ${knowledgeSubject === "全部" ? "is-active" : ""}" data-subject="全部">全部<b>${knowledgeBase.length}</b></button>`];
      counts.forEach(([subject, count]) => {
        chips.push(`<button type="button" class="k-chip ${knowledgeSubject === subject ? "is-active" : ""}" data-subject="${escapeHtml(subject)}">${escapeHtml(subject)}<b>${count}</b></button>`);
      });
      wrap.innerHTML = chips.join("");
    }

    function getFilteredKnowledge() {
      const q = knowledgeQuery.trim().toLowerCase();
      return knowledgeBase.filter((k) => {
        const subject = (k.subject || "综合").trim() || "综合";
        if (knowledgeSubject !== "全部" && subject !== knowledgeSubject) return false;
        if (!q) return true;
        return `${subject} ${getKnowledgePoint(k)} ${getKnowledgeDetail(k)}`.toLowerCase().includes(q);
      });
    }

    function renderKnowledgeList() {
      const container = document.getElementById("knowledgeListContainer");
      if (!container) return;
      const items = getFilteredKnowledge();
      const totalPages = Math.max(1, Math.ceil(items.length / KNOWLEDGE_PAGE_SIZE));
      knowledgePage = Math.max(0, Math.min(knowledgePage, totalPages - 1));
      const start = knowledgePage * KNOWLEDGE_PAGE_SIZE;
      const pageItems = items.slice(start, start + KNOWLEDGE_PAGE_SIZE);

      if (pageItems.length === 0) {
        container.innerHTML = `<div class="k-empty">
          <div class="empty-ico mx-auto mb-2">?</div>
          <div class="empty-title">没有匹配的考点</div>
          <div class="empty-desc">试试更短的关键词，或切换到「全部」科目。</div>
          <button type="button" id="kEmptyResetBtn" class="mt-3 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-blue-600">重置筛选</button>
        </div>`;
      } else {
        container.innerHTML = pageItems.map((k) => {
          const detail = getKnowledgeDetail(k).trim();
          const isLong = detail.length > 130;
          return `<article class="k-card">
            <div class="k-card-head">
              <span class="k-subject">${escapeHtml(k.subject || "综合")}</span>
              <h4 class="k-point">${escapeHtml(getKnowledgePoint(k))}</h4>
            </div>
            <div class="k-body ${isLong ? "is-clamped" : ""}">${detail ? formatLegalHighlight(detail) : "暂无详细展开，建议结合真题复盘。"}</div>
            ${isLong ? `<button type="button" class="k-more" aria-expanded="false"><span>展开全文</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg></button>` : ""}
          </article>`;
        }).join("");
      }

      const isFiltered = knowledgeSubject !== "全部" || knowledgeQuery.trim();
      document.getElementById("kResultMeta").textContent = isFiltered
        ? `筛选到 ${items.length} 条 · 共 ${knowledgeBase.length} 条考点`
        : `共 ${knowledgeBase.length} 条考点 · 按科目分组`;
      document.getElementById("kPageInfo").textContent = `第 ${knowledgePage + 1} / ${totalPages} 页`;
      document.getElementById("kPrevBtn").disabled = knowledgePage <= 0;
      document.getElementById("kNextBtn").disabled = knowledgePage >= totalPages - 1;
      const clearBtn = document.getElementById("knowledgeSearchClear");
      if (clearBtn) clearBtn.classList.toggle("is-visible", !!knowledgeQuery.trim());
    }

    function renderMyNotesList() {
      const container = document.getElementById("myNotesListContainer");
      if (!container) return;
      const noteIds = Object.keys(userNotes).filter((id) => userNotes[id] && userNotes[id].trim());
      document.getElementById("myNotesCount").textContent = String(noteIds.length);
      document.getElementById("notesCountLabel").textContent = `共 ${noteIds.length} 条随手笔记`;

      if (noteIds.length === 0) {
        container.innerHTML = `<div class="k-empty">
          <div class="empty-ico mx-auto mb-2"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M11 4H5a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h13a2 2 0 0 0 2-2v-6"/><path d="M18.4 2.6a2 2 0 0 1 3 3L11 16l-4 1 1-4z"/></svg></div>
          <div class="empty-title">还没有随手笔记</div>
          <div class="empty-desc">在题目下方记录口诀、易错点或请求权基础，笔记会自动汇总到这里。</div>
        </div>`;
        return;
      }

      container.innerHTML = noteIds.map((qid) => {
        const q = getQById(qid);
        return `<article class="k-card" style="border-left-color:#f59e0b">
          <div class="flex items-center justify-between gap-2 mb-1">
            <span class="text-[11px] font-bold text-blue-600 dark:text-blue-400">${escapeHtml(q ? `${q.subject} · ${q.type}` : qid)}</span>
            <button type="button" data-qid="${escapeHtml(qid)}" class="jump-note-btn text-[11px] font-semibold underline shrink-0">跳转原题</button>
          </div>
          <div class="text-[11px] theme-muted truncate mb-1.5">${escapeHtml(q ? q.title : "")}</div>
          <div class="p-2.5 rounded-lg theme-card border text-[11.5px] whitespace-pre-line font-medium leading-relaxed">${escapeHtml(userNotes[qid])}</div>
        </article>`;
      }).join("");
    }

    function renderKnowledgeAndNotesModal() {
      renderKnowledgeChips();
      renderKnowledgeList();
      renderMyNotesList();
    }

    function setKnowledgeTab(tab) {
      const isKnowledge = tab !== "notes";
      document.getElementById("tabKnowledgeCardsBtn").classList.toggle("is-active", isKnowledge);
      document.getElementById("tabMyNotesBtn").classList.toggle("is-active", !isKnowledge);
      document.getElementById("knowledgePane").classList.toggle("hidden", !isKnowledge);
      document.getElementById("myNotesPane").classList.toggle("hidden", isKnowledge);
      document.getElementById("myNotesPane").classList.toggle("flex", !isKnowledge);
    }

    function jumpToQuestionById(qid) {
      currentSubject = "全部";
      currentTypeFilter = "ALL";
      currentDiffFilter = "ALL";
      searchQuery = "";
      const searchInput = document.getElementById("searchInput");
      if (searchInput) searchInput.value = "";
      const typeSel = document.getElementById("typeFilterSelect");
      if (typeSel) typeSel.value = "ALL";
      const diffSel = document.getElementById("diffFilterSelect");
      if (diffSel) diffSel.value = "ALL";
      renderSubjectBar();
      applyFilters(false);
      const idx = filteredQuestions.findIndex((item) => item.id === qid);
      if (idx !== -1) jumpToQuestion(idx);
      document.getElementById("knowledgeModal").classList.add("hidden");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }

    // 导出全量 JSON 备份
    function exportFullBackupJSON() {
      const payload = {
        version: "fakao-pro-v13",
        exportedAt: new Date().toISOString(),
        fakao_progress: userProgress,
        fakao_wrong_questions: wrongQuestions,
        fakao_favorites_v1: favorites,
        fakao_notes_v1: userNotes,
        fakao_wrong_reasons_v1: wrongReasons
      };
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `fakao_backup_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      showToast("全量 JSON 备份已导出下载", "success");
    }

    // 从 JSON 对象恢复备份
    // P2-18：opts.strategy
    //   "replace"（默认，JSON 文件 / 粘贴导入）：备份覆盖本机同名条目；错题取并集。行为与之前一致。
    //   "newer"（Gist 拉取）：进度逐题按 lastAnsweredAt 取较新；收藏、错题取并集；
    //            笔记与错因只补本机缺失的，本机已有的保留。
    // P2-19：逐字段类型清洗，防止非字符串笔记等脏数据让 .trim() 抛错、整页渲染中断。
    // 返回 { ok, strategy, notesKept }：notesKept = 本机保留、未被远端覆盖的非空笔记数（仅 newer）。
    function restoreBackupPayload(data, opts = { strategy: "replace" }) {
      const strategy = opts && opts.strategy === "newer" ? "newer" : "replace";
      const result = { ok: false, strategy, notesKept: 0 };
      if (!data || typeof data !== "object") {
        showToast("备份格式无效，请检查 JSON 内容", "error");
        return result;
      }
      // 结构校验：只接受预期类型，避免把任意对象/HTML 注入到本地存储
      const isPlainObj = (v) => Object.prototype.toString.call(v) === "[object Object]";
      const hasOwn = (o, k) => Object.prototype.hasOwnProperty.call(o, k);
      const UNSAFE_KEYS = new Set(["__proto__", "constructor", "prototype"]);   // 防原型污染
      // 值只保留 string / number / boolean 或 plain object（记录本体含 subjectiveText 等，保留原结构）
      const cleanValMap = (v) => {
        if (!isPlainObj(v)) return null;
        const out = {};
        Object.keys(v).forEach((k) => {
          if (UNSAFE_KEYS.has(k)) return;
          const val = v[k];
          if (typeof val === "string" || typeof val === "number" || typeof val === "boolean") out[k] = val;
          else if (isPlainObj(val)) out[k] = val;
        });
        return out;
      };
      // 值必须是 string，其它一律丢弃（笔记、错因标签）
      const cleanStringMap = (v) => {
        if (!isPlainObj(v)) return null;
        const out = {};
        Object.keys(v).forEach((k) => {
          if (UNSAFE_KEYS.has(k)) return;
          if (typeof v[k] === "string") out[k] = v[k];
        });
        return out;
      };
      // 收藏：值统一转 boolean
      const cleanBoolMap = (v) => {
        const base = cleanValMap(v);
        if (!base) return null;
        const out = {};
        Object.keys(base).forEach((k) => { out[k] = !!base[k]; });
        return out;
      };
      // 进度：每条记录必须是 plain object；attempts 为字符串时转 Number（非有限数按 0）
      const cleanProgressMap = (v) => {
        const base = cleanValMap(v);
        if (!base) return null;
        const out = {};
        Object.keys(base).forEach((k) => {
          const rec = base[k];
          if (!isPlainObj(rec)) return;
          const r = { ...rec };
          if (typeof r.attempts === "string") {
            const n = Number(r.attempts);
            r.attempts = Number.isFinite(n) ? n : 0;
          }
          out[k] = r;
        });
        return out;
      };
      const ts = (rec) => {
        const n = Number(rec && rec.lastAnsweredAt);
        return Number.isFinite(n) ? n : 0;
      };

      if (data.fakao_progress !== undefined && !isPlainObj(data.fakao_progress)) {
        showToast("备份中的 fakao_progress 结构不合法，已拒绝导入", "error");
        return result;
      }
      if (data.fakao_wrong_questions !== undefined && !Array.isArray(data.fakao_wrong_questions)) {
        showToast("备份中的 fakao_wrong_questions 结构不合法，已拒绝导入", "error");
        return result;
      }
      for (const k of ["fakao_favorites_v1", "fakao_notes_v1", "fakao_wrong_reasons_v1"]) {
        if (data[k] !== undefined && !isPlainObj(data[k])) {
          showToast("备份中的 " + k + " 结构不合法，已拒绝导入", "error");
          return result;
        }
      }
      resetSubjectiveDraftState();   // 防止旧草稿覆盖即将恢复的备份数据

      if (data.fakao_progress) {
        const remote = cleanProgressMap(data.fakao_progress);
        if (strategy === "newer") {
          const merged = { ...userProgress };
          Object.keys(remote).forEach((id) => {
            const local = merged[id];
            // 本机没有该题，或远端作答时间更晚，才采用远端；相同时间保留本机
            if (!isPlainObj(local) || ts(remote[id]) > ts(local)) merged[id] = remote[id];
          });
          userProgress = merged;
        } else {
          userProgress = { ...userProgress, ...remote };
        }
        safeSaveJSON(STORAGE_KEYS.PROGRESS, userProgress);
      }
      if (Array.isArray(data.fakao_wrong_questions)) {
        // 两种策略都取并集
        wrongQuestions = Array.from(new Set([...data.fakao_wrong_questions.filter((x) => typeof x === "number" || typeof x === "string"), ...wrongQuestions]));
        safeSaveJSON(STORAGE_KEYS.WRONG, wrongQuestions);
      }
      if (data.fakao_favorites_v1) {
        const remote = cleanBoolMap(data.fakao_favorites_v1);
        if (strategy === "newer") {
          const merged = { ...favorites };
          Object.keys(remote).forEach((id) => {
            if (remote[id]) merged[id] = true;   // 并集：任一方为 true 即为 true
          });
          favorites = merged;
        } else {
          favorites = { ...favorites, ...remote };
        }
        safeSaveJSON(STORAGE_KEYS.FAVORITES, favorites);
      }
      if (data.fakao_notes_v1) {
        const remote = cleanStringMap(data.fakao_notes_v1);
        if (strategy === "newer") {
          const merged = { ...userNotes };
          Object.keys(remote).forEach((id) => {
            const local = merged[id];
            const localHas = typeof local === "string" && local.trim() !== "";
            if (!localHas) {
              merged[id] = remote[id];
            } else if (remote[id].trim() !== "" && remote[id] !== local) {
              result.notesKept++;   // 两边都有且内容不同：保留本机
            }
          });
          userNotes = merged;
        } else {
          userNotes = { ...userNotes, ...remote };
        }
        safeSaveJSON(STORAGE_KEYS.NOTES, userNotes);
      }
      if (data.fakao_wrong_reasons_v1) {
        const remote = cleanStringMap(data.fakao_wrong_reasons_v1);
        if (strategy === "newer") {
          const merged = { ...wrongReasons };
          Object.keys(remote).forEach((id) => {
            if (!hasOwn(merged, id)) merged[id] = remote[id];   // 本机缺失才用远端
          });
          wrongReasons = merged;
        } else {
          wrongReasons = { ...wrongReasons, ...remote };
        }
        safeSaveJSON(STORAGE_KEYS.WRONG_REASONS, wrongReasons);
      }
      renderQuestion(currentIndex);
      updateStats();
      renderWrongList();
      showToast(strategy === "newer"
        ? "已按「较新优先」合并云端刷题记录、错题、收藏、笔记与错因"
        : "刷题记录、错题、收藏与笔记已成功恢复！", "success");
      result.ok = true;
      return result;
    }

    // 导出错题与笔记 CSV
    function exportWrongAndNotesCSV() {
      const rows = [["题号", "科目", "题型", "难度", "是否错题", "错因标记", "是否收藏", "题干", "正确答案", "个人随手笔记"]];
      allQuestions.forEach((q) => {
        const isWrong = wrongQuestions.includes(q.id);
        const isFav = !!favorites[q.id];
        const note = userNotes[q.id] || "";
        if (!isWrong && !isFav && !note) return;
        rows.push([
          q.id,
          q.subject,
          q.type,
          q.difficulty,
          isWrong ? "是" : "否",
          wrongReasons[q.id] || "",
          isFav ? "是" : "否",
          q.title.replace(/\r?\n/g, " "),
          q.answer.join(""),
          note.replace(/\r?\n/g, " ")
        ]);
      });

      if (rows.length === 1) {
        showToast("当前暂无错题、收藏或笔记可导出", "warn");
        return;
      }

      downloadCsv(rows, `法考错题与笔记汇总_${new Date().toISOString().slice(0, 10)}.csv`);
      showToast("错题与笔记 CSV 已导出（Excel 可直接打开）", "success");
    }

    // 导出错题本明细 CSV：序号 / 科目 / 题干 / 我的答案 / 正确答案 / 是否已掌握 / 最近作答 / 作答次数
    // 错题键只存题目 id，其余列从 allQuestions 与 userProgress 关联；缺失字段留空，不补造。
    function csvEscapeCell(value) {
      let s = value == null ? "" : String(value);
      // P2-25/P3-2：统一防 CSV 公式注入，并对每个单元格加引号
      if (/^[=+\-@\t\r]/.test(s)) s = "'" + s;
      return '"' + s.replace(/"/g, '""') + '"';
    }
    function downloadCsv(rows, filename) {
      const csvContent = "\uFEFF" + rows.map((r) => r.map(csvEscapeCell).join(",")).join("\r\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = filename;
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    }

    function formatCsvTime(ts) {
      const n = Number(ts);
      if (!Number.isFinite(n) || n <= 0) return "";
      const d = new Date(n);
      if (Number.isNaN(d.getTime())) return "";
      const p = (v) => String(v).padStart(2, "0");
      return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
    }

    function updateWrongCsvButtonState() {
      const btn = document.getElementById("exportWrongCsvDetailBtn");
      const hint = document.getElementById("exportWrongCsvHint");
      if (!btn) return;
      const empty = wrongQuestions.length === 0;
      btn.disabled = empty;
      btn.title = empty ? "暂无错题" : "导出错题本明细 CSV";
      if (hint) hint.classList.toggle("hidden", !empty);
    }

    function exportWrongCsvDetail() {
      if (wrongQuestions.length === 0) {
        showToast("暂无错题", "warn");
        return;
      }
      const qMap = new Map(allQuestions.map((q) => [q.id, q]));
      const rows = [["序号", "科目", "题干", "我的答案", "正确答案", "是否已掌握", "最近一次作答时间", "作答次数"]];
      wrongQuestions.forEach((qid, i) => {
        const q = qMap.get(qid);
        const rec = userProgress[qid] || {};
        const myAnswer = Array.isArray(rec.userAnswer) ? rec.userAnswer.join("") : "";
        const correctAnswer = q && Array.isArray(q.answer) ? q.answer.join("") : "";
        const mastered = rec.answered ? (rec.isCorrect ? "已掌握" : "未掌握") : "";
        rows.push([
          i + 1,
          q ? q.subject : "",
          q ? q.title : "",
          myAnswer,
          correctAnswer,
          mastered,
          formatCsvTime(rec.lastAnsweredAt),
          rec.attempts ? String(rec.attempts) : ""
        ]);
      });

      const now = new Date();
      const p = (v) => String(v).padStart(2, "0");
      downloadCsv(rows, `错题本_${now.getFullYear()}${p(now.getMonth() + 1)}${p(now.getDate())}.csv`);
      showToast(`已导出 ${wrongQuestions.length} 道错题`, "success");
    }

    // 主观题 AI 批改（统一走自建网关，采分点结构化返回）
    function escapeHtmlLocal(s) {
      // P3-1：统一复用 escapeHtml（已补单引号转义），避免两套实现行为不一致
      return escapeHtml(String(s || ""));
    }
    function fillGradeList(ulId, wrapId, arr) {
      const ul = document.getElementById(ulId);
      const wrap = document.getElementById(wrapId);
      if (!ul || !wrap) return;
      ul.innerHTML = "";
      (arr || []).forEach((x) => { const li = document.createElement("li"); li.textContent = x; ul.appendChild(li); });
      wrap.style.display = (arr && arr.length) ? "block" : "none";
    }
    function renderGradeResult(r) {
      const maxScore = r.maxScore || 10;
      document.getElementById("gradeScore").textContent = r.score + " / " + maxScore + " 分";
      const lvEl = document.getElementById("gradeLevel");
      if (lvEl) lvEl.textContent = r.level || "";
      document.getElementById("gradeSummary").textContent = r.summary || "";
      const pts = document.getElementById("gradePoints");
      pts.innerHTML = "";
      (r.pointHits || []).forEach((p) => {
        const row = document.createElement("div");
        row.className = "flex items-start gap-2 p-2 rounded-lg " + (p.hit ? "bg-emerald-500/5" : "bg-rose-500/5");
        row.innerHTML =
          '<span class="font-bold ' + (p.hit ? "text-emerald-600" : "text-rose-500") + '">' + (p.hit ? "✓" : "✕") + "</span>" +
          '<div class="flex-1 min-w-0"><div class="font-medium">' + escapeHtmlLocal(p.point) + '</div>' +
          '<div class="text-xs opacity-70">' + escapeHtmlLocal(p.comment || "") + "</div></div>" +
          '<span class="text-xs font-bold text-blue-600 whitespace-nowrap">' + (p.score || 0) + "分</span>";
        pts.appendChild(row);
      });
      fillGradeList("gradeProblems", "gradeProblemsWrap", r.problems);
      fillGradeList("gradeSuggestions", "gradeSuggWrap", r.suggestions);
      const law = document.getElementById("gradeLaw");
      law.innerHTML = "";
      (r.lawBasis || []).forEach((l) => {
        const s = document.createElement("span");
        s.className = "px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-300 text-xs border border-amber-400/30";
        s.textContent = l;
        law.appendChild(s);
      });
      document.getElementById("gradeLawWrap").style.display = (r.lawBasis && r.lawBasis.length) ? "block" : "none";
    }
    async function gradeSubjectiveAnswer() {
      if (filteredQuestions.length === 0) return;
      const q = filteredQuestions[currentIndex];
  const gradeQid = q.id;   // P4-7：批改结果只回填到发起时的题
      const answer = (document.getElementById("subjectiveInput")?.value || "").trim();
      if (!answer) { showToast("请先输入你的主观分析作答", "warn"); return; }
      // 记录作答
      const rec = userProgress[q.id] || {};
      rec.subjectiveText = answer;
      userProgress[q.id] = rec;
      safeSaveJSON(STORAGE_KEYS.PROGRESS, userProgress);

      const box = document.getElementById("gradeResultBox");
      const gradeBtns = document.querySelectorAll(".grade-subjective-trigger");
      box.classList.remove("hidden");
      document.getElementById("gradeScore").textContent = "批改中…";
      document.getElementById("gradeSummary").textContent = "";
      document.getElementById("gradePoints").innerHTML = "";
      gradeBtns.forEach((b) => { b.disabled = true; });
      // 手机上结果面板位于按钮栏下方，滚动到可见区域让用户立即看到反馈
      box.scrollIntoView({ behavior: "smooth", block: "nearest" });
      const question = q.title || q.question || q.stem || "";
      const reference = q.explanation || q.analysis || "";
      try {
        // 同源 /api/grade 直接返回结构化批改 JSON（服务端已做提取与字段规范化）
        const data = await window.XS_AI.grade(
          { question: question, reference: reference, answer: answer, maxScore: 10 },
          { timeoutMs: 45000 }
        );
        data.maxScore = 10;
        if (filteredQuestions[currentIndex] && filteredQuestions[currentIndex].id === gradeQid) renderGradeResult(data);   // P4-7：切题后只缓存不回填
        // 缓存批改结果：切题回来直接展示，不必重复消耗 AI 接口
        rec.gradeResult = data;
        safeSaveJSON(STORAGE_KEYS.PROGRESS, userProgress);
      } catch (e) {
        document.getElementById("gradeScore").textContent = "失败";
        document.getElementById("gradeSummary").textContent = "AI 批改暂时不可用：" + (e.name === "AbortError" ? "请求超时" : e.message) + "，请稍后重试";
      } finally {
        gradeBtns.forEach((b) => { b.disabled = false; });
      }
    }

    // DeepSeek AI 解析生成（支持真实 API 调用与本地结构化法理拆解兜底）
    // P2-26：请求期间禁用触发按钮并拒绝重入；直连 DeepSeek 20s 超时 abort 后回退本地解析
    let aiExplainInFlight = false;
let aiExplainQid = null;
    const DEEPSEEK_DIRECT_TIMEOUT_MS = 20000;
    async function triggerAiExplain(customFollowup = "") {
      if (filteredQuestions.length === 0) return;
      const __curQ = filteredQuestions[currentIndex]; const __curQid = __curQ ? __curQ.id : null;
  if (aiExplainInFlight && aiExplainQid === __curQid) return;
  aiExplainInFlight = true; aiExplainQid = __curQid;
      const aiBtns = ["askAiExplainBtn", "sendAiFollowupBtn"]
        .map((id) => document.getElementById(id))
        .filter(Boolean)
        .map((el) => ({ el, was: el.disabled }));
      aiBtns.forEach((b) => { b.el.disabled = true; });
      try {
        await runAiExplain(customFollowup);
      } finally {
        aiBtns.forEach((b) => { b.el.disabled = b.was; });
    if (aiExplainQid === __curQid) aiExplainInFlight = false;
      }
    }

    async function runAiExplain(customFollowup = "") {
      const q = filteredQuestions[currentIndex];
      if (!q) return;
  const explainQid = q.id;
  const stillOnQ = () => !!(filteredQuestions[currentIndex] && filteredQuestions[currentIndex].id === explainQid);   // P4-7：结果只回填到原题
      const box = document.getElementById("aiResponseBox");
      const textEl = document.getElementById("aiResponseText");
      box.classList.remove("hidden");
      document.getElementById("explanationBox").classList.remove("hidden");

      let apiKey = "";
      try {
        apiKey = localStorage.getItem(STORAGE_KEYS.DEEPSEEK_KEY) || "";
      } catch (e) {}

      const buildLocalFallback = () =>
        `【本地结构化考点拆解（可在顶部“AI解析”配置 DeepSeek Key 开启实时追问）】\n` +
        `1. 考查核心科目与题型：${q.subject} · ${q.type}\n` +
        `2. 命题人题眼提示：注意审题中的主体关系（如第三人善意/恶意、是否届期、管辖连接点）以及否定词。\n` +
        `3. 核心法条锚点：${(q.lawBasis && q.lawBasis.join("、")) || "详见上方解析条文"}\n` +
        (customFollowup ? `4. 针对你的追问「${customFollowup}」：建议重点比对上方法条构成要件中的但书条款与例外规定。` : "");

      const prompt = customFollowup
        ? `题目：${q.title}\n选项：${JSON.stringify(q.options)}\n标准答案：${q.answer.join("")}`
        : `题目：${q.title}\n选项：${JSON.stringify(q.options)}\n标准答案：${q.answer.join("")}`;

      textEl.textContent = "法考助教正在为你推演法理与要件...";

      // 优先走同源安全后端 /api/ai（密钥仅在服务端，用户无需自备 Key）
      try {
        const __aiAns = await window.XS_AI.explain(prompt, customFollowup); if (stillOnQ()) textEl.textContent = __aiAns;
        return;
      } catch (e) {
        // 后端不可用时继续走下面的回退（自备 Key / 本地结构化拆解）
      }

      // 回退一：用户自备 DeepSeek Key，浏览器直连（P2-26：20s 超时 abort，finally 清定时器）
      let directTimedOut = false;
      if (apiKey) {
        const ctrl = typeof AbortController === "function" ? new AbortController() : null;
        const directTimer = setTimeout(() => {
          directTimedOut = true;
          if (ctrl) { try { ctrl.abort(); } catch (e) {} }
        }, DEEPSEEK_DIRECT_TIMEOUT_MS);
        try {
          const res = await fetch("https://api.deepseek.com/chat/completions", {
            signal: ctrl ? ctrl.signal : undefined,
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${apiKey}`
            },
            body: JSON.stringify({
              model: "deepseek-chat",
              messages: [
                { role: "system", content: "你是一位资深的国家统一法律职业资格考试（法考）辅导名师，擅长提炼题眼、拆解请求权基础与犯罪构成要件。" },
                { role: "user", content: customFollowup ? `${prompt}\n考生追问：${customFollowup}\n请用简明扼要的法考应试语言解答考生的追问。` : `${prompt}\n请从【命题陷阱】【请求权基础/构成要件】【同类题秒杀口诀】三个维度进行精炼拆解。` }
              ],
              temperature: 0.3
            })
          });
          const data = await res.json();
          if (directTimedOut) throw new Error("timeout");   // 无 AbortController 的环境：超时后到达的结果也作废
          if (data.choices && data.choices[0] && data.choices[0].message) {
            if (stillOnQ()) textEl.textContent = data.choices[0].message.content;
            return;
          }
        } catch (err) {
          // 落到本地提示（超时 abort 时 err.name === "AbortError"）
          if (err && err.name === "AbortError") directTimedOut = true;
        } finally {
          clearTimeout(directTimer);
        }
      }

      // 回退二：本地结构化考点拆解
      if (stillOnQ()) textEl.textContent = buildLocalFallback() + (directTimedOut ? "\n（直连超时，已回退本地解析）" : "");
    }

    // =========================================================================
    // 10. 主题切换、模式切换与手势/快捷键绑定
    // =========================================================================
    const THEME_CYCLE = [
      { key: "light", icon: '<svg class="nav-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>', label: "日间" },
      { key: "dark", icon: '<svg class="nav-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>', label: "暗黑" },
      { key: "sepia", icon: '<svg class="nav-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M9 13h6M9 17h6"/></svg>', label: "羊皮纸" }
    ];
    let currentThemeKey = "light";

    function applyTheme(themeKey) {
      const found = THEME_CYCLE.find((t) => t.key === themeKey) || THEME_CYCLE[0];
      currentThemeKey = found.key;
      document.documentElement.setAttribute("data-theme", found.key);
      document.getElementById("themeIcon").innerHTML = found.icon;
      document.getElementById("themeLabel").textContent = found.label;
      try {
        localStorage.setItem(STORAGE_KEYS.THEME, found.key);
      } catch (e) {}
    }

    function setStudyMode(mode) {
      studyMode = mode;
      document.body.classList.toggle("focus-mode", mode !== "practice");
      const pBtn = document.getElementById("modePracticeBtn");
      const rBtn = document.getElementById("modeReciteBtn");
      const eBtn = document.getElementById("modeExamBtn");
      const timerBox = document.getElementById("examTimerBox");
      const dockReciteText = document.getElementById("dockReciteText");

      [pBtn, rBtn, eBtn].forEach((b) => {
        b.className = "px-3 py-1 rounded-md text-xs font-semibold transition text-blue-200 hover:text-white";
      });
      // P2-30：同步模式按钮的 aria-pressed（当前模式 = true）
      pBtn.setAttribute("aria-pressed", String(mode === "practice"));
      rBtn.setAttribute("aria-pressed", String(mode === "recite"));
      eBtn.setAttribute("aria-pressed", String(mode === "exam"));

      if (mode === "practice") {
        pBtn.className = "px-3 py-1 rounded-md text-xs font-semibold transition bg-blue-500 text-white";
        dockReciteText.textContent = "背题";
        timerBox.classList.add("hidden");
        timerBox.classList.remove("flex");
      } else if (mode === "recite") {
        rBtn.className = "px-3 py-1 rounded-md text-xs font-semibold transition bg-amber-400 text-slate-950";
        dockReciteText.textContent = "退背题";
        timerBox.classList.add("hidden");
        timerBox.classList.remove("flex");
        showToast("已开启背题模式：直接展开答案与法条解析", "info");
      } else if (mode === "exam") {
        eBtn.className = "px-3 py-1 rounded-md text-xs font-semibold transition bg-rose-500 text-white";
        dockReciteText.textContent = "背题";
        timerBox.classList.remove("hidden");
        timerBox.classList.add("flex");
        startExamTimer();
        showToast("模拟计时已启动，加油！", "info");
      }
      renderQuestion(currentIndex);
    }

    function startExamTimer() {
      if (examInterval) clearInterval(examInterval);
      examInterval = setInterval(() => {
        examSeconds++;
        const mins = String(Math.floor(examSeconds / 60)).padStart(2, "0");
        const secs = String(examSeconds % 60).padStart(2, "0");
        document.getElementById("examTimerText").textContent = `${mins}:${secs}`;
      }, 1000);
    }

    // 主题切换：从按钮位置扩散的圆形揭示（支持降级与减弱动效）
    function switchThemeWithReveal(nextTheme, event) {
      const reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (!document.startViewTransition || reduceMotion) {
        applyTheme(nextTheme.key);
        return;
      }
      const rect = event && event.currentTarget ? event.currentTarget.getBoundingClientRect() : null;
      const x = event && Number.isFinite(event.clientX) && event.clientX > 0 ? event.clientX : rect ? rect.left + rect.width / 2 : window.innerWidth - 40;
      const y = event && Number.isFinite(event.clientY) && event.clientY > 0 ? event.clientY : rect ? rect.top + rect.height / 2 : 40;
      const radius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));
      const transition = document.startViewTransition(() => applyTheme(nextTheme.key));
      transition.ready
        .then(() => {
          document.documentElement.animate(
            { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
            { duration: 520, easing: "cubic-bezier(.22,1,.36,1)", pseudoElement: "::view-transition-new(root)" }
          );
        })
        .catch(() => {});
    }

    // Hero 桌面倒计时环：距下一次法考客观题开考（P2-22：9 月第三个周六 09:00 动态推算）
    function renderHeroCountdown() {
      const daysEl = document.getElementById("heroCdDays");
      const ringEl = document.getElementById("heroCdRing");
      if (!daysEl || !ringEl) return;
      const nextExam = getNextExamDate();
      const target = nextExam.getTime();
      const cycleStart = getPrevExamDate(nextExam).getTime();
      const examYear = nextExam.getFullYear();
      const kickerEl = document.getElementById("heroKickerYear");
      if (kickerEl) kickerEl.textContent = `LAW EXAM · ${examYear}`;
      const capEl = document.getElementById("heroCdCap");
      if (capEl) capEl.textContent = `${examYear} · ${nextExam.getMonth() + 1} · ${nextExam.getDate()}`;
      const cdBox = document.getElementById("heroCountdown");
      if (cdBox) cdBox.title = `距离 ${examYear} 年法考客观题考试（${examYear}-${nextExam.getMonth() + 1}-${nextExam.getDate()} 09:00，以官方公告为准）`;
      const now = Date.now();
      const days = Math.max(0, Math.ceil((target - now) / 86400000));
      const pct = Math.max(0, Math.min(100, ((now - cycleStart) / (target - cycleStart)) * 100));
      daysEl.textContent = String(days);
      ringEl.style.setProperty("--cd-p", pct.toFixed(2));
    }

    // 绑定所有事件与初始化
    async function initApp() {
      // 1. 从 IndexedDB 恢复任何被清理的 LocalStorage 数据
      // 兼容原版旧键名 (fakao_user_data / fk_wrong) 自动迁移合并
      try {
        if (!localStorage.getItem(STORAGE_KEYS.PROGRESS) && localStorage.getItem("fakao_user_data")) {
          localStorage.setItem(STORAGE_KEYS.PROGRESS, localStorage.getItem("fakao_user_data"));
        }
        if (!localStorage.getItem(STORAGE_KEYS.WRONG) && localStorage.getItem("fk_wrong")) {
          localStorage.setItem(STORAGE_KEYS.WRONG, localStorage.getItem("fk_wrong"));
        }
      } catch (e) {}
      const keysToSync = Object.values(STORAGE_KEYS);
    // P4-3：回写 IDB 改为后台异步（不阻塞启动）；仅当 localStorage 缺数据时才等待 IDB 恢复（open 已带 1.5s 超时）
    const idbRestoreTasks = [];
    for (const k of keysToSync) {
      try {
        const localVal = localStorage.getItem(k);
        if (localVal) {
          IDBEngine.write(k, localVal).catch(() => {});
        } else {
          idbRestoreTasks.push(
            IDBEngine.read(k).then((idbVal) => { if (idbVal) localStorage.setItem(k, idbVal); }).catch(() => {})
          );
        }
      } catch (e) {}
    }
    if (idbRestoreTasks.length) {
      await Promise.race([Promise.all(idbRestoreTasks), new Promise((r) => setTimeout(r, 2000))]);
    }

    // 重新加载恢复后的数据
      userProgress = safeLoadJSON(STORAGE_KEYS.PROGRESS, userProgress);
      wrongQuestions = safeLoadJSON(STORAGE_KEYS.WRONG, wrongQuestions);
      favorites = safeLoadJSON(STORAGE_KEYS.FAVORITES, favorites);
      userNotes = safeLoadJSON(STORAGE_KEYS.NOTES, userNotes);
      wrongReasons = safeLoadJSON(STORAGE_KEYS.WRONG_REASONS, wrongReasons);

      // 2. 初始化主题
      try {
        const savedTheme = localStorage.getItem(STORAGE_KEYS.THEME) || "light";
        applyTheme(savedTheme);
      } catch (e) {
        applyTheme("light");
      }

      // 3. 渲染科目栏与初始题目
      // P2-15：恢复上次科目；题号等真实题库就绪后由 restoreLastPosOnce() 一次性恢复
      try {
        const savedSubject = localStorage.getItem(LAST_SUBJECT_KEY);
        if (savedSubject && SUBJECT_LIST.some((s) => s.key === savedSubject)) {
          currentSubject = savedSubject;
          const pos = readLastPos();
          if (pos && pos.subject === savedSubject) lastPosPending = pos;
        }
      } catch (e) {}
      // P2-28：题型筛选只允许题库实际存在的取值（已移除「不定项」，题库 0 题）；
      // 异常值回落「全部题型」，并同步下拉框（防浏览器表单恢复出与状态不一致的旧值）
      const VALID_TYPE_FILTERS = ["ALL", "单选", "多选", "主观题"];
      if (!VALID_TYPE_FILTERS.includes(currentTypeFilter)) currentTypeFilter = "ALL";
      try {
        const typeSel = document.getElementById("typeFilterSelect");
        if (typeSel) typeSel.value = currentTypeFilter;
      } catch (e) {}
      renderSubjectBar();
      applyFilters(true);
      // P2-5：读取 ?go=；此处只记下意图，等真实题库就绪再切（applyPendingGo），避免被初始视图覆盖或在兜底题上算空
      try {
        const go = new URLSearchParams(location.search).get("go");
        if (go !== null && Object.prototype.hasOwnProperty.call(GO_SHORTCUTS, go)) {
          pendingGo = GO_SHORTCUTS[go];
          pendingGoBase = currentSubject;
        } else if (go !== null) {
          stripGoParam();   // 未知取值直接清掉
        }
      } catch (e) {}
      // 首屏已完成真实渲染：解除启动期隐藏（display:none → 显示不产生 layout-shift），
      // 并触发一次 resize，让依赖元素尺寸的装饰 canvas 重新计算尺寸。
      document.documentElement.classList.remove("fk-booting");
      requestAnimationFrame(function(){ try{ window.dispatchEvent(new Event("resize")); }catch(e){} });

      // 4. 尝试探测同目录下的完整题库 ./questions/index.json
      // P2-5：加载流程结束（含失败 / 离线 / 非 http 环境）后兜底执行一次快捷方式跳转
      Promise.resolve()
        .then(() => tryLoadExternalRepoData())
        .catch(() => {})
        .then(() => applyPendingGo(true));

      // 5. 绑定顶部与模式切换按钮
      document.getElementById("themeToggleBtn").addEventListener("click", (event) => {
        const idx = THEME_CYCLE.findIndex((t) => t.key === currentThemeKey);
        const next = THEME_CYCLE[(idx + 1) % THEME_CYCLE.length];
        switchThemeWithReveal(next, event);
        showToast(`已切换至${next.label}模式`, "info");
      });

      renderHeroCountdown();
      setInterval(renderHeroCountdown, 60000);

      document.getElementById("modePracticeBtn").addEventListener("click", () => setStudyMode("practice"));
      document.getElementById("modeReciteBtn").addEventListener("click", () => setStudyMode("recite"));
      document.getElementById("modeExamBtn").addEventListener("click", () => { if (window.__openExam) window.__openExam(); else setStudyMode("exam"); });

      document.getElementById("examResetTimerBtn").addEventListener("click", () => {
        examSeconds = 0;
        document.getElementById("examTimerText").textContent = "00:00";
      });

      document.getElementById("toggleHighlightBtn").addEventListener("click", () => {
        isKeywordHighlight = !isKeywordHighlight;
        const hb = document.getElementById("toggleHighlightBtn");
        hb.classList.toggle("is-on", isKeywordHighlight);
        hb.classList.toggle("is-off", !isKeywordHighlight);
        hb.setAttribute("aria-pressed", String(isKeywordHighlight));
        document.getElementById("highlightStateText").textContent = isKeywordHighlight ? "开" : "关";
  saveSettings({ keywordHighlight: isKeywordHighlight });
        renderQuestion(currentIndex);
      });

      document.getElementById("toggleInstantCheckBtn").addEventListener("click", () => {
        isInstantSingleCheck = !isInstantSingleCheck;
        const ib = document.getElementById("toggleInstantCheckBtn");
        ib.classList.toggle("is-on", isInstantSingleCheck);
        ib.classList.toggle("is-off", !isInstantSingleCheck);
        ib.setAttribute("aria-pressed", String(isInstantSingleCheck));
        document.getElementById("instantCheckText").textContent = isInstantSingleCheck ? "开" : "关";
  saveSettings({ instantCheck: isInstantSingleCheck });
      });

      // 统计卡片快捷筛选
      document.getElementById("quickFilterWrongBtn").addEventListener("click", () => {
        wrongPracticeIds = null;
        currentSubject = "错题重做";
        renderSubjectBar();
        applyFilters(true);
      });
      document.getElementById("quickFilterFavBtn").addEventListener("click", () => {
        currentSubject = "我的收藏";
        renderSubjectBar();
        applyFilters(true);
      });
      document.getElementById("quickFilterReviewBtn").addEventListener("click", () => {
        currentSubject = "智能复习";
        renderSubjectBar();
        applyFilters(true);
      });

      // 题型、难度、乱序、搜索
      document.getElementById("typeFilterSelect").addEventListener("change", (e) => {
        currentTypeFilter = e.target.value;
        applyFilters(true);
      });
      document.getElementById("diffFilterSelect").addEventListener("change", (e) => {
        currentDiffFilter = e.target.value;
        applyFilters(true);
      });
      document.getElementById("shuffleQuestionsBtn").addEventListener("click", () => {
        // P2-16：Fisher-Yates 洗牌（原 sort(random-0.5) 分布不均匀）
        for (let i = filteredQuestions.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          const t = filteredQuestions[i];
          filteredQuestions[i] = filteredQuestions[j];
          filteredQuestions[j] = t;
        }
        currentIndex = 0;
        renderQuestion(0);
        showToast("已随机打乱当前题库顺序", "info");
      });

      const searchInput = document.getElementById("searchInput");
      const clearSearchBtn = document.getElementById("clearSearchBtn");
      // P2-6：搜索 250ms 防抖；中文输入法组字期间（composition）不触发重筛
      let searchTimer = null;
      let searchComposing = false;
      const runSearch = () => {
        clearSearchBtn.classList.toggle("hidden", !searchQuery);
        applyFilters(true);
    // P4-4：未全量加载时提示搜索范围，避免误以为题库缺失
    try {
      const __kw = searchQuery.trim();
      if (__kw && loadedSubjects.size < subjectNames.length) {
        setSubtitle(`搜索「${__kw}」· 仅在已加载的 ${loadedSubjects.size}/${subjectNames.length} 个科目中匹配`);
      }
    } catch (e) {}
      };
      searchInput.addEventListener("compositionstart", () => { searchComposing = true; });
      searchInput.addEventListener("compositionend", (e) => {
        searchComposing = false;
        searchQuery = e.target.value;
        clearTimeout(searchTimer);
        searchTimer = setTimeout(runSearch, 0);
      });
      searchInput.addEventListener("input", (e) => {
        searchQuery = e.target.value;
        if (searchComposing) return;
        clearTimeout(searchTimer);
        searchTimer = setTimeout(runSearch, 250);
      });
      clearSearchBtn.addEventListener("click", () => {
        clearTimeout(searchTimer);
        searchQuery = "";
        searchInput.value = "";
        clearSearchBtn.classList.add("hidden");
        applyFilters(true);
      });

      // 题目区按钮
      document.getElementById("submitAnswerBtn").addEventListener("click", submitAnswer);
      document.getElementById("toggleAnalysisBtn").addEventListener("click", () => {
        const expBox = document.getElementById("explanationBox");
        if (expBox.classList.contains("hidden")) {
          const q = filteredQuestions[currentIndex];
          if (q) populateExplanation(q, userProgress[q.id]);
          expBox.classList.remove("hidden");
        } else {
          expBox.classList.add("hidden");
        }
      });

      document.getElementById("favToggleBtn").addEventListener("click", toggleFavoriteCurrent);
document.getElementById("redoQuestionBtn") && document.getElementById("redoQuestionBtn").addEventListener("click", () => {
  const q = filteredQuestions[currentIndex];
  if (!q) return;
  if (userProgress[q.id]) { delete userProgress[q.id]; safeSaveJSON(STORAGE_KEYS.PROGRESS, userProgress); }
  currentSelectedOptions.clear();
  showToast("已进入本题重做，可重新作答", "info");
  renderQuestion(currentIndex);
});
      document.getElementById("dockFavBtn").addEventListener("click", toggleFavoriteCurrent);

      document.getElementById("removeWrongBtn").addEventListener("click", () => {
        const q = filteredQuestions[currentIndex];
        if (!q) return;
        wrongQuestions = wrongQuestions.filter((id) => id !== q.id);
        safeSaveJSON(STORAGE_KEYS.WRONG, wrongQuestions);
        renderQuestion(currentIndex);
        updateStats();
        renderWrongList();
        showToast("已将该题移出错题本", "info");
      });

      document.getElementById("wrongReasonSelect").addEventListener("change", (e) => {
        const q = filteredQuestions[currentIndex];
        if (!q) return;
        wrongReasons[q.id] = e.target.value;
        safeSaveJSON(STORAGE_KEYS.WRONG_REASONS, wrongReasons);
        renderWrongList();
        showToast("错因标签已保存", "success");
      });

      // 错题本筛选（科目 / 错因 / 清除 / 按筛选重做）
      document.getElementById("wrongFilterSubject").addEventListener("change", (e) => {
        wrongFilterSubject = e.target.value;
        wrongListPage = 0;   // P2-8：筛选变化回到第 1 页
        renderWrongList();
      });
      document.getElementById("wrongFilterReason").addEventListener("change", (e) => {
        wrongFilterReason = e.target.value;
        wrongListPage = 0;
        renderWrongList();
      });
      document.getElementById("wrongFilterResetBtn").addEventListener("click", () => {
        wrongFilterSubject = "ALL";
        wrongFilterReason = "ALL";
        wrongPracticeIds = null;
        wrongListPage = 0;
        document.getElementById("wrongFilterSubject").value = "ALL";
        document.getElementById("wrongFilterReason").value = "ALL";
        renderWrongList();
      });
      document.getElementById("wrongFilterPracticeBtn").addEventListener("click", () => {
        const ids = getFilteredWrongIds();
        if (!ids.length) return;
        wrongPracticeIds = ids;
        currentSubject = "错题重做";
        currentTypeFilter = "ALL";
        currentDiffFilter = "ALL";
        searchQuery = "";
        const t = document.getElementById("typeFilterSelect");
        const d = document.getElementById("diffFilterSelect");
        const s = document.getElementById("searchInput");
        if (t) t.value = "ALL";
        if (d) d.value = "ALL";
        if (s) s.value = "";
        renderSubjectBar();
        applyFilters(true);
        window.scrollTo({ top: 0, behavior: "smooth" });
        showToast("已载入 " + ids.length + " 道筛选错题，点科目栏「错题重做」可恢复全部", "success");
      });

      document.getElementById("autoRemoveWrongCheckbox").addEventListener("change", (e) => {
        autoRemoveWrong = e.target.checked;
  saveSettings({ autoRemoveWrong: autoRemoveWrong });
      });

      // 随手笔记自动保存（P2-12：500ms 防抖，失焦立即落盘，避免逐字双写）
      const noteInput = document.getElementById("questionNoteInput");
      let noteSaveTimer = null;
      let notePending = null;
      const commitNote = () => {
        if (!notePending) return;
        const pend = notePending;
        notePending = null;
        try {
          userNotes[pend.qid] = pend.text;
          safeSaveJSON(STORAGE_KEYS.NOTES, userNotes);
          document.getElementById("noteSavedStatus").textContent = "✓ 已自动保存至本地与 IndexedDB";
        } catch (e) {}
      };
      noteInput.addEventListener("input", () => {
        if (filteredQuestions.length === 0) return;
        const q = filteredQuestions[currentIndex];
        notePending = { qid: q.id, text: noteInput.value };
        document.getElementById("noteSavedStatus").textContent = "编辑中…";
        clearTimeout(noteSaveTimer);
        noteSaveTimer = setTimeout(commitNote, 500);
      });
      noteInput.addEventListener("blur", () => { clearTimeout(noteSaveTimer); commitNote(); });

      document.getElementById("insertNoteTemplateBtn").addEventListener("click", () => {
        if (filteredQuestions.length === 0) return;
        const q = filteredQuestions[currentIndex];
        const tpl = `【核心考点】\n【易错陷阱】\n【法条口诀】`;
        noteInput.value = noteInput.value ? noteInput.value + "\n" + tpl : tpl;
        userNotes[q.id] = noteInput.value;
        safeSaveJSON(STORAGE_KEYS.NOTES, userNotes);
        document.getElementById("noteSavedStatus").textContent = "✓ 已插入模板并保存";
        noteInput.focus();
      });

      // 底部快捷栏
      document.getElementById("dockPrevBtn").addEventListener("click", prevQuestion);
      document.getElementById("dockNextBtn").addEventListener("click", nextQuestion);
      document.getElementById("dockSheetBtn").addEventListener("click", openAnswerSheetModal);
      document.getElementById("dockReciteBtn").addEventListener("click", () => {
        setStudyMode(studyMode === "recite" ? "practice" : "recite");
      });

      // 答题卡弹窗控制（分页 + 题号跳转）
      document.getElementById("closeSheetModalBtn").addEventListener("click", () => {
        document.getElementById("answerSheetModal").classList.add("hidden");
      });
      document.getElementById("answerSheetGrid").addEventListener("click", (e) => {
        const btn = e.target.closest("button[data-idx]");
        if (!btn) return;
        jumpToQuestion(Number(btn.dataset.idx));
        document.getElementById("answerSheetModal").classList.add("hidden");
      });
      document.getElementById("sheetPrevBtn").addEventListener("click", () => goToSheetPage(sheetPage - 1));
      document.getElementById("sheetNextBtn").addEventListener("click", () => goToSheetPage(sheetPage + 1));
      const submitSheetJump = () => {
        const input = document.getElementById("sheetJumpInput");
        const n = Number.parseInt(input.value, 10);
        if (!Number.isFinite(n) || n < 1 || n > filteredQuestions.length) {
          showToast(`请输入 1 - ${filteredQuestions.length} 之间的题号`, "warn");
          return;
        }
        jumpToQuestion(n - 1);
        document.getElementById("answerSheetModal").classList.add("hidden");
      };
      document.getElementById("sheetJumpBtn").addEventListener("click", submitSheetJump);
      document.getElementById("sheetJumpInput").addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          submitSheetJump();
        }
      });
      document.getElementById("jumpFirstUnansweredBtn").addEventListener("click", () => {
        const idx = filteredQuestions.findIndex((q) => !userProgress[q.id] || !userProgress[q.id].answered);
        if (idx !== -1) {
          jumpToQuestion(idx);
          document.getElementById("answerSheetModal").classList.add("hidden");
        } else {
          showToast("当前筛选列表所有题目均已作答！", "success");
        }
      });

      // 知识点与笔记中心弹窗
      document.getElementById("openKnowledgeBtn").addEventListener("click", () => {
        try { if (window.__loadKnowledgeBase) window.__loadKnowledgeBase(); } catch (e) {}
        knowledgePage = 0;
        setKnowledgeTab("knowledge");
        renderKnowledgeAndNotesModal();
        document.getElementById("knowledgeModal").classList.remove("hidden");
      });
      document.getElementById("closeKnowledgeModalBtn").addEventListener("click", () => {
        document.getElementById("knowledgeModal").classList.add("hidden");
      });
      document.getElementById("tabKnowledgeCardsBtn").addEventListener("click", () => setKnowledgeTab("knowledge"));
      document.getElementById("tabMyNotesBtn").addEventListener("click", () => {
        renderMyNotesList();
        setKnowledgeTab("notes");
      });

      // 知识点：科目筛选 / 搜索 / 折叠 / 分页 / 笔记跳转
      document.getElementById("kSubjectChips").addEventListener("click", (e) => {
        const chip = e.target.closest(".k-chip");
        if (!chip) return;
        knowledgeSubject = chip.dataset.subject || "全部";
        knowledgePage = 0;
        renderKnowledgeChips();
        renderKnowledgeList();
      });
      const knowledgeSearch = document.getElementById("knowledgeSearchInput");
      knowledgeSearch.addEventListener("input", () => {
        knowledgeQuery = knowledgeSearch.value;
        knowledgePage = 0;
        renderKnowledgeList();
      });
      document.getElementById("knowledgeSearchClear").addEventListener("click", () => {
        knowledgeSearch.value = "";
        knowledgeQuery = "";
        knowledgePage = 0;
        renderKnowledgeList();
        knowledgeSearch.focus();
      });
      document.getElementById("kResetFilterBtn").addEventListener("click", () => {
        knowledgeSubject = "全部";
        knowledgeQuery = "";
        knowledgeSearch.value = "";
        knowledgePage = 0;
        renderKnowledgeChips();
        renderKnowledgeList();
      });
      document.getElementById("knowledgeListContainer").addEventListener("click", (e) => {
        const more = e.target.closest(".k-more");
        if (more) {
          const card = more.closest(".k-card");
          const body = card.querySelector(".k-body");
          const open = card.classList.toggle("is-open");
          body.classList.toggle("is-clamped", !open);
          more.setAttribute("aria-expanded", String(open));
          more.querySelector("span").textContent = open ? "收起" : "展开全文";
          return;
        }
        if (e.target.closest("#kEmptyResetBtn")) {
          knowledgeSubject = "全部";
          knowledgeQuery = "";
          knowledgeSearch.value = "";
          knowledgePage = 0;
          renderKnowledgeChips();
          renderKnowledgeList();
        }
      });
      document.getElementById("kPrevBtn").addEventListener("click", () => {
        knowledgePage = Math.max(0, knowledgePage - 1);
        renderKnowledgeList();
      });
      document.getElementById("kNextBtn").addEventListener("click", () => {
        knowledgePage++;
        renderKnowledgeList();
      });
      document.getElementById("myNotesListContainer").addEventListener("click", (e) => {
        const btn = e.target.closest(".jump-note-btn");
        if (!btn) return;
        jumpToQuestionById(btn.dataset.qid);
      });

      // AI 追问与配置
      document.getElementById("askAiExplainBtn").addEventListener("click", () => triggerAiExplain(""));
      document.getElementById("sendAiFollowupBtn").addEventListener("click", () => {
        const val = document.getElementById("aiFollowupInput").value.trim();
        if (val) triggerAiExplain(val);
      });
      document.getElementById("closeAiResponseBtn").addEventListener("click", () => {
        document.getElementById("aiResponseBox").classList.add("hidden");
      });
      // 主观题 AI 批改
      const gradeBtnEl = document.getElementById("gradeSubjectiveBtn");
      if (gradeBtnEl) gradeBtnEl.addEventListener("click", gradeSubjectiveAnswer);
      const gradeInlineEl = document.getElementById("gradeSubjectiveInlineBtn");
      if (gradeInlineEl) gradeInlineEl.addEventListener("click", gradeSubjectiveAnswer);
      const closeGradeEl = document.getElementById("closeGradeBtn");
      if (closeGradeEl) closeGradeEl.addEventListener("click", () => {
        document.getElementById("gradeResultBox").classList.add("hidden");
      });

      document.getElementById("openAiModalBtn").addEventListener("click", () => {
        try {
          document.getElementById("deepseekApiKeyInput").value = localStorage.getItem(STORAGE_KEYS.DEEPSEEK_KEY) || "";
          const fm = document.getElementById("frugalModeSelect");
          if (fm) fm.value = readFrugalPref();
        } catch (e) {}
        document.getElementById("aiConfigModal").classList.remove("hidden");
      });
      document.getElementById("closeAiModalBtn").addEventListener("click", () => {
        document.getElementById("aiConfigModal").classList.add("hidden");
      });
      document.getElementById("saveAiConfigBtn").addEventListener("click", () => {
        const key = document.getElementById("deepseekApiKeyInput").value.trim();
        try {
          localStorage.setItem(STORAGE_KEYS.DEEPSEEK_KEY, key);
        } catch (e) {}
        try {
          const fm = document.getElementById("frugalModeSelect");
          if (fm) localStorage.setItem("fk_frugal_mode", fm.value);
        } catch (e) {}
        document.getElementById("aiConfigModal").classList.add("hidden");
        showToast("设置已保存（省流量模式下次打开生效）", "success");
      });

      // 备份与同步中心弹窗
      document.getElementById("openSyncModalBtn").addEventListener("click", () => {
        const gistCfg = safeLoadJSON(STORAGE_KEYS.GIST, { token: "", gistId: "" });
        document.getElementById("gistTokenInput").value = gistCfg.token || "";
        document.getElementById("gistIdInput").value = gistCfg.gistId || "";
        document.getElementById("syncModal").classList.remove("hidden");
      });
      document.getElementById("closeSyncModalBtn").addEventListener("click", () => {
        document.getElementById("syncModal").classList.add("hidden");
      });
      // 学习报告看板
      const openReportEl = document.getElementById("openReportModalBtn");
      if (openReportEl) openReportEl.addEventListener("click", openStudyReport);
      const closeReportEl = document.getElementById("closeReportModalBtn");
      if (closeReportEl) closeReportEl.addEventListener("click", () => {
        document.getElementById("reportModal").classList.add("hidden");
      });
      // 语音朗读
      const speakEl = document.getElementById("speakBtn");
      if (speakEl) speakEl.addEventListener("click", speakCurrentQuestion);
      document.getElementById("exportFullJsonBtn").addEventListener("click", exportFullBackupJSON);
      document.getElementById("exportWrongCsvBtn").addEventListener("click", exportWrongAndNotesCSV);
      document.getElementById("exportWrongCsvDetailBtn").addEventListener("click", exportWrongCsvDetail);
      updateWrongCsvButtonState();

      document.getElementById("importJsonFileInput").addEventListener("change", (e) => {
        const file = e.target.files && e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
          try {
            const parsed = JSON.parse(String(reader.result));
            restoreBackupPayload(parsed);
          } catch (err) {
            showToast("解析 JSON 备份文件失败", "error");
          }
        };
        reader.readAsText(file);
      });

      document.getElementById("restoreFromPasteBtn").addEventListener("click", () => {
        const raw = document.getElementById("pasteJsonBackupInput").value.trim();
        if (!raw) {
          showToast("请先粘贴 JSON 备份文本", "warn");
          return;
        }
        try {
          restoreBackupPayload(JSON.parse(raw));
        } catch (e) {
          showToast("JSON 格式有误，无法解析", "error");
        }
      });

      document.getElementById("clearAllProgressBtn").addEventListener("click", () => {
        const snapshot = {
          fakao_progress: userProgress,
          fakao_wrong_questions: wrongQuestions,
          fakao_favorites_v1: favorites,
          fakao_notes_v1: userNotes,
          fakao_wrong_reasons_v1: wrongReasons
        };
        const affected =
          Object.keys(userProgress || {}).length +
          (wrongQuestions || []).length +
          Object.keys(favorites || {}).length +
          Object.keys(userNotes || {}).length +
          Object.keys(wrongReasons || {}).length;
        if (!window.confirm("将清空本机全部答题记录、错题、收藏与笔记（约 " + affected + " 项），且无法撤销。\n\n清空前会自动留一份快照，确定继续？")) {
          return;
        }
        try {
          localStorage.setItem("fakao_auto_snapshot_before_clear", JSON.stringify({ at: new Date().toISOString(), data: snapshot }));
        } catch (e) {}
        resetSubjectiveDraftState();   // 先断掉草稿写回，否则清空后旧文本会被写回
        userProgress = {};
        wrongQuestions = [];
        favorites = {};
        userNotes = {};
        wrongReasons = {};
        safeSaveJSON(STORAGE_KEYS.PROGRESS, userProgress);
        safeSaveJSON(STORAGE_KEYS.WRONG, wrongQuestions);
        safeSaveJSON(STORAGE_KEYS.FAVORITES, favorites);
        safeSaveJSON(STORAGE_KEYS.NOTES, userNotes);
        safeSaveJSON(STORAGE_KEYS.WRONG_REASONS, wrongReasons);
        renderQuestion(currentIndex);
        updateStats();
        renderWrongList();
        showToast("已清空并重置本地做题记录（清空前快照已保存）", "info");
      });

      // GitHub Gist 云同步操作
      document.getElementById("saveGistConfigBtn").addEventListener("click", () => {
        const cfg = {
          token: document.getElementById("gistTokenInput").value.trim(),
          gistId: document.getElementById("gistIdInput").value.trim()
        };
        safeSaveJSON(STORAGE_KEYS.GIST, cfg);
        document.getElementById("gistSyncStatusText").textContent = "✓ Gist 配置已保存至本地";
        showToast("Gist 配置已保存", "success");
      });

  document.getElementById("pushToGistBtn").addEventListener("click", async () => {
    const token = document.getElementById("gistTokenInput").value.trim();
    let gistId = document.getElementById("gistIdInput").value.trim();
    const statusEl = document.getElementById("gistSyncStatusText");
    if (!token) { showToast("请先填写 GitHub Personal Access Token", "warn"); return; }
    const ghHeaders = { Authorization: `token ${token}`, Accept: "application/vnd.github.v3+json" };
    statusEl.textContent = "正在同步至 GitHub Gist...";
    try {
      // P4-12：上传前先拉取云端并「较新优先」合并，避免本机旧数据整体覆盖另一设备的新进度
      if (gistId) {
        try {
          const pullRes = await fetch(`https://api.github.com/gists/${gistId}`, { headers: ghHeaders });
          if (pullRes.ok) {
            const pd = await pullRes.json();
            const pf = pd.files && (pd.files["fakao_sync_data.json"] || Object.values(pd.files)[0]);
            let pcontent = pf && pf.content;
            if (pf && pf.truncated && pf.raw_url) {
              const rr = await fetch(pf.raw_url, { headers: ghHeaders });
              if (rr.ok) pcontent = await rr.text();
            }
            if (pcontent) restoreBackupPayload(JSON.parse(pcontent), { strategy: "newer" });
          }
        } catch (e) {}
      }
      // P4-12：去缩进 + 排除体积大的 gradeResult，控制文件 < 1MB 避免被 GitHub 截断
      const __cleanProgress = {};
      try {
        for (const k of Object.keys(userProgress)) {
          const rec = userProgress[k];
          if (rec && typeof rec === "object") { const { gradeResult, ...rest } = rec; __cleanProgress[k] = rest; }
          else __cleanProgress[k] = rec;
        }
      } catch (e) {}
      const contentStr = JSON.stringify({
        fakao_progress: __cleanProgress,
        fakao_wrong_questions: wrongQuestions,
        fakao_favorites_v1: favorites,
        fakao_notes_v1: userNotes,
        fakao_wrong_reasons_v1: wrongReasons,
        updatedAt: new Date().toISOString()
      });
      const url = gistId ? `https://api.github.com/gists/${gistId}` : "https://api.github.com/gists";
      const res = await fetch(url, {
        method: gistId ? "PATCH" : "POST",
        headers: { ...ghHeaders, "Content-Type": "application/json" },
        body: JSON.stringify({ description: "法考智练 云同步备份", public: false, files: { "fakao_sync_data.json": { content: contentStr } } })
      });
      const data = await res.json();
      if (res.ok && data.id) {
        gistId = data.id;
        document.getElementById("gistIdInput").value = gistId;
        safeSaveJSON(STORAGE_KEYS.GIST, { token, gistId });
        statusEl.textContent = `同步成功！Gist ID: ${gistId}`;
        showToast("已成功上传备份至 GitHub Gist", "success");
      } else {
        statusEl.textContent = "上传失败：" + (data.message || res.status);
      }
    } catch (err) {
      statusEl.textContent = "网络请求失败，请检查 Token 权限与网络连接";
    }
  });

  document.getElementById("pullFromGistBtn").addEventListener("click", async () => {
    const token = document.getElementById("gistTokenInput").value.trim();
    const gistId = document.getElementById("gistIdInput").value.trim();
    const statusEl = document.getElementById("gistSyncStatusText");
    if (!token || !gistId) { showToast("拉取进度需要同时填写 Token 和 Gist ID", "warn"); return; }
    statusEl.textContent = "正在从 Gist 拉取进度...";
    try {
      const res = await fetch(`https://api.github.com/gists/${gistId}`, {
        headers: { Authorization: `token ${token}`, Accept: "application/vnd.github.v3+json" }
      });
      // P4-12：按状态码分别提示，不再把 401 等一律说成「未找到」
      if (!res.ok) {
        if (res.status === 401) statusEl.textContent = "Token 无效或权限不足（401）";
        else if (res.status === 404) statusEl.textContent = "未找到该 Gist（404），请检查 Gist ID 与 Token 权限";
        else statusEl.textContent = "拉取失败：" + res.status;
        return;
      }
      const data = await res.json();
      const fileObj = data.files && (data.files["fakao_sync_data.json"] || Object.values(data.files)[0]);
      let content = fileObj && fileObj.content;
      // P4-12：Gist 超过 1MB 会返回 truncated，此时改从 raw_url 拉完整内容
      if (fileObj && fileObj.truncated && fileObj.raw_url) {
        const rawRes = await fetch(fileObj.raw_url, { headers: { Authorization: `token ${token}` } });
        if (!rawRes.ok) { statusEl.textContent = "拉取完整备份失败（" + rawRes.status + "）"; return; }
        content = await rawRes.text();
      }
      if (content) {
        const r = restoreBackupPayload(JSON.parse(content), { strategy: "newer" });
        if (r && r.ok) {
          statusEl.textContent = "已从 Gist 合并最新刷题进度（较新优先）！" + (r.notesKept > 0 ? "（笔记保留本机，如需覆盖请用备份导入）" : "");
        } else {
          statusEl.textContent = "云端备份结构不合法，未导入";
        }
      } else {
        statusEl.textContent = "未在目标 Gist 中找到备份数据";
      }
    } catch (err) {
      statusEl.textContent = "拉取失败，请检查 Gist ID 是否正确";
    }
  });

      // 6. 手机端左右滑动切题手势
      const cardEl = document.getElementById("questionCard");
      let touchStartX = 0;
  let touchEdge = false;   // P4-14：起点是否贴近屏幕左右边缘
      let touchStartY = 0;
      cardEl.addEventListener("touchstart", (e) => {
        if (!e.touches || e.touches.length !== 1) return;
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
    touchEdge = e.touches[0].clientX < 24 || e.touches[0].clientX > (window.innerWidth - 24);   // P4-14
      }, { passive: true });

      cardEl.addEventListener("touchend", (e) => {
        if (!e.changedTouches || e.changedTouches.length !== 1) return;
        if (touchEdge) return;   // P4-14：屏幕边缘的滑动交给浏览器（后退/前进），不切题
    try { if (window.getSelection && String(window.getSelection()).trim()) return; } catch (err) {}   // P4-14：正在选中文字时不切题
    const tag = (e.target && e.target.tagName) || "";
        if (["TEXTAREA", "INPUT", "SELECT"].includes(tag)) return;
        const dx = e.changedTouches[0].clientX - touchStartX;
        const dy = e.changedTouches[0].clientY - touchStartY;
        if (Math.abs(dx) > 64 && Math.abs(dx) > Math.abs(dy) * 1.7) {
          if (dx < 0) nextQuestion();
          else prevQuestion();
        }
      }, { passive: true });

      // 7. 电脑端键盘快捷键支持
      // P2-17：开屏未移除 / 长按自动重复 / 输入法组字 / 组合键一律不响应；
      // 有弹窗时只响应 Escape（关闭最上层弹窗）；焦点在按钮、链接、可编辑区域时不抢键。
      const MODAL_CLOSE_BTN = {
        answerSheetModal: "closeSheetModalBtn",
        knowledgeModal: "closeKnowledgeModalBtn",
        syncModal: "closeSyncModalBtn",
        aiConfigModal: "closeAiModalBtn",
        reportModal: "closeReportModalBtn"
      };
      const getOpenModals = () => {
        const list = Array.from(document.querySelectorAll(".fixed.inset-0")).filter((m) => !m.classList.contains("hidden"));
        const exam = document.getElementById("examOverlay");   // 模拟考试遮罩（行内样式，不带 .fixed.inset-0）
        if (exam && document.body.contains(exam)) list.push(exam);
        return list;
      };
      const getTopModal = (list) => {
        let top = null, topZ = -Infinity;
        list.forEach((m) => {   // z-index 大者在上；相同则 DOM 靠后者在上
          const z = Number.parseInt(getComputedStyle(m).zIndex, 10);
          const zz = Number.isFinite(z) ? z : 0;
          if (zz >= topZ) { topZ = zz; top = m; }
        });
        return top;
      };
      const closeModalEl = (m) => {
        if (!m) return;
        if (m.id === "examOverlay") {
          // 复用 × 按钮：保留"考试进行中确认关闭"的逻辑
          const x = m.querySelector("button");
          if (x) x.click();
          return;
        }
        const btnId = MODAL_CLOSE_BTN[m.id];
        const btn = btnId ? document.getElementById(btnId) : null;
        if (btn) btn.click();
        else m.classList.add("hidden");
      };
      document.addEventListener("keydown", (e) => {
        if (document.getElementById("splashCover")) return;   // 开屏遮罩仍在（含 600ms 淡出期）
        if (e.repeat || e.isComposing) return;
        if (e.ctrlKey || e.metaKey || e.altKey) return;        // 不劫持 Ctrl+F 等浏览器 / 系统快捷键
        const key = e.key || "";
        const t = e.target && e.target.nodeType === 1 ? e.target : null;
        const tag = (t && t.tagName) || "";
        const inField = ["INPUT", "TEXTAREA", "SELECT"].includes(tag) || !!(t && t.isContentEditable);
        const openModals = getOpenModals();
        if (openModals.length) {
          // 输入框内的 Escape 留给控件自身（如收起下拉），避免误关弹窗丢失正在填写的内容
          if (key === "Escape" && !inField) {
            e.preventDefault();
            closeModalEl(getTopModal(openModals));
          }
          return;
        }
        if (inField) return;
        if (tag === "BUTTON" || tag === "A" || (t && t.closest && t.closest("button,a"))) return;
        if (key === "ArrowLeft") prevQuestion();
        else if (key === "ArrowRight") nextQuestion();
        else if (key.toLowerCase() === "f") toggleFavoriteCurrent();
        else if (key.toLowerCase() === "b") setStudyMode(studyMode === "recite" ? "practice" : "recite");
        else if (key === "Enter") submitAnswer();
      });

      // 8. 注册 Service Worker 与版本更新提示 (仅在同源 HTTP/HTTPS 部署环境下启用)
      let waitingWorker = null;
      const revealSwBanner = async () => {
    document.getElementById("swUpdateBanner").classList.remove("hidden");
    try {
      const v = await window.__fkSwVersion();
      if (v) document.getElementById("swUpdateVersion").textContent = "离线缓存 " + v + " 已就绪";
    } catch (e) {}
  };
      if ("serviceWorker" in navigator && (location.protocol === "http:" || location.protocol === "https:")) {
        // P2-3：SW 后台重验证 index.json 发现新版本 → 提示刷新（与当前题库版本相同或已提示过则忽略）
        let notifiedIndexVersion = "";
        navigator.serviceWorker.addEventListener("message", (ev) => {
          const d = ev && ev.data;
          if (!d || d.type !== "QUESTION_INDEX_UPDATED") return;
          const v = d.version != null ? String(d.version) : "";
          if (!v || v === questionsVersion || v === notifiedIndexVersion) return;
          notifiedIndexVersion = v;
          showToast("题库已更新，刷新后生效", "info");
        });
        const swPath = [".", "sw.js"].join("/");
        navigator.serviceWorker.register(swPath).then((reg) => {
          if (reg.waiting) {
            waitingWorker = reg.waiting;
            revealSwBanner();
          }
          reg.addEventListener("updatefound", () => {
            const newWorker = reg.installing;
            if (!newWorker) return;
            newWorker.addEventListener("statechange", () => {
              if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
                waitingWorker = newWorker;
                revealSwBanner();
              }
            });
          });
        }).catch(() => {});

      // ── 题库预缓存（省流量策略）──
      // 默认不预缓存全部题库（约 20MB）；仅在明确是 Wi-Fi 或桌面环境时后台补齐，
      // 移动蜂窝网络下只缓存用户实际刷到的分块（fetch 时会自动入缓存）
      try {
        navigator.serviceWorker.ready.then(async (reg) => {
          try {
            // 与启动时同一套省流量判定（P1-13）：省流量模式 / 读不到网络 API 时一律不做后台预缓存
            const connApi = navigator.connection || navigator.mozConnection || navigator.webkitConnection || null;
            const conn = connApi || {};
            const isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent || "");
            let pref = "auto";
            try { pref = localStorage.getItem("fk_frugal_mode") || "auto"; } catch (e) {}
            const frugalNow = pref === "on" ? true
              : pref === "off" ? false
              : (!connApi ? true
                : (!!conn.saveData
                  || /^(slow-2g|2g)$/.test(conn.effectiveType || "")
                  || conn.effectiveType === "3g"
                  || (isMobile && conn.type === "cellular")));
            if (frugalNow) return;
            const wifi = conn.type === "wifi" || (!isMobile && !conn.saveData);
            if (!wifi) return;
            // 复用已加载的 indexData（预缓存可能先于主加载完成，最多等 5 秒），避免重复下载 index.json
            let data = window.__fkIndexData || null;
            for (let w = 0; !data && w < 20; w++) {
              await new Promise((r) => setTimeout(r, 250));
              data = window.__fkIndexData || null;
            }
            if (!data) {
              const res = await fetch([".", "questions", "index.json"].join("/"));
              if (!res.ok) return;
              data = await res.json();
            }
            // 预缓存键必须与实际请求一致：页面取数统一附加 ?v=<version>（见 withQVersion），
            // 否则裸 URL 缓存永远不会命中，还会把整份题库重复下载一遍。
            const ver = data && data.version ? String(data.version) : "";
            const files = [];
            Object.values(data.subjects || {}).forEach((meta) => {
              const list = Array.isArray(meta.parts) ? meta.parts : (meta.file ? [meta.file] : []);
              list.forEach((f) => files.push("./questions/" + f + (ver ? "?v=" + encodeURIComponent(ver) : "")));
            });
            if (files.length && reg.active) reg.active.postMessage({ type: "PREFETCH_QUESTIONS", files });
          } catch (e) {}
        });
      } catch (e) {}
      }

      document.getElementById("swApplyUpdateBtn").addEventListener("click", () => {
        document.getElementById("swUpdateBanner").classList.add("hidden");
        if (!waitingWorker) {
          location.reload();
          return;
        }
        // 必须等新 SW 真正接管 (controllerchange) 再刷新，
        // 否则 reload 发生在激活之前，页面仍由旧缓存提供，更新无效。
        let reloaded = false;
        const doReload = () => {
          if (reloaded) return;
          reloaded = true;
          location.reload();
        };
        navigator.serviceWorker.addEventListener("controllerchange", doReload);
        waitingWorker.postMessage({ type: "SKIP_WAITING" });
        // 兜底：3 秒内未触发 controllerchange 也要刷新一次，避免卡死
        setTimeout(doReload, 3000);
      });
      document.getElementById("swDismissUpdateBtn").addEventListener("click", () => {
        document.getElementById("swUpdateBanner").classList.add("hidden");
      });
    }

    window.addEventListener("DOMContentLoaded", initApp);
  
/* script-data.js — 全部剧本数据（与渲染解耦）
 * 铁律：propose 必死无例外；休养生息免代价；循环不可从内部打破。
 * 文本约定：旁白冷克制短句白描；天殇短句多「。」「——」；大臣文雅迂回；阿檀直白见血。
 * {{loop2:文}} —— 第二周目起显示该段，否则去除。
 */
(function () {
  "use strict";
  const Game = window.Game = window.Game || {};

  /* ---------- 卷宗四则 ---------- */
  Game.rules = [
    { n: "一", text: "天子问政，群臣当以旧制复。有议新者，天子批「准」。", cls: "" },
    { n: "二", text: "「准」者，行之令也。令出，必以一命偿之。", cls: "" },
    { n: "三", text: "惟「休养生息」一令，不行、不取、不偿，免偿。", cls: "" },
    { n: "四", text: "朝议四日，第五位立，元年复始。", cls: "scroll__rule--4" }
  ];

  /* ---------- 情报条目 ---------- */
  Game.knowledgeInfo = {
    k_scroll_4th:   "卷宗第四行，自元年至今，一字未改。",
    k_shentan_ink: "沈砚袍角的墨渍，洗了四百年，仍在。",
    k_lisi_fading: "李司农的左袖，正在化作纸灰。",
    k_atan_noshadow: "阿檀脚下，没有影子。",
    k_throne_back: "龙椅背面，刻满同一行字——刻了又刻，像在数日子。",
    k_truth:       "天子并非执笔之人。他，也是被写在卷宗上的那一行。",
    k_loop_count:  "这已是第若干次元年。卷宗在数。",
    k_quzhun:      "欲破此局，须令天子口出「不准」二字。"
  };

  /* ---------- 场景节点 ---------- */
  Game.scenes = {
    /* ===== 第一日 ===== */
    scene_1_1: {
      id: "scene_1_1", chapter: "第一日 · 朝议",
      bg: "bg_throne_hall.jpg", dark: false,
      narration: [
        "天未明。",
        "金銮殿最后一排，空着一个膝痕。",
        "你跪下去，填满它。{{loop2:你记得这个姿势。}}"
      ],
      next: "scene_1_2"
    },
    scene_1_2: {
      id: "scene_1_2", chapter: "第一日 · 朝议",
      bg: "bg_throne_hall.jpg",
      portrait: { right: "chara_tianshang_calm" },
      speaker: "天殇",
      line: "新来的第五位。\n岁凶民饥，何以处之？",
      choices: [
        { text: "复旧制：与民休息。", kind: "echo", next: "scene_1_safe" },
        { text: "请设常平新法，平抑粮价。", kind: "propose", verdictText: "准", ending: "E_A1", danger: true },
        { text: "（伏地不语。）", kind: "silence", affinity: { tianshang: -1, atan: +1 }, next: "scene_1_sil" }
      ]
    },
    scene_1_safe: {
      id: "scene_1_safe", chapter: "第一日 · 朝议",
      bg: "bg_throne_hall.jpg",
      portrait: { right: "chara_tianshang_calm" },
      speaker: "天殇", line: "准。",
      autoDelay: 700, next: "scene_1_scroll"
    },
    scene_1_scroll: {
      id: "scene_1_scroll", chapter: "第一日 · 朝议",
      bg: "bg_throne_hall.jpg",
      portrait: { left: "chara_atan_neutral" },
      narration: ["殿角铜铃未响。", "你没有死。", "——复述旧制，『准』不收命。"],
      onEnter: ["knowledge:k_scroll_4th"],
      speaker: "阿檀", line: "大人，卷宗在此。第四行，请看。",
      next: "scene_1_night"
    },
    scene_1_sil: {
      id: "scene_1_sil", chapter: "第一日 · 朝议",
      bg: "bg_throne_hall.jpg",
      narration: ["殿上一瞬寂静。", "天子未再问。", "你低着头，错过了什么。"],
      next: "scene_1_night"
    },
    scene_1_night: {
      id: "scene_1_night", chapter: "第一日 · 夜",
      bg: "bg_throne_hall.jpg", dark: true,
      narration: ["入夜。", "朝堂无人，烛火如豆。", "一个穿青袍的人站在你身后。{{loop2:你认得他。他每次都在。}}"],
      portrait: { left: "chara_shentan_normal" },
      onEnter: ["knowledge:k_shentan_ink"],
      speaker: "沈砚", line: "新大人。下官沈砚，第六位。{{loop2:——不，下官既是第六位，也是第一个。}} 官袍上的墨，四百年，洗不掉。",
      next: "scene_2_1"
    },

    /* ===== 第二日 ===== */
    scene_2_1: {
      id: "scene_2_1", chapter: "第二日 · 朝议",
      bg: "bg_throne_hall.jpg",
      narration: ["第二日。", "前三排跪着三人。{{loop2:第二日。前三排，还是三人。——昨日那个呢？}}"],
      next: "scene_2_2"
    },
    scene_2_2: {
      id: "scene_2_2", chapter: "第二日 · 朝议",
      bg: "bg_throne_hall.jpg",
      portrait: { right: "chara_tianshang_calm" },
      speaker: "天殇", line: "第二问。\n边患频仍，何以御之？",
      choices: [
        { text: "复旧制：坚壁清野。", kind: "echo", next: "scene_2_safe" },
        { text: "请设新军法，募兵十万。", kind: "propose", verdictText: "准", ending: "E_A2", danger: true },
        { text: "（伏地不语。）", kind: "silence", affinity: { tianshang: -1, atan: +1 }, next: "scene_2_sil" }
      ]
    },
    scene_2_safe: {
      id: "scene_2_safe", chapter: "第二日 · 朝议",
      bg: "bg_throne_hall.jpg",
      portrait: { right: "chara_tianshang_calm" },
      speaker: "天殇", line: "准。",
      autoDelay: 700, next: "scene_2_after"
    },
    scene_2_after: {
      id: "scene_2_after", chapter: "第二日 · 朝议",
      bg: "bg_throne_hall.jpg",
      narration: ["依旧，无人死。", "沈砚跪在前排，回过头，对你笑了一下。{{loop2:他笑得很慢。}}"],
      next: "scene_2_night"
    },
    scene_2_sil: {
      id: "scene_2_sil", chapter: "第二日 · 朝议",
      bg: "bg_throne_hall.jpg",
      narration: ["你又一次没有开口。", "沈砚看了你一眼。"],
      next: "scene_2_night"
    },
    scene_2_night: {
      id: "scene_2_night", chapter: "第二日 · 夜",
      bg: "bg_throne_hall.jpg", dark: true,
      portrait: { left: "chara_shentan_normal" },
      speaker: "沈砚",
      line: "大人，您不该总不开口。不开口的人，学不到东西。{{loop2:学不到东西的人，会一直死。}}",
      nextIf: [{ if: "state.loop >= 2", next: "scene_2_night_l2" }],
      next: "scene_3_1"
    },
    scene_2_night_l2: {
      id: "scene_2_night_l2", chapter: "第二日 · 夜",
      bg: "bg_throne_hall.jpg", dark: true,
      portrait: { left: "chara_shentan_normal" },
      speaker: "沈砚",
      line: "……大人，您这是第几次了？下官记不清了。卷宗上有。",
      onEnter: ["knowledge:k_loop_count"],
      next: "scene_3_1"
    },

    /* ===== 第三日 ===== */
    scene_3_1: {
      id: "scene_3_1", chapter: "第三日 · 朝议",
      bg: "bg_throne_hall.jpg",
      narration: ["第三日。", "前排少了一个人。", "那个位置空着，膝痕却还在。"],
      next: "scene_3_2"
    },
    scene_3_2: {
      id: "scene_3_2", chapter: "第三日 · 朝议",
      bg: "bg_throne_hall.jpg",
      portrait: { right: "chara_tianshang_calm", rightFx: "tired", left: "chara_lisi_normal", leftFx: "fading-50" },
      speaker: "天殇", line: "第三问。\n百官俸薄，何以养廉？",
      choices: [
        { text: "复旧制：量入为出。", kind: "echo", next: "scene_3_safe" },
        { text: "请增俸禄、设养廉银。", kind: "propose", verdictText: "准", ending: "E_A3", danger: true },
        { text: "（伏地不语。）", kind: "silence", affinity: { tianshang: -1, atan: +1 }, next: "scene_3_sil" }
      ]
    },
    scene_3_safe: {
      id: "scene_3_safe", chapter: "第三日 · 朝议",
      bg: "bg_throne_hall.jpg",
      portrait: { right: "chara_tianshang_calm", rightFx: "tired", left: "chara_lisi_normal", leftFx: "fading-50" },
      speaker: "天殇", line: "准。",
      autoDelay: 700, next: "scene_3_after"
    },
    scene_3_after: {
      id: "scene_3_after", chapter: "第三日 · 朝议",
      bg: "bg_throne_hall.jpg",
      narration: ["李司农跪在第三排。", "他的左袖，正一寸寸化作纸灰。", "他似无所觉。{{loop2:你提醒过他。他不记得。}}"],
      next: "scene_3_night"
    },
    scene_3_sil: {
      id: "scene_3_sil", chapter: "第三日 · 朝议",
      bg: "bg_throne_hall.jpg",
      narration: ["你低头。", "李司农看了你一眼，眼神空空。"],
      next: "scene_3_night"
    },
    scene_3_night: {
      id: "scene_3_night", chapter: "第三日 · 夜",
      bg: "bg_throne_hall.jpg", dark: true,
      portrait: { left: "chara_lisi_normal", leftFx: "fading-50" },
      onEnter: ["knowledge:k_lisi_fading"],
      speaker: "李司农", line: "大人……下官怎么觉得，自己轻了一些？",
      nextIf: [{ if: "state.loop >= 2", next: "scene_3_night_l2" }],
      next: "scene_4_1"
    },
    scene_3_night_l2: {
      id: "scene_3_night_l2", chapter: "第三日 · 夜",
      bg: "bg_throne_hall.jpg", dark: true,
      portrait: { left: "chara_lisi_normal", leftFx: "fading-80" },
      narration: ["他比昨日更淡了。", "下官……是不是也写过卷宗？", "他望向龙椅的眼神，像在看囚笼。"],
      onEnter: ["knowledge:k_truth"],
      speaker: "李司农", line: "大人……那位天子，他也被写在上面，是吗。",
      next: "scene_4_1"
    },

    /* ===== 第四日 ===== */
    scene_4_1: {
      id: "scene_4_1", chapter: "第四日 · 朝议",
      bg: "bg_throne_hall.jpg",
      narration: ["第四日。", "前排只剩一人。", "殿角的阿檀，没有影子。{{loop2:你早就知道了。}}"],
      portrait: { left: "chara_atan_neutral" },
      onEnter: ["knowledge:k_atan_noshadow"],
      next: "scene_4_2"
    },
    scene_4_2: {
      id: "scene_4_2", chapter: "第四日 · 朝议",
      bg: "bg_throne_hall.jpg",
      portrait: { right: "chara_tianshang_calm", rightFx: "breaking", left: "chara_atan_neutral" },
      speaker: "天殇", line: "第四问。\n……你，还想问什么？",
      choices: [
        { text: "复旧制：休养生息。", kind: "echo", next: "scene_4_safe" },
        { text: "请……请立新制。", kind: "propose", verdictText: "准", ending: "E_A4", danger: true },
        { text: "（伏地不语。）", kind: "silence", affinity: { tianshang: -1, atan: +1 }, next: "scene_4_sil" },
        { text: "陛下，这卷宗，可是您写的？", kind: "ask", require: "flags.knows_truth === true", next: "scene_4_ask" },
        { text: "（真相）臣要续写卷宗第一行。", kind: "meta", require: "state.loop >= 2 && Game.hasKnowledge('k_throne_back')", hideIfLocked: true, next: "scene_4_secondera" }
      ]
    },
    scene_4_ask: {
      id: "scene_4_ask", chapter: "第四日 · 朝议",
      bg: "bg_throne_hall.jpg",
      portrait: { right: "chara_tianshang_calm", rightFx: "breaking" },
      speaker: "天殇",
      line: "……你想问，这卷宗是谁写的。\n朕写的。\n——不。朕，也是被写的。",
      next: "scene_4_ask2"
    },
    scene_4_ask2: {
      id: "scene_4_ask2", chapter: "第四日 · 朝议",
      bg: "bg_throne_hall.jpg",
      portrait: { right: "chara_tianshang_calm", rightFx: "breaking", left: "chara_atan_neutral" },
      speaker: "天殇", line: "朕说不出『不准』。那是枷锁，也是钥匙。\n——你，要试吗？",
      choices: [
        { text: "臣请陛下，说『不准』。", kind: "meta", require: "Game.hasKnowledge('k_throne_back') === true", next: "scene_4_truth" },
        { text: "（退回）复旧制：休养生息。", kind: "echo", next: "scene_4_safe" }
      ]
    },
    scene_4_secondera: {
      id: "scene_4_secondera", chapter: "第四日 · 朝议",
      bg: "bg_throne_hall.jpg",
      narration: ["你走向龙椅。", "没有人拦你。", "背面刻满同一行字，层层叠叠。"],
      portrait: { right: "chara_tianshang_calm", rightFx: "breaking" },
      speaker: "天殇", line: "……你要续写第一行？",
      autoDelay: 900, next: "scene_4_secondera2"
    },
    scene_4_secondera2: {
      id: "scene_4_secondera2", chapter: "第四日 · 朝议",
      bg: "cg_scroll_closeup.jpg",
      narration: ["你提笔。", "墨落下，才发现——第一行早已写好。", "同一句话，写了两遍。"],
      autoDelay: 1100, ending: "E_C"
    },
    scene_4_truth: {
      id: "scene_4_truth", chapter: "第四日 · 朝议",
      bg: "cg_throne_back.jpg",
      narration: ["「臣请陛下，说『不准』。」", "殿上久无人声。", "天子张口。墨字自喉间涌出，却不是『准』。"],
      autoDelay: 1300, next: "scene_4_truth2"
    },
    scene_4_truth2: {
      id: "scene_4_truth2", chapter: "第四日 · 朝议",
      bg: "cg_throne_back.jpg",
      portrait: { right: "chara_tianshang_calm", rightFx: "breaking" },
      speaker: "天殇", line: "……不准。",
      autoDelay: 1500, ending: "E_TRUE"
    },
    scene_4_safe: {
      id: "scene_4_safe", chapter: "第四日 · 朝议",
      bg: "bg_throne_hall.jpg",
      portrait: { right: "chara_tianshang_calm", rightFx: "breaking" },
      speaker: "天殇", line: "准。",
      autoDelay: 700, next: "scene_4_night"
    },
    scene_4_sil: {
      id: "scene_4_sil", chapter: "第四日 · 朝议",
      bg: "bg_throne_hall.jpg",
      narration: ["你没有开口。", "这一次，你什么都没看见。"],
      next: "scene_4_dawn"
    },
    scene_4_night: {
      id: "scene_4_night", chapter: "第四日 · 夜",
      bg: "cg_midnight_palace.jpg", dark: true,
      narration: ["夜深。", "你独留殿中，绕过龙椅。", "椅背漆黑，刻满密密麻麻的字——", "全是同一行，刻了又刻。"],
      onEnter: ["knowledge:k_throne_back"],
      next: "scene_4_dawn"
    },
    scene_4_dawn: {
      id: "scene_4_dawn", chapter: "第四日 · 夜",
      bg: "bg_throne_hall.jpg", dark: true,
      narration: ["天将明。", "殿门未开，你却已听见——", "铜铃又响了一声。"],
      autoDelay: 1200, ending: "E_B"
    }
  };

  /* ---------- 结局 ---------- */
  Game.endings = {
    E_A1: {
      id: "E_A1", type: "bad", label: "殁", title: "准 · 常平",
      body: "朱笔落处，你听见自己的骨头在响。<em>准</em>。\n你想说话，嘴唇已化作墨。\n<strong>原来『准』是要命的。</strong>\n卷宗翻到第四行，你看见了，却再也说不出口。",
      hint: "提示：复述旧制可活；新议，必死。"
    },
    E_A2: {
      id: "E_A2", type: "bad", label: "殁", title: "准 · 新军",
      body: "十万新军的数字尚未落地，<em>准</em>字先到。\n你散成一地纸灰，像沈砚袍角那块洗不掉的墨。\n<strong>他从前排看着你，像看着昨天的自己。</strong>",
      hint: "提示：他每次都在。"
    },
    E_A3: {
      id: "E_A3", type: "bad", label: "殁", title: "准 · 养廉",
      body: "你比李司农先一步散了。<em>准</em>。\n他低头看着自己正在消失的左袖，像看着你。\n<strong>原来你们，都是用纸糊的。</strong>",
      hint: "提示：有些大臣，正在消失。"
    },
    E_A4: {
      id: "E_A4", type: "bad", label: "殁", title: "准 · 新制",
      body: "最后一日，你还是说了『请』。<em>准</em>。\n这一回，连阿檀都没有抬头。\n<strong>你终于明白：只要你说『请』，他就只能写『准』。</strong>",
      hint: "提示：别说『请』。"
    },
    E_B: {
      id: "E_B", type: "normal", label: "循环", title: "元年复始",
      body: "四日朝议，你一字未改。<strong>卷宗第四行依旧。</strong>\n殿门再开，又是天未明。\n你跪进最后一排，膝痕刚好。\n<em>这是第 {{loop}} 次元年。</em>",
      cg: "cg_ending_loop.jpg",
      hint: "提示：活下来不够。卷宗背后，还有字。"
    },
    E_C: {
      id: "E_C", type: "good", label: "第二纪元", title: "第一行，写了两遍",
      body: "你续写卷宗第一行，墨落下去——\n才发现第一行早已写好。\n<strong>同一句话，写了两遍。</strong>\n纪元错了一格。\n天子看着你，第一次没有写『准』。\n<em>第二纪元，开始。</em>",
      cg: "cg_ending_second_era.jpg",
      hint: "你触碰到了卷宗。但执笔之人，仍非你。"
    },
    E_TRUE: {
      id: "E_TRUE", type: "true", label: "真", title: "不准",
      body: "「臣请陛下，说『不准』。」\n\n殿上久无人声。<strong>天子不能承认自己『不能为』</strong>——那是他的枷锁。\n\n他张口。墨字自喉间涌出，却不是『准』。\n<em>「……不准。」</em>\n\n卷宗第四行，第一次，变了。\n他走下龙椅，摘下冕旒。你第一次看清他的脸。\n他倦极了，却像松了口气。\n\n——这只是一个安静的故事，到此为止。",
      cg: "cg_ending_true.jpg",
      hint: "你打破了它。"
    }
  };

  Game.firstNode = "scene_1_1";
})();

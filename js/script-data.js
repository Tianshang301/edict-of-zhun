/* script-data.js — 全部剧本数据（与渲染解耦）
 * 铁律：propose 必死无例外；休养生息免代价；循环不可从内部打破。
 * 文本约定：旁白冷克制短句白描；天殇短句多「。」「——」；大臣文雅迂回；阿檀直白见血。
 * 多周目标记：{{loop2:文}} {{loop3:文}} {{loop4:文}} —— 达到该周目才显示，否则整段消失。
 * 节点 next 可为 "$checkpoint" → 当前章节起始节点（章节回退节拍用）。
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
    k_scroll_4th:            "卷宗第四行，自元年至今，一字未改。",
    k_shentan_ink:          "沈砚袍角的墨渍，洗了四百年，仍在。",
    knows_price:            "「准」字需要代价。代价是提议者的存在。",
    lisi_saved_people:      "李司农的「军屯」救了北境三万人。",
    fourth_line_never_changes: "第四行永远不会变。",
    met_atan:               "阿檀是卷宗的具象化。她记录一切。",
    k_atan_noshadow:        "阿檀脚下没有影子，瞳孔里没有倒影。",
    k_seventeen:            "夜里的十七个脚步声，是十七位前代大臣的残影。",
    k_throne_back:          "龙椅背面，刻满同一行字——刻了又刻，像在数日子。",
    k_truth:                "天子并非执笔之人。他，也是被写在卷宗上的那一行。",
    k_loop_count:           "这已是第若干次元年。卷宗在数。",
    k_quzhun:               "欲破此局，须令天子口出「不准」二字。",
    fifth_line_is_you:      "第五行，可以是你。"
  };

  /* ---------- 场景节点 ---------- */
  Game.scenes = {

    /* ===== 第一章 · 第一日 · 休养生息 ===== */
    scene_01_01: {
      id: "scene_01_01", chapter: "第一日 · 休养生息",
      bg: "bg_throne_hall.jpg",
      narration: [
        "正月十五。天未明。",
        "金銮殿最后一排，空着一个膝痕。",
        "你跪下去，填满它。{{loop2:你记得这个姿势。}}"
      ],
      next: "scene_01_02"
    },
    scene_01_02: {
      id: "scene_01_02", chapter: "第一日 · 休养生息",
      bg: "bg_throne_hall.jpg",
      portrait: { right: "chara_tianshang_calm" },
      speaker: "天殇",
      line: "新来的第五位。\n岁凶民饥，何以处之？",
      choices: [
        { text: "复旧制：与民休息。", kind: "echo", next: "scene_01_safe" },
        { text: "请设常平新法，平抑粮价。", kind: "propose", verdictText: "准", ending: "E_A1", danger: true },
        { text: "（伏地不语。）", kind: "silence", affinity: { tianshang: -1, atan: +1 }, next: "scene_01_sil" }
      ]
    },
    scene_01_safe: {
      id: "scene_01_safe", chapter: "第一日 · 休养生息",
      bg: "bg_throne_hall.jpg",
      portrait: { right: "chara_tianshang_calm" },
      speaker: "天殇", line: "准。",
      autoDelay: 700, next: "scene_01_scroll"
    },
    scene_01_scroll: {
      id: "scene_01_scroll", chapter: "第一日 · 休养生息",
      bg: "bg_throne_hall.jpg",
      narration: [
        "殿角铜铃未响。你没有死。",
        "——复述旧制，『准』不收命。",
        "案上有一卷卷宗。你翻开。第一行，休养生息。第四行，朝议四日。",
        "第四行墨色最深，像刻上去的。"
      ],
      onEnter: ["knowledge:k_scroll_4th"],
      next: "scene_01_night"
    },
    scene_01_sil: {
      id: "scene_01_sil", chapter: "第一日 · 休养生息",
      bg: "bg_throne_hall.jpg",
      narration: ["殿上一瞬寂静。", "天子未再问。", "你低着头，错过了什么。"],
      next: "scene_01_night"
    },
    scene_01_night: {
      id: "scene_01_night", chapter: "第一日 · 休养生息",
      bg: "bg_throne_hall.jpg", dark: true,
      narration: ["入夜。", "朝堂无人，烛火如豆。", "一个穿青袍的人站在你身后。{{loop2:你认得他。他每次都在。}}"],
      portrait: { left: "chara_shentan_normal" },
      onEnter: ["knowledge:k_shentan_ink"],
      speaker: "沈砚",
      line: "新大人。下官沈砚，第六位。{{loop2:——不，下官既是第六位，也是第一个。}} 官袍上的墨，四百年，洗不掉。",
      nextIf: [{ if: "state.loop >= 2", next: "scene_02_00" }],
      next: "scene_02_01"
    },

    /* ===== 第二章 · 第二日 · 北境大旱（正典 §11.2） ===== */
    /* §11.5 二周目：02_01 之前插入沈砚短暂出现 */
    scene_02_00: {
      id: "scene_02_00", chapter: "第二日 · 北境大旱",
      bg: "bg_throne_hall.jpg", dark: true,
      narration: ["殿门未开。", "沈砚站在你身后，像一道没干透的墨。", "他看着你，像看着一个走了很远的人。"],
      portrait: { left: "chara_shentan_normal" },
      speaker: "沈砚", line: "你回来了。",
      autoDelay: 1500, next: "scene_02_01"
    },
    scene_02_01: {
      id: "scene_02_01", chapter: "第二日 · 北境大旱",
      bg: "bg_throne_hall.jpg",
      narration: [
        "正月十六。你入朝时，殿门外跪着人。",
        "不是官员。是流民。北境来的。",
        "他们不敢喊冤。只是跪着。一排。又一排。",
        "殿门没有关。天殇没有让人关门。"
      ],
      portrait: { right: "chara_tianshang_calm" },
      speaker: "天殇", line: "北境大旱。卿等，有何言？",
      choices: [
        { text: "「臣附议李司农。」", kind: "echo", next: "scene_02_03" },
        { text: "「臣以为，当开仓赈济。」", kind: "propose", verdictText: "准", ending: "E_A2", danger: true },
        { text: "「臣以为，休养生息即可。」", kind: "echo", next: "scene_02_02" },
        { text: "（沉默）", kind: "silence", affinity: { tianshang: -1, atan: +1 }, next: "scene_02_02" }
      ]
    },
    scene_02_02: {
      id: "scene_02_02", chapter: "第二日 · 北境大旱",
      bg: "bg_throne_hall.jpg",
      portrait: { center: "chara_lisi_normal" },
      narration: [
        "殿上沉默了很久。",
        "然后有人出列。",
        "你见过他。昨日他还站在你右手边。",
        "今日，他的脸色比昨天白了。"
      ],
      speaker: "李司农", line: "臣，司农李元。臣以为，北境大旱，流民南下，当开仓赈济。国库虽虚，然民心不可失。",
      next: "scene_02_03"
    },
    scene_02_03: {
      id: "scene_02_03", chapter: "第二日 · 北境大旱",
      bg: "bg_throne_hall.jpg",
      portrait: { left: "chara_tianshang_calm", center: "chara_lisi_normal" },
      narration: ["天殇看着他。", "看了很久。", "久到你以为他会说『不准』。"],
      speaker: "天殇", line: "准。",
      autoDelay: 2200, onEnter: ["flag:watched_lisi_dissolve"], next: "scene_02_04"
    },
    scene_02_04: {
      id: "scene_02_04", chapter: "第二日 · 北境大旱",
      bg: "cg_minister_dissolve.jpg",
      narration: [
        "李司农还站着。",
        "但他的脚踝已经不见了。",
        "他还在说话。他说，谢陛下。",
        "他的声音越来越轻。最后，只剩下纸灰。",
        "殿上没有人抬头。没有人说话。"
      ],
      autoDelay: 3200, onEnter: ["knowledge:knows_price", "flag:saw_dissolve"], next: "scene_02_05"
    },
    scene_02_05: {
      id: "scene_02_05", chapter: "第二日 · 北境大旱",
      bg: "bg_throne_hall.jpg",
      portrait: { center: "chara_tianshang_calm", centerFx: "tired" },
      narration: ["天殇靠在龙椅上。", "他的手在抖。", "很小幅度的抖。只有你看见了。", "他说：退朝。"],
      speaker: "天殇", line: "退朝。",
      next: "scene_02_06"
    },
    scene_02_06: {
      id: "scene_02_06", chapter: "第二日 · 北境大旱",
      bg: "bg_inn_night.jpg", dark: true,
      narration: [
        "馆驿的灯很暗。",
        "你坐在案前，案上有一卷卷宗。",
        "你翻开它。第一行，是休养生息。",
        "第二行，是李司农今日说的话。",
        "第三行，是空的。"
      ],
      choices: [
        { text: "查看李司农的官邸", kind: "investigate", next: "scene_02_07" },
        { text: "翻看卷宗的夹层", kind: "investigate", next: "scene_02_08" },
        { text: "直接休息", kind: "silence", next: "scene_02_10" }
      ]
    },
    scene_02_07: {
      id: "scene_02_07", chapter: "第二日 · 北境大旱",
      bg: "bg_lisi_residence.jpg", dark: true,
      narration: [
        "官邸的门没有锁。",
        "你推门进去。桌上有一碗饭。",
        "饭还是热的。",
        "桌边有一张纸。上面写着：",
        "『军屯之事，已办妥。北境三万人，可活。』",
        "落款是李元。日期是今天。",
        "{{loop3:桌上还多了一封没有封口的信。信上只有一句：『如果还有下一次，请不要附议我。』}}"
      ],
      onEnter: ["knowledge:lisi_saved_people"], next: "scene_02_09"
    },
    scene_02_08: {
      id: "scene_02_08", chapter: "第二日 · 北境大旱",
      bg: "cg_scroll_closeup.jpg",
      narration: [
        "你翻开卷宗的夹层。",
        "里面有一张更旧的纸。",
        "上面写着四个字。",
        "不是天殇的字。是另一个人的。",
        "『第四行，永远不会变。』"
      ],
      onEnter: ["knowledge:fourth_line_never_changes"], next: "scene_02_09"
    },
    scene_02_09: {
      id: "scene_02_09", chapter: "第二日 · 北境大旱",
      bg: "bg_inn_night.jpg", dark: true,
      portrait: { center: "chara_atan_neutral" },
      narration: [
        "你回到馆驿时，她坐在你的位置上。",
        "抱着那卷卷宗。脚不沾地。",
        "她抬头看你，金色瞳孔里没有倒影。"
      ],
      onEnter: ["knowledge:k_atan_noshadow"],
      speaker: "阿檀", line: "你看见了。",
      choices: [
        { text: "「你是谁？」", kind: "ask", next: "scene_02_09a" },
        { text: "「你也记得李司农？」", kind: "ask", next: "scene_02_09b" },
        { text: "（沉默）", kind: "silence", affinity: { atan: -1 }, next: "scene_02_10" },
        { text: "「第五行，可以是我吗？」", kind: "ask", require: "state.loop >= 4", hideIfLocked: true, next: "scene_02_09d" }
      ]
    },
    scene_02_09a: {
      id: "scene_02_09a", chapter: "第二日 · 北境大旱",
      speaker: "阿檀", line: "我是卷宗。卷宗是我。",
      next: "scene_02_09c"
    },
    scene_02_09b: {
      id: "scene_02_09b", chapter: "第二日 · 北境大旱",
      speaker: "阿檀", line: "我不记得。我记录。",
      next: "scene_02_09c"
    },
    scene_02_09c: {
      id: "scene_02_09c", chapter: "第二日 · 北境大旱",
      speaker: "阿檀",
      line: "第三行，明天就会有人写上。第四行，永远是那四个字。你想让第五行变成什么？",
      onEnter: ["flag:met_atan", "knowledge:met_atan"], next: "scene_02_10"
    },
    scene_02_09d: {
      id: "scene_02_09d", chapter: "第二日 · 北境大旱",
      speaker: "阿檀", line: "……第五行，可以是我吗？",
      onEnter: ["knowledge:fifth_line_is_you"], next: "scene_02_09c"
    },
    scene_02_10: {
      id: "scene_02_10", chapter: "第二日 · 北境大旱",
      bg: "bg_inn_night.jpg", dark: true,
      narration: [
        "你躺下。",
        "闭上眼睛。",
        "你听见窗外有人走过。脚步声很轻。",
        "然后是第二个。第三个。",
        "你没有睁眼。",
        "你数到了第十七个。"
      ],
      autoDelay: 2800, next: "scene_03_01"
    },

    /* ===== 第三章 · 第三日 · 十七残影（承接 §11.6） ===== */
    scene_03_01: {
      id: "scene_03_01", chapter: "第三日 · 十七残影",
      bg: "bg_throne_hall.jpg",
      narration: [
        "第三日。",
        "前排李司农的位置空着。",
        "膝痕未扫，纸灰犹在。",
        "你跪下时，发现地上多了一行湿墨字——不是你写的。"
      ],
      next: "scene_03_02"
    },
    scene_03_02: {
      id: "scene_03_02", chapter: "第三日 · 十七残影",
      bg: "bg_throne_hall.jpg",
      portrait: { right: "chara_tianshang_calm", rightFx: "tired" },
      speaker: "天殇", line: "第三问。吏治积弊，何以清之？",
      choices: [
        { text: "复旧制：考成法。", kind: "echo", next: "scene_03_safe" },
        { text: "请立考课新法，澄汰冗员。", kind: "propose", verdictText: "准", ending: "E_A3", danger: true },
        { text: "（伏地不语。）", kind: "silence", affinity: { tianshang: -1, atan: +1 }, next: "scene_03_sil" }
      ]
    },
    scene_03_safe: {
      id: "scene_03_safe", chapter: "第三日 · 十七残影",
      bg: "bg_throne_hall.jpg",
      portrait: { right: "chara_tianshang_calm", rightFx: "tired" },
      speaker: "天殇", line: "准。",
      autoDelay: 700, next: "scene_03_after"
    },
    scene_03_after: {
      id: "scene_03_after", chapter: "第三日 · 十七残影",
      bg: "bg_throne_hall.jpg",
      narration: ["退朝。", "廊下无人——", "却有声。"],
      next: "scene_03_night"
    },
    scene_03_sil: {
      id: "scene_03_sil", chapter: "第三日 · 十七残影",
      bg: "bg_throne_hall.jpg",
      narration: ["你低头。", "那行湿墨字，干了。"],
      next: "scene_03_night"
    },
    scene_03_night: {
      id: "scene_03_night", chapter: "第三日 · 十七残影",
      bg: "bg_throne_hall.jpg", dark: true,
      narration: [
        "入夜。",
        "你听见脚步声。一。二。三。",
        "……十七。",
        "你推开殿门。",
        "十七个影子走在同一条廊上，走向同一个结局。",
        "他们没有脸。"
      ],
      onEnter: ["knowledge:k_seventeen"],
      portrait: { left: "chara_shentan_normal" },
      nextIf: [{ if: "state.loop >= 2", next: "scene_03_night_l2" }],
      next: "scene_04_01"
    },
    scene_03_night_l2: {
      id: "scene_03_night_l2", chapter: "第三日 · 十七残影",
      bg: "bg_throne_hall.jpg", dark: true,
      portrait: { left: "chara_shentan_normal" },
      narration: ["沈砚站在第十七个影子里。", "他是第一个『第五位』。"],
      onEnter: ["knowledge:k_truth"],
      speaker: "沈砚", line: "我也是他们之一。天子……也是被写在卷宗上的，是吗。",
      next: "scene_04_01"
    },

    /* ===== 第四章 · 第四日 · 破局 ===== */
    scene_04_01: {
      id: "scene_04_01", chapter: "第四日 · 破局",
      bg: "bg_throne_hall.jpg",
      narration: ["第四日。", "殿上只剩四人——你、沈砚、阿檀，与天子。", "天子没有问。他在等你问。"],
      next: "scene_04_02"
    },
    scene_04_02: {
      id: "scene_04_02", chapter: "第四日 · 破局",
      bg: "bg_throne_hall.jpg",
      portrait: { right: "chara_tianshang_calm", rightFx: "breaking", left: "chara_atan_neutral" },
      speaker: "天殇", line: "第四问。……你，还想问什么？",
      choices: [
        { text: "复旧制：休养生息。", kind: "echo", next: "scene_04_safe" },
        { text: "请……请立新制。", kind: "propose", verdictText: "准", ending: "E_A4", danger: true },
        { text: "（伏地不语。）", kind: "silence", affinity: { tianshang: -1, atan: +1 }, next: "scene_04_sil" },
        { text: "陛下，这卷宗，可是您写的？", kind: "ask", require: "flags.knows_truth === true", next: "scene_04_ask" },
        { text: "（真相）臣要续写卷宗第一行。", kind: "meta", require: "state.loop >= 2 && Game.hasKnowledge('k_throne_back')", hideIfLocked: true, next: "scene_04_secondera" }
      ]
    },
    scene_04_ask: {
      id: "scene_04_ask", chapter: "第四日 · 破局",
      bg: "bg_throne_hall.jpg",
      portrait: { right: "chara_tianshang_calm", rightFx: "breaking" },
      speaker: "天殇", line: "……你想问，这卷宗是谁写的。朕写的。——不。朕，也是被写的。",
      next: "scene_04_ask2"
    },
    scene_04_ask2: {
      id: "scene_04_ask2", chapter: "第四日 · 破局",
      bg: "bg_throne_hall.jpg",
      portrait: { right: "chara_tianshang_calm", rightFx: "breaking", left: "chara_atan_neutral" },
      speaker: "天殇", line: "朕说不出『不准』。那是枷锁，也是钥匙。——你，要试吗？",
      choices: [
        { text: "臣请陛下，说『不准』。", kind: "meta", require: "Game.hasKnowledge('k_throne_back') === true", next: "scene_04_truth" },
        { text: "（退回）复旧制：休养生息。", kind: "echo", next: "scene_04_safe" }
      ]
    },
    scene_04_secondera: {
      id: "scene_04_secondera", chapter: "第四日 · 破局",
      bg: "bg_throne_hall.jpg",
      narration: ["你走向龙椅。", "没有人拦你。", "椅背漆黑，刻满同一行字，层层叠叠。"],
      portrait: { right: "chara_tianshang_calm", rightFx: "breaking" },
      speaker: "天殇", line: "……你要续写第一行？",
      autoDelay: 900, next: "scene_04_secondera2"
    },
    scene_04_secondera2: {
      id: "scene_04_secondera2", chapter: "第四日 · 破局",
      bg: "cg_scroll_closeup.jpg",
      narration: ["你提笔。", "墨落下，才发现——第一行早已写好。", "同一句话，写了两遍。"],
      autoDelay: 1100, ending: "E_C"
    },
    scene_04_truth: {
      id: "scene_04_truth", chapter: "第四日 · 破局",
      bg: "cg_throne_back.jpg",
      narration: ["「臣请陛下，说『不准』。」", "殿上久无人声。", "天子张口。墨字自喉间涌出，却不是『准』。"],
      autoDelay: 1300, next: "scene_04_truth2"
    },
    scene_04_truth2: {
      id: "scene_04_truth2", chapter: "第四日 · 破局",
      bg: "cg_throne_back.jpg",
      portrait: { right: "chara_tianshang_calm", rightFx: "breaking" },
      speaker: "天殇", line: "……不准。",
      autoDelay: 1500, ending: "E_TRUE"
    },
    scene_04_safe: {
      id: "scene_04_safe", chapter: "第四日 · 破局",
      bg: "bg_throne_hall.jpg",
      portrait: { right: "chara_tianshang_calm", rightFx: "breaking" },
      speaker: "天殇", line: "准。",
      autoDelay: 700, next: "scene_04_night"
    },
    scene_04_sil: {
      id: "scene_04_sil", chapter: "第四日 · 破局",
      bg: "bg_throne_hall.jpg",
      narration: ["你没有开口。", "这一次，你什么都没看见。"],
      next: "scene_04_dawn"
    },
    scene_04_night: {
      id: "scene_04_night", chapter: "第四日 · 破局",
      bg: "cg_midnight_palace.jpg", dark: true,
      narration: ["夜深。", "你独留殿中，绕过龙椅。", "椅背漆黑，刻满密密麻麻的字——", "全是同一行，刻了又刻。"],
      onEnter: ["knowledge:k_throne_back"], next: "scene_04_dawn"
    },
    scene_04_dawn: {
      id: "scene_04_dawn", chapter: "第四日 · 破局",
      bg: "bg_throne_hall.jpg", dark: true,
      narration: ["天将明。", "殿门未开，你却已听见——", "铜铃又响了一声。"],
      autoDelay: 1200, ending: "E_B"
    },

    /* ===== 章节回退节拍（§12.2 叙事） ===== */
    scene_recall: {
      id: "scene_recall",
      bg: "bg_throne_hall.jpg", dark: true,
      narration: ["你睁开眼。", "又是同一日的朝堂。", "但你记得。"],
      autoDelay: 1600, next: "$checkpoint"
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
      id: "E_A2", type: "bad", label: "殁", title: "准 · 赈济",
      body: "你抢在李司农之前开了口。「开仓赈济」四字未落，朱笔先到。<em>准</em>。\n你散作一地纸灰，比李司农还快了一步。\n<strong>原来「准」不认人——谁开口，谁偿命。</strong>",
      hint: "提示：李司农也会开口。看着他，别学他。"
    },
    E_A3: {
      id: "E_A3", type: "bad", label: "殁", title: "准 · 考课",
      body: "「请立考课新法。」<em>准</em>。\n三吏之名未及上奏，你已化作墨。\n沈砚在前排，低头数着第几个。\n<strong>夜里那十七个，又多了一个。</strong>",
      hint: "提示：地上的湿墨字，是给谁数的？"
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
    },
    E_PHANTOM: {
      id: "E_PHANTOM", type: "bad", label: "残影", title: "他数到了你",
      body: "你回退了太多次。\n殿门再开时，天殇没有问政。\n他看着你，像看着一个重复了无数遍的字。\n<em>「……又是你。」</em>\n\n卷宗第四行，第一次，写了你的名字。\n<strong>原来残影，也会被记上。</strong>",
      cg: "cg_throne_back.jpg",
      hint: "他发现你了。这一次，没有回退。"
    }
  };

  Game.firstNode = "scene_01_01";
})();

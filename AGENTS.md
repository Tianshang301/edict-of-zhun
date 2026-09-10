# AGENTS.md — 《天殇第二纪元》开发文档

> 本文件面向 AI 编码助手与人类协作者。
> 项目性质：规则怪谈 · 东方宫廷 · 多周目叙事游戏
> 技术形态：原生 HTML / CSS / JavaScript（无框架、无构建步骤、单页）
> 设计参考：橙光式剧情推进 + 视觉小说对话系统 + 规则怪谈的「不可违逆性」

---

## 0. 一句话描述

玩家扮演新入朝的第五位大臣，在天殇的每一次问话中做出抉择；
凡提出新政策者，必被天子以「准」字应允，随即死去。
玩家必须在四日朝议中活下来，并试图打破一个已经重复了无数次的循环。

---

## 1. 核心设计原则（不可动摇的三条铁律）

1. **「准」即死亡**
   只要玩家选择「提出新政策 / 反对意见」，天殇就会说「准」。
   「准」不是恩准，是**执行**。规则需要一条命来兑现。

2. **「休养生息」是唯一免代价的政令**
   因为它是**否定式政令**——它规定「不做什么」。
   否定式不需要「成真」，因此不需要献祭。
   任何**肯定式政令**（要做某事）都必须由一条命来抵消。

3. **循环不可从内部打破**
   玩家不能靠武力、智慧、计谋直接杀死天殇或废除规则。
   唯一的破局点是让天殇说出**「不准」**——
   但天子不能承认自己「不能为」，这是他的枷锁，也是玩家的钥匙。

> 以上三条是所有剧本、分支、结局的判据。
> 任何新增剧情都必须服从，不得出现「提出建议却没死」的漏洞。

---

## 2. 技术栈与工程约定

| 项目 | 约定 |
|---|---|
| 语言 | 原生 HTML5 / CSS3 / ES2020 JavaScript |
| 框架 | 不使用任何框架、不使用打包工具 |
| 文件形态 | 单文件 `index.html` 或 `index.html + css/ + js/ + pictures/ + audio/` 分离 |
| 模块化 | 使用 IIFE 或 ES Module（`<script type="module">`）二选一，不得混用 |
| 状态管理 | 单一 `State` 对象 + 发布订阅，禁止散落全局变量 |
| 资源加载 | 图片懒加载，音频按需加载，首屏资源 ≤ 2MB |
| 浏览器支持 | Chrome / Edge / Safari / Firefox 最近两个大版本 |
| 移动端 | 必须可用，竖屏优先，触控目标 ≥ 44px |
| 无障碍 | 键盘可完整操作，`prefers-reduced-motion` 必须被尊重 |

### 2.1 推荐目录结构

```
/
├── index.html
├── AGENTS.md               ← 本文件
├── css/
│   ├── reset.css
│   ├── theme.css           ← 设计变量（颜色/字体/间距）
│   ├── layout.css          ← 屏幕容器、HUD、模态
│   ├── components.css      ← 按钮、选项、对白框、卷宗
│   └── animations.css      ← 打字机、朱批、消散、转场
├── js/
│   ├── main.js             ← 入口、事件绑定
│   ├── state.js            ← 状态机、存档
│   ├── script-data.js      ← 全部剧本数据（见第 3 节 Schema）
│   ├── engine.js           ← 规则判定、分支跳转、结局触发
│   ├── ui.js               ← 渲染、打字机、模态
│   ├── audio.js            ← 音效管理（可选）
│   └── save.js             ← localStorage 存档 / 读档
├── pictures/               ← 所有图片资源（按用途分子目录）
│   ├── bg/                 ← 背景图
│   ├── chara/              ← 角色立绘（透明底 PNG/WebP）
│   ├── cg/                 ← 事件 CG
│   └── ui/                 ← 按钮、边框、纹样
└── audio/                  ← 音频资源（BGM、音效）
```

### 2.2 命名规范

- CSS 类名：BEM 风格，如 `.dialogue__speaker`、`.choice--danger`
- JS 变量：驼峰；常量全大写；私有方法前缀 `_`
- 剧本节点 ID：`scene_<章节号>_<序号>`，如 `scene_02_01`
- 结局 ID：`E_<字母>`，如 `E_A` / `E_TRUE`
- 立绘文件：`pictures/chara/chara_<角色拼音>_<表情>.webp`，如 `pictures/chara/chara_tianshang_calm.webp`
- 背景文件：`pictures/bg/bg_<场景名>.webp`，如 `pictures/bg/bg_throne_hall.webp`
- CG 文件：`pictures/cg/cg_<事件名>.webp`，如 `pictures/cg/cg_verdict_zhun.webp`
- UI 文件：`pictures/ui/ui_<元素名>.webp`，如 `pictures/ui/ui_scroll_paper.webp`

---

## 3. 剧本数据 Schema

所有剧情必须写成**纯数据**，与渲染逻辑解耦。
`engine.js` 只认字段，不认具体文案。

### 3.1 场景节点（Scene Node）

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `id` | string | ✔ | 节点唯一 ID |
| `chapter` | string | ✔ | 章节标题，如「第一日 · 朝议」 |
| `bg` | string | ✔ | 背景资源路径（相对 `pictures/bg/`） |
| `bgm` | string | ✖ | 背景音乐路径 |
| `narration` | string[] | ✖ | 旁白段落，逐段淡入 |
| `speaker` | string | ✖ | 说话人显示名 |
| `portrait` | object | ✖ | 立绘配置 `{ left, right, focus }`，路径相对 `pictures/chara/` |
| `line` | string | ✖ | 对白正文，打字机输出 |
| `choices` | Choice[] | ✖ | 选项列表；无选项则为纯叙述节点 |
| `next` | string | ✖ | 无选项时的下一节点 |
| `autoDelay` | number | ✖ | 自动跳转延时（ms） |
| `onEnter` | string[] | ✖ | 进入时触发的标记，如 `["flag:saw_ghost"]` |
| `condition` | string | ✖ | 显示条件表达式，如 `flags.week2 === true` |

### 3.2 选项（Choice）

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `text` | string | ✔ | 选项文案 |
| `kind` | enum | ✔ | `echo` 复述 / `propose` 提议 / `silence` 沉默 / `meta` 真相 / `investigate` 调查 / `ask` 反问 |
| `next` | string | ✖ | 跳转节点 |
| `ending` | string | ✖ | 直接触发结局 |
| `flag` | string | ✖ | 设置标记 |
| `affinity` | object | ✖ | 好感度增减，如 `{ tianshang: +1, shentan: -2 }` |
| `require` | string | ✖ | 显示该选项的前置条件 |
| `hideIfLocked` | boolean | ✖ | 条件不满足时隐藏（false 则灰显） |
| `danger` | boolean | ✖ | 是否触发朱批动画 |
| `verdictText` | string | ✖ | 自定义朱批文字（默认「准」） |

### 3.3 结局（Ending）

| 字段 | 类型 | 说明 |
|---|---|---|
| `id` | string | 结局 ID |
| `type` | enum | `bad` / `normal` / `good` / `true` |
| `label` | string | 结局分类标签 |
| `title` | string | 结局标题 |
| `body` | string | 结局正文，支持 `<em>` `<strong>` |
| `cg` | string | 结局 CG 路径（相对 `pictures/cg/`） |
| `unlock` | string[] | 解锁的周目继承内容 |
| `hint` | string | 结局后提示的下一周目方向 |

### 3.4 全局状态（State）

| 字段 | 类型 | 说明 |
|---|---|---|
| `chapter` | number | 当前章节 |
| `nodeId` | string | 当前节点 |
| `flags` | object | 剧情标记集合 |
| `affinity` | object | 好感度：`tianshang` / `shentan` / `lisi` / `atan` |
| `knowledge` | string[] | 已解锁情报条目 |
| `loop` | number | 周目数 |
| `inherited` | object | 继承自上周目的记忆 |
| `history` | array | 选择历史，用于回顾与成就 |
| `deaths` | number | 累计死亡次数 |

### 3.5 存档规范

- 使用 `localStorage`，键名 `tianshang_save_v1`
- 自动存档：每次进入新节点时覆盖 `auto` 槽
- 手动存档：3 个槽位 + 1 个自动槽
- 周目继承：死亡后保留 `knowledge` 与 `loop`，其余清空
- 存档数据结构必须带 `version` 字段，便于未来迁移

---

## 4. 引擎判定逻辑（文字描述，非代码）

```
当玩家选择选项 C：

1. 记录 C 到 history
2. 应用 C.flag / C.affinity / C.knowledge
3. 判断 C.kind：

   ├─ "propose"（提出新政策）
   │    → 触发朱批动画（verdictText）
   │    → 天殇说「准」
   │    → 播放消散 CG
   │    → 触发结局，默认 E_A
   │    → 死亡计数 +1
   │
   ├─ "echo"（复述已有政令）
   │    → 安全，跳转 next
   │    → 若已连续 N 次 echo，解锁隐藏 flag `pure_echo`
   │
   ├─ "silence"（沉默）
   │    → 安全，跳转 next
   │    → 好感度 tianshang -1，阿檀 +1
   │
   ├─ "ask"（反问天殇）
   │    → 需要前置 flag `knows_truth`
   │    → 触发特殊对白，可能解锁 E_TRUE 分支
   │
   ├─ "investigate"（调查）
   │    → 仅在夜间章节可用
   │    → 解锁 knowledge 条目
   │
   └─ "meta"（真相选项）
        → 需要 loop ≥ 2 且 knowledge 完整
        → 通向真结局线
```

**关键约束：**
- `propose` 永远通向死亡，**没有例外**。这是规则怪谈的底色。
- 玩家唯一能改变的是「死法」与「死后知道什么」。
- 破局必须发生在 `ask` / `meta` 分支，而非 `propose`。

---

## 5. 叙事设计规范

### 5.1 节奏模板（每一章）

```
① 环境旁白（2–4 句，建立压迫感）
② 场景描写（1 段，交代当下处境）
③ 角色登场（立绘 + 一句对白）
④ 天殇发问（核心抉择点）
⑤ 玩家选择
⑥ 结果反馈（安全 / 死亡 / 信息）
⑦ 夜间段落（调查 / 对话 / 存档）
```

### 5.2 文本风格约定

- **旁白**：冷静、克制、短句、白描。不抒情，不解释。
- **天殇**：短句，多用「。」和「——」。越来越少话。
- **大臣**：文雅、迂回、有礼。越危险的话越客气。
- **阿檀**：直白、跳跃、像小孩，但句句见血。
- **禁止**：网络用语、吐槽腔、过度比喻、直白解释世界观。

### 5.3 恐怖感来源（优先级从高到低）

1. **规则的不容置疑**——不是有人要害你，是规则本身在碾你
2. **重复中的细微差异**——同一句话，第二次说时少了一个字
3. **数字的异常**——第五位大臣，第四行字，第三日少了一个人
4. **记忆的错位**——你记得沈砚死了，但明天他又站在朝堂上
5. **物理上的不合理**——阿檀没有影子，龙椅背面刻满了字

**不做**：跳脸杀、血腥特写、突然音效。

---

## 6. 开发任务拆解（建议顺序）

| 阶段 | 任务 | 验收标准 |
|---|---|---|
| P0 | 骨架：屏幕切换、状态机、剧本加载 | 可跑通一个节点的完整流程 |
| P0 | 对话系统：打字机、立绘、选项 | 文本逐字输出，选项可点击 |
| P0 | 规则引擎：propose → 朱批 → 死亡结局 | E_A 可稳定触发 |
| P1 | 卷宗系统：随时查看四条规则 | 弹层可开合，键盘 Esc 可关 |
| P1 | 存档系统：自动 + 手动 + 周目继承 | 刷新页面后进度不丢 |
| P1 | 第一章完整剧情（第一日至第四日） | 可通关一次 |
| P2 | 夜间调查系统 | 可解锁 3 条以上情报 |
| P2 | 好感度系统 | 好感度影响对白与选项 |
| P2 | 多周目与记忆继承 | 二周目出现新选项 |
| P3 | 全部结局（≥ 6 个） | 结局图鉴可查看 |
| P3 | 音频系统 | BGM 随章节切换，可静音 |
| P3 | 成就 / 图鉴 | 记录已解锁结局与情报 |

---

## 7. 性能与体验预算

- 首屏可交互时间 < 1.5s（本地打开）
- 单次节点切换动画 < 900ms
- 打字机速度 40–60ms/字，标点处 ×4 停顿
- 朱批动画 1.8–2.2s，不得跳过（可配置）
- 任意时刻内存占用 < 120MB
- 移动端 60fps，低端机不低于 30fps

---

## 8. 禁止事项

- ❌ 不得为 `propose` 增加「侥幸存活」的分支
- ❌ 不得让玩家用道具 / 属性 / 骰子规避规则
- ❌ 不得让天殇解释规则（他自己也被规则困住）
- ❌ 不得使用现代词汇描述古代宫廷
- ❌ 不得在正片中打破第四面墙（只能在真结局中谨慎使用一次）
- ❌ 不得让「沉默」变成最优解（沉默必须付出代价：错失情报）

---

## 9. 术语表

| 术语 | 含义 |
|---|---|
| 休养生息 | 唯一的否定式政令，免代价，永恒有效 |
| 准 | 天殇的应允，实为执行令，需一条命兑现 |
| 提议 | 任何肯定式政令的提出，必死 |
| 复述 | 重复已有政令，安全，但无进展 |
| 循环 | 从元年正月到第四日朝议的完整周期 |
| 第五位 | 玩家的身份，也是循环的编号 |
| 卷宗 | 记录规则的物品，第四行永远不变 |
| 朱批 | 天殇用朱笔写下的「准」，死亡宣告 |

---

## 10. 图片资源与生图提示词

### 10.1 图片存放位置

所有图片资源统一存放在项目根目录下的 `pictures/` 文件夹中，按用途分子目录：

```
pictures/
├── bg/          ← 背景图（1920×1080，WebP 优先）
├── chara/       ← 角色立绘（透明底 PNG/WebP，1200×2000）
├── cg/          ← 事件 CG（1920×1080，WebP 优先）
└── ui/          ← UI 元素（按钮底纹、卷宗纸张、印章等，可平铺或九宫格）
```

命名规则见第 2.2 节。所有图片生成后需按此路径存放，剧本数据中引用相对路径时省略 `pictures/` 前缀，例如 `bg: "bg_throne_hall.webp"` 实际指向 `pictures/bg/bg_throne_hall.webp`。

### 10.2 统一风格锚点（所有图共用）

**正面提示词：**
```
Oriental dark fantasy, ancient Chinese imperial court, ink-wash painting meets baroque chiaroscuro, desaturated palette of bone-white / ink-black / dried-blood red / antique gold, heavy film grain, cinematic lighting, ominous stillness, cyclical dread, minimal but precise detail, no text, no watermark, no signature
```

**负面提示词：**
```
text, watermark, signature, logo, modern clothing, modern architecture, cartoon, anime, chibi, bright colors, saturated, cheerful, cute, low quality, blurry, jpeg artifacts, extra fingers, deformed hands, overexposed
```

### 10.3 图片清单与生图提示词

#### 图 1 · 主视觉 / 封面
**存放：** `pictures/cg/cg_main_visual.webp`
**规格：** 1920×1080，横版
**提示词：**
```
A vast ancient Chinese imperial throne hall at dawn, seen from the back of the court.
Rows of kneeling ministers in dark ceremonial robes, faces hidden.
In the center foreground, an empty kneeling position — the fifth seat — lit by a single cold beam of light.
Far in the distance, a young emperor sits on the dragon throne, half swallowed by shadow, twelve jade strands veiling his face.
Dust motes in the light. Extreme depth of field. Symmetrical composition.
The atmosphere is silent, oppressive, and cyclical.
```

#### 图 2 · 朝堂全景（背景）
**存放：** `pictures/bg/bg_throne_hall.webp`
**规格：** 1920×1080，横版
**提示词：**
```
Interior of an immense ancient Chinese throne hall, hyper-wide shot.
Two rows of towering black lacquered columns receding into darkness.
A distant dragon throne on a raised dais, tiny and unreachable.
No people. Empty. Cold light falling from high windows.
Floor of polished dark stone, faintly reflective, like still water.
The scale is oppressive — the ceiling disappears into black.
```

#### 图 3 · 天殇立绘（常态）
**存放：** `pictures/chara/chara_tianshang_calm.webp`（另有 `_tired`、`_looking`、`_breaking` 变体）
**规格：** 1200×2000，透明底
**提示词：**
```
Character portrait, full body, young Chinese emperor, early twenties, standing.
Pale skin, tired eyes, expression of quiet exhaustion.
Black ceremonial robe with dark gold dragon embroidery, twelve-strand jade veil partially obscuring his face.
One hand holding a red brush, the other hanging loose.
Posture upright but heavy, as if carrying an invisible weight.
Transparent background, soft rim light from above, ink-wash texture on the robe.
```

#### 图 4 · 沈砚立绘
**存放：** `pictures/chara/chara_shentan_normal.webp`（另有 `_dissolving`、`_returned`）
**规格：** 1200×2000，透明底
**提示词：**
```
Character portrait, full body, Chinese scholar-official, around forty, standing.
Blue-grey official robe, ink stains at the hem that never wash out.
Kind, gentle eyes, but slightly hollow — as if not fully present.
He looks solid, but the edges of his silhouette are faintly blurred, like wet ink.
Holding a wooden tablet. Calm, courteous posture.
Transparent background, soft candle light, subtle ink diffusion at the borders.
```

#### 图 5 · 李司农立绘
**存放：** `pictures/chara/chara_lisi_normal.webp`（另有 `_fading_50`、`_fading_80`）
**规格：** 1200×2000，透明底
**提示词：**
```
Character portrait, full body, Chinese official, around fifty, thin and anxious.
Ochre-brown official robe, slightly too large for him.
Sharp, practical eyes, mouth half-open as if about to speak.
His body is subtly dissolving — the left arm and lower robe fading into paper ash and ink particles.
He does not seem to notice.
Transparent background, cold light from the side, ash particles floating upward.
```

#### 图 6 · 阿檀立绘
**存放：** `pictures/chara/chara_atan_neutral.webp`（另有 `_smiling`、`_serious`）
**规格：** 1200×2000，透明底
**提示词：**
```
Character portrait, full body, Chinese maidservant girl, fourteen years old, standing.
Plain white robe, holding a rolled scroll tightly against her chest.
Golden irises, unnaturally bright, staring directly at the viewer.
Her feet do not touch the ground — floating a few centimeters above it.
Small, still, unsettling. No shadow beneath her.
Transparent background, faint golden light from within the scroll.
```

#### 图 7 · 朱批「准」CG
**存放：** `pictures/cg/cg_verdict_zhun.webp`
**规格：** 1920×1080
**提示词：**
```
Close-up of a giant Chinese character "准" written in vermilion red brushstroke, filling the frame.
The stroke is wet, still dripping, with ink splatter radiating outward.
Behind the character, in deep shadow, the faint outline of a pale face — the emperor's — barely visible.
The red is the color of dried blood, not fresh.
Extreme contrast. Black background. The character seems to pulse.
No other text.
```

#### 图 8 · 大臣消散 CG
**存放：** `pictures/cg/cg_minister_dissolve.webp`
**规格：** 1920×1080
**提示词：**
```
A Chinese official in dark robes standing in a vast dark hall, dissolving from the feet upward.
His lower body has become a cloud of black ink dots and grey paper ash, drifting upward.
He is still speaking, mouth open, unaware.
His face is calm, almost relieved.
The hall around him is empty and cold.
Cinematic, tragic, quiet. Not gory. No blood.
```

#### 图 9 · 卷宗特写 CG
**存放：** `pictures/cg/cg_scroll_closeup.webp`
**规格：** 1920×1080
**提示词：**
```
Extreme close-up of an ancient Chinese scroll on a dark wooden desk.
Yellowed paper, frayed edges, four lines of faint ink writing.
The fourth line is darker than the others.
A fifth line is blank.
A single red fingerprint at the corner of the paper.
Candlelight from the left, deep shadows.
No readable text — the writing is blurred and abstract.
```

#### 图 10 · 夜半寝殿 CG
**存放：** `pictures/cg/cg_midnight_palace.webp`
**规格：** 1920×1080
**提示词：**
```
A young emperor sitting alone on the edge of an empty throne in a vast dark hall at night.
He has removed his crown. His hair is loose.
He is speaking to no one, or to someone who is not there.
A single candle on the floor, nearly extinguished.
His shadow on the wall behind him is much larger than he is, and shaped wrong.
Quiet, intimate, deeply lonely.
```

#### 图 11 · 龙椅背面 CG
**存放：** `pictures/cg/cg_throne_back.webp`
**规格：** 1920×1080
**提示词：**
```
Close-up of the back of an ancient Chinese dragon throne, seen from behind.
The dark lacquered wood is covered in thousands of tiny carved characters, densely packed, overlapping.
All of them appear to be the same four characters, carved over and over.
Some are fresh, some are ancient, some are scratched out.
The carving is obsessive, mad, desperate.
Cold light from the side. Deep shadow in the crevices.
No readable text — abstract carved marks only.
```

#### 图 12 · 结局 CG · 循环（E_B）
**存放：** `pictures/cg/cg_ending_loop.webp`
**规格：** 1920×1080
**提示词：**
```
An infinite regression of identical throne halls, layered one behind another like mirrors facing each other.
In each hall, the same young emperor sits on the same throne.
In each hall, the same empty fifth position in the foreground.
The image recedes into darkness, hall after hall after hall.
Cold, symmetrical, vertiginous.
The smallest, farthest emperor is the clearest.
```

#### 图 13 · 结局 CG · 第二纪元（E_C）
**存放：** `pictures/cg/cg_ending_second_era.webp`
**规格：** 1920×1080
**提示词：**
```
A close-up of a hand holding a brush, writing on a scroll.
The hand is writing the first line of the scroll.
But the first line is already written.
The ink is still wet on both.
The same sentence, twice.
In the background, out of focus, a throne and a seated figure.
The focus is entirely on the hand and the doubled line.
```

#### 图 14 · 结局 CG · 真结局（E_TRUE）
**存放：** `pictures/cg/cg_ending_true.webp`
**规格：** 1920×1080
**提示词：**
```
A young emperor standing at the bottom of the throne hall steps, having walked down.
He is no longer wearing his crown. His face is visible for the first time.
He looks tired, but relieved.
Behind him, in the far doorway, four silhouettes stand — the previous ministers, waiting.
In the foreground, a young maidservant closes a scroll.
The hall is still dark, but the light is slightly warmer.
Not a happy ending. A quiet one.
```

#### 图 15 · UI 元素
**存放：**
- `pictures/ui/ui_choice_texture.webp/.jpg` — 选项按钮底纹（暗漆木+暖木纹，`background-blend-mode: overlay`）
- `pictures/ui/ui_scroll_paper.webp/.jpg` — 卷宗弹层背景（旧纸质感，覆盖 `.modal__panel`，`soft-light` 混合）
- `pictures/ui/ui_seal_stamp.png/.webp` — 朱批印章（**必须透明底 PNG/WebP**，`.verdict::after` 闪现）
- `pictures/ui/ui_transition_ink.webp/.jpg` — 转场遮罩（墨入水，用作 `.transition` 亮度掩膜）

**提示词：**（生成后对照 §10.5 自检）

选项按钮底纹：
```
Ancient Chinese lacquered wood texture, dark brown-black, subtle grain, thin gold border, slightly worn, 9-slice friendly, no text
```

卷宗弹层背景：
```
Aged yellow paper texture, rice paper fibers visible, faint ink stains at edges, dark and moody, no text, seamless
```

朱批印章：
```
A square vermilion seal stamp, Chinese seal script, abstract and illegible, slightly smudged, dried blood red, on black background, transparent background
```

转场遮罩：
```
Ink drop spreading in water, black ink diffusing into clear water, slow motion, high contrast, on white background, seamless loop
```

**接入方式（渐进增强）：** UI 图为**可选增强层**。代码用双背景 / 伪元素 / 亮度掩膜接入：**有图显图、无图纯 CSS 兜底**——把图放入 `pictures/ui/` 即自动生效，无需改代码，当前纯 CSS 视觉不退化。

| 文件 | 接入点 | 无图兜底 |
|---|---|---|
| `ui_choice_texture.*` | `.choice` `background-image` 顶层 + `overlay` 混合 | 现有金边渐变 |
| `ui_scroll_paper.*` | `.modal__panel` `background-image` + `soft-light` 混合 | 现有深色渐变 |
| `ui_seal_stamp.png/webp` | `.verdict::after` 关键帧 `seal-flash`（准字落定后闪现） | 现有 CSS「准」字 |
| `ui_transition_ink.*` | `.transition` `mask-image: luminance`（浅水区=黑场、墨团=透出，墨洞转场） | 纯黑场淡入 |

> 规格：
> - 不透明纹理（choice / scroll / transition）可用 JPG（当前即 `.jpg`，1728×960）。
> - **印章必须透明底**（PNG 或 WebP alpha）——JPG 无透明通道，白底印章放黑底朱批上会闪白块，故代码仍指向 `ui_seal_stamp.webp`（休眠）；把透明底图命名为 `ui_seal_stamp.png` 或 `ui_seal_stamp.webp` 即启用。
> - transition 用作 `mask-image`，需**高对比、白底**（白=不透明、墨=镂空）。
> - 一律无可读文字；遵守 §10.2 四色系与负面提示词。

### 10.4 生图优先级建议

| 优先级 | 图片 | 存放路径 | 理由 |
|---|---|---|---|
| P0 | 图 1 封面 | `pictures/cg/cg_main_visual.webp` | 核心视觉，决定第一印象 |
| P0 | 图 3 天殇立绘 | `pictures/chara/chara_tianshang_calm.webp` | 主角立绘，使用频率最高 |
| P0 | 图 7 朱批 CG | `pictures/cg/cg_verdict_zhun.webp` | 规则核心，死亡宣告 |
| P0 | 图 2 朝堂背景 | `pictures/bg/bg_throne_hall.webp` | 使用频率最高的背景 |
| P1 | 图 4 沈砚立绘 | `pictures/chara/chara_shentan_normal.webp` | 主要角色 |
| P1 | 图 5 李司农立绘 | `pictures/chara/chara_lisi_normal.webp` | 主要角色 |
| P1 | 图 6 阿檀立绘 | `pictures/chara/chara_atan_neutral.webp` | 主要角色 |
| P1 | 图 8 消散 CG | `pictures/cg/cg_minister_dissolve.webp` | 关键剧情节点 |
| P1 | 图 9 卷宗特写 | `pictures/cg/cg_scroll_closeup.webp` | 关键剧情节点 |
| P2 | 图 10 夜半寝殿 | `pictures/cg/cg_midnight_palace.webp` | 支线与线索 |
| P2 | 图 11 龙椅背面 | `pictures/cg/cg_throne_back.webp` | 真结局线索 |
| P2 | 图 12–14 结局 CG | `pictures/cg/cg_ending_*.webp` | 通关奖励 |
| P3 | 图 15 UI 元素 | `pictures/ui/ui_*.webp` | 增强层，无图 CSS 兜底 |

### 10.5 风格一致性检查清单

生成每张图后，对照以下条目：

- [ ] 色调是否为「骨白 / 墨黑 / 干血红 / 古金」四色系？
- [ ] 是否避免了一切现代元素？
- [ ] 是否有「重复 / 循环 / 空位」的视觉暗示？
- [ ] 是否克制——没有过度渲染恐怖？
- [ ] 立绘是否为透明底、全身、同一光源方向？
- [ ] 是否没有出现可读文字（避免 AI 文字崩坏）？
- [ ] 是否与图 1 封面放在一起时，像同一个世界？

## 11. 增量剧情：第二章 · 第二日 北境大旱

> 本章接续第一章「第一日 · 休养生息」。
> 核心事件：流民跪殿、李司农登场、第一次目睹「准」字的完整代价。
> 玩家将第一次意识到：规则不是天殇定的，规则是天殇也无法违抗的。

### 11.1 章节概览

| 项目 | 内容 |
|---|---|
| 章节标题 | 第二日 · 北境大旱 |
| 时间 | 天殇第二纪元历元年，正月十六 |
| 地点 | 朝堂 → 馆驿 → 李司农官邸 → 馆驿 |
| 新登场角色 | 李司农（第二位提议者） |
| 核心机制 | 第一次亲眼见证「准」的代价；解锁「消散」CG |
| 章节长度 | 约 25–35 分钟（含夜间段落） |
| 关键抉择点 | 3 个 |
| 可解锁情报 | 4 条 |
| 可触发结局 | E_A（提议者死） |
| 周目差异 | 二周目时，沈砚会提前出现，留下一句警告 |

### 11.2 场景节点数据（Schema 格式）

**节点 2-01 · 朝堂 · 流民入殿**

| 字段 | 值 |
|---|---|
| id | `scene_02_01` |
| chapter | 第二日 · 朝议 |
| bg | `bg_throne_hall.webp` |
| bgm | `bgm_tension_slow.mp3` |
| narration | ①「正月十六。你入朝时，殿门外跪着人。」<br>②「不是官员。是流民。北境来的。」<br>③「他们不敢喊冤。只是跪着。一排。又一排。」<br>④「殿门没有关。天殇没有让人关门。」 |
| speaker | 天殇 |
| line | 「北境大旱。卿等，有何言？」 |
| choices | 见下方 |

选项分支：

| 选项文案 | kind | 结果 |
|---|---|---|
| 「臣附议李司农。」 | echo | → `scene_02_03` |
| 「臣以为，当开仓赈济。」 | propose | → E_A |
| 「臣以为，休养生息即可。」 | echo | → `scene_02_02` |
| （沉默） | silence | → `scene_02_02`（天殇好感 -1，阿檀好感 +1） |

**节点 2-02 · 朝堂 · 李司农出列**

| 字段 | 值 |
|---|---|
| id | `scene_02_02` |
| chapter | 第二日 · 朝议 |
| bg | `bg_throne_hall.webp` |
| portrait | `{ center: "chara_lisi_normal.webp" }` |
| narration | ①「殿上沉默了很久。」<br>②「然后有人出列。」<br>③「你见过他。昨日他还站在你右手边。」<br>④「今日，他的脸色比昨天白了。」 |
| speaker | 李司农 |
| line | 「臣，司农李元。臣以为，北境大旱，流民南下，当开仓赈济。国库虽虚，然民心不可失。」 |
| next | `scene_02_03` |

**节点 2-03 · 朝堂 · 「准」**

| 字段 | 值 |
|---|---|
| id | `scene_02_03` |
| chapter | 第二日 · 朝议 |
| bg | `bg_throne_hall.webp` |
| portrait | `{ left: "chara_tianshang_calm.webp", center: "chara_lisi_normal.webp" }` |
| narration | ①「天殇看着他。」<br>②「看了很久。」<br>③「久到你以为他会说『不准』。」 |
| speaker | 天殇 |
| line | 「准。」 |
| autoDelay | 2200 |
| onEnter | `["flag:watched_lisi_dissolve"]` |
| next | `scene_02_04` |

**节点 2-04 · 消散 CG**

| 字段 | 值 |
|---|---|
| id | `scene_02_04` |
| chapter | 第二日 · 朝议 |
| bg | `cg_minister_dissolve.webp` |
| narration | ①「李司农还站着。」<br>②「但他的脚踝已经不见了。」<br>③「他还在说话。他说，谢陛下。」<br>④「他的声音越来越轻。最后，只剩下纸灰。」<br>⑤「殿上没有人抬头。没有人说话。」 |
| autoDelay | 3200 |
| onEnter | `["knowledge:knows_price", "flag:saw_dissolve"]` |
| next | `scene_02_05` |

**节点 2-05 · 朝堂 · 天殇的疲惫**

| 字段 | 值 |
|---|---|
| id | `scene_02_05` |
| chapter | 第二日 · 朝议 |
| bg | `bg_throne_hall.webp` |
| portrait | `{ center: "chara_tianshang_tired.webp" }` |
| narration | ①「天殇靠在龙椅上。」<br>②「他的手在抖。」<br>③「很小幅度的抖。只有你看见了。」<br>④「他说：退朝。」 |
| speaker | 天殇 |
| line | 「退朝。」 |
| next | `scene_02_06` |

**节点 2-06 · 馆驿 · 夜**

| 字段 | 值 |
|---|---|
| id | `scene_02_06` |
| chapter | 第二日 · 夜 |
| bg | `bg_inn_night.webp` |
| bgm | `bgm_night_quiet.mp3` |
| narration | ①「馆驿的灯很暗。」<br>②「你坐在案前，案上有一卷卷宗。」<br>③「你翻开它。第一行，是休养生息。」<br>④「第二行，是李司农今日说的话。」<br>⑤「第三行，是空的。」 |
| choices | 见下方 |

夜间调查选项：

| 选项文案 | kind | 结果 |
|---|---|---|
| 查看李司农的官邸 | investigate | → `scene_02_07` |
| 翻看卷宗的夹层 | investigate | → `scene_02_08` |
| 直接休息 | silence | → `scene_02_10` |

**节点 2-07 · 李司农官邸 · 空**

| 字段 | 值 |
|---|---|
| id | `scene_02_07` |
| chapter | 第二日 · 夜 |
| bg | `bg_lisi_residence.webp` |
| narration | ①「官邸的门没有锁。」<br>②「你推门进去。桌上有一碗饭。」<br>③「饭还是热的。」<br>④「桌边有一张纸。上面写着：」<br>⑤「『军屯之事，已办妥。北境三万人，可活。』」<br>⑥「落款是李元。日期是今天。」 |
| onEnter | `["knowledge:lisi_saved_people"]` |
| next | `scene_02_09` |

**节点 2-08 · 卷宗夹层**

| 字段 | 值 |
|---|---|
| id | `scene_02_08` |
| chapter | 第二日 · 夜 |
| bg | `cg_scroll_closeup.webp` |
| narration | ①「你翻开卷宗的夹层。」<br>②「里面有一张更旧的纸。」<br>③「上面写着四个字。」<br>④「不是天殇的字。是另一个人的。」<br>⑤「『第四行，永远不会变。』」 |
| onEnter | `["knowledge:fourth_line_never_changes"]` |
| next | `scene_02_09` |

**节点 2-09 · 阿檀出现**

| 字段 | 值 |
|---|---|
| id | `scene_02_09` |
| chapter | 第二日 · 夜 |
| bg | `bg_inn_night.webp` |
| portrait | `{ center: "chara_atan_neutral.webp" }` |
| narration | ①「你回到馆驿时，她坐在你的位置上。」<br>②「抱着那卷卷宗。脚不沾地。」<br>③「她抬头看你，金色瞳孔里没有倒影。」 |
| speaker | 阿檀 |
| line | 「你看见了。」 |
| choices | 见下方 |

阿檀对话选项：

| 选项文案 | kind | 结果 |
|---|---|---|
| 「你是谁？」 | ask | → `scene_02_09a` |
| 「你也记得李司农？」 | ask | → `scene_02_09b` |
| （沉默） | silence | → `scene_02_10`（阿檀好感 -1） |

**节点 2-09a · 阿檀 · 身份**

| 字段 | 值 |
|---|---|
| id | `scene_02_09a` |
| chapter | 第二日 · 夜 |
| speaker | 阿檀 |
| line | 「我是卷宗。卷宗是我。」 |
| next | `scene_02_09c` |

**节点 2-09b · 阿檀 · 记得**

| 字段 | 值 |
|---|---|
| id | `scene_02_09b` |
| chapter | 第二日 · 夜 |
| speaker | 阿檀 |
| line | 「我不记得。我记录。」 |
| next | `scene_02_09c` |

**节点 2-09c · 阿檀 · 警告**

| 字段 | 值 |
|---|---|
| id | `scene_02_09c` |
| chapter | 第二日 · 夜 |
| speaker | 阿檀 |
| line | 「第三行，明天就会有人写上。第四行，永远是那四个字。」<br>「你想让第五行变成什么？」 |
| onEnter | `["flag:met_atan"]` |
| next | `scene_02_10` |

**节点 2-10 · 馆驿 · 睡前**

| 字段 | 值 |
|---|---|
| id | `scene_02_10` |
| chapter | 第二日 · 夜 |
| bg | `bg_inn_night.webp` |
| narration | ①「你躺下。」<br>②「闭上眼睛。」<br>③「你听见窗外有人走过。脚步声很轻。」<br>④「然后是第二个。第三个。」<br>⑤「你没有睁眼。」<br>⑥「你数到了第十七个。」 |
| autoDelay | 2800 |
| next | `scene_03_01` |

### 11.3 新增情报条目

| ID | 情报内容 | 解锁方式 |
|---|---|---|
| `knows_price` | 「准」字需要代价。代价是提议者的存在。 | scene_02_04 自动解锁 |
| `lisi_saved_people` | 李司农的「军屯」救了北境三万人。 | scene_02_07 调查官邸 |
| `fourth_line_never_changes` | 第四行永远不会变。 | scene_02_08 调查夹层 |
| `met_atan` | 阿檀是卷宗的具象化。她记录一切。 | scene_02_09c 自动解锁 |

### 11.4 新增背景资源与生图提示词

**馆驿夜景 · `pictures/bg/bg_inn_night.webp`**

```
Interior of a small ancient Chinese inn room at night, dim candlelight.
A wooden desk with a scroll and an inkstone, a simple bed behind.
Window half-open, moonlight falling on the floor.
A single candle nearly burnt out.
Quiet, lonely, slightly oppressive. No people.
Cold blue moonlight meets warm orange candle glow.
```

**李司农官邸 · `pictures/bg/bg_lisi_residence.webp`**

```
Interior of a modest ancient Chinese official's residence at night, empty.
A wooden table with a bowl of rice still steaming, a piece of paper beside it.
A chair pushed back, as if someone just left.
Candle flickering. No people. The room feels recently abandoned.
Cold light from the window, warm light from the candle.
Quiet, unsettling, sad.
```

### 11.5 多周目差异

| 周目 | 差异 |
|---|---|
| 一周目 | 标准流程。李司农第一次登场，玩家第一次见证消散。 |
| 二周目 | 在 `scene_02_01` 之前插入沈砚的短暂出现。他会说：「你回来了。」然后消失。玩家无法回应。 |
| 三周目 | `scene_02_07` 官邸中多出一封信，是李司农写给玩家的。信里说：「如果还有下一次，请不要附议我。」 |
| 四周目 | `scene_02_09` 阿檀的对话增加一个选项：「第五行，可以是我吗？」选择后解锁隐藏情报 `fifth_line_is_you`。 |

### 11.6 与第三章的衔接

本章结尾的「你数到了第十七个」是伏笔。第三章开头将揭示：那十七个脚步声，是十七位前代大臣的残影。他们在每一次循环中走过同一条走廊，走向同一个结局。玩家在第三章将第一次看见他们。

---

## 12. 存档回退机制（优化方案）

### 12.1 设计原则

规则怪谈的核心体验是**不可逆**。自由读档会摧毁「准」字的神圣感。因此：

- ❌ 不提供随时读档回到选择前。
- ✅ 提供章节级回退，且回退本身具有叙事意义。
- ✅ 死亡不是惩罚，是信息。每次死亡解锁新情报。

### 12.2 章节级回退

| 机制 | 设计 |
|---|---|
| 死亡后 | 回到**本章开头**，而非游戏开头 |
| 继承内容 | 已解锁的 `knowledge`、结局图鉴、周目数 |
| 不继承内容 | 好感度、临时 flag、未解锁的选项 |
| 回退表现 | 不是「读档」，而是「你睁开眼，又是正月十六。但你记得。」 |
| 限制 | 每个章节最多回退 3 次，第 4 次强制进入「残影结局」（天殇发现你在重复） |

### 12.3 情报继承

跨周目保留 `knowledge` 数组。已解锁的情报不会因死亡或回退而丢失。这让「必死」的规则变成叙事资源，而非挫败感来源。

### 12.4 代价回退：朱笔残片

如果玩家坚持回退到**选择前**（而非章节开头），可使用稀有道具：

- **朱笔残片**：使用后回到上一个选择点，但天殇好感 -3，且该选择点的所有 `echo` 选项永久变成灰色。
- 本质：你用了天子的力量篡改自己的记录。天子知道。

### 12.5 状态字段扩展

在 `State` 中新增：

| 字段 | 类型 | 说明 |
|---|---|---|
| `chapterCheckpoint` | string | 当前章节的起始节点 ID |
| `rollbackCount` | number | 本章已回退次数 |
| `hasBrushFragment` | boolean | 是否持有朱笔残片 |
| `rollbackUsedAt` | string[] | 已使用残片的节点 ID 列表 |

---

## 13. 开发任务更新（追加）

| 阶段 | 任务 | 验收标准 |
|---|---|---|
| P1 | 第二章完整剧情（第二日） | 可通关一次，解锁 4 条情报 |
| P1 | 章节级回退机制 | 死亡后回到本章开头，继承情报 |
| P2 | 朱笔残片道具 | 可回退到选择前，有代价 |
| P2 | 夜间调查系统（第二章） | 可调查官邸与卷宗夹层 |
| P3 | 第二章多周目差异 | 二周目沈砚出现，三周目信件，四周目隐藏选项 |
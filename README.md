# 天殇 · 第二纪元

规则怪谈 · 东方宫廷 · 多周目叙事游戏。原生 HTML / CSS / JavaScript，无框架、无构建步骤。

> **在线试玩**：https://tianshang301.github.io/edict-of-zhun/

玩家扮演新入朝的第五位大臣，在天殇的每一次问话中做出抉择。凡提出新政策者，必被天子以「准」字应允，随即死去。须在四日朝议中活下来，并尝试打破一个已重复无数次的循环。

## 运行

直接用浏览器打开 `index.html` 即可（纯静态，无后端）。
或任意静态服务器：

```
python -m http.server 8123
# 访问 http://localhost:8123
```

## 三条铁律

1. **「准」即死亡** —— 提出新政，天殇必批「准」，规则需要一条命兑现。
2. **「休养生息」免代价** —— 唯一的否定式政令，不行则不偿。
3. **循环不可从内部打破** —— 唯一破局点是令天殇说出「不准」。

## 操作

| 操作 | 说明 |
|---|---|
| 点击 / 空格 / 回车 | 推进对白 |
| `C` | 卷宗（四则规则） |
| `S` | 自动存档 |
| `Esc` | 关闭弹层 |
| 点击选项 | 复述 / 提议 / 沉默 / 反问 / 真相 |

## 结局

- **E_A 殁**：提议新政 → 「准」 → 死亡（四日各有变体）。
- **E_B 循环**：四日全数复述旧制，未破规则，元年复始。
- **E_C 第二纪元**：续写卷宗第一行，纪元错格（第二周目起）。
- **E_TRUE 真**：令天子口出「不准」，循环始变（需多周目积累线索）。

## 目录

```
├── index.html
├── css/    reset theme layout components animations
├── js/     state save script-data engine ui main
└── pictures/  bg chara cg ui
```

数据与渲染解耦：`js/script-data.js` 为全部剧本，`js/engine.js` 只认字段。
存档键 `tianshang_save_v1`（localStorage），周目继承保留 `knowledge` 与 `loop`。

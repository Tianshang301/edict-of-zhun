# UI 素材生成指南（pictures/ui/）

> 4 张 UI 图为**可选增强层**：放入 `pictures/ui/` 即自动生效（CSS 双背景/伪元素接入），无图时纯 CSS 兜底，视觉不退化。
> 生成后请对照 AGENTS.md §10.5 风格一致性检查清单。

## 统一风格锚点（四色系 / 负面提示词）

**正面锚点：**
```
Oriental dark fantasy, ancient Chinese imperial court, ink-wash painting meets baroque chiaroscuro, desaturated palette of bone-white / ink-black / dried-blood red / antique gold, heavy film grain, cinematic lighting, ominous stillness, cyclical dread, minimal but precise detail, no text, no watermark, no signature
```

**负面提示词（每条都要附）：**
```
text, watermark, signature, logo, modern clothing, modern architecture, cartoon, anime, chibi, bright colors, saturated, cheerful, cute, low quality, blurry, jpeg artifacts, extra fingers, deformed hands, overexposed
```

---

## 图 A · 选项按钮底纹 `ui_choice_texture.webp`

| 项 | 要求 |
|---|---|
| 尺寸 | 64×64（或 128×128），**九宫格可拉伸** |
| 格式 | WebP（无透明需求） |
| 用途 | `.choice` 按钮 `background-image` 顶层，`background-blend-mode: overlay` |
| 关键 | 中心区域必须可无限拉伸；四角/四边为固定纹理；暗色，不能喧宾夺主（文字需可读） |

**提示词：**
```
Ancient Chinese lacquered wood texture, dark brown-black, subtle grain, thin gold border, slightly worn, 9-slice friendly, no text
```

---

## 图 B · 卷宗弹层背景 `ui_scroll_paper.webp`

| 项 | 要求 |
|---|---|
| 尺寸 | 256×256，**seamless 可平铺** |
| 格式 | WebP |
| 用途 | `.modal__panel`（卷宗/情报/存档）背景，`background-blend-mode: soft-light` |
| 关键 | 上下左右边缘必须无缝衔接；整体偏暗（面板上有深色底渐变）；纤维质感 |

**提示词：**
```
Aged yellow paper texture, rice paper fibers visible, faint ink stains at edges, dark and moody, no text, seamless
```

---

## 图 C · 朱批印章 `ui_seal_stamp.webp`

| 项 | 要求 |
|---|---|
| 尺寸 | 256×256 |
| 格式 | **透明底**：WebP alpha 或 PNG |
| 用途 | `.verdict::after` 朱批动画中「准」字落定后闪现 |
| 关键 | 必须透明底（方形实底会盖住画面）；印章为干血红/暗朱砂；篆书**抽象不可辨读**（防 AI 字崩坏）；边缘可略洇 |

**提示词：**
```
A square vermilion seal stamp, Chinese seal script, abstract and illegible, slightly smudged, dried blood red, on dark background, transparent background
```

---

## 图 D · 转场遮罩 `ui_transition_ink.webp`

| 项 | 要求 |
|---|---|
| 尺寸 | 1920×1080，**可平铺/循环** |
| 格式 | WebP |
| 用途 | `.transition::after` 章节切换墨晕扩散动画 |
| 关键 | 黑墨在（深）水中扩散的高对比影像；中心墨团+放射扩散；无文字 |

**提示词：**
```
Ink drop spreading in water, black ink diffusing into clear water, slow motion, high contrast, on white background, seamless loop
```

---

## 生成后自检（§10.5）

- [ ] 色调是否为「骨白 / 墨黑 / 干血红 / 古金」四色系？
- [ ] 是否避免了一切现代元素？
- [ ] 是否没有出现可读文字？
- [ ] 是否克制——没有过度渲染？
- [ ] 纹理图是否可拉伸/平铺无缝？印章是否透明底？
- [ ] 与封面 `cg_main_visual` 放在一起时，像同一个世界？

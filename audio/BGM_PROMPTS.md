# BGM 生音提示词 — 《天殇 · 第二纪元》

> 面向 Suno / Udio 等 AI 音乐生成（提示词用英文效果最佳，配合下方「统一风格锚点」）。
> 生成后按 §接入约定 放入 `audio/bgm/`，由引擎随章节/昼夜切换播放（audio.js 钩子已就绪）。
> 时长建议 60–90s 无缝循环；无人声；忌欢快。

## 统一风格锚点（所有 BGM 共用）

```
Chinese ancient court music, Tang-Song dynasty ceremonial and literary style, guqin zither, xiao flute, guzheng plucks, deep taiko drum, temple bells, sparse and minimal arrangement, slow tempo 50-70 BPM, dark ambient, ominous stillness, cyclical dread, dry reverb, lo-fi weathered texture, cinematic, desaturated mood, no vocals, no melody too bright, seamless loop
```

**负面提示词：**
```
vocals, lyrics, singing, modern pop, EDM, dubstep, brass section, cheerful, upbeat, major key brightness, overproduced, auto-tune, sound effects, chatter, noise
```

## 曲目清单

| # | 文件名（接入用） | 用途 / 场景 | 提示词（英文，贴到生成器） |
|---|---|---|---|
| 1 | `audio/bgm/bgm_title.mp3` | 标题屏主旋律 | `Ethereal dark ancient Chinese court theme, lone guqin phrase answered by distant temple bell, long reverb, a young emperor waiting alone, circular melody that returns to its own beginning, sparse, 60 BPM, ominous patience, seamless loop` |
| 2 | `audio/bgm/bgm_throne_day.mp3` | 朝堂 · 白昼问政 | `Vast ancient throne hall ambience, two-note low taiko heartbeat, muted court flute, kneeling silence, oppressive authority, very sparse, no melody line, 50 BPM, tension without release, seamless loop` |
| 3 | `audio/bgm/bgm_tension.mp3` | 北境大旱 / 流民跪殿 / 李司农出列 | `Slow rising dread, tremolo guzheng, distant thunder, crowd murmur implied by air noise, halting phrase that never resolves, 55 BPM, warning atmosphere, thin and cold, seamless loop` |
| 4 | `audio/bgm/bgm_night.mp3` | 馆驿 · 夜 | `Lonely candlelit room at night, single xiao flute line, faint guqin, distant footsteps rhythm, hollow and quiet, 45 BPM, fragile solitude, breath space between notes, seamless loop` |
| 5 | `audio/bgm/bgm_residue.mp3` | 十七残影 / 夜间调查 | `Uncanny march of ghost footsteps, plucked guzheng staccato like counting, one repeated note for many measures, sparse low drone underneath, unsettling repetition, 65 BPM, wrongness in the pattern, seamless loop` |
| 6 | `audio/bgm/bgm_verdict.mp3` | 朱批「准」后 / 消散 | `Heavy verdict strike, single taiko hit echoing into silence, ink-drip tick, somber temple bell toll, near-silence afterward, cold, final, 40 BPM, a life being taken without flourish, seamless loop` |
| 7 | `audio/bgm/bgm_loop.mp3` | E_B 循环结局 | `Infinite regression of the same hall, mirrored motif played twice slightly softer, guqin phrase returning, vertigo without resolution, hushed, cyclical, 55 BPM, resignation, seamless loop` |
| 8 | `audio/bgm/bgm_second_era.mp3` | E_C 第二纪元结局 | `A thin thread of hope, warmer guqin tone, single high xiao note answered once, first ray of dawn, still minor-key but less heavy, 60 BPM, quiet turning, seamless loop` |
| 9 | `audio/bgm/bgm_true.mp3` | E_TRUE 真结局 | `Silence after a long night, almost empty, one guqin chord held long, distant bell fading, relieved emptiness, extremely sparse, 40 BPM, peace not happiness, seamless loop` |

## 可选音效（SFX，非循环，短片段）

| 文件名 | 用途 | 提示词 |
|---|---|---|
| `audio/sfx/sfx_brush.mp3` | 朱笔落纸「准」 | `One sharp wet ink-brush stroke on paper, dry room tone, single gesture, 1 second` |
| `audio/sfx/sfx_bell.mp3` | 铜铃 / 转场 | `One distant bronze temple bell toll, long decay, cold and alone, 3 seconds` |
| `audio/sfx/sfx_ash.mp3` | 消散 / 纸灰 | `Fine ash and paper particles drifting, barely audible hiss and settle, eerie quiet, 3 seconds` |

## 接入约定

- BGM 路径统一为 `audio/bgm/<文件名>.mp3`（mp3 优先，ogg 可）。
- 生成后将文件放入 `audio/bgm/`，告知我，我即按 `script-data` 节点补 `bgm` 字段 + `audio.js` 随章节/昼夜自动切换（复用现有静音开关）。
- SFX 路径 `audio/sfx/<文件名>.mp3`，接入朱批/消散动画。
- 缺失时引擎静默跳过（渐进增强），纯文字体验不退化。

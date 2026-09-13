/* state.js — 单一 State 对象 + 发布订阅 + 白名单条件求值
 * 不变量：Game.state 只允许在本文件内被「整体替换」（_resetFull / load 经 _normalizeState），
 *         外部一律通过 Game.setState 做原地补丁；任何对 state 的直改都应收敛到这里的 API。
 */
(function () {
  "use strict";
  const Game = window.Game = window.Game || {};

  const DEFAULT_STATE = {
    version: 1,
    chapter: "",
    nodeId: "scene_01_01",
    chapterCheckpoint: "scene_01_01",
    rollbackCount: 0,
    hasBrushFragment: false,
    rollbackUsedAt: [],
    flags: {},
    affinity: { tianshang: 0, shentan: 0, lisi: 0, atan: 0 },
    knowledge: [],
    loop: 1,
    inherited: {},
    history: [],
    deaths: 0,
    settings: { typewriter: true, autoPlay: false, verdictSkippable: false },
    meta: { createdAt: 0 }
  };

  /* 全局时间常量（避免魔法数字散落） */
  Game.consts = {
    SAVE_DEBOUNCE: 400,        /* 自动存档防抖（ms） */
    BG_SWAP_CLEANUP: 900,      /* 背景交叉淡入后清理旧层（ms） */
    DISSOLVE_MS: 2400,         /* 消散动画时长（ms） */
    FLASH_RESTORE_MS: 1200,    /* 按钮微脉冲恢复文案（ms） */
    TRANSITION_OFF_MS: 650     /* 章节转场熄灯时长（ms） */
  };

  Game.state = clone(DEFAULT_STATE);
  Game.state.meta.createdAt = Date.now();

  function clone(o) { return JSON.parse(JSON.stringify(o)); }
  Game.clone = clone;

  /* ---- 状态规范化：以 DEFAULT_STATE 为基底深合并（对象递归 / 数组替换），
         用于读档与一切「整体重置」，保证新字段永远存在 ---- */
  function merge(base, extra) {
    for (const k in extra) {
      const ev = extra[k];
      if (ev && typeof ev === "object" && !Array.isArray(ev)) {
        const bv = base[k];
        base[k] = merge(bv && typeof bv === "object" && !Array.isArray(bv) ? bv : {}, ev);
      } else {
        base[k] = ev;
      }
    }
    return base;
  }
  Game._normalizeState = function (partial) {
    return merge(clone(DEFAULT_STATE), partial || {});
  };

  /* ---- 发布订阅 ---- */
  const subs = {};
  Game.subscribe = function (evt, fn) {
    (subs[evt] = subs[evt] || []).push(fn);
    return function unsub() {
      const a = subs[evt]; if (!a) return;
      const i = a.indexOf(fn); if (i > -1) a.splice(i, 1);
    };
  };
  Game.publish = function (evt, payload) {
    (subs[evt] || []).slice().forEach(function (fn) {
      try { fn(payload); } catch (e) { console.error("[pub]", evt, e); }
    });
  };

  Game.setState = function (patch) {
    Object.assign(Game.state, patch);
    Game.publish("state:change", Game.state);
  };

  /* ---- 标记 / 情报 / 好感 ---- */
  Game.hasFlag = function (f) { return !!Game.state.flags[f]; };
  Game.setFlag = function (f, v) { Game.state.flags[f] = (v === undefined ? true : v); };
  Game.clearFlag = function (f) { delete Game.state.flags[f]; };

  Game.hasKnowledge = function (k) { return Game.state.knowledge.indexOf(k) > -1; };
  Game.addKnowledge = function (k) {
    if (!Game.hasKnowledge(k)) {
      Game.state.knowledge.push(k);
      Game.publish("knowledge:add", k);
    }
    if (k === "k_truth") Game.setFlag("knows_truth");
  };

  Game.adjustAffinity = function (obj) {
    for (const k in obj) Game.state.affinity[k] = (Game.state.affinity[k] || 0) + obj[k];
  };

  Game.pushHistory = function (rec) {
    Game.state.history.push(rec);
    if (Game.state.history.length > 200) Game.state.history.shift();
  };

  /* ---- 朱笔残片（§12.4）：状态修改全部经此 API ---- */
  Game.grantBrushFragment = function () { if (!Game.state.hasBrushFragment) Game.state.hasBrushFragment = true; };
  Game.revokeBrushFragment = function () { Game.state.hasBrushFragment = false; };
  Game.isEchoBurned = function (nodeId) { return (Game.state.rollbackUsedAt || []).indexOf(nodeId) > -1; };
  Game.markEchoBurned = function (nodeId) {
    if (Game.state.rollbackUsedAt.indexOf(nodeId) < 0) Game.state.rollbackUsedAt.push(nodeId);
  };

  /* ---- 整体重置的统一出口：carry 列出「保留什么」，其余回 DEFAULT_STATE ---- */
  Game._resetFull = function (carry) {
    const s = Game._normalizeState(carry);
    s.meta.createdAt = Date.now();
    Game.state = s;
    Game.publish("state:change", Game.state);
  };

  /* 周目继承：完整循环后只留 knowledge / loop / deaths / inherited / settings */
  Game.resetForLoop = function () {
    Game._resetFull({
      knowledge: Game.state.knowledge.slice(),
      loop: Game.state.loop,
      deaths: Game.state.deaths,
      inherited: clone(Game.state.inherited || {}),
      settings: clone(Game.state.settings)
    });
  };

  /* 章节级回退（§12）：保留 knowledge / loop / deaths / 章节进度 / 残片状态，
     清空 flags / 好感度 / 临时选项，回到 chapterCheckpoint */
  Game.resetForChapterRollback = function () {
    Game._resetFull({
      knowledge: Game.state.knowledge.slice(),
      loop: Game.state.loop,
      deaths: Game.state.deaths,
      chapter: Game.state.chapter,
      chapterCheckpoint: Game.state.chapterCheckpoint,
      rollbackCount: Game.state.rollbackCount,
      hasBrushFragment: Game.state.hasBrushFragment,
      rollbackUsedAt: (Game.state.rollbackUsedAt || []).slice(),
      settings: clone(Game.state.settings)
    });
  };

  /* ---- 条件表达式求值：白名单 mini-evaluator（无 eval / 无 new Function / 无 with）
   文法（与 script-data 现存用法一一对应）：
     expr       := and ( '||' and )*
     and        := cmp ( '&&' cmp )*
     cmp        := unary ( '==='|'=='|'!=='|'!='|'>='|'<='|'>'|'<' ) unary
     unary      := '!' unary | primary
     primary    := number | 'true' | 'false' | string | call | path | '(' expr ')'
     call       := 'Game' '.' <白名单函数> '(' string ')'
     path       := ( 'state' | 'flags' ) ( '.' ident )+
   路径按 'state.' 解析到 Game.state、'flags.' 解析到 Game.state.flags。
   白名单函数仅 hasKnowledge('…')；非法 token / 未知根 / 未知函数 → warn + false。 */
  const CALL_WHITELIST = {
    hasKnowledge: function (v) { return Game.hasKnowledge(String(v)); }
  };
  const UNDEF = undefined;

  function tokenize(src) {
    const toks = []; let i = 0;
    while (i < src.length) {
      const ch = src.charAt(i);
      if (ch === " " || ch === "\t" || ch === "\n" || ch === "\r") { i++; continue; }
      const three = src.substr(i, 3);
      if (three === "===" || three === "!==") { toks.push({ t: three }); i += 3; continue; }
      const two = src.substr(i, 2);
      if (two === ">=" || two === "<=" || two === "&&" || two === "||") {
        toks.push({ t: two }); i += 2; continue;
      }
      if (two === "==" || two === "!=") { toks.push({ t: two }); i += 2; continue; }
      if ("()<>=!".indexOf(ch) > -1) { toks.push({ t: ch }); i++; continue; }
      if (ch === "'" || ch === "\"") {
        let j = i + 1, s = "";
        while (j < src.length && src.charAt(j) !== ch) {
          if (src.charAt(j) === "\\" && j + 1 < src.length) { s += src.charAt(j + 1); j += 2; }
          else { s += src.charAt(j); j++; }
        }
        if (j >= src.length) return null; /* 未闭合字符串 */
        toks.push({ t: "str", v: s }); i = j + 1; continue;
      }
      if (/\d/.test(ch)) {
        let j = i;
        while (j < src.length && /[0-9.]/.test(src.charAt(j))) j++;
        const num = parseFloat(src.slice(i, j));
        if (isNaN(num)) return null;
        toks.push({ t: "num", v: num }); i = j; continue;
      }
      if (/[A-Za-z_$]/.test(ch)) {
        let j = i;
        while (j < src.length && /[A-Za-z0-9_$.]/.test(src.charAt(j))) j++;
        const w = src.slice(i, j);
        toks.push(w === "true" || w === "false" ? { t: "bool", v: w === "true" } : { t: "ident", v: w });
        i = j; continue;
      }
      return null; /* 未知字符 */
    }
    toks.push({ t: "eof" });
    return toks;
  }

  function resolvePath(path) {
    let base, kind, rest;
    if (path.indexOf("state.") === 0) { base = Game.state; kind = "state"; rest = path.slice(6); }
    else if (path.indexOf("flags.") === 0) { base = Game.state.flags; kind = "flags"; rest = path.slice(6); }
    else { invalid = true; return UNDEF; } /* 未知根：非法 */
    const segs = rest.split(".");
    for (let i = 0; i < segs.length; i++) {
      const seg = segs[i];
      if (base == null || typeof base !== "object" || !(seg in base)) {
        /* state.* 是固定 schema：缺失多半是拼错；flags.* 是动态集合：未置顶属正常 */
        if (kind === "state") invalid = true;
        return UNDEF;
      }
      base = base[seg];
      if (base === undefined) return UNDEF;
    }
    return base;
  }

  let tk = [], pos = 0, invalid = false;
  function peek() { return tk[pos]; }
  function next() { return tk[pos++]; }
  function parseOr() {
    let left = parseAnd();
    while (peek().t === "||") { next(); const r = parseAnd(); left = left || r; }
    return left;
  }
  function parseAnd() {
    let left = parseCmp();
    while (peek().t === "&&") { next(); const r = parseCmp(); left = left && r; }
    return left;
  }
  function parseCmp() {
    let left = parseUnary();
    const t = peek().t;
    if (t === "===" || t === "==" || t === "!==" || t === "!=" || t === ">=" || t === "<=" || t === ">" || t === "<") {
      next(); const right = parseUnary();
      if (t === "===" || t === "==") return left === right;
      if (t === "!==" || t === "!=") return left !== right;
      if (t === ">=") return left >= right;
      if (t === "<=") return left <= right;
      if (t === ">") return left > right;
      return left < right;
    }
    return left;
  }
  function parseUnary() {
    if (peek().t === "!") { next(); return !parseUnary(); }
    return parsePrimary();
  }
  function parsePrimary() {
    const tok = peek();
    if (tok.t === "(") { next(); const v = parseOr(); next(); return v; }
    if (tok.t === "num" || tok.t === "bool" || tok.t === "str") { next(); return tok.v; }
    if (tok.t === "ident") {
      next();
      if (tok.v.indexOf("Game.") === 0) {
        const fn = CALL_WHITELIST[tok.v.slice(5)];
        if (!fn || peek().t !== "(") { invalid = true; return UNDEF; }
        next();
        const arg = peek();
        if (arg.t !== "str") { invalid = true; return UNDEF; }
        next();
        if (peek().t !== ")") { invalid = true; return UNDEF; }
        next();
        return fn(arg.v);
      }
      return resolvePath(tok.v);
    }
    invalid = true; /* 意外 token */
    return UNDEF;
  }

  Game.evalCondition = function (expr) {
    if (!expr) return true;
    tk = tokenize(String(expr));
    if (!tk) { console.warn("[cond] tokenize fail:", expr); return false; }
    pos = 0; invalid = false;
    const result = parseOr();
    if (invalid || peek().t !== "eof") {
      console.warn("[cond] parse fail:", expr);
      return false;
    }
    return !!result;
  };
})();
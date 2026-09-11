/* state.js — 单一 State 对象 + 发布订阅 */
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

  Game.state = clone(DEFAULT_STATE);
  Game.state.meta.createdAt = Date.now();

  function clone(o) { return JSON.parse(JSON.stringify(o)); }
  Game.clone = clone;

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

  /* ---- 周目继承：完整循环后只留 knowledge / loop / deaths / inherited ---- */
  Game.resetForLoop = function () {
    const carry = {
      knowledge: Game.state.knowledge.slice(),
      loop: Game.state.loop,
      deaths: Game.state.deaths,
      inherited: clone(Game.state.inherited || {}),
      settings: clone(Game.state.settings)
    };
    Game.state = clone(DEFAULT_STATE);
    Game.state.knowledge = carry.knowledge;
    Game.state.loop = carry.loop;
    Game.state.deaths = carry.deaths;
    Game.state.inherited = carry.inherited;
    Game.state.settings = carry.settings;
    Game.state.meta.createdAt = Date.now();
    Game.publish("state:change", Game.state);
  };

  /* ---- 章节级回退（§12）：保留 knowledge / loop / deaths / 章节进度，
       清空 flags / 好感度 / 临时选项，回到 chapterCheckpoint ---- */
  Game.resetForChapterRollback = function () {
    const carry = {
      knowledge: Game.state.knowledge.slice(),
      loop: Game.state.loop,
      deaths: Game.state.deaths,
      chapter: Game.state.chapter,
      chapterCheckpoint: Game.state.chapterCheckpoint,
      rollbackCount: Game.state.rollbackCount,
      hasBrushFragment: Game.state.hasBrushFragment,
      rollbackUsedAt: (Game.state.rollbackUsedAt || []).slice(),
      settings: clone(Game.state.settings)
    };
    Game.state = clone(DEFAULT_STATE);
    Game.state.knowledge = carry.knowledge;
    Game.state.loop = carry.loop;
    Game.state.deaths = carry.deaths;
    Game.state.chapter = carry.chapter;
    Game.state.chapterCheckpoint = carry.chapterCheckpoint;
    Game.state.rollbackCount = carry.rollbackCount;
    Game.state.hasBrushFragment = carry.hasBrushFragment;
    Game.state.rollbackUsedAt = carry.rollbackUsedAt;
    Game.state.settings = carry.settings;
    Game.state.meta.createdAt = Date.now();
    Game.publish("state:change", Game.state);
  };

  /* ---- 条件表达式求值（纯数据剧本用） ---- */
  Game.evalCondition = function (expr) {
    if (!expr) return true;
    try {
      const fn = new Function(
        "state", "Game",
        "with (state) { return (" + expr + "); }"
      );
      return !!fn(Game.state, Game);
    } catch (e) {
      console.warn("[cond] eval fail:", expr, e);
      return false;
    }
  };
})();

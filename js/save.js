/* save.js — localStorage 存档 / 读档 / 周目继承
 * 版本协议：SAVE_VERSION 递增时，在 MIGRATORS 补一个迁移函数；
 *           load 统一走 _normalizeState 兜底补齐缺省字段。
 */
(function () {
  "use strict";
  const Game = window.Game = window.Game || {};
  const KEY = "tianshang_save_v1";

  const SAVE_VERSION = 1;
  const MIGRATORS = {
    /* 【示例】v1→v2: function (s) { s.newField = s.newField || 0; return s; } */
    1: function (s) { return s; }
  };
  Game.saveVersion = SAVE_VERSION;
  Game.saveMigrators = MIGRATORS;

  function readAll() {
    try { return JSON.parse(localStorage.getItem(KEY) || "{}") || {}; }
    catch (e) { return {}; }
  }
  function writeAll(all) {
    try { localStorage.setItem(KEY, JSON.stringify(all)); return true; }
    catch (e) { console.error("[save] write fail", e); return false; }
  }

  function migrate(state, fromVersion) {
    let s = state && typeof state === "object" ? state : {};
    for (let v = fromVersion; v < SAVE_VERSION; v++) {
      const m = MIGRATORS[v];
      if (typeof m === "function") s = m(s) || s;
    }
    s.version = SAVE_VERSION;
    return s;
  }

  function pack() {
    return { version: SAVE_VERSION, state: Game.clone(Game.state), ts: Date.now() };
  }
  function slotLabel(s) { return s === "auto" ? "自动" : ("存档 " + s); }
  function fmt(ts) {
    if (!ts) return "空";
    const d = new Date(ts);
    const p = function (n) { return (n < 10 ? "0" : "") + n; };
    return d.getFullYear() + "-" + p(d.getMonth() + 1) + "-" + p(d.getDate()) +
      " " + p(d.getHours()) + ":" + p(d.getMinutes());
  }

  Game.save = function (slot) {
    slot = slot || "auto";
    const all = readAll();
    all[slot] = pack();
    const ok = writeAll(all);
    Game.publish("save:done", slot);
    return ok;
  };

  Game.load = function (slot) {
    slot = slot || "auto";
    const all = readAll();
    const packed = all[slot];
    if (!packed) return false;
    const ver = typeof packed.version === "number" ? packed.version : 0;
    if (ver > SAVE_VERSION) {
      console.error("[save] 存档来自更新版本，已拒载（save v" + ver + " > 当前 v" + SAVE_VERSION + "）");
      return false;
    }
    let raw;
    try { raw = migrate(Game.clone(packed.state || {}), ver); }
    catch (e) { console.error("[save] 存档迁移失败", e); return false; }
    Game.state = Game._normalizeState(raw);
    Game.publish("state:change", Game.state);
    Game.publish("load:done", slot);
    return true;
  };

  Game.deleteSave = function (slot) {
    const all = readAll();
    delete all[slot];
    writeAll(all);
    Game.publish("save:done", slot);
  };

  Game.listSaves = function () { return readAll(); };
  Game.hasSave = function (slot) { return !!readAll()[slot || "auto"]; };

  Game.saveInfo = function (slot) {
    const s = readAll()[slot];
    if (!s) return null;
    return {
      ts: s.ts,
      loop: s.state && s.state.loop,
      nodeId: s.state && s.state.nodeId,
      chapter: s.state && s.state.chapter,
      label: slotLabel(slot),
      fmt: fmt(s.ts)
    };
  };

  Game.saveUiMeta = { slotLabel: slotLabel, fmt: fmt };
})();
/* save.js — localStorage 存档 / 读档 / 周目继承 */
(function () {
  "use strict";
  const Game = window.Game = window.Game || {};
  const KEY = "tianshang_save_v1";

  function readAll() {
    try { return JSON.parse(localStorage.getItem(KEY) || "{}") || {}; }
    catch (e) { return {}; }
  }
  function writeAll(all) {
    try { localStorage.setItem(KEY, JSON.stringify(all)); return true; }
    catch (e) { console.error("[save] write fail", e); return false; }
  }

  function pack() {
    return { version: 1, state: Game.clone(Game.state), ts: Date.now() };
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
    if (!all[slot]) return false;
    Game.state = all[slot].state;
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

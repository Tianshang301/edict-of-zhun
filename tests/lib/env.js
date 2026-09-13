"use strict";
/* tests/lib/env.js — 共享测试环境：全局桩 / 加载器 / 断言 / 状态工厂 */
const fs = require("fs");
const path = require("path");

const REPO = path.join(__dirname, "..", "..");
const store = {};
const audioCreated = [];
const DEFAULT_STATE = {
  version: 1, chapter: "", nodeId: "scene_01_01", chapterCheckpoint: "scene_01_01",
  rollbackCount: 0, hasBrushFragment: false, rollbackUsedAt: [],
  flags: {}, affinity: { tianshang: 0, shentan: 0, lisi: 0, atan: 0 },
  knowledge: [], loop: 1, inherited: {}, history: [], deaths: 0,
  settings: { typewriter: true, autoPlay: false, verdictSkippable: false },
  meta: { createdAt: 0 }
};

let _ready = false;
function setup(opts) {
  opts = opts || {};
  if (_ready) return;
  _ready = true;
  global.window = global;
  global.localStorage = {
    getItem: (k) => (k in store ? store[k] : null),
    setItem: (k, v) => { store[k] = String(v); },
    removeItem: (k) => { delete store[k]; },
    clear: () => { for (const k in store) delete store[k]; }
  };
  global.requestAnimationFrame = (fn) => setTimeout(fn, 0);
  global.addEventListener = function () {};
  global.matchMedia = () => ({ matches: !!opts.reduceMotion, addListener() {}, removeListener() {} });
  global.confirm = () => true;
  global.Audio = class {
    constructor(src) { this.src = src; this.dataset = {}; this.played = false; this.paused = false; audioCreated.push(this); }
    play() { this.played = true; return Promise.resolve(); }
    pause() { this.paused = true; }
    addEventListener() {}
  };
}

function load(file) {
  const p = path.join(REPO, String(file).replace(/^\//, ""));
  (0, eval)(fs.readFileSync(p, "utf8"));
}

const R = { pass: 0, fail: 0 };
function ok(cond, msg) {
  if (cond) { R.pass++; console.log("  ok  " + msg); }
  else { R.fail++; console.log("  FAIL " + msg); }
}
function end(label) {
  console.log("== " + label + ": " + R.pass + " passed, " + R.fail + " failed ==");
  process.exit(R.fail ? 1 : 0);
}

function freshState() { return JSON.parse(JSON.stringify(DEFAULT_STATE)); }

module.exports = { REPO, store, audioCreated, setup, load, ok, end, freshState };
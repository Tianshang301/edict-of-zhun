/* audio.js — 语音 / BGM 播放（渐进增强：有文件则播，缺失静默跳过） */
(function () {
  "use strict";
  const Game = window.Game = window.Game || {};
  const audio = Game.audio = {};

  /* 说话人 → 文件名 token（与 audio/voice/<nodeId>_<token>.wav 一致） */
  const SPEAKER_TOKEN = {
    "天殇": "tianshang",
    "沈砚": "shenyan",
    "李司农": "lisinong",
    "阿檀": "atan"
  };

  const MUTE_KEY = "tianshang_audio_muted";
  let muted = false;
  try { muted = localStorage.getItem(MUTE_KEY) === "1"; } catch (e) {}

  let voice = null;       /* 当前语音 <audio> */
  let bgm = null;         /* 当前 BGM <audio> */

  /* ---- 语音 ---- */
  function voicePath(node) {
    if (!node || !node.line || !node.speaker) return null;
    const tok = SPEAKER_TOKEN[node.speaker];
    if (!tok) return null;
    return "audio/voice/" + node.id + "_" + tok + ".wav";
  }

  audio.playFor = function (node) {
    if (muted) return;
    if (voice) { voice.pause(); voice = null; }
    const p = voicePath(node);
    if (!p) return;
    const a = new Audio(p);
    a.preload = "auto";
    a.volume = 1;
    a.addEventListener("error", function () { /* 缺失/损坏 → 静默 */ });
    a.play().catch(function () { /* 自动播放受限 → 静默 */ });
    voice = a;
  };

  audio.stop = function () {
    if (voice) { voice.pause(); voice = null; }
  };

  /* ---- BGM ---- */
  const BGM_DIR = "audio/bgm/";
  const BGM = {
    title:   "bgm_title.mp3",
    throne:  "bgm_throne_day.mp3",
    tension: "bgm_tension.mp3",
    night:   "bgm_night.mp3",
    residue: "bgm_residue.mp3",
    verdict: "bgm_verdict.mp3",
    loop:    "bgm_loop.mp3",
    second:  "bgm_second_era.mp3",
    true:    "bgm_true.mp3"
  };

  /* 特殊时刻节点 → BGM；其余按 夜晚→night / 白昼→throne 兜底 */
  const NODE_BGM = {
    scene_02_01: BGM.tension, scene_02_02: BGM.tension,
    scene_02_03: BGM.verdict, scene_02_04: BGM.verdict,
    scene_02_05: BGM.tension, scene_02_10: BGM.residue,
    scene_03_01: BGM.tension, scene_03_02: BGM.tension,
    scene_03_night: BGM.residue, scene_03_night_l2: BGM.residue,
    scene_04_01: BGM.tension, scene_04_02: BGM.tension,
    scene_04_ask: BGM.tension, scene_04_ask2: BGM.tension,
    scene_04_truth: BGM.tension, scene_04_truth2: BGM.true,
    scene_04_secondera2: BGM.second, scene_04_dawn: BGM.loop
  };
  const ENDING_BGM = {
    E_A1: BGM.verdict, E_A2: BGM.verdict, E_A3: BGM.verdict, E_A4: BGM.verdict,
    E_B: BGM.loop, E_C: BGM.second, E_TRUE: BGM.true, E_PHANTOM: BGM.loop
  };

  function bgmFor(node) {
    if (!node) return null;
    if (NODE_BGM[node.id]) return NODE_BGM[node.id];
    if (node.dark) return BGM.night;
    return BGM.throne;
  }

  audio.playBgm = function (file) {
    if (!file || muted) return;
    const src = BGM_DIR + file;
    if (bgm && bgm.dataset.src === src) return;   /* 同曲不重启 */
    if (bgm) { bgm.pause(); bgm = null; }
    const b = new Audio(src);
    b.loop = true;
    b.volume = 0.45;
    b.preload = "auto";
    b.dataset.src = src;
    b.play().catch(function () {});
    bgm = b;
  };

  audio.stopBgm = function () {
    if (bgm) { bgm.pause(); bgm = null; }
  };

  audio.playBgmFor = function (node) {
    const f = node && bgmFor(node);
    if (f) audio.playBgm(f);
  };

  audio.playTitleBgm = function () { audio.playBgm(BGM.title); };
  audio.playVerdictSting = function () { audio.playBgm(BGM.verdict); };
  audio.playEndingBgm = function (e) {
    if (e) audio.playBgm(ENDING_BGM[e.id] || BGM.loop);
  };

  /* ---- 静音 ---- */
  audio.toggleMute = function () {
    muted = !muted;
    try { localStorage.setItem(MUTE_KEY, muted ? "1" : "0"); } catch (e) {}
    if (muted) audio.stop();
    if (bgm) bgm.muted = muted;   /* 保持进度，取消静音即恢复 */
    Game.publish("audio:mute", muted);
    return muted;
  };
  audio.isMuted = function () { return muted; };

  /* ---- 事件接线 ---- */
  Game.subscribe("node:enter", function (node) {
    audio.playFor(node);
    audio.playBgmFor(node);
  });

  Game.subscribe("ending:show", function (e) {
    audio.stop();
    audio.playEndingBgm(e);
  });

  Game.subscribe("load:done", function () {
    audio.stop();
  });
})();

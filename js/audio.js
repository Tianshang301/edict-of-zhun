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

  let voice = null;       /* 当前 <audio> 实例 */
  let bgm = null;         /* 当前 BGM <audio> 实例 */

  /* 节点 → 语音文件路径；非对白节点返回 null */
  function voicePath(node) {
    if (!node || !node.line || !node.speaker) return null;
    const tok = SPEAKER_TOKEN[node.speaker];
    if (!tok) return null;
    return "audio/voice/" + node.id + "_" + tok + ".wav";
  }

  /* 播放某节点的语音（随打字机同步开始；进入新节点先停旧音） */
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

  /* 停止当前语音 */
  audio.stop = function () {
    if (voice) { voice.pause(); voice = null; }
  };

  /* 静音开关 */
  audio.toggleMute = function () {
    muted = !muted;
    try { localStorage.setItem(MUTE_KEY, muted ? "1" : "0"); } catch (e) {}
    if (muted) audio.stop();
    if (bgm) bgm.muted = muted;
    Game.publish("audio:mute", muted);
    return muted;
  };
  audio.isMuted = function () { return muted; };

  /* ---- BGM（本轮无素材，预留钩子） ---- */
  audio.playBgm = function (src) {
    if (!src) return;
    if (muted) return;
    if (bgm && bgm.dataset.src === src) return;
    if (bgm) { bgm.pause(); bgm = null; }
    const b = new Audio("audio/" + src);
    b.loop = true;
    b.volume = 0.5;
    b.preload = "auto";
    b.play().catch(function () {});
    bgm = b;
  };
  audio.stopBgm = function () {
    if (bgm) { bgm.pause(); bgm = null; }
  };

  /* 读档 / 回退后，当前节点重播 */
  Game.subscribe("node:enter", function (node) {
    audio.playFor(node);
  });

  Game.subscribe("load:done", function () {
    audio.stop();
  });
})();

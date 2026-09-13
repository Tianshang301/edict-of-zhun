// 语音：播放路径解析 + 全部有声节点文件可达
const fs = require("fs");
const env = require("./lib/env");
env.setup();
const { ok, end } = env;
["/js/state.js", "/js/save.js", "/js/script-data.js", "/js/engine.js", "/js/audio.js"].forEach((f) => env.load(f));
Game.ui = { playVerdict: (t, cb) => cb(), playDissolve: (cb) => cb() };

const created = env.audioCreated;

Game.audio.playFor(Game.scenes["scene_02_03"]);
ok(created.length === 1 && created[0].src === "audio/voice/scene_02_03_tianshang.wav" && created[0].played,
  "scene_02_03 -> scene_02_03_tianshang.wav, played");

Game.audio.playFor(Game.scenes["scene_01_01"]);
ok(created.length === 1, "旁白节点不触发播放");

Game.audio.playFor(Game.scenes["scene_02_03"]);
ok(created.length === 2 && created[1].played, "重进同一节点会重播(rollback场景)");

// audio.js 内部 token 解析：全部有声节点应指向存在的文件
const files = new Set(fs.readdirSync(env.REPO + "/audio/voice").filter((f) => f.endsWith(".wav")));
let miss = 0, match = 0;
for (const id of Object.keys(Game.scenes)) {
  const n = Game.scenes[id];
  if (n.line && n.speaker) {
    const before = created.length;
    Game.audio.playFor(n);
    if (created.length === before) { miss++; console.log("  MISSING(no play) " + id); continue; }
    const src = created[created.length - 1].src;
    if (!files.has(src.replace("audio/voice/", ""))) { miss++; console.log("  FILE-NOT-EXIST " + src); }
    else match++;
  }
}
ok(miss === 0, "audio.js 路径解析下全部有声节点命中真实文件 (match=" + match + ", miss=" + miss + ")");

end("语音");
// 布局：对白框-选项面板自适应对齐（layoutDialogue）
const env = require("./lib/env");
env.setup({ reduceMotion: true }); // reduce-motion: 旁白 120ms/段，打字机即时
const dom = require("./lib/dom");
const els = dom.attach();
["/js/state.js", "/js/save.js", "/js/script-data.js", "/js/engine.js", "/js/audio.js", "/js/ui.js"].forEach((f) => env.load(f));
const { ok, end } = env;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  Game.ui.init();
  Game.state.settings.typewriter = false;

  // scene_04_02: 无旁白, 有 line → 同步渲染
  Game.state.loop = 2;
  Game.state.affinity = { tianshang: 2, shentan: 0, lisi: 0, atan: 0 };
  Game.state.knowledge = ["k_throne_back", "k_truth"];
  Game.state.flags.knows_truth = true;
  Game.state.nodeId = "scene_04_02";
  els["choices"].offsetHeight = 380; els["screen-game"].clientHeight = 900;
  Game.ui.renderNode(Game.scenes["scene_04_02"]);
  ok(els["choices"].children.length === 6, "scene_04_02 渲染 6 个选项 (got " + els["choices"].children.length + ")");
  ok(els["dialogue"].style.bottom === "448px", "对白框=900*0.06+380+14=448px (got " + els["dialogue"].style.bottom + ")");

  Game.ui.renderNode(Game.scenes["scene_01_01"]);
  ok(els["dialogue"].style.bottom === "", "无选项节点归位 (got '" + els["dialogue"].style.bottom + "')");

  // scene_02_06: 有旁白(5段, reduce-motion 120ms) → 异步
  Game.state.nodeId = "scene_02_06";
  els["choices"].offsetHeight = 190; els["screen-game"].clientHeight = 700;
  Game.ui.renderNode(Game.scenes["scene_02_06"]);
  await sleep(1000);
  ok(els["choices"].children.length === 3, "scene_02_06 渲染 3 个选项 (got " + els["choices"].children.length + ")");
  ok(els["dialogue"].style.bottom === "246px", "scene_02_06=700*0.06+190+14=246px (got " + els["dialogue"].style.bottom + ")");

  // scene_02_09: 旁白(4段)+line+5项
  Game.state.loop = 4;
  Game.state.affinity = { tianshang: 0, shentan: 0, lisi: 0, atan: 2 };
  Game.state.nodeId = "scene_02_09";
  els["choices"].offsetHeight = 310; els["screen-game"].clientHeight = 800;
  Game.ui.renderNode(Game.scenes["scene_02_09"]);
  await sleep(1000);
  ok(els["choices"].children.length === 5, "scene_02_09 渲染 5 个选项 (got " + els["choices"].children.length + ")");
  ok(els["dialogue"].style.bottom === "372px", "scene_02_09=800*0.06+310+14=372px (got " + els["dialogue"].style.bottom + ")");

  end("布局");
})();
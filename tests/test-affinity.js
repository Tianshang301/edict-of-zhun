const env = require("./lib/env");
env.setup();
const { ok, end } = env;

// ---- Part A: engine 好感度经济 / 门控 / 新节点 / 反捷径 ----
["/js/state.js", "/js/save.js", "/js/script-data.js", "/js/engine.js", "/js/audio.js"].forEach((f) => env.load(f));
Game.ui = { playVerdict: (t, cb) => cb(), playDissolve: (cb) => cb() };

function fresh() { Game.state = env.freshState(); }
const has = (k) => Game.state.knowledge.indexOf(k) > -1;
const avail = (i) => Game.choiceAvailable(Game.currentNode().choices[i]);

fresh(); Game.go("scene_01_02"); Game.choose(0);
ok(Game.state.affinity.tianshang === 1, "第1日echo 天殇+1");
fresh(); Game.go("scene_01_02"); Game.choose(2);
ok(Game.state.affinity.tianshang === -1 && Game.state.affinity.atan === 1, "第1日沉默 天殇-1/阿檀+1");

fresh(); Game.go("scene_02_06"); Game.choose(0);
ok(Game.state.affinity.lisi === 1, "调查官邸 李司农+1");
fresh(); Game.go("scene_02_06"); Game.choose(1);
ok(Game.state.affinity.atan === 1, "翻夹层 阿檀+1");

fresh(); Game.state.affinity.atan = 1; Game.go("scene_02_09");
ok(avail(2) === false, "atan=1 时「你在这里多久了」不可用");
Game.state.affinity.atan = 2;
ok(avail(2) === true, "atan=2 时「你在这里多久了」可用");
Game.choose(2);
ok(Game.state.nodeId === "scene_02_09e", "进入 scene_02_09e");
ok(has("k_atan_age"), "解锁 k_atan_age");

fresh(); Game.state.affinity.tianshang = 1; Game.go("scene_04_02");
ok(avail(3) === false, "tianshang=1 时「累了吗」不可用");
Game.state.affinity.tianshang = 2;
ok(avail(3) === true, "tianshang=2 时「累了吗」可用");
Game.choose(3);
ok(Game.state.nodeId === "scene_04_ask_tired", "进入 scene_04_ask_tired");
ok(has("k_emperor_tired"), "解锁 k_emperor_tired");

fresh(); Game.state.knowledge = ["k_throne_back"]; Game.go("scene_04_ask2");
ok(avail(0) === false, "无 knows_truth 时「说不准」不可用(防止好感线直通E_TRUE)");
Game.state.flags.knows_truth = true;
ok(avail(0) === true, "有 knows_truth+k_throne_back 时「说不准」可用");

// 全部有声节点文件可达
const fs = require("fs");
const files = new Set(fs.readdirSync(env.REPO + "/audio/voice").filter((f) => f.endsWith(".wav")));
const TOK = { "天殇": "tianshang", "沈砚": "shenyan", "李司农": "lisinong", "阿檀": "atan" };
let miss = 0, vn = 0;
for (const id of Object.keys(Game.scenes)) {
  const n = Game.scenes[id];
  if (n.line && n.speaker) {
    vn++;
    if (!files.has(id + "_" + TOK[n.speaker] + ".wav")) { miss++; console.log("  MISSING " + id + "_" + TOK[n.speaker] + ".wav"); }
  }
}
ok(miss === 0, "全部 " + vn + " 个有声节点文件可达 (missing=" + miss + ")");

// ---- Part B: ui.js preprocess aff 标签 + 情报弹层好感行 ----
const dom = require("./lib/dom");
const els = dom.attach();
env.load("/js/ui.js");
Game.ui.init();

Game.state.affinity = { tianshang: 0, shentan: 0, lisi: 0, atan: 2 };
Game.ui.openDossier();
const dlist = els["dossier-list"];
ok(dlist.children.length >= 1 && dlist.children[0].className === "dossier__aff", "情报弹层含好感行");
const affText = dlist.children[0].textContent;
ok(affText.indexOf("天殇") > -1 && affText.indexOf("阿檀") > -1 && affText.indexOf("沈砚") > -1 && affText.indexOf("李司农") > -1, "好感行含四角色");
ok(affText.indexOf("如常") > -1, "天殇0=如常  " + affText);
ok(affText.indexOf("亲") > -1, "阿檀2=亲  " + affText);

Game.state.affinity.atan = 2;
Game.publish("node:enter", Game.scenes["scene_02_09"]);
setTimeout(() => {
  const paras = (els["narration"].children || []).map((p) => p.textContent);
  ok(paras.length === 4, "atan=2 旁白4段 (got " + paras.length + ")");
  ok(paras.some((t) => t.indexOf("她的语气，松了一点。") > -1), "atan=2 显示 affA2 句");

  Game.state.affinity.atan = 0;
  Game.publish("node:enter", Game.scenes["scene_02_09"]);
  setTimeout(() => {
    const paras2 = (els["narration"].children || []).map((p) => p.textContent);
    ok(paras2.length === 3, "atan=0 旁白3段 (got " + paras2.length + ")");
    ok(!paras2.some((t) => t.indexOf("她的语气，松了一点。") > -1), "atan=0 隐藏 affA2 句");
    end("好感度");
  }, 3200);
}, 3200);
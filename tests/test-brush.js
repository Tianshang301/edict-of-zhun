// 朱笔残片（§12.4）：获得 / 生命周期 / 门控 / 使用代价 / 封死渲染
const env = require("./lib/env");
env.setup();
const { ok, end } = env;
const dom = require("./lib/dom");

// ---- Part A: engine 残片获得/生命周期/使用 ----
["/js/state.js", "/js/save.js", "/js/script-data.js", "/js/engine.js", "/js/audio.js"].forEach((f) => env.load(f));
Game.ui = { playVerdict: (t, cb) => cb(), playDissolve: (cb) => cb() };

function fresh() { Game.state = env.freshState(); }
const has = (k) => Game.state.knowledge.indexOf(k) > -1;

// 获得: scene_02_08 夹层
fresh(); Game.go("scene_02_08");
ok(Game.state.hasBrushFragment === true, "翻夹层获得朱笔残片");
ok(has("fourth_line_never_changes"), "仍解锁夹层情报");
Game.go("scene_02_08");
ok(Game.state.hasBrushFragment === true, "重复进入不重复获得(仍1枚)");

// 周目重置清空
Game.resetForLoop();
ok(Game.state.hasBrushFragment === false, "resetForLoop 清空残片");
ok(Game.state.rollbackUsedAt.length === 0, "resetForLoop 清空 rollbackUsedAt");

// 章节回退保留
fresh(); Game.state.hasBrushFragment = true; Game.state.rollbackUsedAt = ["scene_01_02"];
Game.resetForChapterRollback();
ok(Game.state.hasBrushFragment === true, "resetForChapterRollback 保留残片");
ok(Game.state.rollbackUsedAt[0] === "scene_01_02", "resetForChapterRollback 保留 rollbackUsedAt");

// canUseBrushFragment 门控
fresh(); Game.go("scene_01_02"); Game.state.hasBrushFragment = true;
ok(Game.canUseBrushFragment() === true, "有残片+rollbackCount<3 → 可用");
Game.state.rollbackCount = 3;
ok(Game.canUseBrushFragment() === false, "rollbackCount>=3 → 不可用(不救E_PHANTOM)");
Game.state.rollbackCount = 0; Game.state.hasBrushFragment = false;
ok(Game.canUseBrushFragment() === false, "无残片 → 不可用");

// 使用: 死亡场景
fresh(); Game.go("scene_01_02"); Game.state.hasBrushFragment = true;
Game.choose(1); // propose → E_A1 死亡 (playVerdict/dissolve 即时回调)
ok(Game.state.nodeId === "scene_01_02", "死亡时仍停在选择点");
ok(Game.state.deaths === 1, "死亡计数+1");
Game.useBrushFragment();
ok(Game.state.hasBrushFragment === false, "使用后消耗残片");
ok(Game.state.rollbackUsedAt.indexOf("scene_01_02") > -1, "rollbackUsedAt 记录选择点");
ok(Game.state.affinity.tianshang === -3, "天殇好感 -3 (got " + Game.state.affinity.tianshang + ")");
ok(Game.state.nodeId === "scene_01_02", "回到选择点 scene_01_02");
ok(has("k_quzhun"), "死亡情报 k_quzhun 仍保留");

// ---- Part B: ui.js 渲染 ----
const els = dom.attach();
env.load("/js/ui.js");
Game.ui.init();
Game.state.settings.typewriter = false;

// 封死的 echo
Game.state.rollbackUsedAt = ["scene_01_02"];
Game.state.affinity = { tianshang: 0, shentan: 0, lisi: 0, atan: 0 };
Game.state.nodeId = "scene_01_02";
Game.ui.renderNode(Game.scenes["scene_01_02"]);
const btns = els["choices"].children;
ok(btns.length === 3, "scene_01_02 渲染3选项 (got " + btns.length + ")");
ok(btns[0].disabled === true && btns[0].className.indexOf("choice--burned") > -1, "echo 复述旧制被封死(disabled+burned)");
ok(btns[0].title.indexOf("此路已封") > -1, "echo 提示朱笔已锈");
ok(btns[1].disabled === false, "propose 仍可选(不豁免死亡)");
ok(btns[2].disabled === false, "silence 仍可选");

// 未封死对照
Game.state.rollbackUsedAt = [];
Game.ui.renderNode(Game.scenes["scene_01_02"]);
ok(els["choices"].children[0].disabled === false, "无封死时 echo 正常可选");

// dossier 残片徽记
Game.state.hasBrushFragment = true;
Game.ui.openDossier();
const dlist = els["dossier-list"];
ok(dlist.children.length >= 2 && dlist.children[1].className === "dossier__frag", "情报弹层显示残片徽记");

end("朱笔残片");
// 白名单 mini-evaluator：真实表达式 + 非法表达式防御
const env = require("./lib/env");
env.setup();
const { ok, end } = env;
env.load("/js/state.js");
const EC = (e) => Game.evalCondition(e);

console.log("\n== 真实用法（script-data 现存 8 例）==");
Game.state.loop = 2; ok(EC("state.loop >= 2") === true, "state.loop >= 2 (loop=2)");
Game.state.loop = 1; ok(EC("state.loop >= 2") === false, "state.loop >= 2 (loop=1)");
Game.state.affinity.atan = 2; ok(EC("state.affinity.atan >= 2") === true, "state.affinity.atan >= 2 (=2)");
Game.state.affinity.tianshang = 1; ok(EC("state.affinity.tianshang >= 2") === false, "tianshang >= 2 (=1)");
Game.state.flags.knows_truth = true; ok(EC("flags.knows_truth === true") === true, "flags.knows_truth === true (真)");
Game.state.flags.knows_truth = false; ok(EC("flags.knows_truth === true") === false, "flags.knows_truth === true (假)");
Game.state.loop = 2; Game.state.knowledge = ["k_throne_back"];
ok(EC("state.loop >= 2 && Game.hasKnowledge('k_throne_back')") === true, "loop && hasKnowledge 组合");
Game.state.flags.knows_truth = true;
ok(EC("flags.knows_truth === true && Game.hasKnowledge('k_throne_back') === true") === true, "flag && knowledge===true 组合");
Game.state.loop = 4; ok(EC("state.loop >= 4") === true, "state.loop >= 4");
Game.state.knowledge = ["k_throne_back"]; ok(EC("Game.hasKnowledge('k_throne_back')") === true, "裸函数调用布尔");

console.log("\n== 空 / 防御 ==");
ok(EC("") === true, "空表达式 → true");
ok(EC(null) === true, "null → true");
ok(EC("state.affinity.atanr >= 2") === false, "state 固定schema字段拼错 → false");
ok(EC("game.loop >= 2") === false, "未知根 game. → false");
ok(EC("Game.disintegrateRigel()") === false, "未知函数 → false");
ok(EC("state.loop >== 2") === false, "非法token序列 → false");
ok(EC("state.knowledge && reaction()") === false, "未知函数组合 → false");
ok(EC("Game.hasKnowledge()") === false, "缺参调用 → false");
ok(EC("!(state.loop >= 4)") === false, "!() 取反: loop=4 → false");
ok(EC("!(state.loop >= 8)") === true, "!() 取反: loop!>=8 → true");
ok(EC("flagz.knows_truth === true") === false, "未知根 flagz. → false");
ok(EC("state.loop = 99") === false, "赋值号不支持 → false");
Game.state = env.freshState();
ok(EC("state.affinity.atan >= 2") === false, "fresh: atan=0 ≥2 为假");

end("条件求值");
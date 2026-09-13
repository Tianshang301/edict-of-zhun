// 逻辑自检：正典结构 + §12 章节回退 + 残影结局
const env = require("./lib/env");
env.setup();
const { ok, end } = env;
["/js/state.js", "/js/save.js", "/js/script-data.js", "/js/engine.js"].forEach((f) => env.load(f));

Game.ui = { playVerdict: (t, cb) => cb(), playDissolve: (cb) => cb(), showEnding: () => {}, renderNode: () => {} };

console.log("\n== 数据完整性 ==");
ok(typeof Game.scenes === "object" && Object.keys(Game.scenes).length >= 30, "场景节点 >= 30，实际 " + Object.keys(Game.scenes).length);
ok(Game.firstNode === "scene_01_01", "firstNode = scene_01_01");
ok(!!Game.scenes["scene_02_01"] && !!Game.scenes["scene_02_10"], "正典第 2 日 scene_02_01..10 存在");
ok(!!Game.scenes["scene_03_01"], "第 3 日 scene_03_01 存在");
ok(!!Game.scenes["scene_recall"] && Game.scenes["scene_recall"].next === "$checkpoint", "scene_recall.next = $checkpoint");
ok(Game.rules.length === 4, "卷宗四则");
["E_A1", "E_A2", "E_A3", "E_A4", "E_B", "E_C", "E_TRUE", "E_PHANTOM"].forEach((id) => ok(!!Game.endings[id], "结局 " + id + " 存在"));
ok(Game.endings.E_PHANTOM.type === "bad", "E_PHANTOM 为 bad");
ok(Object.keys(Game.knowledgeInfo).length >= 12, "情报条目 >= 12");

console.log("\n== 铁律：propose 必死 ==");
Game.go("scene_01_02");
Game.choose(1); // 常平仓
ok(Game.state.deaths === 1, "propose 后 deaths=1");
ok(Game.hasKnowledge("k_quzhun"), "首次 propose 解锁 k_quzhun");
ok(Game.currentEnding() && Game.currentEnding().id === "E_A1", "触发 E_A1");

console.log("\n== echo/silence 安全 ==");
Game.state = Game.clone(Game.state); Game.state.nodeId = "scene_01_02"; Game.state.deaths = 0;
Game.state.affinity = { tianshang: 0, shentan: 0, lisi: 0, atan: 0 };
Game.choose(0); // echo
ok(Game.state.deaths === 0, "echo 不增 deaths");
ok(Game.state.nodeId === "scene_01_safe", "echo → scene_01_safe");
ok(Game.state.affinity.tianshang === 1, "echo 天殇好感+1");
Game.state.nodeId = "scene_01_02"; Game.state.affinity = { tianshang: 0, shentan: 0, lisi: 0, atan: 0 };
Game.choose(2); // silence
ok(Game.state.nodeId === "scene_01_sil", "silence → scene_01_sil");
ok(Game.state.affinity.atan === 1 && Game.state.affinity.tianshang === -1, "silence 好感度生效");

console.log("\n== §12 章节检查点 ==");
Game.state.loop = 1; Game.state.chapter = ""; Game.state.chapterCheckpoint = ""; Game.state.rollbackCount = 0;
Game.go("scene_01_01");
ok(Game.state.chapterCheckpoint === "scene_01_01", "进入第 1 日设检查点 scene_01_01");
ok(Game.state.rollbackCount === 0, "rollbackCount=0");
Game.go("scene_01_02");
ok(Game.state.chapterCheckpoint === "scene_01_01", "同章不重置检查点");
Game.go("scene_02_01");
ok(Game.state.chapterCheckpoint === "scene_02_01", "跨章更新检查点 scene_02_01");
ok(Game.state.rollbackCount === 0, "跨章重置 rollbackCount=0");

console.log("\n== §12 章节级回退（死亡非 loop++）==");
Game.go("scene_02_01");
Game.addKnowledge("k_scroll_4th"); Game.setFlag("temp_flag", true);
const loopBefore = Game.state.loop;
Game.choose(1); // 第 2 日 propose → E_A2（rollbackCount=0<3）
ok(Game.currentEnding().id === "E_A2", "第 2 日 propose → E_A2");
Game.continueEnding(); // 章节回退
ok(Game.state.rollbackCount === 1, "回退后 rollbackCount=1");
ok(Game.state.loop === loopBefore, "回退不增 loop（仍 =" + loopBefore + "）");
ok(Game.hasKnowledge("k_scroll_4th"), "回退保留 knowledge");
ok(!Game.hasFlag("temp_flag"), "回退清空临时 flag");
ok(Game.state.chapter === "第二日 · 北境大旱", "回退保留章节");
ok(Game.state.nodeId === "scene_recall", "回退先到 scene_recall");
Game.advance(); // scene_recall.next = $checkpoint
ok(Game.state.nodeId === "scene_02_01", "$checkpoint → 回到本章开头 scene_02_01");

console.log("\n== 残影结局（第 4 次回退）==");
Game.state.loop = 1; Game.state.rollbackCount = 3; Game.state.nodeId = "scene_02_01";
Game.choose(1); // rollbackCount>=3 → E_PHANTOM
ok(Game.currentEnding().id === "E_PHANTOM", "第 4 次死亡 → E_PHANTOM");
Game.continueEnding();
ok(Game.state.loop === 2, "残影结局后 loop++ = 2");
ok(Game.state.rollbackCount === 0, "新周目 rollbackCount 重置 = 0");

console.log("\n== E_B 继续 → loop++ ==");
Game.state.loop = 1;
Game.triggerEnding("E_B");
Game.continueEnding();
ok(Game.state.loop === 2, "E_B 后 loop=2");

console.log("\n== 多周目条件路由 ==");
Game.state.loop = 1;
ok(Game.scenes["scene_01_night"].nextIf && Game.scenes["scene_01_night"].nextIf.length > 0, "scene_01_night 有 nextIf");
ok(Game.evalCondition("state.loop >= 2") === false, "loop1: 不走二周目支线");
Game.state.loop = 2;
ok(Game.evalCondition("state.loop >= 2") === true, "loop2: 走二周目支线");
ok(Game.scenes["scene_02_07"].narration.some((n) => n.indexOf("{{loop3:") >= 0), "scene_02_07 含 loop3 信件");
ok(Game.scenes["scene_02_09"].choices.some((c) => c.require && c.require.indexOf("loop >= 4") >= 0), "scene_02_09 含 loop4 隐藏选项");

end("逻辑");
// 存档：版本消费 / 迁移 / 规范化兜底 / 拒载保护
const env = require("./lib/env");
env.setup();
const { ok, end } = env;
["/js/state.js", "/js/save.js"].forEach((f) => env.load(f));
const KEY = "tianshang_save_v1";

console.log("\n== 规范化兜底（_normalizeState）==");
Game.state = Game._normalizeState({});
ok(Game.state.version === 1, "version=1");
ok(Game.state.hasBrushFragment === false && Array.isArray(Game.state.rollbackUsedAt), "新字段有默认值");
ok(Game.state.affinity.atan === 0 && Game.state.nodeId === "scene_01_01", "缺字段补默认");

// 旧档（缺新字段）→ load 补齐
Game.state = env.freshState();
const stale = {
  version: 0,
  state: {
    nodeId: "scene_02_05", chapter: "第二日 · 北境大旱",
    flags: { foo: true }, knowledge: ["k_quzhun"],
    affinity: { tianshang: 2 }, history: ["a", "b"],
    loop: 1, deaths: 3
  }
};
env.store[KEY] = JSON.stringify({ active: stale });
ok(Game.load("active") === true, "v0 旧档可载");
ok(Game.state.nodeId === "scene_02_05", "保留节点");
ok(Game.state.version === 1, "迁移后 version=1");
ok(Game.state.hasBrushFragment === false, "补齐 hasBrushFragment");
ok(Game.state.rollbackUsedAt.length === 0, "补齐 rollbackUsedAt（数组）");
ok(Game.state.affinity.atan === 0 && Game.state.affinity.lisi === 0 && Game.state.affinity.shentan === 0, "补齐其余好感");
ok(Game.state.affinity.tianshang === 2, "保留现有好感");
ok(Game.state.knowledge.indexOf("k_quzhun") > -1, "保留 knowledge");
ok(Game.state.flags.foo === true, "保留 flags");

// 未来版本拒载（不毁档）
Game.state = env.freshState();
const fut = { version: 99, state: { nodeId: "scene_01_01" } };
env.store[KEY] = JSON.stringify({ fut });
ok(Game.load("fut") === false, "未来版本拒载");
ok(Game.state.nodeId = "scene_01_01", "拒载前后保留当前状态（未污染）");

// 空槽 / 损坏槽
env.store[KEY] = JSON.stringify({});
ok(Game.load("ghost") === false, "空槽 → false");
env.store[KEY] = "{bad json";
ok(Game.load("x") === false, "损坏整档 → false（readAll 兜底 {}）");

// 版本协议导出
ok(Game.saveVersion === 1, "saveVersion=1");
ok(typeof Game.saveMigrators === "object", "migrators 表存在");

// 章节回退仍保留残片字段
Game.resetForChapterRollback();
ok(Game.state.hasBrushFragment === false && Array.isArray(Game.state.rollbackUsedAt), "reset 后字段完整");

end("存档迁移");
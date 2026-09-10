/* engine.js — 规则判定 / 分支跳转 / 结局触发
 * 核心约束（不可违逆）：
 *   - propose 永远通向死亡，无例外。
 *   - 破局只能发生在 ask / meta，而非 propose。
 */
(function () {
  "use strict";
  const Game = window.Game = window.Game || {};

  /* ---- 当前节点 / 结局 ---- */
  Game.currentNode = function () { return Game.scenes[Game.state.nodeId]; };
  let currentEnding = null;

  /* ---- onEnter 效果 ---- */
  function applyOnEnter(node) {
    if (!node.onEnter) return;
    node.onEnter.forEach(function (eff) {
      if (eff.indexOf("knowledge:") === 0) Game.addKnowledge(eff.slice(10));
      else if (eff.indexOf("flag:") === 0) Game.setFlag(eff.slice(5));
    });
  }

  /* ---- 解析下一节点（支持 nextIf 条件路由） ---- */
  function resolveNext(node) {
    if (node.nextIf) {
      for (let i = 0; i < node.nextIf.length; i++) {
        if (Game.evalCondition(node.nextIf[i].if)) return node.nextIf[i].next;
      }
    }
    return node.next || null;
  }

  /* ---- 进入节点 ---- */
  Game.go = function (id) {
    if (!id || !Game.scenes[id]) {
      console.error("[engine] node not found:", id);
      return;
    }
    const node = Game.scenes[id];
    applyOnEnter(node);
    Game.setState({ nodeId: id, chapter: node.chapter || Game.state.chapter });
    Game.publish("node:enter", node);
  };

  /* ---- 推进（无选项节点：用户点击或 autoDelay 后） ---- */
  Game.advance = function () {
    const node = Game.currentNode();
    if (!node) return;
    if (node.ending) { Game.triggerEnding(node.ending); return; }
    const nx = resolveNext(node);
    if (nx) Game.go(nx);
  };

  /* ---- 选项可用性 ---- */
  Game.choiceAvailable = function (c) {
    if (!c.require) return true;
    return Game.evalCondition(c.require);
  };

  /* ---- 选择处理 ---- */
  Game.choose = function (idx) {
    const node = Game.currentNode();
    if (!node || !node.choices) return;
    const c = node.choices[idx];
    if (!c || !Game.choiceAvailable(c)) return;

    Game.pushHistory({ node: node.id, text: c.text, kind: c.kind });

    if (c.affinity) Game.adjustAffinity(c.affinity);
    if (c.flag) Game.setFlag(c.flag);

    switch (c.kind) {
      case "propose":
        /* 铁律：提出新政策 → 天子批「准」→ 死亡。无例外。 */
        Game.state.deaths++;
        Game.addKnowledge("k_quzhun");
        Game.publish("choice:propose", c);
        Game.ui.playVerdict(c.verdictText || "准", function () {
          Game.ui.playDissolve(function () {
            Game.triggerEnding(c.ending || "E_A");
          });
        });
        return; /* 结局接管后续 */

      case "echo":
        Game.state.flags._echoCount = (Game.state.flags._echoCount || 0) + 1;
        if (Game.state.flags._echoCount >= 4) Game.setFlag("pure_echo");
        break;

      case "silence":
        /* 沉默：安全，但错失情报（由分支节点体现） */
        Game.state.flags._echoCount = 0;
        break;

      case "ask":
      case "meta":
      case "investigate":
        /* 破局路径，不在此触发死亡 */
        Game.state.flags._echoCount = 0;
        break;
    }

    /* 非死亡分支：跳转或结局 */
    if (c.ending) { Game.triggerEnding(c.ending); return; }
    if (c.next) { Game.go(c.next); return; }
    Game.advance();
  };

  /* ---- 结局 ---- */
  const UNLOCK_KEY = "tianshang_endings_unlocked";
  function recordUnlocked(id) {
    let arr = [];
    try { arr = JSON.parse(localStorage.getItem(UNLOCK_KEY) || "[]") || []; } catch (e) {}
    if (arr.indexOf(id) < 0) arr.push(id);
    try { localStorage.setItem(UNLOCK_KEY, JSON.stringify(arr)); } catch (e) {}
  }
  Game.unlockedEndings = function () {
    try { return JSON.parse(localStorage.getItem(UNLOCK_KEY) || "[]") || []; } catch (e) { return []; }
  };

  Game.triggerEnding = function (id) {
    const e = Game.endings[id];
    if (!e) { console.error("[engine] ending not found:", id); return; }
    currentEnding = e;
    recordUnlocked(id);
    Game.publish("ending:show", e);
  };
  Game.currentEnding = function () { return currentEnding; };

  /* ---- 结局后继续 ----
     bad / normal / good → 轮回重启（loop++，继承 knowledge）
     true → 破局，回标题 */
  Game.continueEnding = function () {
    const e = currentEnding;
    if (!e) return;
    if (e.type === "true") {
      Game.publish("ending:finish", e);
      return;
    }
    Game.state.loop++;
    Game.resetForLoop();
    Game.go(Game.firstNode);
  };

  /* ---- 开局 ---- */
  Game.beginStory = function () {
    Game.go(Game.firstNode);
  };
})();

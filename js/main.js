/* main.js — 入口 / 自动存档 / 标题屏 */
(function () {
  "use strict";
  const Game = window.Game = window.Game || {};

  function boot() {
    Game.ui.init();
    Game.ui.title();

    // 进入新节点时自动存档（标题屏不存）
    let asTimer = null;
    Game.subscribe("node:enter", function () {
      if (asTimer) clearTimeout(asTimer);
      asTimer = setTimeout(function () { Game.save("auto"); }, Game.consts.SAVE_DEBOUNCE);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();

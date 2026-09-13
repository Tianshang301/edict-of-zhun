/* ui.js — 渲染 / 打字机 / 立绘 / 卷宗 / 朱批 / 消散 */
(function () {
  "use strict";
  const Game = window.Game = window.Game || {};
  const ui = Game.ui = {};

  /* ---- DOM ---- */
  let el = {};
  function cacheDom() {
    el.screenTitle = document.getElementById("screen-title");
    el.screenGame = document.getElementById("screen-game");
    el.bgImg = document.getElementById("bg-img");
    el.bgLayer = document.getElementById("bg-layer");
    el.portraitLayer = document.getElementById("portrait-layer");
    el.narration = document.getElementById("narration");
    el.dialogue = document.getElementById("dialogue");
    el.dChapter = document.getElementById("d-chapter");
    el.dSpeaker = document.getElementById("d-speaker");
    el.dLine = document.getElementById("d-line");
    el.dHint = document.getElementById("d-hint");
    el.choices = document.getElementById("choices");
    el.hudLoop = document.getElementById("hud-loop");
    el.ending = document.getElementById("screen-ending");
    el.endLabel = document.getElementById("end-label");
    el.endTitle = document.getElementById("end-title");
    el.endBody = document.getElementById("end-body");
    el.endCg = document.getElementById("end-cg");
    el.endActions = document.getElementById("end-actions");
    el.verdict = document.getElementById("verdict");
    el.verdictChar = document.getElementById("verdict-char");
    el.dissolve = document.getElementById("dissolve");
    el.dissolveImg = document.getElementById("dissolve-img");
    el.transition = document.getElementById("transition");
    el.modalScroll = document.getElementById("modal-scroll");
    el.modalSave = document.getElementById("modal-save");
    el.modalDossier = document.getElementById("modal-dossier");
    el.modalGallery = document.getElementById("modal-gallery");
    el.galleryStats = document.getElementById("gallery-stats");
    el.galleryList = document.getElementById("gallery-list");
  }

  /* ---- 工具 ---- */
  function resolvePic(src) {
    if (!src) return "";
    if (src.indexOf("/") > -1) return src;
    let sub = "";
    if (src.indexOf("bg_") === 0) sub = "bg/";
    else if (src.indexOf("cg_") === 0) sub = "cg/";
    else if (src.indexOf("chara_") === 0) sub = "chara/";
    else if (src.indexOf("ui_") === 0) sub = "ui/";
    return "pictures/" + sub + src;
  }

  /* 多周目文本预处理：{{loop2:文}} {{loop3:文}} {{loop4:文}} {{loop}} */
  function preprocess(text) {
    if (text == null) return "";
    return String(text)
      .replace(/\{\{loop2:([\s\S]*?)\}\}/g, function (_, t) { return Game.state.loop >= 2 ? t : ""; })
      .replace(/\{\{loop3:([\s\S]*?)\}\}/g, function (_, t) { return Game.state.loop >= 3 ? t : ""; })
      .replace(/\{\{loop4:([\s\S]*?)\}\}/g, function (_, t) { return Game.state.loop >= 4 ? t : ""; })
      .replace(/\{\{loop\}\}/g, String(Game.state.loop))
      .replace(/\{\{aff([TASL])(\d+):([\s\S]*?)\}\}/g, function (_, c, n, t) {
        const key = { T: "tianshang", A: "atan", S: "shentan", L: "lisi" }[c];
        return (Game.state.affinity[key] || 0) >= (+n) ? t : "";
      });
  }

  const reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const TYPE_MS = reduceMotion ? 0 : 45;
  const PUNCT_MS = reduceMotion ? 0 : 180;
  const PUNCT = /[，。！？、；：「」『』（）——…]/;

  /* ---- 屏幕 ---- */
  function showScreen(name) {
    [el.screenTitle, el.screenGame].forEach(function (s) {
      if (s) s.classList.toggle("is-active", s.id === "screen-" + name);
    });
  }
  ui.title = function () {
    showScreen("title");
    if (Game.audio && Game.audio.playTitleBgm) Game.audio.playTitleBgm();
  };

  /* ---- 背景 ---- */
  let bgTimer = null;
  ui.setBg = function (src, dark) {
    const url = resolvePic(src);
    if (!url) return;
    if (bgTimer) { clearTimeout(bgTimer); bgTimer = null; }
    const prev = el.bgImg;
    const fresh = prev.cloneNode(false);
    fresh.src = url;
    fresh.onload = function () {
      fresh.classList.add("is-on");
      el.bgLayer.appendChild(fresh);
      if (dark) el.bgLayer.classList.add("is-dark"); else el.bgLayer.classList.remove("is-dark");
      setTimeout(function () {
        const imgs = el.bgLayer.querySelectorAll("img");
        for (let i = 0; i < imgs.length - 1; i++) imgs[i].remove();
      }, 900);
    };
    fresh.onerror = function () { fresh.remove(); };
  };

  /* ---- 立绘 ---- */
  ui.renderPortraits = function (p) {
    el.portraitLayer.innerHTML = "";
    if (!p) return;
    function place(slot, file, fx) {
      if (!file) return;
      const img = document.createElement("img");
      img.className = "portrait portrait--" + slot + (fx ? " fx-" + fx : "") + " is-out";
      img.src = resolvePic(file);
      img.alt = "";
      img.onload = function () { requestAnimationFrame(function () { img.classList.remove("is-out"); }); };
      el.portraitLayer.appendChild(img);
    }
    place("left", p.left, p.leftFx);
    place("right", p.right, p.rightFx);
    if (p.focus) place("focus", p.focus, p.focusFx);
    else if (p.center) place("focus", p.center, p.centerFx);
  };

  /* ---- 旁白 ---- */
  function renderNarration(paras, done) {
    el.narration.innerHTML = "";
    el.dialogue.style.display = "none";
    if (!paras || !paras.length) { if (done) done(); return; }
    el.narration.style.display = "";
    /* 预处理：低周目下整段条件文本（{{loopN:...}}）会变为空，跳过不渲染 */
    const list = paras.map(preprocess).filter(function (t) { return t.trim().length > 0; });
    if (!list.length) { if (done) done(); return; }
    let i = 0;
    const step = (reduceMotion ? 120 : 650);
    function next() {
      if (i >= list.length) { if (done) done(); return; }
      const p = document.createElement("p");
      p.textContent = list[i];
      el.narration.appendChild(p);
      requestAnimationFrame(function () { p.classList.add("is-on"); });
      i++;
      setTimeout(next, step);
    }
    next();
  }

  /* ---- 打字机 ---- */
  let typing = false, typeTimer = null, lineDone = null;
  function typewriter(text, done) {
    const txt = preprocess(text);
    el.dLine.textContent = "";
    el.dHint.textContent = "";
    if (!txt) { if (done) done(); return; }
    if (!Game.state.settings.typewriter || TYPE_MS === 0) {
      el.dLine.innerHTML = txt;
      if (done) done();
      return;
    }
    typing = true;
    lineDone = done;
    let i = 0;
    function tick() {
      if (i >= txt.length) { typing = false; lineDone && lineDone(); lineDone = null; return; }
      const ch = txt[i++];
      el.dLine.textContent += ch;
      const wait = PUNCT.test(ch) ? PUNCT_MS : TYPE_MS;
      typeTimer = setTimeout(tick, wait);
    }
    tick();
  }
  function completeTypewriter() {
    if (!typing) return false;
    if (typeTimer) { clearTimeout(typeTimer); typeTimer = null; }
    const node = Game.currentNode();
    el.dLine.textContent = node ? preprocess(node.line || "") : el.dLine.textContent;
    typing = false;
    if (lineDone) { const cb = lineDone; lineDone = null; cb(); }
    return true;
  }

  /* ---- 选项 ---- */
  function renderChoices(choices) {
    el.choices.innerHTML = "";
    if (!choices || !choices.length) return;
    const nodeId = Game.currentNode() && Game.currentNode().id;
    const burnedNodes = Game.state.rollbackUsedAt || [];
    choices.forEach(function (c, idx) {
      const avail = Game.choiceAvailable(c);
      if (!avail && c.hideIfLocked) return;
      const b = document.createElement("button");
      let cls = "choice";
      if (c.danger) cls += " choice--danger";
      else if (c.kind === "meta" || c.kind === "ask") cls += " choice--meta";
      b.className = cls;
      if (!avail) { b.disabled = true; b.title = "（条件未足）"; }
      /* 朱笔残片代价：该选择点的复述旧制本轮回永久封死 */
      if (c.kind === "echo" && burnedNodes.indexOf(nodeId) > -1) {
        b.disabled = true;
        b.title = "（朱笔已锈，此路已封）";
        b.classList.add("choice--burned");
      }
      const tag = document.createElement("span");
      tag.className = "choice__tag";
      tag.textContent = kindTag(c.kind);
      const span = document.createElement("span");
      span.textContent = preprocess(c.text);
      b.appendChild(tag); b.appendChild(span);
      b.addEventListener("click", function (e) {
        e.stopPropagation();
        if (b.disabled) return;
        Game.choose(idx);
      });
      el.choices.appendChild(b);
    });
  }
  function kindTag(k) {
    return { echo: "复述", propose: "提议", silence: "沉默", ask: "反问", meta: "真相", investigate: "调查" }[k] || "";
  }

  /* ---- 内容就绪与推进 ---- */
  let ready = false;
  /* 对白框与选项列自适应对齐：按选项列实际高度精确抬升，保证任何选项数/屏幕都不重叠 */
  function layoutDialogue() {
    const hasChoices = el.choices && el.choices.children.length > 0;
    if (!hasChoices) { el.dialogue.style.bottom = ""; return; }
    const vh = el.screenGame.clientHeight || window.innerHeight || 600;
    const bottom = vh * 0.06 + el.choices.offsetHeight + 14;
    el.dialogue.style.bottom = bottom + "px";
  }
  function contentReady() {
    ready = true;
    const node = Game.currentNode();
    if (!node) return;
    const hasChoices = node.choices && node.choices.length;
    if (hasChoices) {
      renderChoices(node.choices);
      layoutDialogue();
      return;
    }
    if (node.autoDelay != null) {
      setTimeout(function () { if (ready) Game.advance(); }, node.autoDelay);
    } else {
      el.dHint.textContent = "· 点击继续 ·";
    }
  }

  /* ---- 渲染节点 ---- */
  ui.renderNode = function (node) {
    ready = false;
    el.choices.innerHTML = "";
    el.dialogue.style.bottom = "";
    el.dHint.textContent = "";
    el.dChapter.textContent = node.chapter || "";
    el.screenGame.classList.toggle("has-choices", !!(node.choices && node.choices.length));

    if (node.bg) ui.setBg(node.bg, !!node.dark);
    ui.renderPortraits(node.portrait);

    const hasLine = !!node.line;
    const hasNarr = node.narration && node.narration.length;

    if (hasNarr) {
      renderNarration(node.narration, function () {
        if (hasLine) showDialogue(node, contentReady); else contentReady();
      });
    } else if (hasLine) {
      showDialogue(node, contentReady);
    } else {
      contentReady();
    }
  };
  function showDialogue(node, done) {
    el.narration.style.display = "none";
    el.dialogue.style.display = "";
    el.dSpeaker.textContent = node.speaker || "";
    typewriter(node.line || "", done);
  }

  /* ---- 点击推进 ---- */
  function onAdvanceClick() {
    if (completeTypewriter()) return;
    const node = Game.currentNode();
    if (node && node.choices && node.choices.length) return;
    if (!ready) return;
    ready = false;
    Game.advance();
  }

  /* ---- 朱批动画 ---- */
  ui.playVerdict = function (text, cb) {
    if (Game.audio && Game.audio.playVerdictSting) Game.audio.playVerdictSting();
    el.verdictChar.textContent = text || "准";
    el.verdict.classList.add("is-on");
    const dur = Game.state.settings.verdictSkippable ? 1200 : 2000;
    setTimeout(function () {
      el.verdict.classList.remove("is-on");
      if (cb) cb();
    }, dur);
  };

  /* ---- 消散动画 ---- */
  ui.playDissolve = function (cb) {
    if (el.dissolveImg) el.dissolveImg.src = resolvePic("cg_minister_dissolve.jpg");
    el.dissolve.classList.add("is-on");
    setTimeout(function () {
      el.dissolve.classList.remove("is-on");
      if (cb) cb();
    }, 2400);
  };

  /* ---- 结局屏 ---- */
  ui.showEnding = function (e) {
    el.endLabel.textContent = e.label || "";
    el.endTitle.textContent = e.title || "";
    el.endBody.innerHTML = preprocess(e.body || "");
    if (el.endCg && e.cg) { el.endCg.src = resolvePic(e.cg); el.endCg.style.display = ""; }
    else if (el.endCg) { el.endCg.style.display = "none"; }

    el.endActions.innerHTML = "";
    const btn = document.createElement("button");
    const isTrue = e.type === "true";
    btn.className = "btn" + (isTrue ? " btn--danger" : "");
    btn.textContent = isTrue ? "终" : (e.type === "bad" ? "回到本章开头" : "再入轮回");
    btn.addEventListener("click", function () {
      el.ending.classList.remove("is-active");
      Game.continueEnding();
    });
    el.endActions.appendChild(btn);
    if (e.type === "bad" && Game.canUseBrushFragment && Game.canUseBrushFragment()) {
      const frag = document.createElement("button");
      frag.className = "btn btn--ghost";
      frag.textContent = "以残片篡改记录";
      frag.addEventListener("click", function () {
        el.ending.classList.remove("is-active");
        Game.useBrushFragment();
      });
      el.endActions.appendChild(frag);
    }

    el.ending.classList.add("is-active");
  };

  /* ---- 卷宗 ---- */
  ui.openScroll = function () { el.modalScroll.classList.add("is-open"); };
  ui.closeScroll = function () { el.modalScroll.classList.remove("is-open"); };

  /* ---- 情报 ---- */
  const AFF_LEVELS = {
    tianshang: [[-99, "畏"], [-1, "疏"], [0, "如常"], [1, "近"], [2, "信"]],
    atan:      [[-99, "疏"], [-1, "淡"], [0, "如常"], [1, "悦"], [2, "亲"]],
    shentan:   [[0, "未明"], [1, "得见"], [2, "旧识"]],
    lisi:      [[0, "同僚"], [1, "同病"]]
  };
  function affWord(ch) {
    const v = Game.state.affinity[ch] || 0;
    const lv = AFF_LEVELS[ch] || [];
    let w = "？";
    for (let i = 0; i < lv.length; i++) {
      if (v >= lv[i][0]) w = lv[i][1]; else break;
    }
    return w;
  }
  ui.openDossier = function () {
    const list = document.getElementById("dossier-list");
    list.innerHTML = "";
    const aff = document.createElement("div");
    aff.className = "dossier__aff";
    aff.textContent = "好感 · 天殇 " + affWord("tianshang") +
      " · 阿檀 " + affWord("atan") +
      " · 沈砚 " + affWord("shentan") +
      " · 李司农 " + affWord("lisi");
    list.appendChild(aff);
    if (Game.state.hasBrushFragment) {
      const frag = document.createElement("div");
      frag.className = "dossier__frag";
      frag.textContent = "持有 · 朱笔残片 ×1（死于新议时，可篡改记录回退至选择前）";
      list.appendChild(frag);
    }
    if (!Game.state.knowledge.length) {
      const li = document.createElement("div");
      li.className = "dossier__none";
      li.textContent = "（尚无所知。）";
      list.appendChild(li);
    } else {
      Game.state.knowledge.forEach(function (k) {
        const li = document.createElement("div");
        li.className = "dossier__item";
        li.textContent = Game.knowledgeInfo[k] || k;
        list.appendChild(li);
      });
    }
    el.modalDossier.classList.add("is-open");
  };
  ui.closeDossier = function () { el.modalDossier.classList.remove("is-open"); };

  /* ---- 结局图鉴 ---- */
  const GALLERY_ORDER = ["E_A1", "E_A2", "E_A3", "E_A4", "E_B", "E_C", "E_TRUE", "E_PHANTOM"];
  ui.openGallery = function () {
    const unlocked = Game.unlockedEndings();
    const totalE = Object.keys(Game.endings).length;
    const totalK = Object.keys(Game.knowledgeInfo).length;
    el.galleryStats.textContent =
      "第 " + Game.state.loop + " 周目 · 死亡 " + Game.state.deaths +
      " · 情报 " + Game.state.knowledge.length + "/" + totalK +
      " · 结局 " + unlocked.length + "/" + totalE;
    el.galleryList.innerHTML = "";
    GALLERY_ORDER.forEach(function (id) {
      const e = Game.endings[id];
      if (!e) return;
      const open = unlocked.indexOf(id) > -1;
      const card = document.createElement("div");
      card.className = "gallery__card" + (open ? " gallery__card--open" : " gallery__card--locked");
      const badge = document.createElement("div");
      badge.className = "gallery__badge gallery__badge--" + e.type;
      badge.textContent = open ? e.label : "？";
      card.appendChild(badge);
      const title = document.createElement("div");
      title.className = "gallery__title";
      title.textContent = open ? e.title : "？？？";
      card.appendChild(title);
      if (open && e.cg) {
        const img = document.createElement("img");
        img.className = "gallery__cg";
        img.src = resolvePic(e.cg);
        img.alt = "";
        card.appendChild(img);
      }
      if (open && e.hint) {
        const hint = document.createElement("div");
        hint.className = "gallery__hint";
        hint.textContent = e.hint;
        card.appendChild(hint);
      }
      el.galleryList.appendChild(card);
    });
    el.modalGallery.classList.add("is-open");
  };
  ui.closeGallery = function () { el.modalGallery.classList.remove("is-open"); };

  /* ---- 存档 ---- */
  ui.openSave = function (mode) { renderSlots(mode || "save"); el.modalSave.classList.add("is-open"); };
  ui.closeSave = function () { el.modalSave.classList.remove("is-open"); };
  function renderSlots(mode) {
    const list = document.getElementById("save-list");
    list.innerHTML = "";
    ["auto", 1, 2, 3].forEach(function (slot) {
      const info = Game.saveInfo(slot);
      const row = document.createElement("div");
      row.className = "slot" + (info ? "" : " slot--empty");
      const lab = document.createElement("div"); lab.className = "slot__label";
      lab.textContent = (slot === "auto" ? "自动" : "存档 " + slot);
      const inf = document.createElement("div"); inf.className = "slot__info";
      inf.textContent = info ? (info.fmt + " · 第" + (info.loop || 1) + "周目") : "空";
      const act = document.createElement("div"); act.className = "slot__actions";
      if (mode === "save" && slot !== "auto") {
        const b = document.createElement("button"); b.className = "slot__btn"; b.textContent = "存";
        b.onclick = function (e) { e.stopPropagation(); Game.save(slot); renderSlots(mode); };
        act.appendChild(b);
      }
      if (info) {
        const b = document.createElement("button"); b.className = "slot__btn"; b.textContent = "读";
        b.onclick = function (e) { e.stopPropagation(); Game.load(slot); ui.closeSave(); Game.go(Game.state.nodeId); };
        act.appendChild(b);
      }
      row.appendChild(lab); row.appendChild(inf); row.appendChild(act);
      list.appendChild(row);
    });
  }

  /* ---- HUD ---- */
  function renderHUD() {
    el.hudLoop.textContent = "第 " + Game.state.loop + " 周目";
  }

  /* ---- 标题屏菜单 ---- */
  function buildTitleMenu() {
    const menu = document.getElementById("title-menu");
    if (!menu) return;
    menu.innerHTML = "";
    const start = document.createElement("button");
    start.className = "btn"; start.textContent = "入朝";
    start.onclick = function () {
      showScreen("game");
      Game.beginStory();
    };
    const cont = document.createElement("button");
    cont.className = "btn btn--ghost"; cont.textContent = "续前";
    cont.onclick = function () {
      if (Game.load("auto")) { showScreen("game"); Game.go(Game.state.nodeId); }
      else { flash(cont, "无自动存档"); }
    };
    const load = document.createElement("button");
    load.className = "btn btn--ghost"; load.textContent = "读档";
    load.onclick = function () { ui.openSave("load"); };
    const gallery = document.createElement("button");
    gallery.className = "btn btn--ghost"; gallery.textContent = "图鉴";
    gallery.onclick = function () { ui.openGallery(); };
    menu.appendChild(start); menu.appendChild(cont); menu.appendChild(load); menu.appendChild(gallery);
  }
  function flash(btn, msg) {
    const o = btn.textContent; btn.textContent = msg;
    setTimeout(function () { btn.textContent = o; }, 1200);
  }

  /* ---- 初始化 ---- */
  ui.init = function () {
    cacheDom();
    buildTitleMenu();

    el.screenGame.addEventListener("click", onAdvanceClick);

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") {
        if (el.modalScroll.classList.contains("is-open")) ui.closeScroll();
        else if (el.modalSave.classList.contains("is-open")) ui.closeSave();
        else if (el.modalDossier.classList.contains("is-open")) ui.closeDossier();
        else if (el.modalGallery.classList.contains("is-open")) ui.closeGallery();
      } else if (e.key === " " || e.key === "Enter") {
        if (el.screenGame.classList.contains("is-active")) {
          e.preventDefault(); onAdvanceClick();
        }
      } else if (e.key.toLowerCase() === "s") {
        if (el.screenGame.classList.contains("is-active")) Game.save("auto");
      } else if (e.key.toLowerCase() === "c") {
        if (el.screenGame.classList.contains("is-active")) ui.openScroll();
      }
    });

    /* 窗口尺寸变化时重算对白框抬升，保持与选项列贴合 */
    window.addEventListener("resize", layoutDialogue);

    let lastChapter = undefined;
    Game.subscribe("node:enter", function (node) {
      /* 章节（日）切换时闪墨晕转场（ui_transition_ink.webp 增强层） */
      if (node.chapter && lastChapter !== undefined && node.chapter !== lastChapter) {
        el.transition.classList.add("is-on");
        setTimeout(function () { el.transition.classList.remove("is-on"); }, 650);
      }
      if (node.chapter) lastChapter = node.chapter;
      renderHUD();
      ui.renderNode(node);
    });
    Game.subscribe("state:change", renderHUD);
    Game.subscribe("ending:show", function (e) {
      if (Game.state.settings.typewriter === undefined) {}
      ui.showEnding(e);
    });
    Game.subscribe("ending:finish", function () {
      el.ending.classList.remove("is-active");
      showScreen("title");
    });

    // 绑定模态关闭/按钮（由 index.html 提供 data-close 等）
    document.querySelectorAll("[data-close]").forEach(function (b) {
      b.addEventListener("click", function () {
        const m = b.closest(".modal");
        if (m) m.classList.remove("is-open");
      });
    });
    const openScrollBtn = document.getElementById("btn-scroll");
    if (openScrollBtn) openScrollBtn.onclick = ui.openScroll;
    const openSaveBtn = document.getElementById("btn-save");
    if (openSaveBtn) openSaveBtn.onclick = function () { ui.openSave("save"); };
    const openDossierBtn = document.getElementById("btn-dossier");
    if (openDossierBtn) openDossierBtn.onclick = ui.openDossier;
    const toTitleBtn = document.getElementById("btn-menu");
    if (toTitleBtn) toTitleBtn.onclick = function () {
      if (confirm("返回标题？将自动存档。")) { Game.save("auto"); ui.title(); }
    };
    /* 语音开关（audio.js 增强层） */
    const muteBtn = document.getElementById("btn-mute");
    if (muteBtn) {
      const syncMute = function (m) { muteBtn.textContent = m ? "静" : "声"; muteBtn.classList.toggle("btn--danger", !!m); };
      if (Game.audio) {
        muteBtn.onclick = function () { if (Game.audio.toggleMute) syncMute(Game.audio.toggleMute()); };
        syncMute(Game.audio.isMuted ? Game.audio.isMuted() : false);
      } else {
        muteBtn.style.display = "none";
      }
    }
  };
})();

"use strict";
/* tests/lib/dom.js — 最小 DOM 桩（getElementById / createElement / classList / innerHTML / children） */

function mk() {
  const o = {
    _ch: [], className: "", src: "", alt: "", textContent: "", onclick: null, title: "", disabled: false,
    style: {}, dataset: {}, offsetHeight: 0, clientHeight: 0,
    addEventListener() {}, remove() {}, cloneNode() { return mk(); },
    appendChild(c) { this._ch.push(c); return c; },
    get children() { return this._ch; }
  };
  o.classList = {
    add(c) { if (o.className.split(" ").indexOf(c) < 0) o.className = (o.className.trim() ? o.className.trim() + " " : "") + c; },
    remove(c) { o.className = o.className.split(" ").filter((x) => x && x !== c).join(" "); },
    toggle(c, f) { const h = o.className.split(" ").indexOf(c) > -1; if (f === undefined ? !h : f) this.add(c); else this.remove(c); },
    contains(c) { return o.className.split(" ").indexOf(c) > -1; }
  };
  let _html = "";
  Object.defineProperty(o, "innerHTML", {
    get() { return _html; },
    set(v) { _html = v; if (v === "") this._ch.length = 0; }
  });
  return o;
}

function attach() {
  const els = {};
  global.document = {
    getElementById: (id) => (els[id] = els[id] || mk()),
    createElement: () => mk(),
    querySelectorAll: () => [],
    querySelector: () => null,
    addEventListener() {}
  };
  return els;
}

module.exports = { mk, attach };
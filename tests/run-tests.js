"use strict";
/* tests/run-tests.js — 逐文件跑 tests/test-*.js，聚合退出码（node 原生，零依赖） */
const { spawnSync } = require("child_process");
const path = require("path");
const fs = require("fs");

const files = fs.readdirSync(__dirname)
  .filter((f) => /^test-[A-Za-z0-9_-]+\.js$/.test(f))
  .sort();

let failed = 0;
for (const f of files) {
  console.log("\n── " + f + " ──");
  const r = spawnSync(process.execPath, [path.join(__dirname, f)], {
    stdio: "inherit",
    cwd: path.join(__dirname, "..")
  });
  if (r.status === 0) console.log("  ✓ " + f);
  else { failed++; console.log("  ✗ " + f + " (退出码 " + r.status + ")"); }
}

console.log("\n" + (failed ? failed + " 个测试文件失败" : "全部测试文件通过"));
process.exit(failed ? 1 : 0);
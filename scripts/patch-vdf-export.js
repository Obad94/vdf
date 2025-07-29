#!/usr/bin/env node
// Robust patch for Emscripten-generated vdf.js to always export _verify_slow
const fs = require('fs');
const path = require('path');

const distPath = path.join(__dirname, '../dist/vdf.js');
let code = fs.readFileSync(distPath, 'utf8');

// 1. Remove all top-level Module[...] assignments using wasmExports (even if all on one line)
code = code.replace(/^(Module\["_generate"\][^\n;]*;[^\n]*?___cxa_get_exception_ptr=wasmExports\["T"\];?)(\s*\n)?/m, '');

// 2. Remove any previous _verify_slow patch at the top level
code = code.replace(/\/\/ Patch: Export _verify_slow if present in wasmExports[\s\S]*?}\n/, '');

// 3. Patch assignWasmExports to add _verify_slow export (works even if minified)
code = code.replace(
  /(function assignWasmExports\(wasmExports\)\{[\s\S]*?___cxa_get_exception_refcount=wasmExports\["R"\];[^;]*;[^;]*___cxa_can_catch=wasmExports\["S"\];[^;]*;[^;]*___cxa_get_exception_ptr=wasmExports\["T"\];?)/,
  `$1\n  // Patch: Export _verify_slow if present in wasmExports\n  if (wasmExports["U"]) {\n    Module["_verify_slow"] = wasmExports["U"];\n  }`
);

fs.writeFileSync(distPath, code, 'utf8');
console.log('Robustly patched dist/vdf.js to always export _verify_slow');

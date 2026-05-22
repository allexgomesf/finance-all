import { writeFileSync, existsSync } from 'fs';
import { resolve } from 'path';

// next@16.2.6 published without headers.js at the package root.
// This script recreates it so that `import { cookies } from 'next/headers'`
// resolves correctly at runtime and under Turbopack.
const dest = resolve('node_modules/next/headers.js');

if (!existsSync(dest)) {
  const content = `"use strict";
const h = require('./dist/server/request/headers');
const c = require('./dist/server/request/cookies');
const d = require('./dist/server/request/draft-mode');
exports.headers = h.headers;
exports.cookies = c.cookies;
exports.draftMode = d.draftMode;
`;
  writeFileSync(dest, content, 'utf8');
  console.log('patched: node_modules/next/headers.js created');
}

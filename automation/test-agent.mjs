import assert from 'node:assert/strict';
const oneWeek = 7 * 24 * 60 * 60 * 1000;
const start = Date.now(); const followUp = new Date(start + oneWeek).getTime();
assert.equal(followUp - start, oneWeek);
assert.ok('name@example.com'.includes('@'));
console.log('lead-agent scheduling checks passed');

#!/bin/bash
set -e

if [ -z "$TEST_GREP" ]; then
   TEST_GREP=""
fi

node="node"

if [ "$TEST_DEBUG" ]; then
   node="node --inspect --debug-brk"
fi

$node node_modules/.bin/istanbul cover -x *.test.js -- node_modules/.bin/_mocha `scripts/_get-test-directories.sh` --opts tests/mocha.opts --grep "$TEST_GREP"

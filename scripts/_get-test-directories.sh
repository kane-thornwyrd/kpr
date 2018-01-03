#!/bin/bash
set -e

TEST_DIRS=""

sources=("packages")

for source in "${sources[@]}"; do
  for f in $source/*; do
    if [ -n "$TEST_ONLY" ] && [[ `basename $f` != *"$TEST_ONLY"* ]]; then
      continue
    fi
    if [ "$TEST_TYPE" = "cov" ]; then
      continue
    fi

    if [ -d "$f/test" ]; then
      TEST_DIRS="$f/test $TEST_DIRS"
    fi
  done
done

echo $TEST_DIRS

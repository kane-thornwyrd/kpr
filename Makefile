# Inspired by https://github.com/babel/babel/blob/f5ef928586f592aa2d8bb60120ae58833d17e0db/Makefile
MAKEFLAGS = -j1
.DEFAULT_GOAL := help

export NODE_ENV = test
export FORCE_COLOR = true

SOURCES = packages

.PHONY: help build build-dist watch lint fix clean test-clean test-only test test-ci publish bootstrap


usualCommands	:= setup, test, lint, test-unit, test-unit-watch

wildcard=$(wildcard $1$2) $(foreach d,$(wildcard $1*),$(call rwildcard,$d/,$2))

OS					 := $(shell uname)
NODE_MODULES		   ?= "./node_modules"
NODE_MODULES_BIN	   ?= "${NODE_MODULES}/.bin"
MAKE_COMMAND		   ?= help

# Credits to https://gist.github.com/prwhite/8168133#gistcomment-2278355

# COLORS
GREEN  := $(shell tput -Txterm setaf 2)
YELLOW := $(shell tput -Txterm setaf 3)
WHITE  := $(shell tput -Txterm setaf 7)
RESET  := $(shell tput -Txterm sgr0)


TARGET_MAX_CHAR_NUM=20
## Show help
help:
	@echo ''
	@echo 'Usage:'
	@echo '  ${YELLOW}make${RESET} ${GREEN}<target>${RESET}'
	@echo ''
	@echo 'Targets:'
	@awk '/^[a-zA-Z\-\_0-9]+:/ { \
	  helpMessage = match(lastLine, /^## (.*)/); \
	  if (helpMessage) { \
		helpCommand = substr($$1, 0, index($$1, ":")-1); \
		helpMessage = substr(lastLine, RSTART + 3, RLENGTH); \
		printf "  ${YELLOW}%-$(TARGET_MAX_CHAR_NUM)s${RESET} ${GREEN}%s${RESET}\n", helpCommand, helpMessage; \
	  } \
	} \
	{ lastLine = $$0 }' $(MAKEFILE_LIST)

## Build the targets
build: clean
	make clean-lib
	./node_modules/.bin/gulp build

## Watch, clean, lint and devbuild
watch: clean
	make clean-lib
	make lint
	KPR_ENV=development ./node_modules/.bin/gulp watch

lint:
	./node_modules/.bin/eslint scripts $(SOURCES) *.js --format=codeframe

fix:
	./node_modules/.bin/eslint scripts $(SOURCES) *.js --format=codeframe --fix


clean: test-clean
	rm -rf coverage
	rm -rf packages/*/npm-debug*

test-clean:
	$(foreach source, $(SOURCES), \
		$(call clean-source-test, $(source)))

test-only:
	./scripts/test.sh
	make test-clean

test: lint test-only


test-ci:
	make bootstrap
	make test-only

test-ci-coverage: SHELL:=/bin/bash
test-ci-coverage:
	KPR_ENV=cov make bootstrap
	./scripts/test-cov.sh
	bash <(curl -s https://codecov.io/bash) -f coverage/coverage-final.json


publish:
	git pull --rebase
	make clean-lib
	KPR_ENV=production make build
	make test
	npm run semantic-release
	make clean


bootstrap:
	make clean-all
	npm i
	./node_modules/.bin/lerna bootstrap
	make build


clean-lib:
	$(foreach source, $(SOURCES), \
		$(call clean-source-lib, $(source)))

clean-all:
	rm -rf node_modules
	rm -rf package-lock.json

	$(foreach source, $(SOURCES), \
		$(call clean-source-all, $(source)))

	make clean

define clean-source-lib
	rm -rf $(1)/*/lib

endef

define clean-source-test
	rm -rf $(1)/*/test/tmp
	rm -rf $(1)/*/test-fixtures.json

endef

define clean-source-all
	rm -rf $(1)/*/lib
	rm -rf $(1)/*/node_modules
	rm -rf $(1)/*/package-lock.json

endef


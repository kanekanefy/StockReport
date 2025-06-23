# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

StockReport is a new project repository that has been initialized but not yet developed. The codebase structure and development commands will be documented here as the project evolves.

## Development Setup

This repository uses **git-flow** for branch management.

### Git Flow Commands
- `git flow init` - Initialize git-flow (already done)
- `git flow feature start <feature-name>` - Start a new feature branch
- `git flow feature finish <feature-name>` - Finish feature and merge to develop
- `git flow release start <version>` - Start a release branch
- `git flow release finish <version>` - Finish release and merge to master/develop
- `git flow hotfix start <version>` - Start a hotfix branch
- `git flow hotfix finish <version>` - Finish hotfix and merge to master/develop

### Branch Structure
- `master` - Production-ready code
- `develop` - Integration branch for features
- `feature/*` - Feature development branches
- `release/*` - Release preparation branches
- `hotfix/*` - Production hotfix branches

## Architecture

The project architecture will be documented here once the initial codebase is established.

## Notes

- This is a fresh repository with no existing codebase
- Development patterns and conventions should be established as the project grows
- Update this file with relevant build, test, and development commands as they are added
# GitHub Workflow Automation

This directory contains GitHub Actions workflows for automating various repository tasks.

## Workflows

### 1. Automated PR from theme-branch to main (`auto-pr.yml`)

This workflow automatically creates a pull request from `theme-branch` to `main` whenever changes are pushed to the `theme-branch`.

**Triggers:**
- Push to `theme-branch`
- Manual trigger from GitHub Actions tab

**Actions:**
- Creates a PR from `theme-branch` to `main`
- Adds labels: `automated-pr` and `theme-update`

### 2. Auto-merge PR from theme-branch (`auto-merge.yml`)

This workflow automatically merges pull requests from `theme-branch` to `main` when they have the `auto-merge` label.

**Triggers:**
- PR opened, synchronized, reopened, or labeled targeting `main`

**Conditions:**
- PR must be from `theme-branch` to `main`
- PR must have the `auto-merge` label

**Actions:**
- Squash merges the PR if conditions are met

## Usage

### For automatic PR creation:
- Simply push your changes to the `theme-branch`
- A PR will be created automatically

### For automatic PR merging:
- Add the `auto-merge` label to PRs you want to be merged automatically
- Note: Only PRs from `theme-branch` to `main` will be considered for auto-merging

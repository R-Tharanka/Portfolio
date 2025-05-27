# Automating Pull Requests with GitHub Actions

This document explains how the automated pull request workflows are configured and how to customize them for your needs.

## Overview

This repository uses two GitHub Actions workflows:

1. **auto-pr.yml**: Creates a PR from `theme-branch` to `main` automatically when changes are pushed to `theme-branch`
2. **auto-merge.yml**: Automatically merges PRs from `theme-branch` to `main` when they have the `auto-merge` label

## Prerequisites

To use these workflows, you need:

1. A GitHub repository (this one)
2. Two branches: `main` and `theme-branch`
3. Proper GitHub permissions to create workflows and PRs

## How It Works

### Auto PR Creation

When you push changes to `theme-branch`, GitHub Actions automatically:

1. Triggers the workflow defined in `.github/workflows/auto-pr.yml`
2. Creates a new PR targeting `main` if one doesn't exist
3. Updates the existing PR if it already exists

### Auto PR Merging

For PRs that should be merged automatically:

1. Apply the `auto-merge` label to the PR
2. The workflow in `.github/workflows/auto-merge.yml` will detect this label
3. If the PR is from `theme-branch` to `main`, it will be automatically merged

## Customization

### Changing Branch Names

To use different branch names:

1. Edit `.github/workflows/auto-pr.yml`:
   - Change `theme-branch` to your source branch name in the `on.push.branches` section
   - Update the `branch` and `base` parameters in the `Create Pull Request` step

2. Edit `.github/workflows/auto-merge.yml`:
   - Update the `if` condition to check for your branch name instead of `theme-branch`

### Modifying PR Content

To customize the PR content:

1. Edit the `title` and `body` parameters in the `Create Pull Request` step of `auto-pr.yml`

### Changing Merge Behavior

To modify how PRs are merged:

1. Edit `.github/workflows/auto-merge.yml`:
   - Change `MERGE_METHOD` from "squash" to "merge" or "rebase"
   - Update `MERGE_LABELS` to use different labels
   - Adjust retry parameters as needed

## Troubleshooting

If the automation isn't working:

1. Check the workflow logs in the GitHub Actions tab
2. Verify that the correct branches are being used
3. Ensure you have the necessary permissions
4. Make sure the `GITHUB_TOKEN` has sufficient permissions

## Security Considerations

- The workflows use `secrets.GITHUB_TOKEN` which is automatically provided by GitHub
- For more sensitive operations, consider creating a dedicated Personal Access Token (PAT)
- Consider adding required reviews or status checks for additional security

# Git Automation Workflows

This document describes the automated Git workflows configured for this portfolio project.

## Overview

We have implemented three workflows to automate branch management tasks:

1. **Auto PR from Theme Branch** - Creates a pull request when changes are made to the theme branch
2. **Auto Merge Theme PR** - Automatically approves and merges PRs from the theme branch
3. **Auto PR and Merge UI/UX/SEO** - Opens, summarizes, and merges updates from the ui-ux-seo branch

## Pull Request Automation

This repository contains GitHub Actions workflows that automate pull requests from the theme-branch and ui-ux-seo branches to the main branch:

### 1. Auto PR from Theme Branch

File: [.github/workflows/auto-pr-from-theme.yml](.github/workflows/auto-pr-from-theme.yml)

This workflow automatically creates a pull request from theme-branch to main whenever:
- Changes are pushed to theme-branch
- The workflow is manually triggered from the GitHub Actions tab
- There are actual differences between the branches (change detection)

The pull request will:
- Include a descriptive title and body
- Be labeled with "theme" and "automated-pr" labels
- Preserve the theme-branch after merging

### 2. Auto Merge Theme PR

File: [.github/workflows/auto-merge-theme-pr.yml](.github/workflows/auto-merge-theme-pr.yml)

This workflow automatically approves and merges pull requests that:
- Target the main branch
- Have theme-branch as the source branch
- Are not in draft state
- Have the required labels ("theme", "automated-pr")

The merge will:
- Use "squash" as the merge method
- Keep a descriptive commit message
- Preserve the theme-branch after merging

### 3. Auto PR and Merge UI/UX/SEO Branch

File: [.github/workflows/auto-pr-ui-ux-seo.yml](.github/workflows/auto-pr-ui-ux-seo.yml)

This workflow keeps the ui-ux-seo branch synchronized with main by:
- Triggering on pushes to ui-ux-seo or when run manually
- Detecting whether the branch differs from main before acting
- Creating or reusing a pull request targeting main
- Generating the pull request description with GitHub Copilot Actions using a structured summary
- Squash merging the pull request once the description has been updated

## Customizing the Workflows

You can customize these workflows by editing the YAML files in the `.github/workflows` directory:

- To change when PRs are created, modify the `on` section in `auto-pr-from-theme.yml`
- To add tests or other checks before merging, uncomment and modify the test steps in `auto-merge-theme-pr.yml`
- To change the merge behavior, edit the `MERGE_` environment variables in `auto-merge-theme-pr.yml`

## Required Permissions

These workflows use the `GITHUB_TOKEN` secret which is automatically provided by GitHub. However, for some actions like auto-merge, you may need to adjust repository settings:

1. Go to your repository settings
2. Navigate to "Actions" under "General"
3. Set "Workflow permissions" to "Read and write permissions"

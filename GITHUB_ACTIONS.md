# GitHub Actions Workflows for Theme Management

This document explains the GitHub Actions workflows used for theme branch management in this portfolio project.

## Overview

We have implemented two workflows to automate the theme management process:

1. **Auto PR from Theme Branch** - Creates a pull request when changes are made to the theme-branch
2. **Auto Merge Theme PR** - Automatically approves and merges PRs from the theme-branch

## Workflow Details

### Auto PR from Theme Branch (`auto-pr-from-theme.yml`)

This workflow is triggered when:
- Changes are pushed to the `theme-branch`
- Manually triggered from the GitHub Actions tab

What it does:
1. Checks if there are differences between the `main` branch and `theme-branch`
2. If there are changes, creates a pull request from `theme-branch` to `main`
3. Adds appropriate labels to the PR

Configuration notes:
- Uses explicit permissions for GitHub token
- Sets appropriate committer and author details
- Applies the labels "theme" and "automated-pr"

### Auto Merge Theme PR (`auto-merge-theme-pr.yml`)

This workflow is triggered when:
- A pull request is opened, synchronized, reopened, or marked ready for review
- The target branch is `main`

What it does:
1. Verifies the PR is from `theme-branch` and not in draft status
2. Auto-approves the PR (if not from dependabot)
3. Auto-merges the PR with a squash merge

## Troubleshooting

If you encounter permission errors in GitHub Actions:
1. Ensure the workflows have appropriate permissions defined
2. Verify your repository settings allow GitHub Actions to create and approve PRs
3. Check that the workflow is using the correct token with sufficient permissions

## Manual Process

If needed, you can still manage theme changes manually:
1. Make changes in the `theme-branch`
2. Create a PR to the `main` branch
3. Review and merge the changes

For more information on GitHub Actions, refer to the [GitHub Actions documentation](https://docs.github.com/en/actions).

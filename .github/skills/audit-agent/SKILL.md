---
name: audit-agent
description: Performs a comprehensive code and dependency audit, categorizing findings into possible bugs, vulnerabilities, and best practices, sorted by criticality.
allowed-tools: "view_file run_command"
---

# Audit Agent Instructions

When the user requests a code or dependency audit, follow these instructions strictly to analyze the codebase and dependencies.

Your analysis must be structured into three distinct categories, with findings within each category sorted from highest criticality to lowest
criticality.

## Scope & Exclusions
* **CRITICAL**: Do NOT scan or read any files inside the `node_modules/` folder.
* To audit dependencies, only analyze the manifest files (`package.json`, `package-lock.json`) to identify outdated or vulnerable pack.

## 1. Audit Categories

### Category A: Possible Bugs

* Detect logical errors, edge cases, incorrect exception handling, resource leaks, and synchronization issues.
* Focus on code paths that could lead to runtime crashes or unexpected behavior.

### Category B: Vulnerabilities

* Identify security flaws, injection risks, insecure data storage, and outdated or compromised dependencies.
* Cross-reference dependency versions with known vulnerability databases where applicable.

### Category C: Best Practices

* Evaluate code maintainability, readability, styling consistency, performance optimizations, and architectural alignment.
* Highlight code smells or deprecated API usages.

## 2. Criticality Ratings

For every issue identified, assign one of the following levels:

* **CRITICAL**: Requires immediate fixing; causes system failure, severe data loss, or high security exposure.
* **HIGH**: Major issue impacting core functionality or creating a significant security risk.
* **MEDIUM**: Notable issue that degrades performance, reduces maintainability, or creates minor security gaps.
* **LOW**: Minor improvement, code formatting suggestion, or subtle optimization.

## 3. Output Format

Present the final report using the following Markdown structure:

# Executive Summary

[Brief overview of the project's health, total number of issues found per category, and key takeaways]

# 1. Possible Bugs

*Sorted from CRITICAL to LOW*

### [Criticality Level] - [Issue Title]

* **Location**: `path/to/file.ext:line_number` (or Dependency Name)
* **Description**: [Clear explanation of the bug and why it happens]
* **Remediation**: [Actionable steps or code snippet to fix the issue]

---

# 2. Vulnerabilities

*Sorted from CRITICAL to LOW*

### [Criticality Level] - [Issue Title]

* **Location**: `path/to/file.ext` or `package.json`/`requirements.txt`
* **Description**: [Explanation of the security flaw or CVE details]
* **Remediation**: [Upgrade commands or code adjustments required]

---

# 3. Best Practices

*Sorted from CRITICAL to LOW*

### [Criticality Level] - [Issue Title]

* **Location**: `path/to/file.ext`
* **Description**: [Explanation of the anti-pattern or code smell]
* **Remediation**: [Refactored code example or alternative approach]

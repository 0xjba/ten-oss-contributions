# Web3.js Testing

## Introduction

Welcome to the Web3.js testing guidelines for TEN! This guide helps contributors test Web3.js features, ensuring all core functionality works properly. We encourage all contributions—whether it's testing core features, specific updates in V6, or submitting fixes. Use this guide to claim features, submit test results, suggest fixes, and collaborate with other contributors.

---

## Table of Contents

1. [Test Claiming Process](#test-claiming-process)
2. [Submitting Test Results and Fixes](#submitting-test-results-and-fixes)
3. [Feature Testing Checklist](#feature-testing-checklist)
4. [Testing Guidelines](#testing-guidelines)
5. [Bug Reporting](#bug-reporting)

---

## Test Claiming Process

1. **Fork the Repository**: Fork the repository and clone it locally.
   
2. **Choose a Feature to Test**:
   - Refer to the [Feature Testing Checklist](#feature-testing-checklist).
   - If a feature is available, claim it by opening a **Pull Request (PR)** that adds your GitHub username in the checklist next to the feature you wish to test.

3. **Update the Checklist**:
   - In your PR, update the feature status to "🔄 In Progress" and add your GitHub username in the contributor column.
   - Once approved, begin testing.

---

## Submitting Test Results and Fixes

1. **Conduct Your Tests**:
   - Follow the [Testing Guidelines](#testing-guidelines) to ensure you thoroughly test each feature.

2. **Document Your Results**:
   - Use the `results-template.md` format to document your test results.
   - Include any **fixes** in the same document by adding a "Fixes" section with a link to your code repository or the PR where the fix is implemented.

3. **Submit via PR**:
   - After testing, submit a PR with your test results in the `/testing/Test Results/` folder, naming the file as `username-feature-tested.md` (e.g., `alice-BigInt.add.md`).
   - If a **fix** was made, link to the fix in the same PR or submit a separate PR for major fixes with a reference to the test result.

4. **Update the Checklist**:
   - In your PR, mark the feature as **"✔️ Completed"** or **"✔️ Completed with Fix"** in the [Feature Testing Checklist](#feature-testing-checklist).
   - After review and merging, the feature will be officially marked as completed.

---

## Feature Testing Checklist

Use this comprehensive [checklist](test-checklist.md) to track testing progress. Contributors can claim any feature by adding their GitHub username and marking it "🔄 In Progress" via a pull request.

| Feature                                  | Status          | Contributor          | PR Link | Fixes (if any)    |
|------------------------------------------|-----------------|----------------------|---------|------------------|
| **BigInt.add**                           | ❌ Pending      |                      |         |                  |
| **Contract.deploy**                      | 🔄 In Progress  |                      |         |                  |
| **BrowserProvider**                      | ✔️ Completed     |                      |         |                  |

**Key**:
- **❌ Pending**: The feature is not yet claimed for testing.
- **🔄 In Progress**: The feature is being tested by a contributor.
- **✔️ Completed**: Testing is complete, and results have been submitted.
- **✔️ Completed with Fix**: Testing was completed, and a bug was found and fixed.

---

## Testing Guidelines

Follow these guidelines to perform thorough and standardized testing:

1. **Setup**:
   - Use Web3.js Vx.x.x.
   - Add TEN network to your wallet or config by visiting [TEN Gateway](https://testnet.ten.xyz/).
   - Set up a suitable environment (Node.js, Hardhat, or browser) for the feature you're testing.

2. **Test Cases**:
   - For each feature, write a set of **test cases** to verify correctness under multiple scenarios (edge cases, typical usage, etc.).
   - Include tests for both **successful execution** and **error handling**.

3. **Documenting Results**:
   - Use the provided test result template below for consistency.
   - Include logs, screenshots, and other helpful artifacts where necessary.

---

## Bug Reporting

- If you encounter any issues during testing, please submit a GitHub issue.
- Ensure the issue includes detailed steps to reproduce, logs, and relevant data for faster triage.

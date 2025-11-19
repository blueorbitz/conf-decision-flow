# Testing Documentation
## Decision Flow Builder Application

Welcome to the testing documentation for the Decision Flow Builder application! This README will guide you through the available testing resources and how to use them.

---

## 📚 Documentation Overview

This project includes comprehensive testing documentation to help you validate the application thoroughly:

| Document | Purpose | When to Use |
|----------|---------|-------------|
| **TESTING_SUMMARY.md** | Overview of all testing resources | Start here! |
| **E2E_VALIDATION_GUIDE.md** | Quick start guide | First-time testing |
| **E2E_TEST_PLAN.md** | Detailed test plan | Formal testing |
| **TEST_EXECUTION_CHECKLIST.md** | Printable checklist | During test execution |
| **QUICK_TEST_SCENARIOS.md** | Ready-to-use scenarios | Creating test flows |

---

## 🚀 Quick Start (5 Minutes)

### Step 1: Validate Deployment Readiness

```bash
node validate-deployment.js
```

This script checks that everything is ready for deployment.

### Step 2: Deploy the Application

```bash
# Validate manifest
forge lint

# Deploy to development
forge deploy --environment development --non-interactive

# Install on your Jira site
forge install --site https://your-site.atlassian.net --product jira --environment development --non-interactive
```

### Step 3: Run Smoke Test

Follow the **Quick Smoke Test** in `E2E_VALIDATION_GUIDE.md` (takes 5 minutes).

---

## 📖 Documentation Guide

### For First-Time Testers

**Start with**: `E2E_VALIDATION_GUIDE.md`

This guide provides:
- Pre-test setup instructions
- Quick smoke test (5 minutes)
- Common issues and solutions
- Debugging tips

**Then move to**: `QUICK_TEST_SCENARIOS.md`

This provides ready-to-use test scenarios you can copy and paste.

### For Comprehensive Testing

**Use**: `E2E_TEST_PLAN.md`

This comprehensive plan includes:
- 10 test suites
- 50+ test cases
- Detailed expected results
- Prerequisites and setup

**Track progress with**: `TEST_EXECUTION_CHECKLIST.md`

This printable checklist helps you:
- Track test execution
- Document pass/fail results
- Log issues found
- Calculate pass rate

### For Understanding the Big Picture

**Read**: `TESTING_SUMMARY.md`

This summary provides:
- Overview of all testing resources
- Validation status
- Requirements coverage
- Success criteria
- Quick reference commands

---

## 🎯 Testing Workflow

```
┌─────────────────────────────────────────────────────────┐
│ 1. Pre-Test Setup (10 min)                             │
│    - Run validate-deployment.js                         │
│    - Deploy application                                 │
│    - Install on Jira site                              │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ 2. Smoke Test (5 min)                                   │
│    - Follow E2E_VALIDATION_GUIDE.md                     │
│    - Verify basic functionality                         │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ 3. Comprehensive Testing (60 min)                       │
│    - Use TEST_EXECUTION_CHECKLIST.md                    │
│    - Execute all test cases                             │
│    - Document results                                   │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ 4. Scenario Testing (30 min)                            │
│    - Use QUICK_TEST_SCENARIOS.md                        │
│    - Test real-world use cases                          │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ 5. Review and Sign-Off                                  │
│    - Review test results                                │
│    - Document issues                                    │
│    - Make go/no-go decision                            │
└─────────────────────────────────────────────────────────┘
```

---

## 🔧 Tools and Scripts

### validate-deployment.js

**Purpose**: Automated pre-deployment validation

**Usage**:
```bash
node validate-deployment.js
```

**What it checks**:
- ✅ All required files exist
- ✅ Dependencies are installed
- ✅ Build directories exist
- ✅ Manifest is configured correctly
- ✅ All scopes are present

**Output**: Color-coded pass/fail results with recommendations

---

## 📋 Test Coverage

The testing documentation covers all requirements:

### Flow Management
- Create, edit, delete flows
- Save and load flows
- Flow list display

### Node Types
- Start nodes
- Question nodes (all types)
- Logic nodes (all operators)
- Action nodes (all types)

### User Interface
- Admin page flow builder
- Issue panel questionnaire
- Flow diagram visualization
- Audit log debugger

### Integration
- Jira API integration
- Storage persistence
- Multi-project binding
- User permissions

### Error Handling
- Validation errors
- Network errors
- Empty states
- Loading states

---

## ✅ Success Criteria

The application passes validation when:

### Critical (Must Pass)
- ✅ Flows can be created and saved
- ✅ Flows appear in issue panels
- ✅ Questions can be answered
- ✅ Logic evaluates correctly
- ✅ Actions execute successfully
- ✅ No critical errors

### Important (Should Pass)
- ✅ Flow diagram works
- ✅ Audit logs work
- ✅ Reset works
- ✅ All node types work
- ✅ All question types work

### Nice-to-Have (May Pass)
- ✅ Good performance
- ✅ Intuitive UI
- ✅ Helpful error messages

---

## 🐛 Debugging

### View Application Logs

```bash
# Last 15 minutes
forge logs --environment development --since 15m

# Last hour
forge logs --environment development --since 1h

# Verbose output
forge logs --environment development --verbose
```

### Browser Console

Open Developer Tools (F12) and check:
- **Console**: JavaScript errors
- **Network**: Failed API calls
- **Application**: Storage issues

### Common Issues

See the **Common Issues and Solutions** section in `E2E_VALIDATION_GUIDE.md`.

---

## 📊 Test Metrics

### Time Estimates

| Activity | Duration |
|----------|----------|
| Pre-test setup | 10 min |
| Smoke test | 5 min |
| Comprehensive testing | 60 min |
| Scenario testing | 30 min |
| **Total** | **~2 hours** |

### Test Cases

| Category | Count |
|----------|-------|
| Flow management | 5 |
| Node types | 4 |
| Question types | 4 |
| Logic operators | 7 |
| Action types | 3 |
| UI components | 8 |
| Error handling | 5 |
| Integration | 10 |
| **Total** | **46** |

---

## 📝 Reporting Issues

When you find an issue, document:

1. **Test Case ID**: Which test case failed
2. **Steps to Reproduce**: Exact steps
3. **Expected Result**: What should happen
4. **Actual Result**: What actually happened
5. **Environment**: Browser, Jira version, etc.
6. **Logs**: Relevant error logs
7. **Screenshots**: Visual evidence

Use the **Issues Found** section in `TEST_EXECUTION_CHECKLIST.md`.

---

## 🎓 Learning Resources

### Understanding the Application

1. Read `.kiro/specs/decision-flow-builder/requirements.md`
2. Read `.kiro/specs/decision-flow-builder/design.md`
3. Review `QUICK_TEST_SCENARIOS.md` for examples

### Forge Development

- [Forge Documentation](https://developer.atlassian.com/platform/forge/)
- [Jira REST API](https://developer.atlassian.com/cloud/jira/platform/rest/v3/)
- [React Flow](https://reactflow.dev/)
- [Atlaskit Components](https://atlaskit.atlassian.com/)

---

## 🚦 Testing Status

### Current Status: ✅ READY FOR TESTING

All testing documentation and tools are complete and ready to use.

### Pre-Deployment Validation: ✅ PASSED

All automated checks passed:
- 25/25 checks passed
- 0 failures
- 0 warnings

### Manifest Validation: ✅ PASSED

Forge lint: No issues found

---

## 📞 Support

If you need help during testing:

1. Check the troubleshooting sections in the guides
2. Review the design document for expected behavior
3. Check Forge logs for errors
4. Review browser console for client errors
5. Document issues in the checklist

---

## 🎉 Next Steps

1. **Read** `TESTING_SUMMARY.md` for an overview
2. **Follow** `E2E_VALIDATION_GUIDE.md` to get started
3. **Execute** tests using `TEST_EXECUTION_CHECKLIST.md`
4. **Try** scenarios from `QUICK_TEST_SCENARIOS.md`
5. **Document** results and issues
6. **Review** and make go/no-go decision

---

## 📄 File Structure

```
.
├── TESTING_README.md                 ← You are here
├── TESTING_SUMMARY.md                ← Start here for overview
├── E2E_VALIDATION_GUIDE.md           ← Quick start guide
├── E2E_TEST_PLAN.md                  ← Comprehensive test plan
├── TEST_EXECUTION_CHECKLIST.md       ← Printable checklist
├── QUICK_TEST_SCENARIOS.md           ← Test scenarios
├── validate-deployment.js            ← Validation script
└── .kiro/specs/decision-flow-builder/
    ├── requirements.md               ← Requirements spec
    ├── design.md                     ← Design document
    └── tasks.md                      ← Implementation tasks
```

---

**Happy Testing! 🚀**

If you have any questions or find issues with the testing documentation itself, please document them so we can improve the testing process.


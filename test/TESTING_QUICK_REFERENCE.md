# Testing Quick Reference Card
## Decision Flow Builder - At-a-Glance Guide

---

## 🚀 Getting Started (5 Minutes)

### 1. Validate
```bash
node validate-deployment.js
```

### 2. Deploy
```bash
forge lint
forge deploy --environment development --non-interactive
forge install --site YOUR-SITE.atlassian.net --product jira --environment development --non-interactive
```

### 3. Test
- Open Jira → Apps → Decision flow
- Create a simple flow
- Test in an issue

---

## 📚 Documentation Map

```
START HERE
    ↓
TESTING_README.md ────→ First time? Read this
    ↓
TESTING_SUMMARY.md ───→ Want overview? Read this
    ↓
E2E_VALIDATION_GUIDE.md → Ready to test? Follow this
    ↓
TEST_EXECUTION_CHECKLIST.md → Testing now? Use this
```

---

## ✅ Test Checklist (Quick)

### Critical Tests (Must Pass)
- [ ] Create flow in admin page
- [ ] Flow appears in issue panel
- [ ] Answer question
- [ ] Logic evaluates correctly
- [ ] Action executes
- [ ] Issue is modified

### Important Tests (Should Pass)
- [ ] Flow diagram displays
- [ ] Audit log records action
- [ ] Reset works
- [ ] All node types work

---

## 🎯 Test Scenarios (Copy-Paste Ready)

### Scenario 1: Simple Flow
```
Start → Question (Priority: High/Medium/Low) → Action (Add Label)
```

### Scenario 2: Logic Flow
```
Start → Logic (Status = Done?) → [True: Action 1] / [False: Action 2]
```

### Scenario 3: Multi-Step
```
Start → Question 1 → Question 2 → Action
```

---

## 🔧 Common Commands

### Validation
```bash
node validate-deployment.js    # Check readiness
forge lint                     # Validate manifest
```

### Deployment
```bash
forge deploy --environment development --non-interactive
forge install --site SITE --product jira --environment development --non-interactive
```

### Debugging
```bash
forge logs --environment development --since 15m
forge logs --environment development --verbose
```

### Building
```bash
cd static/admin-page && npm run build && cd ../..
cd static/issue-panel && npm run build && cd ../..
```

---

## 🐛 Troubleshooting

### Admin page doesn't load
→ Check `static/admin-page/build/` exists  
→ Run `forge deploy`

### Issue panel doesn't appear
→ Check project key binding  
→ Refresh issue page

### Actions don't execute
→ Check user permissions  
→ Review logs: `forge logs`

### Logic doesn't evaluate
→ Verify field key is correct  
→ Check operator and value

---

## 📊 Test Coverage

| Category | Tests | Status |
|----------|-------|--------|
| Flow Management | 5 | ✅ |
| Node Types | 4 | ✅ |
| Question Types | 4 | ✅ |
| Logic Operators | 7 | ✅ |
| Action Types | 3 | ✅ |
| UI Components | 8 | ✅ |
| Error Handling | 5 | ✅ |
| Integration | 10 | ✅ |
| **Total** | **46** | **✅** |

---

## 🎓 Field Keys Reference

### Standard Fields
```
summary       - Issue title
description   - Issue description
status        - Issue status
priority      - Issue priority
assignee      - Assigned user
reporter      - Reporter user
labels        - Issue labels
```

### Priority Values
```
"Highest"
"High"
"Medium"
"Low"
"Lowest"
```

### Status Values (Common)
```
"To Do"
"In Progress"
"Done"
"Blocked"
```

---

## 📝 Node Configuration Quick Reference

### Question Node
```
- Question: "Your question text"
- Type: Single Choice / Multiple Choice / Date / Number
- Options: ["Option 1", "Option 2", "Option 3"]
```

### Logic Node
```
- Field Key: "status" / "priority" / "customfield_XXXXX"
- Operator: equals / notEquals / contains / greaterThan / lessThan / isEmpty / isNotEmpty
- Expected Value: "Done" / "High" / etc.
```

### Action Node
```
setField:
  - Field Key: "priority"
  - Field Value: { "name": "High" }

addLabel:
  - Label: "your-label"

addComment:
  - Comment: "Your comment text"
```

---

## ⏱️ Time Estimates

| Activity | Duration |
|----------|----------|
| Pre-test setup | 10 min |
| Smoke test | 5 min |
| Comprehensive testing | 60 min |
| Scenario testing | 30 min |
| **Total** | **~2 hours** |

---

## 🎯 Success Criteria

### Must Pass ✅
- Flows can be created
- Flows appear in issues
- Questions work
- Logic evaluates
- Actions execute
- No critical errors

### Should Pass ✅
- Flow diagram works
- Audit logs work
- Reset works
- All node types work

### Nice to Have ✅
- Good performance
- Intuitive UI
- Helpful errors

---

## 📞 Quick Help

### Issue Found?
1. Document in TEST_EXECUTION_CHECKLIST.md
2. Check logs: `forge logs`
3. Check browser console (F12)
4. Review design.md for expected behavior

### Need Examples?
→ See QUICK_TEST_SCENARIOS.md

### Need Details?
→ See E2E_TEST_PLAN.md

### Need Overview?
→ See TESTING_SUMMARY.md

---

## 🔍 Where to Find Things

| Need | File |
|------|------|
| Getting started | E2E_VALIDATION_GUIDE.md |
| Test cases | E2E_TEST_PLAN.md |
| Checklist | TEST_EXECUTION_CHECKLIST.md |
| Scenarios | QUICK_TEST_SCENARIOS.md |
| Overview | TESTING_SUMMARY.md |
| Navigation | TESTING_README.md |
| Diagrams | TESTING_FLOW_DIAGRAM.md |
| This card | TESTING_QUICK_REFERENCE.md |

---

## 🚦 Testing Status

### Pre-Deployment: ✅ PASSED
- 25/25 checks passed
- 0 failures
- 0 warnings

### Manifest: ✅ VALID
- forge lint: No issues

### Application: ✅ READY
- Backend: Ready
- Admin page: Built
- Issue panel: Built
- Documentation: Complete

---

## 💡 Pro Tips

1. **Start with smoke test** - Catches major issues fast
2. **Use checklist** - Don't miss test cases
3. **Document everything** - Issues, results, observations
4. **Check logs often** - Catch errors early
5. **Test in multiple browsers** - Ensure compatibility
6. **Use scenarios** - Real-world test data
7. **Take screenshots** - Visual evidence of issues
8. **Test edge cases** - Empty inputs, special chars
9. **Verify Jira changes** - Actions actually work
10. **Reset between tests** - Clean state

---

## 📋 Pre-Test Checklist

- [ ] Application deployed
- [ ] Application installed
- [ ] Test project exists
- [ ] Admin access available
- [ ] Browser dev tools open
- [ ] Documentation ready
- [ ] Checklist printed/open
- [ ] Ready to document results

---

## 🎉 Quick Wins

### 5-Minute Smoke Test
1. Create flow with Start + Question
2. Save flow
3. Open issue
4. Answer question
5. ✅ Basic functionality works!

### 15-Minute Validation
1. Run smoke test
2. Add Logic node
3. Add Action node
4. Complete flow
5. Verify action executed
6. ✅ Core features work!

---

## 📊 Test Results Template

```
Date: __________
Tester: __________
Environment: Development / Staging / Production

Tests Executed: _____ / 46
Passed: _____
Failed: _____
Pass Rate: _____%

Critical Issues: _____
High Issues: _____
Medium Issues: _____
Low Issues: _____

Overall: PASS / FAIL / PASS WITH ISSUES

Notes:
_________________________________
_________________________________
```

---

## 🔗 Quick Links

- Forge Docs: https://developer.atlassian.com/platform/forge/
- Jira API: https://developer.atlassian.com/cloud/jira/platform/rest/v3/
- React Flow: https://reactflow.dev/
- Atlaskit: https://atlaskit.atlassian.com/

---

**Print this card and keep it handy during testing!**

---

*Version 1.0 | Last Updated: [Current Date]*


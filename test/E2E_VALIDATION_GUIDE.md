# End-to-End Validation Guide
## Quick Start for Testing Decision Flow Builder

This guide provides step-by-step instructions for validating the Decision Flow Builder application.

---

## Pre-Test Setup

### 1. Verify Application is Built

Before deploying, ensure both frontend applications are built:

```bash
# Build Admin Page
cd static/admin-page
npm install
npm run build
cd ../..

# Build Issue Panel
cd static/issue-panel
npm install
npm run build
cd ../..
```

**Verification**: Check that the following directories exist and contain files:
- `static/admin-page/build/`
- `static/issue-panel/build/`

---

### 2. Validate Manifest

Run the Forge linter to check for configuration issues:

```bash
forge lint
```

**Expected Output**: No errors or warnings

---

### 3. Deploy Application

Deploy to your development environment:

```bash
forge deploy --environment development --non-interactive
```

**Expected Output**: Successful deployment message with version number

---

### 4. Install Application

Install the app on your Jira site:

```bash
forge install --site <your-site-url> --product jira --environment development --non-interactive
```

Replace `<your-site-url>` with your actual Jira site URL (e.g., `https://your-domain.atlassian.net`)

**Expected Output**: Successful installation message

---

## Quick Smoke Test (5 minutes)

This quick test verifies the basic functionality is working:

### Step 1: Access Admin Page
1. Log into your Jira site
2. Navigate to **Apps** → **Decision flow**
3. Verify the admin page loads

**✓ Pass Criteria**: Admin page displays with "Create New Flow" button

---

### Step 2: Create Simple Flow
1. Click "Create New Flow"
2. Click "Settings" button
3. Enter:
   - Name: "Smoke Test"
   - Project Keys: Your test project key (e.g., "TEST")
4. Save settings
5. The Start node should be visible
6. Add a Question node:
   - Click "Question" in the palette
   - Select the new node
   - In properties panel:
     - Question: "Is this working?"
     - Type: Single Choice
     - Options: "Yes", "No"
7. Connect Start node to Question node (drag from handle to handle)
8. Click "Save" in toolbar

**✓ Pass Criteria**: Flow saves successfully, appears in flow list

---

### Step 3: Test in Issue Panel
1. Navigate to an issue in your test project
2. Find the "Decision Flow" panel
3. Select the "Smoke Test" flow tab
4. Verify the question appears
5. Select "Yes" and click Submit

**✓ Pass Criteria**: 
- Flow appears in issue panel
- Question displays correctly
- Submit works without errors

---

### Step 4: Verify Flow Diagram
1. Switch to "Flow Diagram" view
2. Verify nodes are displayed
3. Verify visited nodes are highlighted

**✓ Pass Criteria**: Flow diagram renders with proper highlighting

---

## Full Test Execution

For comprehensive testing, follow the **E2E_TEST_PLAN.md** document which includes:

- ✅ All node types (Start, Question, Logic, Action)
- ✅ All question types (Single, Multiple, Date, Number)
- ✅ Logic node evaluation
- ✅ Action execution (setField, addLabel, addComment)
- ✅ Flow diagram visualization
- ✅ Audit logging
- ✅ Reset functionality
- ✅ Multi-project binding
- ✅ Error handling

**Estimated Time**: 45-60 minutes

---

## Common Issues and Solutions

### Issue: Admin page doesn't load
**Solution**: 
- Check that `static/admin-page/build` directory exists and has files
- Verify manifest.yml has correct resource path
- Redeploy the application

### Issue: Issue panel doesn't appear
**Solution**:
- Verify the flow is bound to the correct project key
- Check that the issue belongs to the bound project
- Refresh the issue page

### Issue: Actions don't execute
**Solution**:
- Verify the app has required scopes (read:jira-work, write:jira-work)
- Check that the user has permission to modify the issue
- Review logs: `forge logs --environment development`

### Issue: Logic node doesn't evaluate
**Solution**:
- Verify the field key is correct (e.g., "status", "priority")
- Check that the issue has a value for that field
- Ensure the operator and expected value are correct

### Issue: Flow doesn't save
**Solution**:
- Ensure flow name is not empty
- Ensure at least one project key is provided
- Check browser console for errors

---

## Debugging Tips

### View Application Logs

```bash
forge logs --environment development --since 15m
```

This shows logs from the last 15 minutes. Useful for debugging resolver issues.

### Check Storage Contents

Add a temporary resolver to check storage:

```javascript
resolver.define('debugStorage', async (req) => {
    const flowIds = await storage.get('decision-flows');
    return { flowIds };
});
```

Then call it from the frontend to see what's stored.

### Browser Console

Open browser developer tools (F12) and check:
- **Console tab**: For JavaScript errors
- **Network tab**: For failed API calls
- **Application/Storage tab**: For local storage issues

---

## Test Data Cleanup

After testing, you may want to clean up test data:

### Delete Test Flows
1. Go to Admin Page
2. Delete all test flows using the Delete button

### Clear Execution States
Execution states are automatically cleaned up when flows are deleted, but you can also:
- Reset individual flows using the Reset button in the issue panel
- Or manually clear storage (requires custom resolver)

---

## Reporting Issues

If you find issues during testing, document:

1. **Steps to reproduce**: Exact steps that cause the issue
2. **Expected behavior**: What should happen
3. **Actual behavior**: What actually happens
4. **Environment**: Browser, Jira version, etc.
5. **Logs**: Relevant logs from `forge logs`
6. **Screenshots**: Visual evidence of the issue

---

## Success Criteria

The application passes end-to-end validation if:

- ✅ All flows can be created, edited, and deleted
- ✅ All node types work correctly
- ✅ Flows appear in correct project issues
- ✅ Questions can be answered
- ✅ Logic nodes evaluate correctly
- ✅ Actions execute and modify Jira issues
- ✅ Flow diagram shows execution path
- ✅ Audit logs record all actions
- ✅ Reset functionality works
- ✅ No critical errors in logs
- ✅ User experience is smooth and intuitive

---

## Next Steps After Validation

Once validation is complete:

1. **Document any issues found** in the test results section of E2E_TEST_PLAN.md
2. **Fix critical issues** before production deployment
3. **Deploy to production** when ready:
   ```bash
   forge deploy --environment production --non-interactive
   forge install --upgrade --site <your-site-url> --product jira --environment production --non-interactive
   ```
4. **Monitor production logs** for the first few days
5. **Gather user feedback** and iterate

---

## Additional Resources

- **Forge Documentation**: https://developer.atlassian.com/platform/forge/
- **Jira REST API**: https://developer.atlassian.com/cloud/jira/platform/rest/v3/
- **React Flow Documentation**: https://reactflow.dev/
- **Atlaskit Components**: https://atlaskit.atlassian.com/

---

**Good luck with your testing! 🚀**


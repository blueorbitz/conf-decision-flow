#!/usr/bin/env node

/**
 * Deployment Validation Script
 * 
 * This script performs basic checks to ensure the Decision Flow Builder
 * application is ready for deployment and testing.
 */

const fs = require('fs');
const path = require('path');

// ANSI color codes for terminal output
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m'
};

// Helper functions
function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function success(message) {
    log(`✓ ${message}`, 'green');
}

function error(message) {
    log(`✗ ${message}`, 'red');
}

function warning(message) {
    log(`⚠ ${message}`, 'yellow');
}

function info(message) {
    log(`ℹ ${message}`, 'cyan');
}

function header(message) {
    log(`\n${'='.repeat(60)}`, 'blue');
    log(message, 'blue');
    log('='.repeat(60), 'blue');
}

// Validation checks
const checks = {
    passed: 0,
    failed: 0,
    warnings: 0
};

function checkFileExists(filePath, description) {
    if (fs.existsSync(filePath)) {
        success(`${description} exists`);
        checks.passed++;
        return true;
    } else {
        error(`${description} not found: ${filePath}`);
        checks.failed++;
        return false;
    }
}

function checkDirectoryExists(dirPath, description) {
    if (fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory()) {
        const files = fs.readdirSync(dirPath);
        if (files.length > 0) {
            success(`${description} exists with ${files.length} files`);
            checks.passed++;
            return true;
        } else {
            warning(`${description} exists but is empty`);
            checks.warnings++;
            return false;
        }
    } else {
        error(`${description} not found: ${dirPath}`);
        checks.failed++;
        return false;
    }
}

function checkPackageJson(packagePath, requiredDeps) {
    if (!fs.existsSync(packagePath)) {
        error(`package.json not found: ${packagePath}`);
        checks.failed++;
        return false;
    }

    try {
        const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
        const allDeps = { ...packageJson.dependencies, ...packageJson.devDependencies };
        
        let allPresent = true;
        for (const dep of requiredDeps) {
            if (allDeps[dep]) {
                success(`  - ${dep} is installed`);
            } else {
                error(`  - ${dep} is missing`);
                allPresent = false;
            }
        }
        
        if (allPresent) {
            checks.passed++;
        } else {
            checks.failed++;
        }
        
        return allPresent;
    } catch (err) {
        error(`Failed to parse package.json: ${err.message}`);
        checks.failed++;
        return false;
    }
}

function checkManifest() {
    const manifestPath = path.join(process.cwd(), 'manifest.yml');
    
    if (!fs.existsSync(manifestPath)) {
        error('manifest.yml not found');
        checks.failed++;
        return false;
    }

    try {
        const manifest = fs.readFileSync(manifestPath, 'utf8');
        
        // Check for required modules
        const hasAdminPage = manifest.includes('jira:adminPage');
        const hasIssuePanel = manifest.includes('jira:issueActivity') || manifest.includes('jira:issuePanel');
        const hasResolver = manifest.includes('function:');
        
        // Check for required scopes
        const hasReadScope = manifest.includes('read:jira-work');
        const hasWriteScope = manifest.includes('write:jira-work');
        const hasStorageScope = manifest.includes('storage:app');
        
        // Check for resources
        const hasAdminResource = manifest.includes('admin-page');
        const hasIssuePanelResource = manifest.includes('issue-panel');
        
        if (hasAdminPage) {
            success('Admin page module configured');
            checks.passed++;
        } else {
            error('Admin page module not configured');
            checks.failed++;
        }
        
        if (hasIssuePanel) {
            success('Issue panel module configured');
            checks.passed++;
        } else {
            error('Issue panel module not configured');
            checks.failed++;
        }
        
        if (hasResolver) {
            success('Resolver function configured');
            checks.passed++;
        } else {
            error('Resolver function not configured');
            checks.failed++;
        }
        
        if (hasReadScope && hasWriteScope && hasStorageScope) {
            success('All required scopes present');
            checks.passed++;
        } else {
            error('Missing required scopes');
            if (!hasReadScope) error('  - read:jira-work');
            if (!hasWriteScope) error('  - write:jira-work');
            if (!hasStorageScope) error('  - storage:app');
            checks.failed++;
        }
        
        if (hasAdminResource && hasIssuePanelResource) {
            success('All resources configured');
            checks.passed++;
        } else {
            error('Missing resource configurations');
            checks.failed++;
        }
        
        return hasAdminPage && hasIssuePanel && hasResolver;
    } catch (err) {
        error(`Failed to read manifest.yml: ${err.message}`);
        checks.failed++;
        return false;
    }
}

// Main validation function
async function validate() {
    header('Decision Flow Builder - Deployment Validation');
    
    info('Starting validation checks...\n');
    
    // Check 1: Backend files
    header('1. Backend Files');
    checkFileExists('src/index.js', 'Backend resolver (src/index.js)');
    checkFileExists('package.json', 'Root package.json');
    checkFileExists('manifest.yml', 'Manifest file');
    
    // Check 2: Admin Page
    header('2. Admin Page');
    checkDirectoryExists('static/admin-page/src', 'Admin page source');
    checkFileExists('static/admin-page/package.json', 'Admin page package.json');
    checkFileExists('static/admin-page/src/App.js', 'Admin page App.js');
    checkFileExists('static/admin-page/src/components/FlowBuilder.js', 'FlowBuilder component');
    checkFileExists('static/admin-page/src/components/FlowList.js', 'FlowList component');
    
    info('Checking admin page dependencies...');
    checkPackageJson('static/admin-page/package.json', [
        'react',
        '@xyflow/react',
        '@forge/bridge',
        '@atlaskit/button',
        '@atlaskit/dynamic-table'
    ]);
    
    const adminBuildExists = checkDirectoryExists('static/admin-page/build', 'Admin page build');
    if (!adminBuildExists) {
        warning('Admin page needs to be built. Run: cd static/admin-page && npm run build');
    }
    
    // Check 3: Issue Panel
    header('3. Issue Panel');
    checkDirectoryExists('static/issue-panel/src', 'Issue panel source');
    checkFileExists('static/issue-panel/package.json', 'Issue panel package.json');
    checkFileExists('static/issue-panel/src/App.js', 'Issue panel App.js');
    checkFileExists('static/issue-panel/src/components/QuestionnaireView.js', 'QuestionnaireView component');
    checkFileExists('static/issue-panel/src/components/FlowDiagramView.js', 'FlowDiagramView component');
    checkFileExists('static/issue-panel/src/components/DebuggerView.js', 'DebuggerView component');
    
    info('Checking issue panel dependencies...');
    checkPackageJson('static/issue-panel/package.json', [
        'react',
        '@xyflow/react',
        '@forge/bridge',
        '@atlaskit/button',
        '@atlaskit/dynamic-table'
    ]);
    
    const issuePanelBuildExists = checkDirectoryExists('static/issue-panel/build', 'Issue panel build');
    if (!issuePanelBuildExists) {
        warning('Issue panel needs to be built. Run: cd static/issue-panel && npm run build');
    }
    
    // Check 4: Manifest Configuration
    header('4. Manifest Configuration');
    checkManifest();
    
    // Check 5: Test Documentation
    header('5. Test Documentation');
    checkFileExists('E2E_TEST_PLAN.md', 'E2E test plan');
    checkFileExists('E2E_VALIDATION_GUIDE.md', 'E2E validation guide');
    
    // Summary
    header('Validation Summary');
    log(`\nTotal Checks: ${checks.passed + checks.failed + checks.warnings}`);
    success(`Passed: ${checks.passed}`);
    if (checks.warnings > 0) {
        warning(`Warnings: ${checks.warnings}`);
    }
    if (checks.failed > 0) {
        error(`Failed: ${checks.failed}`);
    }
    
    // Recommendations
    header('Recommendations');
    
    if (checks.failed === 0 && checks.warnings === 0) {
        success('All checks passed! Application is ready for deployment.');
        info('\nNext steps:');
        info('1. Run: forge lint');
        info('2. Run: forge deploy --environment development --non-interactive');
        info('3. Run: forge install --site <your-site> --product jira --environment development --non-interactive');
        info('4. Follow E2E_VALIDATION_GUIDE.md for testing');
    } else if (checks.failed === 0) {
        warning('Some warnings detected. Review and address before deployment.');
        if (!adminBuildExists || !issuePanelBuildExists) {
            info('\nBuild frontend applications:');
            if (!adminBuildExists) {
                info('  cd static/admin-page && npm install && npm run build && cd ../..');
            }
            if (!issuePanelBuildExists) {
                info('  cd static/issue-panel && npm install && npm run build && cd ../..');
            }
        }
    } else {
        error('Some checks failed. Please fix the issues before deployment.');
        info('\nReview the errors above and:');
        info('1. Ensure all required files exist');
        info('2. Install missing dependencies');
        info('3. Build frontend applications');
        info('4. Fix manifest configuration');
    }
    
    log(''); // Empty line at end
    
    // Exit with appropriate code
    process.exit(checks.failed > 0 ? 1 : 0);
}

// Run validation
validate().catch(err => {
    error(`Validation failed with error: ${err.message}`);
    console.error(err);
    process.exit(1);
});

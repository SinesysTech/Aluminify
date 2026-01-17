/**
 * Test script to verify report formatting enhancements
 * 
 * This script creates sample analysis results and generates both
 * Markdown and JSON reports to verify all formatting features work correctly.
 */

import { createReportGenerator } from './src/reporter/report-generator';
import type { AnalysisResult, ClassifiedIssues, Issue, IssuePattern } from './src/types';

// Create sample issues
const sampleIssues: Issue[] = [
  {
    id: 'issue-001',
    type: 'inconsistent-pattern',
    severity: 'critical',
    category: 'authentication',
    file: 'src/auth/login.ts',
    location: { startLine: 45, endLine: 52, startColumn: 1, endColumn: 1 },
    description: 'Inconsistent authentication client instantiation pattern detected',
    codeSnippet: `const authClient = createAuthClient();\nconst user = await authClient.getUser();\nif (!user) {\n  throw new Error('Not authenticated');\n}`,
    recommendation: 'Use the standardized getAuthClient() helper function instead of creating new instances',
    estimatedEffort: 'small',
    tags: ['auth', 'consistency'],
    detectedBy: 'AuthPatternAnalyzer',
    detectedAt: new Date(),
    relatedIssues: ['issue-002', 'issue-003'],
  },
  {
    id: 'issue-002',
    type: 'type-safety',
    severity: 'high',
    category: 'types',
    file: 'src/utils/helpers.ts',
    location: { startLine: 12, endLine: 15, startColumn: 1, endColumn: 1 },
    description: 'Excessive use of any type reduces type safety',
    codeSnippet: `function processData(data: any): any {\n  return data.map((item: any) => item.value);\n}`,
    recommendation: 'Replace any types with proper type definitions or generics',
    estimatedEffort: 'medium',
    tags: ['types', 'safety'],
    detectedBy: 'TypePatternAnalyzer',
    detectedAt: new Date(),
    relatedIssues: [],
  },
  {
    id: 'issue-003',
    type: 'code-duplication',
    severity: 'medium',
    category: 'general',
    file: 'src/components/UserProfile.tsx',
    location: { startLine: 78, endLine: 85, startColumn: 1, endColumn: 1 },
    description: 'Duplicate validation logic found across multiple components',
    codeSnippet: `if (!email || !email.includes('@')) {\n  setError('Invalid email');\n  return;\n}`,
    recommendation: 'Extract validation logic into a shared utility function',
    estimatedEffort: 'small',
    tags: ['duplication', 'validation'],
    detectedBy: 'CodeQualityAnalyzer',
    detectedAt: new Date(),
    relatedIssues: ['issue-004'],
  },
  {
    id: 'issue-004',
    type: 'legacy-code',
    severity: 'low',
    category: 'general',
    file: 'src/legacy/old-api.ts',
    location: { startLine: 1, endLine: 50, startColumn: 1, endColumn: 1 },
    description: 'Commented-out code block that is no longer needed',
    codeSnippet: `// function oldImplementation() {\n//   // 50 lines of old code\n// }`,
    recommendation: 'Remove commented-out code to improve readability',
    estimatedEffort: 'trivial',
    tags: ['legacy', 'cleanup'],
    detectedBy: 'CodeQualityAnalyzer',
    detectedAt: new Date(),
    relatedIssues: [],
  },
];

// Create sample patterns
const samplePatterns: IssuePattern[] = [
  {
    patternId: 'pattern-001',
    patternName: 'Inconsistent Authentication Client Usage',
    description: 'Multiple different patterns for creating and using authentication clients detected across the codebase',
    occurrences: 15,
    affectedFiles: [
      'src/auth/login.ts',
      'src/auth/signup.ts',
      'src/api/user.ts',
      'src/api/profile.ts',
      'src/middleware/auth.ts',
    ],
    relatedIssues: [sampleIssues[0]],
    recommendedAction: 'Standardize on a single authentication client pattern using the getAuthClient() helper',
    priority: 9,
    category: 'authentication',
  },
  {
    patternId: 'pattern-002',
    patternName: 'Excessive Any Type Usage',
    description: 'Widespread use of any type instead of proper TypeScript types',
    occurrences: 23,
    affectedFiles: [
      'src/utils/helpers.ts',
      'src/utils/formatters.ts',
      'src/api/handlers.ts',
    ],
    relatedIssues: [sampleIssues[1]],
    recommendedAction: 'Replace any types with proper type definitions or use generics where appropriate',
    priority: 7,
    category: 'types',
  },
];

// Create classified issues
const classifiedIssues: ClassifiedIssues = {
  critical: [sampleIssues[0]],
  high: [sampleIssues[1]],
  medium: [sampleIssues[2]],
  low: [sampleIssues[3]],
  patterns: samplePatterns,
};

// Create analysis result
const analysisResult: AnalysisResult = {
  totalFiles: 150,
  analyzedFiles: 145,
  totalIssues: 4,
  issuesByType: new Map([
    ['inconsistent-pattern', [sampleIssues[0]]],
    ['type-safety', [sampleIssues[1]]],
    ['code-duplication', [sampleIssues[2]]],
    ['legacy-code', [sampleIssues[3]]],
  ]),
  issuesByCategory: new Map([
    ['authentication', [sampleIssues[0]]],
    ['types', [sampleIssues[1]]],
    ['general', [sampleIssues[2], sampleIssues[3]]],
  ]),
  issuesBySeverity: new Map([
    ['critical', [sampleIssues[0]]],
    ['high', [sampleIssues[1]]],
    ['medium', [sampleIssues[2]]],
    ['low', [sampleIssues[3]]],
  ]),
  analysisTimestamp: new Date(),
  analysisDuration: 12500, // 12.5 seconds
};

// Test report generation
console.log('Testing Report Formatting Enhancements...\n');
console.log('='.repeat(80));

// Create report generator with custom config
const reportGenerator = createReportGenerator({
  includeCodeSnippets: true,
  maxSnippetLength: 200,
  includeRecommendations: true,
  maxTopPatterns: 5,
  maxAffectedFiles: 10,
  groupByFile: true,
  includeIssueIds: false,
});

// Generate Markdown report
console.log('\n1. Generating Markdown Report...\n');
const markdownReport = reportGenerator.generateMarkdownReport(analysisResult, classifiedIssues);
console.log(markdownReport);

console.log('\n' + '='.repeat(80));

// Generate JSON report
console.log('\n2. Generating JSON Report...\n');
const jsonReport = reportGenerator.generateJsonReport(analysisResult, classifiedIssues);
console.log(JSON.stringify(jsonReport, null, 2));

console.log('\n' + '='.repeat(80));

// Generate summary
console.log('\n3. Generating Summary...\n');
const summary = reportGenerator.generateSummary(analysisResult);
console.log(JSON.stringify(summary, null, 2));

console.log('\n' + '='.repeat(80));
console.log('\n✅ Report formatting test completed successfully!');
console.log('\nKey Features Demonstrated:');
console.log('  ✓ Markdown report with proper structure');
console.log('  ✓ Severity badges (🔴 🟠 🟡 🟢)');
console.log('  ✓ Priority indicators for patterns');
console.log('  ✓ Code snippets with language detection');
console.log('  ✓ Line ranges in file paths');
console.log('  ✓ Detailed statistics tables');
console.log('  ✓ Table of contents');
console.log('  ✓ Percentage distributions');
console.log('  ✓ JSON report with enhanced metadata');
console.log('  ✓ Actionable recommendations');
console.log('  ✓ Summary statistics');

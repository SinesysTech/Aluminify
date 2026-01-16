/**
 * Manual test for CodeQualityAnalyzer
 * Run with: npx tsx test-code-quality-analyzer.ts
 */

import { CodeQualityAnalyzer } from './src/analyzers/code-quality-analyzer';
import { ASTParser } from './src/utils/ast-parser';
import type { FileInfo } from './src/types';

// Test code samples
const testCases = [
  {
    name: 'Deeply nested conditionals',
    code: `
function checkPermissions(user: any) {
  if (user) {
    if (user.role) {
      if (user.role === 'admin') {
        if (user.permissions) {
          if (user.permissions.includes('delete')) {
            return true;
          }
        }
      }
    }
  }
  return false;
}
    `,
  },
  {
    name: 'Complex boolean expression',
    code: `
function validateUser(user: any) {
  if (user && user.active && user.verified && user.role === 'admin' && user.permissions.length > 0 && !user.suspended) {
    return true;
  }
  return false;
}
    `,
  },
  {
    name: 'Multiple returns in complex function',
    code: `
function processData(data: any) {
  if (!data) return null;
  if (data.type === 'A') return processTypeA(data);
  if (data.type === 'B') return processTypeB(data);
  if (data.type === 'C') return processTypeC(data);
  if (data.type === 'D') return processTypeD(data);
  if (data.type === 'E') return processTypeE(data);
  
  for (let i = 0; i < data.items.length; i++) {
    if (data.items[i].valid) {
      return data.items[i];
    }
  }
  
  return null;
}

function processTypeA(data: any) { return data; }
function processTypeB(data: any) { return data; }
function processTypeC(data: any) { return data; }
function processTypeD(data: any) { return data; }
function processTypeE(data: any) { return data; }
    `,
  },
  {
    name: 'Deeply nested loops',
    code: `
function processMatrix(matrix: number[][][]) {
  for (let i = 0; i < matrix.length; i++) {
    for (let j = 0; j < matrix[i].length; j++) {
      for (let k = 0; k < matrix[i][j].length; k++) {
        console.log(matrix[i][j][k]);
      }
    }
  }
}
    `,
  },
  {
    name: 'Switch with fall-through',
    code: `
function handleAction(action: string) {
  switch (action) {
    case 'start':
      console.log('Starting...');
      // Missing break - falls through!
    case 'continue':
      console.log('Continuing...');
      break;
    case 'stop':
      console.log('Stopping...');
      break;
  }
}
    `,
  },
  {
    name: 'Clean code (should have no issues)',
    code: `
function calculateTotal(items: any[]) {
  if (!items || items.length === 0) {
    return 0;
  }
  
  return items.reduce((sum, item) => sum + item.price, 0);
}
    `,
  },
];

async function runTests() {
  const analyzer = new CodeQualityAnalyzer();
  const parser = new ASTParser();

  console.log('🧪 Testing CodeQualityAnalyzer\n');
  console.log('='.repeat(80));

  for (const testCase of testCases) {
    console.log(`\n📝 Test: ${testCase.name}`);
    console.log('-'.repeat(80));

    try {
      // Parse the code
      const ast = parser.parseContent(testCase.code, `test-${testCase.name}.ts`);

      // Create file info
      const fileInfo: FileInfo = {
        path: `/test/${testCase.name}.ts`,
        relativePath: `test/${testCase.name}.ts`,
        extension: '.ts',
        size: testCase.code.length,
        category: 'other',
        lastModified: new Date(),
      };

      // Analyze
      const issues = await analyzer.analyze(fileInfo, ast);

      if (issues.length === 0) {
        console.log('✅ No issues detected');
      } else {
        console.log(`⚠️  Found ${issues.length} issue(s):`);
        issues.forEach((issue, index) => {
          console.log(`\n  ${index + 1}. ${issue.description}`);
          console.log(`     Type: ${issue.type}`);
          console.log(`     Severity: ${issue.severity}`);
          console.log(`     Location: Line ${issue.location.startLine}-${issue.location.endLine}`);
          console.log(`     Tags: ${issue.tags.join(', ')}`);
        });
      }

      // Clean up
      parser.removeFile(ast);
    } catch (error) {
      console.log(`❌ Error: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  console.log('\n' + '='.repeat(80));
  console.log('✨ Testing complete!\n');
}

// Run the tests
runTests().catch(console.error);

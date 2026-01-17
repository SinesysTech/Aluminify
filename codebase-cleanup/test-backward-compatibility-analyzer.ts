/**
 * Manual test for BackwardCompatibilityAnalyzer
 * Tests detection of backward compatibility patterns
 */

import { Project } from 'ts-morph';
import { BackwardCompatibilityAnalyzer } from './src/analyzers/backward-compatibility-analyzer';
import type { FileInfo } from './src/types';

async function testBackwardCompatibilityAnalyzer() {
  console.log('Testing BackwardCompatibilityAnalyzer...\n');

  const analyzer = new BackwardCompatibilityAnalyzer();
  const project = new Project();

  // Test 1: Version checks
  console.log('Test 1: Version checks');
  const versionCheckCode = `
    // Check Node.js version
    if (process.version < 'v14.0.0') {
      console.log('Old Node version');
    }

    // Semver check
    if (compareVersion(currentVersion, '2.0.0') < 0) {
      useLegacyAPI();
    }
  `;

  const versionFile = project.createSourceFile('version-check.ts', versionCheckCode);
  const versionFileInfo: FileInfo = {
    path: '/test/version-check.ts',
    relativePath: 'version-check.ts',
    extension: '.ts',
    size: versionCheckCode.length,
    category: 'util',
    lastModified: new Date(),
  };

  const versionIssues = await analyzer.analyze(versionFileInfo, versionFile);
  console.log(`Found ${versionIssues.length} issues:`);
  versionIssues.forEach(issue => {
    console.log(`  - ${issue.type}: ${issue.description}`);
  });
  console.log();

  // Test 2: Feature flags
  console.log('Test 2: Feature flags');
  const featureFlagCode = `
    // Feature flag check
    if (featureFlags.useNewImplementation) {
      return newImplementation();
    } else {
      return legacyImplementation();
    }

    // Experimental feature
    if (enableExperimentalFeature) {
      doExperimentalThing();
    }
  `;

  const flagFile = project.createSourceFile('feature-flags.ts', featureFlagCode);
  const flagFileInfo: FileInfo = {
    path: '/test/feature-flags.ts',
    relativePath: 'feature-flags.ts',
    extension: '.ts',
    size: featureFlagCode.length,
    category: 'util',
    lastModified: new Date(),
  };

  const flagIssues = await analyzer.analyze(flagFileInfo, flagFile);
  console.log(`Found ${flagIssues.length} issues:`);
  flagIssues.forEach(issue => {
    console.log(`  - ${issue.type}: ${issue.description}`);
  });
  console.log();

  // Test 3: Polyfills
  console.log('Test 3: Polyfills');
  const polyfillCode = `
    import 'core-js/stable';
    import 'regenerator-runtime/runtime';
    import 'whatwg-fetch';

    // Manual polyfill
    if (!Array.prototype.includes) {
      Array.prototype.includes = function(searchElement) {
        return this.indexOf(searchElement) !== -1;
      };
    }

    // Promise polyfill
    window.Promise = window.Promise || PromisePolyfill;
  `;

  const polyfillFile = project.createSourceFile('polyfills.ts', polyfillCode);
  const polyfillFileInfo: FileInfo = {
    path: '/test/polyfills.ts',
    relativePath: 'polyfills.ts',
    extension: '.ts',
    size: polyfillCode.length,
    category: 'util',
    lastModified: new Date(),
  };

  const polyfillIssues = await analyzer.analyze(polyfillFileInfo, polyfillFile);
  console.log(`Found ${polyfillIssues.length} issues:`);
  polyfillIssues.forEach(issue => {
    console.log(`  - ${issue.type}: ${issue.description}`);
  });
  console.log();

  // Test 4: Migration code
  console.log('Test 4: Migration code');
  const migrationCode = `
    // TODO: Remove this migration code after all users have upgraded
    function migrateOldData(data: any) {
      // Migration logic
      return transformedData;
    }

    // Temporary compatibility layer
    export const legacyAPI = {
      // This is deprecated, remove after Q2 2024
      oldMethod() {
        return newMethod();
      }
    };

    // Migration helper
    const MIGRATION_COMPLETE = false;
  `;

  const migrationFile = project.createSourceFile('migration.ts', migrationCode);
  const migrationFileInfo: FileInfo = {
    path: '/test/migration.ts',
    relativePath: 'migration.ts',
    extension: '.ts',
    size: migrationCode.length,
    category: 'util',
    lastModified: new Date(),
  };

  const migrationIssues = await analyzer.analyze(migrationFileInfo, migrationFile);
  console.log(`Found ${migrationIssues.length} issues:`);
  migrationIssues.forEach(issue => {
    console.log(`  - ${issue.type}: ${issue.description}`);
  });
  console.log();

  // Test 5: Dual implementations
  console.log('Test 5: Dual implementations');
  const dualImplCode = `
    // Old implementation
    export function processDataOld(data: any) {
      // Legacy processing
      return data;
    }

    // New implementation
    export function processDataNew(data: any) {
      // Modern processing
      return data;
    }

    // Version 1
    export function calculateV1(x: number) {
      return x * 2;
    }

    // Version 2
    export function calculateV2(x: number) {
      return x * 3;
    }

    // Conditional switching
    if (useNewImplementation) {
      result = newPath();
    } else {
      result = legacyPath();
    }
  `;

  const dualImplFile = project.createSourceFile('dual-impl.ts', dualImplCode);
  const dualImplFileInfo: FileInfo = {
    path: '/test/dual-impl.ts',
    relativePath: 'dual-impl.ts',
    extension: '.ts',
    size: dualImplCode.length,
    category: 'util',
    lastModified: new Date(),
  };

  const dualImplIssues = await analyzer.analyze(dualImplFileInfo, dualImplFile);
  console.log(`Found ${dualImplIssues.length} issues:`);
  dualImplIssues.forEach(issue => {
    console.log(`  - ${issue.type}: ${issue.description}`);
  });
  console.log();

  // Summary
  const totalIssues = versionIssues.length + flagIssues.length + polyfillIssues.length + 
                      migrationIssues.length + dualImplIssues.length;
  console.log('='.repeat(60));
  console.log(`Total issues found: ${totalIssues}`);
  console.log('='.repeat(60));

  // Verify we found issues in each category
  const hasVersionIssues = versionIssues.length > 0;
  const hasFlagIssues = flagIssues.length > 0;
  const hasPolyfillIssues = polyfillIssues.length > 0;
  const hasMigrationIssues = migrationIssues.length > 0;
  const hasDualImplIssues = dualImplIssues.length > 0;

  console.log('\nDetection Results:');
  console.log(`✓ Version checks: ${hasVersionIssues ? 'DETECTED' : 'NOT DETECTED'}`);
  console.log(`✓ Feature flags: ${hasFlagIssues ? 'DETECTED' : 'NOT DETECTED'}`);
  console.log(`✓ Polyfills: ${hasPolyfillIssues ? 'DETECTED' : 'NOT DETECTED'}`);
  console.log(`✓ Migration code: ${hasMigrationIssues ? 'DETECTED' : 'NOT DETECTED'}`);
  console.log(`✓ Dual implementations: ${hasDualImplIssues ? 'DETECTED' : 'NOT DETECTED'}`);

  const allDetected = hasVersionIssues && hasFlagIssues && hasPolyfillIssues && 
                      hasMigrationIssues && hasDualImplIssues;

  if (allDetected) {
    console.log('\n✅ All backward compatibility patterns detected successfully!');
  } else {
    console.log('\n⚠️  Some patterns were not detected. Review the analyzer implementation.');
  }
}

testBackwardCompatibilityAnalyzer().catch(console.error);

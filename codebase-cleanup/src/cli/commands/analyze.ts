/**
 * Analyze Command
 * 
 * Scans the codebase and performs analysis to identify technical debt patterns.
 */

import { Command } from 'commander';
import { resolve } from 'path';
import { FileScannerImpl } from '../../scanner/index.js';
import { createAnalysisEngine } from '../../engine/index.js';
import { createIssueClassifier } from '../../classifier/index.js';
import { createReportGenerator } from '../../reporter/index.js';
import { getAllAnalyzers } from '../../analyzers/index.js';
import { writeFile } from 'fs/promises';
import { ProgressTracker } from '../utils/progress.js';
import { handleError } from '../utils/error-handler.js';
import type { Issue } from '../../types.js';

interface AnalyzeOptions {
  path: string;
  output?: string;
  format?: 'markdown' | 'json' | 'both';
  include?: string;
  exclude?: string;
}

export const analyzeCommand = new Command('analyze')
  .description('Analyze codebase for technical debt patterns')
  .option('-p, --path <path>', 'Path to codebase to analyze', process.cwd())
  .option('-o, --output <path>', 'Output file path (default: ./cleanup-report)')
  .option('-f, --format <format>', 'Output format: markdown, json, or both', 'markdown')
  .option('-i, --include <patterns>', 'Comma-separated glob patterns to include (e.g., "**/*.ts,**/*.tsx")')
  .option('-e, --exclude <patterns>', 'Comma-separated glob patterns to exclude (e.g., "**/node_modules/**,**/.next/**")')
  .action(async (options: AnalyzeOptions) => {
    try {
      console.log('🔍 Starting codebase analysis...\n');

      // Resolve paths
      const targetPath = resolve(options.path);
      const outputPath = options.output ? resolve(options.output) : resolve('./cleanup-report');

      // Parse include/exclude patterns
      const includePatterns = options.include 
        ? options.include.split(',').map(p => p.trim())
        : ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'];
      
      const excludePatterns = options.exclude
        ? options.exclude.split(',').map(p => p.trim())
        : ['**/node_modules/**', '**/.next/**', '**/dist/**', '**/build/**', '**/.git/**'];

      // Initialize progress tracker
      const progress = new ProgressTracker();

      // Step 1: Scan files
      progress.start('Scanning files...');
      const scanner = new FileScannerImpl();
      const files = await scanner.scanDirectory(targetPath, {
        includePatterns,
        excludePatterns,
      });
      progress.complete(`Found ${files.length} files to analyze`);

      if (files.length === 0) {
        console.log('\n⚠️  No files found matching the specified patterns.');
        console.log('Try adjusting your --include and --exclude patterns.\n');
        return;
      }

      // Step 2: Analyze files
      progress.start('Analyzing code patterns...');
      const analyzers = getAllAnalyzers();
      
      // Set up progress callback
      let lastProgress = 0;
      const engine = createAnalysisEngine({
        onProgress: (progressInfo) => {
          const percent = Math.floor((progressInfo.currentFile / progressInfo.totalFiles) * 100);
          if (percent > lastProgress) {
            progress.update(`Analyzing files... ${progressInfo.currentFile}/${progressInfo.totalFiles} (${percent}%)`);
            lastProgress = percent;
          }
        },
        continueOnError: true,
        logWarnings: false,
      });

      const analysisResult = await engine.analyze(files, analyzers);
      progress.complete(`Analysis complete: ${analysisResult.totalIssues} issues found`);

      // Get all issues from the grouped results
      const allIssues: Issue[] = [];
      analysisResult.issuesBySeverity.forEach(issues => allIssues.push(...issues));

      // Step 3: Classify issues
      progress.start('Classifying issues...');
      const classifier = createIssueClassifier();
      const classified = classifier.classify(allIssues);
      progress.complete(`Issues classified by severity`);

      // Step 4: Generate report
      progress.start('Generating report...');
      const reporter = createReportGenerator();
      
      const format = options.format || 'markdown';
      
      if (format === 'markdown' || format === 'both') {
        const markdownReport = reporter.generateMarkdownReport(analysisResult, classified);
        const mdPath = `${outputPath}.md`;
        await writeFile(mdPath, markdownReport, 'utf-8');
        progress.complete(`Markdown report saved to: ${mdPath}`);
      }
      
      if (format === 'json' || format === 'both') {
        const jsonReport = reporter.generateJsonReport(analysisResult, classified);
        const jsonPath = `${outputPath}.json`;
        await writeFile(jsonPath, JSON.stringify(jsonReport, null, 2), 'utf-8');
        progress.complete(`JSON report saved to: ${jsonPath}`);
      }

      // Display summary
      console.log('\n📊 Analysis Summary:');
      console.log('─'.repeat(50));
      console.log(`Total Files Analyzed: ${analysisResult.analyzedFiles}`);
      console.log(`Total Issues Found: ${analysisResult.totalIssues}`);
      console.log(`  Critical: ${classified.critical.length}`);
      console.log(`  High: ${classified.high.length}`);
      console.log(`  Medium: ${classified.medium.length}`);
      console.log(`  Low: ${classified.low.length}`);
      console.log(`Analysis Duration: ${(analysisResult.analysisDuration / 1000).toFixed(2)}s`);
      console.log('─'.repeat(50));

      if (classified.patterns.length > 0) {
        console.log('\n🔍 Top Patterns Detected:');
        classified.patterns.slice(0, 5).forEach((pattern, index) => {
          console.log(`  ${index + 1}. ${pattern.patternName} (${pattern.occurrences} occurrences)`);
        });
      }

      console.log('\n✅ Analysis complete!\n');

    } catch (error) {
      handleError(error, 'analyze');
    }
  });

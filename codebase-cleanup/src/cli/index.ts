#!/usr/bin/env node

/**
 * CLI Entry Point for Codebase Cleanup Analyzer
 * 
 * Provides commands for analyzing codebases, generating reports, and creating cleanup plans.
 */

import { Command } from 'commander';
import { analyzeCommand } from './commands/analyze.js';
import { reportCommand } from './commands/report.js';
import { planCommand } from './commands/plan.js';

const program = new Command();

program
  .name('codebase-cleanup')
  .description('Systematic codebase cleanup and refactoring analysis tool')
  .version('1.0.0');

// Register commands
program.addCommand(analyzeCommand);
program.addCommand(reportCommand);
program.addCommand(planCommand);

// Parse command line arguments
program.parse(process.argv);

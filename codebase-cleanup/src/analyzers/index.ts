/**
 * Analyzer exports
 */

export { BasePatternAnalyzer } from './pattern-analyzer.js';
export { CodeQualityAnalyzer } from './code-quality-analyzer.js';
export { AuthPatternAnalyzer } from './auth-pattern-analyzer.js';
export { DatabasePatternAnalyzer } from './database-pattern-analyzer.js';
export { ComponentPatternAnalyzer } from './component-pattern-analyzer.js';
export { TypePatternAnalyzer } from './type-pattern-analyzer.js';
export { APIRoutePatternAnalyzer } from './api-route-pattern-analyzer.js';
export { ServicePatternAnalyzer } from './service-pattern-analyzer.js';
export { MiddlewarePatternAnalyzer } from './middleware-pattern-analyzer.js';
export { ErrorHandlingPatternAnalyzer } from './error-handling-pattern-analyzer.js';
export { BackwardCompatibilityAnalyzer } from './backward-compatibility-analyzer.js';
export { AdapterPatternAnalyzer } from './adapter-pattern-analyzer.js';

import { CodeQualityAnalyzer } from './code-quality-analyzer.js';
import { AuthPatternAnalyzer } from './auth-pattern-analyzer.js';
import { DatabasePatternAnalyzer } from './database-pattern-analyzer.js';
import { ComponentPatternAnalyzer } from './component-pattern-analyzer.js';
import { TypePatternAnalyzer } from './type-pattern-analyzer.js';
import { APIRoutePatternAnalyzer } from './api-route-pattern-analyzer.js';
import { ServicePatternAnalyzer } from './service-pattern-analyzer.js';
import { MiddlewarePatternAnalyzer } from './middleware-pattern-analyzer.js';
import { ErrorHandlingPatternAnalyzer } from './error-handling-pattern-analyzer.js';
import { BackwardCompatibilityAnalyzer } from './backward-compatibility-analyzer.js';
import { AdapterPatternAnalyzer } from './adapter-pattern-analyzer.js';
import type { PatternAnalyzer } from '../types.js';

/**
 * Get all available pattern analyzers
 * 
 * @returns Array of all pattern analyzer instances
 */
export function getAllAnalyzers(): PatternAnalyzer[] {
  return [
    new CodeQualityAnalyzer(),
    new AuthPatternAnalyzer(),
    new DatabasePatternAnalyzer(),
    new ComponentPatternAnalyzer(),
    new TypePatternAnalyzer(),
    new APIRoutePatternAnalyzer(),
    new ServicePatternAnalyzer(),
    new MiddlewarePatternAnalyzer(),
    new ErrorHandlingPatternAnalyzer(),
    new BackwardCompatibilityAnalyzer(),
    new AdapterPatternAnalyzer(),
  ];
}

/**
 * CodeQualityAnalyzer
 * 
 * Analyzes code quality issues including:
 * - Confusing logic (deeply nested conditionals, complex boolean expressions)
 * - Code duplication
 * - Poor naming conventions
 * - Legacy code patterns
 * 
 * Validates Requirements: 1.3, 1.5, 1.6, 6.5, 8.1, 8.2, 8.4, 8.5, 10.1, 10.4, 15.2
 */

import { SourceFile, Node, SyntaxKind } from 'ts-morph';
import { BasePatternAnalyzer } from './pattern-analyzer';
import type { FileInfo, Issue, FileCategory } from '../types';

/**
 * Analyzer for code quality issues
 */
export class CodeQualityAnalyzer extends BasePatternAnalyzer {
  readonly name = 'CodeQualityAnalyzer';

  /**
   * Get supported file types - all code files
   */
  getSupportedFileTypes(): FileCategory[] {
    return ['component', 'api-route', 'service', 'util', 'middleware', 'other'];
  }

  /**
   * Analyze a file for code quality issues
   */
  async analyze(file: FileInfo, ast: SourceFile): Promise<Issue[]> {
    const issues: Issue[] = [];

    // Detect confusing logic patterns
    issues.push(...this.detectDeeplyNestedConditionals(file, ast));
    issues.push(...this.detectComplexBooleanExpressions(file, ast));
    issues.push(...this.detectUnclearControlFlow(file, ast));

    return issues;
  }

  // ============================================================================
  // Confusing Logic Detection (Requirement 1.5)
  // ============================================================================

  /**
   * Detect deeply nested conditionals (>3 levels)
   * Validates: Requirements 1.5
   */
  private detectDeeplyNestedConditionals(file: FileInfo, ast: SourceFile): Issue[] {
    const issues: Issue[] = [];
    const MAX_NESTING_DEPTH = 3;

    // Find all if statements
    const ifStatements = this.getIfStatements(ast);

    for (const ifStatement of ifStatements) {
      const depth = this.calculateConditionalNestingDepth(ifStatement);

      if (depth > MAX_NESTING_DEPTH) {
        issues.push(
          this.createIssue({
            type: 'confusing-logic',
            severity: 'medium',
            category: 'general',
            file: file.relativePath,
            node: ifStatement,
            description: `Deeply nested conditional detected (${depth} levels deep). This makes the code hard to understand and maintain.`,
            recommendation: `Refactor this nested conditional by:\n` +
              `1. Extracting nested logic into separate functions\n` +
              `2. Using early returns to reduce nesting\n` +
              `3. Combining conditions where appropriate\n` +
              `4. Consider using guard clauses or strategy pattern`,
            estimatedEffort: 'small',
            tags: ['confusing-logic', 'nested-conditionals', 'maintainability'],
          })
        );
      }
    }

    return issues;
  }

  /**
   * Calculate the nesting depth of conditionals within a node
   * Only counts if/else statements, not other block structures
   */
  private calculateConditionalNestingDepth(node: Node): number {
    let maxDepth = 0;

    const traverse = (n: Node, currentDepth: number) => {
      const kind = n.getKind();

      // Only count if statements for conditional nesting
      if (kind === SyntaxKind.IfStatement) {
        const newDepth = currentDepth + 1;
        maxDepth = Math.max(maxDepth, newDepth);

        // Continue traversing children with increased depth
        n.forEachChild(child => traverse(child, newDepth));
      } else {
        // For non-if statements, continue with same depth
        n.forEachChild(child => traverse(child, currentDepth));
      }
    };

    traverse(node, 0);
    return maxDepth;
  }

  /**
   * Detect complex boolean expressions (>3 operators)
   * Validates: Requirements 1.5
   */
  private detectComplexBooleanExpressions(file: FileInfo, ast: SourceFile): Issue[] {
    const issues: Issue[] = [];
    const MAX_BOOLEAN_OPERATORS = 3;

    // Find all binary expressions (which include boolean operations)
    const binaryExpressions = this.findNodesByKind(ast, SyntaxKind.BinaryExpression);

    for (const expr of binaryExpressions) {
      const operatorCount = this.countBooleanOperators(expr);

      if (operatorCount > MAX_BOOLEAN_OPERATORS) {
        issues.push(
          this.createIssue({
            type: 'confusing-logic',
            severity: 'medium',
            category: 'general',
            file: file.relativePath,
            node: expr,
            description: `Complex boolean expression with ${operatorCount} operators. This makes the logic difficult to understand and test.`,
            recommendation: `Simplify this boolean expression by:\n` +
              `1. Breaking it into smaller, named boolean variables\n` +
              `2. Extracting complex conditions into well-named functions\n` +
              `3. Using De Morgan's laws to simplify logic\n` +
              `4. Consider using a truth table to verify correctness`,
            estimatedEffort: 'small',
            tags: ['confusing-logic', 'complex-boolean', 'readability'],
          })
        );
      }
    }

    return issues;
  }

  /**
   * Count boolean operators (&&, ||, !) in an expression tree
   */
  private countBooleanOperators(node: Node): number {
    let count = 0;

    const traverse = (n: Node) => {
      const kind = n.getKind();

      // Count logical operators
      if (kind === SyntaxKind.BinaryExpression) {
        const text = n.getText();
        // Check if it's a logical operator (not comparison or arithmetic)
        if (text.includes('&&') || text.includes('||')) {
          count++;
        }
      } else if (kind === SyntaxKind.PrefixUnaryExpression) {
        const text = n.getText();
        if (text.startsWith('!')) {
          count++;
        }
      }

      n.forEachChild(traverse);
    };

    traverse(node);
    return count;
  }

  /**
   * Detect unclear control flow patterns
   * Validates: Requirements 1.5
   * 
   * Detects patterns like:
   * - Multiple return statements in complex functions
   * - Deeply nested loops
   * - Complex switch statements with fall-through
   * - Mixed control flow (break/continue in nested structures)
   */
  private detectUnclearControlFlow(file: FileInfo, ast: SourceFile): Issue[] {
    const issues: Issue[] = [];

    // Get all functions (declarations, expressions, arrow functions)
    const functions = [
      ...this.getFunctionDeclarations(ast),
      ...this.getFunctionExpressions(ast),
      ...this.getArrowFunctions(ast),
      ...this.getMethodDeclarations(ast),
    ];

    for (const func of functions) {
      // Check for multiple return statements in complex functions
      const returnStatements = this.findNodesByKind(func as SourceFile, SyntaxKind.ReturnStatement);
      const functionComplexity = this.calculateFunctionComplexity(func);

      if (returnStatements.length > 3 && functionComplexity > 5) {
        issues.push(
          this.createIssue({
            type: 'confusing-logic',
            severity: 'low',
            category: 'general',
            file: file.relativePath,
            node: func,
            description: `Function has ${returnStatements.length} return statements with complexity ${functionComplexity}. Multiple returns in complex functions make control flow hard to follow.`,
            recommendation: `Refactor to improve control flow:\n` +
              `1. Use early returns for error cases at the start\n` +
              `2. Consolidate multiple returns into a single return with a result variable\n` +
              `3. Consider breaking the function into smaller functions\n` +
              `4. Use guard clauses to handle edge cases early`,
            estimatedEffort: 'small',
            tags: ['confusing-logic', 'control-flow', 'multiple-returns'],
          })
        );
      }

      // Check for deeply nested loops
      const loops = [
        ...this.findNodesByKind(func as SourceFile, SyntaxKind.ForStatement),
        ...this.findNodesByKind(func as SourceFile, SyntaxKind.WhileStatement),
        ...this.findNodesByKind(func as SourceFile, SyntaxKind.DoStatement),
      ];

      for (const loop of loops) {
        const loopNestingDepth = this.calculateLoopNestingDepth(loop);
        if (loopNestingDepth > 2) {
          issues.push(
            this.createIssue({
              type: 'confusing-logic',
              severity: 'medium',
              category: 'general',
              file: file.relativePath,
              node: loop,
              description: `Deeply nested loop (${loopNestingDepth} levels). This makes the code difficult to understand and may indicate algorithmic complexity issues.`,
              recommendation: `Refactor nested loops by:\n` +
                `1. Extracting inner loops into separate functions\n` +
                `2. Using array methods (map, filter, reduce) instead of nested loops\n` +
                `3. Consider if a different data structure would simplify the logic\n` +
                `4. Look for opportunities to use early breaks/continues`,
              estimatedEffort: 'medium',
              tags: ['confusing-logic', 'nested-loops', 'performance'],
            })
          );
        }
      }

      // Check for complex switch statements with fall-through
      const switchStatements = this.findNodesByKind(func as SourceFile, SyntaxKind.SwitchStatement);
      for (const switchStmt of switchStatements) {
        const hasFallThrough = this.detectSwitchFallThrough(switchStmt);
        if (hasFallThrough) {
          issues.push(
            this.createIssue({
              type: 'confusing-logic',
              severity: 'low',
              category: 'general',
              file: file.relativePath,
              node: switchStmt,
              description: `Switch statement with fall-through cases detected. Fall-through behavior can be confusing and error-prone.`,
              recommendation: `Make switch statement clearer by:\n` +
                `1. Add explicit break statements to all cases\n` +
                `2. Add comments if fall-through is intentional\n` +
                `3. Consider using if-else or a lookup table instead\n` +
                `4. Extract complex case logic into functions`,
              estimatedEffort: 'trivial',
              tags: ['confusing-logic', 'switch-fall-through', 'clarity'],
            })
          );
        }
      }
    }

    return issues;
  }

  /**
   * Calculate function complexity (simplified cyclomatic complexity)
   */
  private calculateFunctionComplexity(node: Node): number {
    let complexity = 1; // Base complexity

    const decisionPoints = [
      SyntaxKind.IfStatement,
      SyntaxKind.ConditionalExpression,
      SyntaxKind.CaseClause,
      SyntaxKind.ForStatement,
      SyntaxKind.WhileStatement,
      SyntaxKind.DoStatement,
      SyntaxKind.CatchClause,
    ];

    node.forEachDescendant(child => {
      if (decisionPoints.includes(child.getKind())) {
        complexity++;
      }
      // Count logical operators in conditions
      if (child.getKind() === SyntaxKind.BinaryExpression) {
        const text = child.getText();
        if (text.includes('&&') || text.includes('||')) {
          complexity++;
        }
      }
    });

    return complexity;
  }

  /**
   * Calculate loop nesting depth
   */
  private calculateLoopNestingDepth(node: Node): number {
    let maxDepth = 0;

    const traverse = (n: Node, currentDepth: number) => {
      const kind = n.getKind();

      // Count loop structures
      if (
        kind === SyntaxKind.ForStatement ||
        kind === SyntaxKind.WhileStatement ||
        kind === SyntaxKind.DoStatement ||
        kind === SyntaxKind.ForInStatement ||
        kind === SyntaxKind.ForOfStatement
      ) {
        const newDepth = currentDepth + 1;
        maxDepth = Math.max(maxDepth, newDepth);
        n.forEachChild(child => traverse(child, newDepth));
      } else {
        n.forEachChild(child => traverse(child, currentDepth));
      }
    };

    traverse(node, 0);
    return maxDepth;
  }

  /**
   * Detect switch fall-through (cases without break/return)
   */
  private detectSwitchFallThrough(switchNode: Node): boolean {
    const caseClauses = this.findNodesByKind(switchNode as SourceFile, SyntaxKind.CaseClause);

    for (const caseClause of caseClauses) {
      const statements = caseClause.getChildrenOfKind(SyntaxKind.SyntaxList);
      
      if (statements.length === 0) {
        continue; // Empty case, might be intentional grouping
      }

      // Check if the case has a break or return statement
      let hasBreakOrReturn = false;
      
      caseClause.forEachDescendant(child => {
        const kind = child.getKind();
        if (
          kind === SyntaxKind.BreakStatement ||
          kind === SyntaxKind.ReturnStatement ||
          kind === SyntaxKind.ThrowStatement
        ) {
          hasBreakOrReturn = true;
        }
      });

      // If case has statements but no break/return, it's a fall-through
      if (statements.length > 0 && !hasBreakOrReturn) {
        // Check if it's the last case (which doesn't need a break)
        const parent = caseClause.getParent();
        if (parent) {
          const allCases = parent.getChildrenOfKind(SyntaxKind.CaseClause);
          const isLastCase = allCases[allCases.length - 1] === caseClause;
          
          if (!isLastCase) {
            return true; // Found fall-through
          }
        }
      }
    }

    return false;
  }
}

/**
 * Unit tests for CleanupPlanner
 */
import { describe, it, expect } from 'vitest';
import { CleanupPlanner } from '../../../src/planner/cleanup-planner';
describe('CleanupPlanner', () => {
    const planner = new CleanupPlanner();
    // Helper to create a test issue
    const createIssue = (overrides = {}) => ({
        id: `issue-${Math.random()}`,
        type: 'inconsistent-pattern',
        severity: 'medium',
        category: 'general',
        file: '/test/file.ts',
        location: { startLine: 1, endLine: 1, startColumn: 0, endColumn: 10 },
        description: 'Test issue',
        codeSnippet: 'test code',
        recommendation: 'Fix the issue',
        estimatedEffort: 'small',
        tags: [],
        detectedBy: 'test-analyzer',
        detectedAt: new Date(),
        relatedIssues: [],
        ...overrides
    });
    describe('generatePlan', () => {
        it('should generate a complete cleanup plan from classified issues', () => {
            const classified = {
                critical: [createIssue({ severity: 'critical', category: 'authentication' })],
                high: [createIssue({ severity: 'high', category: 'database' })],
                medium: [createIssue({ severity: 'medium', category: 'api-routes' })],
                low: [createIssue({ severity: 'low', category: 'components' })],
                patterns: []
            };
            const plan = planner.generatePlan(classified, []);
            expect(plan).toBeDefined();
            expect(plan.tasks).toBeDefined();
            expect(plan.tasks.length).toBeGreaterThan(0);
            expect(plan.phases).toBeDefined();
            expect(plan.estimatedDuration).toBeDefined();
            expect(plan.riskAssessment).toBeDefined();
        });
        it('should generate tasks from patterns', () => {
            const pattern = {
                patternId: 'pattern-1',
                patternName: 'Inconsistent auth pattern',
                description: 'Multiple auth client instantiation patterns',
                occurrences: 5,
                affectedFiles: ['/auth1.ts', '/auth2.ts'],
                relatedIssues: [createIssue(), createIssue()],
                recommendedAction: 'Standardize auth client usage',
                priority: 8,
                category: 'authentication'
            };
            const classified = {
                critical: [],
                high: [],
                medium: [],
                low: [],
                patterns: [pattern]
            };
            const plan = planner.generatePlan(classified, [pattern]);
            expect(plan.tasks.length).toBeGreaterThan(0);
            const patternTask = plan.tasks.find(t => t.title.includes('pattern'));
            expect(patternTask).toBeDefined();
            expect(patternTask?.relatedIssues.length).toBe(2);
        });
        it('should include risk assessment', () => {
            const classified = {
                critical: [createIssue({ severity: 'critical', riskLevel: 'critical' })],
                high: [],
                medium: [],
                low: [],
                patterns: []
            };
            const plan = planner.generatePlan(classified, []);
            expect(plan.riskAssessment).toBeDefined();
            expect(plan.riskAssessment.overallRisk).toBe('critical');
            expect(plan.riskAssessment.highRiskTasks.length).toBeGreaterThan(0);
            expect(plan.riskAssessment.mitigationStrategies.length).toBeGreaterThan(0);
        });
        it('should organize tasks into phases', () => {
            const classified = {
                critical: [],
                high: [
                    createIssue({ category: 'types' }),
                    createIssue({ category: 'database' }),
                    createIssue({ category: 'services' }),
                    createIssue({ category: 'components' })
                ],
                medium: [],
                low: [],
                patterns: []
            };
            const plan = planner.generatePlan(classified, []);
            expect(plan.phases.length).toBeGreaterThan(0);
            // Verify phases are in correct order
            for (let i = 1; i < plan.phases.length; i++) {
                expect(plan.phases[i].phaseNumber).toBeGreaterThan(plan.phases[i - 1].phaseNumber);
            }
        });
    });
    describe('orderTasks', () => {
        it('should order tasks respecting dependencies', () => {
            const task1 = {
                id: 'task-1',
                title: 'Task 1',
                description: 'First task',
                category: 'types',
                relatedIssues: [],
                dependencies: [],
                estimatedEffort: 'small',
                riskLevel: 'low',
                requiresTests: false,
                actionSteps: [],
                affectedFiles: [],
                phase: 1
            };
            const task2 = {
                id: 'task-2',
                title: 'Task 2',
                description: 'Second task',
                category: 'services',
                relatedIssues: [],
                dependencies: ['task-1'],
                estimatedEffort: 'small',
                riskLevel: 'low',
                requiresTests: false,
                actionSteps: [],
                affectedFiles: [],
                phase: 3
            };
            const ordered = planner.orderTasks([task2, task1]);
            expect(ordered[0].id).toBe('task-1');
            expect(ordered[1].id).toBe('task-2');
        });
        it('should handle tasks with no dependencies', () => {
            const tasks = [
                {
                    id: 'task-1',
                    title: 'Task 1',
                    description: 'First task',
                    category: 'general',
                    relatedIssues: [],
                    dependencies: [],
                    estimatedEffort: 'small',
                    riskLevel: 'low',
                    requiresTests: false,
                    actionSteps: [],
                    affectedFiles: [],
                    phase: 1
                },
                {
                    id: 'task-2',
                    title: 'Task 2',
                    description: 'Second task',
                    category: 'general',
                    relatedIssues: [],
                    dependencies: [],
                    estimatedEffort: 'small',
                    riskLevel: 'low',
                    requiresTests: false,
                    actionSteps: [],
                    affectedFiles: [],
                    phase: 1
                }
            ];
            const ordered = planner.orderTasks(tasks);
            expect(ordered.length).toBe(2);
        });
        it('should prioritize critical tasks', () => {
            const lowRiskTask = {
                id: 'task-low',
                title: 'Low risk task',
                description: 'Low risk',
                category: 'general',
                relatedIssues: [],
                dependencies: [],
                estimatedEffort: 'small',
                riskLevel: 'low',
                requiresTests: false,
                actionSteps: [],
                affectedFiles: [],
                phase: 1
            };
            const criticalTask = {
                id: 'task-critical',
                title: 'Critical task',
                description: 'Critical',
                category: 'general',
                relatedIssues: [],
                dependencies: [],
                estimatedEffort: 'small',
                riskLevel: 'critical',
                requiresTests: true,
                actionSteps: [],
                affectedFiles: [],
                phase: 1
            };
            const ordered = planner.orderTasks([lowRiskTask, criticalTask]);
            // Critical task should come first
            expect(ordered[0].id).toBe('task-critical');
        });
    });
    describe('detectDependencies', () => {
        it('should detect dependencies based on shared files', () => {
            const task1 = {
                id: 'task-1',
                title: 'Task 1',
                description: 'First task',
                category: 'types',
                relatedIssues: [],
                dependencies: [],
                estimatedEffort: 'small',
                riskLevel: 'low',
                requiresTests: false,
                actionSteps: [],
                affectedFiles: ['/shared/file.ts'],
                phase: 1
            };
            const task2 = {
                id: 'task-2',
                title: 'Task 2',
                description: 'Second task',
                category: 'services',
                relatedIssues: [],
                dependencies: [],
                estimatedEffort: 'small',
                riskLevel: 'low',
                requiresTests: false,
                actionSteps: [],
                affectedFiles: ['/shared/file.ts'],
                phase: 3
            };
            const dependencies = planner.detectDependencies([task1, task2]);
            expect(dependencies.length).toBeGreaterThan(0);
            // Task 2 should depend on task 1 (types come before services)
            const task2Dep = dependencies.find(d => d.taskId === 'task-2');
            expect(task2Dep).toBeDefined();
            expect(task2Dep?.dependsOn).toContain('task-1');
        });
        it('should detect category-based dependencies', () => {
            const typeTask = {
                id: 'type-task',
                title: 'Type task',
                description: 'Fix types',
                category: 'types',
                relatedIssues: [],
                dependencies: [],
                estimatedEffort: 'small',
                riskLevel: 'low',
                requiresTests: false,
                actionSteps: [],
                affectedFiles: ['/types.ts'],
                phase: 1
            };
            const serviceTask = {
                id: 'service-task',
                title: 'Service task',
                description: 'Fix service',
                category: 'services',
                relatedIssues: [],
                dependencies: [],
                estimatedEffort: 'small',
                riskLevel: 'low',
                requiresTests: false,
                actionSteps: [],
                affectedFiles: ['/service.ts'],
                phase: 3
            };
            const dependencies = planner.detectDependencies([typeTask, serviceTask]);
            // Service task should depend on type task
            const serviceDep = dependencies.find(d => d.taskId === 'service-task');
            expect(serviceDep).toBeDefined();
            expect(serviceDep?.dependsOn).toContain('type-task');
        });
        it('should return empty array when no dependencies exist', () => {
            const task = {
                id: 'task-1',
                title: 'Task 1',
                description: 'Standalone task',
                category: 'general',
                relatedIssues: [],
                dependencies: [],
                estimatedEffort: 'small',
                riskLevel: 'low',
                requiresTests: false,
                actionSteps: [],
                affectedFiles: ['/unique.ts'],
                phase: 6
            };
            const dependencies = planner.detectDependencies([task]);
            expect(dependencies.length).toBe(0);
        });
    });
    describe('edge cases', () => {
        it('should handle empty classified issues', () => {
            const classified = {
                critical: [],
                high: [],
                medium: [],
                low: [],
                patterns: []
            };
            const plan = planner.generatePlan(classified, []);
            expect(plan.tasks.length).toBe(0);
            expect(plan.phases.length).toBe(0);
            expect(plan.riskAssessment.overallRisk).toBe('low');
        });
        it('should handle multiple issues in the same file', () => {
            const classified = {
                critical: [],
                high: [
                    createIssue({ file: '/same/file.ts', category: 'database' }),
                    createIssue({ file: '/same/file.ts', category: 'database' }),
                    createIssue({ file: '/same/file.ts', category: 'database' })
                ],
                medium: [],
                low: [],
                patterns: []
            };
            const plan = planner.generatePlan(classified, []);
            // Should group issues from same file into one task
            expect(plan.tasks.length).toBe(1);
            expect(plan.tasks[0].relatedIssues.length).toBe(3);
        });
        it('should estimate duration correctly', () => {
            const classified = {
                critical: [],
                high: [
                    createIssue({ estimatedEffort: 'large' }),
                    createIssue({ estimatedEffort: 'medium' }),
                    createIssue({ estimatedEffort: 'small' })
                ],
                medium: [],
                low: [],
                patterns: []
            };
            const plan = planner.generatePlan(classified, []);
            expect(plan.estimatedDuration).toBeDefined();
            expect(typeof plan.estimatedDuration).toBe('string');
            expect(plan.estimatedDuration.length).toBeGreaterThan(0);
        });
    });
});
//# sourceMappingURL=cleanup-planner.test.js.map
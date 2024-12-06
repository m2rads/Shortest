import type { TestFunction } from '../../types';

export class TestBuilder {
  static generatePrompt(test: TestFunction): string {
    const lines = [
      `Test: "${test.name}"`,
    ];

    if (test.payload) {
      lines.push(`Context: ${JSON.stringify(test.payload)}`);
    }

    const hasCallback = Boolean(test.fn);
    
    lines.push(
      'Steps:',
      `1. Execute test function${hasCallback ? ' [HAS_CALLBACK]' : ' [NO_CALLBACK]'}`
    );

    if (test.expectations && test.expectations.length > 0) {
      lines.push('Expected Results:');
      test.expectations.forEach(exp => {
        lines.push(`- ${exp.description}${exp.fn ? ' [HAS_CALLBACK]' : ' [NO_CALLBACK]'}`);
      });
    }

    return lines.filter(Boolean).join('\n');
  }

  static async parseModule(compiledModule: any): Promise<TestFunction[]> {
    // Get tests from global registry
    const registry = (global as any).__shortest__.registry;
    const tests = Array.from(registry.tests.values()).flat();

    // Clear registry after getting tests
    registry.tests.clear();

    return tests as TestFunction[];
  }
}

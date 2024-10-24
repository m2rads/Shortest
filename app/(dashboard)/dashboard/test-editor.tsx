import React, { useState } from 'react';
import { Circle, Plus, Play, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface Scenario {
  id: number;
  values: string[];
  isPlaceholder: boolean;
}

interface TestDefinition {
  id: number;
  name: string;
  columns: string[];
  scenarios: Scenario[];
}

interface TestEditorProps {
  onRunTests: (testDefinitions: TestDefinition[]) => void;
}

const TestEditor: React.FC<TestEditorProps> = ({ onRunTests }) => {
  const [testDefinitions, setTestDefinitions] = useState<TestDefinition[]>([{
    id: 1,
    name: 'Test Definition',
    columns: ['scenario', 'id', 'password', 'column name', 'column name', 'column name', 'column name'],
    scenarios: [{
      id: 1,
      values: ['this is s', '12', '1234', 'value', 'value', 'value', 'value'],
      isPlaceholder: false
    }, {
      id: 2,
      values: ['scenario', 'id value', 'password', 'value', 'value', 'value', 'value'],
      isPlaceholder: true
    }]
  }]);

  const addTestDefinition = () => {
    setTestDefinitions(prev => [...prev, {
      id: Date.now(),
      name: 'Test Definition',
      columns: ['scenario'],
      scenarios: [{
        id: Date.now(),
        values: [''],
        isPlaceholder: true
      }]
    }]);
  };

  const addColumn = (testDefId: number) => {
    setTestDefinitions(prev => prev.map(def => {
      if (def.id === testDefId) {
        return {
          ...def,
          columns: [...def.columns, ''],
          scenarios: def.scenarios.map(scenario => ({
            ...scenario,
            values: [...scenario.values, '']
          }))
        };
      }
      return def;
    }));
  };

  const deleteColumn = (testDefId: number, columnIndex: number) => {
    setTestDefinitions(prev => prev.map(def => {
      if (def.id === testDefId) {
        if (def.columns.length <= 1) return def;
        
        return {
          ...def,
          columns: def.columns.filter((_, idx) => idx !== columnIndex),
          scenarios: def.scenarios.map(scenario => ({
            ...scenario,
            values: scenario.values.filter((_, idx) => idx !== columnIndex)
          }))
        };
      }
      return def;
    }));
  };

  const addScenario = (testDefId: number) => {
    setTestDefinitions(prev => prev.map(def => {
      if (def.id === testDefId) {
        return {
          ...def,
          scenarios: def.scenarios.map(s => ({...s, isPlaceholder: false})).concat({
            id: Date.now(),
            values: Array(def.columns.length).fill(''),
            isPlaceholder: true
          })
        };
      }
      return def;
    }));
  };

  const updateColumnName = (testDefId: number, columnIndex: number, value: string) => {
    setTestDefinitions(prev => prev.map(def => {
      if (def.id === testDefId) {
        const newColumns = [...def.columns];
        newColumns[columnIndex] = value;
        return { ...def, columns: newColumns };
      }
      return def;
    }));
  };

  const updateScenarioValue = (testDefId: number, scenarioId: number, columnIndex: number, value: string) => {
    setTestDefinitions(prev => prev.map(def => {
      if (def.id === testDefId) {
        return {
          ...def,
          scenarios: def.scenarios.map(scenario => {
            if (scenario.id === scenarioId) {
              const newValues = [...scenario.values];
              newValues[columnIndex] = value;
              return { ...scenario, values: newValues };
            }
            return scenario;
          })
        };
      }
      return def;
    }));
  };

  const updateTestName = (testDefId: number, name: string) => {
    setTestDefinitions(prev => prev.map(def =>
      def.id === testDefId ? { ...def, name } : def
    ));
  };

  return (
    <div className="font-mono text-sm space-y-6 p-4">
      {testDefinitions.map((testDef) => (
        <div key={testDef.id} className="space-y-2">
          <div className="flex items-center space-x-2">
            <Circle className="h-4 w-4 shrink-0" fill="none" />
            <Input
              value={testDef.name}
              onChange={(e) => updateTestName(testDef.id, e.target.value)}
              className="border-none p-0 h-6 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 w-auto font-semibold"
            />
          </div>

          <div className="pl-6 overflow-x-auto">
            <div className="inline-block min-w-full">
              {/* Column Headers with bottom border */}
              <div className="grid border-b border-gray-200" style={{ 
                gridTemplateColumns: `repeat(${testDef.columns.length}, 120px)`,
                gap: '2rem'
              }}>
                {testDef.columns.map((col, idx) => (
                  <div key={idx} className="relative group">
                    <div className="relative">
                      <Input
                        value={col}
                        onChange={(e) => updateColumnName(testDef.id, idx, e.target.value)}
                        className="border-none px-0 py-1 h-8 bg-transparent focus-visible:ring-1 focus-visible:ring-offset-0 focus-visible:ring-blue-500"
                        placeholder="column name"
                      />
                      <div className="absolute top-1/2 -translate-y-1/2 right-0 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteColumn(testDef.id, idx)}
                          className="h-6 w-6 p-0 hover:text-red-500"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    {idx === testDef.columns.length - 1 && (
                      <div className="absolute top-1/2 -translate-y-1/2 -right-8">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => addColumn(testDef.id)}
                          className="h-6 w-6 p-0"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Scenarios */}
              <div className="space-y-1">
                {testDef.scenarios.map((scenario) => (
                  <div 
                    key={scenario.id} 
                    className={`grid ${scenario.isPlaceholder ? 'text-gray-400' : ''}`}
                    style={{ 
                      gridTemplateColumns: `repeat(${testDef.columns.length}, 120px)`,
                      gap: '2rem'
                    }}
                  >
                    {scenario.values.map((value, idx) => (
                      <div key={idx} className="relative group">
                        <Input
                          value={value}
                          onChange={(e) => updateScenarioValue(testDef.id, scenario.id, idx, e.target.value)}
                          className="border-none px-0 py-1 h-8 bg-transparent focus-visible:ring-1 focus-visible:ring-offset-0 focus-visible:ring-blue-500"
                          placeholder={`${testDef.columns[idx]} value`}
                        />
                        {idx === 0 && !scenario.isPlaceholder && (
                          <div className="absolute top-1/2 -translate-y-1/2 -left-8">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => addScenario(testDef.id)}
                              className="h-6 w-6 p-0"
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ))}

      <div className="flex justify-between pt-2">
        <Button
          size="sm"
          variant="outline"
          onClick={addTestDefinition}
          className="h-8"
        >
          <Plus className="h-4 w-4 mr-1" />
          Add Test Definition
        </Button>
        <Button
          size="sm"
          className="bg-blue-900 hover:bg-blue-800 text-white h-8"
          onClick={() => onRunTests(testDefinitions)}
        >
          <Play className="h-4 w-4 mr-1" />
          Run Tests
        </Button>
      </div>
    </div>
  );
};

export default TestEditor;

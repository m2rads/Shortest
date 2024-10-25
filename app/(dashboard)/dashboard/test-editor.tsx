import React, { useState, useRef } from 'react';
import { Circle, Plus, Play, Trash2, Check, X, Loader2, ChevronDown, ChevronRight, Pencil, RotateCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TestDefinition, TestStatus, TestDefinitionStatus } from './types';

const TestEditor: React.FC = () => {
    const [testDefinitions, setTestDefinitions] = useState<TestDefinition[]>([{
        id: 1,
        name: 'Test Definition',
        columns: ['scenario'],
        values: [['']]
    }]);

    const [isExecuting, setIsExecuting] = useState(false);
    const [executionStatus, setExecutionStatus] = useState<TestDefinitionStatus[]>([]);
    const [isTestComplete, setIsTestComplete] = useState(false);  

    const columnWidths = useRef<{ [key: string]: number }>({});

    const toggleTestDefinitionExpansion = (id: number) => {
        setExecutionStatus(prev => prev.map(def => 
            def.id === id ? { ...def, isExpanded: !def.isExpanded } : def
        ));
    };


  const addTestDefinition = () => {
    setTestDefinitions(prev => [...prev, {
      id: Date.now(),
      name: 'Test Definition',
      columns: ['scenario'],
      values: [['']]
    }]);
  };

  const addColumn = (testDefId: number) => {
    setTestDefinitions(prev => prev.map(def => {
      if (def.id === testDefId) {
        return {
          ...def,
          columns: [...def.columns, ''],
          values: def.values.map(row => [...row, ''])
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
          values: def.values.map(row => row.filter((_, idx) => idx !== columnIndex))
        };
      }
      return def;
    }));
  };

  const addRow = (testDefId: number) => {
    setTestDefinitions(prev => prev.map(def => {
      if (def.id === testDefId) {
        return {
          ...def,
          values: [...def.values, Array(def.columns.length).fill('')]
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

  const updateValue = (testDefId: number, rowIndex: number, columnIndex: number, value: string) => {
    setTestDefinitions(prev => prev.map(def => {
      if (def.id === testDefId) {
        const newValues = [...def.values];
        newValues[rowIndex] = [...newValues[rowIndex]];
        newValues[rowIndex][columnIndex] = value;
        return { ...def, values: newValues };
      }
      return def;
    }));
  };

  const updateTestName = (testDefId: number, name: string) => {
    setTestDefinitions(prev => prev.map(def =>
      def.id === testDefId ? { ...def, name } : def
    ));
  };

  const getPlaceholderText = (columnName: string, rowIndex: number) => {
    if (columnName.toLowerCase() === 'scenario') return `this is scenario ${rowIndex + 1}`;
    if (columnName.toLowerCase() === 'id') return '12';
    if (columnName.toLowerCase() === 'password') return '1234';
    return 'value';
  };

  const MIN_WIDTH = 120;
  const MAX_WIDTH = 240;

  const updateColumnWidth = (testDefId: number, columnIndex: number, width: number) => {
    columnWidths.current[`${testDefId}-${columnIndex}`] = Math.min(Math.max(width, MIN_WIDTH), MAX_WIDTH);
  };

  const getColumnWidth = (testDefId: number, columnIndex: number) => {
    return columnWidths.current[`${testDefId}-${columnIndex}`] || MIN_WIDTH;
  };

  const recalculateWidth = (element: HTMLInputElement) => {
    const tempSpan = document.createElement('span');
    tempSpan.style.visibility = 'hidden';
    tempSpan.style.position = 'absolute';
    tempSpan.style.whiteSpace = 'pre';
    tempSpan.style.font = window.getComputedStyle(element).font;
    tempSpan.textContent = element.value || element.placeholder;
    document.body.appendChild(tempSpan);
    const width = tempSpan.getBoundingClientRect().width;
    document.body.removeChild(tempSpan);
    return Math.ceil(width) + 20;
  };

  const handleInputChange = (
    testDefId: number,
    rowIndex: number,
    columnIndex: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    updateValue(testDefId, rowIndex, columnIndex, e.target.value);
    updateColumnWidthForAllInputs(testDefId, columnIndex);
  };

  const handleColumnNameChange = (
    testDefId: number,
    columnIndex: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    updateColumnName(testDefId, columnIndex, e.target.value);
    updateColumnWidthForAllInputs(testDefId, columnIndex);
  };

  const updateColumnWidthForAllInputs = (testDefId: number, columnIndex: number) => {
    const inputs = document.querySelectorAll(`[data-testdef-id="${testDefId}"][data-column-index="${columnIndex}"]`);
    let maxWidth = MIN_WIDTH;
    inputs.forEach((input) => {
      if (input instanceof HTMLInputElement) {
        const width = recalculateWidth(input);
        maxWidth = Math.max(maxWidth, width);
      }
    });
    updateColumnWidth(testDefId, columnIndex, maxWidth);
  };

  const handleRunTests = async () => {
    setIsExecuting(true);
    setIsTestComplete(false);
    
    // Initialize execution status
    const initialStatus: TestDefinitionStatus[] = testDefinitions.map(def => ({
      id: def.id,
      name: def.name,
      status: 'pending',
      scenarios: def.values.map(row => ({
        scenario: def.columns.reduce((acc, col, index) => {
          acc[col] = row[index];
          return acc;
        }, {} as Record<string, string>),
        status: 'pending'
      })),
      isExpanded: true
    }));
    
    setExecutionStatus(initialStatus);

    try {
      for (const [defIndex, testDef] of testDefinitions.entries()) {
        // Set test definition to running
        setExecutionStatus(prev => prev.map((def, idx) => 
          idx === defIndex ? { ...def, status: 'running' } : def
        ));

        let hasFailedScenario = false;

        for (const [rowIndex, row] of testDef.values.entries()) {
          // Set scenario to running
          setExecutionStatus(prev => prev.map((def, idx) => 
            idx === defIndex ? {
              ...def,
              scenarios: def.scenarios.map((scenario, sIdx) => 
                sIdx === rowIndex ? { ...scenario, status: 'running' } : scenario
              )
            } : def
          ));

          const scenario = testDef.columns.reduce((acc, col, index) => {
            acc[col] = row[index];
            return acc;
          }, {} as Record<string, string>);

          const formattedTest = {
            name: testDef.name,
            scenario: scenario
          };

          try {
            const response = await fetch('/api/execute-ui-tests', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ test: formattedTest }),
            });

            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            
            // Update scenario status to pass
            setExecutionStatus(prev => prev.map((def, idx) => 
              idx === defIndex ? {
                ...def,
                scenarios: def.scenarios.map((scenario, sIdx) => 
                  sIdx === rowIndex ? { ...scenario, status: 'pass' } : scenario
                )
              } : def
            ));
          } catch (error) {
            hasFailedScenario = true;
            // Update scenario status to fail
            setExecutionStatus(prev => prev.map((def, idx) => 
              idx === defIndex ? {
                ...def,
                scenarios: def.scenarios.map((scenario, sIdx) => 
                  sIdx === rowIndex ? { 
                    ...scenario, 
                    status: 'fail',
                    error: error instanceof Error ? error.message : 'Unknown error'
                  } : scenario
                )
              } : def
            ));
          }
        }

        // Update test definition status based on scenarios
        setExecutionStatus(prev => prev.map((def, idx) => 
          idx === defIndex ? {
            ...def,
            status: hasFailedScenario ? 'fail' : 'pass'
          } : def
        ));
      }
    } catch (error) {
      console.error('Error running UI tests:', error);
    } finally {
      setIsTestComplete(true);
    }
  };

  const getStatusIcon = (status: TestStatus) => {
    switch (status) {
      case 'running':
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
      case 'pass':
        return <Check className="h-4 w-4 text-green-500" />;
      case 'fail':
        return <X className="h-4 w-4 text-red-500" />;
      default:
        return <Circle className="h-4 w-4" />;
    }
  };

  return (
    <div className="font-mono text-sm space-y-6 p-4">
      {isExecuting ? (
        // Execution View
        <div className="space-y-6">
          {executionStatus.map((testDef) => (
            <div key={testDef.id} className="space-y-2">
              <div 
                className="flex items-center space-x-2 cursor-pointer" 
                onClick={() => toggleTestDefinitionExpansion(testDef.id)}
              >
                {testDef.isExpanded ? 
                  <ChevronDown className="h-4 w-4" /> : 
                  <ChevronRight className="h-4 w-4" />
                }
                {getStatusIcon(testDef.status)}
                <span className="font-semibold">{testDef.name}</span>
              </div>
              {testDef.isExpanded && (
                <div className="pl-10 space-y-1">
                  {testDef.scenarios.map((scenario, index) => (
                    <div key={index} className="flex space-x-2">
                        <div className="flex-shrink-0 mt-1">
                            {getStatusIcon(scenario.status)}
                        </div>
                        <div className="flex-1">
                            <span>
                                {Object.entries(scenario.scenario)
                                    .map(([key, value]) => `${key}: ${value}`)
                                    .join(', ')}
                            </span>
                            {scenario.error && (
                            <span className="text-red-500 text-xs">{scenario.error}</span>
                            )}
                        </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        // Editor View
        <>
          {testDefinitions.map((testDef) => (
            <div key={testDef.id} className="space-y-2">
              <div className="flex items-center space-x-2">
                <Circle className="h-4 w-4 shrink-0" fill="none" />
                <div className="relative inline-block">
                  <Input
                    value={testDef.name}
                    onChange={(e) => updateTestName(testDef.id, e.target.value)}
                    className="border-none p-0 h-6 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 font-semibold absolute top-0 left-0 w-full"
                    style={{ width: `${testDef.name.length}ch` }}
                  />
                  <span className="invisible whitespace-pre">{testDef.name}</span>
                </div>
              </div>

              <div className="pl-6 overflow-x-auto">
                <div className="inline-block min-w-full">
                  {/* Column Headers */}
                  <div className="flex border-b border-gray-200">
                    {testDef.columns.map((col, idx) => (
                      <div key={idx} className="relative group flex-shrink-0 px-4">
                        <div className="relative">
                          <Input
                            value={col}
                            onChange={(e) => handleColumnNameChange(testDef.id, idx, e)}
                            className="border-none px-0 py-1 h-8 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:ring-blue-500 overflow-x-auto"
                            placeholder="column name"
                            data-testdef-id={testDef.id}
                            data-column-index={idx}
                            style={{ 
                              width: `${getColumnWidth(testDef.id, idx)}px`,
                              minWidth: `${MIN_WIDTH}px`,
                              maxWidth: `${MAX_WIDTH}px`,
                              paddingRight: '10px'
                            }}
                          />
                          <div className="absolute top-1/2 -translate-y-1/2 right-0 transform translate-x-full opacity-0 group-hover:opacity-100 transition-opacity">
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
                  {/* Values */}
                  <div className="space-y-1">
                    {testDef.values.map((row, rowIndex) => (
                      <div key={rowIndex} className="flex relative">
                        {row.map((value, columnIndex) => (
                          <div key={columnIndex} className="relative group flex-shrink-0 px-4">
                            <div className="relative inline-block">
                              <Input
                                value={value}
                                onChange={(e) => handleInputChange(testDef.id, rowIndex, columnIndex, e)}
                                className="border-none px-0 py-1 h-8 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:ring-blue-500 overflow-x-auto"
                                placeholder={getPlaceholderText(testDef.columns[columnIndex], rowIndex)}
                                data-testdef-id={testDef.id}
                                data-column-index={columnIndex}
                                style={{ 
                                  width: `${getColumnWidth(testDef.id, columnIndex)}px`,
                                  minWidth: `${MIN_WIDTH}px`,
                                  maxWidth: `${MAX_WIDTH}px`
                                }}
                              />
                            </div>
                          </div>
                        ))}
                        {rowIndex === testDef.values.length - 1 && (
                          <div className="absolute -left-6 top-1/2 -translate-y-1/2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => addRow(testDef.id)}
                              className="h-6 w-6 p-0"
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </>
      )}

<div className="flex justify-between pt-2">
        {isExecuting ? (
          isTestComplete ? (
            // Test execution complete controls
            <div className="flex space-x-2 w-full justify-end">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleRunTests()}
                className="h-8"
              >
                <RotateCw className="h-4 w-4 mr-1" />
                Run Again
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setIsExecuting(false);
                  setIsTestComplete(false);
                }}
                className="h-8"
              >
                <Pencil className="h-4 w-4 mr-1" />
                Edit Tests
              </Button>
            </div>
          ) : (
            <div className="w-full flex justify-end">
              <span className="text-sm text-gray-500">Executing Tests...</span>
            </div>
          )
        ) : (
          <>
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
              onClick={handleRunTests}
            >
              <Play className="h-4 w-4 mr-1" />
              Run Tests
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default TestEditor;

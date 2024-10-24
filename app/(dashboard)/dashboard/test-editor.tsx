import React, { useState, useRef } from 'react';
import { Circle, Plus, Play, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TestDefinition } from './types';

interface TestEditorProps {
  onRunTests: (testDefinitions: TestDefinition[]) => void;
}

const TestEditor: React.FC<TestEditorProps> = ({ onRunTests }) => {
  const [testDefinitions, setTestDefinitions] = useState<TestDefinition[]>([{
    id: 1,
    name: 'Test Definition',
    columns: ['scenario'],
    values: [['']]
  }]);

  const columnWidths = useRef<{ [key: string]: number }>({});

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
    return Math.ceil(width);
  };

  const handleInputChange = (
    testDefId: number,
    rowIndex: number,
    columnIndex: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    updateValue(testDefId, rowIndex, columnIndex, e.target.value);
    const newWidth = recalculateWidth(e.target);
    updateColumnWidth(testDefId, columnIndex, Math.max(newWidth, getColumnWidth(testDefId, columnIndex)));
  };

  const handleColumnNameChange = (
    testDefId: number,
    columnIndex: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    updateColumnName(testDefId, columnIndex, e.target.value);
    const newWidth = recalculateWidth(e.target);
    updateColumnWidth(testDefId, columnIndex, Math.max(newWidth, getColumnWidth(testDefId, columnIndex)));
  };

  return (
    <div className="font-mono text-sm space-y-6 p-4">
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

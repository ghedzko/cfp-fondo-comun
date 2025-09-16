'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Check } from 'lucide-react';

interface MonthSelectorProps {
  selectedMonths: number[];
  onMonthsChange: (months: number[]) => void;
  disabled?: boolean;
}

const MONTHS = [
  { number: 1, name: 'Enero', short: 'Ene' },
  { number: 2, name: 'Febrero', short: 'Feb' },
  { number: 3, name: 'Marzo', short: 'Mar' },
  { number: 4, name: 'Abril', short: 'Abr' },
  { number: 5, name: 'Mayo', short: 'May' },
  { number: 6, name: 'Junio', short: 'Jun' },
  { number: 7, name: 'Julio', short: 'Jul' },
  { number: 8, name: 'Agosto', short: 'Ago' },
  { number: 9, name: 'Septiembre', short: 'Sep' },
  { number: 10, name: 'Octubre', short: 'Oct' },
  { number: 11, name: 'Noviembre', short: 'Nov' },
  { number: 12, name: 'Diciembre', short: 'Dic' },
];

const QUICK_SELECTIONS = [
  { label: 'Mar-Jun', months: [3, 4, 5, 6] },
  { label: 'Ago-Nov', months: [8, 9, 10, 11] },
  { label: 'Año Completo', months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] },
  { label: 'Primer Semestre', months: [1, 2, 3, 4, 5, 6] },
  { label: 'Segundo Semestre', months: [7, 8, 9, 10, 11, 12] },
];

export function MonthSelector({ selectedMonths, onMonthsChange, disabled = false }: MonthSelectorProps) {
  const toggleMonth = (monthNumber: number) => {
    if (disabled) return;
    
    const isSelected = selectedMonths.includes(monthNumber);
    if (isSelected) {
      onMonthsChange(selectedMonths.filter(m => m !== monthNumber));
    } else {
      onMonthsChange([...selectedMonths, monthNumber].sort());
    }
  };

  const applyQuickSelection = (months: number[]) => {
    if (disabled) return;
    onMonthsChange(months);
  };

  const clearSelection = () => {
    if (disabled) return;
    onMonthsChange([]);
  };

  return (
    <Card className="month-selector">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar size={20} />
          Meses Habilitados
        </CardTitle>
        <CardDescription>
          Selecciona los meses en los que el curso estará activo para recibir aportes
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Quick Selection Buttons */}
        <div className="quick-selections">
          <h4 className="text-sm font-medium mb-2">Selecciones Rápidas:</h4>
          <div className="flex flex-wrap gap-2">
            {QUICK_SELECTIONS.map((selection) => (
              <Button
                key={selection.label}
                variant="outline"
                size="sm"
                onClick={() => applyQuickSelection(selection.months)}
                disabled={disabled}
                className="text-xs"
              >
                {selection.label}
              </Button>
            ))}
            <Button
              variant="outline"
              size="sm"
              onClick={clearSelection}
              disabled={disabled}
              className="text-xs text-red-600 hover:text-red-700"
            >
              Limpiar
            </Button>
          </div>
        </div>

        {/* Month Grid */}
        <div className="month-grid">
          <h4 className="text-sm font-medium mb-2">Selección Individual:</h4>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
            {MONTHS.map((month) => {
              const isSelected = selectedMonths.includes(month.number);
              return (
                <button
                  key={month.number}
                  type="button"
                  onClick={() => toggleMonth(month.number)}
                  disabled={disabled}
                  className={`
                    relative p-3 rounded-lg border-2 transition-all duration-200
                    ${isSelected 
                      ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300' 
                      : 'border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600'
                    }
                    ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:shadow-sm'}
                  `}
                  aria-pressed={isSelected}
                  aria-label={`${isSelected ? 'Deseleccionar' : 'Seleccionar'} ${month.name}`}
                >
                  <div className="text-center">
                    <div className="text-xs font-medium">{month.short}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{month.number}</div>
                  </div>
                  {isSelected && (
                    <div className="absolute -top-1 -right-1 bg-blue-500 text-white rounded-full p-1">
                      <Check size={12} />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Months Summary */}
        {selectedMonths.length > 0 && (
          <div className="selected-summary">
            <h4 className="text-sm font-medium mb-2">Meses Seleccionados ({selectedMonths.length}):</h4>
            <div className="flex flex-wrap gap-1">
              {selectedMonths.map((monthNumber) => {
                const month = MONTHS.find(m => m.number === monthNumber);
                return (
                  <Badge key={monthNumber} variant="default" className="text-xs">
                    {month?.short}
                  </Badge>
                );
              })}
            </div>
          </div>
        )}

        {selectedMonths.length === 0 && (
          <div className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
            No hay meses seleccionados. Los estudiantes no podrán realizar aportes.
          </div>
        )}
      </CardContent>
    </Card>
  );
}

import React from 'react';
import { 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  Sun, 
  Moon, 
  Clock, 
  CheckCircle, 
  Sparkles,
  Users
} from 'lucide-react';
import { ShiftType } from '../../types';
import { formatFullPortugueseDate } from '../../utils/dateUtils';

interface SaturdaySelectorProps {
  currentDate: string; // 'YYYY-MM-DD'
  onDateChange: (newDate: string) => void;
  activeShift: 'todos' | ShiftType;
  onShiftChange: (shift: 'todos' | ShiftType) => void;
  availableSaturdays: string[];
}

export const SaturdaySelector: React.FC<SaturdaySelectorProps> = ({
  currentDate,
  onDateChange,
  activeShift,
  onShiftChange,
  availableSaturdays
}) => {
  const currentIndex = availableSaturdays.indexOf(currentDate);

  const handlePrev = () => {
    if (currentIndex > 0) {
      onDateChange(availableSaturdays[currentIndex - 1]);
    }
  };

  const handleNext = () => {
    if (currentIndex < availableSaturdays.length - 1) {
      onDateChange(availableSaturdays[currentIndex + 1]);
    }
  };

  const isFirst = currentIndex <= 0;
  const isLast = currentIndex >= availableSaturdays.length - 1 || currentIndex === -1;

  return (
    <div className="bg-white dark:bg-[#0E1726] rounded-xl border border-slate-200/90 dark:border-slate-800 p-3.5 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
      {/* Left: Date Display & Fast Switchers */}
      <div className="flex items-center gap-3 w-full md:w-auto">
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200/80 dark:border-slate-800">
          <button
            onClick={handlePrev}
            disabled={isFirst}
            className="p-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent transition-all cursor-pointer"
            title="Sábado Anterior"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          
          <div className="px-2.5 py-0.5 text-center min-w-[120px]">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
              Sábado Letivo
            </span>
            <span className="text-xs font-black text-slate-900 dark:text-white font-mono">
              {currentDate ? currentDate.split('-').reverse().join('/') : 'Selecione'}
            </span>
          </div>

          <button
            onClick={handleNext}
            disabled={isLast}
            className="p-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent transition-all cursor-pointer"
            title="Próximo Sábado"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="hidden sm:flex flex-col">
          <span className="text-xs font-bold text-slate-900 dark:text-white">
            {currentDate ? formatFullPortugueseDate(currentDate) : 'Data do Ciclo'}
          </span>
          <span className="text-[10px] text-slate-400">
            {currentIndex + 1}º de {availableSaturdays.length} sábados cadastrados
          </span>
        </div>
      </div>

      {/* Right: Shift Selector */}
      <div className="flex items-center gap-1.5 w-full md:w-auto justify-end">
        <span className="text-slate-400 text-[11px] mr-1 hidden sm:inline">Turno:</span>
        <button
          onClick={() => onShiftChange('todos')}
          className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-colors cursor-pointer ${
            activeShift === 'todos'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
          }`}
        >
          Todos
        </button>
        <button
          onClick={() => onShiftChange('manha')}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-xl font-bold text-xs transition-colors cursor-pointer ${
            activeShift === 'manha'
              ? 'bg-amber-500 text-white shadow-xs'
              : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
          }`}
        >
          <Sun className="w-3.5 h-3.5" />
          <span>Manhã</span>
        </button>
        <button
          onClick={() => onShiftChange('tarde')}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-xl font-bold text-xs transition-colors cursor-pointer ${
            activeShift === 'tarde'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
          }`}
        >
          <Moon className="w-3.5 h-3.5" />
          <span>Tarde</span>
        </button>
      </div>
    </div>
  );
};

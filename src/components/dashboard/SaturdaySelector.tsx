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
    <div className="bg-white rounded-2xl border border-slate-200/90 p-4 lg:p-5 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
      {/* Left: Date Display & Fast Switchers */}
      <div className="flex items-center gap-3 w-full md:w-auto">
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200/80">
          <button
            onClick={handlePrev}
            disabled={isFirst}
            className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-white disabled:opacity-30 disabled:hover:bg-transparent transition-all"
            title="Sábado Anterior"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => onDateChange('2026-10-24')}
            className="px-2.5 py-1 text-xs font-semibold text-slate-700 hover:text-blue-600 rounded-lg hover:bg-white transition-all"
          >
            Sábado Atual
          </button>

          <button
            onClick={handleNext}
            disabled={isLast}
            className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-white disabled:opacity-30 disabled:hover:bg-transparent transition-all"
            title="Próximo Sábado"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 text-sm md:text-base">
                {formatFullPortugueseDate(currentDate)}
              </span>
              <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                Aula {currentIndex >= 0 ? currentIndex + 1 : 4} de 4
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Ciclo de Treinamento Social Outubro 2026
            </p>
          </div>
        </div>
      </div>

      {/* Right: Shift filter toggle pills */}
      <div className="flex items-center gap-2 w-full md:w-auto justify-end">
        <span className="text-xs font-medium text-slate-400 mr-1 hidden sm:inline">
          Turno:
        </span>
        <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1 border border-slate-200/80">
          <button
            onClick={() => onShiftChange('todos')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeShift === 'todos'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Todos
          </button>
          <button
            onClick={() => onShiftChange('manha')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeShift === 'manha'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sun className="w-3.5 h-3.5" />
            <span>Manhã (08h-12h)</span>
          </button>
          <button
            onClick={() => onShiftChange('tarde')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeShift === 'tarde'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Moon className="w-3.5 h-3.5" />
            <span>Tarde (13h-17h)</span>
          </button>
        </div>
      </div>
    </div>
  );
};

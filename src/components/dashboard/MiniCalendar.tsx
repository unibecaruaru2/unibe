import React, { useState } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Sparkles, 
  Clock, 
  CheckCircle2, 
  Send 
} from 'lucide-react';
import { formatFullPortugueseDate } from '../../utils/dateUtils';

interface MiniCalendarProps {
  selectedDate: string; // 'YYYY-MM-DD'
  onSelectDate: (date: string) => void;
  highlightedSaturdays?: string[];
  onBroadcastSaturday?: (date: string) => void;
}

export const MiniCalendar: React.FC<MiniCalendarProps> = ({
  selectedDate,
  onSelectDate,
  highlightedSaturdays = ['2026-10-03', '2026-10-10', '2026-10-17', '2026-10-24', '2026-10-31'],
  onBroadcastSaturday
}) => {
  // Parse year and month from selected date or use October 2026 as standard
  const initialYear = selectedDate ? parseInt(selectedDate.split('-')[0], 10) : 2026;
  const initialMonth = selectedDate ? parseInt(selectedDate.split('-')[1], 10) - 1 : 9; // 0-indexed (9 = Oct)

  const [currentYear, setCurrentYear] = useState<number>(initialYear);
  const [currentMonth, setCurrentMonth] = useState<number>(initialMonth);

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const weekDayNames = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

  // Calculate calendar grid
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const handleDayClick = (dayNumber: number) => {
    const formattedMonth = String(currentMonth + 1).padStart(2, '0');
    const formattedDay = String(dayNumber).padStart(2, '0');
    const newDateStr = `${currentYear}-${formattedMonth}-${formattedDay}`;
    onSelectDate(newDateStr);
  };

  // Check if selected date is in current view
  const isSelected = (dayNumber: number) => {
    const formattedMonth = String(currentMonth + 1).padStart(2, '0');
    const formattedDay = String(dayNumber).padStart(2, '0');
    const dateStr = `${currentYear}-${formattedMonth}-${formattedDay}`;
    return dateStr === selectedDate;
  };

  const isHighlightedSaturday = (dayNumber: number) => {
    const formattedMonth = String(currentMonth + 1).padStart(2, '0');
    const formattedDay = String(dayNumber).padStart(2, '0');
    const dateStr = `${currentYear}-${formattedMonth}-${formattedDay}`;
    return highlightedSaturdays.includes(dateStr);
  };

  // Build grid days
  const calendarCells = [];
  // Empty leading cells
  for (let i = 0; i < firstDayIndex; i++) {
    calendarCells.push(
      <div key={`empty-${i}`} className="h-8 flex items-center justify-center text-slate-300 text-xs" />
    );
  }

  // Actual month days
  for (let day = 1; day <= daysInMonth; day++) {
    const isSat = new Date(currentYear, currentMonth, day).getDay() === 6;
    const isSelectedDay = isSelected(day);
    const isHasCohort = isHighlightedSaturday(day);

    calendarCells.push(
      <button
        key={`day-${day}`}
        onClick={() => handleDayClick(day)}
        className={`h-8 w-8 mx-auto rounded-xl flex flex-col items-center justify-center relative text-xs font-medium transition-all ${
          isSelectedDay
            ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-500/30 ring-2 ring-blue-300'
            : isHasCohort
            ? 'bg-blue-50 text-blue-700 font-bold hover:bg-blue-100 ring-1 ring-blue-200'
            : isSat
            ? 'text-blue-900 font-semibold hover:bg-slate-100'
            : 'text-slate-700 hover:bg-slate-100'
        }`}
      >
        <span>{day}</span>
        {isHasCohort && !isSelectedDay && (
          <span className="w-1.5 h-1.5 rounded-full bg-blue-600 -mt-0.5" />
        )}
      </button>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex flex-col">
      {/* Calendar Header with Navigation */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-4 h-4 text-blue-600" />
          <h3 className="font-bold text-slate-800 text-sm">
            {monthNames[currentMonth]} {currentYear}
          </h3>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={handlePrevMonth}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
            title="Mês Anterior"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={handleNextMonth}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
            title="Próximo Mês"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Weekday headers (Sunday - Saturday) */}
      <div className="grid grid-cols-7 gap-1 text-center mb-2">
        {weekDayNames.map((w, index) => (
          <span
            key={`header-${index}`}
            className={`text-[11px] font-semibold ${
              index === 6 ? 'text-blue-600 font-bold' : 'text-slate-400'
            }`}
          >
            {w}
          </span>
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-y-1.5 gap-x-1 text-center">
        {calendarCells}
      </div>

      {/* Selected Saturday Info Box */}
      <div className="mt-5 pt-4 border-t border-slate-100 flex flex-col gap-2.5">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-500 font-medium">Data Selecionada:</span>
          <span className="font-bold text-slate-900 bg-slate-100 px-2.5 py-0.5 rounded-lg">
            {selectedDate.split('-').reverse().join('/')}
          </span>
        </div>

        <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-xl flex flex-col gap-1.5">
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-900">
            <Clock className="w-3.5 h-3.5 text-blue-600" />
            <span>Sábado Letivo (Aula 4 de 4)</span>
          </div>
          <p className="text-[11px] text-blue-800/80 leading-tight">
            Turnos: Manhã (08h às 12h) e Tarde (13h às 17h)
          </p>
        </div>

        {onBroadcastSaturday && (
          <button
            onClick={() => onBroadcastSaturday(selectedDate)}
            className="w-full mt-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-semibold shadow-xs hover:shadow-emerald-500/20 transition-all"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Disparar Lembrete Geral (WhatsApp)</span>
          </button>
        )}
      </div>
    </div>
  );
};

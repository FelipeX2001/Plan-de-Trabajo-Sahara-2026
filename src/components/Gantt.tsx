import { Task } from '../lib/api';
import { cn } from '../lib/utils';
import { Check } from 'lucide-react';

const MONTHS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

// Helper to determine active months based on frequency string
const getActiveMonths = (frequency: string, date: string | null): number[] => {
  const l = frequency.toLowerCase();
  
  if (l.includes('mensual')) return [0,1,2,3,4,5,6,7,8,9,10,11];
  if (l.includes('cuatrimestral')) return [3, 7, 11]; // roughly Apr, Aug, Dec
  if (l.includes('junio')) return [5]; 
  if (l.includes('próximo')) {
    const nextMonth = (new Date().getMonth() + 1) % 12;
    return [nextMonth];
  }
  
  if (date) {
    const d = new Date(date);
    if (!isNaN(d.getTime())) {
      return [d.getMonth()];
    }
  }

  // Si no tiene mes definido o es única/pendiente sin fecha
  return []; 
};

export default function Gantt({ tasks }: { tasks: Task[] }) {
  const currentMonth = new Date().getMonth();

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <h3 className="text-xs font-black uppercase text-[var(--color-accent-teal-200)] border-b pb-2 mb-4 tracking-widest shrink-0">Cronograma Visual 2026</h3>
      
      <div className="flex-grow overflow-auto pb-4">
        <div className="min-w-[500px]">
          {/* Header */}
          <div className="flex border-b border-gray-200 bg-slate-50 uppercase text-[10px] font-black text-slate-500">
            <div className="w-1/3 p-2 border-r border-gray-200">Actividad</div>
            <div className="w-2/3 flex">
              {MONTHS.map((m, i) => (
                <div 
                  key={m} 
                  className={cn(
                    "flex-1 p-2 text-center border-r border-gray-200 last:border-0",
                    i === currentMonth && "bg-[var(--color-brand-100)] text-[var(--color-brand-500)]"
                  )}
                >
                  {m}
                </div>
              ))}
            </div>
          </div>

          {/* Rows */}
          <div className="divide-y divide-slate-100 border-b border-slate-100 text-xs">
            {tasks.map(task => {
              const activeMonths = getActiveMonths(task.frequency, task.date);
              const isDone = task.status === 'Completado';
              
              const colorClass = 
                task.importance === 'Alta' ? 'bg-[var(--color-accent-red-200)]' :
                task.importance === 'Media' ? 'bg-[var(--color-brand-400)]' :
                'bg-slate-400';

              return (
                <div key={task.id} className="flex hover:bg-slate-50 transition-colors group">
                  <div className="w-1/3 p-2 flex flex-col justify-center border-r border-slate-100">
                    <p className={cn("font-bold", isDone ? "text-slate-400 line-through" : "text-slate-800")}>
                      {task.name}
                    </p>
                    <p className="text-[9px] text-slate-500 uppercase tracking-widest mt-0.5">{task.frequency}</p>
                  </div>
                  
                  <div className="w-2/3 flex py-1">
                    {MONTHS.map((_, i) => {
                      const isActive = activeMonths.includes(i);
                      // Consider executed if overall task done, or if it's Monthly and month is up to May (index 4)
                      let isMonthDone = isDone;
                      if (!isDone && task.frequency.toLowerCase().includes('mensual') && i <= 4) {
                        isMonthDone = true;
                      }

                      return (
                        <div key={i} className="flex-1 px-[2px] flex items-center justify-center border-r border-slate-50 last:border-0 relative">
                          {isActive && (
                            <div 
                              title={`${task.name} - ${MONTHS[i]}`}
                              className={cn(
                                "w-full h-4 rounded-sm flex items-center justify-center opacity-80 group-hover:opacity-100 transition-opacity absolute inset-y-1 mx-[1px]", 
                                colorClass,
                                isMonthDone && "bg-[var(--color-accent-teal-200)]"
                              )}
                            >
                              {isMonthDone && <Check className="h-3 w-3 text-white" />}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
      
      <div className="mt-auto flex gap-2 pt-4 border-t border-slate-100 shrink-0">
        <button className="flex-grow py-2 border border-slate-200 text-slate-600 rounded-md text-[10px] font-bold hover:bg-slate-50">EXPORTAR PDF</button>
        <button className="flex-grow py-2 border border-slate-200 text-slate-600 rounded-md text-[10px] font-bold hover:bg-slate-50">EXPORTAR EXCEL</button>
      </div>
    </div>
  );
}

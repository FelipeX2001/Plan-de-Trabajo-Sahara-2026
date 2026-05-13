import { Task } from '../lib/api';
import { Target, CheckCircle2, AlertTriangle, Clock } from 'lucide-react';

export default function KPIs({ tasks }: { tasks: Task[] }) {
  const total = tasks.length;
  const completed = tasks.filter(t => t.status === 'Completado').length;
  const completedPercent = total === 0 ? 0 : Math.round((completed / total) * 100);
  
  const pendingHigh = tasks.filter(t => t.status !== 'Completado' && t.importance === 'Alta').length;

  // Let's find "next critical". For now, just pick the first pending High task
  const nextCritical = tasks.find(t => t.status !== 'Completado' && t.importance === 'Alta')?.name || 'Ninguna grave';

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="bg-white p-4 border-l-4 border-[var(--color-accent-teal-100)] shadow-sm rounded-r-md">
        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wide">Total de Tareas</p>
        <p className="text-3xl font-black text-[var(--color-accent-teal-200)]">{total}</p>
        <p className="text-xs text-slate-400 mt-1">Plan de trabajo activo</p>
      </div>
      
      <div className="bg-white p-4 border-l-4 border-[var(--color-brand-300)] shadow-sm rounded-r-md">
        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wide">Completadas</p>
        <div className="flex items-baseline gap-2">
          <p className="text-3xl font-black text-[var(--color-brand-500)]">{completed}</p>
          <p className="text-lg font-bold text-slate-400">/ {completedPercent}%</p>
        </div>
        <div className="w-full bg-slate-100 h-1.5 mt-2 rounded-full overflow-hidden">
          <div className="bg-[var(--color-brand-400)] h-full" style={{ width: `${completedPercent}%` }}></div>
        </div>
      </div>

      <div className="bg-white p-4 border-l-4 border-[var(--color-accent-red-200)] shadow-sm rounded-r-md">
        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wide">Alta Importancia</p>
        <p className="text-3xl font-black text-[var(--color-accent-red-200)]">{pendingHigh}</p>
        <p className="text-xs text-red-400 font-medium mt-1">Requieren atención inmediata</p>
      </div>

      <div className="bg-white p-4 border-l-4 border-slate-800 shadow-sm rounded-r-md">
        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wide">Próxima Crítica</p>
        <p className="text-sm font-bold text-slate-800 leading-tight mt-1 truncate">{nextCritical}</p>
        <p className="text-[10px] bg-slate-100 px-2 py-0.5 rounded inline-block mt-2 font-bold uppercase">Proximamente</p>
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { api, Task } from '../lib/api';
import { Calendar, LayoutDashboard, UserCircle2 } from 'lucide-react';
import KPIs from './KPIs';
import TaskTable from './TaskTable';
import Gantt from './Gantt';
import { cn } from '../lib/utils';
import { Link } from 'react-router-dom';

export default function PublicDashboard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [search, setSearch] = useState('');
  const [importanceFilter, setImportanceFilter] = useState('Todos');
  const [statusFilter, setStatusFilter] = useState('Todos');
  const [responsibleFilter, setResponsibleFilter] = useState('Todos');

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const data = await api.getTasks();
      setTasks(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredTasks = tasks.filter(t => {
    const s = search.toLowerCase();
    const matchSearch = t.name.toLowerCase().includes(s) || (t.observations && t.observations.toLowerCase().includes(s));
    const matchImp = importanceFilter === 'Todos' || t.importance === importanceFilter;
    const matchStatus = statusFilter === 'Todos' || t.status === statusFilter;
    const matchResp = responsibleFilter === 'Todos' || t.responsible === responsibleFilter;
    return matchSearch && matchImp && matchStatus && matchResp;
  });

  return (
    <div className="flex h-screen md:h-screen min-h-[100dvh] flex-col bg-[var(--color-brand-100)] text-slate-800 font-sans">
      {/* Navbar */}
      <header className="shrink-0 w-full bg-[var(--color-accent-teal-200)] text-white shadow-md">
        <div className="flex h-16 items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white">
              <span className="text-[var(--color-accent-teal-200)] font-black text-xs">VIS</span>
            </div>
            <div>
              <h1 className="text-sm md:text-lg font-bold tracking-tight">Sahara VIS — Seguimiento Plan 2026</h1>
              <p className="text-[10px] md:text-xs opacity-80 uppercase tracking-widest font-semibold">Portal de Residentes</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <Link
              to="/admin"
              className="flex items-center gap-2 px-4 py-2 bg-transparent border border-white/30 hover:bg-white/10 rounded-md text-sm font-bold transition-colors text-white"
            >
              <UserCircle2 className="h-4 w-4" />
              <span className="hidden sm:inline-block">Acceso Admin</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-full mx-auto p-4 md:p-6 flex flex-col gap-6 overflow-auto lg:overflow-hidden">
        <KPIs tasks={tasks} />

        {/* Filters */}
        <div className="shrink-0 bg-white px-4 py-3 rounded-lg shadow-sm flex flex-col md:flex-row items-center gap-4 text-sm border border-slate-200">
          <div className="relative flex-grow w-full md:w-auto">
            <input
              type="text"
              placeholder="Buscar actividad..."
              className="w-full pl-9 pr-4 py-1.5 border border-slate-200 rounded-md bg-slate-50 focus:outline-none focus:ring-1 focus:ring-[var(--color-accent-teal-200)]"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <svg className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
          </div>
          
          <div className="flex gap-2 flex-wrap sm:flex-nowrap w-full md:w-auto">
            <select 
              className="bg-slate-50 border border-slate-200 rounded-md px-3 py-1.5 font-medium flex-grow md:flex-none"
              value={importanceFilter}
              onChange={e => setImportanceFilter(e.target.value)}
            >
              <option value="Todos">Prioridad: Todas</option>
              <option value="Alta">Alta</option>
              <option value="Media">Media</option>
              <option value="Baja">Baja</option>
            </select>
            
            <select 
              className="bg-slate-50 border border-slate-200 rounded-md px-3 py-1.5 font-medium flex-grow md:flex-none"
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
            >
              <option value="Todos">Estado: Todos</option>
              <option value="Pendiente">Pendiente</option>
              <option value="En progreso">En progreso</option>
              <option value="Completado">Completado</option>
            </select>

            <select 
              className="bg-slate-50 border border-slate-200 rounded-md px-3 py-1.5 font-medium flex-grow md:flex-none"
              value={responsibleFilter}
              onChange={e => setResponsibleFilter(e.target.value)}
            >
              <option value="Todos">Responsable: Todos</option>
              <option value="Administración">Administración</option>
              <option value="Técnico">Técnico</option>
              <option value="Proveedor">Proveedor</option>
            </select>
          </div>
        </div>

        {/* CONTENT GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-grow items-start lg:overflow-hidden">
          
          <div className="lg:col-span-8 bg-white rounded-lg shadow-sm border border-slate-200 flex flex-col lg:overflow-hidden h-[500px] lg:h-full">
            <div className="w-full h-full flex flex-col overflow-hidden">
              <div className="flex-grow overflow-auto relative pointer-events-none opacity-90">
                {/* We will reuse TaskTable but disable actions via CSS or make a modified version, wait let's just make it simpler by adding readOnly prop to TaskTable */}
                <TaskTable tasks={filteredTasks} onUpdateTask={() => {}} readOnly={true} />
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 flex flex-col gap-4 overflow-y-auto pr-2 pb-2 h-full">
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 flex flex-col relative shrink-0">
              <Gantt tasks={filteredTasks} />
            </div>

            <div className="shrink-0 bg-[var(--color-brand-200)] text-[var(--color-brand-500)] p-4 rounded-lg shadow-sm flex items-center gap-3">
              <div className="w-8 h-8 rounded-full border-2 border-[var(--color-brand-500)] flex items-center justify-center font-black shrink-0">
                i
              </div>
              <div>
                <p className="text-xs font-black">Información de lectura</p>
                <p className="text-[10px] font-medium leading-none mt-1">Este panel es únicamente informativo y de seguimiento para residentes.</p>
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* FOOTER */}
      <footer className="shrink-0 bg-slate-100 border-t border-slate-200 px-6 py-2 flex justify-between items-center text-[10px] font-medium text-slate-400 uppercase tracking-tighter mt-auto">
        <p>© 2026 Agrupación Sahara VIS — Portal Residentes v1.0.4</p>
        <p className="flex items-center gap-4 hidden sm:flex">
          <span className="text-slate-500">Actualización en tiempo real</span>
        </p>
      </footer>
    </div>
  );
}

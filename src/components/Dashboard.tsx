import { useState, useEffect } from 'react';
import { api, Task } from '../lib/api';
import { LogOut, Calendar, LayoutDashboard, Settings, FileText, X, Save } from 'lucide-react';
import KPIs from './KPIs';
import TaskTable from './TaskTable';
import Gantt from './Gantt';
import { cn } from '../lib/utils';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function Dashboard({ onLogout }: { onLogout: () => void }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [search, setSearch] = useState('');
  const [importanceFilter, setImportanceFilter] = useState('Todos');
  const [statusFilter, setStatusFilter] = useState('Todos');
  const [responsibleFilter, setResponsibleFilter] = useState('Todos');

  // New task drawer
  const [isNewTaskOpen, setIsNewTaskOpen] = useState(false);
  const [newTaskForm, setNewTaskForm] = useState<Partial<Task>>({
    status: 'Pendiente',
    importance: 'Media',
    frequency: 'Única',
    responsible: 'Administración'
  });

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

  const handleLogout = async () => {
    try {
      await api.logout();
      onLogout();
    } catch (err) {
      console.error('Logout error', err);
    }
  };

  const handleUpdateTask = async (id: string, updates: Partial<Task>) => {
    try {
      const updated = await api.updateTask(id, updates);
      setTasks(tasks.map(t => t.id === id ? updated : t));
    } catch (error) {
      console.error(error);
      alert('Error updating task');
    }
  };

  const handleCreateTask = async () => {
    if (!newTaskForm.name) return;
    try {
      const created = await api.createTask(newTaskForm as Omit<Task, 'id'>);
      setTasks([...tasks, created]);
      setIsNewTaskOpen(false);
      setNewTaskForm({ status: 'Pendiente', importance: 'Media', frequency: 'Única', responsible: 'Administración' });
    } catch (error) {
      console.error(error);
      alert('Error creando tarea');
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

  if (loading) {
    return <div className="flex h-screen items-center justify-center">Cargando dashboard...</div>;
  }

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
              <h1 className="text-sm md:text-lg font-bold tracking-tight">Sahara VIS — Panel de Administración 2026</h1>
              <p className="text-[10px] md:text-xs opacity-80 uppercase tracking-widest font-semibold">Plan de Trabajo y Gestión</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-[var(--color-accent-red-200)] hover:bg-[var(--color-accent-red-100)] rounded-md text-sm font-bold transition-colors text-white"
            >
              <span className="hidden sm:inline-block">Cerrar sesión</span>
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-full mx-auto p-4 md:p-6 flex flex-col gap-6 min-h-0 overflow-auto lg:overflow-hidden">
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
          
          <button 
            onClick={() => setIsNewTaskOpen(true)}
            className="px-4 py-1.5 bg-[var(--color-accent-teal-200)] text-white rounded-md font-bold text-xs uppercase tracking-wider w-full md:w-auto whitespace-nowrap"
          >
            + Nueva Tarea
          </button>
        </div>

        {/* CONTENT GRID (Table + Mini Gantt) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0 lg:overflow-hidden">
          
          <div className="lg:col-span-8 bg-white rounded-lg shadow-sm border border-slate-200 flex flex-col h-[500px] lg:h-full lg:overflow-hidden">
            <TaskTable tasks={filteredTasks} onUpdateTask={handleUpdateTask} />
          </div>

          <div className="lg:col-span-4 flex flex-col gap-4 overflow-y-auto pr-2 pb-2 h-full min-h-0">
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 flex flex-col relative shrink-0">
              <Gantt tasks={filteredTasks} />
            </div>

            <div className="shrink-0 bg-[var(--color-brand-200)] text-[var(--color-brand-500)] p-4 rounded-lg shadow-sm flex items-center gap-3">
              <div className="w-8 h-8 rounded-full border-2 border-[var(--color-brand-500)] flex items-center justify-center font-black shrink-0">
                !
              </div>
              <div>
                <p className="text-xs font-black">Alerta de Cumplimiento</p>
                <p className="text-[10px] font-medium leading-none mt-1">3 tareas críticas vencen en los próximos 15 días.</p>
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* FOOTER */}
      <footer className="shrink-0 bg-slate-100 border-t border-slate-200 px-6 py-2 flex justify-between items-center text-[10px] font-medium text-slate-400 uppercase tracking-tighter mt-auto">
        <p>© 2026 Agrupación Sahara VIS — Gestión Administrativa v1.0.4</p>
        <p className="flex items-center gap-4 hidden sm:flex">
          <span className="text-slate-500">Servidor: <span className="text-green-600 font-bold">Online</span></span>
          <span className="text-slate-500">Última actualización: hace 4 minutos</span>
        </p>
      </footer>

      {/* New Task Drawer */}
      {isNewTaskOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white rounded-lg shadow-xl h-full max-h-[100vh] overflow-y-auto flex flex-col animate-in slide-in-from-right-8 duration-300 border border-slate-200">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between sticky top-0 bg-white z-10">
              <h3 className="text-sm font-black uppercase text-[var(--color-accent-teal-200)] tracking-widest">Nueva Tarea</h3>
              <button onClick={() => setIsNewTaskOpen(false)} className="p-2 text-slate-400 hover:text-slate-800 bg-slate-50 hover:bg-slate-100 rounded-full transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>
            
            <div className="p-6 flex-1 space-y-4">
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Actividad</label>
                <input 
                  type="text" 
                  value={newTaskForm.name || ''} 
                  onChange={e => setNewTaskForm({...newTaskForm, name: e.target.value})}
                  className="w-full border border-slate-200 rounded-md p-2 text-sm focus:border-[var(--color-accent-teal-200)] focus:ring-1 focus:ring-[var(--color-accent-teal-200)] outline-none"
                  placeholder="Ej. Mantenimiento general"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Frecuencia</label>
                <input 
                  type="text" 
                  value={newTaskForm.frequency || ''} 
                  onChange={e => setNewTaskForm({...newTaskForm, frequency: e.target.value})}
                  className="w-full border border-slate-200 rounded-md p-2 text-sm focus:border-[var(--color-accent-teal-200)] outline-none"
                  placeholder="Ej. Mensual"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Importancia</label>
                  <select 
                    value={newTaskForm.importance || 'Media'}
                    onChange={e => setNewTaskForm({...newTaskForm, importance: e.target.value as any})}
                    className="w-full border border-slate-200 rounded-md p-2 text-sm outline-none"
                  >
                    <option value="Alta">Alta</option>
                    <option value="Media">Media</option>
                    <option value="Baja">Baja</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Estado</label>
                  <select 
                    value={newTaskForm.status || 'Pendiente'}
                    onChange={e => setNewTaskForm({...newTaskForm, status: e.target.value as any})}
                    className="w-full border border-slate-200 rounded-md p-2 text-sm outline-none"
                  >
                    <option value="Pendiente">Pendiente</option>
                    <option value="En progreso">En progreso</option>
                    <option value="Completado">Completado</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Responsable</label>
                <input 
                  type="text" 
                  value={newTaskForm.responsible || ''} 
                  onChange={e => setNewTaskForm({...newTaskForm, responsible: e.target.value})}
                  className="w-full border border-slate-200 rounded-md p-2 text-sm outline-none"
                  placeholder="Ej. Administración"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Indicador de cumplimiento</label>
                <input 
                  type="text" 
                  value={newTaskForm.indicator || ''} 
                  onChange={e => setNewTaskForm({...newTaskForm, indicator: e.target.value})}
                  className="w-full border border-slate-200 rounded-md p-2 text-sm outline-none"
                  placeholder="Ej. Check lists"
                />
              </div>
            </div>

            <div className="p-6 border-t border-slate-200 bg-slate-50 flex justify-end gap-3 rounded-b-lg">
              <button 
                onClick={() => setIsNewTaskOpen(false)}
                className="px-4 py-2 bg-white border border-slate-300 text-slate-600 font-bold text-[10px] uppercase tracking-wider rounded-md hover:bg-slate-50"
              >
                Cancelar
              </button>
              <button 
                onClick={handleCreateTask}
                disabled={!newTaskForm.name}
                className="px-4 py-2 bg-[var(--color-accent-teal-200)] text-white font-bold text-[10px] uppercase tracking-wider rounded-md hover:bg-[#056064] flex items-center gap-2 disabled:opacity-50"
              >
                <Save className="h-3 w-3" />
                Crear Tarea
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

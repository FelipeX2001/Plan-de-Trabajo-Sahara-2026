import { useState } from 'react';
import { Task } from '../lib/api';
import { cn } from '../lib/utils';
import { Check, Edit2, FileUp, X, Save } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function TaskTable({ tasks, onUpdateTask, readOnly = false }: { tasks: Task[], onUpdateTask: (id: string, updates: Partial<Task>) => void, readOnly?: boolean }) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Task>>({});

  const startEdit = (task: Task) => {
    setEditingId(task.id);
    setEditForm(task);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const saveEdit = () => {
    if (editingId) {
      onUpdateTask(editingId, editForm);
      setEditingId(null);
    }
  };

  const toggleComplete = (task: Task) => {
    const isCompleted = task.status === 'Completado';
    onUpdateTask(task.id, {
      status: isCompleted ? 'Pendiente' : 'Completado',
      date: isCompleted ? null : new Date().toISOString()
    });
  };

  return (
    <div className="w-full h-full flex flex-col overflow-hidden">
      <div className="flex-grow overflow-auto relative">
        <table className="w-full text-left text-xs border-collapse">
        <thead className="bg-slate-50 sticky top-0 border-b border-slate-200">
          <tr>
            <th className="px-4 py-3 font-black text-slate-500 uppercase">Actividad</th>
            <th className="px-4 py-3 font-black text-slate-500 uppercase">Frecuencia</th>
            <th className="px-4 py-3 font-black text-slate-500 uppercase">Importancia</th>
            <th className="px-4 py-3 font-black text-slate-500 uppercase">Responsable</th>
            <th className="px-4 py-3 font-black text-slate-500 uppercase text-center">Estado</th>
            <th className="px-4 py-3 font-black text-slate-500 uppercase">Fecha</th>
            {!readOnly && <th className="px-4 py-3 font-black text-slate-500 uppercase">Acciones</th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {tasks.length === 0 ? (
            <tr>
              <td colSpan={7} className="text-center py-8 text-gray-500">
                No hay tareas que coincidan con la búsqueda.
              </td>
            </tr>
          ) : null}
          
          {tasks.map(task => {
            const isEditing = editingId === task.id;
            return (
              <tr key={task.id} className={cn("hover:bg-slate-50 transition-colors", task.status === 'Completado' && "bg-blue-50/20")}>
                {/* Actividad */}
                <td className="px-4 py-3 font-bold text-slate-800">
                  <div className="max-w-[200px] whitespace-normal">
                    {task.name}
                  </div>
                  {task.indicator && <div className="text-[10px] text-slate-500 mt-1 font-normal">Ind: {task.indicator}</div>}
                </td>
                
                {/* Frecuencia */}
                <td className="px-4 py-3 text-slate-500 italic">
                  {task.frequency}
                </td>
                
                {/* Importancia */}
                <td className="px-4 py-3 text-center">
                  <span className={cn(
                    "px-2 py-1 rounded-full font-bold text-[9px] uppercase tracking-tighter inline-block",
                    task.importance === 'Alta' ? "bg-red-100 text-red-700" :
                    task.importance === 'Media' ? "bg-orange-100 text-orange-700" :
                    "bg-blue-100 text-blue-700"
                  )}>
                    {task.importance}
                  </span>
                </td>
                
                {/* Responsable */}
                <td className="px-4 py-3 text-slate-600 font-medium">
                  {task.responsible}
                </td>
                
                {/* Estado */}
                <td className="px-4 py-3 text-center">
                  {task.status === 'Completado' ? (
                     <span className="text-[var(--color-accent-teal-100)] font-bold">✓ Completado</span>
                  ) : task.status === 'En progreso' ? (
                     <span className="flex items-center justify-center gap-1 text-[var(--color-brand-400)] font-bold">En progreso</span>
                  ) : (
                     <span className="text-slate-400 font-bold">Pendiente</span>
                  )}
                </td>
                
                {/* Fecha */}
                <td className="px-4 py-3 text-slate-500">
                  {task.date ? format(new Date(task.date), 'd MMM yyyy', { locale: es }) : '--/--/--'}
                </td>
                
                {/* Acciones */}
                {!readOnly && (
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button 
                        onClick={() => toggleComplete(task)}
                        title={task.status === 'Completado' ? 'Marcar pendiente' : 'Marcar completado'}
                        className={cn(
                          "p-1 transition-colors",
                          task.status === 'Completado' 
                            ? "text-[var(--color-accent-teal-100)] hover:text-[var(--color-accent-teal-200)]" 
                            : "text-slate-400 hover:text-[var(--color-brand-400)]"
                        )}
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      {!isEditing && (
                        <button 
                          onClick={() => startEdit(task)}
                          title="Editar"
                          className="p-1 text-slate-400 hover:text-[var(--color-accent-teal-200)] transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      )}
                      <button 
                        title="Adjuntar evidencia"
                        onClick={() => alert('Función de adjuntar archivo en desarrollo')}
                        className="text-[10px] text-blue-600 font-bold underline px-1"
                      >
                        Evidencia
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
      </div>

      {/* Drawer simple for edit notes and status */}
      {editingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-gray-900/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl h-full max-h-[100vh] overflow-y-auto flex flex-col animate-in slide-in-from-right-8 duration-300">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <h3 className="text-lg font-bold text-gray-900">Editar Tarea</h3>
              <button onClick={cancelEdit} className="p-2 text-gray-400 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 rounded-full transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-6 flex-1 space-y-5">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Nombre</label>
                <input 
                  type="text" 
                  value={editForm.name || ''} 
                  onChange={e => setEditForm({...editForm, name: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:border-[var(--color-brand-400)] focus:ring-1 focus:ring-[var(--color-brand-400)] outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Estado</label>
                  <select 
                    value={editForm.status || 'Pendiente'}
                    onChange={e => setEditForm({...editForm, status: e.target.value as any})}
                    className="w-full border border-gray-300 rounded-lg p-2.5 text-sm outline-none"
                  >
                    <option value="Pendiente">Pendiente</option>
                    <option value="En progreso">En progreso</option>
                    <option value="Completado">Completado</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Importancia</label>
                  <select 
                    value={editForm.importance || 'Media'}
                    onChange={e => setEditForm({...editForm, importance: e.target.value as any})}
                    className="w-full border border-gray-300 rounded-lg p-2.5 text-sm outline-none"
                  >
                    <option value="Alta">Alta</option>
                    <option value="Media">Media</option>
                    <option value="Baja">Baja</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Responsable</label>
                <input 
                  type="text" 
                  value={editForm.responsible || ''} 
                  onChange={e => setEditForm({...editForm, responsible: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg p-2.5 text-sm outline-none"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Observaciones</label>
                <textarea 
                  rows={4}
                  value={editForm.observations || ''} 
                  onChange={e => setEditForm({...editForm, observations: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg p-2.5 text-sm outline-none resize-none focus:border-[var(--color-brand-400)] focus:ring-1 focus:ring-[var(--color-brand-400)]"
                  placeholder="Añade notas de seguimiento aquí..."
                />
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 rounded-b-2xl">
              <button 
                onClick={cancelEdit}
                className="px-4 py-2 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button 
                onClick={saveEdit}
                className="px-4 py-2 bg-[var(--color-brand-400)] text-white font-medium rounded-lg hover:bg-[var(--color-brand-500)] flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                Guardar Cambios
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

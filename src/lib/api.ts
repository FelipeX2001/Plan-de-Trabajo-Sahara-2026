import { collection, doc, getDocs, setDoc, updateDoc, deleteDoc, query } from 'firebase/firestore';
import { db, auth } from './firebase';
import { GoogleAuthProvider, signInWithPopup, signOut, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';

export type Task = {
  id: string;
  name: string;
  frequency: string;
  importance: 'Alta' | 'Media' | 'Baja';
  responsible: string;
  indicator: string;
  status: 'Pendiente' | 'En progreso' | 'Completado';
  date: string | null;
  observations: string;
  createdAt?: string;
};

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

const INITIAL_TASKS: Omit<Task, 'id'>[] = [
  { name: 'Mantenimiento ascensores', frequency: 'Mensual', importance: 'Alta', responsible: 'Administración', indicator: '% cumplimiento', status: 'Pendiente', observations: '', date: null },
  { name: 'Certificación ascensores', frequency: 'Anual (Junio)', importance: 'Alta', responsible: 'Administración', indicator: 'Certificación obtenida', status: 'Pendiente', observations: '', date: null },
  { name: 'Mantenimiento planta eléctrica', frequency: 'Mensual', importance: 'Alta', responsible: 'Técnico', indicator: 'Registro mensual', status: 'Pendiente', observations: '', date: null },
  { name: 'Mantenimiento motobombas', frequency: 'Mensual', importance: 'Alta', responsible: 'Técnico', indicator: 'Checklist', status: 'Pendiente', observations: '', date: null },
  { name: 'Lavado de tanques', frequency: 'Cuatrimestral', importance: 'Alta', responsible: 'Proveedor', indicator: 'Ejecución', status: 'Pendiente', observations: '', date: null },
  { name: 'Fumigación', frequency: 'Cuatrimestral', importance: 'Alta', responsible: 'Proveedor', indicator: 'Certificado', status: 'Pendiente', observations: '', date: null },
  { name: 'Red contra incendios', frequency: 'Pendiente', importance: 'Alta', responsible: 'Administración', indicator: 'Certificación', status: 'Pendiente', observations: '', date: null },
  { name: 'Variadores y bombas', frequency: 'Pendiente', importance: 'Alta', responsible: 'Administración', indicator: 'Cotizaciones', status: 'Pendiente', observations: '', date: null },
  { name: 'Planta eléctrica (automático)', frequency: 'Pendiente', importance: 'Media', responsible: 'Administración', indicator: 'Diagnóstico', status: 'Pendiente', observations: '', date: null },
  { name: 'Cerramiento piscina', frequency: 'Única', importance: 'Media', responsible: 'Administración', indicator: 'Ejecución', status: 'Pendiente', observations: '', date: null },
  { name: 'Parasoles piscina', frequency: 'Única', importance: 'Media', responsible: 'Administración', indicator: 'Instalación', status: 'Pendiente', observations: '', date: null },
  { name: 'Reflectores planta eléctrica', frequency: 'Próximo', importance: 'Media', responsible: 'Administración', indicator: 'Instalación', status: 'Pendiente', observations: '', date: null },
  { name: 'Manual de convivencia', frequency: 'Única', importance: 'Baja', responsible: 'Administración', indicator: 'Documento aprobado', status: 'Pendiente', observations: '', date: null },
  { name: 'Manuales internos', frequency: 'Única', importance: 'Baja', responsible: 'Administración', indicator: 'Documentos elaborados', status: 'Pendiente', observations: '', date: null },
];

export const api = {
  login: async (email?: string, password?: string) => {
    if (email !== 'sahara.marcela@gmail.com' || password !== 'Sahara$2026$') {
      throw new Error('Credenciales incorrectas');
    }
    
    // Simulating login
    return { user: 'admin-mode' };
  },
  logout: async () => {
    await signOut(auth);
  },
  getTasks: async (): Promise<Task[]> => {
    try {
      const q = query(collection(db, 'tasks'));
      const snapshot = await getDocs(q);
      const tasks = snapshot.docs.map(doc => {
        const data = doc.data();
        let needsUpdate = false;
        
        if (data.frequency && data.frequency.toLowerCase().includes('menstru')) {
          data.frequency = 'Mensual';
          needsUpdate = true;
        }

        if (data.name && data.name.toLowerCase().includes('reflectores') && data.status !== 'Completado') {
          data.status = 'Completado';
          needsUpdate = true;
        }

        if (needsUpdate) {
          updateDoc(doc.ref, { frequency: data.frequency, status: data.status }).catch(console.error);
        }

        return { id: doc.id, ...data } as Task;
      });
      
      if (tasks.length === 0) {
        // Seed initial tasks if db is empty
        if (auth.currentUser) {
          for (const t of INITIAL_TASKS) {
              await api.createTask(t);
          }
          const newSnapshot = await getDocs(q);
          return newSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Task));
        } else {
          return INITIAL_TASKS.map((t, idx) => ({ id: `temp-${idx}`, ...t } as Task));
        }
      }

      return tasks;
    } catch (e) {
      handleFirestoreError(e, OperationType.LIST, 'tasks');
      return [];
    }
  },
  updateTask: async (id: string, task: Partial<Task>): Promise<Task> => {
    try {
      const docRef = doc(db, 'tasks', id);
      await updateDoc(docRef, task);
      return { id, ...task } as Task;
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `tasks/${id}`);
      throw error;
    }
  },
  createTask: async (task: Omit<Task, 'id'>): Promise<Task> => {
    try {
      const newDocRef = doc(collection(db, 'tasks'));
      const taskWithDates = {
        ...task,
        createdAt: new Date().toISOString(),
      };
      await setDoc(newDocRef, taskWithDates);
      return { id: newDocRef.id, ...taskWithDates } as Task;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'tasks');
      throw error;
    }
  }
};

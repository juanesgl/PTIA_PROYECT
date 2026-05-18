import React, { useState } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router';
import { 
  BrainCircuit, 
  ChevronRight, 
  Clock, 
  LayoutDashboard, 
  LineChart, 
  Map, 
  Settings, 
  User,
  X
} from 'lucide-react';
import { toast } from 'sonner';

export type ClassItem = {
  id: number;
  day: number;
  hour: string;
  name: string;
  room: string;
  color: string;
  borderColor: string;
  textColor: string;
  lightText: string;
};

export type AppContextType = {
  classes: ClassItem[];
  addClass: (newClass: Omit<ClassItem, 'id'>) => void;
  removeClass: (id: number) => void;
  setClasses: React.Dispatch<React.SetStateAction<ClassItem[]>>;
};

export function Layout() {
  const location = useLocation();

  const [classes, setClasses] = useState<ClassItem[]>([]);
  
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [userName, setUserName] = useState('Estudiante Demo');
  const [userCareer, setUserCareer] = useState('Ingeniería de Software');

  const addClass = (newClass: Omit<ClassItem, 'id'>) => {
    setClasses(prev => [...prev, { ...newClass, id: Date.now() }]);
  };

  const removeClass = (id: number) => {
    setClasses(prev => prev.filter(c => c.id !== id));
  };
  
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSettingsOpen(false);
    toast.success('Configuración guardada exitosamente.');
  };

  return (
    <div className="flex h-screen w-full bg-slate-50 text-slate-900 font-sans">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col hidden md:flex">
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center gap-2 text-indigo-600 font-bold text-xl">
            <BrainCircuit size={24} />
            <span>AcademicFlow</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">Planificador Inteligente</p>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <NavItem to="/" icon={<LayoutDashboard size={18} />} label="Dashboard" />
          <NavItem to="/mapa" icon={<Map size={18} />} label="Mapa Curricular" />
          <NavItem to="/horario" icon={<Clock size={18} />} label="Horario" />
          <NavItem to="/progreso" icon={<LineChart size={18} />} label="Progreso" />
          
          <div className="pt-6 pb-2 pl-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Recomendaciones IA
          </div>
          <div className="bg-indigo-50/50 rounded-lg p-3 border border-indigo-100 mb-4">
            <div className="flex items-start gap-3">
              <div className="bg-indigo-100 p-1.5 rounded text-indigo-600 mt-0.5">
                <BrainCircuit size={16} />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-indigo-900">Ruta Crítica</h4>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  El sistema detectará automáticamente las materias cuello de botella en tu mapa curricular basadas en tus créditos.
                </p>
              </div>
            </div>
          </div>
        </nav>

        <div className="p-4 border-t border-slate-100">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-500">
              <User size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 truncate">{userName}</p>
              <p className="text-xs text-slate-500 truncate">{userCareer}</p>
            </div>
            <button onClick={() => setIsSettingsOpen(true)} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors">
              <Settings size={18} className="text-slate-400 cursor-pointer hover:text-slate-600" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-h-0 overflow-hidden relative">
        <Outlet context={{ classes, addClass, removeClass, setClasses } satisfies AppContextType} />
      </main>

      {/* Settings Modal */}
      {isSettingsOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Settings size={20} />
                Configuración del Estudiante
              </h2>
              <button 
                onClick={() => setIsSettingsOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSaveSettings} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nombre</label>
                <input 
                  required
                  type="text" 
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Carrera / Especialidad</label>
                <input 
                  required
                  type="text" 
                  value={userCareer}
                  onChange={(e) => setUserCareer(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button 
                  type="button"
                  onClick={() => setIsSettingsOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg text-sm font-medium transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
                >
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function NavItem({ icon, label, to }: { icon: React.ReactNode, label: string, to: string }) {
  return (
    <NavLink 
      to={to} 
      className={({ isActive }) => 
        `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
          isActive 
            ? 'bg-indigo-50 text-indigo-600' 
            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
        }`
      }
    >
      {({ isActive }) => (
        <>
          {icon}
          <span>{label}</span>
          {isActive && <ChevronRight size={14} className="ml-auto opacity-50" />}
        </>
      )}
    </NavLink>
  );
}

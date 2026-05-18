import React, { useEffect, useState } from 'react';
import { LayoutDashboard, AlertCircle, Loader2 } from 'lucide-react';
import { CurriculumService, PlanningService } from '../../utils/api';
import { useStudent } from '../context/StudentContext';

export function Dashboard() {
  const { studentId } = useStudent();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalCourses: 0,
    completedCourses: 0,
    criticalCourseName: ''
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const graph = await CurriculumService.getGraph();
        const available = await PlanningService.getAvailableCourses(studentId);
        const critical = await PlanningService.getCriticalPath(studentId);
        
        let highestDepth = 0;
        let criticalNodeId = '';
        if (critical && critical.critical_paths) {
            for (const [nodeId, depth] of Object.entries(critical.critical_paths)) {
                if (depth > highestDepth) {
                    highestDepth = depth;
                    criticalNodeId = nodeId;
                }
            }
        }
        
        const criticalNode = graph.nodes.find(n => n.id === criticalNodeId);

        // Simple mockup estimation logic based on available courses
        const completedEstimate = Math.max(0, graph.nodes.length - available.length - 1); 

        setStats({
          totalCourses: graph.nodes.length,
          completedCourses: completedEstimate, // Using a basic heuristic since we don't have a direct history endpoint in frontend yet
          criticalCourseName: criticalNode ? criticalNode.name : 'Ninguna actualmente'
        });
      } catch (error) {
        console.error("Error cargando dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [studentId]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="animate-spin text-indigo-500" size={32} />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col p-6 overflow-y-auto">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
        <p className="text-sm text-slate-500">Resumen de tu progreso académico</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-sm font-medium text-slate-500 mb-1">Materias Completadas</h3>
          <p className="text-3xl font-bold text-slate-800">{stats.completedCourses}<span className="text-sm font-normal text-slate-400"> / {stats.totalCourses}</span></p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-sm font-medium text-slate-500 mb-1">Promedio Actual</h3>
          <p className="text-3xl font-bold text-slate-800">9.0</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-sm font-medium text-slate-500 mb-1">Semestres Restantes (Est.)</h3>
          <p className="text-3xl font-bold text-slate-800">{Math.ceil((stats.totalCourses - stats.completedCourses) / 5)}</p>
        </div>
      </div>

      {stats.criticalCourseName !== 'Ninguna actualmente' && (
        <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-5 mb-6 flex items-start gap-4">
          <AlertCircle className="text-indigo-600 mt-1 shrink-0" />
          <div>
            <h3 className="font-semibold text-indigo-900">Alerta de Ruta Crítica</h3>
            <p className="text-sm text-indigo-700 mt-1">
              Estás a punto de atrasarte en <strong>{stats.criticalCourseName}</strong>. Recomendamos inscribir esta materia el próximo semestre para no afectar tu fecha de graduación estimada.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

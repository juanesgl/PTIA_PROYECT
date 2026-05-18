import React, { useEffect, useState } from 'react';
import { Target, TrendingUp, Award, Activity, Sparkles, Loader2 } from 'lucide-react';
import { CurriculumService, PlanningService } from '../../utils/api';
import { useStudent } from '../context/StudentContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function Dashboard() {
  const { studentId } = useStudent();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalCredits: 0,
    completedCredits: 0,
    gpa: '0.0',
    semestersLeft: 0,
    currentPace: 0,
    chartData: [] as any[]
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const graph = await CurriculumService.getGraph();
        const historyData = await PlanningService.getHistory(studentId).catch(() => ([]));
        const gpaData = await PlanningService.getGpa(studentId).catch(() => ({ gpa: 4.5 }));
        
        const historySet = new Set(historyData);
        
        let completedCredits = 0;
        let totalCredits = 0;
        
        graph.nodes.forEach(n => {
            totalCredits += n.credits;
            if (historySet.has(n.id)) {
                completedCredits += n.credits;
            }
        });

        // Mock data for the chart to match the Figma look, but adapted to 5.0 GPA and max 18 credits
        const mockChartData = [
          { name: 'Semestre 1', credits: 16, gpa: 4.1 },
          { name: 'Semestre 2', credits: 18, gpa: 4.2 },
          { name: 'Semestre 3', credits: 17, gpa: 4.1 },
          { name: 'Semestre 4', credits: 18, gpa: 4.0 },
          { name: 'Semestre 5', credits: 15, gpa: 4.2 },
        ];

        setStats({
          totalCredits,
          completedCredits,
          gpa: gpaData.gpa.toFixed(1),
          semestersLeft: Math.ceil((totalCredits - completedCredits) / 18),
          currentPace: 18, // adapted pace
          chartData: mockChartData
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
    <div className="flex-1 flex flex-col p-6 overflow-y-auto bg-slate-50/50">
      <header className="mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Tu Progreso</h1>
            <p className="text-sm text-slate-500">Historial y proyecciones basadas en tu desempeño</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm">
            <Activity size={16} />
            <span>Analizar Datos</span>
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
             <Target size={24} />
          </div>
          <div>
            <h3 className="text-sm font-medium text-slate-500">Créditos Aprobados</h3>
            <p className="text-2xl font-bold text-slate-800">{stats.completedCredits} <span className="text-sm font-normal text-slate-400">/ {stats.totalCredits}</span></p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
             <TrendingUp size={24} />
          </div>
          <div>
            <h3 className="text-sm font-medium text-slate-500">Promedio General</h3>
            <p className="text-2xl font-bold text-slate-800">{stats.gpa} <span className="text-sm font-normal text-slate-400">/ 5.0</span></p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600 shrink-0">
             <Award size={24} />
          </div>
          <div>
            <h3 className="text-sm font-medium text-slate-500">Semestres Restantes</h3>
            <p className="text-2xl font-bold text-slate-800">{stats.semestersLeft} <span className="text-sm font-normal text-slate-400">est.</span></p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
             <Activity size={24} />
          </div>
          <div>
            <h3 className="text-sm font-medium text-slate-500">Ritmo Actual</h3>
            <p className="text-2xl font-bold text-slate-800">{stats.currentPace} <span className="text-sm font-normal text-slate-400">créditos/sem</span></p>
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6 shadow-sm">
        <h3 className="text-sm font-medium text-slate-700 mb-6">Evolución de Créditos y Promedio</h3>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={stats.chartData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dy={10} />
              <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} domain={[0, 20]} ticks={[0, 5, 10, 15, 20]} />
              <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} domain={[0, 5]} ticks={[0, 1.25, 2.5, 3.75, 5]} />
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Line yAxisId="left" type="monotone" dataKey="credits" stroke="#6366f1" strokeWidth={3} dot={{ fill: '#fff', stroke: '#6366f1', strokeWidth: 2, r: 4 }} activeDot={{ r: 6 }} name="Créditos" />
              <Line yAxisId="right" type="monotone" dataKey="gpa" stroke="#10b981" strokeWidth={3} dot={{ fill: '#fff', stroke: '#10b981', strokeWidth: 2, r: 4 }} activeDot={{ r: 6 }} name="Promedio" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-indigo-50/80 border border-indigo-100 rounded-xl p-6 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-indigo-600 shrink-0 shadow-sm border border-indigo-50">
            <Sparkles size={20} />
          </div>
          <div className="flex-1">
            <h3 className="text-base font-semibold text-slate-800 mb-2">Insight de IA</h3>
            <p className="text-sm text-slate-600 leading-relaxed mb-4">
              Tu rendimiento ha mejorado consistentemente. Sin embargo, este semestre cursaste menos créditos (15). Si mantienes este ritmo, te tomará <strong>1 semestre adicional</strong> graduarte. Recomendamos tomar entre 18-20 créditos los próximos semestres para nivelarte de manera óptima sin comprometer tu promedio.
            </p>
            <button className="px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-indigo-600 text-sm font-medium rounded-lg transition-colors shadow-sm">
              Ajustar Plan de Estudio
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

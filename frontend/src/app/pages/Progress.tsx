import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Target, TrendingUp, Award, Activity, Sparkles, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useStudent } from '../context/StudentContext';
import { PlanningService, CurriculumService } from '../../utils/api';

const initialData = [
  { name: 'Semestre 1', creditos: 20, promedio: 8.2 },
  { name: 'Semestre 2', creditos: 25, promedio: 8.5 },
  { name: 'Semestre 3', creditos: 22, promedio: 8.8 },
  { name: 'Semestre 4', creditos: 28, promedio: 8.7 },
  { name: 'Semestre 5', creditos: 15, promedio: 9.1 }, // Current
];

const projectedData = [
  ...initialData,
  { name: 'Semestre 6 (Proy)', creditos: 25, promedio: 9.2 },
  { name: 'Semestre 7 (Proy)', creditos: 22, promedio: 9.3 }
];

export function Progress() {
  const { studentId } = useStudent();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [hasAnalyzed, setHasAnalyzed] = useState(false);
  const [chartData, setChartData] = useState(initialData);
  const [availableCourses, setAvailableCourses] = useState<string[]>([]);

  const handleAnalyzeData = async () => {
    setIsAnalyzing(true);
    
    try {
      const courses = await PlanningService.getAvailableCourses(studentId);
      const graph = await CurriculumService.getGraph();
      const courseMap = new Map(graph.nodes.map(n => [n.id, n.name]));
      
      setAvailableCourses(courses.map(c => courseMap.get(c) || c));
      
      setHasAnalyzed(true);
      setChartData(projectedData);
      toast.success(`Análisis completado. Tienes ${courses.length} materias desbloqueadas.`);
    } catch (error) {
      console.error(error);
      toast.error('Error al analizar los datos.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-y-auto bg-slate-50 p-6">
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Tu Progreso</h1>
          <p className="text-sm text-slate-500">Historial y proyecciones basadas en tu desempeño</p>
        </div>
        <button 
          onClick={handleAnalyzeData}
          disabled={isAnalyzing || hasAnalyzed}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors shadow-sm flex items-center gap-2 ${
            hasAnalyzed 
              ? 'bg-emerald-100 text-emerald-700 cursor-default'
              : isAnalyzing 
                ? 'bg-indigo-400 text-white cursor-wait'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white'
          }`}
        >
          {isAnalyzing ? (
            <Loader2 size={16} className="animate-spin" />
          ) : hasAnalyzed ? (
            <Sparkles size={16} />
          ) : (
            <Activity size={16} />
          )}
          <span>{isAnalyzing ? 'Analizando...' : hasAnalyzed ? 'Datos Analizados' : 'Analizar Datos'}</span>
        </button>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          { icon: Target, label: 'Créditos Aprobados', value: '110', suffix: '/ 240', color: 'text-indigo-600', bg: 'bg-indigo-100' },
          { icon: TrendingUp, label: 'Promedio General', value: '8.6', suffix: '/ 10', color: 'text-emerald-600', bg: 'bg-emerald-100' },
          { icon: Award, label: 'Materias de Especialidad', value: '3', suffix: '/ 12', color: 'text-amber-600', bg: 'bg-amber-100' },
          { icon: Activity, label: 'Ritmo Actual', value: '25', suffix: 'créditos/sem', color: 'text-blue-600', bg: 'bg-blue-100' },
        ].map((stat, i) => (
          <div key={i} className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex items-center gap-4">
            <div className={`p-3 rounded-lg ${stat.bg} ${stat.color}`}>
              <stat.icon size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">{stat.label}</p>
              <p className="text-2xl font-bold text-slate-800">
                {stat.value}
                <span className="text-sm font-normal text-slate-400 ml-1">{stat.suffix}</span>
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Chart Section */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm mb-8">
        <h3 className="text-lg font-semibold text-slate-800 mb-6">Evolución de Créditos y Promedio</h3>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%" id="rc-progress">
            <LineChart data={chartData} id="progress-chart">
              <CartesianGrid key="grid" strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" id="grid" />
              <XAxis key="x-axis" dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} id="x-axis" />
              <YAxis key="y-axis-left" yAxisId="left" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} id="y-axis-left" />
              <YAxis key="y-axis-right" yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} id="y-axis-right" />
              <Tooltip 
                key="tooltip"
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Line key="line-left" yAxisId="left" type="monotone" dataKey="creditos" stroke="#6366f1" strokeWidth={3} dot={{r: 4}} activeDot={{r: 6}} name="Créditos" id="line-left" />
              <Line key="line-right" yAxisId="right" type="monotone" dataKey="promedio" stroke="#10b981" strokeWidth={3} dot={{r: 4}} activeDot={{r: 6}} name="Promedio" id="line-right" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Insights */}
      <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-6 flex flex-col sm:flex-row items-start gap-6">
        <div className="p-3 bg-white rounded-full shadow-sm shrink-0">
          <TrendingUp className="text-indigo-600" size={24} />
        </div>
        <div>
          <h3 className="text-lg font-bold text-indigo-900 mb-2">Insight de IA</h3>
          <p className="text-indigo-800 leading-relaxed mb-4">
            Tu rendimiento ha mejorado consistentemente. Sin embargo, este semestre cursaste menos créditos (15). Si mantienes este ritmo, te tomará <strong>1 semestre adicional</strong> graduarte. Recomendamos tomar entre 22-25 créditos los próximos semestres para nivelarte de manera óptima sin comprometer tu promedio.
          </p>
          {hasAnalyzed && availableCourses.length > 0 && (
            <div className="mt-4 p-4 bg-white rounded-lg border border-indigo-100">
              <h4 className="font-semibold text-indigo-900 mb-2">Materias Desbloqueadas ({availableCourses.length})</h4>
              <ul className="list-disc pl-5 text-sm text-indigo-800 space-y-1">
                {availableCourses.map((course, idx) => (
                  <li key={idx}>{course}</li>
                ))}
              </ul>
            </div>
          )}
          <button className="mt-4 px-4 py-2 bg-white text-indigo-700 font-medium rounded-lg text-sm border border-indigo-200 hover:bg-indigo-50 transition-colors shadow-sm">
            Ajustar Plan de Estudio
          </button>
        </div>
      </div>
    </div>
  );
}

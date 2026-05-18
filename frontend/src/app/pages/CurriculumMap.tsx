import React, { useState, useCallback, useEffect } from 'react';
import { useOutletContext } from 'react-router';
import { AppContextType } from '../components/Layout';
import { GraphView } from '../components/GraphView';
import { 
  BookOpen, 
  Clock, 
  GraduationCap, 
  LineChart,
  Plus,
  X
} from 'lucide-react';
import { toast } from 'sonner';
import { Node, Edge, MarkerType, useNodesState, useEdgesState, addEdge as rfAddEdge, Connection } from 'reactflow';
import dagre from 'dagre';
import { CurriculumService, PlanningService } from '../../utils/api';
import { useStudent } from '../context/StudentContext';

type SubjectDetails = {
  id: string;
  name: string;
  priority: string;
  description: string;
  hours: number;
  difficulty: string;
  insight: string;
  colorTheme: {
    bg: string;
    border: string;
    text: string;
    lightText: string;
  };
};

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

const getLayoutedElements = (nodes: Node[], edges: Edge[], direction = 'TB') => {
  dagreGraph.setGraph({ rankdir: direction, nodesep: 60, ranksep: 100 });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: 200, height: 60 });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  nodes.forEach((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    node.targetPosition = 'top' as any;
    node.sourcePosition = 'bottom' as any;

    node.position = {
      x: nodeWithPosition.x - 200 / 2,
      y: nodeWithPosition.y - 60 / 2,
    };

    return node;
  });

  return { nodes, edges };
};

export function CurriculumMap() {
  const { studentId } = useStudent();
  const [subjectsDetails, setSubjectsDetails] = useState<Record<string, SubjectDetails>>({});
  const [selectedSubject, setSelectedSubject] = useState<SubjectDetails | null>(null);
  const { classes, addClass } = useOutletContext<AppContextType>();
  
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [newName, setNewName] = useState('');
  const [newPriority, setNewPriority] = useState('Normal');
  const [newHours, setNewHours] = useState(4);
  const [newDifficulty, setNewDifficulty] = useState('Media');
  const [newDescription, setNewDescription] = useState('');

  const loadGraph = useCallback(async () => {
    try {
      const graphData = await CurriculumService.getGraph();
      const criticalPathData = await PlanningService.getCriticalPath(studentId).catch(() => ({ critical_paths: {} }));
      const historyData = await PlanningService.getHistory(studentId).catch(() => ([]));
      
      const depths = criticalPathData.critical_paths || {};
      const completedSet = new Set(historyData);
      
      const depthValues = Object.values(depths) as number[];
      const maxDepth = depthValues.length > 0 ? Math.max(...depthValues) : 0;
      
      // Calculate full critical path
      const criticalPathNodes = new Set<string>();
      if (maxDepth > 0) {
        let currentNodes = graphData.nodes.filter(n => depths[n.id] === maxDepth).map(n => n.id);
        while (currentNodes.length > 0) {
           currentNodes.forEach(id => criticalPathNodes.add(id));
           const currentDepth = depths[currentNodes[0]];
           const nextNodes = new Set<string>();
           graphData.edges.forEach(e => {
             if (currentNodes.includes(e.source) && depths[e.target] === currentDepth - 1) {
                nextNodes.add(e.target);
             }
           });
           currentNodes = Array.from(nextNodes);
        }
      }

      const newNodes: Node[] = graphData.nodes.map(n => {
        const isCompleted = completedSet.has(n.id);
        const isCritical = criticalPathNodes.has(n.id);
        
        let bg = '#fff';
        let border = '1px solid #777';
        let priority = 'Pendiente';

        if (isCompleted) {
          bg = '#dcfce7'; // green-100
          border = '2px solid #22c55e'; // green-500
          priority = 'Completado';
        } else if (isCritical) {
          bg = '#e0e7ff'; // indigo-100
          border = '2px solid #6366f1'; // indigo-500
          priority = 'Ruta Crítica';
        }

        return {
          id: n.id,
          data: { label: n.name, id: n.id },
          position: { x: 0, y: 0 },
          style: { background: bg, border, width: 180, borderRadius: '8px', padding: '10px' }
        };
      });

      const newEdges: Edge[] = graphData.edges.map(e => {
        const isCritical = criticalPathNodes.has(e.source) && criticalPathNodes.has(e.target) && depths[e.source] === (depths[e.target] || 0) + 1;
        return {
          id: `e${e.source}-${e.target}`,
          source: e.source,
          target: e.target,
          markerEnd: { type: MarkerType.ArrowClosed, color: isCritical ? '#6366f1' : '#b1b1b7' },
          animated: isCritical,
          style: isCritical ? { stroke: '#6366f1', strokeWidth: 2, strokeDasharray: '5 5' } : { stroke: '#b1b1b7', strokeWidth: 1.5 }
        };
      });

      const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(newNodes, newEdges);
      setNodes(layoutedNodes);
      setEdges(layoutedEdges);

      const detailsDict: Record<string, SubjectDetails> = {};
      graphData.nodes.forEach(n => {
        const isCompleted = completedSet.has(n.id);
        const isCritical = criticalPathNodes.has(n.id);
        let priority = 'Pendiente';
        let colorTheme = { bg: 'bg-slate-100', border: 'border-slate-500', text: 'text-slate-900', lightText: 'text-slate-700' };

        if (isCompleted) {
          priority = 'Completado';
          colorTheme = { bg: 'bg-green-100', border: 'border-green-500', text: 'text-green-900', lightText: 'text-green-700' };
        } else if (isCritical) {
          priority = 'Ruta Crítica';
          colorTheme = { bg: 'bg-indigo-100', border: 'border-indigo-500', text: 'text-indigo-900', lightText: 'text-indigo-700' };
        }

        detailsDict[n.id] = {
          id: n.id,
          name: n.name,
          priority,
          description: `Créditos: ${n.credits}. Semestre sugerido: ${n.suggested_semester}`,
          hours: n.credits * 2,
          difficulty: 'Media',
          insight: 'Materia oficial del pensum.',
          colorTheme
        };
      });

      setSubjectsDetails(detailsDict);
      if (graphData.nodes.length > 0) {
        setSelectedSubject(detailsDict[graphData.nodes[0].id]);
      }

    } catch (error) {
      console.error("Error loading graph:", error);
      toast.error("Error cargando la malla curricular.");
    }
  }, [studentId, setNodes, setEdges]);

  useEffect(() => {
    loadGraph();
  }, [loadGraph]);
  
  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => rfAddEdge(params, eds)),
    [setEdges],
  );

  const isSubjectAdded = selectedSubject ? classes.some(c => c.name === selectedSubject.name) : false;

  const handleNodeClick = (id: string, label: string) => {
    const details = subjectsDetails[id] || {
      id,
      name: label,
      priority: 'Normal',
      description: 'Materia del plan de estudios.',
      hours: 4,
      difficulty: 'Media',
      insight: 'Materia ingresada por el usuario.',
      colorTheme: { bg: 'bg-slate-100', border: 'border-slate-500', text: 'text-slate-900', lightText: 'text-slate-700' }
    };
    setSelectedSubject(details);
  };

  const handleToggleHistory = async () => {
    if (!selectedSubject) return;
    try {
      await PlanningService.toggleHistory(studentId, selectedSubject.id);
      toast.success(`Estado de "${selectedSubject.name}" actualizado.`);
      loadGraph(); // Recargar el grafo para actualizar colores
    } catch (error) {
      toast.error('Error al actualizar historial');
    }
  };

  const handleAddPlan = () => {
    if (!selectedSubject) return;
    if (isSubjectAdded) {
      toast.info(`${selectedSubject.name} ya está en tu horario.`);
      return;
    }
    
    const randomDay = Math.floor(Math.random() * 5);
    const hoursList = ['08:00', '10:00', '12:00', '14:00', '16:00'];
    const randomHour = hoursList[Math.floor(Math.random() * hoursList.length)];

    addClass({
      day: randomDay,
      hour: randomHour,
      name: selectedSubject.name,
      room: 'Por asignar',
      color: selectedSubject.colorTheme.bg,
      borderColor: selectedSubject.colorTheme.border,
      textColor: selectedSubject.colorTheme.text,
      lightText: selectedSubject.colorTheme.lightText
    });
    
    const days = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes'];
    toast.success(`${selectedSubject.name} agregada a tu horario los ${days[randomDay]} a las ${randomHour}.`);
  };

  const handleCreateSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const newId = `custom_${Date.now()}`;
    const newSubjectData: SubjectDetails = {
      id: newId,
      name: newName,
      priority: newPriority,
      description: newDescription || 'Materia personalizada.',
      hours: newHours,
      difficulty: newDifficulty,
      insight: 'Creada por el usuario. Sin datos históricos aún.',
      colorTheme: { bg: 'bg-blue-100', border: 'border-blue-500', text: 'text-blue-900', lightText: 'text-blue-700' }
    };

    setSubjectsDetails(prev => ({ ...prev, [newId]: newSubjectData }));

    const newNode: Node = {
      id: newId,
      position: { x: Math.random() * 400 + 50, y: Math.random() * 400 + 50 },
      data: { label: newName, id: newId },
      style: { background: '#dbeafe', border: '1px solid #3b82f6', width: 180 }
    };

    setNodes((nds) => [...nds, newNode]);
    setSelectedSubject(newSubjectData);
    setIsModalOpen(false);
    toast.success(`${newName} añadida al mapa curricular.`);
    
    setNewName('');
    setNewDescription('');
    setNewHours(4);
    setNewDifficulty('Media');
    setNewPriority('Normal');
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden h-full">
      <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0">
        <h1 className="text-lg font-semibold text-slate-800">Mapa de Prerrequisitos (DAG)</h1>
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-700 rounded-full text-sm font-medium border border-green-100">
            <GraduationCap size={16} />
            <span>Estimado: 3.5 Años</span>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-3 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-sm font-medium rounded-lg transition-colors shadow-sm"
          >
            <Plus size={16} />
            Crear Materia
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden relative">
        <div className="flex-1 relative bg-slate-50 w-full h-full">
          <GraphView 
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={handleNodeClick} 
          />
          
          <div className="absolute top-4 left-4 bg-white/90 backdrop-blur shadow-sm border border-slate-200 rounded-lg p-3 text-xs z-10 pointer-events-none">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-3 h-3 rounded-full bg-green-200 border border-green-500"></div>
              <span>Completado</span>
            </div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-3 h-3 rounded-full bg-indigo-100 border border-indigo-500"></div>
              <span>Ruta Crítica</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-slate-100 border border-slate-400"></div>
              <span>Pendiente</span>
            </div>
          </div>
        </div>

        <div className="w-80 bg-white border-l border-slate-200 flex flex-col overflow-y-auto shrink-0 z-20 shadow-xl">
          <div className="p-5 border-b border-slate-100">
            <h2 className="text-lg font-bold text-slate-800 mb-1">Detalle de Materia</h2>
            <p className="text-sm text-slate-500">Selecciona para ver información</p>
          </div>

          {selectedSubject ? (
            <div className="p-5 space-y-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-slate-700">{selectedSubject.name}</h3>
                  <span className={`px-2 py-0.5 ${selectedSubject.colorTheme.bg} ${selectedSubject.colorTheme.text} text-xs font-bold rounded`}>{selectedSubject.priority}</span>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {selectedSubject.description}
                </p>
                <div className="bg-slate-50 rounded p-3 border border-slate-100 mt-2">
                  <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
                    <Clock size={14} />
                    <span>Carga horaria: {selectedSubject.hours}h/semana</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <BookOpen size={14} />
                    <span>Dificultad: {selectedSubject.difficulty}</span>
                  </div>
                </div>
              </div>

              <div className="h-px bg-slate-100" />

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-amber-600 font-medium text-sm">
                  <LineChart size={16} />
                  <span>Contexto e Insights</span>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed italic">
                  {selectedSubject.insight}
                </p>
              </div>

              <div className="h-px bg-slate-100" />

              <div className={`${selectedSubject.colorTheme.bg} rounded-lg p-4 border ${selectedSubject.colorTheme.border}`}>
                <h4 className={`font-semibold ${selectedSubject.colorTheme.text} text-sm mb-2`}>Acción recomendada</h4>
                <p className={`text-xs ${selectedSubject.colorTheme.lightText} mb-3`}>
                  Gestiona esta materia en tu plan de horario.
                </p>
                <button 
                  className={`w-full py-2 ${isSubjectAdded ? 'bg-slate-300 text-slate-600 cursor-not-allowed' : 'bg-indigo-600 text-white hover:bg-indigo-700'} rounded text-sm font-medium transition mb-2`}
                  onClick={handleAddPlan}
                  disabled={isSubjectAdded}
                >
                  {isSubjectAdded ? 'En tu plan de estudio' : 'Agregar al Plan'}
                </button>
                <button 
                  className={`w-full py-2 bg-white text-indigo-700 border border-indigo-200 hover:bg-indigo-50 rounded text-sm font-medium transition`}
                  onClick={handleToggleHistory}
                >
                  {selectedSubject.priority === 'Completado' ? 'Marcar como Pendiente' : 'Marcar como Completada'}
                </button>
              </div>
            </div>
          ) : (
             <div className="p-5 text-sm text-slate-500">Haz clic en un nodo para ver sus detalles.</div>
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-800">Nueva Materia Personalizada</h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleCreateSubject} className="p-5 overflow-y-auto space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nombre de la materia</label>
                <input 
                  required
                  type="text" 
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Ej. Diseño de Interfaces"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Descripción / Insights</label>
                <textarea 
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Pequeña descripción sobre por qué agregas esta materia..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm resize-none h-20"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Horas por semana</label>
                  <input 
                    required
                    type="number" 
                    min="1"
                    max="20"
                    value={newHours}
                    onChange={(e) => setNewHours(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Dificultad</label>
                  <select 
                    value={newDifficulty}
                    onChange={(e) => setNewDifficulty(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm"
                  >
                    <option value="Baja">Baja</option>
                    <option value="Media">Media</option>
                    <option value="Alta">Alta</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Prioridad (Etiqueta)</label>
                <select 
                  value={newPriority}
                  onChange={(e) => setNewPriority(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm"
                >
                  <option value="Opcional">Opcional</option>
                  <option value="Normal">Normal</option>
                  <option value="Alta Prioridad">Alta Prioridad</option>
                </select>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg text-sm font-medium transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
                >
                  Crear Materia
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

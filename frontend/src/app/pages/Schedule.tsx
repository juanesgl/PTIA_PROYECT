import React, { useState } from 'react';
import { useOutletContext } from 'react-router';
import { AppContextType } from '../components/Layout';
import { Clock, Calendar as CalendarIcon, Plus, X, Sparkles, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { PlanningService, CurriculumService } from '../../utils/api';
import { useStudent } from '../context/StudentContext';

export function Schedule() {
  const days = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];
  const hours = ['08:00', '10:00', '12:00', '14:00', '16:00', '18:00'];
  
  const { studentId } = useStudent();
  const { classes, addClass, removeClass, setClasses } = useOutletContext<AppContextType>();
  const [isGenerating, setIsGenerating] = useState(false);

  const handleAddClass = (dayIndex: number, hour: string) => {
    addClass({
      day: dayIndex,
      hour,
      name: 'Nueva Materia',
      room: 'Por asignar',
      color: 'bg-slate-100',
      borderColor: 'border-slate-500',
      textColor: 'text-slate-900',
      lightText: 'text-slate-700'
    });
    toast.success(`Nueva clase planificada el ${days[dayIndex]} a las ${hour}`);
  };

  const handleGeneratePlan = async () => {
    setIsGenerating(true);
    try {
      const planRes = await PlanningService.generatePlan(studentId, 18); // 18 max credits
      const graph = await CurriculumService.getGraph();
      
      const courseMap = new Map();
      graph.nodes.forEach(n => courseMap.set(n.id, n.name));

      if (planRes.semesters.length > 0) {
        // Take the first semester's courses to plan the current schedule
        const nextSemester = planRes.semesters[0].courses;
        
        let newClasses: any[] = [];
        let timeSlots = [...hours];
        
        nextSemester.forEach((courseId, i) => {
          const courseName = courseMap.get(courseId) || 'Materia';
          const randomDay = Math.floor(Math.random() * 5);
          const randomHour = timeSlots[i % timeSlots.length];

          newClasses.push({
            id: Date.now() + i,
            day: randomDay,
            hour: randomHour,
            name: courseName,
            room: 'Automático',
            color: 'bg-indigo-100',
            borderColor: 'border-indigo-500',
            textColor: 'text-indigo-900',
            lightText: 'text-indigo-700'
          });
        });

        // Use context setter to replace classes if it exists, otherwise add them individually
        if (setClasses) {
           setClasses(newClasses);
        } else {
           newClasses.forEach(c => addClass(c));
        }
        
        toast.success(`Plan generado. Se agregaron ${nextSemester.length} materias recomendadas a tu horario.`);
      } else {
        toast.info("No hay materias disponibles para programar o ya terminaste tu malla.");
      }
    } catch (error) {
      console.error(error);
      toast.error('Error al generar el plan de estudio.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden bg-slate-50">
      <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0">
        <h1 className="text-lg font-semibold text-slate-800">Horario Planeado</h1>
        <div className="flex items-center gap-4">
          <button 
            onClick={handleGeneratePlan}
            disabled={isGenerating}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-100 text-indigo-700 hover:bg-indigo-200 text-sm font-medium rounded-lg transition-colors shadow-sm disabled:opacity-50"
          >
            {isGenerating ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
            <span>{isGenerating ? 'Generando...' : 'Auto-Generar'}</span>
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm">
            <Plus size={16} />
            <span>Agregar Materia</span>
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-auto p-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden min-w-[800px]">
          <div className="grid grid-cols-6 border-b border-slate-200 bg-slate-50">
            <div className="p-4 border-r border-slate-200 text-center font-medium text-slate-500 text-sm">
              <Clock size={16} className="mx-auto mb-1 opacity-50" />
              Hora
            </div>
            {days.map(day => (
              <div key={day} className="p-4 border-r border-slate-200 last:border-0 text-center font-semibold text-slate-700">
                {day}
              </div>
            ))}
          </div>
          
          <div className="divide-y divide-slate-100">
            {hours.map(hour => (
              <div key={hour} className="grid grid-cols-6 min-h-[100px]">
                <div className="p-4 border-r border-slate-200 bg-slate-50 text-center text-sm font-medium text-slate-500 flex items-center justify-center">
                  {hour}
                </div>
                {/* Placeholders for classes */}
                {days.map((day, i) => {
                  const classItem = classes.find(c => c.day === i && c.hour === hour);
                  
                  return (
                    <div 
                      key={`${day}-${hour}`} 
                      className="p-2 border-r border-slate-200 last:border-0 relative hover:bg-slate-50 transition-colors group cursor-pointer"
                      onClick={() => !classItem && handleAddClass(i, hour)}
                    >
                      {/* Class Block */}
                      {classItem && (
                        <div className={`absolute inset-2 ${classItem.color} border-l-4 ${classItem.borderColor} rounded p-2 overflow-hidden shadow-sm z-10 group/item`}>
                          <p className={`text-xs font-bold ${classItem.textColor} truncate pr-4`}>{classItem.name}</p>
                          <p className={`text-[10px] ${classItem.lightText} truncate mt-1`}>{classItem.room}</p>
                          <button 
                            className="absolute top-1 right-1 opacity-0 group-hover/item:opacity-100 p-0.5 hover:bg-black/10 rounded transition-all"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeClass(classItem.id);
                              toast.info(`${classItem.name} eliminada del horario.`);
                            }}
                          >
                            <X size={12} className={classItem.textColor} />
                          </button>
                        </div>
                      )}
                      
                      {/* Empty State Hover */}
                      {!classItem && (
                        <div className="absolute inset-2 border-2 border-dashed border-slate-300 rounded opacity-0 group-hover:opacity-100 flex items-center justify-center bg-slate-50/50 z-0">
                          <Plus size={20} className="text-slate-400" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

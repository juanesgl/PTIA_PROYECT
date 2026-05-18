from typing import List, Dict, Set
from uuid import UUID
from domain.entities.graph import CurriculumGraph
from domain.entities.student import StudentCourseHistory
from domain.services.critical_path import CriticalPathService

class PlannerService:
    @staticmethod
    def get_available_courses(graph: CurriculumGraph, passed_courses: Set[UUID]) -> List[UUID]:
        """
        Returns courses that have all their prerequisites met and are not already passed.
        """
        available = []
        for node_id in graph.nodes:
            if node_id in passed_courses:
                continue
          
            prereqs = graph.edges.get(node_id, [])
            if all(prereq in passed_courses for prereq in prereqs):
                available.append(node_id)
                
        return available

    @staticmethod
    def generate_plan(
        graph: CurriculumGraph, 
        history: List[StudentCourseHistory], 
        max_credits: int, 
        target_semesters: int = 10
    ) -> List[List[UUID]]:
        """
        Generates a semester-by-semester study plan.
        Greedy approach prioritizing critical paths.
        """
        passed_courses = {h.course_id for h in history if h.status == 'passed'}
        plan = []
        
        depths = CriticalPathService.calculate_depths(graph)
        
        simulated_passed = set(passed_courses)
        
        for _ in range(target_semesters):
            available = PlannerService.get_available_courses(graph, simulated_passed)
            if not available:
                break
           
            available.sort(
                key=lambda x: (
                    depths.get(x, 0), 
                    -graph.nodes[x].suggested_semester
                ), 
                reverse=True
            )
            
            semester_plan = []
            current_credits = 0
            
            for course_id in available:
                course = graph.nodes[course_id]
                if current_credits + course.credits <= max_credits:
                    semester_plan.append(course_id)
                    current_credits += course.credits
                    
            if not semester_plan:
                break 
                
            plan.append(semester_plan)
            simulated_passed.update(semester_plan)
            
        return plan

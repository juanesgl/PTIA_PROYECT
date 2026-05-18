from typing import List, Dict
from uuid import UUID
from domain.ports.course_repository import CourseRepository
from domain.ports.student_repository import StudentRepository
from domain.services.planner_service import PlannerService
from domain.services.critical_path import CriticalPathService
from application.use_cases.curriculum_use_cases import CurriculumUseCases

class PlanningUseCases:
    def __init__(self, course_repo: CourseRepository, student_repo: StudentRepository):
        self.course_repo = course_repo
        self.student_repo = student_repo
        self.curriculum_uc = CurriculumUseCases(course_repo)
        
    def get_available_courses(self, student_id: UUID) -> List[UUID]:
        graph = self.curriculum_uc.get_curriculum_graph()
        history = self.student_repo.get_student_history(student_id)
        passed_courses = {h.course_id for h in history if h.status == 'passed'}
        
        return PlannerService.get_available_courses(graph, passed_courses)

    def get_critical_path(self, student_id: UUID) -> Dict[UUID, int]:
        """
        Returns depths of courses. Does not strictly depend on student_id, 
        but could be filtered by unpassed courses.
        """
        graph = self.curriculum_uc.get_curriculum_graph()
        depths = CriticalPathService.calculate_depths(graph)
        
        history = self.student_repo.get_student_history(student_id)
        passed_courses = {h.course_id for h in history if h.status == 'passed'}
        
        return {course_id: depth for course_id, depth in depths.items() if course_id not in passed_courses}

    def generate_study_plan(self, student_id: UUID, max_credits: int) -> List[List[UUID]]:
        graph = self.curriculum_uc.get_curriculum_graph()
        history = self.student_repo.get_student_history(student_id)
        
        return PlannerService.generate_plan(graph, history, max_credits)

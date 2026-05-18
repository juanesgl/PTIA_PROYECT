from typing import List
from uuid import UUID
from domain.entities.graph import CurriculumGraph
from domain.ports.course_repository import CourseRepository
from domain.services.dag_validator import DAGValidator
from domain.services.toposort_service import TopoSortService

class CurriculumUseCases:
    def __init__(self, course_repo: CourseRepository):
        self.course_repo = course_repo
        
    def get_curriculum_graph(self) -> CurriculumGraph:
        """
        Retrieves all courses and prerequisites, builds the DAG, 
        and validates it.
        """
        graph = CurriculumGraph()
        
        courses = self.course_repo.get_all_courses()
        for course in courses:
            graph.add_course(course)
            
        prerequisites = self.course_repo.get_all_prerequisites()
        for prereq in prerequisites:
            graph.add_prerequisite(prereq)
            
        DAGValidator.validate(graph)
        
        return graph

    def get_toposort(self) -> List[UUID]:
        """
        Returns the topological sort of the curriculum.
        """
        graph = self.get_curriculum_graph()
        return TopoSortService.sort(graph)

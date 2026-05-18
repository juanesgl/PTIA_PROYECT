from pydantic import BaseModel
from typing import Dict, List, Set
from uuid import UUID
from domain.entities.course import Course, Prerequisite

class CurriculumGraph(BaseModel):
    nodes: Dict[UUID, Course] = {}
    edges: Dict[UUID, List[UUID]] = {}
    reverse_edges: Dict[UUID, List[UUID]] = {} 
    
    def add_course(self, course: Course):
        self.nodes[course.id] = course
        if course.id not in self.edges:
            self.edges[course.id] = []
        if course.id not in self.reverse_edges:
            self.reverse_edges[course.id] = []
            
    def add_prerequisite(self, prereq: Prerequisite):
        if prereq.course_id in self.edges:
            self.edges[prereq.course_id].append(prereq.prerequisite_id)
        if prereq.prerequisite_id in self.reverse_edges:
            self.reverse_edges[prereq.prerequisite_id].append(prereq.course_id)

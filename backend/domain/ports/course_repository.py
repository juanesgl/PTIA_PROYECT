from abc import ABC, abstractmethod
from typing import List, Optional
from uuid import UUID
from domain.entities.course import Course, Prerequisite

class CourseRepository(ABC):
    @abstractmethod
    def get_all_courses(self) -> List[Course]:
        pass
        
    @abstractmethod
    def get_course_by_id(self, course_id: UUID) -> Optional[Course]:
        pass

    @abstractmethod
    def get_all_prerequisites(self) -> List[Prerequisite]:
        pass

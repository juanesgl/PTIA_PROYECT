from abc import ABC, abstractmethod
from typing import List, Optional
from uuid import UUID
from domain.entities.student import Student, StudentCourseHistory

class StudentRepository(ABC):
    @abstractmethod
    def get_student_by_id(self, student_id: UUID) -> Optional[Student]:
        pass
        
    @abstractmethod
    def get_student_history(self, student_id: UUID) -> List[StudentCourseHistory]:
        pass

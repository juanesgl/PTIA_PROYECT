import json
import os
from typing import List, Optional
from uuid import UUID
from domain.ports.student_repository import StudentRepository
from domain.entities.student import Student, StudentCourseHistory

class JSONStudentRepository(StudentRepository):
    def __init__(self, json_path: str):
        self.json_path = json_path
        self._load_data()

    def _load_data(self):
        if not os.path.exists(self.json_path):
            raise FileNotFoundError(f"JSON file not found: {self.json_path}")
        with open(self.json_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
            self.students = {}
            self.history = {}
            for s_data in data.get('students', []):
                student_id = UUID(s_data['id'])
                history_data = s_data.pop('history', [])
                self.students[student_id] = Student(**s_data)
                self.history[student_id] = [StudentCourseHistory(**h) for h in history_data]

    def get_student_by_id(self, student_id: UUID) -> Optional[Student]:
        return self.students.get(student_id)

    def get_student_history(self, student_id: UUID) -> List[StudentCourseHistory]:
        return self.history.get(student_id, [])

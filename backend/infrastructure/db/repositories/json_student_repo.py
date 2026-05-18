import json
import os
import uuid
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

    def toggle_course_status(self, student_id: UUID, course_id: UUID) -> None:
        """
        Toggles the passed status of a course for a student and saves it to the JSON file.
        """
        history = self.history.get(student_id, [])
        # Find if it already exists
        existing = next((h for h in history if h.course_id == course_id), None)
        
        with open(self.json_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
            
        student_data = next((s for s in data.get('students', []) if s['id'] == str(student_id)), None)
        if not student_data:
            return
            
        if 'history' not in student_data:
            student_data['history'] = []
            
        if existing:
            # If it exists and is passed, remove it (toggle off)
            if existing.status == 'passed':
                student_data['history'] = [h for h in student_data['history'] if h['course_id'] != str(course_id)]
            else:
                # If it exists but not passed, mark as passed
                for h in student_data['history']:
                    if h['course_id'] == str(course_id):
                        h['status'] = 'passed'
        else:
            # Create new passed history entry
            new_entry = {
                "id": str(uuid.uuid4()),
                "student_id": str(student_id),
                "course_id": str(course_id),
                "status": "passed",
                "grade": 4.0,  # Default grade 4.0 out of 5
                "period": "2024-1"
            }
            student_data['history'].append(new_entry)
            
        with open(self.json_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
            
        # Reload memory
        self._load_data()

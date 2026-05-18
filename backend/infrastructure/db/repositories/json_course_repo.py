import json
import os
from typing import List, Optional
from uuid import UUID
from domain.ports.course_repository import CourseRepository
from domain.entities.course import Course, Prerequisite

class JSONCourseRepository(CourseRepository):
    def __init__(self, json_path: str):
        self.json_path = json_path
        self._load_data()

    def _load_data(self):
        if not os.path.exists(self.json_path):
            raise FileNotFoundError(f"JSON file not found: {self.json_path}")
        with open(self.json_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
            self.courses = [Course(**c) for c in data.get('courses', [])]
            self.prerequisites = [Prerequisite(**p) for p in data.get('prerequisites', [])]

    def get_all_courses(self) -> List[Course]:
        return self.courses

    def get_course_by_id(self, course_id: UUID) -> Optional[Course]:
        for course in self.courses:
            if course.id == course_id:
                return course
        return None

    def get_all_prerequisites(self) -> List[Prerequisite]:
        return self.prerequisites

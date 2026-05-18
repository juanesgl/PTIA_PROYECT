from pydantic import BaseModel, Field
from typing import Optional
from uuid import UUID
from datetime import date

class Student(BaseModel):
    id: UUID
    user_id: Optional[UUID] = None
    name: str
    enrollment_year: int

class StudentCourseHistory(BaseModel):
    id: UUID
    student_id: UUID
    course_id: UUID
    status: str = Field(..., description="'passed', 'failed', 'enrolled'")
    grade: Optional[float] = None
    period: str = Field(..., description="e.g., '2023-1'")

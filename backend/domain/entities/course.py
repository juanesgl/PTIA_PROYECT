from pydantic import BaseModel, Field
from typing import Optional, List
from uuid import UUID

class Course(BaseModel):
    id: UUID
    code: str = Field(..., description="Course code, e.g., DDYA, DOPO")
    name: str
    credits: int
    suggested_semester: int = Field(..., ge=1, le=10)

class Prerequisite(BaseModel):
    id: UUID
    course_id: UUID
    prerequisite_id: UUID
    type: str = Field(default="mandatory", description="Type of prerequisite: mandatory, corequisite")

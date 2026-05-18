from pydantic import BaseModel
from typing import List, Dict
from uuid import UUID

class StudyPlanRequest(BaseModel):
    max_credits_per_semester: int
    target_semesters: int = 10

class SemesterPlanDTO(BaseModel):
    semester_index: int
    courses: List[UUID]

class StudyPlanResponse(BaseModel):
    semesters: List[SemesterPlanDTO]

class CriticalPathResponse(BaseModel):
    critical_paths: Dict[UUID, int]

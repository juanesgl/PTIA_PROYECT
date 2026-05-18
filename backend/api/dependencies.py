from fastapi import Depends
import os
from infrastructure.db.repositories.json_course_repo import JSONCourseRepository
from infrastructure.db.repositories.json_student_repo import JSONStudentRepository
from application.use_cases.curriculum_use_cases import CurriculumUseCases
from application.use_cases.planning_use_cases import PlanningUseCases

DATA_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "curriculum.json")

def get_course_repository() -> JSONCourseRepository:
    return JSONCourseRepository(DATA_PATH)

def get_student_repository() -> JSONStudentRepository:
    return JSONStudentRepository(DATA_PATH)

def get_curriculum_use_cases(repo: JSONCourseRepository = Depends(get_course_repository)) -> CurriculumUseCases:
    return CurriculumUseCases(repo)

def get_planning_use_cases(
    course_repo: JSONCourseRepository = Depends(get_course_repository),
    student_repo: JSONStudentRepository = Depends(get_student_repository)
) -> PlanningUseCases:
    return PlanningUseCases(course_repo, student_repo)

from fastapi import APIRouter, Depends, Path
from typing import List
from uuid import UUID
from api.schemas.planning import StudyPlanRequest, StudyPlanResponse, SemesterPlanDTO, CriticalPathResponse
from api.dependencies import get_planning_use_cases
from application.use_cases.planning_use_cases import PlanningUseCases

router = APIRouter(prefix="/students", tags=["Planning"])

@router.get("/{student_id}/available-courses", response_model=List[UUID])
def get_available_courses(
    student_id: UUID = Path(...),
    use_cases: PlanningUseCases = Depends(get_planning_use_cases)
):
    return use_cases.get_available_courses(student_id)

@router.get("/{student_id}/history", response_model=List[UUID])
def get_student_history(
    student_id: UUID = Path(...),
    use_cases: PlanningUseCases = Depends(get_planning_use_cases)
):
    history = use_cases.student_repo.get_student_history(student_id)
    return [h.course_id for h in history if h.status == 'passed']

@router.get("/{student_id}/critical-path", response_model=CriticalPathResponse)
def get_critical_path(
    student_id: UUID = Path(...),
    use_cases: PlanningUseCases = Depends(get_planning_use_cases)
):
    paths = use_cases.get_critical_path(student_id)
    return CriticalPathResponse(critical_paths=paths)

@router.post("/{student_id}/plan", response_model=StudyPlanResponse)
def generate_plan(
    request: StudyPlanRequest,
    student_id: UUID = Path(...),
    use_cases: PlanningUseCases = Depends(get_planning_use_cases)
):
    plan = use_cases.generate_study_plan(student_id, request.max_credits_per_semester)
    
    semesters = []
    for idx, courses in enumerate(plan):
        semesters.append(SemesterPlanDTO(semester_index=idx + 1, courses=courses))
        
    return StudyPlanResponse(semesters=semesters)

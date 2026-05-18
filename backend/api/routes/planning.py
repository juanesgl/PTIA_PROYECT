from fastapi import APIRouter, Depends, Path, HTTPException
from typing import List
from uuid import UUID
from pydantic import BaseModel
from api.schemas.planning import StudyPlanRequest, StudyPlanResponse, SemesterPlanDTO, CriticalPathResponse
from api.dependencies import get_planning_use_cases
from application.use_cases.planning_use_cases import PlanningUseCases

router = APIRouter(prefix="/students", tags=["Planning"])

class ToggleCourseRequest(BaseModel):
    course_id: UUID

class GpaResponse(BaseModel):
    gpa: float

@router.get(
    "/{student_id}/available-courses", 
    response_model=List[UUID],
    summary="Get Available Courses",
    description="Retrieves a list of courses that the student is currently eligible to take. A course is available if all its hard prerequisites have been passed.",
    response_description="List of available course UUIDs."
)
def get_available_courses(
    student_id: UUID = Path(..., description="The unique identifier of the student"),
    use_cases: PlanningUseCases = Depends(get_planning_use_cases)
):
    """
    Calculate eligible courses based on the student's academic history.
    """
    return use_cases.get_available_courses(student_id)

@router.get(
    "/{student_id}/history", 
    response_model=List[UUID],
    summary="Get Student History",
    description="Retrieves the list of courses the student has already passed.",
    response_description="List of passed course UUIDs."
)
def get_student_history(
    student_id: UUID = Path(..., description="The unique identifier of the student"),
    use_cases: PlanningUseCases = Depends(get_planning_use_cases)
):
    """
    Fetch the student's academic record and filter by passed courses.
    """
    history = use_cases.student_repo.get_student_history(student_id)
    return [h.course_id for h in history if h.status == 'passed']

@router.post(
    "/{student_id}/history/toggle",
    summary="Toggle Course Completion Status",
    description="Toggles a course between 'passed' and 'pending' in the student's academic history. Persists the change to the database.",
    response_description="A success message confirming the operation."
)
def toggle_course_history(
    request: ToggleCourseRequest,
    student_id: UUID = Path(..., description="The unique identifier of the student"),
    use_cases: PlanningUseCases = Depends(get_planning_use_cases)
):
    """
    Update the completion status of a specific course for the student.
    """
    try:
        use_cases.student_repo.toggle_course_status(student_id, request.course_id)
        return {"message": "Course status toggled successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get(
    "/{student_id}/gpa",
    response_model=GpaResponse,
    summary="Get Student GPA",
    description="Calculates the current Grade Point Average (GPA) for the student based on their passed courses on a 0.0 to 5.0 scale.",
    response_description="A GpaResponse object containing the calculated GPA float."
)
def get_student_gpa(
    student_id: UUID = Path(..., description="The unique identifier of the student"),
    use_cases: PlanningUseCases = Depends(get_planning_use_cases)
):
    """
    Compute the real-time GPA from the student's academic history.
    """
    history = use_cases.student_repo.get_student_history(student_id)
    passed = [h for h in history if h.status == 'passed']
    if not passed:
        return GpaResponse(gpa=0.0)
    
    total = sum(h.grade for h in passed)
    return GpaResponse(gpa=total / len(passed))

@router.get(
    "/{student_id}/critical-path", 
    response_model=CriticalPathResponse,
    summary="Get Critical Path Analysis",
    description="Analyzes the curriculum DAG against the student's history to identify the critical path (bottlenecks). Returns a mapping of course UUIDs to their depth in the critical path tree.",
    response_description="A dictionary mapping course UUIDs to their integer depth/criticality."
)
def get_critical_path(
    student_id: UUID = Path(..., description="The unique identifier of the student"),
    use_cases: PlanningUseCases = Depends(get_planning_use_cases)
):
    """
    Calculate the longest paths to graduation to identify critical bottlenecks.
    """
    paths = use_cases.get_critical_path(student_id)
    return CriticalPathResponse(critical_paths=paths)

@router.post(
    "/{student_id}/plan", 
    response_model=StudyPlanResponse,
    summary="Generate Optimal Study Plan (A*)",
    description="Generates an optimal, multi-semester study plan using the A* Search algorithm. It intelligently schedules available courses semester by semester without exceeding the credit limit, prioritizing critical path courses.",
    response_description="A structured list of semesters containing the scheduled courses."
)
def generate_plan(
    request: StudyPlanRequest,
    student_id: UUID = Path(..., description="The unique identifier of the student"),
    use_cases: PlanningUseCases = Depends(get_planning_use_cases)
):
    """
    Execute the intelligent planning engine to generate a personalized academic roadmap.
    
    - **max_credits_per_semester**: The strict credit limit constraint per semester (e.g., 21).
    """
    plan = use_cases.generate_study_plan(student_id, request.max_credits_per_semester)
    
    semesters = []
    for idx, courses in enumerate(plan):
        semesters.append(SemesterPlanDTO(semester_index=idx + 1, courses=courses))
        
    return StudyPlanResponse(semesters=semesters)

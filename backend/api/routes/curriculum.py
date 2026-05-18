from fastapi import APIRouter, Depends
from typing import List
from uuid import UUID
from api.schemas.curriculum import GraphResponse, NodeDTO, EdgeDTO
from api.dependencies import get_curriculum_use_cases
from application.use_cases.curriculum_use_cases import CurriculumUseCases

router = APIRouter(prefix="/curriculum", tags=["Curriculum"])

@router.get(
    "/graph", 
    response_model=GraphResponse,
    summary="Get Curriculum Graph",
    description="Retrieves the full curriculum map for the academic program. The response represents a Directed Acyclic Graph (DAG) including all courses (nodes) and their prerequisite relationships (edges).",
    response_description="A GraphResponse object containing 'nodes' (courses) and 'edges' (prerequisites)."
)
def get_graph(use_cases: CurriculumUseCases = Depends(get_curriculum_use_cases)):
    """
    Fetch the complete curriculum DAG structure.
    
    - **Returns:** A graph structure where nodes contain course details (credits, name, suggested semester) and edges indicate strict prerequisite dependencies.
    """
    graph = use_cases.get_curriculum_graph()
    
    nodes = [
        NodeDTO(
            id=course.id, 
            code=course.code, 
            name=course.name, 
            credits=course.credits, 
            suggested_semester=course.suggested_semester
        ) for course in graph.nodes.values()
    ]
    
    edges = []
    for target_id, prereqs in graph.edges.items():
        for source_id in prereqs:
            edges.append(EdgeDTO(source=source_id, target=target_id))
            
    return GraphResponse(nodes=nodes, edges=edges)

@router.get(
    "/toposort", 
    response_model=List[UUID],
    summary="Get Topological Sort",
    description="Computes and returns a valid topological ordering of the curriculum graph. This represents a safe linear sequence of courses where all prerequisites are satisfied before a dependent course is taken.",
    response_description="A list of course UUIDs ordered topologically."
)
def get_toposort(use_cases: CurriculumUseCases = Depends(get_curriculum_use_cases)):
    """
    Perform a topological sort on the curriculum DAG.
    
    - **Returns:** An ordered list of UUIDs representing a valid course taking sequence.
    """
    return use_cases.get_toposort()

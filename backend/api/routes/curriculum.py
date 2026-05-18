from fastapi import APIRouter, Depends
from typing import List
from uuid import UUID
from api.schemas.curriculum import GraphResponse, NodeDTO, EdgeDTO
from api.dependencies import get_curriculum_use_cases
from application.use_cases.curriculum_use_cases import CurriculumUseCases

router = APIRouter(prefix="/curriculum", tags=["Curriculum"])

@router.get("/graph", response_model=GraphResponse)
def get_graph(use_cases: CurriculumUseCases = Depends(get_curriculum_use_cases)):
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

@router.get("/toposort", response_model=List[UUID])
def get_toposort(use_cases: CurriculumUseCases = Depends(get_curriculum_use_cases)):
    return use_cases.get_toposort()

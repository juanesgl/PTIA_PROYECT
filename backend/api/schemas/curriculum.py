from pydantic import BaseModel
from typing import List
from uuid import UUID

class NodeDTO(BaseModel):
    id: UUID
    code: str
    name: str
    credits: int
    suggested_semester: int

class EdgeDTO(BaseModel):
    source: UUID
    target: UUID

class GraphResponse(BaseModel):
    nodes: List[NodeDTO]
    edges: List[EdgeDTO]

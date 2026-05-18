from typing import List, Dict
from uuid import UUID
from collections import deque
from domain.entities.graph import CurriculumGraph
from domain.services.dag_validator import DAGValidator

class TopoSortService:
    @staticmethod
    def sort(graph: CurriculumGraph) -> List[UUID]:
        """
        Returns a topologically sorted list of course IDs using Kahn's Algorithm.
        Raises ValueError if a cycle is detected.
        """
        DAGValidator.validate(graph)
        
        in_degree: Dict[UUID, int] = {node_id: 0 for node_id in graph.nodes}
        for node_id, prereqs in graph.edges.items():
            in_degree[node_id] = len(prereqs)
            
        queue = deque([node_id for node_id, degree in in_degree.items() if degree == 0])
        
        sorted_order: List[UUID] = []
        
        while queue:
            current = queue.popleft()
            sorted_order.append(current)
          
            for dependent_id in graph.reverse_edges.get(current, []):
                in_degree[dependent_id] -= 1
                if in_degree[dependent_id] == 0:
                    queue.append(dependent_id)
                    
        if len(sorted_order) != len(graph.nodes):
            raise ValueError("Graph has cycles or is invalid.")
            
        return sorted_order

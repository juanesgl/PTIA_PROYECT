from typing import Dict
from uuid import UUID
from collections import defaultdict
from domain.entities.graph import CurriculumGraph
from domain.services.toposort_service import TopoSortService

class CriticalPathService:
    @staticmethod
    def calculate_depths(graph: CurriculumGraph) -> Dict[UUID, int]:
        """
        Calculates the longest path (depth) from each node to any leaf.
        A higher depth means the course is more critical (bottleneck).
        """
       
        sorted_nodes = TopoSortService.sort(graph)
        
        depths: Dict[UUID, int] = {node_id: 0 for node_id in graph.nodes}
        
        for node_id in reversed(sorted_nodes):
            max_depth = 0
            for dependent_id in graph.reverse_edges.get(node_id, []):
                max_depth = max(max_depth, 1 + depths[dependent_id])
            depths[node_id] = max_depth
            
        return depths

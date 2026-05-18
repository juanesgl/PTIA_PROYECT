from typing import List, Dict, Set
from uuid import UUID
from domain.entities.graph import CurriculumGraph

class CycleDetectedError(Exception):
    def __init__(self, cycle_path: List[UUID]):
        self.cycle_path = cycle_path
        super().__init__(f"Cycle detected in curriculum graph: {cycle_path}")

class DAGValidator:
    @staticmethod
    def validate(graph: CurriculumGraph) -> bool:
        """
        Validates if the graph is a Directed Acyclic Graph (DAG).
        Uses DFS to detect cycles.
        """
        visited: Set[UUID] = set()
        rec_stack: Set[UUID] = set()
        path: List[UUID] = []

        def dfs(node_id: UUID) -> bool:
            visited.add(node_id)
            rec_stack.add(node_id)
            path.append(node_id)

            for neighbor_id in graph.reverse_edges.get(node_id, []):
                if neighbor_id not in visited:
                    if dfs(neighbor_id):
                        return True
                elif neighbor_id in rec_stack:
                    path.append(neighbor_id)
                    raise CycleDetectedError(path)

            rec_stack.remove(node_id)
            path.pop()
            return False

        for node_id in graph.nodes:
            if node_id not in visited:
                if dfs(node_id):
                    return False
        
        return True

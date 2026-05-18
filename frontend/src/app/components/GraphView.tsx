import React, { useCallback, MouseEvent, useEffect } from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';

interface GraphViewProps {
  nodes: Node[];
  edges: Edge[];
  onNodesChange: any;
  onEdgesChange: any;
  onConnect: (params: Connection) => void;
  onNodeClick?: (nodeId: string, nodeLabel: string) => void;
}

export function GraphView({ nodes, edges, onNodesChange, onEdgesChange, onConnect, onNodeClick }: GraphViewProps) {
  const handleNodeClick = (_: MouseEvent, node: Node) => {
    if (onNodeClick) {
      onNodeClick(node.data.id || node.id, node.data.label);
    }
  };

  return (
    <div style={{ width: '100%', height: '100%', minHeight: '400px' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={handleNodeClick}
        fitView
        attributionPosition="bottom-right"
      >
        <Controls />
        <MiniMap />
        <Background gap={12} size={1} />
      </ReactFlow>
    </div>
  );
}

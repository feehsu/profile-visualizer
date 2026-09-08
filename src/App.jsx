import React from "react";
import { useMemo, useState } from 'react';

import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  Handle,
  Position
} from '@xyflow/react';

const initialJson = {
  attributes: {
    person: {
      id: '123'
    },
    'person.name': {
      value: 'João da Silva'
    },
    'person.cpf': {
      value: '12345678900'
    },
    'person.email': {
      value: 'joao@email.com'
    },
    'person.document': {
      value: 'document-123'
    },
    'person.document[CNH.jpeg]': {
      value: 'CNH'
    }
  },

  relations: [
    {
      source: 'person',
      target: 'person.name'
    },
    {
      source: 'person',
      target: 'person.cpf'
    },
    {
      source: 'person',
      target: 'person.email'
    },
    {
      source: 'person',
      target: 'person.document'
    },
    {
      source: 'person.document',
      target: 'person.document[CNH.jpeg]'
    }
  ]
};

function ProfileNode({ data }) {
  return (
    <div className="profile-node">
      <Handle
        type="target"
        position={Position.Left}
      />

      <div className="node-header">
        {data.name}
      </div>

      <div className="node-content">
        {data.value !== undefined && (
          <div className="node-value">
            {typeof data.value === 'object'
              ? JSON.stringify(data.value)
              : String(data.value)}
          </div>
        )}
      </div>

      <Handle
        type="source"
        position={Position.Right}
      />
    </div>
  );
}

const nodeTypes = {
  profile: ProfileNode
};

function buildGraph(profile) {
  const attributes = profile.attributes || {};
  const relations = profile.relations || [];

  const nodes = Object.entries(attributes).map(
    ([key, attribute], index) => {

      const value =
        attribute &&
        typeof attribute === 'object' &&
        'value' in attribute
          ? attribute.value
          : attribute;

      return {
        id: key,

        type: 'profile',

        position: {
          x: (index % 4) * 320,
          y: Math.floor(index / 4) * 180
        },

        data: {
          name: key,
          value
        }
      };
    }
  );

  const edges = [];

  if (Array.isArray(relations)) {
    relations.forEach((relation, index) => {
      if (!relation.source || !relation.target) {
        return;
      }

      edges.push({
        id: `relation-${index}`,

        source: relation.source,

        target: relation.target,

        animated: false
      });
    });
  }

  return {
    nodes,
    edges
  };
}

export default function App() {

  const [jsonText, setJsonText] = useState(
    JSON.stringify(initialJson, null, 2)
  );

  const [profile, setProfile] = useState(initialJson);

  const graph = useMemo(
    () => buildGraph(profile),
    [profile]
  );

  const [nodes, setNodes, onNodesChange] =
    useNodesState(graph.nodes);

  const [edges, setEdges, onEdgesChange] =
    useEdgesState(graph.edges);

  function generateGraph() {

    try {

      const parsed = JSON.parse(jsonText);

      setProfile(parsed);

      const generated = buildGraph(parsed);

      setNodes(generated.nodes);

      setEdges(generated.edges);

    } catch (error) {

      alert(
        'JSON inválido: ' +
        error.message
      );
    }
  }

  function formatJson() {

    try {

      const parsed = JSON.parse(jsonText);

      setJsonText(
        JSON.stringify(parsed, null, 2)
      );

    } catch (error) {

      alert(
        'JSON inválido: ' +
        error.message
      );
    }
  }

  return (
    <div className="app">

      <aside className="sidebar">

        <div className="logo">
          Profile Output
        </div>

        <div className="subtitle">
          JSON Relationship Viewer
        </div>

        <textarea
          value={jsonText}
          onChange={(event) =>
            setJsonText(event.target.value)
          }
          spellCheck={false}
        />

        <div className="actions">

          <button onClick={generateGraph}>
            Visualizar
          </button>

          <button
            className="secondary"
            onClick={formatJson}
          >
            Formatar JSON
          </button>

        </div>

      </aside>

      <main className="graph-container">

        <ReactFlow
          nodes={nodes}
          edges={edges}

          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}

          nodeTypes={nodeTypes}

          fitView

          proOptions={{
            hideAttribution: true
          }}
        >

          <Background />

          <Controls />

          <MiniMap />

        </ReactFlow>

      </main>

    </div>
  );
}
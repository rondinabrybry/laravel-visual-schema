import React from 'react';

export function RelationshipLine({ relationship, tables, layout, isDarkMode }) {
    if (!tables[relationship.from_table] || !tables[relationship.to_table]) {
        return null;
    }

    const fromPos = layout[relationship.from_table];
    const toPos = layout[relationship.to_table];

    if (!fromPos || !toPos) {
        return null;
    }

    // Calculate connection points (center of tables for now)
    const fromX = fromPos.x + 128; // Half of typical table width
    const fromY = fromPos.y + 40;  // Approximate header height
    const toX = toPos.x + 128;
    const toY = toPos.y + 40;

    // Create curved path
    const midX = (fromX + toX) / 2;
    const midY = (fromY + toY) / 2;
    const controlOffset = 50;

    const path = `M ${fromX} ${fromY} Q ${midX} ${midY - controlOffset} ${toX} ${toY}`;

    const getRelationshipColor = (type) => {
        switch (type) {
            case 'one-to-one':
                return '#10b981'; // green
            case 'one-to-many':
                return '#3b82f6'; // blue
            case 'many-to-many':
                return '#f59e0b'; // amber
            default:
                return '#6b7280'; // gray
        }
    };

    const getRelationshipIcon = (type) => {
        switch (type) {
            case 'one-to-one':
                return '1:1';
            case 'one-to-many':
                return '1:N';
            case 'many-to-many':
                return 'N:M';
            default:
                return '?';
        }
    };

    return (
        <g className="relationship-line">
            {/* Connection Line */}
            <path
                d={path}
                stroke={getRelationshipColor(relationship.type)}
                strokeWidth="2"
                fill="none"
                strokeDasharray={relationship.type === 'many-to-many' ? '5,5' : 'none'}
                opacity="0.8"
            />
            
            {/* Start Marker */}
            <circle
                cx={fromX}
                cy={fromY}
                r="4"
                fill={getRelationshipColor(relationship.type)}
            />
            
            {/* End Marker */}
            <circle
                cx={toX}
                cy={toY}
                r="4"
                fill={getRelationshipColor(relationship.type)}
            />
            
            {/* Relationship Type Label */}
            <text
                x={midX}
                y={midY - controlOffset - 10}
                textAnchor="middle"
                className="text-xs fill-current text-gray-600 dark:text-gray-400"
                style={{ fontSize: '10px' }}
            >
                {getRelationshipIcon(relationship.type)}
            </text>
            
            {/* Relationship Info on Hover */}
            <title>
                {`${relationship.from_table}.${relationship.from_column} → ${relationship.to_table}.${relationship.to_column} (${relationship.type})`}
            </title>
        </g>
    );
}
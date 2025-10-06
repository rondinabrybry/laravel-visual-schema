import React, { useState, useEffect, useRef } from 'react';

export function TableComponent({ 
    tableId, 
    table, 
    position, 
    selected, 
    onSelect, 
    onUpdate, 
    onDelete, 
    onMove, 
    isDarkMode,
    snapToGrid = true,
    gridSize = 20
}) {
    const [isEditing, setIsEditing] = useState(false);
    const [editName, setEditName] = useState(table.name);
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    
    const tableRef = useRef(null);

    const snapToGridPosition = (pos) => {
        if (!snapToGrid) return pos;
        return {
            x: Math.round(pos.x / gridSize) * gridSize,
            y: Math.round(pos.y / gridSize) * gridSize
        };
    };

    const handleMouseDown = (e) => {
        e.stopPropagation();
        onSelect();
        
        const rect = tableRef.current.getBoundingClientRect();
        setDragOffset({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        });
        
        setIsDragging(true);
        setDragStart({
            x: e.clientX - position.x,
            y: e.clientY - position.y
        });
    };

    const handleMouseMove = (e) => {
        if (isDragging) {
            const newPosition = {
                x: e.clientX - dragStart.x,
                y: e.clientY - dragStart.y
            };
            onMove(snapToGridPosition(newPosition));
        }
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    useEffect(() => {
        if (isDragging) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
            return () => {
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
            };
        }
    }, [isDragging, dragStart, position]);

    const handleNameEdit = () => {
        if (editName.trim() && editName !== table.name) {
            onUpdate({ name: editName.trim() });
        }
        setIsEditing(false);
    };

    const addColumn = () => {
        const columnId = `col_${Date.now()}`;
        const newColumns = {
            ...table.columns,
            [columnId]: {
                name: 'new_column',
                type: 'varchar',
                nullable: true,
                length: 255
            }
        };
        onUpdate({ columns: newColumns });
    };

    const updateColumn = (columnId, updates) => {
        const newColumns = {
            ...table.columns,
            [columnId]: {
                ...table.columns[columnId],
                ...updates
            }
        };
        onUpdate({ columns: newColumns });
    };

    const deleteColumn = (columnId) => {
        if (Object.keys(table.columns).length <= 1) {
            alert('A table must have at least one column');
            return;
        }
        
        const newColumns = { ...table.columns };
        delete newColumns[columnId];
        onUpdate({ columns: newColumns });
    };

    const duplicateTable = () => {
        // This would need to be implemented at the parent level
        console.log('Duplicate table:', tableId);
    };

    return (
        <div
            ref={tableRef}
            className={`table-container absolute bg-white dark:bg-gray-800 border-2 rounded-lg shadow-lg min-w-64 max-w-80 select-none ${
                selected 
                    ? 'border-blue-500 shadow-blue-200 dark:shadow-blue-900' 
                    : 'border-gray-300 dark:border-gray-600 hover:shadow-xl'
            } ${isDragging ? 'cursor-grabbing z-50' : 'cursor-grab'}`}
            style={{ 
                left: position.x, 
                top: position.y,
                transform: isDragging ? 'scale(1.02)' : 'scale(1)',
                transition: isDragging ? 'none' : 'transform 0.2s ease, box-shadow 0.2s ease'
            }}
            onMouseDown={handleMouseDown}
        >
            {/* Table Header */}
            <div className="bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 px-4 py-3 rounded-t-lg border-b border-gray-200 dark:border-gray-600 relative">
                {isEditing ? (
                    <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        onBlur={handleNameEdit}
                        onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                                handleNameEdit();
                            }
                            if (e.key === 'Escape') {
                                setEditName(table.name);
                                setIsEditing(false);
                            }
                        }}
                        className="w-full bg-transparent border-none outline-none font-bold text-gray-800 dark:text-white text-lg"
                        autoFocus
                        onClick={(e) => e.stopPropagation()}
                    />
                ) : (
                    <div
                        className="font-bold text-gray-800 dark:text-white cursor-pointer text-lg hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                        onDoubleClick={(e) => {
                            e.stopPropagation();
                            setEditName(table.name);
                            setIsEditing(true);
                        }}
                        title="Double-click to edit"
                    >
                        {table.name}
                    </div>
                )}
                
                {/* Table Actions */}
                {selected && (
                    <div className="absolute top-2 right-2 flex gap-1">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                addColumn();
                            }}
                            className="w-6 h-6 bg-green-500 text-white rounded text-xs hover:bg-green-600 transition-colors flex items-center justify-center"
                            title="Add Column"
                        >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                        </button>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                duplicateTable();
                            }}
                            className="w-6 h-6 bg-blue-500 text-white rounded text-xs hover:bg-blue-600 transition-colors flex items-center justify-center"
                            title="Duplicate Table"
                        >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                        </button>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                if (confirm(`Are you sure you want to delete the table "${table.name}"?`)) {
                                    onDelete();
                                }
                            }}
                            className="w-6 h-6 bg-red-500 text-white rounded text-xs hover:bg-red-600 transition-colors flex items-center justify-center"
                            title="Delete Table"
                        >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </button>
                    </div>
                )}

                {/* Column count indicator */}
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {Object.keys(table.columns).length} column{Object.keys(table.columns).length !== 1 ? 's' : ''}
                </div>
            </div>

            {/* Table Columns */}
            <div className="max-h-96 overflow-y-auto">
                {Object.entries(table.columns).map(([columnId, column], index) => (
                    <ColumnComponent
                        key={columnId}
                        columnId={columnId}
                        column={column}
                        index={index}
                        onUpdate={(updates) => updateColumn(columnId, updates)}
                        onDelete={() => deleteColumn(columnId)}
                        isDarkMode={isDarkMode}
                        tableSelected={selected}
                    />
                ))}
            </div>

            {/* Add Column Button (when not selected) */}
            {!selected && (
                <div className="p-2 border-t border-gray-200 dark:border-gray-600">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onSelect();
                            addColumn();
                        }}
                        className="w-full py-2 text-sm text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center justify-center gap-1"
                    >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Add Column
                    </button>
                </div>
            )}
        </div>
    );
}

function ColumnComponent({ columnId, column, index, onUpdate, onDelete, isDarkMode, tableSelected }) {
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({
        name: column.name,
        type: column.type,
        nullable: column.nullable !== false,
        primary: column.primary || false,
        unique: column.unique || false,
        default: column.default || '',
        length: column.length || ''
    });

    const columnTypes = [
        'varchar', 'char', 'text', 'mediumtext', 'longtext',
        'int', 'tinyint', 'smallint', 'mediumint', 'bigint',
        'decimal', 'float', 'double',
        'boolean', 'bit',
        'date', 'datetime', 'timestamp', 'time', 'year',
        'json', 'binary', 'varbinary',
        'enum', 'set'
    ];

    const handleSave = () => {
        if (!editData.name.trim()) {
            alert('Column name is required');
            return;
        }

        const updates = {
            name: editData.name.trim(),
            type: editData.type,
            nullable: editData.nullable,
            primary: editData.primary,
            unique: editData.unique
        };

        if (editData.default.trim()) {
            updates.default = editData.default.trim();
        }

        if (editData.length && ['varchar', 'char', 'decimal'].includes(editData.type)) {
            updates.length = parseInt(editData.length) || null;
        }

        onUpdate(updates);
        setIsEditing(false);
    };

    const handleCancel = () => {
        setEditData({
            name: column.name,
            type: column.type,
            nullable: column.nullable !== false,
            primary: column.primary || false,
            unique: column.unique || false,
            default: column.default || '',
            length: column.length || ''
        });
        setIsEditing(false);
    };

    const getTypeColor = (type) => {
        if (['varchar', 'char', 'text', 'mediumtext', 'longtext'].includes(type)) {
            return 'text-green-600 dark:text-green-400';
        }
        if (['int', 'tinyint', 'smallint', 'mediumint', 'bigint', 'decimal', 'float', 'double'].includes(type)) {
            return 'text-blue-600 dark:text-blue-400';
        }
        if (['date', 'datetime', 'timestamp', 'time', 'year'].includes(type)) {
            return 'text-purple-600 dark:text-purple-400';
        }
        if (['boolean', 'bit'].includes(type)) {
            return 'text-orange-600 dark:text-orange-400';
        }
        return 'text-gray-600 dark:text-gray-400';
    };

    return (
        <div className={`flex items-center justify-between py-2 px-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
            index % 2 === 0 ? 'bg-gray-25 dark:bg-gray-750' : ''
        }`}>
            <div className="flex-1 min-w-0">
                {isEditing ? (
                    <div className="space-y-2" onClick={(e) => e.stopPropagation()}>
                        {/* Column Name & Type */}
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={editData.name}
                                onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                                placeholder="Column name"
                                className="flex-1 text-sm bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded px-2 py-1 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <select
                                value={editData.type}
                                onChange={(e) => setEditData({ ...editData, type: e.target.value })}
                                className="text-sm bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded px-2 py-1 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                {columnTypes.map(type => (
                                    <option key={type} value={type}>{type}</option>
                                ))}
                            </select>
                        </div>

                        {/* Length & Default */}
                        <div className="flex gap-2">
                            {['varchar', 'char', 'decimal'].includes(editData.type) && (
                                <input
                                    type="number"
                                    value={editData.length}
                                    onChange={(e) => setEditData({ ...editData, length: e.target.value })}
                                    placeholder="Length"
                                    className="w-20 text-sm bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded px-2 py-1 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            )}
                            <input
                                type="text"
                                value={editData.default}
                                onChange={(e) => setEditData({ ...editData, default: e.target.value })}
                                placeholder="Default value"
                                className="flex-1 text-sm bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded px-2 py-1 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        {/* Checkboxes */}
                        <div className="flex gap-4 text-sm">
                            <label className="flex items-center text-gray-700 dark:text-gray-300">
                                <input
                                    type="checkbox"
                                    checked={editData.nullable}
                                    onChange={(e) => setEditData({ ...editData, nullable: e.target.checked })}
                                    className="mr-1"
                                />
                                Nullable
                            </label>
                            <label className="flex items-center text-gray-700 dark:text-gray-300">
                                <input
                                    type="checkbox"
                                    checked={editData.primary}
                                    onChange={(e) => setEditData({ ...editData, primary: e.target.checked })}
                                    className="mr-1"
                                />
                                Primary
                            </label>
                            <label className="flex items-center text-gray-700 dark:text-gray-300">
                                <input
                                    type="checkbox"
                                    checked={editData.unique}
                                    onChange={(e) => setEditData({ ...editData, unique: e.target.checked })}
                                    className="mr-1"
                                />
                                Unique
                            </label>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-1">
                            <button
                                onClick={handleSave}
                                className="px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600 transition-colors"
                            >
                                Save
                            </button>
                            <button
                                onClick={handleCancel}
                                className="px-2 py-1 bg-gray-500 text-white rounded text-xs hover:bg-gray-600 transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                ) : (
                    <div
                        className="cursor-pointer"
                        onDoubleClick={(e) => {
                            e.stopPropagation();
                            setIsEditing(true);
                        }}
                        title="Double-click to edit"
                    >
                        <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-800 dark:text-white">
                                {column.name}
                            </span>
                            <span className={`text-sm ${getTypeColor(column.type)}`}>
                                {column.type}
                                {column.length && ['varchar', 'char'].includes(column.type) && `(${column.length})`}
                            </span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                            {column.primary && (
                                <span className="text-xs bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 px-1 rounded" title="Primary Key">
                                    PK
                                </span>
                            )}
                            {column.unique && (
                                <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-1 rounded" title="Unique">
                                    UQ
                                </span>
                            )}
                            {column.nullable === false && (
                                <span className="text-xs bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 px-1 rounded" title="Not Null">
                                    NN
                                </span>
                            )}
                            {column.default && (
                                <span className="text-xs text-gray-500 dark:text-gray-400" title={`Default: ${column.default}`}>
                                    = {column.default}
                                </span>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Column Actions */}
            {tableSelected && !isEditing && (
                <div className="flex gap-1 ml-2">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setIsEditing(true);
                        }}
                        className="w-5 h-5 bg-blue-500 text-white rounded text-xs hover:bg-blue-600 transition-colors flex items-center justify-center"
                        title="Edit Column"
                    >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5M9 11l3 3L22 4" />
                        </svg>
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            if (confirm(`Are you sure you want to delete the column "${column.name}"?`)) {
                                onDelete();
                            }
                        }}
                        className="w-5 h-5 bg-red-500 text-white rounded text-xs hover:bg-red-600 transition-colors flex items-center justify-center"
                        title="Delete Column"
                    >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </button>
                </div>
            )}
        </div>
    );
}
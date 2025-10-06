<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>Laravel Visual Schema Designer</title>
    
    <!-- TailwindCSS -->
    <script src="https://cdn.tailwindcss.com"></script>
    
    <!-- React and ReactDOM -->
    <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
    <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
    
    <!-- Babel for JSX transformation -->
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
    
    <!-- Additional libraries -->
    <script src="https://unpkg.com/html2canvas@1.4.1/dist/html2canvas.min.js"></script>
    <script src="https://unpkg.com/jspdf@2.5.1/dist/jspdf.umd.min.js"></script>
    
    <style>
        .canvas-grid {
            background-image: radial-gradient(circle, rgba(0,0,0,0.15) 1px, transparent 1px);
            background-size: 20px 20px;
            background-color: #f9fafb;
        }
        
        .dark .canvas-grid {
            background-image: radial-gradient(circle, rgba(255,255,255,0.15) 1px, transparent 1px);
            background-color: #1f2937;
        }
        
        .table-container {
            cursor: move;
            user-select: none;
        }
        
        .table-container:hover {
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }
        
        .relationship-line {
            pointer-events: none;
        }
        
        .zoom-controls {
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 1000;
        }
        
        .toolbar {
            position: fixed;
            top: 20px;
            left: 20px;
            z-index: 1000;
        }
        
        .sidebar {
            position: fixed;
            left: 0;
            top: 0;
            height: 100vh;
            width: 300px;
            z-index: 999;
            transform: translateX(-100%);
            transition: transform 0.3s ease;
        }
        
        .sidebar.open {
            transform: translateX(0);
        }
        
        @media (max-width: 768px) {
            .toolbar {
                position: fixed;
                bottom: 20px;
                left: 50%;
                transform: translateX(-50%);
                top: auto;
            }
            
            .zoom-controls {
                position: fixed;
                bottom: 20px;
                right: 20px;
                top: auto;
            }
        }
    </style>
</head>
<body class="bg-gray-50">
    <div id="schema-designer-app"></div>
    
    <script type="text/babel">
        const { useState, useEffect, useRef, useCallback } = React;
        
        // Configuration from backend
        const CONFIG = @json($config);
        const INITIAL_SCHEMAS = @json($schemas);
        
        // Main App Component
        function SchemaDesignerApp() {
            const [schemas, setSchemas] = useState(INITIAL_SCHEMAS);
            const [currentSchema, setCurrentSchema] = useState(null);
            const [isDarkMode, setIsDarkMode] = useState(CONFIG.theme.default_theme === 'dark');
            const [zoom, setZoom] = useState(CONFIG.canvas.default_zoom);
            const [pan, setPan] = useState({ x: 0, y: 0 });
            const [selectedTable, setSelectedTable] = useState(null);
            const [isCreatingRelationship, setIsCreatingRelationship] = useState(false);
            const [sidebarOpen, setSidebarOpen] = useState(false);
            const [history, setHistory] = useState([]);
            const [historyIndex, setHistoryIndex] = useState(-1);
            
            const canvasRef = useRef(null);
            const [isDragging, setIsDragging] = useState(false);
            const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
            
            // Initialize with empty schema if none exists
            useEffect(() => {
                if (schemas.length === 0) {
                    createNewSchema();
                }
            }, []);
            
            // Auto-save current schema
            useEffect(() => {
                if (currentSchema && currentSchema.id) {
                    const saveTimer = setTimeout(() => {
                        saveSchema(currentSchema);
                    }, 2000); // Auto-save after 2 seconds of inactivity
                    
                    return () => clearTimeout(saveTimer);
                }
            }, [currentSchema]);
            
            // History management
            const addToHistory = (schema) => {
                const newHistory = history.slice(0, historyIndex + 1);
                newHistory.push(JSON.parse(JSON.stringify(schema)));
                setHistory(newHistory);
                setHistoryIndex(newHistory.length - 1);
            };
            
            const undo = () => {
                if (historyIndex > 0) {
                    setHistoryIndex(historyIndex - 1);
                    setCurrentSchema(history[historyIndex - 1]);
                }
            };
            
            const redo = () => {
                if (historyIndex < history.length - 1) {
                    setHistoryIndex(historyIndex + 1);
                    setCurrentSchema(history[historyIndex + 1]);
                }
            };
            
            // Schema operations
            const createNewSchema = () => {
                const newSchema = {
                    id: null,
                    name: 'New Schema',
                    data: {
                        tables: {},
                        relationships: {},
                        layout: {}
                    },
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                };
                setCurrentSchema(newSchema);
                addToHistory(newSchema);
            };
            
            const saveSchema = async (schema) => {
                try {
                    const url = schema.id ? `/schema-designer/api/schemas/${schema.id}` : '/schema-designer/api/schemas';
                    const method = schema.id ? 'PUT' : 'POST';
                    
                    const response = await fetch(url, {
                        method,
                        headers: {
                            'Content-Type': 'application/json',
                            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content
                        },
                        body: JSON.stringify({
                            name: schema.name,
                            data: schema.data
                        })
                    });
                    
                    const result = await response.json();
                    
                    if (result.success) {
                        if (!schema.id) {
                            schema.id = result.data.id;
                            setSchemas([...schemas, result.data]);
                        }
                        console.log('Schema saved successfully');
                    } else {
                        console.error('Failed to save schema:', result.message);
                    }
                } catch (error) {
                    console.error('Error saving schema:', error);
                }
            };
            
            const loadSchema = async (schemaId) => {
                try {
                    const response = await fetch(`/schema-designer/api/schemas/${schemaId}`);
                    const result = await response.json();
                    
                    if (result.success) {
                        setCurrentSchema(result.data);
                        addToHistory(result.data);
                    }
                } catch (error) {
                    console.error('Error loading schema:', error);
                }
            };
            
            // Table operations
            const addTable = () => {
                if (!currentSchema) return;
                
                const tableId = `table_${Date.now()}`;
                const newTable = {
                    name: 'New Table',
                    columns: {
                        [`col_${Date.now()}`]: {
                            name: 'id',
                            type: 'bigint',
                            primary: true,
                            nullable: false
                        }
                    }
                };
                
                const updated = {
                    ...currentSchema,
                    data: {
                        ...currentSchema.data,
                        tables: {
                            ...currentSchema.data.tables,
                            [tableId]: newTable
                        },
                        layout: {
                            ...currentSchema.data.layout,
                            [tableId]: { x: 100 + Object.keys(currentSchema.data.tables).length * 250, y: 100 }
                        }
                    }
                };
                
                setCurrentSchema(updated);
                addToHistory(updated);
            };
            
            const updateTable = (tableId, updates) => {
                if (!currentSchema) return;
                
                const updated = {
                    ...currentSchema,
                    data: {
                        ...currentSchema.data,
                        tables: {
                            ...currentSchema.data.tables,
                            [tableId]: {
                                ...currentSchema.data.tables[tableId],
                                ...updates
                            }
                        }
                    }
                };
                
                setCurrentSchema(updated);
                addToHistory(updated);
            };
            
            const deleteTable = (tableId) => {
                if (!currentSchema) return;
                
                const tables = { ...currentSchema.data.tables };
                const layout = { ...currentSchema.data.layout };
                const relationships = { ...currentSchema.data.relationships };
                
                delete tables[tableId];
                delete layout[tableId];
                
                // Remove relationships involving this table
                Object.keys(relationships).forEach(relId => {
                    const rel = relationships[relId];
                    if (rel.from_table === tableId || rel.to_table === tableId) {
                        delete relationships[relId];
                    }
                });
                
                const updated = {
                    ...currentSchema,
                    data: {
                        ...currentSchema.data,
                        tables,
                        layout,
                        relationships
                    }
                };
                
                setCurrentSchema(updated);
                addToHistory(updated);
            };
            
            // Canvas operations
            const handleCanvasMouseDown = (e) => {
                if (e.target === canvasRef.current) {
                    setIsDragging(true);
                    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
                }
            };
            
            const handleCanvasMouseMove = (e) => {
                if (isDragging) {
                    setPan({
                        x: e.clientX - dragStart.x,
                        y: e.clientY - dragStart.y
                    });
                }
            };
            
            const handleCanvasMouseUp = () => {
                setIsDragging(false);
            };
            
            const handleZoom = (delta) => {
                const newZoom = Math.max(CONFIG.canvas.min_zoom, Math.min(CONFIG.canvas.max_zoom, zoom + delta));
                setZoom(newZoom);
            };
            
            // Export functionality
            const exportSchema = async (format) => {
                if (!currentSchema || !currentSchema.id) {
                    alert('Please save the schema first');
                    return;
                }
                
                try {
                    const response = await fetch(`/schema-designer/api/schemas/${currentSchema.id}/export`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content
                        },
                        body: JSON.stringify({
                            format,
                            options: {
                                width: canvasRef.current.scrollWidth,
                                height: canvasRef.current.scrollHeight
                            }
                        })
                    });
                    
                    const result = await response.json();
                    
                    if (result.success) {
                        if (format === 'png') {
                            // Use html2canvas for client-side rendering
                            const canvas = await html2canvas(canvasRef.current, {
                                backgroundColor: isDarkMode ? '#1f2937' : '#f9fafb',
                                scale: 2
                            });
                            
                            const link = document.createElement('a');
                            link.download = result.data.filename;
                            link.href = canvas.toDataURL();
                            link.click();
                        } else {
                            // For SVG and PDF, redirect to download URL
                            window.open(result.data.url, '_blank');
                        }
                    }
                } catch (error) {
                    console.error('Export error:', error);
                }
            };
            
            return (
                <div className={`w-full h-screen ${isDarkMode ? 'dark' : ''}`}>
                    {/* Toolbar */}
                    <div className="toolbar bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 flex items-center gap-4">
                        <button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                        >
                            ☰
                        </button>
                        <button
                            onClick={addTable}
                            className="px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                        >
                            + Table
                        </button>
                        <button
                            onClick={undo}
                            disabled={historyIndex <= 0}
                            className="px-3 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 disabled:opacity-50"
                        >
                            ↶ Undo
                        </button>
                        <button
                            onClick={redo}
                            disabled={historyIndex >= history.length - 1}
                            className="px-3 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 disabled:opacity-50"
                        >
                            ↷ Redo
                        </button>
                        <select
                            onChange={(e) => exportSchema(e.target.value)}
                            className="px-3 py-2 border rounded"
                            defaultValue=""
                        >
                            <option value="" disabled>Export as...</option>
                            <option value="png">PNG</option>
                            <option value="svg">SVG</option>
                            <option value="pdf">PDF</option>
                        </select>
                    </div>
                    
                    {/* Zoom Controls */}
                    <div className="zoom-controls bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 flex flex-col items-center gap-2">
                        <button
                            onClick={() => handleZoom(0.1)}
                            className="w-8 h-8 bg-blue-500 text-white rounded hover:bg-blue-600"
                        >
                            +
                        </button>
                        <span className="text-sm font-mono">{Math.round(zoom * 100)}%</span>
                        <button
                            onClick={() => handleZoom(-0.1)}
                            className="w-8 h-8 bg-blue-500 text-white rounded hover:bg-blue-600"
                        >
                            -
                        </button>
                        <button
                            onClick={() => setIsDarkMode(!isDarkMode)}
                            className="w-8 h-8 bg-gray-500 text-white rounded hover:bg-gray-600 mt-2"
                        >
                            {isDarkMode ? '☀' : '🌙'}
                        </button>
                    </div>
                    
                    {/* Sidebar */}
                    <div className={`sidebar bg-white dark:bg-gray-800 shadow-lg ${sidebarOpen ? 'open' : ''}`}>
                        <div className="p-4 border-b dark:border-gray-700">
                            <h2 className="text-lg font-bold dark:text-white">Schemas</h2>
                            <button
                                onClick={() => setSidebarOpen(false)}
                                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
                            >
                                ✕
                            </button>
                        </div>
                        <div className="p-4">
                            <button
                                onClick={createNewSchema}
                                className="w-full px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 mb-4"
                            >
                                New Schema
                            </button>
                            <div className="space-y-2">
                                {schemas.map(schema => (
                                    <div
                                        key={schema.id}
                                        onClick={() => loadSchema(schema.id)}
                                        className="p-3 border rounded cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    >
                                        <div className="font-medium">{schema.name}</div>
                                        <div className="text-sm text-gray-500">
                                            {new Date(schema.updated_at).toLocaleDateString()}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    
                    {/* Main Canvas */}
                    <div
                        ref={canvasRef}
                        className="canvas-grid w-full h-full relative overflow-hidden cursor-grab"
                        style={{
                            transform: `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)`,
                            transformOrigin: '0 0'
                        }}
                        onMouseDown={handleCanvasMouseDown}
                        onMouseMove={handleCanvasMouseMove}
                        onMouseUp={handleCanvasMouseUp}
                        onMouseLeave={handleCanvasMouseUp}
                    >
                        {currentSchema && Object.entries(currentSchema.data.tables).map(([tableId, table]) => {
                            const position = currentSchema.data.layout[tableId] || { x: 100, y: 100 };
                            return (
                                <TableComponent
                                    key={tableId}
                                    tableId={tableId}
                                    table={table}
                                    position={position}
                                    selected={selectedTable === tableId}
                                    onSelect={() => setSelectedTable(tableId)}
                                    onUpdate={(updates) => updateTable(tableId, updates)}
                                    onDelete={() => deleteTable(tableId)}
                                    onMove={(newPosition) => {
                                        const updated = {
                                            ...currentSchema,
                                            data: {
                                                ...currentSchema.data,
                                                layout: {
                                                    ...currentSchema.data.layout,
                                                    [tableId]: newPosition
                                                }
                                            }
                                        };
                                        setCurrentSchema(updated);
                                    }}
                                    isDarkMode={isDarkMode}
                                />
                            );
                        })}
                    </div>
                </div>
            );
        }
        
        // Table Component
        function TableComponent({ tableId, table, position, selected, onSelect, onUpdate, onDelete, onMove, isDarkMode }) {
            const [isEditing, setIsEditing] = useState(false);
            const [editName, setEditName] = useState(table.name);
            const [isDragging, setIsDragging] = useState(false);
            const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
            
            const handleMouseDown = (e) => {
                e.stopPropagation();
                onSelect();
                setIsDragging(true);
                setDragStart({
                    x: e.clientX - position.x,
                    y: e.clientY - position.y
                });
            };
            
            const handleMouseMove = (e) => {
                if (isDragging) {
                    onMove({
                        x: e.clientX - dragStart.x,
                        y: e.clientY - dragStart.y
                    });
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
            }, [isDragging, dragStart]);
            
            const addColumn = () => {
                const columnId = `col_${Date.now()}`;
                const newColumns = {
                    ...table.columns,
                    [columnId]: {
                        name: 'new_column',
                        type: 'varchar',
                        nullable: true
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
                const newColumns = { ...table.columns };
                delete newColumns[columnId];
                onUpdate({ columns: newColumns });
            };
            
            return (
                <div
                    className={`table-container absolute bg-white dark:bg-gray-800 border-2 rounded-lg shadow-lg min-w-48 ${
                        selected ? 'border-blue-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                    style={{ left: position.x, top: position.y }}
                    onMouseDown={handleMouseDown}
                >
                    {/* Table Header */}
                    <div className="bg-gray-100 dark:bg-gray-700 px-4 py-2 rounded-t-lg border-b dark:border-gray-600">
                        {isEditing ? (
                            <input
                                type="text"
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                onBlur={() => {
                                    onUpdate({ name: editName });
                                    setIsEditing(false);
                                }}
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                        onUpdate({ name: editName });
                                        setIsEditing(false);
                                    }
                                }}
                                className="w-full bg-transparent border-none outline-none font-bold text-gray-800 dark:text-white"
                                autoFocus
                            />
                        ) : (
                            <div
                                className="font-bold text-gray-800 dark:text-white cursor-pointer"
                                onDoubleClick={() => setIsEditing(true)}
                            >
                                {table.name}
                            </div>
                        )}
                        {selected && (
                            <div className="absolute top-2 right-2 flex gap-1">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        addColumn();
                                    }}
                                    className="w-6 h-6 bg-green-500 text-white rounded text-xs hover:bg-green-600"
                                >
                                    +
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onDelete();
                                    }}
                                    className="w-6 h-6 bg-red-500 text-white rounded text-xs hover:bg-red-600"
                                >
                                    ×
                                </button>
                            </div>
                        )}
                    </div>
                    
                    {/* Table Columns */}
                    <div className="p-2">
                        {Object.entries(table.columns).map(([columnId, column]) => (
                            <ColumnComponent
                                key={columnId}
                                columnId={columnId}
                                column={column}
                                onUpdate={(updates) => updateColumn(columnId, updates)}
                                onDelete={() => deleteColumn(columnId)}
                                isDarkMode={isDarkMode}
                                tableSelected={selected}
                            />
                        ))}
                    </div>
                </div>
            );
        }
        
        // Column Component
        function ColumnComponent({ columnId, column, onUpdate, onDelete, isDarkMode, tableSelected }) {
            const [isEditing, setIsEditing] = useState(false);
            const [editName, setEditName] = useState(column.name);
            const [editType, setEditType] = useState(column.type);
            
            const columnTypes = ['varchar', 'int', 'bigint', 'text', 'boolean', 'datetime', 'timestamp', 'decimal', 'float'];
            
            return (
                <div className="flex items-center justify-between py-1 px-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded">
                    <div className="flex-1">
                        {isEditing ? (
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={editName}
                                    onChange={(e) => setEditName(e.target.value)}
                                    className="flex-1 text-sm bg-transparent border border-gray-300 rounded px-1 dark:border-gray-600 dark:text-white"
                                />
                                <select
                                    value={editType}
                                    onChange={(e) => setEditType(e.target.value)}
                                    className="text-sm bg-transparent border border-gray-300 rounded px-1 dark:border-gray-600 dark:text-white"
                                >
                                    {columnTypes.map(type => (
                                        <option key={type} value={type}>{type}</option>
                                    ))}
                                </select>
                            </div>
                        ) : (
                            <div
                                className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer"
                                onDoubleClick={() => setIsEditing(true)}
                            >
                                <span className="font-medium">{column.name}</span>
                                <span className="text-gray-500 ml-2">{column.type}</span>
                                {column.primary && <span className="text-yellow-500 ml-1">🔑</span>}
                                {column.nullable === false && <span className="text-red-500 ml-1">*</span>}
                            </div>
                        )}
                    </div>
                    
                    {tableSelected && (
                        <div className="flex gap-1 ml-2">
                            {isEditing ? (
                                <>
                                    <button
                                        onClick={() => {
                                            onUpdate({ name: editName, type: editType });
                                            setIsEditing(false);
                                        }}
                                        className="w-4 h-4 bg-blue-500 text-white rounded text-xs hover:bg-blue-600"
                                    >
                                        ✓
                                    </button>
                                    <button
                                        onClick={() => setIsEditing(false)}
                                        className="w-4 h-4 bg-gray-500 text-white rounded text-xs hover:bg-gray-600"
                                    >
                                        ✕
                                    </button>
                                </>
                            ) : (
                                <button
                                    onClick={onDelete}
                                    className="w-4 h-4 bg-red-500 text-white rounded text-xs hover:bg-red-600"
                                >
                                    ×
                                </button>
                            )}
                        </div>
                    )}
                </div>
            );
        }
        
        // Render the app
        ReactDOM.render(<SchemaDesignerApp />, document.getElementById('schema-designer-app'));
    </script>
</body>
</html>
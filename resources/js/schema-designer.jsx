import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createRoot } from 'react-dom/client';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

// Import components
import { Toolbar, ZoomControls, StatusBar } from './components/Controls.jsx';
import { Sidebar } from './components/Sidebar.jsx';
import { TableComponent } from './components/Table.jsx';
import { RelationshipLine } from './components/Relationship.jsx';

// Main Schema Designer App
export function SchemaDesignerApp({ initialSchemas = [], config = {} }) {
    const [schemas, setSchemas] = useState(initialSchemas);
    const [currentSchema, setCurrentSchema] = useState(null);
    const [isDarkMode, setIsDarkMode] = useState(config.theme?.default_theme === 'dark');
    const [zoom, setZoom] = useState(config.canvas?.default_zoom || 1.0);
    const [pan, setPan] = useState({ x: 0, y: 0 });
    const [selectedTable, setSelectedTable] = useState(null);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [history, setHistory] = useState([]);
    const [historyIndex, setHistoryIndex] = useState(-1);
    const [isLoading, setIsLoading] = useState(false);

    const canvasRef = useRef(null);
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

    // Initialize with empty schema if none exists
    useEffect(() => {
        if (schemas.length === 0) {
            createNewSchema();
        } else if (!currentSchema && schemas.length > 0) {
            loadSchema(schemas[0].id);
        }
    }, [schemas]);

    // Auto-save current schema
    useEffect(() => {
        if (currentSchema && currentSchema.id && historyIndex >= 0) {
            const saveTimer = setTimeout(() => {
                saveSchema(currentSchema);
            }, 2000);
            
            return () => clearTimeout(saveTimer);
        }
    }, [currentSchema, historyIndex]);

    // History management
    const addToHistory = useCallback((schema) => {
        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push(JSON.parse(JSON.stringify(schema)));
        setHistory(newHistory);
        setHistoryIndex(newHistory.length - 1);
    }, [history, historyIndex]);

    const undo = () => {
        if (historyIndex > 0) {
            const prevSchema = history[historyIndex - 1];
            setCurrentSchema(prevSchema);
            setHistoryIndex(historyIndex - 1);
        }
    };

    const redo = () => {
        if (historyIndex < history.length - 1) {
            const nextSchema = history[historyIndex + 1];
            setCurrentSchema(nextSchema);
            setHistoryIndex(historyIndex + 1);
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
        if (!schema) return;
        
        try {
            setIsLoading(true);
            const url = schema.id ? `/schema-designer/api/schemas/${schema.id}` : '/schema-designer/api/schemas';
            const method = schema.id ? 'PUT' : 'POST';
            
            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content || ''
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
                    setSchemas(prev => [...prev, result.data]);
                } else {
                    setSchemas(prev => prev.map(s => s.id === schema.id ? result.data : s));
                }
                console.log('Schema saved successfully');
            } else {
                console.error('Failed to save schema:', result.message);
                alert('Failed to save schema: ' + result.message);
            }
        } catch (error) {
            console.error('Error saving schema:', error);
            alert('Error saving schema. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const loadSchema = async (schemaId) => {
        try {
            setIsLoading(true);
            const response = await fetch(`/schema-designer/api/schemas/${schemaId}`);
            const result = await response.json();
            
            if (result.success) {
                setCurrentSchema(result.data);
                setHistory([result.data]);
                setHistoryIndex(0);
            } else {
                alert('Failed to load schema');
            }
        } catch (error) {
            console.error('Error loading schema:', error);
            alert('Error loading schema');
        } finally {
            setIsLoading(false);
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
                    [tableId]: { 
                        x: 100 + Object.keys(currentSchema.data.tables).length * 250, 
                        y: 100 
                    }
                }
            },
            updated_at: new Date().toISOString()
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
            },
            updated_at: new Date().toISOString()
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
            },
            updated_at: new Date().toISOString()
        };
        
        setCurrentSchema(updated);
        addToHistory(updated);
        
        if (selectedTable === tableId) {
            setSelectedTable(null);
        }
    };

    const updateTablePosition = (tableId, newPosition) => {
        if (!currentSchema) return;
        
        const updated = {
            ...currentSchema,
            data: {
                ...currentSchema.data,
                layout: {
                    ...currentSchema.data.layout,
                    [tableId]: newPosition
                }
            },
            updated_at: new Date().toISOString()
        };
        
        setCurrentSchema(updated);
    };

    // Canvas operations
    const handleCanvasMouseDown = (e) => {
        if (e.target === canvasRef.current) {
            setIsDragging(true);
            setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
            setSelectedTable(null);
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
        const minZoom = config.canvas?.min_zoom || 0.1;
        const maxZoom = config.canvas?.max_zoom || 3.0;
        const newZoom = Math.max(minZoom, Math.min(maxZoom, zoom + delta));
        setZoom(newZoom);
    };

    const resetView = () => {
        setZoom(1.0);
        setPan({ x: 0, y: 0 });
    };

    // Export functionality
    const exportSchema = async (format) => {
        if (!currentSchema) {
            alert('No schema to export');
            return;
        }

        try {
            setIsLoading(true);
            
            if (format === 'png') {
                // Client-side PNG export using html2canvas
                const canvas = await html2canvas(canvasRef.current, {
                    backgroundColor: isDarkMode ? '#1f2937' : '#f9fafb',
                    scale: 2,
                    useCORS: true,
                    allowTaint: true
                });
                
                const link = document.createElement('a');
                link.download = `${currentSchema.name || 'schema'}_${new Date().toISOString().slice(0, 10)}.png`;
                link.href = canvas.toDataURL('image/png');
                link.click();
                
            } else if (format === 'pdf') {
                // Client-side PDF export
                const canvas = await html2canvas(canvasRef.current, {
                    backgroundColor: isDarkMode ? '#1f2937' : '#f9fafb',
                    scale: 1,
                    useCORS: true,
                    allowTaint: true
                });
                
                const imgData = canvas.toDataURL('image/png');
                const pdf = new jsPDF('landscape', 'mm', 'a4');
                const imgWidth = 297;
                const imgHeight = (canvas.height * imgWidth) / canvas.width;
                
                pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
                pdf.save(`${currentSchema.name || 'schema'}_${new Date().toISOString().slice(0, 10)}.pdf`);
                
            } else {
                // Server-side export for SVG and other formats
                if (!currentSchema.id) {
                    alert('Please save the schema first');
                    return;
                }
                
                const response = await fetch(`/schema-designer/api/schemas/${currentSchema.id}/export`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content || ''
                    },
                    body: JSON.stringify({
                        format,
                        options: {
                            width: canvasRef.current.scrollWidth,
                            height: canvasRef.current.scrollHeight,
                            dark_mode: isDarkMode
                        }
                    })
                });
                
                const result = await response.json();
                
                if (result.success) {
                    window.open(result.data.url, '_blank');
                } else {
                    alert('Export failed: ' + result.message);
                }
            }
        } catch (error) {
            console.error('Export error:', error);
            alert('Export failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch (e.key) {
                    case 'z':
                        e.preventDefault();
                        if (e.shiftKey) {
                            redo();
                        } else {
                            undo();
                        }
                        break;
                    case 's':
                        e.preventDefault();
                        if (currentSchema) {
                            saveSchema(currentSchema);
                        }
                        break;
                    case 'n':
                        e.preventDefault();
                        createNewSchema();
                        break;
                }
            }
            
            if (e.key === 'Delete' && selectedTable) {
                deleteTable(selectedTable);
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [currentSchema, selectedTable, historyIndex]);

    if (!currentSchema) {
        return (
            <div className="w-full h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-gray-600 dark:text-gray-400">Loading schema designer...</p>
                </div>
            </div>
        );
    }

    return (
        <div className={`w-full h-screen ${isDarkMode ? 'dark' : ''} bg-gray-50 dark:bg-gray-900`}>
            {/* Loading Overlay */}
            {isLoading && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 flex items-center gap-4">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                        <span className="text-gray-700 dark:text-gray-300">Processing...</span>
                    </div>
                </div>
            )}

            {/* Toolbar */}
            <Toolbar
                onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
                onAddTable={addTable}
                onUndo={undo}
                onRedo={redo}
                onExport={exportSchema}
                canUndo={historyIndex > 0}
                canRedo={historyIndex < history.length - 1}
                isDarkMode={isDarkMode}
            />

            {/* Zoom Controls */}
            <ZoomControls
                zoom={zoom}
                onZoomIn={() => handleZoom(0.1)}
                onZoomOut={() => handleZoom(-0.1)}
                onReset={resetView}
                onToggleTheme={() => setIsDarkMode(!isDarkMode)}
                isDarkMode={isDarkMode}
            />

            {/* Sidebar */}
            <Sidebar
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
                schemas={schemas}
                currentSchema={currentSchema}
                onNewSchema={createNewSchema}
                onLoadSchema={loadSchema}
                onUpdateSchemaName={(name) => {
                    const updated = { ...currentSchema, name, updated_at: new Date().toISOString() };
                    setCurrentSchema(updated);
                    addToHistory(updated);
                }}
                isDarkMode={isDarkMode}
            />

            {/* Main Canvas */}
            <div
                ref={canvasRef}
                className="canvas-grid w-full h-full relative overflow-hidden cursor-grab select-none"
                style={{
                    transform: `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)`,
                    transformOrigin: '0 0'
                }}
                onMouseDown={handleCanvasMouseDown}
                onMouseMove={handleCanvasMouseMove}
                onMouseUp={handleCanvasMouseUp}
                onMouseLeave={handleCanvasMouseUp}
            >
                {Object.entries(currentSchema.data.tables).map(([tableId, table]) => {
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
                            onMove={(newPosition) => updateTablePosition(tableId, newPosition)}
                            isDarkMode={isDarkMode}
                            snapToGrid={config.canvas?.snap_to_grid}
                            gridSize={config.canvas?.grid_size || 20}
                        />
                    );
                })}

                {/* Relationships */}
                {Object.entries(currentSchema.data.relationships || {}).map(([relId, relationship]) => (
                    <RelationshipLine
                        key={relId}
                        relationship={relationship}
                        tables={currentSchema.data.tables}
                        layout={currentSchema.data.layout}
                        isDarkMode={isDarkMode}
                    />
                ))}
            </div>

            {/* Status Bar */}
            <StatusBar
                currentSchema={currentSchema}
                tableCount={Object.keys(currentSchema.data.tables).length}
                relationshipCount={Object.keys(currentSchema.data.relationships || {}).length}
                zoom={zoom}
                isDarkMode={isDarkMode}
            />
        </div>
    );
}

// Initialize the app
const container = document.getElementById('schema-designer-app');
if (container) {
    const root = createRoot(container);
    const initialSchemas = window.INITIAL_SCHEMAS || [];
    const config = window.CONFIG || {};
    
    root.render(
        <SchemaDesignerApp 
            initialSchemas={initialSchemas} 
            config={config} 
        />
    );
}
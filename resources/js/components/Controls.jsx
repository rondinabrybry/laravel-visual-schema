import React from 'react';

export function Toolbar({ 
    onToggleSidebar, 
    onAddTable, 
    onUndo, 
    onRedo, 
    onExport, 
    canUndo, 
    canRedo, 
    isDarkMode 
}) {
    return (
        <div className="toolbar fixed top-4 left-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 flex items-center gap-4 z-40">
            <button
                onClick={onToggleSidebar}
                className="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                title="Toggle Sidebar"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
            </button>
            
            <div className="h-6 w-px bg-gray-300 dark:bg-gray-600"></div>
            
            <button
                onClick={onAddTable}
                className="px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors flex items-center gap-2"
                title="Add Table (Ctrl+T)"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Table
            </button>
            
            <div className="h-6 w-px bg-gray-300 dark:bg-gray-600"></div>
            
            <button
                onClick={onUndo}
                disabled={!canUndo}
                className="px-3 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="Undo (Ctrl+Z)"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                </svg>
            </button>
            
            <button
                onClick={onRedo}
                disabled={!canRedo}
                className="px-3 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="Redo (Ctrl+Shift+Z)"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10h-10a8 8 0 00-8 8v2m18-10l-6 6m6-6l-6-6" />
                </svg>
            </button>
            
            <div className="h-6 w-px bg-gray-300 dark:bg-gray-600"></div>
            
            <div className="relative">
                <select
                    onChange={(e) => {
                        if (e.target.value) {
                            onExport(e.target.value);
                            e.target.value = '';
                        }
                    }}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    defaultValue=""
                >
                    <option value="" disabled>Export as...</option>
                    <option value="png">PNG Image</option>
                    <option value="svg">SVG Vector</option>
                    <option value="pdf">PDF Document</option>
                </select>
            </div>
        </div>
    );
}

export function ZoomControls({ zoom, onZoomIn, onZoomOut, onReset, onToggleTheme, isDarkMode }) {
    return (
        <div className="zoom-controls fixed top-4 right-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 flex flex-col items-center gap-2 z-40">
            <button
                onClick={onZoomIn}
                className="w-8 h-8 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors flex items-center justify-center"
                title="Zoom In"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
            </button>
            
            <span className="text-sm font-mono text-gray-600 dark:text-gray-400 min-w-12 text-center">
                {Math.round(zoom * 100)}%
            </span>
            
            <button
                onClick={onZoomOut}
                className="w-8 h-8 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors flex items-center justify-center"
                title="Zoom Out"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                </svg>
            </button>
            
            <button
                onClick={onReset}
                className="w-8 h-8 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors flex items-center justify-center mt-2"
                title="Reset View"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                </svg>
            </button>
            
            <div className="h-px w-full bg-gray-300 dark:bg-gray-600 my-2"></div>
            
            <button
                onClick={onToggleTheme}
                className="w-8 h-8 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors flex items-center justify-center"
                title="Toggle Theme"
            >
                {isDarkMode ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                    </svg>
                )}
            </button>
        </div>
    );
}

export function StatusBar({ currentSchema, tableCount, relationshipCount, zoom, isDarkMode }) {
    return (
        <div className="fixed bottom-4 left-4 right-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg px-4 py-2 flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 z-30">
            <div className="flex items-center gap-4">
                <span className="font-medium text-gray-800 dark:text-gray-200">
                    {currentSchema.name}
                </span>
                <span>Tables: {tableCount}</span>
                <span>Relationships: {relationshipCount}</span>
            </div>
            
            <div className="flex items-center gap-4">
                <span>Zoom: {Math.round(zoom * 100)}%</span>
                <span className="text-xs">
                    {currentSchema.id ? 'Saved' : 'Unsaved'}
                </span>
            </div>
        </div>
    );
}

import React from 'react';
import type { HistoryEntry } from '../types';
import { HistoryIcon, RevertIcon } from './icons';

interface HistoryPanelProps {
    history: HistoryEntry[];
    onRevert: (code: string) => void;
}

export const HistoryPanel: React.FC<HistoryPanelProps> = ({ history, onRevert }) => {
    return (
        <div className="flex flex-col h-1/3 lg:h-1/2 bg-gray-800 border-t border-gray-700">
            <h2 className="text-lg font-semibold p-3 border-b border-gray-700 bg-gray-800/70 flex items-center">
                <HistoryIcon className="w-5 h-5 mr-2" /> Version History
            </h2>
            <div className="flex-grow p-2 overflow-y-auto custom-scrollbar">
                {history.length === 0 ? (
                    <div className="text-center text-gray-500 pt-4">No versions saved yet.</div>
                ) : (
                    <ul className="space-y-2">
                        {[...history].reverse().map((entry) => (
                             <li key={entry.id} className="flex items-center justify-between p-2 bg-gray-700 rounded-md hover:bg-gray-600/70 transition-colors group">
                                <div className="flex items-center">
                                    <div className="text-sm text-gray-400 mr-3">{entry.timestamp}</div>
                                    <code className="text-xs text-cyan-400 truncate max-w-xs">{entry.code.substring(0, 40).replace(/\n/g, ' ')}...</code>
                                </div>
                                <button
                                    onClick={() => onRevert(entry.code)}
                                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-md bg-cyan-600 hover:bg-cyan-500"
                                    title="Revert to this version"
                                >
                                    <RevertIcon className="w-4 h-4 text-white" />
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

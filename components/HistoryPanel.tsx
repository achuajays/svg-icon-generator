
import React from 'react';
import type { HistoryEntry } from '../types';
import { HistoryIcon, RevertIcon } from './icons';

interface HistoryPanelProps {
    history: HistoryEntry[];
    onRevert: (code: string) => void;
}

export const HistoryPanel: React.FC<HistoryPanelProps> = ({ history, onRevert }) => {
    return (
        <div className="flex flex-col h-1/3 lg:h-1/2 professional-card rounded-none border-t border-slate-200">
            <h2 className="text-lg font-semibold p-4 border-b border-slate-200 bg-white/80 flex items-center text-slate-700">
                <HistoryIcon className="w-5 h-5 mr-2 text-slate-600" /> Version History
            </h2>
            <div className="flex-grow p-3 overflow-y-auto custom-scrollbar bg-white/50">
                {history.length === 0 ? (
                    <div className="text-center text-slate-500 pt-6 text-sm">No versions saved yet.</div>
                ) : (
                    <ul className="space-y-3">
                        {[...history].reverse().map((entry) => (
                             <li key={entry.id} className="flex items-center justify-between p-3 bg-white rounded-lg hover:bg-slate-50 transition-colors group shadow-professional border border-slate-100">
                                <div className="flex items-center">
                                    <div className="text-sm text-slate-500 mr-3 font-medium">{entry.timestamp}</div>
                                    <code className="text-xs text-blue-600 truncate max-w-xs bg-blue-50 px-2 py-1 rounded">{entry.code.substring(0, 40).replace(/\n/g, ' ')}...</code>
                                </div>
                                <button
                                    onClick={() => onRevert(entry.code)}
                                    className="opacity-0 group-hover:opacity-100 transition-all p-2 rounded-lg bg-blue-600 hover:bg-blue-700 professional-button shadow-professional"
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

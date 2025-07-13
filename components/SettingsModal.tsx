import React, { useState, useEffect } from 'react';
import { CloseIcon } from './icons';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onApiKeyChange: (apiKey: string) => void;
    currentApiKey: string;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ 
    isOpen, 
    onClose, 
    onApiKeyChange, 
    currentApiKey 
}) => {
    const [apiKey, setApiKey] = useState(currentApiKey);
    const [showAbout, setShowAbout] = useState(false);

    useEffect(() => {
        setApiKey(currentApiKey);
    }, [currentApiKey]);

    if (!isOpen) return null;

    const handleSave = () => {
        onApiKeyChange(apiKey);
        onClose();
    };

    const handleOverlayClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={handleOverlayClick}>
            <div className="bg-white rounded-lg shadow-professional-lg w-full max-w-md mx-4">
                <div className="flex items-center justify-between p-6 border-b border-slate-200">
                    <h2 className="text-xl font-semibold text-slate-800">Settings</h2>
                    <button 
                        onClick={onClose}
                        className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                        <CloseIcon className="w-5 h-5 text-slate-500" />
                    </button>
                </div>
                
                <div className="p-6 space-y-6">
                    {!showAbout ? (
                        <>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Gemini API Key
                                </label>
                                <input
                                    type="password"
                                    value={apiKey}
                                    onChange={(e) => setApiKey(e.target.value)}
                                    placeholder="Enter your Gemini API key"
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent input-professional"
                                />
                                <p className="text-xs text-slate-500 mt-1">
                                    Get your API key from <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Google AI Studio</a>
                                </p>
                            </div>
                            
                            <div className="space-y-3">
                                <button
                                    onClick={() => setShowAbout(true)}
                                    className="w-full text-left px-4 py-3 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors text-slate-700"
                                >
                                    About
                                </button>
                                <button
                                    onClick={() => {
                                        setApiKey('');
                                        onApiKeyChange('');
                                    }}
                                    className="w-full text-left px-4 py-3 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors text-slate-700"
                                >
                                    Clear API Key
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="space-y-4">
                            <button
                                onClick={() => setShowAbout(false)}
                                className="text-blue-600 hover:underline text-sm"
                            >
                                ← Back to Settings
                            </button>
                            <div>
                                <h3 className="text-lg font-semibold text-slate-800 mb-3">About AI SVG Icon Generator</h3>
                                <div className="space-y-3 text-sm text-slate-600">
                                    <p>
                                        A powerful AI-powered tool for creating and editing SVG icons using natural language descriptions.
                                    </p>
                                    <p>
                                        <strong>Features:</strong>
                                    </p>
                                    <ul className="list-disc list-inside space-y-1 ml-4">
                                        <li>Generate SVG icons from text descriptions</li>
                                        <li>Convert images to SVG format</li>
                                        <li>Real-time code editing and preview</li>
                                        <li>Prompt optimization for better results</li>
                                        <li>Download and copy functionality</li>
                                    </ul>
                                    <p>
                                        <strong>Version:</strong> 1.0.0
                                    </p>
                                    <p>
                                        Powered by Google's Gemini AI
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
                
                {!showAbout && (
                    <div className="flex justify-end gap-3 p-6 border-t border-slate-200">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors professional-button shadow-professional"
                        >
                            Save
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
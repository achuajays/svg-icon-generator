
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { ChatPanel } from './components/ChatPanel';
import { EditorPanel } from './components/EditorPanel';
import { SettingsModal } from './components/SettingsModal';
import { LogoIcon, SettingsIcon } from './components/icons';
import type { ChatMessage } from './types';
import { generateSvgFromText, generateSvgFromImage, optimizeSvg, optimizePrompt } from './services/geminiService';

const App: React.FC = () => {
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
        { role: 'ai', content: 'Hello! Describe the SVG you want to create, or upload an image to start. For example, try "a simple sun with rays".' }
    ]);
    const [svgCode, setSvgCode] = useState<string>('<svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"></svg>');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [showSettings, setShowSettings] = useState<boolean>(false);
    const [apiKey, setApiKey] = useState<string>('');
    const [showToast, setShowToast] = useState<boolean>(false);
    const [toastMessage, setToastMessage] = useState<string>('');

    // Initialize API key from environment or localStorage
    useEffect(() => {
        const envApiKey = process.env.GEMINI_API_KEY;
        const storedApiKey = localStorage.getItem('gemini_api_key');
        
        if (storedApiKey) {
            setApiKey(storedApiKey);
        } else if (envApiKey) {
            setApiKey(envApiKey);
        }
    }, []);

    const showToastMessage = (message: string) => {
        setToastMessage(message);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
    };

    const handleSendMessage = useCallback(async (message: string, image: string | null) => {
        if (!apiKey) {
            showToastMessage('Cannot generate: No API key provided. Please configure your Gemini API key in settings.');
            return;
        }
        
        setError(null);
        const newUserMessage: ChatMessage = { role: 'user', content: message, image };
        setChatMessages(prev => [...prev, newUserMessage]);
        setIsLoading(true);

        try {
            let responseSvg: string | null = null;
            if (image) {
                setChatMessages(prev => [...prev, { role: 'ai', content: 'Analyzing image and converting to SVG...' }]);
                responseSvg = await generateSvgFromImage(image, message);
            } else if (message.toLowerCase().includes('optimize') || message.toLowerCase().includes('simplify')) {
                 setChatMessages(prev => [...prev, { role: 'ai', content: 'Optimizing the current SVG...' }]);
                 responseSvg = await optimizeSvg(svgCode, message);
            } else {
                setChatMessages(prev => [...prev, { role: 'ai', content: 'Generating SVG from your description...' }]);
                const conversationHistory = chatMessages.map(m => `${m.role}: ${m.content}`).join('\n');
                responseSvg = await generateSvgFromText(message, conversationHistory, svgCode);
            }

            if (responseSvg) {
                const cleanedSvg = responseSvg.replace(/```svg\n|```/g, '').trim();
                setSvgCode(cleanedSvg);
                setChatMessages(prev => {
                    const lastMessage = prev[prev.length - 1];
                    if (lastMessage.role === 'ai' && lastMessage.content.includes('...')) {
                        return [...prev.slice(0, -1), { role: 'ai', content: 'Done! Here is the new SVG.' }];
                    }
                    return [...prev, { role: 'ai', content: 'Done! Here is the new SVG.' }];
                });
            } else {
                throw new Error('The AI did not return valid SVG code.');
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
            setError(errorMessage);
            setChatMessages(prev => [...prev, { role: 'ai', content: `Sorry, something went wrong: ${errorMessage}` }]);
        } finally {
            setIsLoading(false);
        }
    }, [chatMessages, svgCode]);

    const handleOptimizePrompt = useCallback(async (prompt: string) => {
        if (!apiKey) {
            showToastMessage('Cannot optimize prompt: No API key provided. Please configure your Gemini API key in settings.');
            return;
        }
        
        setIsLoading(true);
        try {
            const optimizedPrompt = await optimizePrompt(prompt);
            setChatMessages(prev => [...prev, 
                { role: 'user', content: `Optimize this prompt: "${prompt}"` },
                { role: 'ai', content: `Here's an optimized version: "${optimizedPrompt}"` }
            ]);
            
            // Update the input field in ChatPanel by triggering a re-render
            // We'll need to pass the optimized prompt back to update the input
            return optimizedPrompt;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to optimize prompt.';
            setChatMessages(prev => [...prev, { role: 'ai', content: `Sorry, couldn't optimize the prompt: ${errorMessage}` }]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const handleEditorChange = (newCode: string) => {
        setSvgCode(newCode);
    };

    const handleApiKeyChange = (newApiKey: string) => {
        setApiKey(newApiKey);
        if (newApiKey) {
            localStorage.setItem('gemini_api_key', newApiKey);
            // Update the service with new API key
            process.env.GEMINI_API_KEY = newApiKey;
        } else {
            localStorage.removeItem('gemini_api_key');
        }
    };

    return (
        <div className="flex flex-col h-screen bg-gradient-to-br from-blue-50 to-indigo-100 text-slate-800">
            <header className="flex items-center p-4 glass-effect shadow-professional">
                <div className="flex items-center flex-grow">
                    <LogoIcon className="w-8 h-8 text-blue-600 mr-3" />
                    <h1 className="text-xl font-bold text-slate-800">AI SVG Icon Generator</h1>
                </div>
                <button
                    onClick={() => setShowSettings(true)}
                    className="p-2 text-slate-600 hover:text-blue-600 rounded-lg transition-colors professional-button"
                    title="Settings"
                >
                    <SettingsIcon className="w-6 h-6" />
                </button>
            </header>

            {/* Toast Notification */}
            {showToast && (
                <div className="fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-professional-lg z-50 animate-pulse">
                    {toastMessage}
                </div>
            )}

            {error && (
                <div className="bg-red-50 text-red-800 p-3 text-center border-b border-red-200">
                    <strong>Error:</strong> {error}
                </div>
            )}

            <main className="flex-grow flex flex-col lg:flex-row overflow-hidden">
                {/* Left Pane: Chat & History */}
                <div className="w-full lg:w-1/3 h-1/2 lg:h-full border-r border-slate-200">
                    <ChatPanel
                        messages={chatMessages}
                        onSendMessage={handleSendMessage}
                        onOptimizePrompt={handleOptimizePrompt}
                        isLoading={isLoading}
                    />
                </div>

                {/* Right Pane: Editor & Preview */}
                <div className="w-full lg:w-2/3 h-1/2 lg:h-full">
                   <EditorPanel 
                        svgCode={svgCode} 
                        onCodeChange={handleEditorChange}
                    />
                </div>
            </main>
            
            <SettingsModal
                isOpen={showSettings}
                onClose={() => setShowSettings(false)}
                onApiKeyChange={handleApiKeyChange}
                currentApiKey={apiKey}
            />
        </div>
    );
};

export default App;

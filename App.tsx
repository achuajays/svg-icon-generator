
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { ChatPanel } from './components/ChatPanel';
import { EditorPanel } from './components/EditorPanel';
import { HistoryPanel } from './components/HistoryPanel';
import { LogoIcon } from './components/icons';
import type { ChatMessage, HistoryEntry } from './types';
import { generateSvgFromText, generateSvgFromImage, optimizeSvg, optimizePrompt } from './services/geminiService';

const App: React.FC = () => {
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
        { role: 'ai', content: 'Hello! Describe the SVG you want to create, or upload an image to start. For example, try "a simple sun with rays".' }
    ]);
    const [svgCode, setSvgCode] = useState<string>('<svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"></svg>');
    const [svgHistory, setSvgHistory] = useState<HistoryEntry[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const historyIdCounter = useRef(0);

    const addHistoryEntry = useCallback((newSvgCode: string) => {
        if (newSvgCode.trim() === (svgHistory[svgHistory.length - 1]?.code || '').trim()) {
            return;
        }
        const newEntry: HistoryEntry = {
            id: ++historyIdCounter.current,
            timestamp: new Date().toLocaleTimeString(),
            code: newSvgCode
        };
        setSvgHistory(prev => [...prev, newEntry]);
    }, [svgHistory]);
    
    useEffect(() => {
        if(svgCode) {
            addHistoryEntry(svgCode);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);


    const handleSendMessage = useCallback(async (message: string, image: string | null) => {
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
                addHistoryEntry(cleanedSvg);
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
    }, [chatMessages, svgCode, addHistoryEntry]);

    const handleOptimizePrompt = useCallback(async (prompt: string) => {
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

    const handleRevertToVersion = useCallback((code: string) => {
        setSvgCode(code);
        setChatMessages(prev => [...prev, { role: 'ai', content: 'Reverted to a previous version.' }]);
    }, []);
    
    const handleEditorChange = (newCode: string) => {
        setSvgCode(newCode);
    };

    const handleSaveVersion = () => {
        addHistoryEntry(svgCode);
        setChatMessages(prev => [...prev, { role: 'ai', content: 'Manually saved current SVG as a new version.' }]);
    };

    return (
        <div className="flex flex-col h-screen bg-gradient-to-br from-blue-50 to-indigo-100 text-slate-800">
            <header className="flex items-center p-4 glass-effect shadow-professional">
                <LogoIcon className="w-8 h-8 text-blue-600 mr-3" />
                <h1 className="text-xl font-bold text-slate-800">AI SVG Icon Generator</h1>
            </header>

            {error && (
                <div className="bg-red-50 text-red-800 p-3 text-center border-b border-red-200">
                    <strong>Error:</strong> {error}
                </div>
            )}

            <main className="flex-grow flex flex-col lg:flex-row overflow-hidden">
                {/* Left Pane: Chat & History */}
                <div className="w-full lg:w-1/3 flex flex-col h-1/2 lg:h-full border-r border-slate-200">
                    <ChatPanel
                        messages={chatMessages}
                        onSendMessage={handleSendMessage}
                        onOptimizePrompt={handleOptimizePrompt}
                        isLoading={isLoading}
                    />
                    <HistoryPanel
                        history={svgHistory}
                        onRevert={handleRevertToVersion}
                    />
                </div>

                {/* Right Pane: Editor & Preview */}
                <div className="w-full lg:w-2/3 flex-grow flex flex-col h-1/2 lg:h-full">
                   <EditorPanel 
                        svgCode={svgCode} 
                        onCodeChange={handleEditorChange}
                        onSaveVersion={handleSaveVersion}
                    />
                </div>
            </main>
        </div>
    );
};

export default App;

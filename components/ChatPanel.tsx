
import React, { useState, useRef, useCallback, useEffect } from 'react';
import type { ChatMessage } from '../types';
import { AILogo, UserLogo, SendIcon, PaperclipIcon, CloseIcon, LoadingSpinner } from './icons';

interface ChatPanelProps {
    messages: ChatMessage[];
    onSendMessage: (message: string, image: string | null) => void;
    isLoading: boolean;
}

export const ChatPanel: React.FC<ChatPanelProps> = ({ messages, onSendMessage, isLoading }) => {
    const [input, setInput] = useState('');
    const [image, setImage] = useState<string | null>(null);
    const [imageName, setImageName] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = () => {
        if (input.trim() || image) {
            onSendMessage(input, image);
            setInput('');
            setImage(null);
            setImageName(null);
            if(fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && (file.type === 'image/png' || file.type === 'image/jpeg')) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImage(reader.result as string);
                setImageName(file.name);
            };
            reader.readAsDataURL(file);
        }
    };

    const removeImage = () => {
        setImage(null);
        setImageName(null);
        if(fileInputRef.current) fileInputRef.current.value = "";
    }

    return (
        <div className="flex flex-col h-full bg-gray-800">
            <h2 className="text-lg font-semibold p-3 border-b border-gray-700 bg-gray-800/70">Conversation</h2>
            <div className="flex-grow p-4 overflow-y-auto custom-scrollbar">
                <div className="space-y-6">
                    {messages.map((msg, index) => (
                        <div key={index} className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                            {msg.role === 'ai' && <div className="w-8 h-8 flex-shrink-0 bg-cyan-900 rounded-full flex items-center justify-center"><AILogo className="w-5 h-5 text-cyan-400" /></div>}
                            <div className={`p-3 rounded-lg max-w-lg ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-br-none' : 'bg-gray-700 text-gray-300 rounded-bl-none'}`}>
                                <p className="whitespace-pre-wrap">{msg.content}</p>
                                {msg.image && <img src={msg.image} alt="User upload" className="mt-2 rounded-md max-h-40" />}
                            </div>
                             {msg.role === 'user' && <div className="w-8 h-8 flex-shrink-0 bg-gray-600 rounded-full flex items-center justify-center"><UserLogo className="w-5 h-5 text-gray-200" /></div>}
                        </div>
                    ))}
                    {isLoading && (
                         <div className="flex items-start gap-3">
                            <div className="w-8 h-8 flex-shrink-0 bg-cyan-900 rounded-full flex items-center justify-center"><LoadingSpinner className="w-5 h-5 text-cyan-400" /></div>
                             <div className="p-3 rounded-lg bg-gray-700 text-gray-400 rounded-bl-none italic">
                                Thinking...
                             </div>
                         </div>
                    )}
                </div>
                <div ref={messagesEndRef} />
            </div>
            <div className="p-3 border-t border-gray-700 bg-gray-800/70">
                {imageName && (
                     <div className="mb-2 flex items-center justify-between bg-gray-700 p-2 rounded-md text-sm">
                        <span className="truncate text-gray-300">{imageName}</span>
                        <button onClick={removeImage} className="p-1 rounded-full hover:bg-gray-600">
                            <CloseIcon className="w-4 h-4" />
                        </button>
                    </div>
                )}
                <div className="flex items-center gap-2 bg-gray-700 rounded-lg p-1">
                    <button onClick={() => fileInputRef.current?.click()} className="p-2 text-gray-400 hover:text-cyan-400 rounded-md transition-colors">
                        <PaperclipIcon className="w-5 h-5" />
                    </button>
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/png, image/jpeg" className="hidden" />
                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Type your message..."
                        rows={1}
                        className="flex-grow bg-transparent focus:outline-none resize-none text-gray-200 placeholder-gray-500 max-h-24 custom-scrollbar"
                    />
                    <button onClick={handleSend} disabled={isLoading} className="p-2 bg-cyan-600 text-white rounded-md hover:bg-cyan-500 disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors">
                        <SendIcon className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
};

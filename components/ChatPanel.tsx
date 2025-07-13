
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
        <div className="flex flex-col h-full professional-card rounded-none">
            <h2 className="text-lg font-semibold p-4 border-b border-slate-200 bg-white/80 text-slate-700">Conversation</h2>
            <div className="flex-grow p-4 overflow-y-auto custom-scrollbar bg-white/50">
                <div className="space-y-6">
                    {messages.map((msg, index) => (
                        <div key={index} className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                            {msg.role === 'ai' && <div className="w-8 h-8 flex-shrink-0 bg-blue-100 rounded-full flex items-center justify-center"><AILogo className="w-5 h-5 text-blue-600" /></div>}
                            <div className={`p-3 rounded-lg max-w-lg message-bubble ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-br-none shadow-professional' : 'bg-white text-slate-700 rounded-bl-none shadow-professional'}`}>
                                <p className="whitespace-pre-wrap">{msg.content}</p>
                                {msg.image && <img src={msg.image} alt="User upload" className="mt-2 rounded-md max-h-40" />}
                            </div>
                             {msg.role === 'user' && <div className="w-8 h-8 flex-shrink-0 bg-slate-100 rounded-full flex items-center justify-center"><UserLogo className="w-5 h-5 text-slate-600" /></div>}
                        </div>
                    ))}
                    {isLoading && (
                         <div className="flex items-start gap-3">
                            <div className="w-8 h-8 flex-shrink-0 bg-blue-100 rounded-full flex items-center justify-center"><LoadingSpinner className="w-5 h-5 text-blue-600" /></div>
                             <div className="p-3 rounded-lg bg-white text-slate-500 rounded-bl-none italic shadow-professional message-bubble">
                                Thinking...
                             </div>
                         </div>
                    )}
                </div>
                <div ref={messagesEndRef} />
            </div>
            <div className="p-4 border-t border-slate-200 bg-white/80">
                {imageName && (
                     <div className="mb-3 flex items-center justify-between bg-slate-100 p-3 rounded-lg text-sm shadow-professional">
                        <span className="truncate text-slate-700">{imageName}</span>
                        <button onClick={removeImage} className="p-1 rounded-full hover:bg-slate-200 transition-colors">
                            <CloseIcon className="w-4 h-4" />
                        </button>
                    </div>
                )}
                <div className="flex items-center gap-3 bg-white rounded-lg p-2 shadow-professional border border-slate-200">
                    <button onClick={() => fileInputRef.current?.click()} className="p-2 text-slate-500 hover:text-blue-600 rounded-md transition-colors professional-button">
                        <PaperclipIcon className="w-5 h-5" />
                    </button>
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/png, image/jpeg" className="hidden" />
                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Describe the SVG you want to create..."
                        rows={1}
                        className="flex-grow bg-transparent focus:outline-none resize-none text-slate-700 placeholder-slate-400 max-h-24 custom-scrollbar input-professional"
                    />
                    <button onClick={handleSend} disabled={isLoading} className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors professional-button shadow-professional">
                        <SendIcon className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
};

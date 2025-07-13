
import React, { useState, useMemo } from 'react';
import { CopyIcon, DownloadIcon, SaveIcon, CodeIcon, EyeIcon } from './icons';

interface EditorPanelProps {
    svgCode: string;
    onCodeChange: (newCode: string) => void;
    onSaveVersion: () => void;
}

export const EditorPanel: React.FC<EditorPanelProps> = ({ svgCode, onCodeChange, onSaveVersion }) => {
    const [showPreview, setShowPreview] = useState(true);

    const svgDataUrl = useMemo(() => {
        try {
            const encodedSvg = encodeURIComponent(svgCode);
            return `data:image/svg+xml,${encodedSvg}`;
        } catch (e) {
            return '';
        }
    }, [svgCode]);
    
    const copyToClipboard = () => {
        navigator.clipboard.writeText(svgCode).then(() => {
            // Can add a toast notification here
        });
    };

    const downloadSvg = () => {
        const blob = new Blob([svgCode], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `icon-${Date.now()}.svg`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    return (
        <div className="flex flex-col h-full professional-card rounded-none">
            <div className="flex justify-between items-center p-4 border-b border-slate-200 bg-white/80">
                <div className="flex items-center gap-2">
                    <div className="p-1 bg-slate-100 rounded-lg border border-slate-200">
                        <button onClick={() => setShowPreview(false)} className={`px-3 py-2 text-sm rounded-md transition-all professional-button ${!showPreview ? 'bg-blue-600 text-white shadow-professional' : 'text-slate-600 hover:bg-slate-200'}`}>
                            <CodeIcon className="w-5 h-5 inline-block mr-1" /> Code
                        </button>
                        <button onClick={() => setShowPreview(true)} className={`px-3 py-2 text-sm rounded-md transition-all professional-button ${showPreview ? 'bg-blue-600 text-white shadow-professional' : 'text-slate-600 hover:bg-slate-200'}`}>
                           <EyeIcon className="w-5 h-5 inline-block mr-1" /> Preview
                        </button>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={onSaveVersion} className="flex items-center gap-2 px-4 py-2 text-sm bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors professional-button text-slate-700 border border-slate-200">
                        <SaveIcon className="w-4 h-4" /> Save Version
                    </button>
                    <button onClick={copyToClipboard} className="flex items-center gap-2 px-4 py-2 text-sm bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors professional-button text-slate-700 border border-slate-200">
                        <CopyIcon className="w-4 h-4" /> Copy
                    </button>
                    <button onClick={downloadSvg} className="flex items-center gap-2 px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors professional-button text-white shadow-professional">
                        <DownloadIcon className="w-4 h-4" /> Download
                    </button>
                </div>
            </div>
            <div className="flex-grow overflow-hidden relative">
                {!showPreview ? (
                    <textarea
                        value={svgCode}
                        onChange={(e) => onCodeChange(e.target.value)}
                        className="w-full h-full p-6 bg-slate-50 text-slate-800 font-mono focus:outline-none resize-none custom-scrollbar border-0 input-professional"
                        spellCheck="false"
                    />
                ) : (
                    <div className="w-full h-full p-8 bg-grid-pattern flex items-center justify-center">
                        {svgDataUrl && <img src={svgDataUrl} alt="SVG Preview" className="max-w-full max-h-full shadow-professional-lg rounded-lg bg-white p-4" />}
                    </div>
                )}
            </div>
        </div>
    );
};

// Add a simple grid pattern background for the preview using Tailwind config or a style tag
// For simplicity, using a utility class defined inline or in a global css file.
// Let's fake it with background properties until we can add it to tailwind config.
const styles = `
.bg-grid-pattern {
    background-color: #111827; /* bg-gray-900 */
    background-image:
        linear-gradient(rgba(255, 255, 255, 0.07) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255, 255, 255, 0.07) 1px, transparent 1px);
    background-size: 20px 20px;
}
`;
const styleSheet = document.createElement("style");
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);

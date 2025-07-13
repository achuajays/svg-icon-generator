import { GoogleGenAI } from "@google/genai";

const getApiKey = () => {
    // Get API key from localStorage
    return localStorage.getItem('gemini_api_key') || '';
};

const createAI = () => {
    const apiKey = getApiKey();
    if (!apiKey) {
        throw new Error("No API key provided. Please configure your Gemini API key in settings.");
    }
    return new GoogleGenAI(apiKey);
};

const model = "gemini-2.5-flash";

const extractSvgCode = (text: string): string => {
    const svgRegex = /<svg[\s\S]*?<\/svg>/;
    const match = text.match(svgRegex);
    if (match) {
        return match[0];
    }
    // Fallback if no specific SVG tag is found but the content might be SVG
    if (text.trim().startsWith('<')) {
        return text.trim();
    }
    return '';
};


export const generateSvgFromText = async (prompt: string, conversationContext: string, currentSvg: string): Promise<string> => {
    const systemInstruction = `You are an expert SVG generator. Your task is to create clean, optimized, and valid SVG code based on user requests.
- Respond ONLY with the raw SVG code.
- Do NOT include any extra text, explanations, or markdown fences like \`\`\`svg.
- Ensure the SVG is well-formed XML.
- If the user provides an existing SVG, modify it. Otherwise, create a new one.
- Default to a 24x24 viewbox if not specified.
- Use black fill by default unless a color is requested.`;

    const fullPrompt = `
Conversation History:
${conversationContext}

Current SVG Code:
${currentSvg}

User Request: "${prompt}"

Based on the user's request, generate the new SVG code.
`;

    try {
        const ai = createAI();
        const response = await ai.models.generateContent({
            model,
            contents: fullPrompt,
            config: {
                systemInstruction,
                temperature: 0.2,
            }
        });

        const rawText = response.text;
        const svgCode = extractSvgCode(rawText);
        
        if (!svgCode) {
            console.error("AI Response (no SVG found):", rawText);
            throw new Error("Failed to generate valid SVG. The AI response did not contain SVG code.");
        }
        return svgCode;

    } catch (error) {
        console.error("Error generating SVG from text:", error);
        throw new Error("The AI service failed to process the text prompt.");
    }
};

export const generateSvgFromImage = async (base64Image: string, prompt: string): Promise<string> => {
    const mimeType = base64Image.startsWith('data:image/jpeg') ? 'image/jpeg' : 'image/png';
    const imageData = base64Image.split(',')[1];
    
    const imagePart = {
      inlineData: {
        mimeType,
        data: imageData,
      },
    };

    const textPart = {
        text: `Trace this image to create a clean, single-color, black-on-transparent SVG. 
        Optimize for simplicity and scalability. Make it look like a modern icon. 
        If the user provided a prompt, use it for guidance: "${prompt}".
        Provide ONLY the raw SVG code as your response, without any explanations or markdown formatting. The SVG should have a viewBox attribute.`
    };
    
    try {
        const ai = createAI();
        const response = await ai.models.generateContent({
            model,
            contents: { parts: [imagePart, textPart] },
        });

        const rawText = response.text;
        const svgCode = extractSvgCode(rawText);

        if (!svgCode) {
            console.error("AI Response (no SVG found):", rawText);
            throw new Error("Failed to convert image to SVG. The AI response did not contain SVG code.");
        }
        return svgCode;

    } catch (error) {
        console.error("Error generating SVG from image:", error);
        throw new Error("The AI service failed to process the image.");
    }
};

export const optimizePrompt = async (originalPrompt: string): Promise<string> => {
    const systemInstruction = `You are an expert at writing prompts for SVG generation. Your task is to take a user's basic prompt and enhance it to create better, more detailed SVG icons.

Guidelines for optimization:
- Add specific details about style (modern, minimalist, flat, outlined, etc.)
- Specify colors if not mentioned (suggest appropriate ones)
- Add details about stroke width, fill, and visual style
- Mention icon-appropriate sizing and scalability
- Keep it concise but descriptive
- Focus on creating clean, professional icons

Return ONLY the optimized prompt, nothing else.`;

    const fullPrompt = `Original prompt: "${originalPrompt}"

Optimize this prompt for creating a professional SVG icon.`;

    try {
        const ai = createAI();
        const response = await ai.models.generateContent({
            model,
            contents: fullPrompt,
            config: {
                systemInstruction,
                temperature: 0.3,
            }
        });

        const optimizedPrompt = response.text.trim();
        return optimizedPrompt;

    } catch (error) {
        console.error("Error optimizing prompt:", error);
        throw new Error("Failed to optimize the prompt.");
    }
};

export const optimizeSvg = async (svgCode: string, prompt: string): Promise<string> => {
    const systemInstruction = `You are an SVG optimization expert.
Your task is to take the provided SVG code and optimize it based on the user's request.
- Simplify paths, remove redundant attributes, and minimize file size.
- Maintain visual integrity.
- Respond ONLY with the raw, optimized SVG code, without any markdown or explanations.`;
    
    const fullPrompt = `
User request: "${prompt}"

Current SVG to optimize:
${svgCode}
`;
    
    try {
        const ai = createAI();
        const response = await ai.models.generateContent({
            model,
            contents: fullPrompt,
            config: {
                systemInstruction,
                temperature: 0,
            }
        });
        
        const rawText = response.text;
        const optimizedCode = extractSvgCode(rawText);

        if (!optimizedCode) {
            console.error("AI Response (no SVG found):", rawText);
            throw new Error("Failed to optimize SVG. The AI response did not contain SVG code.");
        }
        return optimizedCode;

    } catch (error) {
        console.error("Error optimizing SVG:", error);
        throw new Error("The AI service failed to optimize the SVG.");
    }
};
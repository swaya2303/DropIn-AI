import { GoogleGenerativeAI } from '@google/generative-ai';

export default async function handler(req, res) {
    // Only accept POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // Validate request body
    const { message, sourceLanguage, targetLanguage, context } = req.body;

    if (!message || !sourceLanguage || !targetLanguage) {
        return res.status(400).json({
            error: 'Missing required fields: message, sourceLanguage, targetLanguage'
        });
    }

    // Skip translation if source and target are the same
    if (sourceLanguage === targetLanguage) {
        return res.status(200).json({ translatedText: message });
    }

    // Check for API key
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        return res.status(500).json({
            error: 'Translation service not configured. Missing GEMINI_API_KEY.'
        });
    }

    try {
        // Initialize Gemini client
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

        // Construct the translation prompt
        const contextNote = context ? `\n\nContext: ${context}` : '';
        const prompt = `You are a professional translator specialized in casual sports chat. 
Translate the following message from ${getLanguageName(sourceLanguage)} to ${getLanguageName(targetLanguage)}.

IMPORTANT RULES:
- Translate like a native speaker would write it
- Keep it casual and natural for sports chat context
- Preserve all emoji, formatting, and punctuation
- Keep sports slang and informal language intact (adapt it naturally to the target language)
- Be accurate with times, locations, dates, and game details
- Output ONLY the translated text with no explanation, no quotation marks, and no additional commentary${contextNote}

Message to translate: ${message}

Translation:`;

        // Call Gemini API
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const translatedText = response.text().trim();

        // Return the translation
        return res.status(200).json({ translatedText });

    } catch (error) {
        console.error('Translation error:', error);

        // Handle specific error types
        if (error.message?.includes('quota') || error.message?.includes('rate limit')) {
            return res.status(429).json({
                error: 'Translation service is temporarily unavailable. Please try again later.'
            });
        }

        if (error.message?.includes('API key')) {
            return res.status(500).json({
                error: 'Translation service configuration error.'
            });
        }

        // Generic error response
        return res.status(500).json({
            error: 'Translation failed. Please try again.'
        });
    }
}

// Helper function to convert language codes to full names
function getLanguageName(code) {
    const languages = {
        'en': 'English',
        'fr': 'French',
        'de': 'German',
        'es': 'Spanish',
        'it': 'Italian',
        'pt': 'Portuguese',
        'nl': 'Dutch',
        'pl': 'Polish',
        'sv': 'Swedish',
        'no': 'Norwegian',
        'da': 'Danish',
        'zh': 'Chinese',
        'jp': 'Japanese'
    };
    return languages[code] || code;
}


import React, { createContext, useContext, useState, useEffect } from 'react';
import translations from '../data/translations.json';

const TranslationContext = createContext();

export const TranslationProvider = ({ children }) => {
    const [language, setLanguage] = useState('en');

    const t = (key, fallbackText = null) => {
        // 1. Try exact dictionary match
        if (translations[key] && translations[key][language]) {
            return translations[key][language];
        }

        // 2. If fallback text provided, simulate translation
        if (fallbackText) {
            if (language === 'en') return fallbackText;

            // Simulation: Prepend tag [ES]
            return `[${language.toUpperCase()}] ${fallbackText}`;
        }

        // 3. Fallback to key if nothing else
        return key;
    };

    return (
        <TranslationContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </TranslationContext.Provider>
    );
};

export const useTranslation = () => useContext(TranslationContext);

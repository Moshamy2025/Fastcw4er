import React from 'react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

export type Language = 'ar-EG' | 'ar-SA' | 'en-US';

interface LanguageSelectorProps {
  onLanguageChange: (language: Language) => void;
  currentLanguage: Language;
}

const languages = [
  { 
    id: 'ar-EG', 
    name: 'العربية المصرية', 
    flagSvg: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 600" className="w-8 h-5">
        <rect width="900" height="200" fill="#FFFFFF"/>
        <rect width="900" height="200" y="200" fill="#CE1126"/>
        <rect width="900" height="200" y="400" fill="#000000"/>
        <g transform="translate(450,300)">
          <g id="eagle" fill="#C09300">
            <path d="M0,-50 L-15,-20 L15,-20 Z" />
            <path d="M-70,0 L-60,-10 L-50,0 L-40,-10 L-30,0 L-20,-10 L-10,0 L0,-10 L10,0 L20,-10 L30,0 L40,-10 L50,0 L60,-10 L70,0" />
            <ellipse cx="0" cy="0" rx="20" ry="30" />
            <path d="M-60,20 L-40,40 L0,20 L40,40 L60,20" />
          </g>
        </g>
      </svg>
    ),
    direction: 'rtl',
    indicator: 'يا سلام'
  },
  { 
    id: 'ar-SA', 
    name: 'العربية السعودية', 
    flagSvg: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 600" className="w-8 h-5">
        <rect width="900" height="600" fill="#006C35"/>
        <g transform="translate(450, 300)" fill="#FFFFFF">
          {/* Simplified Saudi flag */}
          <rect x="-150" y="-100" width="300" height="200" fill="none" stroke="#FFFFFF" strokeWidth="10"/>
          <path d="M-130,-30 C-120,-30 -110,-10 -100,-10 C-90,-10 -80,-30 -70,-30 C-60,-30 -50,-10 -40,-10 C-30,-10 -20,-30 -10,-30 C0,-30 10,-10 20,-10 C30,-10 40,-30 50,-30 C60,-30 70,-10 80,-10 C90,-10 100,-30 110,-30" stroke="#FFFFFF" strokeWidth="6" fill="none"/>
          <path d="M0,-50 L0,50 M-50,0 L50,0" stroke="#FFFFFF" strokeWidth="10"/>
        </g>
      </svg>
    ),
    direction: 'rtl',
    indicator: 'يا حبيبي'
  },
  { 
    id: 'en-US', 
    name: 'English (US)', 
    flagSvg: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 600" className="w-8 h-5">
        <rect width="900" height="600" fill="#FFFFFF"/>
        <g fill="#B22234">
          <rect width="900" height="46.154" y="0"/>
          <rect width="900" height="46.154" y="92.308"/>
          <rect width="900" height="46.154" y="184.615"/>
          <rect width="900" height="46.154" y="276.923"/>
          <rect width="900" height="46.154" y="369.231"/>
          <rect width="900" height="46.154" y="461.538"/>
          <rect width="900" height="46.154" y="553.846"/>
        </g>
        <rect width="346.154" height="323.077" fill="#3C3B6E"/>
        <g fill="#FFFFFF">
          {/* Just simplified stars */}
          <circle cx="173.077" cy="161.538" r="15.385"/>
          <circle cx="230.769" cy="161.538" r="15.385"/>
          <circle cx="288.462" cy="161.538" r="15.385"/>
          <circle cx="173.077" cy="230.769" r="15.385"/>
          <circle cx="230.769" cy="230.769" r="15.385"/>
          <circle cx="288.462" cy="230.769" r="15.385"/>
        </g>
      </svg>
    ),
    direction: 'ltr',
    indicator: 'Cool!'
  }
];

export function LanguageSelector({ onLanguageChange, currentLanguage }: LanguageSelectorProps) {
  const getCurrentLanguageInfo = () => {
    return languages.find(lang => lang.id === currentLanguage) || languages[0];
  };

  const handleLanguageChange = (language: Language) => {
    console.log('LanguageSelector: changing language to', language);
    onLanguageChange(language);
    
    // Force refresh to ensure UI updates properly
    setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 100);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="flex items-center gap-2 hover:bg-primary/10 transition-colors font-medium"
        >
          <div className="rounded overflow-hidden border border-gray-300">
            {getCurrentLanguageInfo().flagSvg}
          </div>
          <span>{getCurrentLanguageInfo().name}</span>
          <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full">{getCurrentLanguageInfo().indicator}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {languages.map((language) => (
          <DropdownMenuItem
            key={language.id}
            className={`flex items-center gap-2 cursor-pointer ${
              currentLanguage === language.id ? 'bg-primary/10' : ''
            }`}
            onClick={() => handleLanguageChange(language.id as Language)}
          >
            <div className="rounded overflow-hidden border border-gray-300">
              {language.flagSvg}
            </div>
            <span>{language.name}</span>
            {currentLanguage === language.id && (
              <Check className="ml-auto h-4 w-4" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default LanguageSelector;
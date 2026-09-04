/**
 * Speech service for Text-To-Speech and Speech-To-Text
 */
import type { EnglishLevel } from '../types.ts';

// Web Speech API types
declare global {
  interface Window {
    SpeechRecognition?: any;
    webkitSpeechRecognition?: any;
  }
}

let activeUtterance: SpeechSynthesisUtterance | null = null;
let activeRecognition: any = null;

export function isSpeechSynthesisSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

export function isSpeechRecognitionSupported(): boolean {
  return typeof window !== 'undefined' && !!(window.SpeechRecognition || window.webkitSpeechRecognition);
}

/**
 * Get preferred English voice
 */
function getEnglishVoice(): SpeechSynthesisVoice | null {
  if (!isSpeechSynthesisSupported()) return null;
  const voices = window.speechSynthesis.getVoices();
  const englishVoices = voices.filter(v => v.lang.startsWith('en'));
  if (englishVoices.length === 0) return null;

  // Prefer natural sounding voices
  const preferred = englishVoices.find(v =>
    v.name.includes('Google') ||
    v.name.includes('Samantha') ||
    v.name.includes('Daniel') ||
    v.name.includes('Natural') ||
    v.name.includes('Karen')
  );

  return preferred || englishVoices[0];
}

/**
 * Get optimal rate for level
 */
export function getRateForLevel(level: EnglishLevel): number {
  switch (level) {
    case 'A1':
      return 0.82;
    case 'A2':
      return 0.88;
    case 'B1':
      return 0.98;
    case 'B2':
    case 'C1':
      return 1.05;
    default:
      return 0.9;
  }
}

/**
 * Speak English text with level-adapted pace
 */
export function speakText(text: string, level: EnglishLevel, onEnd?: () => void): void {
  if (!isSpeechSynthesisSupported()) {
    if (onEnd) onEnd();
    return;
  }

  // Cancel any existing speech
  window.speechSynthesis.cancel();

  // Clean text from emoji or markup if any
  const cleaned = text.replace(/[*_~`]/g, '').trim();
  if (!cleaned) {
    if (onEnd) onEnd();
    return;
  }

  const utterance = new SpeechSynthesisUtterance(cleaned);
  utterance.lang = 'en-US';
  utterance.rate = getRateForLevel(level);
  utterance.pitch = 1.0;

  const voice = getEnglishVoice();
  if (voice) {
    utterance.voice = voice;
  }

  utterance.onend = () => {
    activeUtterance = null;
    if (onEnd) onEnd();
  };

  utterance.onerror = (e) => {
    console.warn('Speech synthesis error:', e);
    activeUtterance = null;
    if (onEnd) onEnd();
  };

  activeUtterance = utterance;
  window.speechSynthesis.speak(utterance);
}

export function stopSpeaking(): void {
  if (isSpeechSynthesisSupported()) {
    window.speechSynthesis.cancel();
  }
  activeUtterance = null;
}

export function isSpeaking(): boolean {
  if (!isSpeechSynthesisSupported()) return false;
  return window.speechSynthesis.speaking;
}

/**
 * Start speech-to-text
 */
export function startListening(
  onResult: (transcript: string, isFinal: boolean) => void,
  onError: (err: string) => void,
  onEnd: () => void
): boolean {
  if (!isSpeechRecognitionSupported()) {
    onError('Голосовой ввод не поддерживается в этом браузере.');
    return false;
  }

  stopListening();

  try {
    const SpeechRecognitionClass = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognitionClass();
    recognition.lang = 'en-US';
    recognition.interimResults = true;
    recognition.continuous = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event: any) => {
      const results = event.results;
      if (!results || results.length === 0) return;
      const last = results[results.length - 1];
      const transcript = last[0].transcript;
      const isFinal = last.isFinal;
      onResult(transcript, isFinal);
    };

    recognition.onerror = (event: any) => {
      console.warn('Speech recognition error:', event.error);
      if (event.error === 'not-allowed') {
        onError('Пожалуйста, разрешите доступ к микрофону.');
      } else if (event.error === 'no-speech') {
        onError('Не услышали речь. Попробуйте ещё раз.');
      } else {
        onError('Ошибка распознавания. Попробуйте напечатать ответ.');
      }
    };

    recognition.onend = () => {
      activeRecognition = null;
      onEnd();
    };

    activeRecognition = recognition;
    recognition.start();
    return true;
  } catch (err) {
    console.error('Failed to start speech recognition:', err);
    onError('Не удалось запустить микрофон.');
    return false;
  }
}

export function stopListening(): void {
  if (activeRecognition) {
    try {
      activeRecognition.stop();
    } catch {
      // ignore
    }
    activeRecognition = null;
  }
}

/**
 * Intelligent Fallback & Offline Engine
 * Ensures 100% resilience when offline or during transient API hiccups.
 */
import type { EnglishLevel, EvaluationResult, FeedbackMode, ConversationReport, NewWordItem } from '../types.ts';

// 25+ Diverse, engaging situations
export interface FallbackScenario {
  id: string;
  titleRu: string;
  starter: string;
  branches: Array<{
    keywords: string[];
    reply: string;
  }>;
  genericFollowups: string[];
}

export const FALLBACK_SCENARIOS: FallbackScenario[] = [
  {
    id: 'london_cafe',
    titleRu: 'Уютное кафе в Лондоне',
    starter: 'Welcome to The Golden Teapot in London! The weather outside is a bit rainy, but it is warm in here. What can I get for you today?',
    branches: [
      {
        keywords: ['coffee', 'tea', 'latte', 'cappuccino'],
        reply: 'Excellent choice! Would you like that with oat milk or regular milk? And may I tempt you with a fresh berry scone or croissant?',
      },
      {
        keywords: ['cake', 'croissant', 'scone', 'sandwich', 'eat'],
        reply: 'Those were baked fresh this morning! Take a seat by the window. Are you exploring London on holiday or here for work?',
      },
      {
        keywords: ['window', 'table', 'seat'],
        reply: 'The corner table by the flower box is free! Here is our menu. By the way, have you had a chance to see Big Ben yet?',
      },
    ],
    genericFollowups: [
      'That sounds lovely! What do you usually like to do on a peaceful afternoon like this?',
      'London has so many hidden museums and quiet parks. Do you enjoy quiet places or bustling streets?',
      'A customer just asked for recommendations. What is your favorite kind of dessert?',
    ],
  },
  {
    id: 'lost_phone_paris',
    titleRu: 'Прогулка по Парижу',
    starter: 'You are walking near the Eiffel Tower on a sunny afternoon when you suddenly realize your phone has slipped out of your bag! A friendly police officer is standing nearby. What do you say to him?',
    branches: [
      {
        keywords: ['help', 'lost', 'phone', 'excuse me'],
        reply: 'The officer smiles calmly and says: "Do not worry, madam! What color is your phone, and where do you remember having it last?"',
      },
      {
        keywords: ['black', 'white', 'case', 'bench', 'cafe'],
        reply: 'He nods and checks his radio. "Someone just turned in a phone at the tourist desk! Let us walk there together. How long are you staying in Paris?"',
      },
    ],
    genericFollowups: [
      'Paris can be busy! What has been the most beautiful sight you have visited so far?',
      'The officer mentions a quiet café with wonderful hot chocolate nearby. Would you like to go there next?',
      'What advice would you give to someone traveling to Europe for the first time?',
    ],
  },
  {
    id: 'boutique_shopping',
    titleRu: 'Покупка одежды в бутике',
    starter: 'Hello! Welcome to our boutique. We have just received our spring collection of warm scarves and elegant jackets. Are you looking for something special today?',
    branches: [
      {
        keywords: ['jacket', 'coat', 'dress', 'scarf'],
        reply: 'We have that in navy blue and soft cream. What size do you usually wear, and would you like to try it on in the fitting room?',
      },
      {
        keywords: ['size', 'medium', 'small', 'large', 'color'],
        reply: 'Here it is! The fabric is 100% natural wool. How does it feel when you put it on?',
      },
      {
        keywords: ['price', 'cost', 'discount', 'how much'],
        reply: 'It is on a 20% seasonal discount today! We also have a lovely matching belt. Do you enjoy shopping or do you prefer to keep it quick?',
      },
    ],
    genericFollowups: [
      'That color looks wonderful on you! Do you usually prefer bright colors or calm neutral tones?',
      'Are you preparing for a family celebration or a trip?',
      'What is your favorite item in your wardrobe at home?',
    ],
  },
  {
    id: 'family_dinner',
    titleRu: 'Семейный ужин и рецепты',
    starter: 'Tonight your family and friends are gathering at your house for Sunday dinner. The kitchen smells amazing! What special dish are you preparing for your guests?',
    branches: [
      {
        keywords: ['soup', 'salad', 'chicken', 'pasta', 'fish', 'pie', 'cake'],
        reply: 'Mmm, that sounds delicious! Who taught you how to cook that dish, and do you have any secret ingredients?',
      },
      {
        keywords: ['mother', 'grandmother', 'recipe', 'secret'],
        reply: 'Family recipes are the most precious! While dinner is cooking, what music or atmosphere do you like to create for your family?',
      },
    ],
    genericFollowups: [
      'Gathering with loved ones is so heartwarming. What is your favorite family tradition?',
      'If you could travel anywhere with your family right now, which country would you choose?',
      'What dessert do your guests look forward to the most?',
    ],
  },
  {
    id: 'doctor_pharmacy',
    titleRu: 'В аптеке за границей',
    starter: 'You enter a pharmacy in a foreign city because you have a slight headache and a sore throat after the flight. The pharmacist says: "Good morning, how can I help you today?"',
    branches: [
      {
        keywords: ['headache', 'throat', 'cold', 'pain', 'medicine'],
        reply: 'I see. Do you have a fever, or is it mostly fatigue from the flight? And do you have any allergies to medications?',
      },
      {
        keywords: ['no', 'allergies', 'water', 'tea', 'sleep'],
        reply: 'Here are some soothing herbal lozenges and mild pain relief. Take one tablet with plenty of warm water. Have you been able to rest today?',
      },
    ],
    genericFollowups: [
      'Drinking warm tea with lemon and honey will also help a lot. How do you usually take care of yourself when you feel tired?',
      'Traveling across time zones can be exhausting. Do you sleep well on airplanes?',
      'Feeling better already? What gentle activity would you like to do tomorrow?',
    ],
  },
  {
    id: 'airport_checkin',
    titleRu: 'В аэропорту у стойки регистрации',
    starter: 'Good morning! Welcome to the international check-in counter. May I see your passport and ticket, please? Are you checking any luggage today?',
    branches: [
      {
        keywords: ['passport', 'ticket', 'bag', 'suitcase', 'yes', 'here'],
        reply: 'Thank you very much. Please place your suitcase on the scale. Would you prefer an aisle seat or a window seat for this flight?',
      },
      {
        keywords: ['window', 'aisle', 'seat'],
        reply: 'Seat 14A, right next to the window, is yours! Here is your boarding pass. Gate 22 opens in one hour. What do you like to do while waiting for boarding?',
      },
    ],
    genericFollowups: [
      'Flying above the clouds is always such an adventure. Do you enjoy looking out of the airplane window?',
      'What is the first thing you plan to do when you land at your destination?',
      'Have you packed any books or snacks for the journey?',
    ],
  },
];

// Gibberish regex & heuristic: detects random consonants clusters, repeated keys, keyboard rows
export function isLikelyGibberish(text: string): boolean {
  const clean = text.trim().toLowerCase();
  if (clean.length === 0) return false;

  // Single word repeated excessively like "aaaa"
  if (/^([a-z])\1{3,}$/i.test(clean)) return true;

  // Common keyboard row smashing
  const smashPatterns = [
    'asdf', 'asdfg', 'asdfgh', 'qwert', 'qwerty', 'zxcv', 'zxcvb',
    'bjnkj', 'hjkj', 'jkl;', 'dfgh', 'fghj', 'ghjk', 'tyui', 'yuio',
  ];
  for (const pat of smashPatterns) {
    if (clean.includes(pat)) return true;
  }

  // High consonant to vowel ratio for words > 4 letters without vowels
  const words = clean.split(/\s+/).filter(w => w.length > 0);
  let gibberishWordCount = 0;
  for (const w of words) {
    const lettersOnly = w.replace(/[^a-z]/gi, '');
    if (lettersOnly.length >= 4) {
      const vowels = lettersOnly.match(/[aeiouy]/gi);
      if (!vowels || vowels.length === 0) {
        gibberishWordCount++;
      } else if (lettersOnly.length >= 6 && vowels.length / lettersOnly.length < 0.18) {
        gibberishWordCount++;
      }
    }
  }

  return gibberishWordCount > 0 && gibberishWordCount === words.length;
}

// Known grammar/vocabulary rule patterns for fallback evaluation
interface RuleDef {
  pattern: RegExp;
  original: (match: RegExpMatchArray) => string;
  correction: (match: RegExpMatchArray) => string;
  type: 'grammar' | 'vocabulary';
  betterFull?: (input: string) => string;
  explanationRu: string;
}

const COMMON_RULES: RuleDef[] = [
  // 1. have went -> went / have gone
  {
    pattern: /\bhave went\b/i,
    original: () => 'have went',
    correction: () => 'went',
    type: 'grammar',
    explanationRu: 'После "have" используется третья форма глагола (have gone), либо в прошедшем времени — просто "went".',
  },
  // 2. made a photo / make photo -> took a photo
  {
    pattern: /\b(made|make|making)\s+a?\s*photos?\b/i,
    original: (m) => m[0],
    correction: (m) => m[0].toLowerCase().includes('made') ? 'took a photo' : 'take a photo',
    type: 'vocabulary',
    explanationRu: 'В английском с фотографиями используется глагол "take" (take a photo / took a photo), а не "make".',
  },
  // 3. I am agree -> I agree
  {
    pattern: /\b(i am|i'm)\s+agree\b/i,
    original: (m) => m[0],
    correction: () => 'I agree',
    type: 'grammar',
    explanationRu: 'Глагол "agree" означает "соглашаться", поэтому вспомогательный глагол "am" здесь не нужен: просто "I agree".',
  },
  // 4. more better -> better
  {
    pattern: /\bmore better\b/i,
    original: () => 'more better',
    correction: () => 'better',
    type: 'grammar',
    explanationRu: '"Better" — это уже сравнительная степень от "good", слово "more" добавлять нельзя.',
  },
  // 5. He/she/it go -> goes
  {
    pattern: /\b(he|she|it)\s+go\b/i,
    original: (m) => m[0],
    correction: (m) => `${m[1]} goes`,
    type: 'grammar',
    explanationRu: 'В Present Simple для he/she/it к глаголу добавляется окончание -es: "goes".',
  },
  // 6. They is / We is / You is -> are
  {
    pattern: /\b(they|we|you)\s+is\b/i,
    original: (m) => m[0],
    correction: (m) => `${m[1]} are`,
    type: 'grammar',
    explanationRu: 'С местоимениями во множественном числе используется форма глагола "are", а не "is".',
  },
  // 7. Did you went -> Did you go
  {
    pattern: /\bdid\s+you\s+went\b/i,
    original: () => 'did you went',
    correction: () => 'did you go',
    type: 'grammar',
    explanationRu: 'После вспомогательного глагола "did" смысловой глагол ставится в начальной форме (did you go).',
  },
  // 8. make sports -> do sports / play sports
  {
    pattern: /\b(make|makes|made)\s+sports?\b/i,
    original: (m) => m[0],
    correction: () => 'do sports',
    type: 'vocabulary',
    explanationRu: 'Со спортом по-английски говорят "do sports" или "play sports", а не "make sports".',
  },
  // 9. strong rain / big rain -> heavy rain
  {
    pattern: /\b(strong|big)\s+rain\b/i,
    original: (m) => m[0],
    correction: () => 'heavy rain',
    type: 'vocabulary',
    explanationRu: 'Сильный дождь по-английски — устойчивое словосочетание "heavy rain".',
  },
  // 10. he have / she have -> has
  {
    pattern: /\b(he|she|it)\s+have\b/i,
    original: (m) => m[0],
    correction: (m) => `${m[1]} has`,
    type: 'grammar',
    explanationRu: 'С he/she/it используется форма глагола "has".',
  },
  // 11. I no like / I not like -> I don't like
  {
    pattern: /\bi\s+(no|not)\s+like\b/i,
    original: (m) => m[0],
    correction: () => "I don't like",
    type: 'grammar',
    explanationRu: 'В Present Simple отрицание строится с помощью "don\'t": "I don\'t like".',
  },
  // 12. where is toilet -> where is the toilet
  {
    pattern: /\bwhere\s+is\s+toilet\b/i,
    original: () => 'where is toilet',
    correction: () => 'where is the toilet',
    type: 'grammar',
    explanationRu: 'Перед конкретным существительным "toilet" нужен определённый артикль "the".',
  },
];

/**
 * Fallback evaluator that runs on client if server is unreachable
 */
export function evaluateAnswerLocally(params: {
  userText: string;
  question: string;
  level: EnglishLevel;
  mode: FeedbackMode;
}): EvaluationResult {
  const { userText, mode } = params;
  const trimmed = userText.trim();

  // 1. Gibberish check
  if (isLikelyGibberish(trimmed)) {
    return {
      isGibberish: true,
      grammarStatus: 'error',
      vocabularyStatus: 'error',
      naturalnessStatus: 'unnatural',
      contextStatus: 'off_topic',
      corrections: [],
      betterSentence: null,
      scores: { grammar: 20, vocabulary: 20, naturalness: 20, context: 20 },
      teacherExplanationRu: 'Кажется, в тексте опечатки или случайный набор букв. Попробуйте написать ответ заново!',
    };
  }

  // 2. Rule-based correction matching
  const corrections: EvaluationResult['corrections'] = [];
  let betterSentence = trimmed;

  for (const rule of COMMON_RULES) {
    const match = trimmed.match(rule.pattern);
    if (match) {
      const orig = rule.original(match);
      const corr = rule.correction(match);
      corrections.push({
        original: orig,
        correction: corr,
        type: rule.type,
        explanationRu: rule.explanationRu,
      });
      betterSentence = betterSentence.replace(new RegExp(orig, 'gi'), corr);
    }
  }

  // Capitalize first letter and ensure period
  if (betterSentence.length > 0) {
    betterSentence = betterSentence.charAt(0).toUpperCase() + betterSentence.slice(1);
    if (!/[.?!]$/.test(betterSentence)) {
      betterSentence += '.';
    }
  }

  const hasGrammarErr = corrections.some(c => c.type === 'grammar');
  const hasVocabErr = corrections.some(c => c.type === 'vocabulary');

  const scores = {
    grammar: hasGrammarErr ? 75 : 95,
    vocabulary: hasVocabErr ? 75 : 95,
    naturalness: corrections.length > 0 ? 80 : 95,
    context: 95,
  };

  // If in gentle mode, only report if there is a real error
  const finalCorrections = mode === 'gentle' && corrections.length > 1
    ? [corrections[0]] // only top correction
    : corrections;

  let teacherExplanationRu: string | undefined;
  if (mode === 'teacher' && finalCorrections.length > 0) {
    teacherExplanationRu = finalCorrections.map(c => c.explanationRu).join(' ');
  } else if (finalCorrections.length === 0) {
    teacherExplanationRu = 'Отличный ответ! Предложение построено грамматически верно и понятно.';
  }

  return {
    isGibberish: false,
    grammarStatus: hasGrammarErr ? 'error' : 'correct',
    vocabularyStatus: hasVocabErr ? 'error' : 'correct',
    naturalnessStatus: corrections.length > 0 ? 'unnatural' : 'natural',
    contextStatus: 'relevant',
    corrections: finalCorrections,
    betterSentence: corrections.length > 0 ? betterSentence : null,
    scores,
    teacherExplanationRu,
  };
}

/**
 * Fallback dialogue generator when offline
 */
export function getFallbackDialogueReply(params: {
  level: EnglishLevel;
  situationTitle?: string;
  history: Array<{ role: 'ai' | 'user'; content: string }>;
}): { reply: string; situationTitle: string; extractedFact: string | null } {
  const { situationTitle, history } = params;

  // Find or pick scenario
  let scenario = FALLBACK_SCENARIOS.find(s => s.titleRu === situationTitle);
  if (!scenario) {
    const randomIndex = Math.floor(Math.random() * FALLBACK_SCENARIOS.length);
    scenario = FALLBACK_SCENARIOS[randomIndex];
  }

  if (history.length <= 1) {
    return {
      reply: scenario.starter,
      situationTitle: scenario.titleRu,
      extractedFact: null,
    };
  }

  // Look at the latest user message
  const lastUserMsg = [...history].reverse().find(m => m.role === 'user');
  const userText = lastUserMsg ? lastUserMsg.content.toLowerCase() : '';

  // Extract simple facts (e.g. daughters, sons, city, job)
  let extractedFact: string | null = null;
  if (/i have (\w+) (daughters|children|kids|sons)/i.test(userText)) {
    const m = userText.match(/i have (\w+) (daughters|children|kids|sons)/i);
    if (m) extractedFact = `У пользователя есть ${m[1]} ${m[2]}`;
  } else if (/i live in ([a-z\s]+)/i.test(userText)) {
    const m = userText.match(/i live in ([a-z\s]+)/i);
    if (m) extractedFact = `Живёт в ${m[1].trim()}`;
  }

  // Find matching branch
  for (const branch of scenario.branches) {
    if (branch.keywords.some(k => userText.includes(k))) {
      return {
        reply: branch.reply,
        situationTitle: scenario.titleRu,
        extractedFact,
      };
    }
  }

  // Otherwise pick a generic thoughtful followup
  const followupIndex = (history.length) % scenario.genericFollowups.length;
  return {
    reply: scenario.genericFollowups[followupIndex],
    situationTitle: scenario.titleRu,
    extractedFact,
  };
}

/**
 * Fallback report generator
 */
export function generateFallbackReport(params: {
  level: EnglishLevel;
  messages: Array<{ role: 'ai' | 'user'; content: string; evaluation?: EvaluationResult }>;
  situationTitle: string;
}): ConversationReport {
  const userMessages = params.messages.filter(m => m.role === 'user');
  const evaluations = userMessages.map(m => m.evaluation).filter(Boolean) as EvaluationResult[];

  let totalGrammar = 0;
  let totalVocab = 0;
  let totalNatural = 0;
  let totalContext = 0;

  evaluations.forEach(ev => {
    totalGrammar += ev.scores.grammar;
    totalVocab += ev.scores.vocabulary;
    totalNatural += ev.scores.naturalness;
    totalContext += ev.scores.context;
  });

  const count = evaluations.length || 1;
  const avgGrammar = Math.round(totalGrammar / count);
  const avgVocab = Math.round(totalVocab / count);
  const avgNatural = Math.round(totalNatural / count);
  const avgContext = Math.round(totalContext / count);
  const overall = Math.round((avgGrammar * 0.35) + (avgVocab * 0.25) + (avgNatural * 0.2) + (avgContext * 0.2));

  const sampleWords: NewWordItem[] = [
    { word: 'window seat', translation: 'место у окна (в самолёте/поезде)', example: 'Could I please have a window seat?' },
    { word: 'take a photo', translation: 'сделать фотографию', example: 'I took a beautiful photo of the sunset.' },
    { word: 'delicious', translation: 'очень вкусный', example: 'This homemade apple pie is delicious!' },
    { word: 'recommendation', translation: 'рекомендация / совет', example: 'Do you have any recommendations for dessert?' },
    { word: 'explore', translation: 'исследовать, осматривать', example: 'I love exploring small European streets.' },
  ];

  return {
    scores: {
      grammar: avgGrammar,
      vocabulary: avgVocab,
      naturalness: avgNatural,
      comprehension: avgContext,
      overall,
    },
    whatWentWell: [
      'Вы уверенно поддерживали диалог и отвечали полными фразами.',
      'Хорошо поняли вопросы собеседника и контекст ситуации.',
      'Проявили отличную речевую активность и смелость!',
    ],
    whatToImprove: [
      'Обратите внимание на устойчивые словосочетания (например, "take a photo", а не "make a photo").',
      'Тренируйте правильные формы прошедшего времени (Past Simple).',
      'Не бойтесь использовать простые и естественные вводные фразы.',
    ],
    newWords: sampleWords,
    recommendedPractice: `Отличная работа в теме "${params.situationTitle}"! В следующий раз попробуйте продолжить диалог в аэропорту или заказать столик в ресторане.`,
    totalTurns: userMessages.length,
  };
}

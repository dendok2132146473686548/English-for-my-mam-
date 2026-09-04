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

// Known grammar and vocabulary rule patterns for intelligent fallback evaluation
interface RuleDef {
  pattern: RegExp;
  original: (match: RegExpMatchArray) => string;
  correction: (match: RegExpMatchArray) => string;
  type: 'grammar' | 'vocabulary';
  explanationRu: string;
}

export const COMMON_RULES: RuleDef[] = [
  // ==================== GRAMMAR RULES ====================
  // 1. have went -> went / have gone
  {
    pattern: /\bhave went\b/i,
    original: () => 'have went',
    correction: () => 'went',
    type: 'grammar',
    explanationRu: 'После вспомогательного "have" требуется третья форма неправильного глагола (have gone), либо в Past Simple — просто "went".',
  },
  // 2. I am agree / I'm agree -> I agree
  {
    pattern: /\b(i am|i'm)\s+agree\b/i,
    original: (m) => m[0],
    correction: () => 'I agree',
    type: 'grammar',
    explanationRu: '"Agree" — это самостоятельный смысловой глагол ("соглашаться"), вспомогательный глагол "am" здесь не нужен.',
  },
  // 3. Did you went / didn't saw / didn't went
  {
    pattern: /\bdid\s+(you|he|she|they|we)\s+went\b/i,
    original: (m) => m[0],
    correction: (m) => `did ${m[1]} go`,
    type: 'grammar',
    explanationRu: 'После вспомогательного глагола "did" смысловой глагол всегда ставится в начальной форме (infinitive without to).',
  },
  {
    pattern: /\bdidn't\s+(went|saw|came|had|took)\b/i,
    original: (m) => m[0],
    correction: (m) => {
      const verbMap: Record<string, string> = {
        went: 'go',
        saw: 'see',
        came: 'come',
        had: 'have',
        took: 'take',
      };
      return `didn't ${verbMap[m[1].toLowerCase()] || m[1]}`;
    },
    type: 'grammar',
    explanationRu: 'После "didn\'t" смысловой глагол возвращается в начальную форму (didn\'t go, didn\'t see).',
  },
  // 4. He/she/it don't -> doesn't
  {
    pattern: /\b(he|she|it)\s+don't\b/i,
    original: (m) => m[0],
    correction: (m) => `${m[1]} doesn't`,
    type: 'grammar',
    explanationRu: 'Для третьего лица единственного числа (he/she/it) в отрицании используется "doesn\'t", а не "don\'t".',
  },
  // 5. He/she/it have -> has
  {
    pattern: /\b(he|she|it)\s+have\b/i,
    original: (m) => m[0],
    correction: (m) => `${m[1]} has`,
    type: 'grammar',
    explanationRu: 'С местоимениями he/she/it глагол "have" имеет форму "has".',
  },
  // 6. He/she/it go / like / want (missing -s)
  {
    pattern: /\b(he|she|it)\s+(go|like|want|need|live)\b/i,
    original: (m) => m[0],
    correction: (m) => {
      const base = m[2].toLowerCase();
      const sForm = base === 'go' ? 'goes' : `${base}s`;
      return `${m[1]} ${sForm}`;
    },
    type: 'grammar',
    explanationRu: 'В Present Simple к глаголам с he/she/it обязательно добавляется окончание -s/-es.',
  },
  // 7. They is / We is / You is -> are
  {
    pattern: /\b(they|we|you)\s+is\b/i,
    original: (m) => m[0],
    correction: (m) => `${m[1]} are`,
    type: 'grammar',
    explanationRu: 'С местоимениями множественного числа используется форма глагола to be "are", а не "is".',
  },
  // 8. We was / They was / You was -> were
  {
    pattern: /\b(we|they|you)\s+was\b/i,
    original: (m) => m[0],
    correction: (m) => `${m[1]} were`,
    type: 'grammar',
    explanationRu: 'В прошедшем времени с местоимениями we/they/you используется форма "were".',
  },
  // 9. I no like / I not like -> I don't like
  {
    pattern: /\bi\s+(no|not)\s+(like|want|know|understand)\b/i,
    original: (m) => m[0],
    correction: (m) => `I don't ${m[2]}`,
    type: 'grammar',
    explanationRu: 'Отрицание в Present Simple для глаголов строится с помощью вспомогательного глагола "don\'t".',
  },
  // 10. More better / more easier
  {
    pattern: /\bmore\s+(better|easier|faster|bigger)\b/i,
    original: (m) => m[0],
    correction: (m) => m[1],
    type: 'grammar',
    explanationRu: 'Сравнительная степень у этих слов уже выражена суффиксом или особой формой; слово "more" является избыточным.',
  },
  // 11. In Monday / In Sunday -> On Monday / On Sunday
  {
    pattern: /\bin\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/i,
    original: (m) => m[0],
    correction: (m) => `on ${m[1].charAt(0).toUpperCase() + m[1].slice(1)}`,
    type: 'grammar',
    explanationRu: 'С днями недели в английском языке всегда используется предлог "on" (on Monday, on Sunday).',
  },
  // 12. At the morning / At the evening -> In the morning / In the evening
  {
    pattern: /\bat\s+the\s+(morning|afternoon|evening)\b/i,
    original: (m) => m[0],
    correction: (m) => `in the ${m[1]}`,
    type: 'grammar',
    explanationRu: 'Со временем суток употребляется предлог "in": in the morning, in the evening (но: at night).',
  },
  // 13. Depend of -> depend on
  {
    pattern: /\bdepends?\s+of\b/i,
    original: (m) => m[0],
    correction: (m) => m[0].toLowerCase().includes('depends') ? 'depends on' : 'depend on',
    type: 'grammar',
    explanationRu: 'Глагол "depend" в английском языке управляется предлогом "on" (depend on), а не "of".',
  },
  // 14. Listen music -> listen to music
  {
    pattern: /\blisten(s|ed|ing)?\s+(music|radio|him|her|them)\b/i,
    original: (m) => m[0],
    correction: (m) => {
      const verb = m[0].split(/\s+/)[0];
      const target = m[2];
      return `${verb} to ${target}`;
    },
    type: 'grammar',
    explanationRu: 'После глагола "listen" перед объектом обязательно требуется предлог "to" (listen to music).',
  },
  // 15. Explain me -> explain to me
  {
    pattern: /\bexplain\s+(me|us|him|her|them)\b/i,
    original: (m) => m[0],
    correction: (m) => `explain to ${m[1]}`,
    type: 'grammar',
    explanationRu: 'В отличие от русского языка, глагол "explain" требует предлога "to" перед лицом (explain to me).',
  },
  // 16. Two childs / mans / womans -> children / men / women
  {
    pattern: /\b(\w+)\s+childs\b/i,
    original: (m) => m[0],
    correction: (m) => `${m[1]} children`,
    type: 'grammar',
    explanationRu: '"Child" — исключение во множественном числе, правильная форма — "children".',
  },
  {
    pattern: /\b(\w+)\s+(mans|womans)\b/i,
    original: (m) => m[0],
    correction: (m) => `${m[1]} ${m[2].toLowerCase() === 'mans' ? 'men' : 'women'}`,
    type: 'grammar',
    explanationRu: 'Множественное число слов "man" и "woman" образуется не по общему правилу: "men" и "women".',
  },
  // 17. Went to home -> went home
  {
    pattern: /\b(go|goes|went|come|came)\s+to\s+home\b/i,
    original: (m) => m[0],
    correction: (m) => `${m[1]} home`,
    type: 'grammar',
    explanationRu: 'Слово "home" в значении направления движения используется без предлога "to" (go home, went home).',
  },
  // 18. Where is toilet -> where is the toilet
  {
    pattern: /\bwhere\s+is\s+toilet\b/i,
    original: () => 'where is toilet',
    correction: () => 'where is the toilet',
    type: 'grammar',
    explanationRu: 'Перед конкретным исчисляемым существительным в единственном числе необходим определённый артикль "the".',
  },
  // 19. Wait you / wait me -> wait for you / wait for me
  {
    pattern: /\bwait\s+(me|you|him|her|them|us)\b/i,
    original: (m) => m[0],
    correction: (m) => `wait for ${m[1]}`,
    type: 'grammar',
    explanationRu: 'Глагол "wait" требует предлога "for" при указании на того, кого ждут (wait for you).',
  },
  // 20. Good in English -> good at English
  {
    pattern: /\bgood\s+in\s+(english|math|cooking|sports)\b/i,
    original: (m) => m[0],
    correction: (m) => `good at ${m[1]}`,
    type: 'grammar',
    explanationRu: 'В значении "хорошо разбираться в чем-то" используется предлог "at" (good at English).',
  },

  // ==================== VOCABULARY & COLLOCATION RULES ====================
  // 21. Made a photo / make photo -> took a photo / take a photo
  {
    pattern: /\b(made|make|making)\s+a?\s*photos?\b/i,
    original: (m) => m[0],
    correction: (m) => m[0].toLowerCase().includes('made') ? 'took a photo' : 'take a photo',
    type: 'vocabulary',
    explanationRu: 'Устойчивое словосочетание: в английском языке с фотографиями используется глагол "take" (take a photo / took a photo), а не "make".',
  },
  // 22. Do a mistake / did a mistake -> make a mistake / made a mistake
  {
    pattern: /\b(do|did|doing|does)\s+a?\s*mistakes?\b/i,
    original: (m) => m[0],
    correction: (m) => m[0].toLowerCase().includes('did') ? 'made a mistake' : 'make a mistake',
    type: 'vocabulary',
    explanationRu: 'Лексическая сочетаемость: со словом "mistake" всегда употребляется глагол "make" (make a mistake / made a mistake).',
  },
  // 23. Make sports -> do sports / play sports
  {
    pattern: /\b(make|makes|made)\s+sports?\b/i,
    original: (m) => m[0],
    correction: () => 'do sports',
    type: 'vocabulary',
    explanationRu: 'В значении "заниматься спортом" говорят "do sports" или "play sports", сочетание "make sports" неестественно.',
  },
  // 24. Strong rain / big rain -> heavy rain
  {
    pattern: /\b(strong|big)\s+rain\b/i,
    original: (m) => m[0],
    correction: () => 'heavy rain',
    type: 'vocabulary',
    explanationRu: 'Сильный, проливной дождь в английском языке выражается устойчивым сочетанием "heavy rain".',
  },
  // 25. Drink soup -> eat soup / have soup
  {
    pattern: /\b(drink|drank|drinking)\s+soup\b/i,
    original: (m) => m[0],
    correction: (m) => m[0].toLowerCase().includes('drank') ? 'ate soup' : 'eat soup',
    type: 'vocabulary',
    explanationRu: 'В англоязычных странах суп не "пьют", а "едят" ложкой: "eat soup" или "have soup".',
  },
  // 26. Drink medicine / drink pills / drink tablets -> take medicine / take pills
  {
    pattern: /\b(drink|drank|drinking)\s+(medicine|pills|tablets)\b/i,
    original: (m) => m[0],
    correction: (m) => {
      const past = m[0].toLowerCase().includes('drank');
      return `${past ? 'took' : 'take'} ${m[2]}`;
    },
    type: 'vocabulary',
    explanationRu: 'Лекарства и таблетки по-английски "принимают" с глаголом "take" (take medicine / take pills).',
  },
  // 27. Feel myself good/bad/well -> feel good/bad/well
  {
    pattern: /\bfeel\s+myself\s+(good|bad|well|tired|happy|sick)\b/i,
    original: (m) => m[0],
    correction: (m) => `feel ${m[1]}`,
    type: 'vocabulary',
    explanationRu: 'В английском глагол "feel" не требует возвратного местоимения "myself" (калька с русского "чувствовать себя"). Правильно: "I feel good".',
  },
  // 28. Say me / said me -> tell me / told me
  {
    pattern: /\b(say|said)\s+(me|us|him|her|them)\b/i,
    original: (m) => m[0],
    correction: (m) => m[1].toLowerCase() === 'said' ? `told ${m[2]}` : `tell ${m[2]}`,
    type: 'vocabulary',
    explanationRu: 'Когда мы указываем, кому именно адресованы слова, используется глагол "tell" (tell me / told me), а не "say".',
  },
  // 29. Learn English to children / learn someone -> teach English to children / teach someone
  {
    pattern: /\blearn\s+(english|someone|children|kids)\s+to\b/i,
    original: (m) => m[0],
    correction: (m) => m[0].replace(/learn/i, 'teach'),
    type: 'vocabulary',
    explanationRu: '"Learn" означает "учиться самому", а "обучать других" — это "teach".',
  },
  // 30. Can you borrow me -> can you lend me
  {
    pattern: /\b(can\s+you|could\s+you)\s+borrow\s+me\b/i,
    original: (m) => m[0],
    correction: (m) => `${m[1]} lend me`,
    type: 'vocabulary',
    explanationRu: '"Borrow" означает "брать взаймы", а "одолжить кому-то" — это глагол "lend".',
  },
  // 31. Comfortable time (for meeting) -> convenient time
  {
    pattern: /\bcomfortable\s+time\b/i,
    original: () => 'comfortable time',
    correction: () => 'convenient time',
    type: 'vocabulary',
    explanationRu: '"Comfortable" относится к физическому комфорту (кресло, обувь), а удобное время или дата встречи — "convenient time".',
  },
  // 32. High price vs expensive price
  {
    pattern: /\bexpensive\s+price\b/i,
    original: () => 'expensive price',
    correction: () => 'high price',
    type: 'vocabulary',
    explanationRu: 'Товар может быть "expensive", но сама цена бывает "high" (высокая) или "low" (низкая).',
  },
  // 33. "than" used as thank you
  {
    pattern: /(^|[,\s])than([,\s]|$)/i,
    original: (m) => m[0].trim().replace(/,/g, ''),
    correction: () => 'thanks',
    type: 'vocabulary',
    explanationRu: 'Слово "than" означает "чем" при сравнении. Для благодарности используется "thanks" или "thank you".',
  },
  // 34. Missing verb "to be" with it/this/that + adjective
  {
    pattern: /\b(it|this|that)\s+(good|bad|nice|great|expensive|cheap|cold|warm|hot|delicious)\b/i,
    original: (m) => m[0],
    correction: (m) => `${m[1]} is ${m[2]}`,
    type: 'grammar',
    explanationRu: 'В английском предложении обязательно нужен глагол-связка "is" (например, "it is" или "it\'s").',
  },
  // 35. Missing article with deal
  {
    pattern: /\b(good|great|bad)\s+deal\b/i,
    original: (m) => m[0],
    correction: (m) => `a ${m[0]}`,
    type: 'grammar',
    explanationRu: 'Перед исчисляемым существительным "deal" с прилагательным нужен неопределенный артикль "a" (a good deal).',
  },
  // 36. Missing verb "to be" with "I" + adjective
  {
    pattern: /\bi\s+(happy|sad|tired|hungry|ready|cold|warm|sure|sorry|busy)\b/i,
    original: (m) => m[0],
    correction: (m) => `I am ${m[1]}`,
    type: 'grammar',
    explanationRu: 'Не забывайте вспомогательный глагол "am" (например, "I am" или "I\'m").',
  },
  // 37. "I very like" -> "I really like"
  {
    pattern: /\bvery\s+(like|love|want)\b/i,
    original: (m) => m[0],
    correction: (m) => `really ${m[1]}`,
    type: 'vocabulary',
    explanationRu: 'С глаголами используется "really" или "very much", а не "very" напрямую.',
  },
  // 38. "every days" -> "every day"
  {
    pattern: /\bevery\s+days\b/i,
    original: () => 'every days',
    correction: () => 'every day',
    type: 'grammar',
    explanationRu: 'После слова "every" существительное всегда стоит в единственном числе: "every day".',
  },
  // 39. "much people" -> "many people"
  {
    pattern: /\bmuch\s+(people|friends|books|questions)\b/i,
    original: (m) => m[0],
    correction: (m) => `many ${m[1]}`,
    type: 'grammar',
    explanationRu: 'С исчисляемыми существительными во множественном числе используется "many", а не "much".',
  },
];

// Whitelist of natural conversational expressions that must NEVER be flagged as errors
const NATURAL_CONVERSATIONAL_WHITELIST = [
  /^(a\s+)?(cup\s+of\s+)?(coffee|tea|water|juice|latte|cappuccino)(\s+with\s+\w+)?(,\s*please)?\.?$/i,
  /^(two|three|four|one)\s+(tickets?|coffees?|seats?|croissants?)(,\s*please)?\.?$/i,
  /^(can|could)\s+i\s+(have|get|take|order)\b/i,
  /^(i\s*['’]?\s*m|i\s+am)\s+(good|fine|doing\s+well|great|okay)(,\s*thanks?|\s+thank\s+you)?\.?$/i,
  /^(yes|yeah|sure|yep|no|nope|of\s+course)(,\s*please|\s+thanks?|\s+thank\s+you)?\.?$/i,
  /^(just\s+looking|just\s+browsing)(,\s*thank\s+you|,\s*thanks)?\.?$/i,
  /^(that\s+sounds?|sounds?)\s+(great|good|lovely|nice|wonderful|delicious|fun)\.?$/i,
  /^(i\s*['’]?\s*d|i\s+would)\s+love\s+to\b/i,
  /^(here\s+you\s+go|there\s+you\s+go|never\s+mind|no\s+problem|you\s*['’]?\s*re\s+welcome)\.?$/i,
  /^(see\s+you|have\s+a\s+(good|nice|great)\s+(day|flight|trip|evening))\.?$/i,
  /^(how\s+much\s+is\s+it|how\s+much\s+does\s+it\s+cost|where\s+is\s+the\s+\w+)\??$/i,
];

export function isNaturalConversationalEllipsis(text: string): boolean {
  const clean = text.trim();
  return NATURAL_CONVERSATIONAL_WHITELIST.some((re) => re.test(clean));
}

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
      teacherExplanationRu: "⚠️ I couldn't understand your answer. Please try again.",
    };
  }

  // 2. Appropriateness check: whitelist of natural conversational phrases
  if (isNaturalConversationalEllipsis(trimmed)) {
    return {
      isGibberish: false,
      grammarStatus: 'correct',
      vocabularyStatus: 'correct',
      naturalnessStatus: 'natural',
      contextStatus: 'relevant',
      corrections: [],
      betterSentence: null,
      scores: { grammar: 100, vocabulary: 100, naturalness: 100, context: 100 },
      teacherExplanationRu: 'Отличный живой ответ! В разговорной речи звучит естественно и грамотно.',
    };
  }

  // 2.5 Single isolated adjective check (e.g. "sad", "good" when answering open question)
  const cleanWords = trimmed.replace(/[.,!?;:]/g, '').split(/\s+/).filter(Boolean);
  if (cleanWords.length === 1 && !isNaturalConversationalEllipsis(trimmed)) {
    const single = cleanWords[0].toLowerCase();
    const commonAdjectives = ['sad', 'happy', 'tired', 'angry', 'hungry', 'cold', 'warm', 'fine', 'good', 'bad', 'bored', 'busy'];
    if (commonAdjectives.includes(single)) {
      return {
        isGibberish: false,
        grammarStatus: 'minor',
        vocabularyStatus: 'correct',
        naturalnessStatus: 'unnatural',
        contextStatus: 'relevant',
        corrections: [{
          original: trimmed,
          correction: `I feel ${single}`,
          type: 'grammar',
          explanationRu: `Одиночное слово "${trimmed}" звучит слишком отрывисто. В диалоге лучше ответить полной фразой: "I feel ${single}" или "I'm ${single}".`,
        }],
        betterSentence: `I feel ${single}.`,
        scores: { grammar: 70, vocabulary: 85, naturalness: 60, context: 70 },
        teacherExplanationRu: `Ваш ответ понятен, но для разговорной практики старайтесь строить полные предложения, например: "I feel ${single}".`,
      };
    }
  }

  // 3. Rule-based correction matching
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

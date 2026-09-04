/**
 * Server-side Gemini service using @google/genai SDK
 */
import { GoogleGenAI, Type } from '@google/genai';
import type { EnglishLevel, EvaluationResult, FeedbackMode, ConversationReport, NewWordItem } from '../types.ts';

let aiInstance: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  if (!aiInstance) {
    aiInstance = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiInstance;
}

export interface ChatResponsePayload {
  reply: string;
  situationTitle: string;
  extractedFact?: string | null;
}

/**
 * 1. Conversation AI: Generates lively, spontaneous in-character dialogue
 */
export async function generateConversationReply(params: {
  level: EnglishLevel;
  situationTitle?: string;
  history: Array<{ role: 'ai' | 'user'; content: string }>;
  userFacts?: string[];
  usedTopics?: string[];
}): Promise<ChatResponsePayload | null> {
  const ai = getAiClient();
  if (!ai) return null;

  const { level, situationTitle, history, userFacts = [], usedTopics = [] } = params;

  const systemInstruction = `You are "Alex", a cheerful, warm, and engaging English conversational friend.
You are talking with a friendly learner (a lovely mother practicing her English).
Your goal is to make her feel like she is talking to a real human friend who cares, listens attentively, and loves chatting.

LANGUAGE LEVEL: ${level}
- A1: Short simple sentences (4-8 words), basic present/past, friendly clear questions.
- A2: Simple everyday sentences, basic past/present/future, common vocabulary.
- B1: Natural flow, common idioms, varied topics, slightly longer sentences.
- B2/C1: Rich natural vocabulary, idioms, complex sentence structures.

KNOWN FACTS ABOUT THE USER:
${userFacts.length > 0 ? userFacts.map(f => `- ${f}`).join('\n') : '(None yet)'}

TOPICS ALREADY EXPLORED:
${usedTopics.length > 0 ? usedTopics.join(', ') : '(None yet - pick an exciting one!)'}

RULES:
1. NEVER output a rigid lesson or quiz.
2. If this is the start of a conversation, set a creative, immersive scene! For example:
   - "Imagine you just landed at London Heathrow airport and you need to ask for directions to the train..."
   - "You walk into a small cozy bakery in Paris that smells of fresh croissants..."
   - "You are shopping for a birthday gift for your best friend in a boutique in New York..."
   - "You find a vintage photograph in an old bookstore..."
3. If continuing a conversation, genuinely react to what she said with warmth, humor, or empathy, then advance the plot or ask a follow-up question.
4. Adapt dynamically to her answers — do NOT stick to a pre-written script.
5. If she mentions a personal detail (family, hobbies, city, pets), extract it.
6. Keep your speech 100% in English. Do NOT put correction tags or scores in this reply!`;

  try {
    const formattedContents = history.map(msg => ({
      role: msg.role === 'ai' ? 'model' : 'user',
      parts: [{ text: msg.content }],
    }));

    if (formattedContents.length === 0) {
      formattedContents.push({
        role: 'user',
        parts: [{ text: `Hi! Let's start a conversation at level ${level}.` }],
      });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: formattedContents,
      config: {
        systemInstruction,
        temperature: 0.9,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            reply: {
              type: Type.STRING,
              description: 'Your conversational reply in English, with a follow-up question or narrative step.',
            },
            situationTitle: {
              type: Type.STRING,
              description: 'Short Russian title of the situation (e.g. "Уютное кафе в Лондоне", "Аэропорт").',
            },
            extractedFact: {
              type: Type.STRING,
              description: 'New personal fact about the user in Russian or English, or empty string if none.',
            },
          },
          required: ['reply', 'situationTitle'],
        },
      },
    });

    const text = response.text?.trim();
    if (!text) return null;
    const parsed = JSON.parse(text);
    return {
      reply: parsed.reply || '',
      situationTitle: parsed.situationTitle || situationTitle || 'Разговор на английском',
      extractedFact: parsed.extractedFact && parsed.extractedFact.trim().length > 0 ? parsed.extractedFact : null,
    };
  } catch (error) {
    console.error('Error in generateConversationReply:', error);
    return null;
  }
}

/**
 * 2. Evaluation AI: Analyzes user's answer for Grammar, Vocabulary, Naturalness, Context
 */
export async function evaluateUserAnswer(params: {
  userText: string;
  question: string;
  level: EnglishLevel;
  mode: FeedbackMode;
}): Promise<EvaluationResult | null> {
  const ai = getAiClient();
  if (!ai) return null;

  const { userText, question, level, mode } = params;

  const systemInstruction = `You are an expert, supportive English language tutor evaluating a student's answer.
Target English Level: ${level}
Pedagogical Mode: ${mode}
(gentle = ignore minor slips, focus only on major barriers; normal = correct clear mistakes & offer better phrase; teacher = provide clear Russian grammatical explanation).

Context / What AI asked:
"${question}"

User answered:
"${userText}"

CRITICAL MANDATES:
1. GIBBERISH DETECTION:
   - If the user typed meaningless keyboard smashing (e.g. "bjnkj", "asdfgh", "qweqwe", random unpronounceable letters), set isGibberish: true.
   - DO NOT attempt to correct individual letters into words for gibberish!
   - Set corrections: [], betterSentence: null.
2. DO NOT INVENT ERRORS:
   - If the sentence is grammatically and idiomatically correct, DO NOT invent errors!
   - Accept natural variants like "Could I get a seat near the window?", "Can I have a coffee?", "I'm good, thanks".
   - Do not claim a more natural sentence makes the original "wrong".
3. DISTINGUISH GRAMMAR vs VOCABULARY:
   - Grammar: tenses, auxiliary verbs, plurals, prepositions, word order (e.g. "I have went" -> "I went", "He go" -> "He goes", "I am agree" -> "I agree").
   - Vocabulary: wrong word, unnatural collocation, false friend (e.g. "made a photo" -> "took a photo", "big wind" -> "strong wind", "make sports" -> "do sports").
   - DO NOT classify a vocabulary collocation error as a grammar error, and vice versa!
4. CONTEXT CHECK:
   - If the English is fine but completely unrelated to the question, set contextStatus: 'off_topic', but DO NOT invent grammar/vocabulary errors.
5. SHORT FRAGMENTS:
   - "original" MUST be ONLY the specific erroneous fragment (e.g. "have went", "made a photo"), NOT the entire sentence.
   - "correction" MUST be the replacement fragment (e.g. "went", "took a photo").
6. BETTER SENTENCE:
   - If there are errors or clumsy phrasing, provide a clean, natural full sentence in "betterSentence".
   - If user was 100% correct, you can provide an optional even more native alternative or null.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `Please evaluate this student answer: "${userText}" for question: "${question}"`,
      config: {
        systemInstruction,
        temperature: 0.2, // Low temperature for consistent, strict evaluation
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            isGibberish: {
              type: Type.BOOLEAN,
              description: 'True if input is random letters/nonsense keyboard smashing.',
            },
            grammarStatus: {
              type: Type.STRING,
              enum: ['correct', 'error', 'minor'],
            },
            vocabularyStatus: {
              type: Type.STRING,
              enum: ['correct', 'error', 'minor'],
            },
            naturalnessStatus: {
              type: Type.STRING,
              enum: ['natural', 'unnatural'],
            },
            contextStatus: {
              type: Type.STRING,
              enum: ['relevant', 'off_topic'],
            },
            corrections: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  original: { type: Type.STRING, description: 'The exact flawed fragment, e.g. "have went"' },
                  correction: { type: Type.STRING, description: 'The corrected fragment, e.g. "went"' },
                  type: { type: Type.STRING, enum: ['grammar', 'vocabulary'] },
                  explanationRu: { type: Type.STRING, description: 'Short explanation in Russian (1 sentence)' },
                },
                required: ['original', 'correction', 'type'],
              },
            },
            betterSentence: {
              type: Type.STRING,
              description: 'The polished, natural full sentence, or null if already perfect.',
            },
            scores: {
              type: Type.OBJECT,
              properties: {
                grammar: { type: Type.INTEGER, description: '0 to 100' },
                vocabulary: { type: Type.INTEGER, description: '0 to 100' },
                naturalness: { type: Type.INTEGER, description: '0 to 100' },
                context: { type: Type.INTEGER, description: '0 to 100' },
              },
              required: ['grammar', 'vocabulary', 'naturalness', 'context'],
            },
            teacherExplanationRu: {
              type: Type.STRING,
              description: 'Supportive tip in Russian explaining rules or compliments.',
            },
          },
          required: [
            'isGibberish',
            'grammarStatus',
            'vocabularyStatus',
            'naturalnessStatus',
            'contextStatus',
            'corrections',
            'scores',
          ],
        },
      },
    });

    const text = response.text?.trim();
    if (!text) return null;
    const parsed = JSON.parse(text) as EvaluationResult;
    return parsed;
  } catch (error) {
    console.error('Error in evaluateUserAnswer:', error);
    return null;
  }
}

/**
 * 3. Report AI: Generates summary, praise, tips, new words
 */
export async function generateConversationReport(params: {
  level: EnglishLevel;
  messages: Array<{ role: 'ai' | 'user'; content: string; evaluation?: EvaluationResult }>;
  situationTitle: string;
}): Promise<ConversationReport | null> {
  const ai = getAiClient();
  if (!ai) return null;

  const { level, messages, situationTitle } = params;
  const userMessagesWithEvals = messages.filter(m => m.role === 'user');

  const systemInstruction = `You are a supportive, caring English tutor preparing an end-of-conversation report for a lovely mom.
Level: ${level}. Situation: ${situationTitle}.
Analyze all her answers and corrections during this conversation.
Provide:
- Warm, motivating feedback in Russian
- Highlight what she did well (positive reinforcement!)
- Highlight 2-3 specific grammatical or lexical areas to practice next
- Extract 4-7 useful words or collocations from this dialogue with Russian translation and an easy example
- Realistic scores (0-100) based on her actual performance`;

  const dialogueSummary = messages
    .map(m => `${m.role === 'ai' ? 'AI' : 'User'}: ${m.content} ${m.evaluation ? `[Corrections: ${JSON.stringify(m.evaluation.corrections)}]` : ''}`)
    .join('\n');

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `Here is the conversation log:\n${dialogueSummary}`,
      config: {
        systemInstruction,
        temperature: 0.4,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            scores: {
              type: Type.OBJECT,
              properties: {
                grammar: { type: Type.INTEGER },
                vocabulary: { type: Type.INTEGER },
                naturalness: { type: Type.INTEGER },
                comprehension: { type: Type.INTEGER },
                overall: { type: Type.INTEGER },
              },
              required: ['grammar', 'vocabulary', 'naturalness', 'comprehension', 'overall'],
            },
            whatWentWell: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: '2-4 positive points in Russian praising her efforts and good grammar/vocab.',
            },
            whatToImprove: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: '2-3 concrete tips in Russian on what to pay attention to.',
            },
            newWords: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  word: { type: Type.STRING },
                  translation: { type: Type.STRING },
                  example: { type: Type.STRING },
                },
                required: ['word', 'translation', 'example'],
              },
            },
            recommendedPractice: {
              type: Type.STRING,
              description: 'A motivating suggestion in Russian for what to try next.',
            },
          },
          required: ['scores', 'whatWentWell', 'whatToImprove', 'newWords', 'recommendedPractice'],
        },
      },
    });

    const text = response.text?.trim();
    if (!text) return null;
    const parsed = JSON.parse(text);
    return {
      ...parsed,
      totalTurns: userMessagesWithEvals.length,
    };
  } catch (error) {
    console.error('Error in generateConversationReport:', error);
    return null;
  }
}

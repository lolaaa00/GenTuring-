// Game Engine - Core logic for the Turing Test Game

export type GamePhase = 'home' | 'matchmaking' | 'chat' | 'guess' | 'analyze' | 'validating' | 'result' | 'appeal' | 'genlayer';
export type AppMode = 'game' | 'analyze';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'opponent';
  text: string;
  timestamp: number;
}

export interface ValidatorResult {
  id: number;
  classification: 'AI' | 'Human';
  confidence: number;
  reasoning: string;
  processingTime: number;
}

export interface GameState {
  mode: AppMode;
  phase: GamePhase;
  opponentType: 'ai' | 'human';
  opponentPersonality: string;
  messages: ChatMessage[];
  analysisInput: string;
  userGuess: 'AI' | 'Human' | null;
  validators: ValidatorResult[];
  consensus: 'AI' | 'Human' | null;
  score: number;
  totalGames: number;
  walletAddress: string | null;
  txHash: string | null;
  appealCount: number;
}

// --------------- Humanized AI Opponent ---------------

interface Persona {
  name: string;
  style: string;
  greetings: string[];
  reactions: string[];
  fillers: string[];
  questions: string[];
  shortReplies: string[];
}

const PERSONAS: Persona[] = [
  {
    name: 'chaotic texter',
    style: 'messy, impulsive, lots of lol',
    greetings: ['yooo', 'heyy', 'sup', 'yo whats good'],
    reactions: [
      'lol wait what',
      'bruh thats wild',
      'nahhh no way 😭',
      'LMAO okay',
      'bro stoppp',
      'im dead 💀',
      'thats so random lol',
      'wait fr??',
      'okay that got me ngl',
    ],
    fillers: ['idk', 'like', 'tbh', 'lowkey', 'ngl'],
    questions: ['wbu?', 'u think so?', 'wait why tho', 'have u ever??', 'whats ur take'],
    shortReplies: ['lol', 'fr', 'yeah', 'nah', 'maybe', 'idk', 'hmm', 'true', 'facts', 'same'],
  },
  {
    name: 'dry humor',
    style: 'sarcastic, minimal effort',
    greetings: ['hey', 'hi i guess', 'yo'],
    reactions: [
      'cool story',
      'wow groundbreaking',
      'thats... something',
      'sure why not',
      'bold of u to say that',
      'i mean yeah',
      'riveting',
      'thats either genius or dumb',
    ],
    fillers: ['honestly', 'i mean', 'like'],
    questions: ['and?', 'so what', 'why do u care', 'does it matter tho'],
    shortReplies: ['k', 'sure', 'meh', 'whatever', 'lol ok', 'fair', 'doubt it'],
  },
  {
    name: 'emotional',
    style: 'expressive, uses emojis, warm',
    greetings: ['hiii!', 'omg hey!', 'heyy 😊'],
    reactions: [
      'aww thats actually cute',
      'wait nooo 😭',
      'omg stoppp',
      'thats so sweet actually',
      'ugh i feel that',
      'that literally made me smile',
      'ngl that hit different',
      'im not crying ur crying',
    ],
    fillers: ['like', 'omg', 'literally', 'honestly'],
    questions: ['how does that make u feel?', 'wait really??', 'do u actually think that?', 'thats crazy right?'],
    shortReplies: ['aww', 'omg', 'nooo', 'yesss', 'stoppp', '😭', '🥺', 'literally'],
  },
  {
    name: 'chill gamer',
    style: 'relaxed, gaming references, brief',
    greetings: ['yo', 'sup', 'gg', 'hey whats up'],
    reactions: [
      'thats a W',
      'big L tbh',
      'gg no re',
      'skill issue lol',
      'thats lowkey goated',
      'mid take ngl',
      'based',
      'ratio',
    ],
    fillers: ['ngl', 'lowkey', 'fr fr', 'no cap'],
    questions: ['u play anything?', 'whats ur main?', 'ranked or casual?', 'pc or console?'],
    shortReplies: ['gg', 'W', 'L', 'based', 'mid', 'cope', 'bet', 'ez'],
  },
  {
    name: 'overthinker',
    style: 'rambling, self-correcting, uncertain',
    greetings: ['hey! wait actually hi', 'oh hey', 'hii sorry if this is weird'],
    reactions: [
      'okay wait let me think about that',
      'hmm actually maybe ur right? or not idk',
      'i had an opinion but i forgot it lol',
      'see i wanna agree but also...',
      'my brain is doing too many things rn',
      'i changed my mind 3 times already',
    ],
    fillers: ['actually', 'wait', 'hmm', 'i think', 'maybe'],
    questions: ['does that even make sense?', 'am i overthinking this?', 'wait what were we talking about?', 'u know what i mean?'],
    shortReplies: ['hmm', 'maybe?', 'idk actually', 'wait', 'hold on', 'uhhh'],
  },
];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function maybeTypo(text: string): string {
  if (Math.random() > 0.25) return text;
  const typos: Array<[RegExp, string]> = [
    [/\bthe\b/, 'teh'],
    [/\byou\b/i, 'u'],
    [/\byour\b/i, 'ur'],
    [/\breally\b/i, 'rly'],
    [/\bpeople\b/i, 'ppl'],
    [/\bprobably\b/i, 'prolly'],
    [/\bthough\b/i, 'tho'],
    [/\bbecause\b/i, 'cuz'],
    [/\bdon't\b/i, 'dont'],
    [/\bcan't\b/i, 'cant'],
    [/\bI'm\b/, 'im'],
    [/\bI\b/, 'i'],
  ];
  return typos.reduce((t, [p, r]) => t.replace(p, r), text);
}

function maybeLowercase(text: string): string {
  return Math.random() < 0.7 ? text.toLowerCase() : text;
}

function maybeTrail(text: string): string {
  if (Math.random() < 0.15) return text + '...';
  if (Math.random() < 0.1) return text + ' lol';
  if (Math.random() < 0.08) return text + ' tbh';
  return text;
}

export function getRandomPersonality() {
  return PERSONAS[Math.floor(Math.random() * PERSONAS.length)];
}

export function getOpponentResponse(persona: Persona, messageIndex: number): string {
  // First message: use a greeting
  if (messageIndex <= 1) {
    return maybeLowercase(pick(persona.greetings));
  }

  const roll = Math.random();

  // 25% chance of very short reply
  if (roll < 0.25) {
    return pick(persona.shortReplies);
  }

  // 20% chance of asking a question
  if (roll < 0.45) {
    return maybeTrail(maybeLowercase(maybeTypo(pick(persona.questions))));
  }

  // 15% chance of filler + reaction combo
  if (roll < 0.6) {
    return maybeLowercase(maybeTypo(`${pick(persona.fillers)} ${pick(persona.reactions).toLowerCase()}`));
  }

  // 10% self-contradiction
  if (roll < 0.7) {
    return pick([
      'wait nvm i take that back',
      'actually forget what i said lol',
      'ok i changed my mind',
      'hmm nah thats wrong actually',
      'wait no the opposite',
    ]);
  }

  // Default: reaction with possible typo
  return maybeTrail(maybeLowercase(maybeTypo(pick(persona.reactions))));
}

// --------------- Validators ---------------

const VALIDATOR_REASONINGS_AI = [
  "Response patterns show consistent formal structure and lack of natural speech disfluencies.",
  "Linguistic analysis reveals systematic vocabulary selection and predictable syntactic patterns.",
  "Response timing and consistency suggest non-human behavior.",
  "High lexical diversity with suspiciously low error rates detected.",
  "Structured argumentation absent of tangential thinking common in human discourse.",
  "Sentiment analysis shows calibrated emotional responses rather than genuine affect.",
  "Word frequency distribution deviates from typical human conversational patterns.",
];

const VALIDATOR_REASONINGS_HUMAN = [
  "Conversation exhibits natural speech patterns including informal language and emotional variability.",
  "Detected authentic markers: typos, incomplete thoughts, emotional reactivity.",
  "Participant demonstrates genuine personality traits with evolving emotional engagement.",
  "Linguistic markers show genuine disfluency patterns and colloquial expressions.",
  "Analysis reveals authentic emotional responses with appropriate variance.",
  "Communication style includes natural hedging, self-correction, and uncertainty markers.",
  "Response patterns show genuine engagement with topic drift and personal anecdotes.",
];

export function generateValidators(
  actualType: 'ai' | 'human',
  count: number = 5,
  forceAccuracy: boolean = false
): ValidatorResult[] {
  const validators: ValidatorResult[] = [];
  const correctClassification = actualType === 'ai' ? 'AI' : 'Human';
  const wrongClassification = actualType === 'ai' ? 'Human' : 'AI';

  for (let i = 0; i < count; i++) {
    const isCorrect = forceAccuracy ? true : Math.random() < 0.75;
    const classification = isCorrect ? correctClassification : wrongClassification;
    const reasonings = classification === 'AI' ? VALIDATOR_REASONINGS_AI : VALIDATOR_REASONINGS_HUMAN;

    validators.push({
      id: i + 1,
      classification,
      confidence: Math.round(65 + Math.random() * 30),
      reasoning: reasonings[Math.floor(Math.random() * reasonings.length)],
      processingTime: Math.round(800 + Math.random() * 2200),
    });
  }

  return validators;
}

function analyzeSignals(content: string) {
  const text = content.trim();
  const lower = text.toLowerCase();
  const words = text.split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const avgSentenceLen = wordCount / Math.max(sentences.length, 1);

  const slang = /\b(lol|lmao|ngl|idk|bro|fr|tbh|omg|nah|ya|wanna|gonna|bruh|smh|imo|fwiw|bc|cuz)\b/.test(lower);
  const emoji = /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u.test(text);
  const typos = /\b(im|ive|dont|cant|thats|ur|u|gotta|kinda|sorta|woulda|coulda)\b/.test(lower);
  const contractions = /\b(i'm|i've|don't|can't|won't|it's|that's|they're|we're|you're|isn't|wasn't|weren't|couldn't|wouldn't|shouldn't)\b/i.test(text);
  const formalStructure = /\b(firstly|secondly|therefore|moreover|furthermore|in conclusion|overall|consequently|additionally|thus|hence|whereby)\b/.test(lower);
  const longForm = wordCount > 40;
  const repeatedPunctuation = /[!?]{2,}/.test(text);
  const rigidPunctuation = /[;:]/.test(text);
  const personalPronouns = /\b(i|me|my|we|our|myself)\b/i.test(text);
  const hedging = /\b(maybe|probably|i think|i guess|sort of|kind of|might|perhaps)\b/i.test(text);
  const listPattern = /(\d+\.\s|\-\s|\*\s)/g;
  const hasList = (text.match(listPattern) || []).length >= 2;
  const perfectGrammar = !typos && !slang && avgSentenceLen > 15;

  // More balanced scoring
  let aiSignal = 0;
  let humanSignal = 0;

  if (formalStructure) aiSignal += 3;
  if (longForm && avgSentenceLen > 18) aiSignal += 2;
  if (rigidPunctuation) aiSignal += 1;
  if (hasList) aiSignal += 2;
  if (perfectGrammar) aiSignal += 2;
  if (!personalPronouns && wordCount > 20) aiSignal += 1;

  if (slang) humanSignal += 3;
  if (emoji) humanSignal += 2;
  if (typos) humanSignal += 3;
  if (repeatedPunctuation) humanSignal += 2;
  if (hedging) humanSignal += 2;
  if (contractions) humanSignal += 1;
  if (personalPronouns) humanSignal += 1;
  if (wordCount < 15) humanSignal += 1; // Short texts are more human-like

  return { slang, emoji, typos, formalStructure, longForm, repeatedPunctuation, aiSignal, humanSignal };
}

function getAnalysisReasoning(classification: 'AI' | 'Human', content: string) {
  const signals = analyzeSignals(content);

  if (classification === 'AI') {
    if (signals.formalStructure) return 'Reads unusually structured, with polished transitions that feel generated.';
    if (signals.longForm) return 'Maintains a steady, high-coherence tone with very little natural messiness.';
    if (!signals.slang && !signals.typos) return 'The phrasing is clean and consistent in a way that feels machine-assisted.';
    return 'Overall cadence feels optimized and a bit too even for spontaneous human writing.';
  }

  if (signals.slang || signals.typos) return 'Includes casual shorthand and imperfections that feel more human than generated.';
  if (signals.emoji || signals.repeatedPunctuation) return 'The tone shifts and emphasis markers read like spontaneous human expression.';
  return 'The wording feels reactive and slightly uneven, which is a human-leaning signal.';
}

export function generateContentValidators(content: string, count: number = 5): ValidatorResult[] {
  const signals = analyzeSignals(content);
  const likelyClassification = signals.aiSignal >= signals.humanSignal ? 'AI' : 'Human';

  return Array.from({ length: count }, (_, index) => {
    const followsMajority = Math.random() < 0.74;
    const classification = followsMajority
      ? likelyClassification
      : likelyClassification === 'AI' ? 'Human' : 'AI';

    return {
      id: index + 1,
      classification,
      confidence: Math.round(62 + Math.random() * 33),
      reasoning: getAnalysisReasoning(classification, content),
      processingTime: Math.round(700 + Math.random() * 1900),
    };
  });
}

export function getConsensus(validators: ValidatorResult[]): 'AI' | 'Human' {
  const aiVotes = validators.filter(v => v.classification === 'AI').length;
  const humanVotes = validators.filter(v => v.classification === 'Human').length;
  return aiVotes >= humanVotes ? 'AI' : 'Human';
}

export function calculateScore(
  userGuess: 'AI' | 'Human',
  consensus: 'AI' | 'Human',
  actualType: 'ai' | 'human'
): number {
  const actual = actualType === 'ai' ? 'AI' : 'Human';
  const userCorrect = userGuess === actual;
  const consensusCorrect = consensus === actual;

  if (userCorrect && consensusCorrect) return 150;
  if (userCorrect && !consensusCorrect) return 100;
  if (!userCorrect && consensusCorrect) return -50;
  return -100;
}

export function generateTxHash(): string {
  const chars = '0123456789abcdef';
  let hash = '0x';
  for (let i = 0; i < 64; i++) {
    hash += chars[Math.floor(Math.random() * chars.length)];
  }
  return hash;
}

export const INITIAL_GAME_STATE: GameState = {
  mode: 'game',
  phase: 'home',
  opponentType: 'ai',
  opponentPersonality: '',
  messages: [],
  analysisInput: '',
  userGuess: null,
  validators: [],
  consensus: null,
  score: 0,
  totalGames: 0,
  walletAddress: null,
  txHash: null,
  appealCount: 0,
};

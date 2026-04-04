/**
 * AI Content Generator
 *
 * MVP: Rule-based extraction from canvasData text blocks.
 * V2: Swap extractAndGenerate() for LLM API call.
 */

import type { CanvasData } from '@/store/noteStore';

export interface GeneratedItem {
  type: 'flashcard' | 'quiz' | 'fill_in_blank';
  question: string;
  answer: string;
  options: string[] | null;       // quiz only
  blankedSentence: string | null; // fill_in_blank only
}

/**
 * Extract all text content from canvasData.
 */
export function extractText(canvasData: CanvasData): string {
  return canvasData.textBlocks.map((b) => b.content).join('\n');
}

/**
 * MVP rule-based generation: splits text into sentences and creates simple Q&A pairs.
 * Each sentence becomes a flashcard; every 3rd becomes a fill-in-blank.
 */
export function generateRuleBased(text: string): GeneratedItem[] {
  const sentences = text
    .split(/[.!?]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 10);

  const items: GeneratedItem[] = [];

  sentences.forEach((sentence, i) => {
    const words = sentence.split(/\s+/);
    if (words.length < 3) return;

    if (i % 3 === 2) {
      // Fill-in-the-blank: blank out the longest word
      const longestWordIdx = words.reduce(
        (maxIdx, w, idx) => (w.length > words[maxIdx].length ? idx : maxIdx),
        0,
      );
      const answer = words[longestWordIdx];
      const blanked = [...words];
      blanked[longestWordIdx] = '___';

      items.push({
        type: 'fill_in_blank',
        question: `Complete the sentence:`,
        answer,
        options: null,
        blankedSentence: blanked.join(' '),
      });
    } else {
      // Flashcard: first 3 words as question, full sentence as answer
      const questionWords = words.slice(0, Math.min(3, words.length));
      items.push({
        type: 'flashcard',
        question: `What is meant by: "${questionWords.join(' ')}..."?`,
        answer: sentence,
        options: null,
        blankedSentence: null,
      });
    }
  });

  return items.slice(0, 10); // cap at 10 items
}

/**
 * Main entry point. In V2, replace with LLM call.
 */
export async function extractAndGenerate(canvasData: CanvasData): Promise<GeneratedItem[]> {
  const text = extractText(canvasData);
  if (!text.trim()) return [];
  return generateRuleBased(text);
}

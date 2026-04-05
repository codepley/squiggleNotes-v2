/**
 * AI Content Generator
 *
 * MVP: Rule-based extraction from canvasData text blocks.
 * V2: Swap extractAndGenerate() for LLM API call.
 */

import type { CanvasData, Stroke } from '@/store/noteStore';
import { GoogleGenAI } from '@google/genai';

export interface GeneratedItem {
  type: 'flashcard' | 'quiz' | 'fill_in_blank';
  question: string;
  answer: string;
  options: string[] | null;       // quiz only
  blankedSentence: string | null; // fill_in_blank only
}

/**
 * Extract all text content from canvasData textblocks.
 */
export function extractText(canvasData: CanvasData): string {
  return canvasData.textBlocks.map((b) => b.content).join('\n');
}

/**
 * Compiles stored Canvas strokes into an SVG String.
 * We can pass this SVG String textually to Gemini.
 */
export function generateSvgFromStrokes(strokes: Stroke[]): string {
  if (!strokes || strokes.length === 0) return '';
  
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  strokes.forEach(s => {
    s.points.forEach(p => {
      if (p.x < minX) minX = p.x;
      if (p.y < minY) minY = p.y;
      if (p.x > maxX) maxX = p.x;
      if (p.y > maxY) maxY = p.y;
    });
  });

  if (minX === Infinity) return '';

  minX -= 20; minY -= 20; maxX += 20; maxY += 20;
  const width = Math.max(10, maxX - minX);
  const height = Math.max(10, maxY - minY);

  let svg = `<svg viewBox="${minX} ${minY} ${width} ${height}" width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg" style="background-color: white;">`;
  
  strokes.forEach(stroke => {
     if (stroke.points.length < 2 || stroke.tool === 'eraser') return;
     let path = `M ${stroke.points[0].x} ${stroke.points[0].y}`;
     stroke.points.slice(1).forEach(p => {
       path += ` L ${p.x} ${p.y}`;
     });
     const alpha = stroke.tool === 'highlighter' ? 0.3 : 1;
     const strokeWidth = stroke.tool === 'highlighter' ? stroke.width * 4 : stroke.width;
     
     svg += `<path d="${path}" stroke="${stroke.color}" stroke-opacity="${alpha}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round" fill="none" />`;
  });
  
  svg += `</svg>`;
  return svg;
}

/**
 * MVP fallback rule-based generation if no API key is provided.
 */
export function generateRuleBased(text: string): GeneratedItem[] {
  const sentences = text.split(/[.!?]+/).map((s) => s.trim()).filter((s) => s.length > 10);
  const items: GeneratedItem[] = [];

  sentences.forEach((sentence, i) => {
    const words = sentence.split(/\s+/);
    if (words.length < 3) return;

    if (i % 3 === 2) {
      const longestWordIdx = words.reduce((maxIdx, w, idx) => (w.length > words[maxIdx].length ? idx : maxIdx), 0);
      const answer = words[longestWordIdx];
      const blanked = [...words];
      blanked[longestWordIdx] = '___';
      items.push({ type: 'fill_in_blank', question: `Complete the sentence:`, answer, options: null, blankedSentence: blanked.join(' ') });
    } else {
      const questionWords = words.slice(0, Math.min(3, words.length));
      items.push({ type: 'flashcard', question: `What is meant by: "${questionWords.join(' ')}..."?`, answer: sentence, options: null, blankedSentence: null });
    }
  });

  return items.slice(0, 10);
}

/**
 * Multimodal AI Generation Entry Point.
 */
export async function extractAndGenerate(canvasData: CanvasData | null, imageData?: string | null): Promise<GeneratedItem[]> {
  const text = canvasData ? extractText(canvasData) : '';
  
  if (!text.trim() && !imageData) return [];
  
  if (!process.env.GEMINI_API_KEY) {
    console.warn('GEMINI_API_KEY missing, falling back to rule-based generation.');
    return generateRuleBased(text);
  }

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  
  const prompt = `You are an expert cognitive scientist and educator creating study materials based on Spaced Repetition principles.
I will provide you with a transcription of typed text (if any) and a visual image of the handwritten notes (if drawn).
Based on the synthesis of this content, generate exactly:
- 2 to 4 Flashcards
- 1 to 2 Fill-in-the-blank statements
- 1 to 2 Multiple Choice Quizzes

Return your response strictly as a JSON array of objects conforming to this TypeScript interface:
interface GeneratedItem {
  type: 'flashcard' | 'quiz' | 'fill_in_blank';
  question: string;
  answer: string;
  options: string[] | null; // exactly 4 options for 'quiz', null otherwise
  blankedSentence: string | null; // Original sentence with ___ for 'fill_in_blank', null otherwise
}

Here is the typed text transcription (if any):
"""
${text}
"""
`;

  // Construct contents payload supporting multimodal elements
  const contents: any[] = [];
  
  if (imageData && imageData.startsWith('data:image')) {
    // Strip "data:image/png;base64," prefix
    const base64Data = imageData.split(',')[1];
    const mimeType = imageData.split(':')[1].split(';')[0];
    contents.push({
      inlineData: {
        data: base64Data,
        mimeType,
      }
    });
  }
  
  contents.push(prompt);

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: contents,
      config: {
        responseMimeType: 'application/json',
      }
    });

    if (response.text) {
      const items = JSON.parse(response.text);
      return items;
    }
    return [];
  } catch (error) {
    console.error('Gemini Generation error:', error);
    return generateRuleBased(text);
  }
}

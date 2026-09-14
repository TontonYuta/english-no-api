/**
 * High-Performance Server-side TTS Audio Service with Chunking & In-Memory Caching.
 * Overcomes Google Translate TTS 160-char limitation by splitting long passages
 * into natural sentence chunks and concatenating MP3 frames into a single seamless audio stream.
 */

const ttsCache = new Map<string, Buffer>();
const MAX_CACHE_ENTRIES = 300;

/**
 * Splits text into chunks <= maxLen, prioritizing sentence and clause boundaries.
 */
export function chunkTextForTTS(text: string, maxLen: number = 130): string[] {
  const trimmed = text.trim();
  if (!trimmed) return [];
  if (trimmed.length <= maxLen) return [trimmed];

  // Regex split by sentence boundaries (.?!;)
  const rawSentences = trimmed.split(/(?<=[.?!;])\s+/);
  const chunks: string[] = [];
  let currentChunk = '';

  for (const sentence of rawSentences) {
    if (!sentence.trim()) continue;

    // If a single sentence exceeds maxLen, break by commas or spaces
    if (sentence.length > maxLen) {
      if (currentChunk) {
        chunks.push(currentChunk.trim());
        currentChunk = '';
      }
      const clauses = sentence.split(/(?<=[,:\n])\s+/);
      for (const clause of clauses) {
        if (!clause.trim()) continue;
        if (clause.length > maxLen) {
          // Break into words
          const words = clause.split(/\s+/);
          for (const word of words) {
            if ((currentChunk + ' ' + word).trim().length > maxLen) {
              if (currentChunk) chunks.push(currentChunk.trim());
              currentChunk = word;
            } else {
              currentChunk = currentChunk ? `${currentChunk} ${word}` : word;
            }
          }
        } else {
          if ((currentChunk + ' ' + clause).trim().length > maxLen) {
            if (currentChunk) chunks.push(currentChunk.trim());
            currentChunk = clause;
          } else {
            currentChunk = currentChunk ? `${currentChunk} ${clause}` : clause;
          }
        }
      }
    } else {
      if ((currentChunk + ' ' + sentence).trim().length > maxLen) {
        if (currentChunk) chunks.push(currentChunk.trim());
        currentChunk = sentence;
      } else {
        currentChunk = currentChunk ? `${currentChunk} ${sentence}` : sentence;
      }
    }
  }

  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }

  return chunks.filter((c) => c.length > 0);
}

/**
 * Fetches an MP3 buffer for a single short text segment from Google Translate TTS.
 */
async function fetchGoogleTTSChunk(chunk: string, langCode: string): Promise<Buffer | null> {
  const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${langCode}&client=tw-ob&q=${encodeURIComponent(chunk)}`;
  try {
    const response = await fetch(ttsUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      },
      signal: AbortSignal.timeout(6000),
    });

    if (!response.ok) {
      return null;
    }

    const arrayBuf = await response.arrayBuffer();
    return Buffer.from(arrayBuf);
  } catch (err) {
    return null;
  }
}

/**
 * Retrieves a complete MP3 buffer for arbitrary length text with chunking & caching.
 */
export async function getTTSAudioBuffer(
  text: string,
  voiceOrLang: string = 'en-US'
): Promise<Buffer | null> {
  const cleanText = text.trim();
  if (!cleanText) return null;

  const isGB = voiceOrLang.toLowerCase().includes('gb') || voiceOrLang.toLowerCase().includes('uk');
  const langCode = isGB ? 'en-gb' : 'en';
  const cacheKey = `${langCode}:::${cleanText}`;

  // 1. Check in-memory cache
  if (ttsCache.has(cacheKey)) {
    return ttsCache.get(cacheKey)!;
  }

  // 2. Chunk text
  const chunks = chunkTextForTTS(cleanText, 130);
  if (chunks.length === 0) return null;

  // 3. Fetch chunks in sequence or parallel (limit concurrency to 4)
  const buffers: Buffer[] = [];
  for (const chunk of chunks) {
    const chunkBuffer = await fetchGoogleTTSChunk(chunk, langCode);
    if (chunkBuffer) {
      buffers.push(chunkBuffer);
    }
  }

  if (buffers.length === 0) {
    return null;
  }

  // Concatenate MP3 frames into single valid MP3 stream
  const finalBuffer = Buffer.concat(buffers);

  // 4. Update Cache
  if (ttsCache.size >= MAX_CACHE_ENTRIES) {
    // Evict oldest entry
    const firstKey = ttsCache.keys().next().value;
    if (firstKey) ttsCache.delete(firstKey);
  }
  ttsCache.set(cacheKey, finalBuffer);

  return finalBuffer;
}

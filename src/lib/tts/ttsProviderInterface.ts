/**
 * TTS Provider Interface
 *
 * Abstraction layer to support multiple TTS backends:
 * - Browser (Web Speech API) - current implementation
 * - Coqui TTS (server-streamed)
 * - Kokoro (server-streamed)
 * - ElevenLabs (server-streamed)
 */

export interface TTSVoice {
  id: string;
  name: string;
  language: string;
  provider: string;
  gender?: "male" | "female" | "neutral";
  preview?: string; // URL to voice sample
}

export interface TTSOptions {
  rate: number; // 0.1 to 10
  pitch: number; // 0 to 2
  volume: number; // 0 to 1
  voice?: TTSVoice;
}

export interface BoundaryEvent {
  type: "word" | "sentence" | "paragraph";
  charIndex: number;
  charLength: number;
  text: string;
}

export interface TTSProvider {
  /** Provider name for display */
  readonly name: string;

  /** Provider type */
  readonly type: "browser" | "server";

  /** Check if provider is available */
  isAvailable(): Promise<boolean>;

  /** Get available voices */
  getVoices(): Promise<TTSVoice[]>;

  /** Start speaking text */
  speak(text: string, options?: Partial<TTSOptions>): Promise<void>;

  /** Pause playback */
  pause(): void;

  /** Resume playback */
  resume(): void;

  /** Stop playback completely */
  stop(): void;

  /** Called when word/sentence boundary is crossed */
  onBoundary?: (event: BoundaryEvent) => void;

  /** Called when speech ends */
  onEnd?: () => void;

  /** Called on error */
  onError?: (error: Error) => void;
}

/**
 * Browser TTS Provider using Web Speech API
 */
export class BrowserTTSProvider implements TTSProvider {
  readonly name = "Browser";
  readonly type = "browser" as const;

  private synthesis: SpeechSynthesis | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;

  onBoundary?: (event: BoundaryEvent) => void;
  onEnd?: () => void;
  onError?: (error: Error) => void;

  constructor() {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      this.synthesis = window.speechSynthesis;
    }
  }

  async isAvailable(): Promise<boolean> {
    return this.synthesis !== null;
  }

  async getVoices(): Promise<TTSVoice[]> {
    if (!this.synthesis) return [];

    // Wait for voices to load
    await new Promise<void>((resolve) => {
      const voices = this.synthesis!.getVoices();
      if (voices.length > 0) {
        resolve();
      } else {
        this.synthesis!.addEventListener("voiceschanged", () => resolve(), {
          once: true,
        });
      }
    });

    return this.synthesis.getVoices().map((voice) => ({
      id: voice.voiceURI,
      name: voice.name,
      language: voice.lang,
      provider: "browser",
    }));
  }

  async speak(text: string, options?: Partial<TTSOptions>): Promise<void> {
    if (!this.synthesis) {
      throw new Error("Speech synthesis not available");
    }

    this.stop();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = options?.rate ?? 1;
    utterance.pitch = options?.pitch ?? 1;
    utterance.volume = options?.volume ?? 1;

    if (options?.voice) {
      const browserVoice = this.synthesis
        .getVoices()
        .find((v) => v.voiceURI === options.voice!.id);
      if (browserVoice) {
        utterance.voice = browserVoice;
      }
    }

    utterance.onboundary = (event) => {
      if (this.onBoundary && event.name === "word") {
        this.onBoundary({
          type: "word",
          charIndex: event.charIndex,
          charLength: event.charLength || 0,
          text: text.substring(
            event.charIndex,
            event.charIndex + (event.charLength || 0)
          ),
        });
      }
    };

    utterance.onend = () => {
      this.onEnd?.();
    };

    utterance.onerror = (event) => {
      this.onError?.(new Error(event.error));
    };

    this.currentUtterance = utterance;
    this.synthesis.speak(utterance);
  }

  pause(): void {
    this.synthesis?.pause();
  }

  resume(): void {
    this.synthesis?.resume();
  }

  stop(): void {
    this.synthesis?.cancel();
    this.currentUtterance = null;
  }
}

/**
 * Server TTS Provider base class for streaming audio from server
 * Extend this for Coqui, Kokoro, ElevenLabs, etc.
 */
export abstract class ServerTTSProvider implements TTSProvider {
  abstract readonly name: string;
  readonly type = "server" as const;
  protected audioElement: HTMLAudioElement | null = null;

  abstract readonly apiEndpoint: string;

  onBoundary?: (event: BoundaryEvent) => void;
  onEnd?: () => void;
  onError?: (error: Error) => void;

  async isAvailable(): Promise<boolean> {
    // Check if server endpoint is reachable
    try {
      const response = await fetch(`${this.apiEndpoint}/health`, {
        method: "HEAD",
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  abstract getVoices(): Promise<TTSVoice[]>;

  async speak(text: string, options?: Partial<TTSOptions>): Promise<void> {
    this.stop();

    try {
      const response = await fetch(`${this.apiEndpoint}/synthesize`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text,
          rate: options?.rate ?? 1,
          pitch: options?.pitch ?? 1,
          voice: options?.voice?.id,
        }),
      });

      if (!response.ok) {
        throw new Error(`TTS server error: ${response.statusText}`);
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);

      this.audioElement = new Audio(audioUrl);
      this.audioElement.onended = () => {
        this.onEnd?.();
        URL.revokeObjectURL(audioUrl);
      };
      this.audioElement.onerror = () => {
        this.onError?.(new Error("Audio playback error"));
      };

      await this.audioElement.play();
    } catch (error) {
      this.onError?.(error as Error);
    }
  }

  pause(): void {
    this.audioElement?.pause();
  }

  resume(): void {
    this.audioElement?.play();
  }

  stop(): void {
    if (this.audioElement) {
      this.audioElement.pause();
      this.audioElement.currentTime = 0;
      this.audioElement = null;
    }
  }
}

/**
 * Example: Coqui TTS Provider (placeholder for future implementation)
 */
export class CoquiTTSProvider extends ServerTTSProvider {
  readonly name = "Coqui TTS";
  readonly apiEndpoint: string;

  constructor(apiEndpoint: string = "/api/tts/coqui") {
    super();
    this.apiEndpoint = apiEndpoint;
  }

  async getVoices(): Promise<TTSVoice[]> {
    try {
      const response = await fetch(`${this.apiEndpoint}/voices`);
      const data = await response.json();
      return data.voices || [];
    } catch {
      return [];
    }
  }
}

/**
 * Example: Kokoro TTS Provider (placeholder for future implementation)
 */
export class KokoroTTSProvider extends ServerTTSProvider {
  readonly name = "Kokoro";
  readonly apiEndpoint: string;

  constructor(apiEndpoint: string = "/api/tts/kokoro") {
    super();
    this.apiEndpoint = apiEndpoint;
  }

  async getVoices(): Promise<TTSVoice[]> {
    try {
      const response = await fetch(`${this.apiEndpoint}/voices`);
      const data = await response.json();
      return data.voices || [];
    } catch {
      return [];
    }
  }
}

// Default provider factory
export const createDefaultTTSProvider = (): TTSProvider => {
  return new BrowserTTSProvider();
};

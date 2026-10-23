// Lớp trừu tượng phát âm tiếng Nhật — hiện dùng Web Speech API của trình duyệt.
// Sau này cắm TTS API / file thu sẵn: viết class khác cùng interface, không sửa UI.
export interface SpeechInfo {
  supported: boolean;
  /** getVoices đã trả về danh sách giọng. */
  ready: boolean;
  hasJapanese: boolean;
  voiceName: string | null;
}

export interface SpeakOptions {
  /** 1 = thường, 0.7 = chậm. */
  rate?: number;
}

export interface AudioProvider {
  start(): void;
  info(): SpeechInfo;
  subscribe(fn: (info: SpeechInfo) => void): () => void;
  speak(text: string, opts?: SpeakOptions): Promise<void>;
  stop(): void;
}

class WebSpeechProvider implements AudioProvider {
  private voices: SpeechSynthesisVoice[] = [];
  private listeners = new Set<(info: SpeechInfo) => void>();
  private started = false;
  private ready = false;

  get supported() {
    return typeof window !== "undefined" && "speechSynthesis" in window;
  }

  start() {
    if (this.started || !this.supported) return;
    this.started = true;
    const synth = window.speechSynthesis;

    const load = () => {
      const voices = synth.getVoices();
      if (voices.length) {
        this.voices = voices;
        this.ready = true;
        this.emit();
      }
    };
    load();
    synth.addEventListener("voiceschanged", load);
    // Một số trình duyệt không bắn voiceschanged — thăm dò vài lần rồi dừng.
    let tries = 0;
    const timer = setInterval(() => {
      load();
      if (this.ready || ++tries >= 10) clearInterval(timer);
    }, 400);
  }

  // Ưu tiên giọng ja-JP chất lượng cao nếu máy có nhiều giọng.
  private pickVoice(): SpeechSynthesisVoice | null {
    const ja = this.voices.filter((v) => v.lang.toLowerCase().startsWith("ja"));
    if (!ja.length) return null;
    const highQuality = /google|kyoko|o-ren|siri|hattori|mei|nano|eloquent/i;
    return ja.find((v) => highQuality.test(v.name)) ?? ja[0];
  }

  info(): SpeechInfo {
    const voice = this.ready ? this.pickVoice() : null;
    return {
      supported: this.supported,
      ready: this.ready,
      hasJapanese: !!voice,
      voiceName: voice?.name ?? null,
    };
  }

  subscribe(fn: (info: SpeechInfo) => void) {
    this.listeners.add(fn);
    return () => {
      this.listeners.delete(fn);
    };
  }

  private emit() {
    const info = this.info();
    this.listeners.forEach((fn) => fn(info));
  }

  // Luôn gọi trong tương tác người dùng (nút bấm) — iOS Safari yêu cầu điều này.
  speak(text: string, opts?: SpeakOptions): Promise<void> {
    if (!this.supported) return Promise.reject(new Error("unsupported"));
    const synth = window.speechSynthesis;
    synth.cancel();
    return new Promise((resolve, reject) => {
      const utterance = new SpeechSynthesisUtterance(text);
      const voice = this.pickVoice();
      if (voice) utterance.voice = voice;
      utterance.lang = "ja-JP";
      utterance.rate = opts?.rate ?? 1;
      utterance.onend = () => resolve();
      utterance.onerror = (e) => {
        if (e.error === "interrupted" || e.error === "canceled") resolve();
        else reject(new Error(e.error));
      };
      synth.speak(utterance);
    });
  }

  stop() {
    if (this.supported) window.speechSynthesis.cancel();
  }
}

export const speech: AudioProvider = new WebSpeechProvider();

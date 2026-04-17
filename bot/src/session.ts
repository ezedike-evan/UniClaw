export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface Session {
  chatId: number;
  firstName: string;
  history: ChatMessage[];
  lastActive: Date;
  messageCount: number;
  windowStart: Date;
}

const SESSION_TTL_MS = 2 * 60 * 60 * 1000;
const HISTORY_LIMIT = 10;

export class SessionManager {
  private sessions = new Map<number, Session>();

  constructor() {
    setInterval(() => this.sweep(), 10 * 60 * 1000).unref?.();
  }

  get(chatId: number, firstName = "friend"): Session {
    let s = this.sessions.get(chatId);
    if (!s) {
      s = {
        chatId,
        firstName,
        history: [],
        lastActive: new Date(),
        messageCount: 0,
        windowStart: new Date(),
      };
      this.sessions.set(chatId, s);
    } else {
      s.firstName = firstName || s.firstName;
      s.lastActive = new Date();
    }
    return s;
  }

  append(chatId: number, message: ChatMessage): void {
    const s = this.sessions.get(chatId);
    if (!s) return;
    s.history.push(message);
    if (s.history.length > HISTORY_LIMIT) {
      s.history = s.history.slice(-HISTORY_LIMIT);
    }
    s.lastActive = new Date();
  }

  clear(chatId: number): void {
    this.sessions.delete(chatId);
  }

  private sweep(): void {
    const now = Date.now();
    for (const [id, s] of this.sessions) {
      if (now - s.lastActive.getTime() > SESSION_TTL_MS) {
        this.sessions.delete(id);
      }
    }
  }
}

export const sessions = new SessionManager();

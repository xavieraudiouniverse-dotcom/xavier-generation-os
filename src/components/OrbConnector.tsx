type Handler = (payload?: any) => void;

class OrbConnector {
  private handlers: { [event: string]: Handler[] } = {};

  on(event: string, handler: Handler) {
    if (!this.handlers[event]) this.handlers[event] = [];
    this.handlers[event].push(handler);
    return () => this.off(event, handler);
  }

  off(event: string, handler?: Handler) {
    if (!this.handlers[event]) return;
    if (!handler) {
      delete this.handlers[event];
      return;
    }
    this.handlers[event] = this.handlers[event].filter((h) => h !== handler);
  }

  emit(event: string, payload?: any) {
    const list = this.handlers[event] || [];
    for (const h of list) {
      try {
        h(payload);
      } catch (e) {
        // swallow handler errors
        // eslint-disable-next-line no-console
        console.error("orb-connector handler error", e);
      }
    }
  }

  // Simulate an async Director analysis and emit a suggestion event
  async requestDirectorCut(context: any) {
    // non-blocking: emit a started event
    this.emit("director:started", { context });

    // simulate analysis latency (mock)
    await new Promise((r) => setTimeout(r, 1000 + Math.random() * 800));

    const suggestion = {
      version: "1.0",
      analysis: {
        scenes: Math.max(1, Math.floor((context?.approxDuration || 60) / 15)),
        dialogueDetected: !!context?.dialogueDetected,
        subject: context?.prompt?.match(/\b(\w+)\b/)?.[1] || "main subject",
      },
      proposal: {
        pacing: "+18%",
        color: "Cinematic contrast (lift -6, gamma +4, gain +8)",
        sound: "Prioritize dialogue; reduce music -6dB during speech",
        transitions: "Reduce long fades; increase rhythmic cuts on action beats",
      },
      meta: {
        generatedAt: new Date().toISOString(),
        sourceContext: context,
      },
    };

    // emit completed suggestion
    this.emit("director:suggestion", suggestion);

    return suggestion;
  }
}

const orbConnector = new OrbConnector();
export default orbConnector;

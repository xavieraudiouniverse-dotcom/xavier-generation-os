class ChangePatchEngine {
  private applied: any[] = [];
  private subs: (() => void)[] = [];

  apply(patch: any) {
    this.applied.push(patch);
    this.emit();
    return patch;
  }

  getApplied() {
    return this.applied.slice();
  }

  undo() {
    const last = this.applied.pop();
    this.emit();
    return last;
  }

  subscribe(cb: () => void) {
    this.subs.push(cb);
    return () => this.unsubscribe(cb);
  }

  unsubscribe(cb: () => void) {
    this.subs = this.subs.filter((s) => s !== cb);
  }

  emit() {
    for (const s of this.subs) s();
  }
}

export default ChangePatchEngine;

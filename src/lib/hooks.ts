import EventEmitter from "events";

export type HookName =
  | "auth:login"
  | "auth:logout"
  | "auth:register"
  | "admin:action"
  | "bazaar:list"
  | "bazaar:buy"
  | "market:list"
  | "market:buy"
  | "house:bid"
  | "player:create"
  | "sprite:serve"
  | "before:response"
  | "after:response";

class HookSystem extends EventEmitter {
  private static instance: HookSystem;
  private constructor() { super(); this.setMaxListeners(50); }

  static getInstance(): HookSystem {
    if (!HookSystem.instance) HookSystem.instance = new HookSystem();
    return HookSystem.instance;
  }

  fire(name: HookName, data: Record<string, unknown> = {}): void {
    this.emit(name, data);
  }

  register(name: HookName, handler: (data: Record<string, unknown>) => void, priority = 10): void {
    this.on(name, handler);
  }
}

export const hooks = HookSystem.getInstance();

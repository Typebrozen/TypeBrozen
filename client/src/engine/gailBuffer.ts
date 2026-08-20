// ======================================================
// GAIL Raw-Buffer Tracker
// ======================================================
// Remington GAIL mode mein, physical keys Kruti Dev jaisi hi
// raw ASCII deti hain (via physicalKey.ts) — lekin screen par
// Unicode Hindi dikhana hai, font-trick se nahi. Kru2uni multi-
// character patterns dekhta hai (jaise "ks" milke ek matra
// banata hai), isliye hume PURE current-word raw ASCII buffer
// rakhna padta hai aur har keystroke par poora dobara convert
// karna padta hai — single character append kaafi nahi hai.
// ======================================================

import { kru2uni } from "./kru2uni";

export class GailBuffer {
  private raw = "";

  /** Ek naya raw ASCII character jodo aur poora converted Unicode return karo. */
  append(rawChar: string): string {
    this.raw += rawChar;
    return kru2uni(this.raw);
  }

  /** Backspace — ek raw character hatao aur poora converted Unicode return karo. */
  backspace(): string {
    this.raw = this.raw.slice(0, -1);
    return kru2uni(this.raw);
  }

  /** Naye word par jaate waqt buffer khali karo. */
  reset() {
    this.raw = "";
  }
}
// ======================================================
// Word Color — poore word ko EK color dete hain (red/black),
// kabhi todte nahi. InScript jaise complex-script layouts mein
// word todna (letter-highlight ke liye) matra-repositioning
// todता hai, isliye har layout ke liye ek hi simple rule:
// sahi word = black, galat word = poora red.
// ======================================================

export function isWordCorrect(wordResult: null | "correct" | "incorrect"): boolean {
  return wordResult !== "incorrect";
}
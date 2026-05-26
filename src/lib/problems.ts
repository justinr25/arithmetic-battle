import type { Operation, Problem } from "./gameTypes";

// A simple, fast 32-bit seeded random number generator (Mulberry32)
// Given a seed, it returns a function that produces pseudorandom floats between 0 and 1.
function mulberry32(a: number) {
  return function() {
    let t = a += 0x6D2B79F5;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }
}

// seed - the room's shared random seed (from Firestore)
// idnex - which problem number (0, 1, 2, 3...) to generate
export function generateProblem(seed: number, index: number): Problem {
  // Seeding the generator with 'seed + index' guarantees:
  // 1. Every problem index has a unique set of random numbers.
  // 2. Both players get the exact same problems in the exact same order.
  const rng = mulberry32(seed + index);

  // 1. Choose the operation (each has a 25% chance)
  const rOp = rng();
  let op: Operation;
  if (rOp < 0.25) op = "+";
  else if (rOp < 0.5) op = "-";
  else if (rOp < 0.75) op = "*";
  else op = "/";

  let a: number = 0;
  let b: number = 0;
  let answer: number = 0;

  switch (op) {
    case "+":
      // Addition: both operands 2 to 100
      a = Math.floor(rng() * 99) + 2;
      b = Math.floor(rng() * 99) + 2;
      answer = a + b;
      break;

    case "-":
      // Subtraction: both 2 to 100, ensure positive result (swap if needed)
      a = Math.floor(rng() * 99) + 2;
      b = Math.floor(rng() * 99) + 2;
      if (a < b) {
        const temp = a;
        a = b;
        b = temp;
      }
      answer = a - b;
      break;

    case "*":
      // Multiplication: first operand 2–12, second 2–100
      a = Math.floor(rng() * 11) + 2; // 2 to 12
      b = Math.floor(rng() * 99) + 2; // 2 to 100
      answer = a * b;
      break;

    case "/":
      // Division: generate the divisor (b: 2-12) and the target answer (2-100) first
      // then calculate the dividend (a = answer * b) so it divides perfectly.
      b = Math.floor(rng() * 11) + 2;      // Divisor: 2 to 12
      answer = Math.floor(rng() * 99) + 2; // Target Answer: 2 to 100
      a = answer * b;                      // Dividend
      break;
  }

  return { a, b, op, answer };
}
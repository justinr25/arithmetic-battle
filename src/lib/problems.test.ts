import { describe, it, expect } from 'vitest';
import { generateProblem } from './problems';

describe('generateProblem', () => {
    // 1. Determinism
    it('generates the exact same problem for the same seed and index', () => {
        const seed = 12345;
        const index = 0;
        
        const problem1 = generateProblem(seed, index);
        const problem2 = generateProblem(seed, index);
        
        expect(problem1).toEqual(problem2);
    });

    it('generates different problems for different indices on the same seed', () => {
        const seed = 12345;
        const problem1 = generateProblem(seed, 0);
        const problem2 = generateProblem(seed, 1);
        
        expect(problem1).not.toEqual(problem2);
    });

    // 2. Arithmetic Correctness & Bounds
    it('always produces correct mathematical answers', () => {
        // Run it 1000 times to catch any edge cases across all operation types
        for (let i = 0; i < 1000; i++) {
            const { a, b, op, answer } = generateProblem(999, i);

            if (op === '+') expect(a + b).toBe(answer);
            if (op === '-') expect(a - b).toBe(answer);
            if (op === '*') expect(a * b).toBe(answer);
            if (op === '/') expect(a / b).toBe(answer);
        }
    });

    it('never produces negative answers for subtraction', () => {
        // Run it 1000 times specifically hunting for subtraction
        for (let i = 0; i < 1000; i++) {
            const { a, b, op, answer } = generateProblem(123, i);
            if (op === '-') {
                expect(a).toBeGreaterThanOrEqual(b);
                expect(answer).toBeGreaterThanOrEqual(0);
            }
        }
    });

    it('always produces clean integers for division', () => {
        // Run it 1000 times specifically hunting for division
        for (let i = 0; i < 1000; i++) {
            const { a, b, op, answer } = generateProblem(456, i);
            if (op === '/') {
                expect(a % b).toBe(0); // Remainder must be 0
                expect(Number.isInteger(answer)).toBe(true);
            }
        }
    });

    it('keeps operands within safe bounds', () => {
        for (let i = 0; i < 1000; i++) {
            const { a, b, op } = generateProblem(789, i);
            
            if (op === '+') {
                expect(a).toBeGreaterThanOrEqual(2);
                expect(a).toBeLessThanOrEqual(100);
                expect(b).toBeGreaterThanOrEqual(2);
                expect(b).toBeLessThanOrEqual(100);
            } else if (op === '*') {
                expect(a).toBeGreaterThanOrEqual(2);
                expect(a).toBeLessThanOrEqual(12);
                expect(b).toBeGreaterThanOrEqual(2);
                expect(b).toBeLessThanOrEqual(100);
            }
        }
    });
});

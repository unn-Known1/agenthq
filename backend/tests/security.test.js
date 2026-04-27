import crypto from 'crypto';
import { encryptApiKey, decryptApiKey } from '../server.js';

// Mock the encryption key
const mockEncryptionKey = crypto.randomBytes(32).toString('hex');
process.env.ENCRYPTION_KEY = mockEncryptionKey;

// Re-import with mocked env
const { encryptApiKey: enc, decryptApiKey: dec } = await import('../server.js');

const tests = [
  {
    name: 'Encrypt and decrypt API key',
    input: 'sk-test-key-12345',
    test: (input) => {
      const encrypted = encryptApiKey(input);
      const decrypted = decryptApiKey(encrypted);
      return encrypted !== input && decrypted === input;
    }
  },
  {
    name: 'Handle null API key',
    input: null,
    test: (input) => {
      const encrypted = encryptApiKey(input);
      return encrypted === null;
    }
  },
  {
    name: 'Handle empty string',
    input: '',
    test: (input) => {
      const encrypted = encryptApiKey(input);
      return encrypted === '';
    }
  },
  {
    name: 'Encrypt starts with marker',
    input: 'my-secret-key',
    test: (input) => {
      const encrypted = encryptApiKey(input);
      return encrypted.startsWith('enc:');
    }
  },
  {
    name: 'Different encryption produces different output',
    input: 'same-key',
    test: (input) => {
      const enc1 = encryptApiKey(input);
      const enc2 = encryptApiKey(input);
      // IV should be random, so outputs should differ
      return enc1 !== enc2;
    }
  }
];

console.log('Running encryption tests...');
let passed = 0;
let failed = 0;

for (const t of tests) {
  try {
    const result = t.test(t.input);
    if (result) {
      console.log(`✓ ${t.name}`);
      passed++;
    } else {
      console.log(`✗ ${t.name}`);
      failed++;
    }
  } catch (e) {
    console.log(`✗ ${t.name}: ${e.message}`);
    failed++;
  }
}

console.log(`\nResults: ${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
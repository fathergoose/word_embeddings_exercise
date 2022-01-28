import fs from 'fs';
import path from 'path';
import readline from 'readline';
import events from 'events';
//import compare from 'compute-cosine-similarity';
import { cosineSimilarity } from './vector.js';
import { fileURLToPath } from 'url';

// First, we need to model the data
// Ideally I would do something like this:
// const lineIndex = [0, +bytes, +bytes, +bytes, ...]
// const strings = { 'text-of-scored-string': lineNumber }
// Then, I can quickly find any of the strings that are scored
// while avoiding loading the entire score set into memory

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const GLOVE = path.join(__dirname, '..', 'data', 'glove', 'glove.6B.50d.txt');

async function getSubjectVector(subject: string) {
  let subjectVector: number[] = [];
  try {
    const rl = readline.createInterface({
      input: fs.createReadStream(GLOVE),
      crlfDelay: Infinity,
    });

    rl.on('line', line => {
      if (line.split(' ')[0] === subject) {
        subjectVector = line
          .split(' ')
          .slice(1)
          .map(x => +x);
        rl.close();
      }
    });

    await events.once(rl, 'close');
    return subjectVector;
  } catch (err) {
    console.error(err);
  }
}

async function getMostRelatedEntries(
  subject: string,
  subjectVector: number[],
  nRelatedEntries: number = 10,
) {
  let similarityScores: Record<string, number>[] = [];
  try {
    const rl = readline.createInterface({
      input: fs.createReadStream(GLOVE),
      crlfDelay: Infinity,
    });

    rl.on('line', line => {
      const text = line.split(' ')[0];
      const score = line
        .split(' ')
        .slice(1)
        .map(x => +x);

      if (text !== subject) {
        similarityScores.push({
          [text]: cosineSimilarity(score, subjectVector),
        });
      }

      if (similarityScores.length > nRelatedEntries) {
        const sortedScores = [...similarityScores].sort(
          (a, b) => Object.values(b)[0] - Object.values(a)[0],
        );
        similarityScores = sortedScores.slice(0, nRelatedEntries);
      }
    });

    await events.once(rl, 'close');
    return similarityScores;
  } catch (err) {
    console.error(err);
  }
}

const subject = process.argv[2];
const subjectVector = await getSubjectVector(subject);
if (subjectVector) {
  const mostRelatedEntries = await getMostRelatedEntries(
    subject,
    subjectVector,
  );
  console.log(`Words most similar to ${subject}:`);
  console.log(mostRelatedEntries);
} else {
  console.error('Could not find subject vector');
}

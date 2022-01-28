import fs from 'fs';
import path from 'path';
import readline from 'readline';
import events from 'events';
import { cosineSimilarity } from './vector.js';
import { fileURLToPath } from 'url';
import termColors from './termColors.js';

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

    rl.on('line', (line) => {
      if (line.split(' ')[0] === subject) {
        subjectVector = line
          .split(' ')
          .slice(1)
          .map((x) => +x);
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
  nRelatedEntries: number = 10
) {
  let similarityScores: Record<string, number>[] = [];
  try {
    const rl = readline.createInterface({
      input: fs.createReadStream(GLOVE),
      crlfDelay: Infinity,
    });

    rl.on('line', (line) => {
      const text = line.split(' ')[0];
      const score = line
        .split(' ')
        .slice(1)
        .map((x) => +x);

      if (text !== subject) {
        similarityScores.push({
          [text]: cosineSimilarity(score, subjectVector),
        });
      }

      if (similarityScores.length > nRelatedEntries) {
        const sortedScores = [...similarityScores].sort(
          (a, b) => Object.values(b)[0] - Object.values(a)[0]
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

function rightPadKeys(results: Record<string, number>[], padding: number = 4) {
  let longestKey = 0;
  results.forEach((result) => {
    if (longestKey < Object.keys(result)[0].length) {
      longestKey = Object.keys(result)[0].length;
    }
  });
  const extraSpaces = longestKey + padding;
  return results.map((result) => {
    const key = Object.keys(result)[0];
    return { [key.padEnd(extraSpaces)]: result[key] };
  });
}

const tableWidth = 44;
const subject = process.argv[2];
const subjectVector = await getSubjectVector(subject);
if (subjectVector) {
  const mostRelatedEntries = await getMostRelatedEntries(
    subject,
    subjectVector
  );
  const formattedEntries = rightPadKeys(mostRelatedEntries ?? []);
  const formattedSubject = `"${subject}":`;
  console.log(
    `${termColors.bright}Words most similar to ${termColors.fg.red}${formattedSubject}${termColors.reset}`
  );
  console.log('—'.repeat(tableWidth));
  console.log(
    `| ${termColors.bright}Word${termColors.reset}              |  ${termColors.bright}Cosine Similarity${termColors.reset}   |`
  );
  console.log('—'.repeat(tableWidth));
  formattedEntries.forEach((entry) => {
    console.log(
      '| ',
      Object.keys(entry)[0],
      '| ',
      Object.values(entry)[0],
      ' |'
    );
  });
  console.log('—'.repeat(tableWidth));
  console.log('\n');
} else {
  console.error('Could not find subject vector');
}

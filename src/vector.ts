export type Vector = number[];

export function dotProduct(A: Vector, B: Vector) {
  return A.map((_a, i) => A[i] * B[i]).reduce((acc, cur) => acc + cur, 0);
}

export function magnitude(A: Vector, B: Vector) {
  const sumSquares = (acc: number, cur: number) => acc + cur ** 2;
  return A.reduce(sumSquares, 0) ** 0.5 * B.reduce(sumSquares, 0) ** 0.5;
}

export function cosineSimilarity(A: Vector, B: Vector) {
  return dotProduct(A, B) / magnitude(A, B)
}

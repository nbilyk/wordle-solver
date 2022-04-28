import {words} from './words.js';
import {getHints, isCorrectAnswer, shuffle} from './util.js';
import {provideNextWord} from './algorithms/algorithm.js'
import {ROWS} from './model.js'

const MAX_GUESSES = 20

/**
 * @typedef BenchmarkResult
 * @property {number} progress A number between 0 and 1 to indicate how close the benchmark is to
 *  completion.
 * @property {number[]} distribution A list of how many answers per number of guesses. Any attempts
 *   that took more than {@link MAX_GUESSES} guesses will be counted within index 0
 * @property {number} totalWords The total number of answers checked.
 * @property {number} averagePerformance The average number of milliseconds to perform a guess.
 * @property {number} worstCase The worst-case number of guesses. 0 indicates a solution cannot be
 *   found within MAX_GUESSES.
 * @property {number} averageCase The average number of guesses.
 *   given the same inputs every time.
 * @property {{answer: string, guesses: string[]}[]} failedAnswers A list of answers and their
 *   guesses that could not be solved within 6 tries.
 */

/**
 * Benchmarks the given algorithm.
 *
 * @param {AlgorithmId} algorithmId
 * @param {AlgorithmOptions} options
 * @param {function(BenchmarkResult):void} onProgress
 * @return {Promise<BenchmarkResult>}
 */
export async function benchmark(algorithmId, options, onProgress) {
    const shuffledWords = shuffle(words.slice())
    /** @type {BenchmarkResult} */
    const result = {
        progress: 0,
        distribution: new Array(MAX_GUESSES),
        totalWords: 0,
        averagePerformance: 0,
        worstCase: 0,
        averageCase: 0,
        failedAnswers: []
    }
    result.distribution.fill(0)
    onProgress(result)

    const startTime = Date.now()
    let totalGuesses = 0
    let lastTime = startTime
    for (let i = 0; i < shuffledWords.length; i++) {
        result.totalWords = i + 1
        result.progress = i / shuffledWords.length
        const answer = shuffledWords[i]
        const hintGrid = []
        const guesses = []
        while (guesses.length < MAX_GUESSES) {
            const nextGuess = await provideNextWord(algorithmId, hintGrid, options)
            if (!nextGuess)
                break // Could not find solution
            guesses.push(nextGuess)
            const hints = getHints(nextGuess, answer)
            hintGrid.push(hints)
            if (isCorrectAnswer(hints))
                break
        }
        totalGuesses += guesses.length
        const currTime = Date.now()
        result.averagePerformance = (currTime - startTime) / totalGuesses
        result.averageCase = totalGuesses / (i + 1)
        const numGuesses = guesses.length
        result.distribution[numGuesses]++
        if (numGuesses > ROWS || numGuesses === 0)
            result.failedAnswers.push({ answer, guesses })
        if (numGuesses > result.worstCase)
            result.worstCase = numGuesses
        if (currTime - lastTime > 500) {
            lastTime = currTime
            onProgress(result)
        }
    }
    result.progress = 1
    onProgress(result)
    return result
}

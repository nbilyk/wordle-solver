import {Algorithms} from './algorithms.js';
import {words} from './words.js';
import {getHints, isCorrectAnswer, shuffle} from './util.js';

const MAX_GUESSES = 20
const NUM_TRIALS = 3

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
 */

addEventListener('message', (e) => {
    benchmark(Algorithms[e.data.algorithmId], e.data.options, (result) => {
        postMessage(result)
    })
})

/**
 * Benchmarks the given algorithm.
 *
 * @param {WordleAlgorithm} algorithm
 * @param {AlgorithmOptions} options
 * @param {function(BenchmarkResult):void} onProgress
 */
function benchmark(algorithm, options, onProgress) {
    const shuffledWords = shuffle(words.slice())
    /** @type {BenchmarkResult} */
    const result = {
        progress: 0,
        distribution: [],
        totalWords: 0,
        averagePerformance: 0,
        worstCase: 0,
        averageCase: 0
    }
    for (let i = 0; i <= MAX_GUESSES; i++) {
        result.distribution[i] = 0
    }

    const startTime = Date.now()
    let totalGuesses = 0
    let lastTime = startTime
    for (let i = 0; i < shuffledWords.length; i++) {
        result.totalWords = i + 1
        result.progress = i / shuffledWords.length
        const word = shuffledWords[i]
        const hintGrid = []
        let numGuesses = 0
        while (++numGuesses < MAX_GUESSES) {
            const nextGuess = algorithm(hintGrid, options)
            totalGuesses++
            if (!nextGuess) {
                // Could not find solution
                numGuesses = 0
                break
            }
            const hints = getHints(nextGuess, word)
            hintGrid.push(hints)
            if (isCorrectAnswer(hints))
                break
        }
        if (numGuesses >= MAX_GUESSES)
            numGuesses = 0
        const currTime = Date.now()
        result.averagePerformance = (currTime - startTime) / totalGuesses
        result.averageCase = totalGuesses / (i + 1)
        result.distribution[numGuesses]++
        if (numGuesses > result.worstCase || numGuesses === 0)
            result.worstCase = numGuesses
        if (currTime - lastTime > 500) {
            lastTime = currTime
            postMessage(result)
        }
    }
    result.progress = 1
    postMessage(result)
}

'use strict'

import {countWordsForHints, filterWordsForHintGrid, getHints} from '../util.js';
import {nonAnswerWords, words} from '../words.js';

/**
 * Returns the next best word.
 *
 * @param {Hint[][]} hintSets
 * @param {AlgorithmOptions} options
 * @return {string | null}
 */
export function tryBestPermutations(hintSets = [], options= {}) {
    const remainingAnswers = filterWordsForHintGrid(words, hintSets)
    const remainingNonAnswers = nonAnswerWords

    const possibleGuesses = remainingAnswers.concat(remainingNonAnswers)
    const calculation = best(remainingAnswers, possibleGuesses)
    if (!calculation) return null
    return calculation.word
}

/**
 * @typedef AnswerCalculation
 * @property {string} word
 * @property {number} worstCase
 * @property {number} averageCase
 */

/**
 * Calculates the next best guess by choosing the word that will require
 * the fewest number of consecutive guesses by picking words that have the smallest
 * worst-case-scenario.
 *
 * @param {string[]} remainingAnswers
 * @param {string[]} possibleGuesses
 * @return {AnswerCalculation | null}
 */
function best(remainingAnswers, possibleGuesses) {
    if (remainingAnswers.length === 0)
        return null
    if (remainingAnswers.length <= 2)
        return { word: remainingAnswers[0], worstCase: 0, averageCase: 0 }
    let bestGuess = /** @type AnswerCalculation | null */ null
    for (let i = 0; i < possibleGuesses.length; i++) {
        // Assume this possible guess was picked, what is the worst-case scenario
        const nextGuess = possibleGuesses[i]
        let totalUnfiltered = 0
        for (const remainingAnswer of remainingAnswers) {
            // Calculate the hints if this was the hypothetical answer
            const hints = getHints(nextGuess, remainingAnswer)
            const subRemaining = countWordsForHints(remainingAnswers, hints)
            totalUnfiltered += subRemaining
        }

        const averageUnfiltered = totalUnfiltered / remainingAnswers.length

        if (bestGuess == null
            || averageUnfiltered < bestGuess.averageCase
        ) {
            console.log('next: ', nextGuess, averageUnfiltered)
            bestGuess = {
                word: nextGuess,
                averageCase: averageUnfiltered
            }
        }
    }
    console.log('returning', bestGuess)
    return bestGuess
}

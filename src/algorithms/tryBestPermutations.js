'use strict'

import {filterWordsForHintGrid, filterWordsForHints, getHints} from '../util.js';
import {nonAnswerWords, words} from '../words.js';

/**
 * Returns the next best word.
 *
 * @param {Hint[][]} hintSets
 * @param {AlgorithmOptions} options
 * @return {string | null}
 */
export function tryBestPermutations(hintSets = [], options= {}) {
    const remainingAnswers = filterWordsForHintGrid(words, hintSets).slice(0, 100)
    const remainingNonAnswers = nonAnswerWords.slice(0, 100)

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
    if (remainingAnswers.length === 1)
        return { word: remainingAnswers[0], worstCase: 0, averageCase: 0 }
    let bestGuess = /** @type AnswerCalculation | null */ null
    for (let i = 0; i < possibleGuesses.length; i++) {
        // Assume this possible guess was picked, what is the worst-case scenario
        const nextGuess = possibleGuesses[i]
        let worstPossibility = /** @type AnswerCalculation | null */ null
        let averageCase = 0
        for (const remainingAnswer of remainingAnswers) {
            // Calculate the hints if this was the hypothetical answer
            const hints = getHints(nextGuess, remainingAnswer)
            const subRemaining = filterWordsForHints(remainingAnswers, hints)
            const calculation =
                { word: nextGuess, worstCase: subRemaining.length, averageCase: 0 }
            // const calculation = best(subRemaining, possibleGuesses, guesses.concat(nextGuess))
            averageCase += 1 + calculation.worstCase
            if (worstPossibility == null || calculation.worstCase > worstPossibility.worstCase)
                worstPossibility = calculation
        }
        if (!worstPossibility)
            continue
        averageCase /= remainingAnswers.length
        if (bestGuess == null
            || worstPossibility.worstCase < bestGuess.worstCase
            || (worstPossibility.worstCase <= bestGuess.worstCase
                && averageCase < bestGuess.averageCase)
        ) {
            bestGuess = {
                word: nextGuess,
                worstCase: 1 + worstPossibility.worstCase,
                averageCase
            }
        }
    }
    return bestGuess
}

/**
 * @typedef GuessCalculation
 * @property {string} word The best word to guess next. An empty string will be returned if there
 * are no #words remaining with the given hints.
 * @property {number} branchSize The size of largest possible branch guessing this word will yield.
 */

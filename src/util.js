'use strict'

/**
 * @fileOverview Functional utility methods.
 */

import {Position} from './model.js'

/**
 * Filters the #words by those that could match the given hints.
 *
 * @param {string[]} words
 * @param {Hint[][]} hintGrid
 * @return {string[]}
 */
export function filterWordsForHintGrid(words, hintGrid) {
    const hintGridWithCounts = hintGrid.map(hints => addCountsToHints(hints))
    return words.filter((word) => matchesEveryHint(word, hintGridWithCounts))
}

/**
 * Returns true if the given list of hints would not rule out the given word.
 *
 * @param {string} word
 * @param {HintWithCount[][]} hintGridWithCounts
 * @return {boolean}
 */
function matchesEveryHint(word, hintGridWithCounts) {
    return hintGridWithCounts.every(
        (wordHints) =>
            wordHints.every(
                ([hint, count]) => matchesHint(word, hint, count)
            ),
    )
}

/**
 * Filters the #words by those that could match the given hint.
 *
 * @param {string[]} words
 * @param {Hint} hint
 * @param {number} n If positionHint is CORRECT_SPOT or WRONG_SPOT, the word must have at least
 *   this many occurrences of char. If positionHint is NO_SPOT, the word must have at most
 *   this many occurrences.
 * @return {string[]}
 */
export function filterWordsForHint(words, hint, n) {
    return words.filter((word) => matchesHint(word, hint, n))
}

/**
 * Returns true if the given hint would not rule out the given word.
 *
 * @param {string} word
 * @param {Hint} hint
 * @param {number} n If positionHint is {@link Position.CORRECT_SPOT} or
 *   {@link Position.WRONG_SPOT}, the word must have at least this many occurrences of char. If
 *   positionHint is {@link Position.NO_SPOT}, the word must have at most this many occurrences.
 * @return {boolean}
 */
export function matchesHint(word, hint, n) {
    const count = countChars(word, hint.char)
    switch (hint.positionHint) {
        case Position.NO_SPOT :
            return count <= n
        case Position.WRONG_SPOT :
            return count >= n && word.charAt(hint.index) !== hint.char
        case Position.CORRECT_SPOT :
            return count >= n && word.charAt(hint.index) === hint.char
        case Position.UNKNOWN :
            return true
        default :
            throw new Error(`Unexpected positionHint: ${hint.positionHint}`)
    }
}

/**
 * A utility function to count the number of occurrences a given character has within a string.
 *
 * @param {string} str
 * @param {string} char
 * @return {number}
 */
export function countChars(str, char) {
    let c = 0, index = -1
    while ((index = str.indexOf(char, index + 1)) !== -1)
        c++
    return c
}

/**
 * When hints are provided after a guess (correct spot, wrong spot, and no spot), these hints
 * depend on the number of characters.
 * For example if the word guessed was 'MELEE', not all 'E' values will necessarily have the
 * same hint. The third E may be correct spot, the first E may be wrong spot, and the third E no
 * spot. This would indicate that there are exactly two E's in the solution, one of those is
 * in the last position, and the other is not in the second position.
 *
 * @typedef {[Hint, number]} HintWithCount
 */

/**
 * Maps a set of hints (the hints provided for a single word) to a set of hint and count pairs.
 *
 * @param {Hint[]} wordHints
 * @return {HintWithCount[]}
 */
function addCountsToHints(wordHints) {
    return wordHints.map((hint) => [hint, calculateN(wordHints, hint.char)])
}

/**
 * Calculates the minimum number of expected occurrences for the given hint set and character.
 *
 * @param {Hint[]} wordHints
 * @param {string} char
 * @return {number}
 */
function calculateN(wordHints, char) {
    let c = 0
    for (const hint of wordHints) {
        if (hint.char === char) {
            if (hint.positionHint === Position.WRONG_SPOT
                || hint.positionHint === Position.CORRECT_SPOT)
                c++
        }
    }
    return c
}

/**
 * Returns an array of {@link Hint} objects for the given guess and actual word.
 *
 * @param {string} guess
 * @param {string} actual
 * @return {Hint[]}
 */
export function getHints(guess, actual) {
    const hints = /** @type Hint[] */ []
    // First find all exact matches. This is because exact matches take precedence with counts.
    for (let i = 0; i < guess.length; i++) {
        if (actual.charAt(i) === guess.charAt(i))
            hints.push({
                index: i,
                char: actual.charAt(i),
                positionHint: Position.CORRECT_SPOT
            })
    }
    for (let i = 0; i < guess.length; i++) {
        const guessChar = guess.charAt(i)
        const actualChar = actual.charAt(i)
        if (guessChar !== actualChar) {
            const guessN = calculateN(hints, guessChar) + 1
            const actualN = countChars(actual, guessChar)
            const positionHint = (guessN <= actualN) ? Position.WRONG_SPOT : Position.NO_SPOT
            hints.push({
                index: i,
                char: guessChar,
                positionHint
            })
        }
    }
    return hints
}

/**
 * Returns true if the given list of hints indicates this is the correct answer.
 * @param {Hint[]} hints
 * @return {boolean}
 */
export function isCorrectAnswer(hints) {
    return hints.every(hint => hint.positionHint === Position.CORRECT_SPOT)
}

/**
 * An alias for document.getElementById
 *
 * @param {string} id
 * @return {HTMLElement}
 */
export function el(id) {
    return document.getElementById(id)
}

/**
 * @param {Function} inner
 * @param {number} timeout
 * @return {Function} Returns a function that will invoke inner, but only after the returned
 *   function has not been called within `timeout` ms.
 */
export function debounce(inner, timeout){
    let timeoutId
    return function (...args) {
        clearTimeout(timeoutId)
        timeoutId = setTimeout(() => { inner.apply(this, args) }, timeout)
    }
}

/**
 * Shuffles an array in place.
 * Fisher-Yates (aka Knuth) Shuffle.
 * Source: https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
 *
 * @template T
 * @param {T[]} array
 * @return {T[]} Returns the shuffled array.
 */
export function shuffle(array) {
    let currentIndex = array.length
    let randomIndex

    // While there remain elements to shuffle.
    while (currentIndex !== 0) {
        // Pick a remaining element.
        randomIndex = Math.floor(Math.random() * currentIndex)
        currentIndex--
        // And swap it with the current element.
        [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]]
    }
    return array
}

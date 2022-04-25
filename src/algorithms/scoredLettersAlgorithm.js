import {nonAnswerWords, words} from '../words.js'
import {COLS, ROWS} from '../model.js'
import {countChars, filterWordsForHintGrid} from '../util.js'

const allWords = words.concat(nonAnswerWords)

/**
 * Returns the next best word.
 *
 * @param {Hint[][]} hintSets
 * @param {AlgorithmOptions} options
 * @return {string | null}
 */
export function provideNextWord(hintSets = [], options= {}) {
    const remainingAnswers = filterWordsForHintGrid(words, hintSets)
    if (remainingAnswers.length === 0)
        return null
    if (remainingAnswers.length === 1)
        return remainingAnswers[0]
    const remainingGuesses = ROWS - hintSets.length
    const possibleGuesses = allWords
    const frequencies = calculateLetterFrequency(remainingAnswers)
    let bestScore = 0
    let bestScoreIndex = 0
    for (let guessIndex = 0; guessIndex < possibleGuesses.length; guessIndex++) {
        const possibleGuess = possibleGuesses[guessIndex]
        const isPossibleAnswer = remainingAnswers.indexOf(possibleGuess) === -1
        if (!isPossibleAnswer && remainingGuesses <= 1)
            continue // Last try, make it count

        let wordScore = 1.0
        for (let i = 0; i < possibleGuess.length; i++) {
            const char = possibleGuess.charAt(i)
            const letterFrequency = frequencies[i][char] || 0
            const exactPositionScore = percentToScore(letterFrequency)
            wordScore += exactPositionScore
            // If the letterFrequency is 1, this character will always be hint EXACT, which
            // will not give us new information about other positions
            if (letterFrequency < 0.9999) {
                //
                const count = countChars(possibleGuess.substring(0, i), char)
                if (!count) {
                    //
                    for (let j = 0; j < possibleGuess.length; j++) {
                        wordScore += percentToScore(frequencies[j][char] || 0)
                    }
                }
            }
        }
        if (!isPossibleAnswer) {
            //

            // const p = 1 - 1 / remainingAnswers.length
            // wordScore -= p
        }

        if (wordScore > bestScore) {
            bestScore = wordScore
            bestScoreIndex = guessIndex
        }
    }
    return possibleGuesses[bestScoreIndex]
}

/**
 * Returns an array where each element is a map of characters to the frequency of that character
 * at that letter position.
 *
 * @param {string[]} words The remaining answers
 * @return {Map<string, number>[]} Returns the scores for each letter by position.
 */
function calculateLetterFrequency(words) {
    /**
     * @type {Map<string, number>[]}
     */
    const frequencies = new Array(COLS)
    for (let i = 0; i < COLS; i++) {
        frequencies[i] = new Map()
    }
    let totalLetters = words.length
    for (const word of words) {
        for (let i = 0; i < word.length; i++) {
            const iFrequency = frequencies[i]
            const char = word.charAt(i)
            if (!iFrequency[char])
                iFrequency[char] = 0
            iFrequency[char] += 1.0 / totalLetters
        }
    }
    return frequencies
}

/**
 * Given a number from 0 to 1, returns the min of number and 1 - number.
 *
 * @param {number} percent
 * @returns {number}
 */
function percentToScore(percent) {
    return Math.min(percent, 1 - percent)
}

'use strict'

import {POSITION_HINTS} from '../model.js';
import {filterWordsForHint, filterWordsForHintGrid} from '../util.js';
import {nonAnswerWords, words} from '../words.js';


const charTree = buildTree(words.concat(nonAnswerWords))

/**
 * Builds a char tree from the list of #words.
 * @param {string[]} words
 * @return {CharNode}
 */
function buildTree(words) {
    const root = createCharNode('')
    for (const word of words) {
        let p = root
        for (let i = 0; i < word.length; i++) {
            const char = word.charAt(i)
            if (!p.children.has(char)) {
                p.children.set(char, createCharNode(word.substring(0, i + 1)))
            }
            p = p.children.get(char)
        }
    }
    return root
}

/**
 * Creates a new char node.
 * @param {string} string The string leading to this branch.
 * @return {CharNode}
 */
function createCharNode(string) {
    return { string, children: new Map() }
}

/**
 * @typedef CharNode
 * @property {string} string The string leading to this branch.
 * @property {Map<string, CharNode>} children A map of characters to the nodes with that character.
 */


/**
 * Returns the next best word.
 *
 * @param {Hint[][]} hintSets
 * @param {AlgorithmOptions} options
 * @return {string}
 */
export function tryBestPermutations(hintSets = [], options= {}) {
    const remaining = filterWordsForHintGrid(words, hintSets)
    console.log(remaining, hintSets)
    return remaining[0]
    // const c = calculateBestGuess(charTree, remaining, [], options)
    // return c == null ? '' : c.word
}

/**
 * @typedef GuessCalculation
 * @property {string} word The best word to guess next. An empty string will be returned if there
 * are no #words remaining with the given hints.
 * @property {number} branchSize The size of largest possible branch guessing this word will yield.
 */

/**
 * Calculates the next best guess from the remaining #words by choosing the word that will require
 * the fewest number of consecutive guesses by picking branches that have the smallest
 * worst-case-scenario.
 *
 * @param {CharNode} node
 * @param {string[]} remaining The remaining possible #words.
 * @param {Hint[]} hints
 * @param {AlgorithmOptions} options
 * @return {GuessCalculation | null}
 */
function calculateBestGuess(node = charTree, remaining, hints, options) {
    if (!remaining.length) return null
    if (!node.children.size)
        return { word: node.string, branchSize: remaining.length }
    /** @type GuessCalculation | null */
    let min = null
    for (const [char, child] of node.children.entries()) {
        /** @type GuessCalculation | null */
        let max = null

        let n = calculateN(hints, char)
        for (const positionHint of POSITION_HINTS) {
            const hint = /** @type Hint */ {
                positionHint,
                index: child.string.length,
                char,
                n
            }
            const branchRemaining = filterWordsForHint(remaining, hint)
            const branch = calculateBestGuess(
                child,
                branchRemaining,
                hints.concat(hint),
                options
            )
            if (branch != null && (max == null || branch.branchSize > max.branchSize))
                max = branch
        }
        if (max != null && (min == null || max.branchSize < min.branchSize)) {
            min = max
        }
    }
    return /** @type GuessCalculation */ min
}

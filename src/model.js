'use strict'

/**
 * @fileOverview Common model definitions.
 */

export const COLS = 5
export const ROWS = 6

/**
 * An enumeration of the possible hint types.
 * @enum number
 */
export const Position = {
    UNKNOWN: 0,
    CORRECT_SPOT: 1,
    WRONG_SPOT: 2,
    NO_SPOT: 3
}

/**
 * A list of Position values.
 *
 * @type {Position[]}
 */
export const POSITION_HINTS = [
    Position.NO_SPOT,
    Position.WRONG_SPOT,
    Position.CORRECT_SPOT,
]

/**
 * @typedef Hint
 * @property {string} char The character.
 * @property {number} index The character index.
 * @property {Position} positionHint
 */

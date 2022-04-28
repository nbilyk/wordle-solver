'use strict'

import {COLS, Position, POSITION_HINTS, ROWS} from './model.js'
import {debounce, el, isCorrectAnswer} from './util.js';
import {AlgorithmControls} from './AlgorithmControls.js';
import {BenchmarkComponent} from './BenchmarkComponent.js';
import {provideNextWord} from './algorithms/algorithm.js'

/**
 * A map of {@link Position} hint values to their respective CSS classes.
 */
const PositionCss = {
    [Position.UNKNOWN]: 'unknown',
    [Position.CORRECT_SPOT]: 'correctSpot',
    [Position.WRONG_SPOT]: 'wrongSpot',
    [Position.NO_SPOT]: 'noSpot'
}

/**
 * The main solver app.
 */
export class App {

    /**
     * @type AlgorithmConfig
     */
    #config = Object.freeze({
        algorithmId: 'SCORED',
        options: {
            hardMode: false
        }
    })

    /**
     * @type {string[]}
     */
    #words

    /**
     * A grid of user-inputted hint positions.
     *
     * @type {Position[][]}
     */
    #hintState

    /**
     * The grid of cells.
     *
     * @type {HTMLDivElement[][]}
     */
    #rows

    /**
     * @type AlgorithmControls
     */
    #algorithmControls

    /**
     * @type {BenchmarkComponent}
     */
    #benchmarkComponent = new BenchmarkComponent()

    constructor() {
        // Initialize the hint grid
        this.#hintState = []
        for (let i = 0; i < ROWS; i++) {
            this.#hintState.push(new Array(COLS))
        }

        /**
         * @type {string[]}
         */
        this.#words = []

        this.#initGridView();

        this.#algorithmControls = new AlgorithmControls()
        this.#algorithmControls.onChange = (algorithmId) => {
            // The user has changed the selected algorithm
            this.#updateConfig({algorithmId})
        }
        this.#onConfigUpdated(this.#config)
    }

    /**
     *
     * @param {Partial<AlgorithmConfig>} partialConfig
     */
    #updateConfig(partialConfig) {
        this.#config = Object.freeze(
            Object.assign(
                {},
                this.#config,
                partialConfig
            )
        )
        this.#onConfigUpdated(this.#config)
    }

    /**
     * A handler when the configuration has changed.
     *
     * @param {AlgorithmConfig} config
     */
    #onConfigUpdated(config) {
        this.#benchmarkComponent.config = config
        this.#algorithmControls.algorithmId = config.algorithmId
        this.#reset()
    }

    #reset() {
        for (const hintStateRow of this.#hintState) {
            hintStateRow.fill(Position.UNKNOWN)
        }
        this.#words.length = 0
        this.#_refreshWords()
    }

    /**
     * @private
     */
    #initGridView() {
        const hintState = this.#hintState
        const words = this.#words
        this.#rows = []
        const grid = el('grid')
        for (let i = 0; i < ROWS; i++) {
            const row = document.createElement('div')
            const cells = /** @type {HTMLDivElement[]} */ []
            row.className = 'row'
            for (let j = 0; j < COLS; j++) {
                const cell = document.createElement('div')
                cell.className = 'cell'
                cell.id = `cell_${i}_${j}`
                row.appendChild(cell)
                cells.push(cell)
                cell.onclick = () => {
                    if (i >= words.length)
                        return
                    if (this.#getPreviousHint(i, j, words[i].charAt(j)) !== Position.UNKNOWN)
                        return // Any change to this cell would be a conflicting hint
                    const currentState = hintState[i][j]
                    const index = POSITION_HINTS.indexOf(currentState) + 1
                    hintState[i][j] = POSITION_HINTS[index % POSITION_HINTS.length]
                    this.#clearStateAfterRow(i)
                    this.#refreshWords()
                }
            }
            this.#rows.push(cells)
            grid.appendChild(row)
        }
    }

    /**
     * @param {number} rowIndex
     * @private
     */
    #clearStateAfterRow(rowIndex) {
        this.#words.length = rowIndex + 1
        for (let i = rowIndex + 1; i < ROWS; i++) {
            for (let j = 0; j < COLS; j++) {
                this.#hintState[i][j] = Position.UNKNOWN
            }
        }
        this.#refreshView()
    }


    /**
     * Updates the cell styles and characters.
     */
    #refreshView() {
        for (let i = 0; i < ROWS; i++) {
            const word = this.#words[i]
            for (let j = 0; j < COLS; j++) {
                const cell = this.#rows[i][j]
                cell.innerText = word ? word.charAt(j) : ''
                cell.className = `cell ${PositionCss[this.#hintState[i][j]]}`
            }
        }
    }

    /**
     * Using the current hint state, provides the next best word to guess with the currently
     * selected algorithm.
     * @type {(function(): void)}
     */
    #refreshWords = debounce(this.#_refreshWords, 1000)

    #wordsRefreshId = 0

    #_refreshWords() {
        const hintState = this.#hintState
        const words = this.#words
        // Aggregate hints from the grid
        const hintGrid = /** @type {Hint[][]} */ []
        for (let i = 0; i < words.length; i++) {
            const row = hintState[i]
            const wordHints = /** @type {Hint[]} */ []
            for (let j = 0; j < COLS; j++) {
                const positionHint = row[j]
                const word = words[i]
                const char = word.charAt(j)
                wordHints.push({
                    char,
                    index: j,
                    positionHint,
                    n: 0
                })
            }
            hintGrid.push(wordHints)
        }

        if (hintGrid.length && isCorrectAnswer(hintGrid[hintGrid.length - 1]))
            return // Already found the correct answer

        if (words.length) {
            // Check if user has entered any information that wasn't known before.
            let hasHint = false
            const lastRow = words.length - 1
            for (let i = 0; i < COLS; i++) {
                const char = words[lastRow].charAt(i)
                const positionHint = hintState[lastRow][i]
                if (positionHint !== this.#getPreviousHint(lastRow, i, char)) {
                    hasHint = true
                    break
                }
            }
            if (!hasHint) return
        }

        const currentRefreshId = ++this.#wordsRefreshId
        provideNextWord(
            this.#config.algorithmId,
            hintGrid,
            this.#config.options
        ).then(newWord => {
            if (currentRefreshId !== this.#wordsRefreshId)
                return
            if (!newWord)
                return
            words.push(newWord)
            // Pre-populate known hints for new word
            for (let col = 0; col < COLS; col++) {
                const char = newWord.charAt(col)
                const row = words.length - 1
                const previousHint = this.#getPreviousHint(row, col, char)
                hintState[row][col] = previousHint === Position.UNKNOWN
                    ? Position.NO_SPOT
                    : previousHint
            }
            this.#refreshView()
        })
    }

    /**
     * If a previous row has a hint for the same character and column, returns that hint.
     * This is so the user doesn't need to re-enter hints for solved characters.
     *
     * @param {number} row
     * @param {number} col
     * @param {string} char
     * @return {Position}
     */
    #getPreviousHint(row, col, char) {
        for (let i = 0; i < row; i++) {
            const word = this.#words[i]
            if (word.charAt(col) === char) {
                return this.#hintState[i][col]
            }
        }
        return Position.UNKNOWN
    }
}

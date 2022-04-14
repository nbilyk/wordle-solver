'use strict'

import {firstUnfiltered} from './firstUnfiltered.js';
import {tryBestPermutations} from './tryBestPermutations.js';

/**
 * @typedef {'FIRST' | 'BEST_PERMUTATIONS'} AlgorithmId
 */

/**
 * @enum {WordleAlgorithm}
 */
const Algorithms = {
    FIRST: firstUnfiltered,
    BEST_PERMUTATIONS: tryBestPermutations,
}

/**
 * @typedef AlgorithmWorkerMessageData
 * @property {AlgorithmId} algorithmId
 * @property {Hint[][]} hintGrid
 * @property {AlgorithmOptions} options
 */

/**
 * @typedef AlgorithmWorkerResponseData
 * @property {string | null} word
 */

/**
 * Handles messages posted to this worker.
 * @param {MessageEvent<AlgorithmWorkerMessageData>} event
 */
function messageHandler(event) {
    const data = event.data
    const nextWord = Algorithms[data.algorithmId](data.hintGrid, data.options)
    postMessage({ word: nextWord })
}

addEventListener('message', messageHandler)

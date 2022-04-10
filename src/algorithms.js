'use strict'

import {firstUnfiltered} from './algorithms/firstUnfiltered.js';
import {tryBestPermutations} from './algorithms/tryBestPermutations.js';

/**
 * @typedef {'FIRST' | 'BEST_PERMUTATIONS'} AlgorithmId
 */

/**
 * @enum {WordleAlgorithm}
 */
export const Algorithms = {
    FIRST: firstUnfiltered,
    BEST_PERMUTATIONS: tryBestPermutations,
}

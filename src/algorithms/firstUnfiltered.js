import {filterWordsForHintGrid} from '../util.js';
import {words} from '../words.js';

/**
 * Returns the first word that isn't filtered out by the hints.
 *
 * @param {Hint[][]} hintGrid
 * @param {AlgorithmOptions} options
 * @return {string}
 */
export function firstUnfiltered(hintGrid = [], options= {}) {
    return filterWordsForHintGrid(words, hintGrid)[0]
}

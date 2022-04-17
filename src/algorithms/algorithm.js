/**
 * @typedef {'FIRST' | 'BEST_PERMUTATIONS'} AlgorithmId
 */

/**
 * @typedef AlgorithmConfig
 * @property {AlgorithmId} algorithmId
 * @property {AlgorithmOptions} options
 */

/**
 * Options provided to the Wordle algorithm.
 * @typedef AlgorithmOptions
 * @property {boolean} [hardMode]
 */

/**
 * @typedef {Function} WordleAlgorithm
 * @param {Hint[][]} hintGrid A list of hints provided for each word.
 * @param {AlgorithmOptions} options
 * @return {string | null} The next word to guess.
 */

/**
 * A worker for computing the next word.
 * @type {Worker}
 */
const algorithmWorker = new Worker('./algorithms/algorithmWorker.js', {
    type: 'module'
})

let _messageId = 0

/**
 * Pending promise resolvers.
 * @type {Map<number, { resolve: function():void, reject: function(): void }>}
 */
const pending = new Map()

algorithmWorker.onmessage = messageHandler

/**
 * @param {MessageEvent<AlgorithmWorkerResponseData>} event
 */
function messageHandler(event) {
    const data = event.data
    pending[data.messageId].resolve(data.word)
    pending.delete(data.messageId)
}

/**
 * Returns a promise that will resolve to the next best word.
 *
 * @param {AlgorithmId} algorithmId
 * @param {Hint[][]} hintGrid
 * @param {AlgorithmOptions} options
 * @return {Promise<string>}
 */
export function provideNextWord(algorithmId, hintGrid, options) {
    return new Promise((resolve, reject) => {
        const messageId = ++_messageId
        pending[messageId] = { resolve, reject }

        algorithmWorker.postMessage(/** @type AlgorithmWorkerMessageData */ {
            algorithmId,
            options,
            hintGrid,
            messageId
        })
    })
}

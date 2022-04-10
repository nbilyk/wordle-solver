// Benchmark
import {el} from './util.js'

export class BenchmarkComponent {

    /**
     * @type boolean
     */
    #isBusy = false

    /**
     * @type HTMLElement
     */
    #benchmarkResults

    /**
     * @type Worker
     */
    #benchmarkWorker = new Worker('benchmarkWorker.js', { type: 'module' })

    constructor() {

        /**
         * @type {AlgorithmId | null}
         */
        this.algorithmId = null

        /**
         * @type {AlgorithmOptions | null}
         */
        this.options = null

        this.#benchmarkResults = el('benchmarkResults')
        this.#benchmarkWorker.addEventListener('message', (event) => {
            this.#isBusy = false
            const r = /** @type BenchmarkResult */ event.data

            let barsStr = ''
            let mostCommonIndex = 0
            let mostCommonCase = r.distribution[0]
            for (let i = 1; i < r.worstCase; i++) {
                if (r.distribution[i] > mostCommonCase) {
                    mostCommonIndex = i
                    mostCommonCase = r.distribution[i]
                }
            }
            for (let i = 1; i < r.worstCase; i++) {
                const height = 100 * r.distribution[i] / mostCommonCase
                barsStr += `<div class='distributionBar' style='height: ${height}%'></div>`
            }

            this.#benchmarkResults.innerHTML = `<p>
    <div class='progressBar' style='width: ${r.progress * 100}%'></div>
    <div class='distributionBarContainer'>${barsStr}</div>
</p>`
        })
        el('benchmarkLink').onclick = () => this.benchmark()
    }

    benchmark() {
        if (this.#isBusy || !this.algorithmId) return
        this.#isBusy = true
        this.#benchmarkResults.innerHTML = ``
        this.#benchmarkWorker.postMessage({ algorithmId: this.algorithmId, options: this.options })
    }
}

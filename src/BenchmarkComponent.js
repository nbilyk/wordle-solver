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
    #benchmarkWorker = new Worker('benchmarkWorker.js', {type: 'module'})

    constructor() {

        /**
         * @type {AlgorithmConfig | null}
         */
        this.config = null

        this.#benchmarkResults = el('benchmarkResults')
        this.#benchmarkWorker.addEventListener('message', this.#messageHandler)
        el('benchmarkLink').onclick = () => this.benchmark()
    }

    /**
     * @param {MessageEvent<BenchmarkResult>} event
     */
    #messageHandler(event) {
        this.#isBusy = false
        const r = event.data

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
        const pBar = el('benchmarkResultsProgressBar')
        pBar.style.opacity = r.progress < 1 ? '100' : '0'
        pBar.style.width = `${r.progress * 100}%`
        this.#benchmarkResults.innerHTML = `<p>
    <div class='distributionBarContainer'>${barsStr}</div>
</p>`
    }

    benchmark() {
        if (this.#isBusy || !this.config) return
        this.#isBusy = true
        this.#benchmarkResults.innerHTML = ``
        this.#benchmarkWorker.postMessage({config: this.config})
    }
}

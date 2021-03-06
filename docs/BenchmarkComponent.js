// Benchmark
import {el} from './util.js'
import {benchmark as runBenchmark} from './benchmark.js'

export class BenchmarkComponent {

    /**
     * @type boolean
     */
    #isBusy = false

    /**
     * @type HTMLElement
     */
    #benchmarkResults

    #numberFormatter = new Intl.NumberFormat(navigator.language, {maximumFractionDigits: 2})
    #percentFormatter = new Intl.NumberFormat(navigator.language, {
        style: 'percent',
        maximumFractionDigits: 2
    })

    constructor() {

        /**
         * @type {AlgorithmConfig | null}
         */
        this.config = null

        this.#benchmarkResults = el('benchmarkResults')
        el('benchmarkLink').onclick = () => this.benchmark()
    }

    /**
     * @param {BenchmarkResult} r
     */
    #progressHandler(r) {
        let barsStr = ''
        let mostCommonIndex = 0
        let mostCommonCase = r.distribution[0]
        for (let i = 1; i < r.worstCase; i++) {
            if (r.distribution[i] > mostCommonCase) {
                mostCommonIndex = i
                mostCommonCase = r.distribution[i]
            }
        }
        let barLabelsStr = ''
        for (let i = 1; i < r.worstCase; i++) {
            const height = 100 * r.distribution[i] / mostCommonCase
            barsStr += `<div class='distributionBar' style='height: ${height}%'></div>`
            const iPercent = this.#percentFormatter.format(r.distribution[i] / r.totalWords)
            barLabelsStr += `<div class='distributionBarLabel'>${i + 1} (${iPercent})</div>`
        }
        const pBar = el('benchmarkResultsProgressBar')
        pBar.style.opacity = r.progress < 1 ? '100' : '0'
        pBar.style.width = `${r.progress * 100}%`

        let failedAnswersStr = ''
        if (r.failedAnswers.length) {
            let rows = ''
            for (const failedAnswer of r.failedAnswers.slice(0, 10)) {
                rows += `
                    <div class='failedAnswer'>
                        <div class='answer'>${failedAnswer.answer}</div>
                        <div class='failedAnswerGuesses'>
                            <div class='failedAnswerGuess'>
                                ${failedAnswer.guesses.join(`</div><div class='failedAnswerGuess'>`)}
                            </div>
                        </div>
                    </div>`
            }
            failedAnswersStr = `
                <h3>Failed Answer Examples</h3>
                <div class='failedAnswers'>${rows}</div>
            `
        }

        this.#benchmarkResults.innerHTML = `<p>
    <div class='distributionBarContainer'>${barsStr}</div>
    <div class='distributionBarLabels'>${barLabelsStr}</div>
    <div class='averagePerformance'>
        Average Performance: ${this.#numberFormatter.format(r.averagePerformance)}ms
    </div>
    <div class='totalWords'>
        Total Possible Words: ${this.#numberFormatter.format(r.totalWords)}
    </div>
    <div class='averageCase'>Average Case: ${this.#numberFormatter.format(r.averageCase)}</div>
    <div class='worstCase'>Worst Case: ${r.worstCase} Guesses, ${r.failedAnswers.length} Total Failures</div>
    ${failedAnswersStr}
</p>`
    }

    benchmark() {
        if (this.#isBusy || !this.config) return
        this.#isBusy = true
        this.#benchmarkResults.innerHTML = ``
        runBenchmark(this.config.algorithmId,
            this.config.options,
            this.#progressHandler.bind(this)
        ).then((r) => {
            this.#isBusy = false
        })
    }
}

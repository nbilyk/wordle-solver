import {el} from './util.js';

const algorithmOptions = [
    {
        label: 'Scored',
        id: 'SCORED',
        description: `Scores each possible word based on likelihood to minimize possible answers.`
    },
    {
        label: 'First Unfiltered',
        id: 'FIRST',
        description: `Chooses first option that isn't excluded by the provided hints`
    },
    {
        label: 'Best Permutations',
        id: 'BEST_PERMUTATIONS',
        description: `Uses a brute-force approach trying the most likely permutations`
    }
]

export class AlgorithmControls {

    constructor() {
        /**
         *
         * @type {(function(newAlgorithm: AlgorithmId): void)}
         */
        this.onChange = null

        this.#initView()
    }

    #initView() {
        let optionsStr = ''
        for (const algorithmOption of algorithmOptions) {
            optionsStr += `
<div>
<input 
  type='radio' 
  value="${algorithmOption.id}"
  id="algorithmInput_${algorithmOption.id}" 
  name="algorithmInput"
>
<label 
  title="${algorithmOption.description}"
  for="algorithmInput_${algorithmOption.id}"
>
  ${algorithmOption.label}
</label>
</div>
`
        }

        el('algorithmList').innerHTML = optionsStr

        for (/** @type HTMLInputElement */ const radioButton of
            document.querySelectorAll(`input[name='algorithmInput']`)) {
            radioButton.onchange = (e) => {
                if (this.onChange)
                    this.onChange(e.currentTarget.value)
            }
        }
    }

    /**
     * @return {NodeListOf<HTMLInputElement>}
     */
    static get #algorithmInputs() {
        return /** @type NodeListOf<HTMLInputElement> */ document.querySelectorAll(
            `input[name='algorithmInput']`
        )
    }

    /**
     * @param {AlgorithmId} value
     */
    set algorithmId(value) {
        for (const radioButton of AlgorithmControls.#algorithmInputs) {
            radioButton.checked = radioButton.value === value
        }
    }
}

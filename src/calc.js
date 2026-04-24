import { all, create } from 'mathjs';

class App {
	static selectors = {
		numPad: '#numPad',
		calcDisplay: '#calcDisplay',
		error: '.error',
		hint: '#hint',
		open: '.open',
		listBtn: '.list-btn',
		hintCloseBtn: '#hintCloseBtn',
		hintBtn: '#hintBtn',
		HTML(key) {
			return this[key]?.replace(/\.|#/, '');
		}
	};
	#status = {
		isError: false
	};
	#math;
	#el;

	constructor() {
		this.#cacheElements();
		this.#math = create(all, {
			number: 'BigNumber'
		});
		this.#initEvents();
	}

	#cacheElements() {
		this.#el = {
			numPad: document.querySelector(App.selectors.numPad),
			calcDisplay: document.querySelector(App.selectors.calcDisplay),
			hintBar: document.querySelector(App.selectors.hint),
			hintCloseBtn: document.querySelector(App.selectors.hintCloseBtn),
			hintOpenBtn: document.querySelector(App.selectors.hintBtn)
		};
	}
	#initEvents() {
		const escapeRegex = regex => regex.replace(/[.*+?^${}()|[\]\\-]/g, '\\$&');
		const allowedInput = ['(', ')', 'π', '%', '+', '−', '×', '÷', 'nthRoot(,)', '^', '!', '.', 'sin()', 'cos()', 'tan()', 'log(,)', ' '];
		const allowedRegex = new RegExp(`[^${allowedInput.map(escapeRegex).join('')}0-9]`, 'g');
		this.#el.calcDisplay.addEventListener('input', e => { e.target.value = e.target.value.replace(allowedRegex, ''); });
		this.#el.numPad.addEventListener('mousedown', e => { if (e.target.closest('button')) e.preventDefault(); });
		this.#el.numPad.addEventListener('click', e => {
			const setError = enable => {
				this.#el.calcDisplay.classList.toggle(App.selectors.HTML('error'), enable);
				this.#status.isError = enable;
				if (!enable) this.#el.calcDisplay.value = '';
			};
			const setText = (text) => {
				if (this.#status.isError) setError(false);
				const start = this.#el.calcDisplay.selectionStart;
				const val = this.#el.calcDisplay.value;
				if (text !== undefined) {
					text = text.replace(allowedRegex, '');
					this.#el.calcDisplay.value = val.slice(0, start) + text + val.slice(start);
					this.#el.calcDisplay.selectionStart = this.#el.calcDisplay.selectionEnd = start + text.length;
					return;
				}
				if (start <= 0) return;
				this.#el.calcDisplay.value = val.slice(0, start - 1) + val.slice(start);
				this.#el.calcDisplay.selectionStart = this.#el.calcDisplay.selectionEnd = start - 1;
			};
			const btn = e.target.closest('button');
			if (!btn) return;
			switch (btn.dataset.btnId) {
				case 'enter': {
					try {
						const map = { 'π': ' pi ', '−': '-', '×': '*', '÷': '/'};
						const val = this.#el.calcDisplay.value.replace(new RegExp(`${Object.keys(map).map(escapeRegex).join('|')}`, 'g'),i => map[i]);
						console.log(`formula: ${val}`);
						if (val) this.#el.calcDisplay.value = String(this.#math.evaluate(val));
					}
					catch (e) {
						setError(true);
						this.#el.calcDisplay.value = `Error: ${e.message}`;
					}
					break;
				}
				case 'del': {
					setText();
					break;
				}
				case 'ac': {
					this.#el.calcDisplay.value = '';
					break;
				}
				default: {
					setText(btn.dataset.btnId);
				}
			}
		});
		this.#el.hintBar.addEventListener('click', e => {
			const btn = e.target.closest(App.selectors.listBtn);
			if (!btn) return;
			btn.parentNode.classList.toggle(App.selectors.HTML('open'));
		});
		this.#el.hintCloseBtn.addEventListener('click', () => this.#el.hintBar.classList.remove(App.selectors.HTML('open')));
		this.#el.hintOpenBtn.addEventListener('click', () => this.#el.hintBar.classList.add(App.selectors.HTML('open')));
	}
}

new App();
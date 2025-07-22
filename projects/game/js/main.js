
let arrSetCards = null;
let levels;
let game;
let counterClickToCard = 0;
// step - хранит кол-во ходов за уровень, обнуляется при инициализации уровня
let step; 
class ConfettiAnimation {
	#container;

	constructor() {
		this.#container = this.#createContainer();
		this.#createConfetti(150); // можно менять кол-во
	}

	#createContainer() {
		const div = document.createElement('div');
		div.className = 'confetti-wrapper';
		Object.assign(div.style, {
			position: 'fixed',
			top: '0',
			left: '0',
			width: '100vw',
			height: '100vh',
			overflow: 'hidden',
			pointerEvents: 'none',
			zIndex: '10000'
		});
		return div;
	}

	#createConfetti(count) {
		const colors = ['#d13447', '#ffbf00', '#263672'];

		for (let i = 0; i < count; i++) {
			const el = document.createElement('div');
			const size = Math.floor(Math.random() * 8) + 2; // 2–10px
			const left = Math.random() * 100;
			const rotate = Math.random() * 360;
			const color = colors[Math.floor(Math.random() * colors.length)];
			const opacity = 0.5 + Math.random() * 0.5;
			const duration = 4 + Math.random() * 3; // 4–7s
			const delay = Math.random() * 2;
			const drift = (Math.random() * 30) - 15; // отклонение влево/вправо

			Object.assign(el.style, {
				position: 'absolute',
				width: `${size}px`,
				height: `${size * 0.4}px`,
				backgroundColor: color,
				top: '-10%',
				left: `${left}%`,
				opacity: opacity,
				transform: `rotate(${rotate}deg)`,
				borderRadius: '2px',
				animation: `confetti-fall-${i} ${duration}s ${delay}s ease-out forwards`
			});

			const keyframes = `
				@keyframes confetti-fall-${i} {
					to {
						top: 110%;
						left: ${left + drift}%;
						transform: rotate(${rotate + 720}deg);
						opacity: 0;
					}
				}
			`;
			this.#injectStyle(keyframes);
			this.#container.appendChild(el);
		}
	}

	#injectStyle(css) {
		const style = document.createElement('style');
		style.textContent = css;
		document.head.appendChild(style);
	}

	start() {
		document.body.appendChild(this.#container);
	}

	stop() {
		if (this.#container) {
			this.#container.remove();
		}
	}
}


class Modal {

	#elem = '';

	constructor() {
		this.#elem = this.#render();

	}

	#render() {
		let elem = createElement(this.#template());

		elem.querySelector('.modal__close').addEventListener('click', this.close);

		return elem;
	}

	#template() {
		return `
		<div class="modal">
    		<div class="modal__overlay"></div>
			<div class="modal__inner">
				<div class="modal__header">
				<button type="button" class="modal__close"></button>
				</div>
			</div>
		</div>
		`
	}

	setTitle(value) {
		let elem = createElement(`
			<h3 class="modal__title">
         	${value}
        </h3>
		`);

		this.#elem.querySelector('.modal__header').append(elem);

	}

	setBody(value) {
		let modalBodyElem = this.#elem.querySelector('.modal__body');

		if (modalBodyElem) {
			modalBodyElem.innerHTML = ''
		} else {

			let modalBody = createElement(`
			<div class="modal__body"></div>
		`);
			this.#elem.querySelector('.modal__header').append(modalBody);
		};


		this.#elem.querySelector('.modal__body').append(value);
	}

	open() {
		let bodyDoc = document.querySelector('body');
		bodyDoc.append(this.#elem);
		bodyDoc.classList.add('is-modal-open');

		setTimeout(function () {
			// Применение класса для плавного появления
			let x = document.querySelector('.modal');
			let y = document.querySelector('.modal__overlay');
			x.style.opacity = 1;
			y.style.opacity = 1;
		}, 100);

		bodyDoc.addEventListener('keydown', this.#onRemoveEsc, { once: true });
	}

	close = () => {
		let bodyDoc = document.querySelector('body');
		let modalElem = document.querySelector('.modal');

		if (!modalElem) return;

		bodyDoc.classList.remove('is-modal-open');
		modalElem.remove();
		bodyDoc.removeEventListener('keydown', this.#onRemoveEsc);

	}

	removeElement = () => {
		const elementToRemove = this.#elem.querySelector('.modal__close');

		if (elementToRemove) {

			elementToRemove.parentNode.removeChild(elementToRemove);
		}

	}

	#onRemoveEsc = (event) => {
		if (event.code !== 'Escape') return;
		this.close();
	}
}
class Loader {
	#elem = '';

	constructor() {
		this.#elem = this.#render();
		console.log('[Loader] Конструктор: элемент создан');
	}

	#render() {
		let elem = createElement(this.#template());
		console.log('[Loader] Render: элемент отрендерен');
		return elem;
	}

	#template() {
		return `
			<div class="loader-overlay">
				<div class="loader-spinner"></div>
			</div>
		`;
	}

	show() {
		console.log('[Loader] show(): добавление лоадера в DOM');
		document.body.append(this.#elem);
		console.log('[Loader] show(): this.#elem =', this.#elem);

	}

	hide() {
		console.log('[Loader] hide(): скрытие лоадера');
		this.#elem.classList.add('loader--hide');
		setTimeout(() => {
			this.#elem.remove();
			console.log('[Loader] hide(): удаление из DOM');
		}, 700); // чуть больше, чем transition
	}


	waitForBackgroundImages(callback) {
		console.log('[Loader] waitForBackgroundImages(): старт ожидания');

		// Берем только карточки с лицевой стороной
		const elements = document.querySelectorAll('.card-face.card-back');
		console.log(`[Loader] Найдено лицевых сторон: ${elements.length}`);

		let urls = new Set();

		elements.forEach(el => {
			const style = window.getComputedStyle(el);
			const bg = style.backgroundImage;

			console.log(`[Loader] Стиль background: ${bg}`);

			const match = bg.match(/url\((['"]?)(.*?)\1\)/); // улучшенная регулярка
			if (match && match[2]) {
				const url = match[2];
				console.log(`[Loader] Найдено изображение: ${url}`);
				urls.add(url);
			} else {
				console.warn(`[Loader] Не удалось извлечь URL из background: ${bg}`);
			}
		});

		urls = [...urls]; // превращаем Set обратно в массив
		console.log(`[Loader] Уникальных URL к загрузке: ${urls.length}`);

		if (urls.length === 0) {
			console.log('[Loader] Нет изображений для загрузки, вызываем callback сразу');
			callback();
			return;
		}

		let loaded = 0;
		urls.forEach(src => {
			const img = new Image();
			img.onload = img.onerror = () => {
				loaded++;
				console.log(`[Loader] Загружено: ${loaded}/${urls.length}`);
				if (loaded === urls.length) {
					console.log('[Loader] Все изображения загружены, вызываем callback');
					callback();
				}
			};
			img.src = src;
			console.log(`[Loader] Загружаем: ${src}`);
		});
	}
}

class MemoryGame {
	constructor(value) {
		this.cardValues = value;
		this.memoryGameContainer = document.querySelector('.memory-game');
		this.cards = [];
		this.memoryGame = null;
		this.initializeGame;
		this.buttons();
		this.buttonsHidden;
	}

	buttons() {

		let btnPauseCheck = document.querySelectorAll('.memory-buttons__btn');
		const btnUI = document.querySelector('.memory-buttons');

		if (btnPauseCheck[0]) {
			btnPauseCheck[0].remove();
			btnPauseCheck[1].remove();
		};

		const btnUIPause = document.createElement('div');
		btnUIPause.classList.add('memory-buttons__btn', 'memory-buttons__btn-pause')
		btnUI.appendChild(btnUIPause);
		btnUIPause.addEventListener('click', () => {

			let modalPause = new Modal();
			modalPause.setTitle(`Уровень: ${(levels - arrSetCards.length) + 1} / 7`);
			modalPause.setBody(createElement(`<div class="modal__btn-wrap">
				<div class="modal__btn"><button class="modal__btn-insert btn-continue"><span>продолжить</span></button></div>
				<div class="modal__btn"><button onclick="again()" class="modal__btn-insert btn-again"><span>перемешать</span></button></div>
				<div class="modal__btn"><button onclick="" class="modal__btn-insert btn-audio"><span>убрать звук</span></button></div>
				<div class="modal__btn"><button onclick="start()" class="modal__btn-insert btn-new"><span>Новая игра</span></button></div>
			</div>
		</div>`));

			modalPause.open();

			let x = document.querySelector('.btn-new');
			x.style.display = 'block';

			let btnContinue = document.querySelector('.btn-continue');
			btnContinue.addEventListener('click', closeContinue);

			function closeContinue() {
				modalPause.close();
				btnContinue.removeEventListener('click', closeContinue);
			}
		});

		const btnUIClue = document.createElement('div');
		btnUIClue.classList.add('memory-buttons__btn', 'memory-buttons__btn-clue', 'memory-buttons__btn-clue--visible');
		btnUI.appendChild(btnUIClue);

		const clueImage = document.createElement('img');
		clueImage.src = '/image/icons/(22).png';
		clueImage.classList.add('memory-buttons__btn-clue-image');
		btnUIClue.appendChild(clueImage);

		const btnUIClueHidden = document.createElement('div');
		btnUIClueHidden.classList.add('memory-buttons__btn-clue-hidden');
		btnUIClue.appendChild(btnUIClueHidden);

		btnUIClue.addEventListener('click', () => {
			let cardsGame = game.cards;

			if (!btnUIClue) return;

			if (btnUIClue.classList.contains('memory-buttons__btn-clue--visible')) {
				let x = [];
				let y;
				let indexCard;
				let cardClue;

				cardsGame.forEach((card) => {
					if (card.isSelected === true) {
						x.push(card.isSelected)
					};
				});

				if (x.length == 1) {
					cardsGame.forEach((card, index) => {
						if (card.isSelected === true) {
							y = card.value;
							indexCard = index;
						};

					});

					cardsGame.forEach((card, index) => {
						if ((card.value == y) && index != indexCard) {
							cardClue = document.querySelector(`[data-index="${index}"]`);
						}
					});

					counterClickToCard = 0;
					btnUIClue.classList.remove('memory-buttons__btn-clue--visible');

					let btnClueHidden = document.querySelector('.memory-buttons__btn-clue-hidden');
					btnClueHidden.style.height = '100%';

					cardClue.classList.add('swing-animation');

					setTimeout(() => {
						cardClue.classList.remove('swing-animation');
					}, 1000);

				} else if (x.length == 2) {
					return;
				} else {
					let modalClue = new Modal();
					modalClue.setTitle(`Упс..`);
					modalClue.setBody(createElement(`<div class="modal__body-wrap">
					<div class="modal__text">
						<span>Открой любую карточку и нажми на кнопку подсказки</span>
					</div>
					<div class="modal__btn-wrap">
						<div class="modal__btn"><button class="modal__btn-insert btn-continue"><span>продолжить</span></button></div>
					</div>
				</div>`));

					modalClue.open();

					let btnContinue = document.querySelector('.btn-continue');
					btnContinue.addEventListener('click', closeContinue);

					function closeContinue() {
						modalClue.close();
						btnContinue.removeEventListener('click', closeContinue);
					}
				};

			} else {

				let cardClue = document.querySelector(`.memory-buttons__btn-clue`);
				cardClue.classList.add('shake-horizontal');

				setTimeout(() => {
					cardClue.classList.remove('shake-horizontal');
				}, 800);
			};
		});

		setTimeout(function () {
			let x = document.querySelectorAll('.memory-buttons__btn');
			x[0].style.opacity = 1;
			x[1].style.opacity = 1;
		}, 100);
	}

	buttonsHidden() {

		let btnPauseCheck = document.querySelectorAll('.memory-buttons__btn');

		if (!btnPauseCheck) return;

		btnPauseCheck[0].style.opacity = 0;
		btnPauseCheck[1].style.opacity = 0;
	}

	initializeGame() {
		this.cards = [];
		this.memoryGameContainer.innerHTML = '';


		for (const value of this.cardValues[0]) {
			this.cards.push(new Card(value));
			this.cards.push(new Card(value));
		}

		this.memoryGame = new Memory(this.cards);
		this.memoryGame.shuffleCards();

		this.cards.forEach((card, index) => {
			const cardElement = document.createElement('div');
			cardElement.classList.add('memory-card');
			cardElement.dataset.index = index;

			const cardInner = document.createElement('div');
			cardInner.classList.add('card-inner');

			const cardFace = document.createElement('div');
			cardFace.classList.add('card-face');
			cardInner.appendChild(cardFace);

			const cardBack = document.createElement('div');
			cardBack.classList.add('card-face', 'card-back');
			cardBack.style.background = `url('/image/cards-list/${card.value}.png') 50% 50%/cover no-repeat`;
			cardInner.appendChild(cardBack);

			const cardWrapElement = document.createElement('div');
			cardWrapElement.classList.add('memory-card-wrap');

			cardWrapElement.appendChild(cardElement);
			cardElement.appendChild(cardInner);
			this.memoryGameContainer.appendChild(cardWrapElement);

			setTimeout(function () {
				// Применение класса для плавного появления
				cardWrapElement.style.opacity = 1;
			}, 100);

			cardElement.addEventListener('click', () => {
				if (!card.isSelected) {
					this.memoryGame.selectCard(this.cards.indexOf(card));
					this.updateCardView(card);
				}
			});

			step = 0;
		});

	}

	updateCardView(card) {
		const cardElement = document.querySelector(`[data-index="${this.cards.indexOf(card)}"]`);
		cardElement.classList.toggle('is-selected', card.isSelected);
		cardElement.classList.toggle('is-matched', card.isMatched);

		if (card.isSelected) {

			counterClickToCard++;
			let card = document.querySelector('.memory-buttons__btn-clue');

			if (!card.classList.contains('memory-buttons__btn-clue--visible')) {
				let cardHidden = document.querySelector('.memory-buttons__btn-clue-hidden');
				let x = 100 - ((100 / 20) * counterClickToCard);

				cardHidden.style.height = `${Math.ceil(x)}%`;
			};

			if (counterClickToCard === 20) {

				if (!card.classList.contains('memory-buttons__btn-clue--visible')) {
					setTimeout(() => {
						card.classList.add('memory-buttons__btn-clue--visible', 'scale-up-center');

						setTimeout(() => {
							card.classList.remove('scale-up-center');
						}, 400);
					}, 300);
				};

				counterClickToCard = 0;
			}
		};

		if (card.isMatched) {
			cardElement.querySelector('.card-inner').classList.add('rotate');
		} else {
			cardElement.querySelector('.card-inner').classList.remove('rotate');
		}
	}

	startLevelIntro(callback) {
		this.setInteractionBlocked(true); // 🚫 блокируем

		const allCardElements = document.querySelectorAll('.memory-card-wrap');

		allCardElements.forEach((wrap, i) => {
			setTimeout(() => {
				const cardElement = wrap.querySelector('.memory-card');
				const card = this.cards[i];
				card.isSelected = true;
				this.updateCardView(card);
			}, i * 100);
		});

		setTimeout(() => {
			this.showCountdown(3, () => {
				this.cards.forEach((card, i) => {
					card.isSelected = false;
					this.updateCardView(card);
				});

				this.setInteractionBlocked(false); // ✅ разблокируем

				if (typeof callback === 'function') callback();
			});
		}, allCardElements.length * 100 + 300);
	}


	showCountdown(from = 3, onComplete) {
		const counter = document.createElement('div');
		counter.className = 'memory-countdown';
		counter.style.position = 'absolute';
		counter.style.top = '20px';
		counter.style.right = '20px';
		counter.style.zIndex = 10000;
		counter.style.fontSize = '64px';
		counter.style.color = '#fff';
		counter.style.fontWeight = 'bold';
		counter.style.textShadow = '0 0 10px black';
		document.body.appendChild(counter);

		let current = from;

		const tick = () => {
			counter.textContent = current;
			current--;

			if (current < 0) {
				counter.remove();
				if (typeof onComplete === 'function') onComplete();
			} else {
				setTimeout(tick, 1000);
			}
		};

		tick();
	}

	setInteractionBlocked(isBlocked) {
		const game = document.querySelector('.memory-game');
		const buttons = document.querySelector('.memory-buttons');

		if (isBlocked) {
			if (game) game.classList.add('memory-blocked');
			if (buttons) buttons.classList.add('memory-blocked');
		} else {
			if (game) game.classList.remove('memory-blocked');
			if (buttons) buttons.classList.remove('memory-blocked');
		}
	}


}

class Memory {
	constructor(cards) {
		this.cards = cards;
		this.pairsFound = 0;
		this.selectedCards = [];
		this.isGameOver = false;
		this.indexArr = [];
	}

	shuffleCards() {
		for (let i = this.cards.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
		}
	}

	selectCard(index) {
		if (this.isGameOver || this.selectedCards.length >= 2) return;
		const card = this.cards[index];
		if (!card || card.isMatched || card.isSelected) return;
		if (!this.cards[index].isMatched) step++;
		card.isSelected = true;
		this.selectedCards.push(card);
		this.indexArr.push(index);
		if (this.selectedCards.length === 2) this.checkMatch();

		// let eventWinner = new CustomEvent('winnerLevel', {
		// 	bubbles: true
		// });

		// document.dispatchEvent(eventWinner);
	}

	checkMatch() {
		const [card1, card2] = this.selectedCards;
		if (card1.value === card2.value) {
			card1.isMatched = true;
			card2.isMatched = true;
			this.pairsFound++;
			if (this.pairsFound === this.cards.length / 2) {
				this.isGameOver = true;
				setTimeout(function () {
					let eventWinner = new CustomEvent('winnerLevel', {
						bubbles: true
					});

					document.dispatchEvent(eventWinner);
				}, 1500);
			};
		}
		setTimeout(() => {
			card1.isSelected = false;
			card2.isSelected = false;
			this.selectedCards = [];
			this.updateCardView(card1);
			this.updateCardView(card2);

			if (card1.value === card2.value) {

				// Тут ловим совпадение 2х карточек
				if (this.indexArr.length == 2) {
					let cardElement1 = document.querySelector(`[data-index="${this.indexArr[0]}"]`);
					let cardElement2 = document.querySelector(`[data-index="${this.indexArr[1]}"]`);
					cardElement1.classList.add('swing-animation-mini');
					cardElement2.classList.add('swing-animation-mini');
				};

				this.indexArr = [];

			} else {
				this.indexArr = [];
			};
		}, 500);

	}

	updateCardView(card) {
		const cardElement = document.querySelector(`[data-index="${this.cards.indexOf(card)}"]`);
		cardElement.classList.toggle('is-selected', card.isSelected);
		cardElement.classList.toggle('is-matched', card.isMatched);

		if (card.isMatched) {
			cardElement.querySelector('.card-inner').classList.add('rotate');
		} else {
			cardElement.querySelector('.card-inner').classList.remove('rotate');
		}

	}
}

class Card {
	constructor(value) {
		this.value = value;
		this.isSelected = false;
		this.isMatched = false;
	}
}
function createElement(html) {

	const div = document.createElement('div');
	div.innerHTML = html;
	return div.firstElementChild;
};

function again() {
	game.initializeGame();
	counterClickToCard = 0;

	let x = document.querySelectorAll('.memory-buttons__btn');
	x[0].remove();
	x[1].remove();

	game.buttons();

	document.querySelector('.modal').remove();

	setTimeout(() => {
		game.startLevelIntro();
	}, 500);
}

function next() {
	game.cardValues.shift();
	game.initializeGame();
	counterClickToCard = 0;

	let x = document.querySelectorAll('.memory-buttons__btn');
	x[0].remove();
	x[1].remove();

	game.buttons();

	const loader = new Loader();
	loader.show();

	game.initializeGame();

	document.querySelector('.modal').remove();
	loader.waitForBackgroundImages(() => {
		loader.hide();

		setTimeout(() => {
			game.startLevelIntro();
		}, 500);
	});
}

if (arrSetCards === null) {
	let modalStart = new Modal();
	modalStart.setTitle('Новая игра!');
	modalStart.setBody(createElement(`<div class="modal__btn-wrap">
	<div class="modal__btn"><button onclick="start()" class="modal__btn-insert btn-start"><span>играть</span></button></div>
	</div>`));

	function start() {
		// Создаю массив с массивами в формате YYY/XX, YYY/XX, YYY/XX...
		arrSetCards = [];

		for (let i = 1; i <= 07; i++) {
			let currentPrefix = i < 07 ? '00' + i : '007';
			let subArray = [];

			for (let j = 1; j <= 12; j++) {
				let month = '(' + j + ')';
				subArray.push(currentPrefix + '/' + month);
			}

			arrSetCards.push(subArray);
		}

		// fn для перемешивания массива с массивами
		function shuffleArray(array) {
			for (let i = array.length - 1; i > 0; i--) {
				const j = Math.floor(Math.random() * (i + 1));
				[array[i], array[j]] = [array[j], array[i]];
			}
			return array;
		}

		// const shuffledArray = shuffleArray(arrSetCards);

		const shuffledArray = shuffleArray(arrSetCards);

		levels = arrSetCards.length;
		game = new MemoryGame(arrSetCards);

		const loader = new Loader();
		loader.show();

		game.initializeGame();

		document.querySelector('.modal').remove();
		loader.waitForBackgroundImages(() => {
			loader.hide();

			setTimeout(() => {
				game.startLevelIntro();
			}, 500);
		});
	}

	modalStart.removeElement();
	modalStart.open();
};

document.addEventListener('winnerLevel', () => {
	let modalWinner = new Modal();
	modalWinner.setTitle(`Уровень: ${(levels - arrSetCards.length) + 1} / 7`);
	modalWinner.setBody(createElement(`<div class="modal__btn-wrap">
	<div class="modal__btn"><button onclick="next()" class="modal__btn-insert btn-next"><span>следующий</span></button></div>
	<div class="modal__btn"><button onclick="again()" class="modal__btn-insert btn-again"><span>еще раз</span></button></div>
	<div class="modal__btn"><button onclick="start()" class="modal__btn-insert btn-new"><span>Новая игра</span></button></div>
	</div>`));

	modalWinner.removeElement();
	modalWinner.open();

	const confetti = new ConfettiAnimation();
	confetti.start();

	setTimeout(() => confetti.stop(), 6000);

	if (((levels - arrSetCards.length) + 1) == levels) {

		let x = document.querySelector('.btn-new');
		let y = document.querySelector('.modal__btn');
		x.style.display = 'block';
		y.remove();
	}
});
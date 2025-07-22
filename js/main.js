
'use strict';

let btnContact = document.querySelector('.header__contact');

btnContact.addEventListener('click', smoothScroll);

function smoothScroll() {
	let targetElemScroll = document.querySelector('.contact');
	let targetPosition = targetElemScroll.getBoundingClientRect().top + window.scrollY;

	if (targetElemScroll) {
		window.scrollTo({
			top: targetPosition,
			behavior: 'smooth'
		});
	};
}
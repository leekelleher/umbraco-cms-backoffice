class UmbBouncingLogoElement extends HTMLElement {
	static observedAttributes = ['background-color', 'height', 'width', 'colors', 'speed'];

	#container;
	#logo;
	#pallete = ['#be00ff', '#00feff', '#ff8300', '#0026ff', '#fffa01', '#ff2600', '#ff008b', '#25ff01'];

	#prevIdx = 0;

	#logoWidth;
	#logoHeight;

	#speed = 4;

	#x = 0;
	#y = 0;
	#dirX = 1;
	#dirY = 1;

	constructor() {
		super();

		const shadow = this.attachShadow({ mode: 'open' });

		this.#container = document.createElement('div');
		this.#container.id = 'container';

		this.#logo = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
		this.#logo.id = 'logo';
		this.#logo.setAttribute('viewBox', '0 0 1180 316');

		const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
		path.setAttribute(
			'd',
			'M.2 157.8C.3 70.6 71.1-.1 158.3.1S316.2 71 316.1 158.2s-70.8 157.7-157.9 157.7C70.8 315.9.1 245.1.2 157.8zm154.7 54.1c-12.3.4-24.5-.7-36.5-3.3-8.8-1.8-16.3-7.8-19.9-16-3.6-8.2-5.3-20.9-5.2-38.1.1-9 .6-17.9 1.7-26.8 1-8.7 2.1-15.8 3.1-21.5l1.1-5.6v-.5c0-1.6-1.1-2.9-2.6-3.2l-20.4-3.2h-.4c-1.5 0-2.8 1-3.1 2.5-.3 1.3-.6 2.3-1.2 5.4-1.2 6-2.2 11.8-3.4 20.4-1.3 9.3-2 18.6-2.3 27.9-.4 6.5-.4 13 0 19.6.5 17.3 3.4 31.1 8.9 41.4 5.5 10.3 14.7 17.8 27.7 22.3s31.2 6.8 54.4 6.7h2.9c23.3.1 41.4-2.1 54.4-6.7 13-4.5 22.2-12 27.7-22.3s8.4-24.1 8.9-41.4c.4-6.5.4-13 0-19.6-.3-9.3-1-18.7-2.3-27.9-1.2-8.4-2.3-14.3-3.4-20.4-.6-3.1-.8-4.1-1.2-5.4-.3-1.4-1.6-2.5-3.1-2.5h-.5l-20.4 3.2c-1.6.3-2.7 1.6-2.7 3.2v.5l1.1 5.6c1 5.6 2.1 12.8 3.1 21.5 1 8.9 1.6 17.9 1.7 26.8.2 17.1-1.6 29.8-5.2 38.1-3.6 8.2-11 14.2-19.8 16.1-12 2.5-24.2 3.6-36.5 3.3l-6.6-.1zm932.3-43.9c0-30.4 8.6-51.7 43.8-51.7s43.8 21.3 43.8 51.7-8.6 51.7-43.8 51.7-43.8-21.3-43.8-51.7zm65.3 0c0-21.1-2.7-33.1-21.5-33.1s-21.5 12-21.5 33.1 2.8 33.1 21.5 33.1c18.8 0 21.5-12 21.5-33.1zm-672.1 47.8c.5.9 1.5 1.5 2.5 1.4h8.2c1.6 0 2.9-1.3 2.9-2.9v-92.7c0-1.6-1.3-2.9-2.9-2.9h-16.3c-1.6 0-2.9 1.3-2.9 2.9v73.6c-7 3.9-14.9 5.9-22.8 5.8-10.4 0-15.6-4.5-15.6-14.6v-64.8c0-1.6-1.3-2.9-2.9-2.9h-16.4c-1.6 0-2.9 1.3-2.9 2.9v66.7c0 18.9 8.9 31.3 33.9 31.3 11.4-.1 22.6-3.7 32-10.2l2.9 6.5.3-.1zm184.1-68.1c0-18.7-9.3-31.4-32.6-31.4-11.3 0-22.3 3.4-31.6 9.8-4.1-6.1-12-9.8-25.3-9.8-10.7.2-21.1 3.8-29.7 10.2l-2.9-6.5c-.5-.9-1.5-1.5-2.5-1.4h-8.3c-1.6 0-2.9 1.3-2.9 2.9v92.8c0 1.6 1.3 2.9 2.9 2.9h16.3c1.6 0 2.9-1.3 2.9-2.9v-73.5c6.2-3.8 13.4-5.8 20.7-5.8 8.9 0 14 3.3 14 12.6v66.7c0 1.6 1.3 2.9 2.9 2.9h16.3c1.6 0 2.9-1.3 2.9-2.9v-73.6c6.2-3.9 13.4-5.9 20.7-5.8 8.6 0 14 3.3 14 12.6v66.7c0 1.6 1.3 2.9 2.9 2.9h16.3c1.6 0 2.9-1.3 2.9-2.9l.1-66.5zm50.4 61.7c9.3 6.9 20.5 10.5 32 10.2 28.8 0 39.4-19.3 39.4-51.7s-10.7-51.7-39.4-51.7c-9.4 0-18.5 2.7-26.4 7.7V94.2c0-1.6-1.2-2.9-2.8-3h-16.6c-1.6 0-2.9 1.3-2.9 2.9v120.3c0 1.6 1.3 2.9 2.9 2.9h8.2c1 0 2-.5 2.5-1.4l3.1-6.5zm26.8-8.5c-7.5 0-14.8-2-21.3-5.8v-54.4c6.5-3.8 13.8-5.8 21.3-5.8 19.3 0 22.3 14.8 22.3 32.9s-2.8 33.1-22.3 33.1zM868 135.7c-2.5-.3-5.1-.5-7.7-.5-8.8-.4-17.5 1.7-25.3 5.9v73.2c0 1.6-1.3 2.9-2.9 2.9h-16.3c-1.6 0-2.9-1.3-2.9-2.9v-92.7c0-1.6 1.3-2.9 2.9-2.9h8.2c1 0 2 .5 2.5 1.4l2.9 6.5c8.9-6.8 19.9-10.4 31.2-10.2 2.6 0 5.2.2 7.7.6 1.4 0 2.7 2.4 2.7 4v11.8c0 1.6-1.3 2.9-2.9 2.9h-.2m56.7 36.1c-9.8 1.2-15.6 4.9-15.6 15.2 0 7.5 3.3 14.6 15.2 14.6 7.5.1 14.9-2.2 21.1-6.5v-25.5l-20.7 2.2zm26.1 37.6c-8.5 6.7-19 10.3-29.8 10.2-25.5 0-33.9-15.8-33.9-31.6 0-21.3 13.8-30.4 36.1-32.1l22.1-1.8v-4.9c0-10.1-4.7-14-19.3-14-9.2 0-18.3 1.5-26.9 4.5h-.9c-1.6 0-2.9-1.3-2.9-2.9v-13.1c0-1.2.7-2.4 1.9-2.8 9.8-3.3 20.1-5 30.5-4.9 32.3 0 39.8 14.2 39.8 35.1V214c0 1.6-1.3 2.9-2.9 2.9h-8.2c-1 0-2-.5-2.5-1.4l-3.1-6.1zM1063 197h.9c1.6 0 2.9 1.3 2.9 2.9V213c0 1.2-.7 2.3-1.8 2.7-8.1 2.9-16.7 4.3-25.4 4.1-34.9 0-45.7-20.9-45.7-51.7s10.7-51.7 45.7-51.7c8.6-.2 17.1 1.1 25.2 4 1.1.4 1.9 1.5 1.8 2.7v13.1c0 1.6-1.3 2.9-2.9 2.9h-.9c-7.1-2.2-14.6-3.3-22-3.1-19.1 0-24.7 13.1-24.7 32.2s5.5 32.1 24.7 32.1c7.5.1 14.9-1 22-3.3',
		);

		this.#logo.style.position = 'absolute';
		this.#logo.style.left = '0';
		this.#logo.style.top = '0';
		this.#logo.style.width = '303px';
		this.#logo.style.height = '81px';

		this.#logo.appendChild(path);

		this.#container.style.width = '100vw';
		this.#container.style.height = '100vh';
		this.#container.style.backgroundColor = '#111';
		this.#container.style.overflow = 'hidden';
		this.#container.style.position = 'relative';

		this.#container.appendChild(this.#logo);

		shadow.appendChild(this.#container);
	}

	connectedCallback() {
		this.#logo.style.fill = this.#pallete[this.#prevIdx];

		this.#logoWidth = this.#logo.clientWidth;
		this.#logoHeight = this.#logo.clientHeight;

		this.#requestFrame();
	}

	attributeChangedCallback(name, oldValue, newValue) {
		switch (name) {
			case 'background-color':
				this.#container.style.backgroundColor = newValue;
				break;
			case 'height':
				this.#container.style.height = newValue;
				break;
			case 'width':
				this.#container.style.width = newValue;
				break;
			case 'colors':
				this.#pallete = newValue.split(',');
				break;
			case 'speed':
				this.#speed = parseInt(newValue) || 4;
				break;
			default:
				break;
		}
	}

	#animate() {
		const containerHeight = this.#container.clientHeight;
		const containerWidth = this.#container.clientWidth;

		if (this.#y + this.#logoHeight >= containerHeight || this.#y < 0) {
			this.#dirY *= -1;
			this.#logo.style.fill = this.#getNextColor();
		}

		if (this.#x + this.#logoWidth >= containerWidth || this.#x < 0) {
			this.#dirX *= -1;
			this.#logo.style.fill = this.#getNextColor();
		}

		this.#x += this.#dirX * this.#speed;
		this.#y += this.#dirY * this.#speed;

		this.#logo.style.left = this.#x + 'px';
		this.#logo.style.top = this.#y + 'px';

		this.#requestFrame();
	}

	#getNextColor() {
		let nextIdx = this.#prevIdx + 1;

		if (nextIdx >= this.#pallete.length) {
			nextIdx = 0;
		}

		this.#prevIdx = nextIdx;

		return this.#pallete[nextIdx];
	}

	#requestFrame = () => window.requestAnimationFrame(() => this.#animate());
}

window.customElements.define('umb-bouncing-logo', UmbBouncingLogoElement);

import registerElement from '../../../07-utilities/helpers.js';

export default function(tagName) {
    const onOpenCallbacks = [];
    const onCloseCallbacks = [];

    function attachedCallback() {
        let lb = {
            parent: this.parentElement,
            container: this.querySelector('.sc-lightbox__container'),
            content: this.querySelector('.sc-lightbox__content'),
            close: Array.from(this.querySelectorAll('[data-lightbox-close]')),
            preventOutsideClose: this.getAttribute('prevent-outsideclose'),
            customIdentifier: this.getAttribute('data-custom') || ''
        };

        const id = this.id || '';
        const openElements = Array.from(document.querySelectorAll('[data-lightbox-open="' + id + '"]'));

        openElements.forEach(el => {
            el.addEventListener('click', () => show(lb, el), false);
        });

        lb.close.forEach(el => {
            el.addEventListener('click', e => hide(lb, e), false);
        });
    }

    const show = (lb, opener) => {
        if (
            opener.hasAttribute('data-lightbox-prevent-open') &&
            opener.getAttribute('data-lightbox-prevent-open') == 'true'
        ) {
            return;
        }
        lb.overlay = document.createElement('div');
        lb.overlay.classList.add('sc-lightbox__overlay');

        if (lb.customIdentifier) {
            lb.overlay.setAttribute('data-custom', lb.customIdentifier);
        }

        document.body.appendChild(lb.overlay);

        lb.overlay.classList.add('sc-lightbox__overlay--visible');

        lb.overlay.appendChild(lb.container);

        lb.overlay.appendChild(lb.container);

        lb.container.classList.add('sc-lightbox__container--visible');

        if (lb.preventOutsideClose === null) {
            lb.overlay.addEventListener('click', e => hide(lb, e), false);
            document.addEventListener('keydown', e => {
                if (e.keyCode === 27) hide(lb, e);
            });
        }

        document.querySelector('html').classList.add('sc-unscroll');

        setTimeout(() => {
            lb.overlay.classList.add('sc-lightbox--fadein');
        }, 20);

        onOpenCallbacks.forEach(cb => cb());
    };

    const hide = (lb, e) => {
        // e.stopPropagation();

        document.querySelector('html').classList.remove('sc-unscroll');

        if (e.target === lb.overlay || lb.close.includes(e.target) || e.keyCode === 27) {
            e.preventDefault();
            lb.container.classList.remove('sc-lightbox__container--visible');
            lb.parent.appendChild(lb.container);
            if (lb.overlay) {
                lb.overlay.classList.remove('sc-lightbox--fadein');
                setTimeout(() => {
                    lb.overlay.remove();
                }, 250);
            }

            onCloseCallbacks.forEach(cb => cb());
        }
    };

    const registerOnOpenCallback = cb => onOpenCallbacks.push(cb);

    const registerOnCloseCallback = cb => onCloseCallbacks.push(cb);

    registerElement({
        attachedCallback,
        tagName,
        registerOnOpenCallback,
        registerOnCloseCallback
    });
}

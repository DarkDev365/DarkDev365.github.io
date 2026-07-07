class QRModal extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this._handleKeydown = this._handleKeydown.bind(this);
    }

    connectedCallback() {
        this.render();
        document.addEventListener('keydown', this._handleKeydown);
    }

    disconnectedCallback() {
        document.removeEventListener('keydown', this._handleKeydown);
    }

    _getFocusableElements() {
        return this.shadowRoot.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
    }

    _handleKeydown(e) {
        if (e.key === 'Escape') this.close();
        if (e.key === 'Tab') this._handleTabKey(e);
    }

    _handleTabKey(e) {
        const focusable = this._getFocusableElements();
        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey) { // Shift + Tab
            if (this.shadowRoot.activeElement === first) {
                e.preventDefault();
                last.focus();
            }
        } else { // Tab
            if (this.shadowRoot.activeElement === last) {
                e.preventDefault();
                first.focus();
            }
        }
    }

    _syncStyles() {
        const source = document.querySelector('.box') || document.body;
        const style = window.getComputedStyle(source);
        const box = this.shadowRoot.querySelector('.box');

        box.style.backgroundColor = style.backgroundColor;
        box.style.color = style.color;
        box.style.borderRadius = style.borderRadius;
        box.style.boxShadow = style.boxShadow;
        box.style.border = style.border;
    }

    // Calculates the width of the scrollbar
    _getScrollbarWidth() {
        return window.innerWidth - document.documentElement.clientWidth;
    }

    _getInputColor(rawColor) {
        let color = rawColor || window.getComputedStyle(document.body).color;
        if (rawColor && !rawColor.startsWith('#')) {
            color = this._getColorFromClass(rawColor);
        }
        return color;
    }

    // Add this helper to get color from a class
    _getColorFromClass(className) {
        const temp = document.createElement('div');
        temp.className = className;
        temp.style.display = 'none';
        document.body.appendChild(temp);
        const color = window.getComputedStyle(temp).color;
        document.body.removeChild(temp);
        return color;
    }

    open(overrideText = null, title = "Share") {
        this._syncStyles();

        // Update title dynamically
        this.shadowRoot.querySelector('#modal-title').textContent = title;

        // Check if data-color/focus-color is a class or a hex
        const rawColor = this.getAttribute('data-color');
        const focusOverride = this.getAttribute('focus-color');

        // Determine the primary theme color
        const themeColor = this._getInputColor(rawColor);

        // Determine the focus color (fallback: themeColor)
        const focusColor = this._getInputColor(focusOverride) || themeColor;

        // Apply the focus color dynamically
        this.style.setProperty('--modal-focus-color', focusColor);

        // --- Isolate Scroll Management ---
        const scrollbarWidth = this._getScrollbarWidth();
        document.body.style.overflow = 'hidden';
        // Apply the exact width to compensate for the scrollbar removal
        document.body.style.paddingRight = `${scrollbarWidth}px`;

        const overlay = this.shadowRoot.querySelector('.overlay');
        const container = this.shadowRoot.querySelector('#qr-container');

        container.innerHTML = "";
        new QRCode(container, {
            text: overrideText || this.getAttribute('qr-text') || window.location.href,
            width: 180, height: 180,
            colorDark: themeColor,
            colorLight: "transparent",
            correctLevel: QRCode.CorrectLevel.H
        });

        overlay.classList.add('active');

        // Force focus into the modal immediately upon opening
        // Use a transitionend listener or a calculated delay
        overlay.addEventListener('transitionend', () => {
            requestAnimationFrame(() => {
                const first = this._getFocusableElements()[0];
                if (first) {
                    first.focus();
                }
            });
        }, { once: true });
    }

    close() {
        // --- Restore Scroll Management ---
        document.body.style.overflow = '';
        document.body.style.paddingRight = '';

        this.shadowRoot.querySelector('.overlay').classList.remove('active');
    }

    render() {
        this.shadowRoot.innerHTML = `
            <style>
                .overlay {
                    position: fixed; inset: 0; z-index: 9999;
                    display: flex; align-items: center; justify-content: center;
                    background: rgba(0,0,0,0.5); backdrop-filter: blur(8px);
                    opacity: 0; visibility: hidden; transition: opacity 0.3s ease, visibility 0.3s;
                }
                .overlay.active {
                    opacity: 1;
                    visibility: visible;
                }
                .box {
                    padding: 20px;
                    width: 90%;
                    max-width: 320px;
                    position: relative;
                    transform: scale(0.5);
                    transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                }
                .overlay.active .box {
                    transform: scale(1);
                }
                .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
                #modal-title { margin: 0; font-size: 1.25rem; }
                .close-icon { 
                    cursor: pointer; font-size: 24px; line-height: 1; 
                    border: none; background: none; color: inherit; padding: 4px;
                    width: 44px;
                    height: 44px;
                    transition: color 0.2s ease, transform 0.2s ease;
                    border-radius: 50%;
                    outline-offset: 2px;
                }
                .close-icon:hover, .close-icon:focus, .close-icon:focus-visible {
                    outline: 2px solid var(--modal-focus-color, #aaaaaa);
                }
                #qr-container { display: flex; justify-content: center; }
            </style>
            <div class="overlay" id="overlay">
            <div class="box">
                <div class="header">
                    <h3 id="modal-title">Share</h3>
                    <button class="close-icon" id="close-btn">&times;</button>
                </div>
                <div id="qr-container"></div>
            </div>
        </div>
        `;

        this.shadowRoot.querySelector('#overlay').addEventListener('click', (e) => {
            if (e.target.id === 'overlay') this.close();
        });

        this.shadowRoot.querySelector('#close-btn').addEventListener('click', () => this.close());
    }
}

customElements.define('qr-modal', QRModal);
// ==UserScript==
// @name         Force P2 Compact View
// @namespace    https://github.com/connorhipps/p2-compact-view
// @version      1.0.0
// @description  Automatically switches P2 sites to compact view mode for better readability
// @author       Connor Hipps
// @match        *://*.wordpress.com/*
// @match        *://*.wpcomstaging.com/*
// @match        *://*.wpengine.com/*
// @match        *://*.automattic.com/*
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_registerMenuCommand
// @run-at       document-end
// ==/UserScript==

(function() {
    'use strict';

    // Configuration
    const CONFIG = {
        STORAGE_KEY: 'p2_compact_view_enabled',
        SELECTORS: {
            VIEW_SELECTOR: '.p2020-view-selector',
            COMPACT_BUTTON: '.p2020-view-selector__mode-compact',
            EXPANDED_BUTTON: '.p2020-view-selector__mode-expanded',
            BODY: 'body'
        },
        CLASSES: {
            COMPACT_ACTIVE: 'is-p2020-compact-',
            BUTTON_ACTIVE: 'is-active'
        },
        DELAYS: {
            INITIAL_WAIT: 1000,
            RETRY_INTERVAL: 500,
            MAX_RETRIES: 10
        }
    };

    // Main class for P2 Compact View functionality
    class P2CompactView {
        constructor() {
            this.isEnabled = GM_getValue(CONFIG.STORAGE_KEY, true);
            this.retryCount = 0;
            this.init();
        }

        init() {
            this.setupMenuCommands();
            
            if (!this.isEnabled) {
                console.log('P2 Compact View: Disabled - expanded view preferred');
                return;
            }

            this.waitForElements();
        }

        setupMenuCommands() {
            // No menu commands - automatic functionality only
        }

        waitForElements() {
            setTimeout(() => {
                this.tryApplyViewPreference();
            }, CONFIG.DELAYS.INITIAL_WAIT);
        }

        tryApplyViewPreference() {
            const viewSelector = document.querySelector(CONFIG.SELECTORS.VIEW_SELECTOR);
            const compactButton = document.querySelector(CONFIG.SELECTORS.COMPACT_BUTTON);
            const expandedButton = document.querySelector(CONFIG.SELECTORS.EXPANDED_BUTTON);
            const body = document.querySelector(CONFIG.SELECTORS.BODY);

            if (viewSelector && compactButton && expandedButton && body) {
                console.log('P2 Compact View: Elements found, applying view preference');
                
                if (this.isEnabled) {
                    this.switchToCompactView();
                } else {
                    // Ensure expanded view is active if compact view is disabled
                    if (compactButton.classList.contains(CONFIG.CLASSES.BUTTON_ACTIVE)) {
                        console.log('P2 Compact View: Ensuring expanded view is active');
                        this.switchToExpandedViewTemporary();
                    }
                }
            } else if (this.retryCount < CONFIG.DELAYS.MAX_RETRIES) {
                this.retryCount++;
                console.log(`P2 Compact View: Elements not found, retrying (${this.retryCount}/${CONFIG.DELAYS.MAX_RETRIES})`);
                setTimeout(() => {
                    this.tryApplyViewPreference();
                }, CONFIG.DELAYS.RETRY_INTERVAL);
            } else {
                console.log('P2 Compact View: Max retries reached, elements not found');
            }
        }

        switchToCompactView() {
            const compactButton = document.querySelector(CONFIG.SELECTORS.COMPACT_BUTTON);
            const expandedButton = document.querySelector(CONFIG.SELECTORS.EXPANDED_BUTTON);
            const body = document.querySelector(CONFIG.SELECTORS.BODY);

            if (compactButton && !compactButton.classList.contains(CONFIG.CLASSES.BUTTON_ACTIVE)) {
                console.log('P2 Compact View: Switching to compact view');
                
                // Remove active class from expanded button
                if (expandedButton) {
                    expandedButton.classList.remove(CONFIG.CLASSES.BUTTON_ACTIVE);
                }

                // Add active class to compact button
                compactButton.classList.add(CONFIG.CLASSES.BUTTON_ACTIVE);

                // Add compact class to body
                if (body && !body.classList.contains(CONFIG.CLASSES.COMPACT_ACTIVE)) {
                    body.classList.add(CONFIG.CLASSES.COMPACT_ACTIVE);
                }

                // Trigger click event on compact button
                compactButton.click();

                // Dispatch custom event for other scripts
                document.dispatchEvent(new CustomEvent('p2CompactViewChanged', {
                    detail: { mode: 'compact' }
                }));
            }
        }

        switchToExpandedView() {
            const compactButton = document.querySelector(CONFIG.SELECTORS.COMPACT_BUTTON);
            const expandedButton = document.querySelector(CONFIG.SELECTORS.EXPANDED_BUTTON);
            const body = document.querySelector(CONFIG.SELECTORS.BODY);

            if (expandedButton && !expandedButton.classList.contains(CONFIG.CLASSES.BUTTON_ACTIVE)) {
                console.log('P2 Compact View: Switching to expanded view');
                
                // Remove active class from compact button
                if (compactButton) {
                    compactButton.classList.remove(CONFIG.CLASSES.BUTTON_ACTIVE);
                }

                // Add active class to expanded button
                expandedButton.classList.add(CONFIG.CLASSES.BUTTON_ACTIVE);

                // Remove compact class from body
                if (body && body.classList.contains(CONFIG.CLASSES.COMPACT_ACTIVE)) {
                    body.classList.remove(CONFIG.CLASSES.COMPACT_ACTIVE);
                }

                // Trigger click event on expanded button
                expandedButton.click();

                // Dispatch custom event for other scripts
                document.dispatchEvent(new CustomEvent('p2CompactViewChanged', {
                    detail: { mode: 'expanded' }
                }));

                // Store preference for expanded view and refresh page
                GM_setValue(CONFIG.STORAGE_KEY, false);
                this.isEnabled = false;
                
                // Show notification before refresh
                this.showNotification('Switching to expanded view and refreshing page...', 'P2 Compact View');
                
                // Refresh page after a short delay to ensure the view change is applied
                setTimeout(() => {
                    window.location.reload();
                }, 1000);
            }
        }

        switchToExpandedViewTemporary() {
            const compactButton = document.querySelector(CONFIG.SELECTORS.COMPACT_BUTTON);
            const expandedButton = document.querySelector(CONFIG.SELECTORS.EXPANDED_BUTTON);
            const body = document.querySelector(CONFIG.SELECTORS.BODY);

            if (expandedButton && !expandedButton.classList.contains(CONFIG.CLASSES.BUTTON_ACTIVE)) {
                console.log('P2 Compact View: Temporarily switching to expanded view');
                
                // Remove active class from compact button
                if (compactButton) {
                    compactButton.classList.remove(CONFIG.CLASSES.BUTTON_ACTIVE);
                }

                // Add active class to expanded button
                expandedButton.classList.add(CONFIG.CLASSES.BUTTON_ACTIVE);

                // Remove compact class from body
                if (body && body.classList.contains(CONFIG.CLASSES.COMPACT_ACTIVE)) {
                    body.classList.remove(CONFIG.CLASSES.COMPACT_ACTIVE);
                }

                // Trigger click event on expanded button
                expandedButton.click();

                // Dispatch custom event for other scripts
                document.dispatchEvent(new CustomEvent('p2CompactViewChanged', {
                    detail: { mode: 'expanded' }
                }));
            }
        }

        showNotification(text, title = 'P2 Compact View') {
            // Create a simple notification element
            const notification = document.createElement('div');
            notification.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: #007cba;
                color: white;
                padding: 12px 20px;
                border-radius: 4px;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                font-size: 14px;
                z-index: 999999;
                box-shadow: 0 2px 8px rgba(0,0,0,0.2);
                transition: opacity 0.3s ease;
            `;
            notification.textContent = text;
            
            document.body.appendChild(notification);
            
            // Remove notification after 3 seconds
            setTimeout(() => {
                notification.style.opacity = '0';
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.parentNode.removeChild(notification);
                    }
                }, 300);
            }, 3000);
        }

        // Public method to check if compact view is active
        isCompactViewActive() {
            const compactButton = document.querySelector(CONFIG.SELECTORS.COMPACT_BUTTON);
            return compactButton && compactButton.classList.contains(CONFIG.CLASSES.BUTTON_ACTIVE);
        }

        // Public method to get current view mode
        getCurrentViewMode() {
            return this.isCompactViewActive() ? 'compact' : 'expanded';
        }
    }

    // Initialize the script
    const p2CompactView = new P2CompactView();

    // Expose to global scope for debugging
    window.P2CompactView = p2CompactView;

    // Listen for URL changes (for SPA navigation)
    if (window.onurlchange === null) {
        window.addEventListener('urlchange', () => {
            console.log('P2 Compact View: URL changed, reinitializing');
            setTimeout(() => {
                p2CompactView.retryCount = 0;
                if (p2CompactView.isEnabled) {
                    p2CompactView.waitForElements();
                }
            }, 500);
        });
    }

    console.log('P2 Compact View: Script loaded successfully');
})(); 
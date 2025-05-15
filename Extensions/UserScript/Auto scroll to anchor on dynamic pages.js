// ==UserScript==
// @name         Auto scroll to anchor on dynamic pages
// @name:en      Auto scroll to anchor on dynamic pages
// @name:ru      Автоматическая прокрутка к якорю на динамических страницах
// @namespace    http://tampermonkey.net/
// @version      2025-05-15_6-50 // Не забывайте обновлять версию
// @description  Tries to scroll to an anchor on pages with dynamic content loading by repeatedly scrolling down. Handles hash changes.
// @description:en  Tries to scroll to an anchor on pages with dynamic content loading by repeatedly scrolling down. Handles hash changes.
// @description:ru  Пытается прокрутить до якоря на страницах с динамической загрузкой контента, многократно прокручивая вниз. Обрабатывает изменения хеша.
// @author       Igor Lebedev + (DeepSeek and Gemini Pro)
// @license        GPL-3.0-or-later
// @match        *://*/*
// @icon         data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgNDggNDgiIHZlcnNpb249IjEuMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48dGl0bGU+0JTQuNC9xpnbQuNC30LXRgNCw0Y8g0L/RgNC+0YDRgtC60Log0LrINC30L7RgNGN0YDPjwvdGl0bGU+PHN0eWxlPi5wYWdlIHsgZmlsbDogI2YwZjBmMDsgc3Ryb2tlOiAjMzMzOyBzdHJva2Utd2lkdGg6MjsgfSAuYW5jaG9yLXN5bWJvbCB7IGZpbGw6ICMzMzM7IGZvbnQtZmFtaWx5OiBzYW5zLXNlcmlmOyBmb250LXNpemU6IDE4cHg7IGZvbnQtd2VpZ2h0OiBib2xkOyB0ZXh0LWFuY2hvcjogbWlkZGxlOyB9IC5hcnJvdyB7IGZpbGw6IG5vbmU7IHN0cm9rZTogIzMzMzsgc3Ryb2tlLXdpZHRoOjM7IHN0cm9rZS1saW5lY2FwOnJvdW5kOyBzdHJva2UtbGluZWpvaW46cm91bmQ7IH08L3N0eWxlPjxyZWN0IGNsYXNzPSJwYWdlIiB4PSIyLjYyODgzNCIgeT0iMi41NDIzNDkxIiB3aWR0aD0iNDIuNzc3MDg4IiBoZWlnaHQ9IjQyLjc3NzA4OCIgcng9IjIuMzU1MzE1MyIgLz48dGV4dCBjbGFzcz0iYW5jaG9yLXN5bWJvbCIgeD0iMjQuMDAwMDAyIiB5PSIzOS4zMzMzMjgiIHN0eWxlPSJmaWxsOiM0ZjRmZGQ7ZmlsbC1vcGFjaXR5OjE7c3Ryb2tlOiMwMjAwNWE7c3Ryb2tlLW9wYWNpdHk6MSI+IzwvdGV4dD48cG9seWxpbmUgY2xhc3M9ImFycm93IiBwb2ludHM9IjMyLDE1IDMyLDM1IiB0cmFuc2Zvcm09Im1hdHJpeCgxLDAsMCwwLjY3MzA0MzQ4LC03Ljk5OTk5OTksLTEuMzk5NDIwMykiIHN0eWxlPSJzdHJva2U6I2YwYWUxMztzdHJva2Utb3BhY2l0eToxIiAvPjxwb2x5bGluZSBjbGFzcz0iYXJyb3ciIHBvaW50cz0iMjYsMjggMzIsMzUgMzgsMjgiIHN0eWxlPSJzdHJva2U6I2YwYWUxMztzdHJva2Utb3BhY2l0eToxIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgtNy45OTk5OTk5LC0xMy4xMDcwNikiIC8+PGxpbmUgeDE9IjEzLjEwNjY2NyIgeTE9IjguNTQ2NjY2MSIgeDI9IjM1LjEwNjY2MyIgeTI9IjguNTQ2NjY2MSIgc3Ryb2tlPSIjY2NjY2NjIiBzdHJva2Utd2lkdGg9IjIiIHN0eWxlPSJzdHJva2U6I2YwYWUxMztzdHJva2Utb3BhY2l0eToxIiAvPjwvc3ZnPg==
// @grant        none
// @run-at       document-start
// @updateURL    https://raw.githubusercontent.com/LebedevIV/Auto-scroll-to-anchor-on-dynamic-pages/main/Extensions/UserScript/Auto%20scroll%20to%20anchor%20on%20dynamic%20pages.js
// @downloadURL  https://raw.githubusercontent.com/LebedevIV/Auto-scroll-to-anchor-on-dynamic-pages/main/Extensions/UserScript/Auto%20scroll%20to%20anchor%20on%20dynamic%20pages.js
// ==/UserScript==

(function() {
    'use strict';

    // --- Определение среды выполнения ---
    let executionEnvironment = 'userscript'; // По умолчанию считаем, что это userscript
    let logPrefix = "[AutoScrollToAnchor]";    // Префикс для логов userscript

    try {
        if (typeof browser !== 'undefined' && browser.runtime && browser.runtime.id) {
            executionEnvironment = 'extension_firefox';
            logPrefix = "[AutoScrollExt FF]";
        } else if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id) {
            // Это может быть Chrome расширение или Firefox (где chrome является псевдонимом browser)
            // Для большей точности можно проверить chrome.runtime.getURL("").startsWith("moz-extension://") для Firefox
            if (chrome.runtime.getURL && chrome.runtime.getURL("").startsWith("moz-extension://")) {
                 executionEnvironment = 'extension_firefox';
                 logPrefix = "[AutoScrollExt FF]";
            } else {
                 executionEnvironment = 'extension_chrome_or_edge'; // или другое на базе Chromium
                 logPrefix = "[AutoScrollExt Cr]";
            }
        }
    } catch (e) {
        // Ошибка доступа к browser.runtime или chrome.runtime может возникнуть, если они не определены.
        // В этом случае остаемся со значением по умолчанию 'userscript'.
    }
    // ------------------------------------

    // Настройки (остаются общими)
    const MAX_ATTEMPTS = 30;
    const SCROLL_INTERVAL_MS = 750;
    const SCROLL_AMOUNT_PX = window.innerHeight * 0.8;
    const FAST_CHECK_DELAY_MS = 250;
    const INITIAL_DELAY_MS = 500;

    let currentIntervalId = null;
    let currentSearchAnchorName = '';

    // Используем определенный ранее logPrefix
    function log(message) {
        console.log(`${logPrefix} ${message}`);
    }
    if (executionEnvironment !== 'userscript') { // Для расширений можно добавить ID расширения, если нужно
      log(`Running as ${executionEnvironment}. Extension ID (if applicable): ${ (typeof browser !== 'undefined' && browser.runtime && browser.runtime.id) || (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id) || 'N/A'}`);
    } else {
      log(`Running as ${executionEnvironment}.`);
    }


    function stopCurrentSearch(reason = "generic stop") {
        if (currentIntervalId) {
            clearInterval(currentIntervalId);
            currentIntervalId = null;
            log(`Search for #${currentSearchAnchorName} stopped. Reason: ${reason}`);
        }
    }

    function findAndScrollToElement(anchorName) {
        const currentUrlAnchor = window.location.hash.substring(1);
        if (anchorName && currentUrlAnchor !== anchorName && currentUrlAnchor !== '') {
            log(`URL hash changed to #${currentUrlAnchor} while searching for #${anchorName}. Stopping this specific search.`);
            return false;
        }

        if (!anchorName) return false;

        const elementById = document.getElementById(anchorName);
        const elementByName = !elementById ? document.querySelector(`[name="${anchorName}"]`) : null;
        const targetElement = elementById || elementByName;

        if (targetElement) {
            log(`Anchor #${anchorName} found.`);
            targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });

            const originalBg = targetElement.style.backgroundColor;
            targetElement.style.backgroundColor = 'yellow';
            setTimeout(() => {
                targetElement.style.backgroundColor = originalBg;
            }, 2000);

            return true;
        }
        return false;
    }

    function startSearchingForAnchor(anchorNameToSearch) {
        stopCurrentSearch(`starting new search for #${anchorNameToSearch}`);

        if (!anchorNameToSearch) {
            log("No anchor specified in URL, nothing to do.");
            currentSearchAnchorName = '';
            return;
        }

        currentSearchAnchorName = anchorNameToSearch;
        log(`Starting search for anchor: #${currentSearchAnchorName}`);

        let attempts = 0;

        if (findAndScrollToElement(currentSearchAnchorName)) {
            stopCurrentSearch(`found #${currentSearchAnchorName} immediately`);
            return;
        }

        currentIntervalId = setInterval(() => {
            const currentUrlAnchorWhenIntervalFired = window.location.hash.substring(1);
            if (currentUrlAnchorWhenIntervalFired !== currentSearchAnchorName) {
                log(`URL hash changed to #${currentUrlAnchorWhenIntervalFired} (or removed) while actively searching for #${currentSearchAnchorName}. Stopping this search.`);
                stopCurrentSearch("URL hash changed during interval");
                return;
            }

            if (findAndScrollToElement(currentSearchAnchorName)) {
                stopCurrentSearch(`found #${currentSearchAnchorName} after scrolling`);
                return;
            }

            attempts++;
            if (attempts > MAX_ATTEMPTS) {
                console.warn(`${logPrefix} Anchor #${currentSearchAnchorName} not found after ${MAX_ATTEMPTS} attempts.`);
                stopCurrentSearch(`max attempts reached for #${currentSearchAnchorName}`);
                return;
            }

            log(`Attempt ${attempts}/${MAX_ATTEMPTS} for #${currentSearchAnchorName}: Scrolling down...`);
            window.scrollBy(0, SCROLL_AMOUNT_PX);

            setTimeout(() => {
                if (!currentIntervalId) return;

                const currentUrlAnchorForFastCheck = window.location.hash.substring(1);
                if (currentUrlAnchorForFastCheck !== currentSearchAnchorName) {
                    return;
                }

                if (findAndScrollToElement(currentSearchAnchorName)) {
                    stopCurrentSearch(`found #${currentSearchAnchorName} after scroll and fast check`);
                }
            }, FAST_CHECK_DELAY_MS);

        }, SCROLL_INTERVAL_MS);
    }

    function initialLoadOrHashChangeHandler() {
        const anchorNameFromUrl = window.location.hash.substring(1);
        if (anchorNameFromUrl === currentSearchAnchorName && currentIntervalId !== null) {
            return;
        }
        if (!anchorNameFromUrl && currentSearchAnchorName) {
            stopCurrentSearch(`anchor removed from URL (was #${currentSearchAnchorName})`);
            currentSearchAnchorName = '';
            return;
        }
        startSearchingForAnchor(anchorNameFromUrl);
    }

    function onPageReady() {
        setTimeout(initialLoadOrHashChangeHandler, INITIAL_DELAY_MS);
        window.addEventListener('hashchange', initialLoadOrHashChangeHandler, false);
    }

    // Код для запуска при загрузке страницы
    // Эта логика подходит для обоих случаев, так как @run-at document-start и
    // "run_at": "document_start" в manifest.json ведут себя схожим образом.
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', onPageReady, { once: true });
    } else {
        // DOMContentLoaded уже сработал, или мы находимся в состоянии interactive/complete
        onPageReady();
    }

})();

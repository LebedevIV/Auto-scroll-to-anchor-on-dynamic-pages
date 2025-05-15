// ==UserScript==
// @name         Auto scroll to anchor on dynamic pages
// @name:en      Auto scroll to anchor on dynamic pages
// @name:ru      Автоматическая прокрутка к якорю на динамических страницах
// @namespace    http://tampermonkey.net/
// @version      2025-05-15_15-5 // Не забывайте обновлять версию
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

    // --- Попытка сохранить исходный якорь ---
    let initialAnchorOnLoad = window.location.hash.substring(1);
    if (initialAnchorOnLoad) {
        log(`Initial anchor detected at document-start: #${initialAnchorOnLoad}`);
    }
    // --------------------------------------------

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

    // ... (функции log, stopCurrentSearch, findAndScrollToElement, startSearchingForAnchor) ...
    // Важно: findAndScrollToElement должна быть готова к тому, что currentUrlAnchor может быть пуст,
    // если сайт успел его удалить, но мы все еще ищем initialAnchorOnLoad.

    /**
     * Модифицированная findAndScrollToElement
     * @param {string} anchorNameToFind - Имя якоря для поиска.
     * @param {string} currentExpectedUrlAnchor - Якорь, который мы ОЖИДАЕМ сейчас в URL (может быть '' если сайт его удалил).
     * @returns {boolean}
     */
    function findAndScrollToElement(anchorNameToFind, currentExpectedUrlAnchor) {
        if (!anchorNameToFind) return false;

        // Проверка, не изменился ли ЦЕЛЕВОЙ якорь, к которому мы стремимся
        // (например, если пользователь кликнул на другой якорь уже после начала поиска)
        const actualCurrentUrlAnchor = window.location.hash.substring(1);
        if (actualCurrentUrlAnchor && actualCurrentUrlAnchor !== anchorNameToFind && actualCurrentUrlAnchor !== currentExpectedUrlAnchor) {
            log(`User navigated to a new anchor #${actualCurrentUrlAnchor} while searching for #${anchorNameToFind}. Stopping this search.`);
            return false; // Пользователь перешел на другой якорь, этот поиск неактуален
        }

        const elementById = document.getElementById(anchorNameToFind);
        const elementByName = !elementById ? document.querySelector(`[name="${anchorNameToFind}"]`) : null;
        const targetElement = elementById || elementByName;

        if (targetElement) {
            log(`Anchor #${anchorNameToFind} found.`);
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

    /**
     * Модифицированная startSearchingForAnchor
     * @param {string} anchorNameToSearch - Имя якоря для поиска.
     * @param {string} currentUrlAnchorAtStart - Якорь, который был в URL в момент инициации этого поиска
     */
    function startSearchingForAnchor(anchorNameToSearch, currentUrlAnchorAtStart) {
        stopCurrentSearch(`starting new search for #${anchorNameToSearch}`);

        if (!anchorNameToSearch) {
            log("No anchor specified for search, nothing to do.");
            currentSearchAnchorName = '';
            return;
        }

        currentSearchAnchorName = anchorNameToSearch; // Это якорь, который мы ИЩЕМ на странице
        log(`Starting search for anchor: #${currentSearchAnchorName} (URL hash was #${currentUrlAnchorAtStart || 'empty'} at initiation)`);

        let attempts = 0;

        if (findAndScrollToElement(currentSearchAnchorName, currentUrlAnchorAtStart)) {
            stopCurrentSearch(`found #${currentSearchAnchorName} immediately`);
            return;
        }

        currentIntervalId = setInterval(() => {
            // Важно: передаем currentUrlAnchorAtStart, чтобы findAndScrollToElement
            // знала, какой якорь мы ожидали в URL на момент начала поиска.
            if (findAndScrollToElement(currentSearchAnchorName, currentUrlAnchorAtStart)) {
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
                if (findAndScrollToElement(currentSearchAnchorName, currentUrlAnchorAtStart)) {
                    stopCurrentSearch(`found #${currentSearchAnchorName} after scroll and fast check`);
                }
            }, FAST_CHECK_DELAY_MS);
        }, SCROLL_INTERVAL_MS);
    }

    function initialLoadOrHashChangeHandler() {
        let anchorToActUpon = window.location.hash.substring(1);
        let currentUrlAnchorForContext = anchorToActUpon; // Якорь, который СЕЙЧАС в URL

        if (!anchorToActUpon && initialAnchorOnLoad) {
            // Если в URL якоря нет, НО он был при самой первой загрузке
            log(`URL hash is empty, but an initial anchor #${initialAnchorOnLoad} was detected. Attempting to use it.`);
            anchorToActUpon = initialAnchorOnLoad;
            // currentUrlAnchorForContext остается пустым, так как сайт его удалил
        }

        // Сброс initialAnchorOnLoad после первой попытки его использовать,
        // чтобы при последующих hashchange (если пользователь кликает по другим якорям на странице)
        // мы не пытались вернуться к самому первому якорю.
        // Но делаем это только если мы действительно собираемся действовать (т.е. anchorToActUpon не пуст)
        if (anchorToActUpon) {
            initialAnchorOnLoad = null; // Используем его только один раз
        }


        // Это условие для предотвращения перезапуска, если хеш не изменился, немного усложняется.
        // Мы должны сравнивать anchorToActUpon с тем, что мы активно ищем (currentSearchAnchorName).
        if (anchorToActUpon === currentSearchAnchorName && currentIntervalId !== null) {
             // Если мы уже ищем этот якорь (или пытались искать), и поиск активен, ничего не делаем.
            return;
        }

        if (!anchorToActUpon && currentSearchAnchorName) {
            stopCurrentSearch(`Anchor removed or no longer relevant (was #${currentSearchAnchorName})`);
            currentSearchAnchorName = '';
            return;
        }

        // Запускаем поиск, передавая якорь, который нужно найти,
        // и якорь, который был в URL в момент принятия решения о поиске.
        startSearchingForAnchor(anchorToActUpon, currentUrlAnchorForContext);
    }

    function onPageReady() {
        // initialAnchorOnLoad уже должен быть установлен здесь
        log(`onPageReady. Initial anchor was: #${initialAnchorOnLoad || 'none'}. Current hash: #${window.location.hash.substring(1) || 'none'}`);
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

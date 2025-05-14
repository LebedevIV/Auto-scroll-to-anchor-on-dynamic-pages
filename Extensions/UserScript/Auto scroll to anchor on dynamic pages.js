// ==UserScript==
// @name         Auto scroll to anchor on dynamic pages
// @name:en      Auto scroll to anchor on dynamic pages
// @name:ru      Автоматическая прокрутка к якорю на динамических страницах
// @namespace    http://tampermonkey.net/
// @version      2025-05-14
// @description  Tries to scroll to an anchor on pages with dynamic content loading by repeatedly scrolling down. Handles hash changes.
// @description:en  Tries to scroll to an anchor on pages with dynamic content loading by repeatedly scrolling down. Handles hash changes.
// @description:ru  Пытается прокрутить до якоря на страницах с динамической загрузкой контента, многократно прокручивая вниз. Обрабатывает изменения хеша.
// @author       Igor Lebedev + (DeepSeek and Gemini Pro)
// @license        GPL-3.0-or-later
// @match        *://*/* 
// @icon         data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgNDggNDgiIHdpZHRoPSIzNiIgaGVpZ2h0PSIzNiIgdmVyc2lvbj0iMS4xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjx0aXRsZT7QlNC40L3FtYW3QuNC30LXRgNCw0Y8g0L/RgNC+0YDRgtC60Log0LrINC30L7RgNGN0YDPjwvdGl0bGU+PHN0eWxlPi5wYWdlIHsgZmlsbDogI2YwZjBmMDsgc3Ryb2tlOiAjMzMzOyBzdHJva2Utd2lkdGg6MjsgfSAuYW5jaG9yLXN5bWJvbCB7IGZpbGw6ICMzMzM7IGZvbnQtZmFtaWx5OiBzYW5zLXNlcmlmOyBmb250LXNpemU6IDE4cHg7IGZvbnQtd2VpZ2h0OiBib2xkOyB0ZXh0LWFuY2hvcjogbWlkZGxlOyB9IC5hcnJvdyB7IGZpbGw6IG5vbmU7IHN0cm9rZTogIzMzMzsgc3Ryb2tlLXdpZHRoOjM7IHN0cm9rZS1saW5lY2FwOnJvdW5kOyBzdHJva2UtbGluZWpvaW46cm91bmQ7IH08L3N0eWxlPjxyZWN0IGNsYXNzPSJwYWdlIiB4PSIyLjYyODgzNCIgeT0iMi41NDIzNDkxIiB3aWR0aD0iNDIuNzc3MDg4IiBoZWlnaHQ9IjQyLjc3NzA4OCIgcng9IjIuMzU1MzE1MyIvPjx0ZXh0IGNsYXNzPSJhbmNob3Itc3ltYm9sIiB4PSIyNC4wMDAwMDIiIHk9IjM5LjMzMzMyOCIgc3R5bGU9ImZpbGw6IzRmNGZkZDlmaWxsLW9wYWNpdHk6MTtzdHJva2U6IzAyMDA1YTtzdHJva2Utb3BhY2l0eToxIj4jPC90ZXh0Pjxwb2x5bGluZSBjbGFzcz0iYXJyb3ciIHBvaW50cz0iMzIsMTUgMzIsMzUiIHRyYW5zZm9ybT0ibWF0cml4KDEsMCwwLDAuNjczMDQzNDgsLTcuOTk5OTk5OSwtMS4zOTk0MjAzKSIgc3R5bGU9InN0cm9rZTojZjBhZTEzO3N0cm9rZS1vcGFjaXR5OjEiLz48cG9seWxpbmUgY2xhc3M9ImFycm93IiBwb2ludHM9IjI2LDI4IDMyLDM1IDM4LDI4IiBzdHlsZT0ic3Ryb2tlOiNmMGFlMTM7c3Ryb2tlLW9wYWNpdHk6MSIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoLTcuOTk5OTk5OSwtMTMuMTA3MDYpIi8+PGxpbmUgeDE9IjEzLjEwNjY2NyIgeTE9IjguNTQ2NjY2MSIgeDI9IjM1LjEwNjY2MyIgeTI9IjguNTQ2NjY2MSIgc3Ryb2tlPSIjY2NjY2NjIiBzdHJva2Utd2lkdGg9IjIiIHN0eWxlPSJzdHJva2U6I2YwYWUxMztzdHJva2Utb3BhY2l0eToxIi8+PC9zdmc+
// @grant        none
// @run-at       document-start // Запускаем раньше, чтобы успеть повесить слушатели событий
// @updateURL    https://raw.githubusercontent.com/LebedevIV/Auto-scroll-to-anchor-on-dynamic-pages/main/Extensions/UserScript/Auto%20scroll%20to%20anchor%20on%20dynamic%20pages.js
// @downloadURL  https://raw.githubusercontent.com/LebedevIV/Auto-scroll-to-anchor-on-dynamic-pages/main/Extensions/UserScript/Auto%20scroll%20to%20anchor%20on%20dynamic%20pages.js
// ==/UserScript==

(function() {
    'use strict';

    // Настройки
    const MAX_ATTEMPTS = 30;                  // Максимальное количество попыток прокрутки
    const SCROLL_INTERVAL_MS = 750;           // Интервал между попытками в миллисекундах
    const SCROLL_AMOUNT_PX = window.innerHeight * 0.8; // На сколько прокручивать за раз (80% высоты окна)
    const FAST_CHECK_DELAY_MS = 250;          // Задержка для быстрой проверки после скролла
    const INITIAL_DELAY_MS = 500;             // Начальная задержка перед первым запуском

    let currentIntervalId = null;             // ID текущего интервала прокрутки
    let currentSearchAnchorName = '';         // Имя якоря, который активно ищется

    function log(message) {
        console.log(`[AutoScrollToAnchor] ${message}`);
    }

    /**
     * Останавливает текущий активный поиск якоря.
     * @param {string} reason - Причина остановки для логирования.
     */
    function stopCurrentSearch(reason = "generic stop") {
        if (currentIntervalId) {
            clearInterval(currentIntervalId);
            currentIntervalId = null;
            log(`Search for #${currentSearchAnchorName} stopped. Reason: ${reason}`);
        }
        // Сбрасываем имя искомого якоря, только если причина не в том, что он был найден
        // (чтобы подсветка могла использовать правильное имя)
        // Однако, для чистоты лучше всегда сбрасывать, а для подсветки передавать имя якоря отдельно.
        // currentSearchAnchorName = ''; // Решим ниже, когда сбрасывать
    }

    /**
     * Пытается найти элемент якоря и прокрутить к нему.
     * @param {string} anchorName - Имя якоря для поиска.
     * @returns {boolean} - True, если элемент найден и прокрутка выполнена, иначе false.
     */
    function findAndScrollToElement(anchorName) {
        // Если URL хеш изменился, пока мы искали этот anchorName, значит этот поиск уже не актуален.
        const currentUrlAnchor = window.location.hash.substring(1);
        if (anchorName && currentUrlAnchor !== anchorName && currentUrlAnchor !== '') {
            log(`URL hash changed to #${currentUrlAnchor} while searching for #${anchorName}. Stopping this specific search.`);
            // Не останавливаем глобальный поиск здесь, это сделает обработчик hashchange
            return false; // Этот конкретный элемент искать больше не нужно
        }

        if (!anchorName) return false; // Нет якоря для поиска

        const elementById = document.getElementById(anchorName);
        const elementByName = !elementById ? document.querySelector(`[name="${anchorName}"]`) : null;
        const targetElement = elementById || elementByName;

        if (targetElement) {
            log(`Anchor #${anchorName} found.`);
            targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });

            // Опциональная подсветка
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
     * Запускает процесс поиска и прокрутки к указанному якорю.
     * @param {string} anchorNameToSearch - Имя якоря для поиска.
     */
    function startSearchingForAnchor(anchorNameToSearch) {
        stopCurrentSearch(`starting new search for #${anchorNameToSearch}`); // Останавливаем любой предыдущий поиск

        if (!anchorNameToSearch) {
            log("No anchor specified in URL, nothing to do.");
            currentSearchAnchorName = ''; // Убедимся, что нет "зависшего" имени
            return;
        }

        currentSearchAnchorName = anchorNameToSearch; // Устанавливаем новый искомый якорь
        log(`Starting search for anchor: #${currentSearchAnchorName}`);

        let attempts = 0;

        // Попытка найти сразу
        if (findAndScrollToElement(currentSearchAnchorName)) {
            stopCurrentSearch(`found #${currentSearchAnchorName} immediately`);
            // currentSearchAnchorName = ''; // Сбрасываем после успеха
            return;
        }

        currentIntervalId = setInterval(() => {
            const currentUrlAnchorWhenIntervalFired = window.location.hash.substring(1);
            // Если хеш в URL изменился или был удален, пока работал интервал,
            // и он не соответствует тому, что мы ищем, останавливаем этот поиск.
            if (currentUrlAnchorWhenIntervalFired !== currentSearchAnchorName) {
                log(`URL hash changed to #${currentUrlAnchorWhenIntervalFired} (or removed) while actively searching for #${currentSearchAnchorName}. Stopping this search.`);
                stopCurrentSearch("URL hash changed during interval");
                // Новый поиск, если он нужен, будет инициирован событием hashchange
                return;
            }

            if (findAndScrollToElement(currentSearchAnchorName)) {
                stopCurrentSearch(`found #${currentSearchAnchorName} after scrolling`);
                // currentSearchAnchorName = ''; // Сбрасываем после успеха
                return;
            }

            attempts++;
            if (attempts > MAX_ATTEMPTS) {
                console.warn(`[AutoScrollToAnchor] Anchor #${currentSearchAnchorName} not found after ${MAX_ATTEMPTS} attempts.`);
                stopCurrentSearch(`max attempts reached for #${currentSearchAnchorName}`);
                // currentSearchAnchorName = ''; // Сбрасываем после неудачи
                return;
            }

            log(`Attempt ${attempts}/${MAX_ATTEMPTS} for #${currentSearchAnchorName}: Scrolling down...`);
            window.scrollBy(0, SCROLL_AMOUNT_PX);

            // Короткая проверка почти сразу после прокрутки
            setTimeout(() => {
                if (!currentIntervalId) return; // Поиск мог быть остановлен

                const currentUrlAnchorForFastCheck = window.location.hash.substring(1);
                if (currentUrlAnchorForFastCheck !== currentSearchAnchorName) {
                     // Если хеш изменился за время этой короткой задержки
                    return;
                }

                if (findAndScrollToElement(currentSearchAnchorName)) {
                    stopCurrentSearch(`found #${currentSearchAnchorName} after scroll and fast check`);
                    // currentSearchAnchorName = ''; // Сбрасываем после успеха
                }
            }, FAST_CHECK_DELAY_MS);

        }, SCROLL_INTERVAL_MS);
    }

    /**
     * Обработчик для первоначальной загрузки и изменения хеша URL.
     */
    function initialLoadOrHashChangeHandler() {
        const anchorNameFromUrl = window.location.hash.substring(1);

        // Если якорь в URL тот же, что и текущий искомый, и поиск уже активен, ничего не делаем.
        // Это предотвращает лишние перезапуски, если hashchange сработало, но якорь не изменился.
        if (anchorNameFromUrl === currentSearchAnchorName && currentIntervalId !== null) {
            // log(`Hash event for the same active anchor #${anchorNameFromUrl}. No action needed.`);
            return;
        }

        // Если в URL нет якоря, но какой-то поиск был активен, останавливаем его.
        if (!anchorNameFromUrl && currentSearchAnchorName) { // currentSearchAnchorName проверяем, чтобы не логировать без надобности
            stopCurrentSearch(`anchor removed from URL (was #${currentSearchAnchorName})`);
            currentSearchAnchorName = ''; // Явно сбрасываем
            return;
        }

        // Во всех остальных случаях (новый якорь, или тот же якорь, но поиск неактивен, или якоря нет и не было)
        // запускаем/перезапускаем поиск (startSearchingForAnchor сама обработает пустой anchorNameFromUrl)
        startSearchingForAnchor(anchorNameFromUrl);
    }

    // Устанавливаем слушателей
    // Используем setTimeout для initialLoadOrHashChangeHandler, чтобы дать странице "успокоиться"
    // даже если DOM готов или страница полностью загружена.

    function onPageReady() {
        setTimeout(initialLoadOrHashChangeHandler, INITIAL_DELAY_MS);
        window.addEventListener('hashchange', initialLoadOrHashChangeHandler, false);
    }

    if (document.readyState === 'complete' || (document.readyState !== 'loading' && !document.documentElement.doScroll)) {
        // DOM уже готов или страница загружена
        onPageReady();
    } else {
        // Дожидаемся полной загрузки DOM
        document.addEventListener('DOMContentLoaded', onPageReady, { once: true });
    }

})();

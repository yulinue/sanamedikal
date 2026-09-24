document.addEventListener('DOMContentLoaded', function () {
    initSelects();
    initMobileMenu();
    initSearch();
    initRequestModal();
    initTabs();
    initRequestFormValidation();
    initHeroSlider();
    initSliders();
    initFooterAccordion();
    initFixedHeader();
    initDocsFilter();
    initNewsFilter();
    initDocsPagination();
    initCatalogSearch();
    initProGate();
    initFilterCategories();
    initFilterGroups();
    initRangeSliders();
    initCatalogQuickSearch();
    initCatalogFiltersModal();
    initCustomScrollbars();
    initCartPanel();
});

/* ========================
   ГОРИЗОНТАЛЬНЫЕ ЛЕНТЫ
======================== */
function initSliders() {
    document.querySelectorAll('[data-slider]').forEach(function (root) {
        var track = root.querySelector('[data-slider-track]');
        var prev = root.querySelector('[data-slider-prev]');
        var next = root.querySelector('[data-slider-next]');

        if (!track || !prev || !next) {
            return;
        }

        function getStep() {
            var item = track.querySelector('.slider__item');
            var gap = parseFloat(getComputedStyle(track).columnGap) || 0;
            return item ? item.getBoundingClientRect().width + gap : track.clientWidth;
        }

        function updateButtons() {
            var maxScroll = track.scrollWidth - track.clientWidth;
            prev.disabled = track.scrollLeft <= 1;
            next.disabled = track.scrollLeft >= maxScroll - 1;

            var nav = prev.closest('.slider-nav');
            if (nav) {
                nav.classList.toggle('is-hidden', prev.disabled && next.disabled);
            }
        }

        prev.addEventListener('click', function () {
            track.scrollBy({ left: -getStep(), behavior: 'smooth' });
        });

        next.addEventListener('click', function () {
            track.scrollBy({ left: getStep(), behavior: 'smooth' });
        });

        track.addEventListener('scroll', updateButtons, { passive: true });
        // ширина карточек анимируется глобальным transition: all — пересчитываем и сразу, и после его окончания
        var resizeTimer = null;
        window.addEventListener('resize', function () {
            updateButtons();
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(updateButtons, 300);
        });
        updateButtons();
    });
}

function initSelects() {
    var selects = document.querySelectorAll('.select');

    selects.forEach(function (select) {
        var selected = select.querySelector('.select__selected');
        var dropdown = select.querySelector('.select__dropdown');
        var valueEl = select.querySelector('.select__value');
        var options = select.querySelectorAll('.select__option');

        if (!selected || !dropdown) {
            return;
        }

        var initialSelected = select.querySelector('.select__option.is-selected') || options[0];
        if (initialSelected && valueEl) {
            valueEl.textContent = initialSelected.textContent.trim();
            initialSelected.classList.add('is-selected');
            initialSelected.setAttribute('aria-selected', 'true');
        }

        selected.addEventListener('click', function () {
            toggleSelect(select);
        });

        selected.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggleSelect(select);
            }
            if (e.key === 'Escape') {
                closeSelect(select);
            }
        });

        options.forEach(function (option) {
            option.addEventListener('click', function () {
                selectOption(select, option, valueEl, options);
            });
        });

        select.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') {
                closeSelect(select);
                selected.focus();
            }
        });
    });

    document.addEventListener('click', function (e) {
        selects.forEach(function (select) {
            if (!select.contains(e.target)) {
                closeSelect(select);
            }
        });
    });
}

function toggleSelect(select) {
    var isOpen = select.classList.contains('is-open');

    document.querySelectorAll('.select.is-open').forEach(function (openSelect) {
        if (openSelect !== select) {
            closeSelect(openSelect);
        }
    });

    if (isOpen) {
        closeSelect(select);
    } else {
        openSelect(select);
    }
}

function openSelect(select) {
    var selected = select.querySelector('.select__selected');
    var dropdown = select.querySelector('.select__dropdown');

    select.classList.add('is-open');
    dropdown.classList.add('is-open');
    selected.setAttribute('aria-expanded', 'true');
}

function closeSelect(select) {
    var selected = select.querySelector('.select__selected');
    var dropdown = select.querySelector('.select__dropdown');

    select.classList.remove('is-open');
    dropdown.classList.remove('is-open');
    selected.setAttribute('aria-expanded', 'false');
}

function selectOption(select, option, valueEl, options) {
    options.forEach(function (opt) {
        opt.classList.remove('is-selected');
        opt.setAttribute('aria-selected', 'false');
    });

    option.classList.add('is-selected');
    option.setAttribute('aria-selected', 'true');

    if (valueEl) {
        valueEl.textContent = option.textContent.trim();
    }

    select.dispatchEvent(new CustomEvent('select:change', {
        detail: {
            value: option.dataset.value,
            text: option.textContent.trim()
        }
    }));

    closeSelect(select);
}

/* ========================
   МОБИЛЬНОЕ МЕНЮ
======================== */
var scrollLockY = 0;

function initMobileMenu() {
    var burgerBtn = document.getElementById('burger-btn');
    var closeBtn = document.getElementById('mobile-menu-close');
    var overlay = document.getElementById('mobile-menu-overlay');
    var menu = document.getElementById('mobile-menu');

    if (!burgerBtn || !menu || !overlay) {
        return;
    }

    burgerBtn.addEventListener('click', function () {
        if (menu.classList.contains('is-open')) {
            closeMobileMenu(menu, overlay, burgerBtn);
        } else {
            closeSearchIfOpen();
            closeRequestModalIfOpen();
            closeCartIfOpen();
            openMobileMenu(menu, overlay, burgerBtn);
        }
    });

    if (closeBtn) {
        closeBtn.addEventListener('click', function () {
            closeMobileMenu(menu, overlay, burgerBtn);
        });
    }

    overlay.addEventListener('click', function () {
        closeMobileMenu(menu, overlay, burgerBtn);
    });

    document.addEventListener('click', function (e) {
        if (!menu.classList.contains('is-open')) {
            return;
        }
        if (menu.contains(e.target) || burgerBtn.contains(e.target)) {
            return;
        }
        closeMobileMenu(menu, overlay, burgerBtn);
    });

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && menu.classList.contains('is-open')) {
            closeMobileMenu(menu, overlay, burgerBtn);
        }
    });

    menu.querySelectorAll('.mobile-menu__link').forEach(function (link) {
        link.addEventListener('click', function () {
            closeMobileMenu(menu, overlay, burgerBtn);
        });
    });

    window.addEventListener('resize', function () {
        if (window.innerWidth > 1390 && menu.classList.contains('is-open')) {
            closeMobileMenu(menu, overlay, burgerBtn);
        }
    });
}

function openMobileMenu(menu, overlay, burgerBtn) {
    lockBodyScroll();
    menu.classList.add('is-open');
    overlay.dataset.for = 'menu';
    overlay.classList.add('is-open');
    burgerBtn.classList.add('is-open');
    burgerBtn.setAttribute('aria-expanded', 'true');
    burgerBtn.setAttribute('aria-label', 'Закрыть меню');
}

function closeMobileMenu(menu, overlay, burgerBtn) {
    menu.classList.remove('is-open');
    overlay.classList.remove('is-open');
    burgerBtn.classList.remove('is-open');
    burgerBtn.setAttribute('aria-expanded', 'false');
    burgerBtn.setAttribute('aria-label', 'Открыть меню');
    unlockBodyScroll();
}

function updateScrollbarWidthVar() {
    var scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    document.documentElement.style.setProperty('--scrollbar-width', scrollbarWidth + 'px');
}

var SCROLL_UNLOCK_DELAY = 200;
var unlockBodyScrollTimeout = null;

function lockBodyScroll() {
    if (unlockBodyScrollTimeout !== null) {
        clearTimeout(unlockBodyScrollTimeout);
        unlockBodyScrollTimeout = null;
        return;
    }

    updateScrollbarWidthVar();
    scrollLockY = window.scrollY || window.pageYOffset;
    document.body.style.position = 'fixed';
    document.body.style.top = '-' + scrollLockY + 'px';
    document.body.style.left = '0';
    document.body.style.right = '0';
    document.body.classList.add('is-locked');
}

function unlockBodyScroll() {
    if (unlockBodyScrollTimeout !== null) {
        clearTimeout(unlockBodyScrollTimeout);
    }

    var lockedScrollY = scrollLockY;

    unlockBodyScrollTimeout = setTimeout(function () {
        unlockBodyScrollTimeout = null;
        document.body.classList.remove('is-locked');
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.left = '';
        document.body.style.right = '';
        restoreScrollInstantly(lockedScrollY);
    }, SCROLL_UNLOCK_DELAY);
}

/* html { scroll-behavior: smooth } превратил бы возврат в плавную прокрутку из начала страницы */
function restoreScrollInstantly(y) {
    var root = document.documentElement;
    var prev = root.style.scrollBehavior;

    root.style.scrollBehavior = 'auto';
    window.scrollTo(0, y);
    root.style.scrollBehavior = prev;
}

function closeSearchIfOpen() {
    var searchBar = document.getElementById('search-bar');
    var overlay = document.getElementById('mobile-menu-overlay');
    var dropdown = document.getElementById('search-dropdown');
    var searchBtn = document.getElementById('search-btn');

    if (searchBar && searchBar.classList.contains('is-open')) {
        closeSearch(searchBar, overlay, dropdown, searchBtn);
    }
}

/* ========================
   ПОИСК
======================== */
var searchMockResults = [
    'Нейромониторинговые расходники',
    'Нейропротекционные инфузионные системы',
    'Нейростимуляционные материалы',
    'Расходники для эндоскопии',
    'Хирургические инструменты',
    'Диагностическое оборудование',
    'Перевязочные материалы',
    'Средства индивидуальной защиты'
];

function initSearch() {
    var searchBtn = document.getElementById('search-btn');
    var searchBar = document.getElementById('search-bar');
    var overlay = document.getElementById('mobile-menu-overlay');
    var dropdown = document.getElementById('search-dropdown');
    var resultsList = document.getElementById('search-results');
    var input = document.getElementById('search-input');
    var clearBtn = document.getElementById('search-clear');
    var submitLink = document.getElementById('search-submit');
    var bar = searchBar.querySelector('.search__bar');
    var clearResultsTimeout = null;

    if (!searchBtn || !searchBar) {
        return;
    }

    searchBtn.addEventListener('click', function () {
        if (searchBar.classList.contains('is-open')) {
            closeSearch(searchBar, overlay, dropdown, searchBtn);
        } else {
            closeMobileMenuIfOpen();
            closeRequestModalIfOpen();
            closeCartIfOpen();
            openSearch(searchBar, overlay, searchBtn, input);
        }
    });

    overlay.addEventListener('click', function () {
        closeSearch(searchBar, overlay, dropdown, searchBtn);
    });

    document.addEventListener('click', function (e) {
        if (!searchBar.classList.contains('is-open')) {
            return;
        }
        if (searchBar.contains(e.target) || searchBtn.contains(e.target)) {
            return;
        }
        closeSearch(searchBar, overlay, dropdown, searchBtn);
    });

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && searchBar.classList.contains('is-open')) {
            closeSearch(searchBar, overlay, dropdown, searchBtn);
        }
    });

    window.addEventListener('resize', function () {
        if (searchBar.classList.contains('is-open')) {
            positionSearchBar(searchBar, searchBtn);
        }
    });

    input.addEventListener('input', function () {
        var query = input.value.trim();
        submitLink.href = query ? ('/search/?q=' + encodeURIComponent(query)) : '/search/';
        bar.classList.toggle('has-value', !!query);

        if (!query) {
            dropdown.classList.remove('is-open');
            clearResultsTimeout = window.setTimeout(function () {
                resultsList.innerHTML = '';
            }, 300);
            return;
        }

        window.clearTimeout(clearResultsTimeout);
        renderSearchResults(resultsList, filterSearchResults(query));
        dropdown.classList.add('is-open');
    });

    clearBtn.addEventListener('click', function () {
        dropdown.classList.remove('is-open');

        clearResultsTimeout = window.setTimeout(function () {
            resultsList.innerHTML = '';
        }, 300);

        input.value = '';
        bar.classList.remove('has-value');
        submitLink.href = '/search/';
        input.focus();
    });
}

function closeMobileMenuIfOpen() {
    var menu = document.getElementById('mobile-menu');
    var overlay = document.getElementById('mobile-menu-overlay');
    var burgerBtn = document.getElementById('burger-btn');

    if (menu && menu.classList.contains('is-open')) {
        closeMobileMenu(menu, overlay, burgerBtn);
    }
}

function filterSearchResults(query) {
    var q = query.toLowerCase();

    return searchMockResults.filter(function (item) {
        return item.toLowerCase().indexOf(q) !== -1;
    });
}

function renderSearchResults(resultsList, items) {
    resultsList.innerHTML = '';

    if (!items.length) {
        var empty = document.createElement('li');
        empty.className = 'search__empty';
        empty.textContent = 'Ничего не найдено';
        resultsList.appendChild(empty);
        return;
    }

    items.forEach(function (text) {
        var li = document.createElement('li');
        li.innerHTML =
            '<a href="#" class="select__option search__result">' +
                '<span class="search__result-icon">' +
                    '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">' +
                        '<path d="M5.94141 13.28L10.2881 8.9333C10.8014 8.41997 10.8014 7.57997 10.2881 7.06664L5.94141 2.71997" stroke="#222E59" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round" />' +
                    '</svg>' +
                '</span>' +
                '<span class="search__result-text">' + text + '</span>' +
            '</a>';
        resultsList.appendChild(li);
    });
}

function positionSearchBar(searchBar, searchBtn) {
    var btnRect = searchBtn.getBoundingClientRect();
    var left, width;

    if (window.innerWidth <= 991) {
        var containerEl = document.querySelector('.header .container');
        var containerRect = containerEl.getBoundingClientRect();
        var containerStyle = getComputedStyle(containerEl);
        var paddingLeft = parseFloat(containerStyle.paddingLeft) || 0;
        var paddingRight = parseFloat(containerStyle.paddingRight) || 0;
        left = containerRect.left + paddingLeft;
        width = containerRect.width - paddingLeft - paddingRight;
    } else {
        var logoEl = document.querySelector('.header__logo-container');
        var logoRect = logoEl.getBoundingClientRect();
        var logoMarginRight = parseFloat(getComputedStyle(logoEl).marginRight) || 0;
        left = logoRect.right + logoMarginRight;
        width = btnRect.right - left;
    }

    searchBar.style.left = left + 'px';
    searchBar.style.width = width + 'px';
    searchBar.style.top = (btnRect.top + btnRect.height / 2 - searchBar.offsetHeight / 2) + 'px';
}

function openSearch(searchBar, overlay, searchBtn, input) {
    lockBodyScroll();
    positionSearchBar(searchBar, searchBtn);
    searchBar.classList.add('is-open');
    overlay.dataset.for = 'search';
    overlay.classList.add('is-open');
    searchBtn.setAttribute('aria-expanded', 'true');
    input.focus();
}

function closeSearch(searchBar, overlay, dropdown, searchBtn) {
    if (!searchBar.classList.contains('is-open')) {
        return;
    }

    var bar = searchBar.querySelector('.search__bar');
    var input = searchBar.querySelector('.search__input');
    var submitLink = searchBar.querySelector('.search__submit');
    var resultsList = dropdown.querySelector('.search__results');

    searchBar.classList.remove('is-open');
    dropdown.classList.remove('is-open');
    overlay.classList.remove('is-open');
    searchBtn.setAttribute('aria-expanded', 'false');
    unlockBodyScroll();

    input.value = '';
    bar.classList.remove('has-value');
    submitLink.href = '/search/';
    resultsList.innerHTML = '';
}

/* ========================
   МОДАЛКА «ОСТАВИТЬ ЗАЯВКУ»
======================== */
function initRequestModal() {
    var modal = document.getElementById('request-modal');
    var overlay = document.getElementById('mobile-menu-overlay');
    var openBtns = document.querySelectorAll('.js-request-btn');
    var closeBtns = modal ? modal.querySelectorAll('.js-close-request-modal') : [];

    if (!modal || !openBtns.length) {
        return;
    }

    openBtns.forEach(function (btn) {
        btn.addEventListener('click', function () {
            closeMobileMenuIfOpen();
            closeSearchIfOpen();
            closeCartIfOpen();
            openRequestModal(modal, overlay);
            setRequestModalTab(modal, btn.dataset.requestTab || 'question');
        });
    });

    closeBtns.forEach(function (btn) {
        btn.addEventListener('click', function () {
            closeRequestModal(modal, overlay);
        });
    });

    overlay.addEventListener('click', function () {
        closeRequestModal(modal, overlay);
    });

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && modal.classList.contains('is-open')) {
            closeRequestModal(modal, overlay);
        }
    });
}

function setRequestModalTab(modal, tabName) {
    var group = modal.querySelector('.tabs');

    if (!group) {
        return;
    }

    group.querySelectorAll('.tabs__item').forEach(function (item) {
        var isActive = item.dataset.tab === tabName;
        item.classList.toggle('is-active', isActive);
        item.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });

    showTabPanel(group, tabName);
}

function openRequestModal(modal, overlay) {
    lockBodyScroll();
    modal.classList.add('is-open');
    overlay.dataset.for = 'request';
    overlay.classList.add('is-open');
}

function closeRequestModal(modal, overlay) {
    if (!modal.classList.contains('is-open')) {
        return;
    }

    modal.classList.remove('is-open');
    overlay.classList.remove('is-open');
    unlockBodyScroll();
    resetRequestForm(modal);
}

function resetRequestForm(modal) {
    resetForm(modal.querySelector('#request-form'));
}

function resetForm(form) {
    if (!form) {
        return;
    }

    form.reset();

    form.querySelectorAll('.field.is-error').forEach(function (field) {
        field.classList.remove('is-error');
        restoreFieldLabel(field);
    });

    var checkboxRow = form.querySelector('.checkbox-row.is-error');
    if (checkboxRow) {
        checkboxRow.classList.remove('is-error');
    }
}

function closeRequestModalIfOpen() {
    var modal = document.getElementById('request-modal');
    var overlay = document.getElementById('mobile-menu-overlay');

    if (modal && modal.classList.contains('is-open')) {
        closeRequestModal(modal, overlay);
    }
}

/* ========================
   ТАБЫ
======================== */
function initTabs() {
    var groups = document.querySelectorAll('.tabs');

    groups.forEach(function (group) {
        var items = group.querySelectorAll('.tabs__item');

        items.forEach(function (item) {
            item.addEventListener('click', function () {
                items.forEach(function (el) {
                    el.classList.remove('is-active');
                    el.setAttribute('aria-selected', 'false');
                });

                item.classList.add('is-active');
                item.setAttribute('aria-selected', 'true');

                showTabPanel(group, item.dataset.tab);
            });
        });
    });
}

/* ========================
   ВАЛИДАЦИЯ ФОРМЫ
======================== */
function initRequestFormValidation() {
    document.querySelectorAll('#request-form, .js-validate-form').forEach(initFormValidation);
}

function initFormValidation(form) {
    var maskedFields = form.querySelectorAll('[data-validate]');
    maskedFields.forEach(function (input) {
        input.addEventListener('input', function () {
            applyInputMask(input);
        });
    });

    var allInputs = form.querySelectorAll('.input, .checkbox');
    allInputs.forEach(function (input) {
        var eventName = input.type === 'checkbox' ? 'change' : 'input';
        input.addEventListener(eventName, function () {
            clearFieldError(input);
        });
    });

    form.addEventListener('submit', function (e) {
        e.preventDefault();
        validateRequestForm(form);
    });
}

function applyInputMask(input) {
    var type = input.dataset.validate;

    if (type === 'name') {
        input.value = input.value.replace(/[^a-zA-Zа-яёА-ЯЁ\s-]/g, '');
    } else if (type === 'inn') {
        input.value = input.value.replace(/\D/g, '').slice(0, 12);
    } else if (type === 'phone') {
        formatPhoneValue(input);
    }
}

function formatPhoneValue(input) {
    var digits = input.value.replace(/\D/g, '');

    if (digits.charAt(0) === '8') {
        digits = '7' + digits.slice(1);
    }
    if (digits.charAt(0) !== '7') {
        digits = '7' + digits;
    }
    digits = digits.slice(0, 11);

    var rest = digits.slice(1);
    var formatted = '+7';

    if (rest.length > 0) {
        formatted += ' (' + rest.slice(0, 3);
    }
    if (rest.length >= 3) {
        formatted += ')';
    }
    if (rest.length >= 4) {
        formatted += ' ' + rest.slice(3, 6);
    }
    if (rest.length >= 7) {
        formatted += '-' + rest.slice(6, 8);
    }
    if (rest.length >= 9) {
        formatted += '-' + rest.slice(8, 10);
    }

    input.value = formatted;
}

function clearFieldError(input) {
    if (input.type === 'checkbox') {
        var row = input.closest('.checkbox-row');
        if (row && input.checked) {
            row.classList.remove('is-error');
        }
        return;
    }

    var field = input.closest('.field');
    if (!field || !field.classList.contains('is-error')) {
        return;
    }

    field.classList.remove('is-error');
    restoreFieldLabel(field);
}

function restoreFieldLabel(field) {
    var label = field.querySelector('.field__label');
    if (label && label.dataset.originalText) {
        label.textContent = label.dataset.originalText;
    }
}

function setFieldError(field, message) {
    var label = field.querySelector('.field__label');

    if (label) {
        if (!label.dataset.originalText) {
            label.dataset.originalText = label.textContent;
        }
        label.textContent = message;
    }

    field.classList.add('is-error');
}

function getFieldError(input) {
    var value = input.value.trim();

    if (!value) {
        return 'Заполните это поле';
    }

    var type = input.dataset.validate;

    if (type === 'inn') {
        var digits = value.replace(/\D/g, '');
        if (digits.length < 10 || digits.length > 12) {
            return 'Неверный формат';
        }
    }

    if (type === 'phone') {
        var phoneDigits = value.replace(/\D/g, '');
        if (phoneDigits.length !== 11) {
            return 'Неверный формат';
        }
    }

    if (type === 'email') {
        var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(value)) {
            return 'Неверный формат';
        }
    }

    if (type === 'name') {
        var namePattern = /^[a-zA-Zа-яёА-ЯЁ\s-]+$/;
        if (!namePattern.test(value)) {
            return 'Неверный формат';
        }
    }

    return null;
}

function validateRequestForm(form) {
    var isValid = true;
    var firstInvalid = null;

    var fields = form.querySelectorAll('.field');
    fields.forEach(function (field) {
        var input = field.querySelector('.input');

        if (!input || !input.hasAttribute('required')) {
            return;
        }

        var error = getFieldError(input);

        if (error) {
            setFieldError(field, error);
            isValid = false;
            firstInvalid = firstInvalid || input;
        } else {
            field.classList.remove('is-error');
            restoreFieldLabel(field);
        }
    });

    var checkbox = form.querySelector('.checkbox[required]');
    if (checkbox) {
        var row = checkbox.closest('.checkbox-row');

        if (!checkbox.checked) {
            row.classList.add('is-error');
            isValid = false;
            firstInvalid = firstInvalid || checkbox;
        } else {
            row.classList.remove('is-error');
        }
    }

    if (firstInvalid) {
        firstInvalid.focus();
    }

    return isValid;
}

/* ========================
   ГЛАВНЫЙ СЛАЙДЕР (hero)
======================== */
var HERO_AUTOPLAY_MS = 5000;
var SVG_NS = 'http://www.w3.org/2000/svg';

function initHeroSlider() {
    var slider = document.querySelector('.hero-slider');

    if (!slider) {
        return;
    }

    var slides = Array.prototype.slice.call(slider.querySelectorAll('.hero-slide'));

    if (slides.length < 2) {
        return;
    }

    var current = 0;
    var timerId = null;

    function getSlideVideo(slide) {
        return slide.querySelector('.hero-slide__video');
    }

    function getSlideDuration(slide) {
        var video = getSlideVideo(slide);

        if (video && video.duration && !isNaN(video.duration)) {
            return video.duration * 1000;
        }

        return HERO_AUTOPLAY_MS;
    }

    function renderPagination(slide, activeIndex) {
        var items = slide.querySelectorAll('.pagination-item');
        var duration = getSlideDuration(slides[activeIndex]);

        items.forEach(function (item, i) {
            item.classList.toggle('is-active', i === activeIndex);
            item.innerHTML = '';

            if (i !== activeIndex) {
                return;
            }

            var svg = document.createElementNS(SVG_NS, 'svg');
            svg.setAttribute('width', '90');
            svg.setAttribute('height', '6');
            svg.setAttribute('viewBox', '0 0 90 6');
            svg.setAttribute('fill', 'none');

            var rect = document.createElementNS(SVG_NS, 'rect');
            rect.setAttribute('width', '90');
            rect.setAttribute('height', '6');
            rect.setAttribute('rx', '4');
            rect.setAttribute('fill', 'white');
            rect.setAttribute('class', 'pagination-progress');
            rect.style.transitionDuration = (duration / 1000) + 's';

            svg.appendChild(rect);
            item.appendChild(svg);

            rect.getBoundingClientRect();
            rect.classList.add('is-playing');
        });
    }

    function goTo(index, opts) {
        opts = opts || {};
        index = (index + slides.length) % slides.length;

        slides.forEach(function (slide, i) {
            var isActive = i === index;
            slide.classList.toggle('is-active', isActive);
            renderPagination(slide, index);

            var video = getSlideVideo(slide);
            if (video) {
                if (isActive) {
                    if (!opts.keepVideo && !opts.isInit) {
                        video.currentTime = 0;
                        var playPromise = video.play();
                        if (playPromise && playPromise.catch) {
                            playPromise.catch(function () {});
                        }
                    }
                } else {
                    video.pause();
                }
            }
        });

        current = index;
        restartAutoplay();
    }

    function next() {
        goTo(current + 1);
    }

    function restartAutoplay() {
        window.clearTimeout(timerId);
        timerId = window.setTimeout(next, getSlideDuration(slides[current]));
    }

    slider.addEventListener('click', function (e) {
        var item = e.target.closest('.pagination-item');

        if (!item) {
            return;
        }

        var items = Array.prototype.slice.call(item.parentElement.children);
        var index = items.indexOf(item);

        if (index !== -1 && index !== current) {
            goTo(index);
        }
    });

    slides.forEach(function (slide) {
        var video = getSlideVideo(slide);

        if (!video) {
            return;
        }

        video.addEventListener('loadedmetadata', function () {
            if (slides[current] === slide) {
                goTo(current, { keepVideo: true });
            }
        });
    });

    goTo(0, { isInit: true });
}

function showTabPanel(group, tabName) {
    var root = group.closest('[data-tabs-root]');

    if (!root || !tabName) {
        return;
    }

    root.querySelectorAll('[data-tab-panel]').forEach(function (panel) {
        panel.hidden = panel.dataset.tabPanel !== tabName;
    });
}

/* ========================
   ФУТЕР
======================== */
function initFooterAccordion() {
    var mq = window.matchMedia('(max-width: 700px)');
    var cols = document.querySelectorAll('.footer__col');

    cols.forEach(function (col) {
        var btn = col.querySelector('.footer__col-toggle');

        if (!btn) {
            return;
        }

        btn.addEventListener('click', function () {
            if (!mq.matches) {
                return;
            }

            var isOpen = col.classList.toggle('is-open');
            btn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        });
    });

    function sync() {
        cols.forEach(function (col) {
            var btn = col.querySelector('.footer__col-toggle');

            if (!btn) {
                return;
            }

            if (mq.matches) {
                btn.tabIndex = 0;
                btn.setAttribute('aria-expanded', col.classList.contains('is-open') ? 'true' : 'false');
            } else {
                col.classList.remove('is-open');
                btn.tabIndex = -1;
                btn.removeAttribute('aria-expanded');
            }
        });
    }

    mq.addEventListener('change', sync);
    sync();
}

/* ========================
   ХЕДЕР header--fixed
======================== */
function initFixedHeader() {
    var header = document.querySelector('.header');
    // на главной следим за hero, на внутренних страницах — за невидимым маркером [data-header-trigger]
    var hero = document.querySelector('.hero-section, [data-header-trigger]');

    if (!header || !hero) {
        return;
    }

    if (!('IntersectionObserver' in window)) {
        return;
    }

    var hideTimer = null;

    // при возврате к hero хедер сначала «закатывается» вверх (header--hiding), и только потом становится обычным
    function finishHiding() {
        clearTimeout(hideTimer);
        header.classList.remove('header--fixed', 'header--hiding');
    }

    header.addEventListener('animationend', function (e) {
        if (e.animationName === 'header-slide-up' && header.classList.contains('header--hiding')) {
            finishHiding();
        }
    });

    function setFixed(isPassed) {
        if (isPassed) {
            clearTimeout(hideTimer);
            header.classList.remove('header--hiding');
            header.classList.add('header--fixed');
            return;
        }

        if (header.classList.contains('header--fixed') && !header.classList.contains('header--hiding')) {
            header.classList.add('header--hiding');
            // запасной выход, если animationend не придёт (вкладка в фоне и т.п.)
            hideTimer = setTimeout(finishHiding, 600);
        }
    }

    var observer = new IntersectionObserver(function (entries) {
        var entry = entries[entries.length - 1];
        var isPassed = !entry.isIntersecting && entry.boundingClientRect.bottom <= 0;

        setFixed(isPassed);
    });

    observer.observe(hero);
}

/* ========================
   КАТАЛОГ: поле поиска. Выдача — на отдельной странице (/search/), форма уходит обычным GET-запросом;
   здесь только показ кнопок «Найти» и «очистить», когда в поле что-то введено
======================== */
function initCatalogSearch() {
    var input = document.querySelector('[data-catalog-search]');

    if (!input) {
        return;
    }

    var form = input.closest('[data-catalog-search-form]') || input.parentElement;
    var clearBtn = form.querySelector('[data-catalog-search-clear]');

    function sync() {
        form.classList.toggle('has-value', input.value.trim() !== '');
    }

    input.addEventListener('input', sync);

    // пустой запрос не отправляем
    form.addEventListener('submit', function (e) {
        if (input.value.trim() === '') {
            e.preventDefault();
            input.focus();
        }
    });

    if (clearBtn) {
        clearBtn.addEventListener('click', function () {
            input.value = '';
            sync();
            input.focus();
        });
    }

    sync();
}

/* ========================
   ПРЕДУПРЕЖДЕНИЕ ДЛЯ МЕДИЦИНСКИХ РАБОТНИКОВ
   Закрыть можно только подтверждением (cookie pro_access на год); Escape и клик по фону не закрывают.
======================== */
function initProGate() {
    var gate = document.getElementById('pro-gate');

    if (!gate) {
        return;
    }

    var confirmBtn = gate.querySelector('[data-pro-gate-confirm]');
    var focusables = gate.querySelectorAll('button, a[href]');

    function isPending() {
        return document.documentElement.classList.contains('pro-gate-pending');
    }

    if (confirmBtn) {
        confirmBtn.addEventListener('click', function () {
            document.cookie = 'pro_access=1; max-age=31536000; path=/; SameSite=Lax';
            document.documentElement.classList.remove('pro-gate-pending');
        });
    }

    // фокус не уходит за пределы окна
    document.addEventListener('keydown', function (e) {
        if (!isPending() || e.key !== 'Tab' || !focusables.length) {
            return;
        }

        var first = focusables[0];
        var last = focusables[focusables.length - 1];

        if (e.shiftKey && document.activeElement === first) {
            e.preventDefault();
            last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault();
            first.focus();
        } else if (!gate.contains(document.activeElement)) {
            e.preventDefault();
            first.focus();
        }
    });
}

/* ========================
   ДОКУМЕНТЫ: фильтр по типу + поиск по названию
   (клиентская фильтрация уже выведенного списка; когда список станет строиться в Bitrix,
   можно заменить на серверную фильтрацию/пагинацию без изменения разметки)
======================== */
function initDocsFilter() {
    var list = document.querySelector('.docs__list');
    var tabs = document.querySelector('.tabs--filter');
    var input = document.querySelector('.docs-search__input');
    var empty = document.querySelector('.docs__empty');

    if (!list || !tabs || !input) {
        return;
    }

    var searchBox = input.closest('.docs-search');
    var clearBtn = searchBox ? searchBox.querySelector('[data-docs-search-clear]') : null;
    var items = list.querySelectorAll('.docs-item');
    var currentFilter = 'all';

    function apply() {
        var query = input.value.trim().toLowerCase();
        var visible = 0;

        if (searchBox) {
            searchBox.classList.toggle('has-value', query !== '');
        }

        items.forEach(function (item) {
            var title = item.querySelector('.docs-item__title').textContent.toLowerCase();
            var matchType = currentFilter === 'all' || item.dataset.category === currentFilter;
            var matchText = !query || title.indexOf(query) !== -1;
            var show = matchType && matchText;

            item.hidden = !show;

            if (show) {
                visible++;
            }
        });

        if (empty) {
            empty.hidden = visible !== 0;
        }
    }

    tabs.querySelectorAll('.tabs__item').forEach(function (tab) {
        tab.addEventListener('click', function () {
            currentFilter = tab.dataset.filter || 'all';
            apply();
        });
    });

    input.addEventListener('input', apply);

    if (clearBtn) {
        clearBtn.addEventListener('click', function () {
            input.value = '';
            apply();
            input.focus();
        });
    }
}

/* ========================
   НОВОСТИ: фильтр по категории (клиентская фильтрация; при выводе из Bitrix можно заменить серверной)
======================== */
function initNewsFilter() {
    var grid = document.querySelector('.news-grid');
    var tabs = document.querySelector('.news-page .tabs--filter');
    var empty = document.querySelector('.news-page .docs__empty');

    if (!grid || !tabs) {
        return;
    }

    var items = Array.prototype.slice.call(grid.children);

    tabs.querySelectorAll('.tabs__item').forEach(function (tab) {
        tab.addEventListener('click', function () {
            var filter = tab.dataset.filter || 'all';
            var visible = 0;

            items.forEach(function (item) {
                var show = filter === 'all' || item.dataset.category === filter;
                item.hidden = !show;
                visible += show ? 1 : 0;
            });

            if (empty) {
                empty.hidden = visible !== 0;
            }
        });
    });
}

/* ========================
   ДОКУМЕНТЫ: активная страница в пагинации — подсвечиваем по параметру ?page= из адреса
======================== */
function initDocsPagination() {
    var nav = document.querySelector('.docs .pagination, .news-page .pagination');

    if (!nav) {
        return;
    }

    var items = nav.querySelectorAll('.pagination__item');
    var prev = nav.querySelector('.pagination__arrow--prev');
    var next = nav.querySelector('.pagination__arrow--next');
    var last = Math.max.apply(null, Array.prototype.map.call(items, function (item) {
        return parseInt(item.textContent, 10) || 1;
    }));
    var current = Math.min(last, Math.max(1, parseInt(new URLSearchParams(location.search).get('page'), 10) || 1));

    items.forEach(function (item) {
        var isActive = parseInt(item.textContent, 10) === current;
        item.classList.toggle('is-active', isActive);

        if (isActive) {
            item.setAttribute('aria-current', 'page');
        } else {
            item.removeAttribute('aria-current');
        }
    });

    if (prev) {
        prev.href = '?page=' + Math.max(1, current - 1);
        prev.classList.toggle('is-disabled', current <= 1);
    }

    if (next) {
        next.href = '?page=' + Math.min(last, current + 1);
        next.classList.toggle('is-disabled', current >= last);
    }
}

/* ========================
   КАТАЛОГ (СТРАНИЦА КАТЕГОРИИ): сворачиваемые группы фильтра + «ещё N»
======================== */
/* ========================
   КАТАЛОГ (СТРАНИЦА КАТЕГОРИИ): переключение подкатегорий в сайдбаре
   (пока только верстка — переключает активный пункт без перехода/перезагрузки списка)
======================== */
function initFilterCategories() {
    var items = document.querySelectorAll('.filter-categories__item');

    items.forEach(function (item) {
        item.addEventListener('click', function (e) {
            e.preventDefault();

            items.forEach(function (el) {
                el.classList.remove('is-active');
                el.removeAttribute('aria-current');
            });

            item.classList.add('is-active');
            item.setAttribute('aria-current', 'page');
        });
    });
}

function initFilterGroups() {
    // на мобильном (модалка фильтров) все группы по умолчанию свёрнуты;
    // на десктопе остаются в том состоянии, что задано в разметке
    if (window.matchMedia('(max-width: 991px)').matches) {
        document.querySelectorAll('[data-filter-group]').forEach(function (group) {
            group.classList.remove('is-open');
        });
    }

    document.querySelectorAll('[data-filter-group]').forEach(function (group) {
        var toggle = group.querySelector('[data-filter-toggle]');

        if (!toggle) {
            return;
        }

        toggle.addEventListener('click', function () {
            group.classList.toggle('is-open');
        });
    });

    document.querySelectorAll('[data-filter-more]').forEach(function (btn) {
        var extra = document.getElementById(btn.getAttribute('aria-controls'));

        if (!extra) {
            return;
        }

        btn.addEventListener('click', function () {
            var isOpen = btn.classList.toggle('is-open');
            extra.hidden = !isOpen;
            btn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        });
    });
}

/* ========================
   КАТАЛОГ (СТРАНИЦА КАТЕГОРИИ): диапазонный слайдер (диаметр и т.п.)
======================== */
function initRangeSliders() {
    document.querySelectorAll('[data-range-slider]').forEach(function (root) {
        var minInput = root.querySelector('[data-range-input="min"]');
        var maxInput = root.querySelector('[data-range-input="max"]');
        var fill = root.querySelector('[data-range-fill]');
        var outMin = root.querySelector('[data-range-out="min"]');
        var outMax = root.querySelector('[data-range-out="max"]');
        var unit = root.dataset.unit || '';

        if (!minInput || !maxInput) {
            return;
        }

        function update() {
            var min = parseFloat(minInput.min);
            var max = parseFloat(minInput.max);
            var lo = parseFloat(minInput.value);
            var hi = parseFloat(maxInput.value);
            var loPct = (lo - min) / (max - min) * 100;
            var hiPct = (hi - min) / (max - min) * 100;

            if (fill) {
                fill.style.left = loPct + '%';
                fill.style.right = (100 - hiPct) + '%';
            }

            if (outMin) {
                outMin.textContent = 'от ' + lo.toFixed(1) + ' ' + unit;
                outMin.classList.toggle('is-limit', lo <= min);
            }

            if (outMax) {
                outMax.textContent = 'до ' + hi.toFixed(1) + ' ' + unit;
                outMax.classList.toggle('is-limit', hi >= max);
            }
        }

        minInput.addEventListener('input', function () {
            if (parseFloat(minInput.value) > parseFloat(maxInput.value)) {
                minInput.value = maxInput.value;
            }
            update();
        });

        maxInput.addEventListener('input', function () {
            if (parseFloat(maxInput.value) < parseFloat(minInput.value)) {
                maxInput.value = minInput.value;
            }
            update();
        });

        update();
    });
}

/* ========================
   КАТАЛОГ (СТРАНИЦА КАТЕГОРИИ): быстрый поиск по категории (только показ кнопки «очистить»)
======================== */
function initCatalogQuickSearch() {
    document.querySelectorAll('.catalog-quicksearch').forEach(function (box) {
        var input = box.querySelector('.docs-search__input');
        var clearBtn = box.querySelector('[data-docs-search-clear]');

        if (!input) {
            return;
        }

        function sync() {
            box.classList.toggle('has-value', input.value.trim() !== '');
        }

        input.addEventListener('input', sync);

        if (clearBtn) {
            clearBtn.addEventListener('click', function () {
                input.value = '';
                sync();
                input.focus();
            });
        }

        sync();
    });
}

/* ========================
   КАТАЛОГ (СТРАНИЦА КАТЕГОРИИ): модалка фильтров на мобильном (по стилям как .mobile-menu,
   но во весь экран) — открывается кнопкой «Фильтры» из тулбара
======================== */
function initCatalogFiltersModal() {
    var trigger = document.getElementById('catalog-filters-btn');
    var closeBtn = document.getElementById('catalog-filters-close');
    var overlay = document.getElementById('mobile-menu-overlay');
    var panel = document.getElementById('catalog-filters');

    if (!trigger || !panel || !overlay) {
        return;
    }

    // на десктопе панель — обычный grid-элемент сайдбара; при открытии модалки на мобильном
    // переносим её в конец body, чтобы её z-index не был заперт стек-контекстом .container
    var anchor = document.createComment('catalog-filters-anchor');
    panel.parentNode.insertBefore(anchor, panel);
    var restoreTimeout = null;

    function open() {
        closeMobileMenuIfOpen();
        closeSearchIfOpen();
        closeRequestModalIfOpen();

        if (restoreTimeout !== null) {
            clearTimeout(restoreTimeout);
            restoreTimeout = null;
        }

        document.body.appendChild(panel);
        lockBodyScroll();
        panel.classList.add('is-open');
        overlay.dataset.for = 'filters';
        overlay.classList.add('is-open');
        trigger.setAttribute('aria-expanded', 'true');
    }

    function close() {
        if (!panel.classList.contains('is-open')) {
            return;
        }

        panel.classList.remove('is-open');
        overlay.classList.remove('is-open');
        trigger.setAttribute('aria-expanded', 'false');
        unlockBodyScroll();

        restoreTimeout = setTimeout(function () {
            anchor.parentNode.insertBefore(panel, anchor.nextSibling);
        }, 320);
    }

    trigger.addEventListener('click', open);

    if (closeBtn) {
        closeBtn.addEventListener('click', close);
    }

    overlay.addEventListener('click', close);

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
            close();
        }
    });

    document.querySelectorAll('.catalog-filters__apply').forEach(function (btn) {
        btn.addEventListener('click', close);
    });
}

/* ========================
   КАСТОМНЫЙ СКРОЛЛБАР (списки фильтров): нативный прячем, рисуем дорожку и бегунок,
   чтобы полоса выглядела одинаково во всех браузерах и была видна всегда
======================== */
function initCustomScrollbars() {
    document.querySelectorAll('.filter-checklist--scroll').forEach(initCustomScrollbar);
}

function initCustomScrollbar(area) {
    if (area.closest('.custom-scroll')) {
        return;
    }

    var wrap = document.createElement('div');
    wrap.className = 'custom-scroll';
    area.parentNode.insertBefore(wrap, area);
    wrap.appendChild(area);

    var track = document.createElement('span');
    track.className = 'custom-scroll__track';
    var thumb = document.createElement('span');
    thumb.className = 'custom-scroll__thumb';
    track.appendChild(thumb);
    wrap.appendChild(track);

    var MIN_THUMB = 20;

    function update() {
        var visible = area.clientHeight;
        var total = area.scrollHeight;

        if (total <= visible + 1) {
            track.style.display = 'none';
            return;
        }

        track.style.display = '';

        var height = Math.max(MIN_THUMB, Math.round(visible * visible / total));
        var maxOffset = visible - height;
        var progress = area.scrollTop / (total - visible);

        thumb.style.height = height + 'px';
        thumb.style.transform = 'translateY(' + Math.round(maxOffset * progress) + 'px)';
    }

    area.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);

    if (typeof ResizeObserver === 'function') {
        new ResizeObserver(update).observe(area);
    }

    // перетаскивание бегунка
    thumb.addEventListener('pointerdown', function (e) {
        e.preventDefault();
        thumb.setPointerCapture(e.pointerId);

        var startY = e.clientY;
        var startTop = area.scrollTop;
        var visible = area.clientHeight;
        var total = area.scrollHeight;
        var maxOffset = visible - Math.max(MIN_THUMB, Math.round(visible * visible / total));

        function move(ev) {
            area.scrollTop = startTop + (ev.clientY - startY) * (total - visible) / maxOffset;
        }

        function up(ev) {
            thumb.releasePointerCapture(ev.pointerId);
            thumb.removeEventListener('pointermove', move);
            thumb.removeEventListener('pointerup', up);
        }

        thumb.addEventListener('pointermove', move);
        thumb.addEventListener('pointerup', up);
    });

    update();
}

/* ========================
   КОРЗИНА (боковая панель)
======================== */
var cartPanelCloseFn = function () {};

function closeCartIfOpen() {
    cartPanelCloseFn();
}

function initCartPanel() {
    var panel = document.getElementById('cart-panel');
    var overlay = document.getElementById('mobile-menu-overlay');
    var openBtn = document.getElementById('cart-open-btn');

    if (!panel || !overlay || !openBtn) {
        return;
    }

    var closeBtns = panel.querySelectorAll('.js-close-cart');
    var clearBtn = panel.querySelector('[data-cart-clear]');
    var checkoutBtns = panel.querySelectorAll('[data-cart-checkout]');
    var list = panel.querySelector('[data-cart-list]');
    var countEls = document.querySelectorAll('#cart-count, [data-cart-count]');

    function setView(view) {
        panel.dataset.cartView = view;
    }

    function updateCount() {
        var items = list ? list.querySelectorAll('[data-cart-item]') : [];
        var total = 0;

        items.forEach(function (item) {
            total += parseInt(item.dataset.qty, 10) || 0;
        });

        countEls.forEach(function (el) {
            el.textContent = total;
        });

        if (!total) {
            setView('empty');
        }

        return total;
    }

    openBtn.addEventListener('click', function (e) {
        e.preventDefault();
        closeMobileMenuIfOpen();
        closeSearchIfOpen();
        closeRequestModalIfOpen();
        openCartPanel();
    });

    function openCartPanel() {
        lockBodyScroll();
        panel.classList.add('is-open');
        overlay.dataset.for = 'cart';
        overlay.classList.add('is-open');
        updateCount();
    }

    function closeCartPanel() {
        if (!panel.classList.contains('is-open')) {
            return;
        }

        panel.classList.remove('is-open');
        overlay.classList.remove('is-open');
        unlockBodyScroll();
        resetForm(panel.querySelector('#cart-checkout-form'));

        if (panel.dataset.cartView === 'checkout') {
            setView(updateCount() ? 'items' : 'empty');
        }
    }

    cartPanelCloseFn = closeCartPanel;

    closeBtns.forEach(function (btn) {
        btn.addEventListener('click', closeCartPanel);
    });

    overlay.addEventListener('click', closeCartPanel);

    if (clearBtn) {
        clearBtn.addEventListener('click', function () {
            if (list) {
                list.innerHTML = '';
            }
            updateCount();
        });
    }

    checkoutBtns.forEach(function (btn) {
        btn.addEventListener('click', function (e) {
            if (btn.type === 'button') {
                e.preventDefault();
                setView('checkout');
            }
        });
    });

    if (list) {
        list.addEventListener('click', function (e) {
            var item = e.target.closest('[data-cart-item]');
            if (!item) {
                return;
            }

            if (e.target.closest('[data-cart-remove]')) {
                item.remove();
                updateCount();
                return;
            }

            var valueEl = item.querySelector('[data-qty-value]');
            var qty = parseInt(item.dataset.qty, 10) || 1;

            if (e.target.closest('[data-qty-plus]')) {
                qty += 1;
            } else if (e.target.closest('[data-qty-minus]')) {
                qty = Math.max(1, qty - 1);
            } else {
                return;
            }

            item.dataset.qty = qty;
            if (valueEl) {
                valueEl.textContent = qty + ' шт';
            }
            updateCount();
        });
    }

    updateCount();
}

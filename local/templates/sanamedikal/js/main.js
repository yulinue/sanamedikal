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
});

/* ========================
   ГОРИЗОНТАЛЬНЫЕ ЛЕНТЫ (бренды, документы)
   Разметка: [data-slider] > [data-slider-track] + [data-slider-prev|next]
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
            openRequestModal(modal, overlay);
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
    var form = modal.querySelector('#request-form');
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
   ТАБЫ (сегментированный переключатель)
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
   ВАЛИДАЦИЯ ФОРМЫ «ОСТАВИТЬ ЗАЯВКУ»
======================== */
function initRequestFormValidation() {
    var form = document.getElementById('request-form');

    if (!form) {
        return;
    }

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

/* Переключение содержимого табов: [data-tabs-root] содержит .tabs и панели [data-tab-panel="<data-tab>"] */
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
   ФУТЕР: колонки навигации — выпадающие списки на ≤700px
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
   ХЕДЕР: фиксируется (header--fixed), когда hero-блок ушёл из поля зрения
======================== */
function initFixedHeader() {
    var header = document.querySelector('.header');
    var hero = document.querySelector('.hero-section');

    if (!header || !hero) {
        return;
    }

    if (!('IntersectionObserver' in window)) {
        return;
    }

    var observer = new IntersectionObserver(function (entries) {
        var entry = entries[entries.length - 1];
        // hero полностью выше вьюпорта (а не ещё ниже, при загрузке страницы)
        var isPassed = !entry.isIntersecting && entry.boundingClientRect.bottom <= 0;

        header.classList.toggle('header--fixed', isPassed);
    });

    observer.observe(hero);
}

// === НАЛАШТУВАННЯ БОТА ===
const BOT_USERNAME = "YOUR_BOT_USERNAME"; // без @
const PRODUCT_CODE = "dress_plus_size_1"; // будь-який код товару

// === СТАН ВИБОРУ ===
let currentSize = null;
let currentColor = null;

// Елементи розміру
const sizeButtons = document.querySelectorAll(".size-btn");
const selectedSizeText = document.getElementById("selected-size-text");

// Елементи кольору (свайпер)
const colorSlider = document.querySelector(".color-slider");
const colorSlides = Array.from(document.querySelectorAll("[data-color-slide]"));
const dots = Array.from(document.querySelectorAll(".color-slider__dot"));
const btnPrev = document.querySelector(".color-slider__btn--prev");
const btnNext = document.querySelector(".color-slider__btn--next");
const selectedColorText = document.getElementById("selected-color-text");

// Кнопки замовлення
const orderBtnTop = document.getElementById("order-btn");
const orderBtnFooter = document.getElementById("order-btn-footer");

// Свайп
let currentSlideIndex = 0;
let touchStartX = 0;
let touchEndX = 0;
const TOUCH_THRESHOLD = 40; // мінімальна відстань для свайпа

// === ІНІЦІАЛІЗАЦІЯ ===

(function initSelection() {
  const activeSizeBtn = document.querySelector(".size-btn--active");
  if (activeSizeBtn) {
    currentSize = activeSizeBtn.dataset.size;
  }

  const activeSlide = document.querySelector(".color-slide--active");
  if (activeSlide) {
    currentColor = activeSlide.dataset.color;
  }

  if (selectedSizeText && currentSize) {
    selectedSizeText.textContent = currentSize;
  }
  if (selectedColorText && currentColor) {
    selectedColorText.textContent = currentColor;
  }
})();

// === ФУНКЦІЇ ===

function updateSlide(newIndex) {
  if (colorSlides.length === 0) return;

  if (newIndex < 0) {
    newIndex = colorSlides.length - 1;
  }
  if (newIndex >= colorSlides.length) {
    newIndex = 0;
  }
  currentSlideIndex = newIndex;

  // Оновлюємо активний слайд
  colorSlides.forEach((slide, index) => {
    slide.classList.toggle("color-slide--active", index === currentSlideIndex);
  });

  // Оновлюємо крапки
  dots.forEach((dot, index) => {
    const isActive = index === currentSlideIndex;
    dot.classList.toggle("color-slider__dot--active", isActive);
    dot.setAttribute("aria-selected", isActive ? "true" : "false");
  });

  // Оновлюємо поточний колір + текст "Ваш вибір"
  const activeSlide = colorSlides[currentSlideIndex];
  currentColor = activeSlide.dataset.color;
  if (selectedColorText) {
    selectedColorText.textContent = currentColor;
  }
}

function handleSizeClick(event) {
  const button = event.currentTarget;
  const size = button.dataset.size;

  sizeButtons.forEach((btn) => btn.classList.remove("size-btn--active"));
  button.classList.add("size-btn--active");

  currentSize = size;
  if (selectedSizeText) {
    selectedSizeText.textContent = currentSize;
  }
}

function buildBotUrl() {
  const sizeParam = currentSize || "no-size";
  const colorParam = currentColor || "no-color";

  const payload = encodeURIComponent(
    `${PRODUCT_CODE}|color=${colorParam}|size=${sizeParam}`
  );

  return `https://t.me/${BOT_USERNAME}?start=${payload}`;
}

function handleOrderClick() {
  const url = buildBotUrl();
  window.open(url, "_blank");
}

// === СВАЙП НА МОБІЛЦІ ===

function isMobileWidth() {
  return window.matchMedia("(max-width: 899px)").matches;
}

function handleTouchStart(e) {
  if (!isMobileWidth()) return;
  if (!e.touches || e.touches.length === 0) return;
  touchStartX = e.touches[0].clientX;
  touchEndX = touchStartX;
}

function handleTouchMove(e) {
  if (!isMobileWidth()) return;
  if (!e.touches || e.touches.length === 0) return;
  touchEndX = e.touches[0].clientX;
}

function handleTouchEnd() {
  if (!isMobileWidth()) return;

  const deltaX = touchEndX - touchStartX;

  if (Math.abs(deltaX) > TOUCH_THRESHOLD) {
    if (deltaX < 0) {
      // свайп вліво → наступний слайд
      updateSlide(currentSlideIndex + 1);
    } else {
      // свайп вправо → попередній
      updateSlide(currentSlideIndex - 1);
    }
  }

  touchStartX = 0;
  touchEndX = 0;
}

// === ОБРОБНИКИ ПОДІЙ ===

// Розміри
sizeButtons.forEach((btn) => {
  btn.addEventListener("click", handleSizeClick);
});

// Стрілки свайпера
if (btnPrev) {
  btnPrev.addEventListener("click", () => updateSlide(currentSlideIndex - 1));
}
if (btnNext) {
  btnNext.addEventListener("click", () => updateSlide(currentSlideIndex + 1));
}

// Клік по крапках
dots.forEach((dot) => {
  dot.addEventListener("click", () => {
    const targetIndex = Number(dot.dataset.slideTo);
    if (!Number.isNaN(targetIndex)) {
      updateSlide(targetIndex);
    }
  });
});

// Свайп (тільки мобільна ширина)
if (colorSlider) {
  colorSlider.addEventListener("touchstart", handleTouchStart, { passive: true });
  colorSlider.addEventListener("touchmove", handleTouchMove, { passive: true });
  colorSlider.addEventListener("touchend", handleTouchEnd);
}

// Кнопки "Додати в кошик і замовити"
if (orderBtnTop) {
  orderBtnTop.addEventListener("click", handleOrderClick);
}
if (orderBtnFooter) {
  orderBtnFooter.addEventListener("click", handleOrderClick);
}

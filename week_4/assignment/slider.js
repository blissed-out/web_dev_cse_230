function initSlider(root) {
  const track = root.querySelector('[data-track]');
  const dotsWrap = root.querySelector('[data-dots]');
  const prevBtn = root.querySelector('[data-prev]');
  const nextBtn = root.querySelector('[data-next]');

  const realSlides = Array.from(track.children);
  const slideCount = realSlides.length;

  let currentIndex;
  let totalWithClones;
  const dots = [];

  buildClones();
  buildDots();
  bindEvents();

  // Start on the first real slide (index 1, since a clone is prepended).
  currentIndex = 1;
  setPosition(false);
  updateDots();

  function buildClones() {
    const first = realSlides[0].cloneNode(true);
    const last = realSlides[slideCount - 1].cloneNode(true);
    first.setAttribute('data-clone', 'true');
    last.setAttribute('data-clone', 'true');

    track.appendChild(first);
    track.insertBefore(last, track.firstChild);

    const allSlides = Array.from(track.children);
    totalWithClones = allSlides.length;

    // Layout math: track width = totalSlides * 100%, each slide = 1/total of that.
    track.style.width = (totalWithClones * 100) + '%';
    allSlides.forEach(function (slide) {
      slide.style.width = (100 / totalWithClones) + '%';
    });
  }

  function buildDots() {
    realSlides.forEach(function (_, i) {
      const dot = document.createElement('button');
      dot.className = 'slider__dot';
      dot.setAttribute('aria-label', 'Go to slide ' + (i + 1));
      dot.addEventListener('click', function () {
        goToRealIndex(i);
      });
      dotsWrap.appendChild(dot);
      dots.push(dot);
    });
  }

  function bindEvents() {
    nextBtn.addEventListener('click', function () { step(1); });
    prevBtn.addEventListener('click', function () { step(-1); });
    track.addEventListener('transitionend', handleBoundaryWrap);
  }

  function step(direction) {
    currentIndex += direction;
    setPosition(true);
    updateDots();
  }

  function goToRealIndex(realIndex) {
    currentIndex = realIndex + 1; // +1 offset for prepended clone
    setPosition(true);
    updateDots();
  }

  function setPosition(animate) {
    track.style.transition = animate ? '' : 'none';
    const offsetPercent = (100 / totalWithClones) * currentIndex;
    track.style.transform = 'translateX(-' + offsetPercent + '%)';
    if (!animate) {
      // Force reflow so "none" actually applies before the next animated move.
      void track.offsetHeight;
      track.style.transition = '';
    }
  }

  function handleBoundaryWrap() {
    if (currentIndex === totalWithClones - 1) {
      // Landed on the appended clone of the first slide -> snap to real first.
      currentIndex = 1;
      setPosition(false);
    } else if (currentIndex === 0) {
      // Landed on the prepended clone of the last slide -> snap to real last.
      currentIndex = totalWithClones - 2;
      setPosition(false);
    }
  }

  function updateDots() {
    // Map internal (clone-shifted) index back to real slide index for dot state.
    let realIndex = currentIndex - 1;
    if (realIndex < 0) realIndex = slideCount - 1;
    if (realIndex >= slideCount) realIndex = 0;

    dots.forEach(function (dot, i) {
      dot.classList.toggle('slider__dot--active', i === realIndex);
    });
  }
}

initSlider(document.querySelector('[data-slider]'));

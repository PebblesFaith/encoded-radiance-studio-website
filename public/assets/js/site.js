(() => {
  const menuButton = document.querySelector('.nav-toggle');
  const nav = document.querySelector('.site-nav');

  const closeMenu = () => {
    if (!menuButton || !nav) return;
    nav.classList.remove('is-open');
    menuButton.setAttribute('aria-expanded', 'false');
  };

  if (menuButton && nav) {
    menuButton.addEventListener('click', () => {
      const open = nav.classList.toggle('is-open');
      menuButton.setAttribute('aria-expanded', String(open));
    });
    window.addEventListener('resize', () => {
      if (window.innerWidth > 900) closeMenu();
    });
  }

  const modal = document.querySelector('.detail-modal');
  const modalPanel = modal?.querySelector('.detail-modal__panel');
  const openButtons = [...document.querySelectorAll('[data-modal-open]')];
  const closeButton = modal?.querySelector('[data-modal-close]');
  const dismissTarget = modal?.querySelector('[data-modal-dismiss]');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let lastFocusedElement = null;
  let closeTimer = null;

  const focusableSelector = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])'
  ].join(',');

  const resetModal = ({ restoreFocus = false } = {}) => {
    if (!modal) return;
    window.clearTimeout(closeTimer);
    modal.classList.remove('is-open');
    modal.hidden = true;
    document.body.classList.remove('modal-open');
    if (restoreFocus && lastFocusedElement instanceof HTMLElement && document.contains(lastFocusedElement)) {
      lastFocusedElement.focus();
    }
    lastFocusedElement = null;
  };

  const closeModal = ({ restoreFocus = true, immediate = false } = {}) => {
    if (!modal || modal.hidden) return;
    modal.classList.remove('is-open');
    document.body.classList.remove('modal-open');
    if (immediate || reduceMotion.matches) {
      resetModal({ restoreFocus });
      return;
    }
    closeTimer = window.setTimeout(() => resetModal({ restoreFocus }), 280);
  };

  const openModal = (triggerButton) => {
    if (!modal || !modalPanel || !openButtons.length) return;
    window.clearTimeout(closeTimer);
    lastFocusedElement = triggerButton instanceof HTMLElement ? triggerButton : document.activeElement;
    modal.hidden = false;
    document.body.classList.add('modal-open');
    requestAnimationFrame(() => {
      modal.classList.add('is-open');
      (closeButton || modalPanel).focus();
    });
  };

  openButtons.forEach((button) => {
    button.addEventListener('click', () => openModal(button));
  });
  closeButton?.addEventListener('click', () => closeModal());
  dismissTarget?.addEventListener('click', () => closeModal());

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      if (modal && !modal.hidden) {
        event.preventDefault();
        closeModal();
      } else {
        closeMenu();
      }
      return;
    }

    if (event.key === 'Tab' && modal && !modal.hidden && modalPanel) {
      const focusable = [...modalPanel.querySelectorAll(focusableSelector)]
        .filter((element) => element instanceof HTMLElement && element.offsetParent !== null);
      if (!focusable.length) {
        event.preventDefault();
        modalPanel.focus();
        return;
      }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  });

  nav?.addEventListener('click', (event) => {
    const link = event.target.closest('a');
    if (!link) return;
    closeMenu();
    closeModal({ restoreFocus: false, immediate: true });
  });

  document.querySelectorAll('a[href]').forEach((link) => {
    link.addEventListener('click', () => {
      if (modal && !modal.hidden) closeModal({ restoreFocus: false, immediate: true });
    });
  });

  // Always return the popup to its collapsed state when the visitor leaves,
  // navigates away, switches tabs, or the page is placed into browser history.
  window.addEventListener('pagehide', () => resetModal());
  window.addEventListener('beforeunload', () => resetModal());
  window.addEventListener('pageshow', () => resetModal());
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') resetModal();
  });
})();

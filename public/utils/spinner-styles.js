/**
 * Inject global spinner styles for image download operations
 * This runs once when the module is loaded
 */
function injectSpinnerStyles() {
  // Check if styles already injected
  if (document.getElementById('snapdom-spinner-styles')) {
    return;
  }

  const style = document.createElement('style');
  style.id = 'snapdom-spinner-styles';
  style.textContent = `
    /* ========== SnapDOM Spinner Styles ========== */
    .snapdom-spinner-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
      backdrop-filter: blur(2px);
    }

    .snapdom-spinner-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
    }

    .snapdom-spinner {
      width: 48px;
      height: 48px;
      border: 4px solid rgba(255, 255, 255, 0.2);
      border-top-color: #ffffff;
      border-radius: 50%;
      animation: snapdom-spin 0.8s linear infinite;
    }

    .snapdom-spinner-content p {
      color: #ffffff;
      font-size: 1rem;
      font-weight: 500;
      margin: 0;
      letter-spacing: 0.5px;
    }

    @keyframes snapdom-spin {
      to {
        transform: rotate(360deg);
      }
    }
  `;
  document.head.appendChild(style);
}

// Inject styles immediately when module loads
injectSpinnerStyles();

export { injectSpinnerStyles };

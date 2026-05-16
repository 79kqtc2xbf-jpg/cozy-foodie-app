const CF32_VERSION = "webstable32-clean-stable-build";

(function applyV32CleanStableBuild(){
  if (window.CF32_CLEAN_STABLE_BUILD_APPLIED) return;
  window.CF32_CLEAN_STABLE_BUILD_APPLIED = true;
  window.CF32_VERSION = CF32_VERSION;

  if (document && document.body) {
    document.body.dataset.cozyVersion = CF32_VERSION;
    document.body.classList.add("cf32-clean-stable-build");
  }

  function injectStableBadge() {
    if (!document || document.getElementById("cf32StableBadge")) return;
    const hero = document.getElementById("homeHero");
    if (!hero) return;
    const badge = document.createElement("div");
    badge.id = "cf32StableBadge";
    badge.className = "cf32-stable-badge";
    badge.textContent = "stable v32";
    hero.appendChild(badge);
  }

  function injectStyles() {
    if (!document || document.getElementById("cf32-stable-style")) return;
    const style = document.createElement("style");
    style.id = "cf32-stable-style";
    style.textContent = `
      .cf32-clean-stable-build #homeHero {
        position: relative;
      }
      .cf32-stable-badge {
        position: absolute;
        right: 14px;
        top: 12px;
        padding: 5px 9px;
        border-radius: 999px;
        background: rgba(255, 224, 138, .13);
        border: 1px solid rgba(255, 224, 138, .22);
        color: rgba(255, 245, 204, .82);
        font-size: 10px;
        font-weight: 900;
        letter-spacing: .03em;
        text-transform: uppercase;
      }
      .cf32-clean-stable-build .step-card-v31 strong {
        letter-spacing: -.01em;
      }
      .cf32-clean-stable-build .cf31-step-list li,
      .cf32-clean-stable-build .cf27-note-list li {
        text-wrap: pretty;
      }
    `;
    document.head.appendChild(style);
  }

  injectStyles();
  injectStableBadge();

  setTimeout(() => {
    injectStyles();
    injectStableBadge();
    if (document && document.body) document.body.dataset.cozyVersion = CF32_VERSION;
  }, 600);

  console.info("Cozy Foodie v32 loaded: clean stable build marker over approved v31 logic");
})();

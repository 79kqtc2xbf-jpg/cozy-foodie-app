const CF28_VERSION = "webstable28-show-recipe-notes";

function cf28InjectStyles() {
  if (document.getElementById("cf28-show-notes-style")) return;
  const style = document.createElement("style");
  style.id = "cf28-show-notes-style";
  style.textContent = `
    .daily-note-card .cf27-note-list,
    .daily-note-card ul.cf27-note-list,
    .cf27-note-card .cf27-note-list,
    .cf27-prep-notes .cf27-note-list {
      display: grid !important;
      visibility: visible !important;
      opacity: 1 !important;
      margin: 10px 0 0 !important;
      padding-left: 0 !important;
      list-style: none !important;
      gap: 10px !important;
    }

    .daily-note-card .cf27-note-list li,
    .cf27-prep-notes .cf27-note-list li {
      display: list-item !important;
      visibility: visible !important;
      opacity: 1 !important;
      position: relative;
      padding-left: 22px !important;
      font-size: 16px !important;
      line-height: 1.45 !important;
      color: inherit !important;
    }

    .daily-note-card .cf27-note-list li::before,
    .cf27-prep-notes .cf27-note-list li::before {
      content: "•";
      position: absolute;
      left: 4px;
      top: 0;
      color: #ffe08a;
      font-size: 20px;
      line-height: 1.1;
    }

    .daily-note-card > div > p:not(:has(+ ul)),
    .daily-note-card p:empty {
      display: none !important;
    }
  `;
  document.head.appendChild(style);
}

(function applyV28ShowRecipeNotes(){
  if (window.CF28_SHOW_RECIPE_NOTES_APPLIED) return;
  window.CF28_SHOW_RECIPE_NOTES_APPLIED = true;
  window.CF28_VERSION = CF28_VERSION;
  cf28InjectStyles();
  if (document && document.body) document.body.dataset.cozyVersion = CF28_VERSION;
  console.info("Cozy Foodie v28 loaded: show recipe note bullets");
})();

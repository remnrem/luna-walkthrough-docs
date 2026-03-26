function installLunaHeaderLinks() {
  const targets = document.querySelectorAll(
    ".md-header__topic .md-ellipsis"
  );

  if (!targets.length) return;

  const html = [
    '<span class="luna-site-links">',
    '<a class="luna-site-links__primary" href="https://zzz.nyspi.org/luna-walkthrough">Walkthrough</a>',
    '<span class="luna-site-links__sep">|</span>',
    '<a href="https://zzz.nyspi.org/luna/">Luna</a>',
    '<span class="luna-site-links__sep">|</span>',
    '<a href="https://zzz.nyspi.org/lunascope/">LunaScope</a>',
    '<span class="luna-site-links__sep">|</span>',
    '<a href="https://github.com/remnrem/luna-base">GitHub</a>',
    "</span>",
  ].join("");

  targets.forEach((target, index) => {
    const topic = target.closest(".md-header__topic");
    if (!topic) return;
    if (index !== 0) return;
    if (topic.dataset.lunaLinked === "true") return;
    topic.dataset.lunaLinked = "true";
    target.innerHTML = html;
  });
}

document.addEventListener("DOMContentLoaded", installLunaHeaderLinks);

if (typeof document$ !== "undefined" && document$.subscribe) {
  document$.subscribe(installLunaHeaderLinks);
}

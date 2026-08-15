function escapeHtml(value) {
  return value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
}

function inlineMarkdown(value) {
  return value
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\[(.+?)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
}

function renderMarkdown(markdown) {
  const lines = escapeHtml(markdown).replaceAll('\r', '').split('\n');
  const output = [];
  let listOpen = false;
  const closeList = () => { if (listOpen) { output.push('</ul>'); listOpen = false; } };

  for (const raw of lines) {
    const line = raw.trimEnd();
    if (!line.trim()) { closeList(); continue; }
    const heading = line.match(/^(#{1,3})\s+(.+)$/);
    if (heading) { closeList(); const level = Math.min(heading[1].length, 2); output.push(`<h${level}>${inlineMarkdown(heading[2])}</h${level}>`); continue; }
    if (line.startsWith('- ')) { if (!listOpen) { output.push('<ul>'); listOpen = true; } output.push(`<li>${inlineMarkdown(line.slice(2))}</li>`); continue; }
    closeList();
    output.push(`<p>${inlineMarkdown(line.replace(/  $/, ''))}</p>`);
  }
  closeList();
  return output.join('');
}

document.querySelectorAll('[data-legal-source]').forEach(async (container) => {
  try {
    const response = await fetch(container.dataset.legalSource);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    container.innerHTML = renderMarkdown(await response.text());
  } catch {
    container.innerHTML = '<p>This document could not be loaded. Please contact mccoysoftwaretools@gmail.com for assistance.</p>';
  }
});

// Load checkboxes
function loadCheckboxes(type, total) {
  const container = document.getElementById(`${type}List`);
  for (let i = 1; i <= total; i++) {
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = `${type}_${i}`;
    checkbox.checked = localStorage.getItem(`${type}_${i}`) === 'true';
    checkbox.onchange = () => {
      localStorage.setItem(`${type}_${i}`, checkbox.checked);
    };

    const label = document.createElement('label');
    label.htmlFor = checkbox.id;
    label.innerText = `${type.charAt(0).toUpperCase() + type.slice(1)} ${i}`;

    const div = document.createElement('div');
    div.appendChild(checkbox);
    div.appendChild(label);

    container.appendChild(div);
  }
}

// Jump to last checked box
function jumpToLast(type) {
  const total = 1000;
  for (let i = total; i >= 1; i--) {
    if (localStorage.getItem(`${type}_${i}`) === 'true') {
      const el = document.getElementById(`${type}_${i}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      break;
    }
  }
}

// Auto-detect page type
document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('nimazList')) loadCheckboxes('nimaz', 1000);
  if (document.getElementById('dayList')) loadCheckboxes('day', 1000);
});

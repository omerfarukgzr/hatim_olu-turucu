// ═══════════════════════════════════════════════════════
//  STATE
// ═══════════════════════════════════════════════════════
const MAX_PAGES = 604;

let state = {
  hatimName: '',
  startDate: '',
  endDate: '',
  participants: []   // { id, fullName, pages }
};

// ═══════════════════════════════════════════════════════
//  STORAGE
// ═══════════════════════════════════════════════════════
function saveState() {
  localStorage.setItem('hatimState', JSON.stringify(state));
}

function loadState() {
  const raw = localStorage.getItem('hatimState');
  if (raw) {
    try {
      state = JSON.parse(raw);
      // Migration: Convert old firstName/lastName to fullName if needed
      state.participants = state.participants.map(p => {
        if (!p.fullName && (p.firstName || p.lastName)) {
          return {
            id: p.id,
            fullName: `${p.firstName || ''} ${p.lastName || ''}`.trim(),
            pages: p.pages
          };
        }
        return p;
      });
    } catch(e) {}
  }
}

// ═══════════════════════════════════════════════════════
//  PAGE CALCULATION
// ═══════════════════════════════════════════════════════
function getPersonStartPage(index) {
  let start = 1;
  for (let i = 0; i < index; i++) {
    start += state.participants[i].pages;
  }
  return start;
}

function getDayRange(personIndex, dayIndex) {
  const personStart = getPersonStartPage(personIndex);
  const pages = state.participants[personIndex].pages;
  const start = personStart + dayIndex * pages;
  const end   = start + pages - 1;
  return { start, end };
}

function totalUsedPages() {
  return state.participants.reduce((s, p) => s + (parseInt(p.pages) || 0), 0);
}

function remainingPages() {
  return MAX_PAGES - totalUsedPages();
}

// ═══════════════════════════════════════════════════════
//  TOAST
// ═══════════════════════════════════════════════════════
function showToast(msg, type = 'success') {
  const icons = { success: '✅', error: '❌', warning: '⚠️' };
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.innerHTML = `<span>${icons[type]}</span><span>${msg}</span>`;
  document.getElementById('toast-container').appendChild(el);
  setTimeout(() => {
    el.style.animation = 'fadeOut 0.3s ease forwards';
    setTimeout(() => el.remove(), 300);
  }, 3000);
}

// ═══════════════════════════════════════════════════════
//  RENDER
// ═══════════════════════════════════════════════════════
function render() {
  const tbody = document.getElementById('participantBody');
  const empty = document.getElementById('emptyState');
  const table = document.getElementById('participantTable');
  const used  = totalUsedPages();
  const rem   = MAX_PAGES - used;
  const pct   = (used / MAX_PAGES) * 100;

  // Counter badge
  const badge = document.getElementById('remainingBadge');
  badge.textContent = rem;
  badge.className = 'counter-badge' + (pct >= 90 ? ' danger' : pct >= 70 ? ' warning' : '');

  // Progress bar
  const bar = document.getElementById('progressBar');
  bar.style.width = pct + '%';
  bar.className = 'progress-bar' + (pct >= 90 ? ' danger' : pct >= 70 ? ' warning' : '');

  // Footer
  document.getElementById('footerInfo').textContent =
    `Toplam ${state.participants.length} kişi · ${used} sayfa kullanıldı · ${rem} sayfa kaldı`;

  // List count
  document.getElementById('listCount').textContent = state.participants.length + ' kişi';

  // Empty state
  if (state.participants.length === 0) {
    empty.style.display = 'block';
    table.style.display = 'none';
    tbody.innerHTML = '';
    return;
  }
  empty.style.display = 'none';
  table.style.display = 'table';

  tbody.innerHTML = '';
  state.participants.forEach((p, i) => {
    const startPage = getPersonStartPage(i);
    const tr = document.createElement('tr');
    tr.dataset.id = p.id;
    
    tr.innerHTML = `
      <td class="td-num">${i + 1}</td>
      <td class="td-name" data-field="fullName" data-id="${p.id}">${escHtml(p.fullName)}</td>
      <td class="td-pages" data-field="pages" data-id="${p.id}">${p.pages}</td>
      <td class="td-range">Sf. ${startPage}</td>
      <td>
        <div class="td-actions">
          <button class="btn btn-ghost btn-icon" title="Yukarı" onclick="moveUp(${i})" ${i===0?'disabled':''}>▲</button>
          <button class="btn btn-ghost btn-icon" title="Aşağı" onclick="moveDown(${i})" ${i===state.participants.length-1?'disabled':''}>▼</button>
        </div>
      </td>
      <td>
        <div class="td-actions">
          <button class="btn btn-ghost btn-icon" title="Düzenle" onclick="editRow(${i})">✏️</button>
          <button class="btn btn-danger btn-icon" title="Sil" onclick="deleteParticipant(${i})">🗑️</button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function escHtml(str) {
  return String(str)
    .replace(/&/g,'&amp;')
    .replace(/</g,'&lt;')
    .replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;');
}

// ═══════════════════════════════════════════════════════
//  ADD PARTICIPANT
// ═══════════════════════════════════════════════════════
function addParticipant() {
  const name  = document.getElementById('addFullName').value.trim();
  const pages = parseInt(document.getElementById('addPages').value);

  if (!name) { showToast('İsim Soyisim alanı boş olamaz.', 'error'); return; }
  if (!pages || pages < 1) { showToast('Geçerli bir sayfa sayısı girin.', 'error'); return; }

  if (totalUsedPages() + pages > MAX_PAGES) {
    showToast(`Toplam sayfa sayısı 604'ü aşıyor! Kalan: ${remainingPages()} sayfa.`, 'error');
    return;
  }

  state.participants.push({
    id: Date.now(),
    fullName: name,
    pages
  });

  saveState();
  render();

  document.getElementById('addFullName').value = '';
  document.getElementById('addPages').value     = '';
  document.getElementById('addFullName').focus();
  showToast(`${name} eklendi.`, 'success');
}

// ═══════════════════════════════════════════════════════
//  DELETE
// ═══════════════════════════════════════════════════════
function deleteParticipant(index) {
  const p = state.participants[index];
  if (!confirm(`"${p.fullName}" listeden silinsin mi?`)) return;
  state.participants.splice(index, 1);
  saveState();
  render();
  showToast('Kişi silindi.', 'warning');
}

// ═══════════════════════════════════════════════════════
//  REORDER
// ═══════════════════════════════════════════════════════
function moveUp(index) {
  if (index === 0) return;
  [state.participants[index-1], state.participants[index]] =
  [state.participants[index], state.participants[index-1]];
  saveState();
  render();
}

function moveDown(index) {
  if (index === state.participants.length - 1) return;
  [state.participants[index+1], state.participants[index]] =
  [state.participants[index], state.participants[index+1]];
  saveState();
  render();
}

// ═══════════════════════════════════════════════════════
//  INLINE EDIT
// ═══════════════════════════════════════════════════════
function editRow(index) {
  const p = state.participants[index];
  const tr = document.querySelector(`tr[data-id="${p.id}"]`);
  if (!tr) return;

  // Replace cells with inputs
  const nameCell  = tr.querySelector('[data-field="fullName"]');
  const pagesCell = tr.querySelector('[data-field="pages"]');

  const nameInput  = makeInlineInput(p.fullName, 'text');
  const pagesInput = makeInlineInput(p.pages,     'number');
  pagesInput.min = 1; pagesInput.max = 604;

  nameCell.innerHTML  = '';
  pagesCell.innerHTML = '';
  nameCell.appendChild(nameInput);
  pagesCell.appendChild(pagesInput);

  // Replace action buttons
  const actCell = tr.querySelectorAll('td')[5];
  actCell.innerHTML = '';
  const saveBtn = document.createElement('button');
  saveBtn.className = 'btn btn-primary btn-icon';
  saveBtn.textContent = '💾';
  saveBtn.title = 'Kaydet';
  saveBtn.onclick = () => saveEdit(index, nameInput, pagesInput);

  const cancelBtn = document.createElement('button');
  cancelBtn.className = 'btn btn-ghost btn-icon';
  cancelBtn.textContent = '✕';
  cancelBtn.title = 'İptal';
  cancelBtn.onclick = () => render();

  const wrap = document.createElement('div');
  wrap.className = 'td-actions';
  wrap.appendChild(saveBtn);
  wrap.appendChild(cancelBtn);
  actCell.appendChild(wrap);

  nameInput.focus();
}

function makeInlineInput(value, type) {
  const inp = document.createElement('input');
  inp.className = 'inline-edit';
  inp.type  = type;
  inp.value = value;
  return inp;
}

function saveEdit(index, nameInput, pagesInput) {
  const name  = nameInput.value.trim();
  const pages = parseInt(pagesInput.value);

  if (!name) { showToast('İsim boş olamaz.', 'error'); return; }
  if (!pages || pages < 1) { showToast('Geçerli sayfa sayısı girin.', 'error'); return; }

  // Check 604 limit (exclude current person's pages)
  const otherPages = totalUsedPages() - state.participants[index].pages;
  if (otherPages + pages > MAX_PAGES) {
    showToast(`Bu değişiklik 604 sayfa limitini aşıyor! Kullanılabilir: ${MAX_PAGES - otherPages} sayfa.`, 'error');
    return;
  }

  state.participants[index] = { ...state.participants[index], fullName: name, pages };
  saveState();
  render();
  showToast('Değişiklikler kaydedildi.', 'success');
}

// ═══════════════════════════════════════════════════════
//  HEADER INPUTS → STATE
// ═══════════════════════════════════════════════════════
function bindHeaderInputs() {
  document.getElementById('hatimName').addEventListener('input', e => {
    state.hatimName = e.target.value;
    saveState();
  });
  document.getElementById('startDate').addEventListener('change', e => {
    state.startDate = e.target.value;
    saveState();
  });
  document.getElementById('endDate').addEventListener('change', e => {
    state.endDate = e.target.value;
    saveState();
  });
}

function restoreHeaderInputs() {
  document.getElementById('hatimName').value = state.hatimName || '';
  document.getElementById('startDate').value = state.startDate || '';
  document.getElementById('endDate').value   = state.endDate   || '';
}

// ═══════════════════════════════════════════════════════
//  ENTER KEY ON FORM
// ═══════════════════════════════════════════════════════
function bindFormEnter() {
  ['addFullName','addPages'].forEach(id => {
    document.getElementById(id).addEventListener('keydown', e => {
      if (e.key === 'Enter') addParticipant();
    });
  });
}

// ═══════════════════════════════════════════════════════
//  DATE HELPERS
// ═══════════════════════════════════════════════════════
function getDatesInRange(startStr, endStr) {
  const dates = [];
  const start = new Date(startStr);
  const end   = new Date(endStr);
  if (isNaN(start) || isNaN(end) || start > end) return dates;
  const cur = new Date(start);
  while (cur <= end) {
    dates.push(new Date(cur));
    cur.setDate(cur.getDate() + 1);
  }
  return dates;
}

function formatDate(d) {
  const day   = String(d.getDate()).padStart(2,'0');
  const month = String(d.getMonth()+1).padStart(2,'0');
  const year  = d.getFullYear();
  return `${day}.${month}.${year}`;
}

// ═══════════════════════════════════════════════════════
//  EXCEL EXPORT
// ═══════════════════════════════════════════════════════
function exportExcel() {
  if (state.participants.length === 0) {
    showToast('Önce katılımcı ekleyin.', 'warning');
    return;
  }
  if (!state.startDate || !state.endDate) {
    showToast('Lütfen tarih aralığı seçin.', 'warning');
    return;
  }

  const dates = getDatesInRange(state.startDate, state.endDate);
  if (dates.length === 0) {
    showToast('Geçerli bir tarih aralığı seçin.', 'error');
    return;
  }
  if (dates.length > 365) {
    showToast('Tarih aralığı çok uzun (max 365 gün).', 'error');
    return;
  }

  const wb = XLSX.utils.book_new();
  const wsData = [];

  // ── HEADER ROW ──
  const headerRow = ['#', 'İSİM SOYİSİM', 'SAYFA SAYISI'];
  dates.forEach(d => headerRow.push(formatDate(d)));
  wsData.push(headerRow);

  // ── DATA ROWS ──
  state.participants.forEach((p, i) => {
    const row = [i + 1, p.fullName, p.pages];
    dates.forEach((_, dayIndex) => {
      const { start, end } = getDayRange(i, dayIndex);
      row.push(`Sf: ${start}-${end}`);
    });
    wsData.push(row);
  });

  const ws = XLSX.utils.aoa_to_sheet(wsData);

  // ── AUTO-FIT COLUMN WIDTHS ──
  const colWidths = headerRow.map((_, colIdx) => {
    let max = 0;
    wsData.forEach(row => {
      const val = row[colIdx] !== undefined ? String(row[colIdx]) : '';
      if (val.length > max) max = val.length;
    });
    return { wch: Math.max(max + 2, 8) };
  });
  ws['!cols'] = colWidths;

  // ── STYLES ──
  const totalCols = headerRow.length;
  const totalRows = wsData.length;
  const range = XLSX.utils.decode_range(ws['!ref']);

  // Style every cell
  for (let R = range.s.r; R <= range.e.r; R++) {
    for (let C = range.s.c; C <= range.e.c; C++) {
      const cellAddr = XLSX.utils.encode_cell({ r: R, c: C });
      if (!ws[cellAddr]) ws[cellAddr] = { v: '', t: 's' };

      const isHeader = R === 0;
      ws[cellAddr].s = {
        font: {
          name: 'Calibri',
          sz: isHeader ? 11 : 10,
          bold: isHeader
        },
        fill: isHeader
          ? { fgColor: { rgb: 'D3D3D3' }, patternType: 'solid' }
          : { fgColor: { rgb: 'FFFFFF' }, patternType: 'solid' },
        border: {
          top:    { style: 'thin', color: { rgb: '000000' } },
          bottom: { style: 'thin', color: { rgb: '000000' } },
          left:   { style: 'thin', color: { rgb: '000000' } },
          right:  { style: 'thin', color: { rgb: '000000' } }
        },
        alignment: {
          horizontal: isHeader ? 'center' : (C < 3 ? 'left' : 'center'),
          vertical: 'center',
          wrapText: false
        }
      };
    }
  }

  // Row heights
  ws['!rows'] = wsData.map((_, i) => ({ hpt: i === 0 ? 20 : 18 }));

  const hatimName = state.hatimName || 'Hatim';
  XLSX.utils.book_append_sheet(wb, ws, hatimName.substring(0, 31));

  const fileName = `${hatimName.replace(/[\\/:*?"<>|]/g,'_')}_hatim.xlsx`;
  XLSX.writeFile(wb, fileName, { bookType: 'xlsx', cellStyles: true });
  showToast('Excel dosyası indirildi!', 'success');
}

// ═══════════════════════════════════════════════════════
//  INIT
// ═══════════════════════════════════════════════════════
(function init() {
  loadState();
  restoreHeaderInputs();
  bindHeaderInputs();
  bindFormEnter();
  render();
})();

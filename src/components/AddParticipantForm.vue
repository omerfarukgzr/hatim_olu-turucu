<template>
  <div class="add-card">
    <div class="card-header">
      <span class="card-title">➕ Kişi Ekle</span>
      <div class="page-counter">
        <span class="counter-label">Kalan Sayfa:</span>
        <span :class="badgeClass">{{ remainingPages }}</span>
      </div>
    </div>
    
    <!-- Single Entry Form -->
    <div class="add-form">
      <div class="form-group name-group">
        <label class="form-label" for="addFullName">İsim Soyisim</label>
        <input class="form-input" id="addFullName" type="text" placeholder="Ahmet Yılmaz" v-model="fullName" @keydown.enter="submit" />
      </div>
      <div class="form-group pages-group">
        <label class="form-label" for="addPages">Sayfa Sayısı</label>
        <input class="form-input" id="addPages" type="number" min="1" max="604" placeholder="20" v-model.number="pages" @keydown.enter="submit" />
      </div>
      
      <button class="btn btn-primary action-btn" id="addBtn" @click="submit">
        <span>＋</span> Ekle
      </button>
    </div>

    <div class="divider"></div>

    <!-- Bulk Upload Section -->
    <div class="bulk-upload-section">
      <div class="bulk-content">
        <span class="bulk-title">📂 Excel ile Toplu Yükleme</span>
        <p class="bulk-desc">
          Toplu kişi eklemek için önce şablonu indirin, verilerinizi girin ve ardından dosyayı buraya yükleyin.
          (1. Sütun: İsim, 2. Sütun: Sayfa Sayısı)
        </p>
      </div>
      <div class="bulk-buttons">
        <button class="btn btn-outline" @click="downloadTemplate" title="Örnek Dosya İndir">
          📄 Şablon İndir
        </button>
        
        <input 
          type="file" 
          ref="fileInputRef" 
          style="display: none" 
          accept=".xlsx, .xls" 
          @change="handleFileUpload" 
        />
        <button class="btn btn-success" @click="triggerFileInput" title="Excel Dosyası Yükle">
          Dosya Yükle
        </button>
      </div>
    </div>
    
    <div class="progress-wrap">
      <div :class="progressBarClass" :style="{ width: percentage + '%' }"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useToast } from '../composables/useToast';
import ExcelJS from 'exceljs';

const props = defineProps({
  remainingPages: Number,
  percentage: Number
});

const emit = defineEmits(['add', 'addBatch']);
const { show } = useToast();

const fullName = ref('');
const pages = ref('');
const fileInputRef = ref(null);

const badgeClass = computed(() => {
  return [
    'counter-badge',
    props.percentage >= 90 ? 'danger' : props.percentage >= 70 ? 'warning' : ''
  ];
});

const progressBarClass = computed(() => {
  return [
    'progress-bar',
    props.percentage >= 90 ? 'danger' : props.percentage >= 70 ? 'warning' : ''
  ];
});

function submit() {
  const name = fullName.value.trim();
  const ps = parseInt(pages.value);

  if (!name) {
    show('İsim Soyisim alanı boş olamaz.', 'error');
    return;
  }
  if (!ps || ps < 1) {
    show('Geçerli bir sayfa sayısı girin.', 'error');
    return;
  }

  emit('add', { fullName: name, pages: ps });

  fullName.value = '';
  pages.value = '';
}

function triggerFileInput() {
  fileInputRef.value.click();
}

async function handleFileUpload(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = async (evt) => {
    try {
      const buffer = evt.target.result;
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(buffer);
      const ws = workbook.getWorksheet(1); 
      
      if (!ws) {
        show('Excel dosyasında sayfa bulunamadı.', 'error');
        return;
      }

      const newParticipants = [];
      ws.eachRow((row, rowNumber) => {
        let nameVal = row.getCell(1).value;
        let pagesVal = row.getCell(2).value;

        if (nameVal && typeof nameVal === 'object' && nameVal.richText) {
          nameVal = nameVal.richText.map(r => r.text).join('');
        }
        
        let p = parseInt(pagesVal);

        if (isNaN(p)) return;

        const nameStr = String(nameVal || '').trim();
        if (nameStr && p > 0) {
          newParticipants.push({ fullName: nameStr, pages: p });
        }
      });

      newParticipants.sort((a, b) => b.pages - a.pages);

      if (newParticipants.length > 0) {
        emit('addBatch', newParticipants);
        e.target.value = ''; 
      } else {
         show('Dosyadan geçerli veri okunamadı.', 'warning');
      }
    } catch (err) {
      console.error(err);
      show('Dosya okuma hatası.', 'error');
    }
  };
  reader.readAsArrayBuffer(file);
}

async function downloadTemplate() {
  try {
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet('Şablon');
    
    // Headers
    const headerRow = ws.addRow(['İSİM SOYİSİM', 'SAYFA SAYISI']);
    headerRow.font = { bold: true };
    
    // Example Rows
    ws.addRow(['Ahmet Yılmaz', 20]);
    ws.addRow(['Mehmet Demir', 10]);
    
    // Styling
    ws.getColumn(1).width = 25;
    ws.getColumn(2).width = 15;
    ws.getColumn(2).alignment = { horizontal: 'center' };
    
    const buffer = await wb.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hatim_yukleme_sablonu.xlsx`;
    a.click();
    window.URL.revokeObjectURL(url);
    show('Şablon indirildi.', 'success');
  } catch(e) {
    show('Şablon oluşturulamadı.', 'error');
  }
}
</script>

<style scoped>
.add-form {
  display: flex;
  gap: 12px;
  align-items: flex-end;
  flex-wrap: wrap;
}

.name-group { flex: 2; min-width: 200px; }
.pages-group { flex: 0 0 120px; }

.action-btn { height: 42px; }

/* Global styles overrides */
.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.form-label {
  font-size: 11px;
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.07em;
}
.form-input {
  background: var(--surface2);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  color: var(--text);
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  padding: 10px 14px;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
}
.form-input:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px var(--accent-glow);
}
.add-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 24px;
  box-shadow: var(--shadow);
  margin-bottom: 24px;
}
.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 18px;
}
.card-title { font-size: 15px; font-weight: 700; color: var(--text); }

.page-counter { display: flex; align-items: center; gap: 10px; }
.counter-label { font-size: 12px; color: var(--text-muted); font-weight: 500; }
.counter-badge {
  background: linear-gradient(135deg, var(--accent), var(--accent2));
  color: #fff; font-size: 13px; font-weight: 700; padding: 4px 14px;
  border-radius: 20px; box-shadow: 0 0 12px var(--accent-glow);
}
.counter-badge.warning { background: linear-gradient(135deg, var(--yellow), #f97316); }
.counter-badge.danger { background: linear-gradient(135deg, var(--red), #dc2626); }

.progress-wrap {
  margin-top: 14px; background: var(--surface2); border-radius: 20px; height: 6px; overflow: hidden;
}
.progress-bar {
  height: 100%; border-radius: 20px; background: linear-gradient(90deg, var(--accent), var(--accent2));
  transition: width 0.4s ease;
}
.progress-bar.warning { background: linear-gradient(90deg, var(--yellow), #f97316); }
.progress-bar.danger { background: linear-gradient(90deg, var(--red), #dc2626); }

.btn {
  display: inline-flex; align-items: center; justify-content: center; gap: 7px;
  border: none; border-radius: var(--radius-sm); cursor: pointer;
  font-family: 'Inter', sans-serif; font-weight: 600; font-size: 13px; padding: 10px 18px;
  transition: all 0.2s; white-space: nowrap; height: 40px; 
}
.btn-primary { background: linear-gradient(135deg, var(--accent), var(--accent2)); color: #fff; }
.btn-success { background: linear-gradient(135deg, var(--green), #16a34a); color: #fff; }
.btn-outline { background: transparent; border: 1px solid var(--border); color: var(--text-muted); }
.btn-outline:hover { background: var(--surface2); color: var(--text); border-color: var(--text); }

/* Bulk Section Styles */
.divider { 
  margin: 20px 0; 
  border-top: 1px solid var(--border); 
}

.bulk-upload-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: var(--surface2);
  padding: 16px;
  border-radius: var(--radius-sm);
  border: 1px dashed var(--border);
}

.bulk-content {
  flex: 1;
  padding-right: 20px;
}

.bulk-title { 
  font-size: 14px; 
  font-weight: 600; 
  color: var(--text); 
  display: block; 
  margin-bottom: 4px; 
}

.bulk-desc { 
  font-size: 12px; 
  color: var(--text-muted); 
  margin: 0; 
  line-height: 1.4; 
}

.bulk-buttons { 
  display: flex; 
  gap: 10px; 
  align-items: center;
}

@media (max-width: 700px) {
  .add-form { flex-direction: column; align-items: stretch; }
  .name-group, .pages-group { flex: 1; width: 100%; }
  
  .bulk-upload-section { flex-direction: column; align-items: flex-start; gap: 12px; }
  .bulk-content { padding-right: 0; }
  .bulk-buttons { width: 100%; flex-direction: column; }
  .btn { width: 100%; }
}
</style>

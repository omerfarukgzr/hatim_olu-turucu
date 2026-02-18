<template>
  <div class="footer-card">
    <div class="stats">
      <div class="stat-item">
        <span class="stat-label">Toplam Kişi</span>
        <span class="stat-value">{{ count }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">Dağıtılan</span>
        <span class="stat-value">{{ used }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">Kalan</span>
        <span class="stat-value">{{ remaining }}</span>
      </div>
    </div>
    <div class="actions">
      <button class="btn btn-outline" @click="$emit('exportPdf')" title="PDF İndir">
        PDF İndir
      </button>
      <button class="btn btn-success" @click="$emit('export')" title="Excel İndir">
        Excel İndir
      </button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  count: Number,
  used: Number,
  remaining: Number
});
defineEmits(['export', 'exportPdf']);
</script>

<style scoped>
.footer-card {
  background: var(--surface);
  border-top: 1px solid var(--border);
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: sticky;
  bottom: 0;
  backdrop-filter: blur(10px);
  z-index: 10;
}

.stats {
  display: flex;
  gap: 20px;
}

.stat-item {
  display: flex;
  flex-direction: column;
}

.stat-label {
  font-size: 11px;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.stat-value {
  font-size: 18px;
  font-weight: 700;
  color: var(--text);
}

.actions {
  display: flex;
  gap: 12px;
}

.btn {
  display: inline-flex; align-items: center; justify-content: center; gap: 7px;
  border: none; border-radius: var(--radius-sm); cursor: pointer;
  font-family: 'Inter', sans-serif; font-weight: 600; font-size: 13px; padding: 10px 18px;
  transition: all 0.2s; white-space: nowrap; height: 40px; 
}
.btn-success { background: linear-gradient(135deg, var(--green), #16a34a); color: #fff; }
.btn-outline { 
  background: transparent; border: 1px solid var(--border); color: var(--text); 
}
.btn-outline:hover { background: var(--surface2); border-color: var(--text-muted); }

@media (max-width: 600px) {
  .footer-card { flex-direction: column; gap: 16px; align-items: stretch; }
  .stats { justify-content: space-between; }
  .actions { flex-direction: column; }
  .btn { width: 100%; }
}
</style>

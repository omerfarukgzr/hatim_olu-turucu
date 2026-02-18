<template>
  <div class="add-card" style="margin-bottom: 24px;">
    <div class="card-header">
      <span class="card-title">📖 Hatim Bilgileri</span>
    </div>
    <div class="info-form">
      <div class="form-group hatim-name">
        <label class="form-label" for="hatimName">Hatim Adı</label>
        <input class="form-input" id="hatimName" type="text" placeholder="Örn: Ramazan Hatmi" :value="hatimName" @input="$emit('update:hatimName', $event.target.value)" />
      </div>
      <div class="form-group">
        <label class="form-label" for="startDate">Başlangıç</label>
        <input class="form-input" id="startDate" type="date" :value="startDate" @change="$emit('update:startDate', $event.target.value)" />
      </div>
      <div class="form-group">
        <label class="form-label" for="endDate">Bitiş</label>
        <input class="form-input" id="endDate" type="date" :value="endDate" @change="$emit('update:endDate', $event.target.value)" />
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  hatimName: String,
  startDate: String,
  endDate: String
});
defineEmits(['update:hatimName', 'update:startDate', 'update:endDate']);
</script>

<style scoped>
.info-form {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  gap: 12px;
  align-items: end;
}
@media (max-width: 700px) {
  .info-form { grid-template-columns: 1fr; }
}

.hatim-name { width: 100%; }

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
}

.card-header {
  margin-bottom: 18px;
}
.card-title {
  font-size: 15px;
  font-weight: 700;
  color: var(--text);
}
</style>

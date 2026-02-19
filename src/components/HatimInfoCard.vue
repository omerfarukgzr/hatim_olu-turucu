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
  gap: 16px;
  align-items: end;
}
@media (max-width: 700px) {
  .info-form { grid-template-columns: 1fr; }
}

.hatim-name { width: 100%; }
</style>

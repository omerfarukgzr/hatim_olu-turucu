<template>
  <header class="app-header">
    <div class="header-top">
      <div class="logo">
        <img src="../assets/logo.png" alt="Hatim Takip Logo" style="width: 100%; height: 100%; object-fit: cover; border-radius: 12px;" />
      </div>
      <div>
        <h1 class="app-title">Hatim Takip</h1>
      </div>
    </div>
    <div class="header-fields">
      <div class="field-group">
        <label class="field-label" for="hatimName">Hatim Adı</label>
        <input class="field-input" id="hatimName" type="text" placeholder="Örn: Ramazan Hatmi 2025" :value="hatimName" @input="$emit('update:hatimName', $event.target.value)" />
      </div>
      <div class="field-group">
        <label class="field-label" for="startDate">Başlangıç Tarihi</label>
        <input class="field-input" id="startDate" type="date" :value="startDate" @change="$emit('update:startDate', $event.target.value)" />
      </div>
      <div class="field-group">
        <label class="field-label" for="endDate">Bitiş Tarihi</label>
        <input class="field-input" id="endDate" type="date" :value="endDate" @change="$emit('update:endDate', $event.target.value)" />
      </div>
    </div>
  </header>
</template>

<script setup>
defineProps({
  hatimName: String,
  startDate: String,
  endDate: String
});
</script>

<template>
  <div class="list-card">
    <div class="list-header">
      <span class="list-title">👥 Katılımcı Listesi</span>
      <span class="list-count">{{ participants.length }} kişi</span>
    </div>
    <div class="table-wrap">
      <table v-if="participants.length > 0">
        <thead>
          <tr>
            <th>#</th>
            <th>İSİM SOYİSİM</th>
            <th>SAYFA SAYISI</th>
            <th>BAŞLANGIÇ SF.</th>
            <th>SIRALA</th>
            <th>İŞLEMLER</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(p, index) in participants" :key="p.id">
            <td class="td-num">{{ index + 1 }}</td>
            <td class="td-name">
              <input v-if="editingId === p.id" v-model="editName" class="inline-edit" type="text" />
              <span v-else>{{ p.fullName }}</span>
            </td>
            <td class="td-pages">
              <input v-if="editingId === p.id" v-model.number="editPages" class="inline-edit" type="number" min="1" max="604" />
              <span v-else>{{ p.pages }}</span>
            </td>
            <td class="td-range">Sf. {{ getStartPage(index) }}</td>
            <td>
              <div class="td-actions">
                <button class="btn btn-ghost btn-icon" title="Yukarı" @click="$emit('move', index, 'up')" :disabled="index === 0">▲</button>
                <button class="btn btn-ghost btn-icon" title="Aşağı" @click="$emit('move', index, 'down')" :disabled="index === participants.length - 1">▼</button>
              </div>
            </td>
            <td>
              <div class="td-actions" v-if="editingId === p.id">
                <button class="btn btn-primary btn-icon" title="Kaydet" @click="save(index)">💾</button>
                <button class="btn btn-ghost btn-icon" title="İptal" @click="cancelEdit">✕</button>
              </div>
              <div class="td-actions" v-else>
                <button class="btn btn-ghost btn-icon" title="Düzenle" @click="startEdit(p)">✏️</button>
                <button class="btn btn-danger btn-icon" title="Sil" @click="$emit('delete', index)">🗑️</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
      <div v-else class="empty-state">
        <div class="empty-icon">📋</div>
        <div class="empty-text">Henüz katılımcı eklenmedi</div>
        <div class="empty-sub">Yukarıdaki formu kullanarak kişi ekleyin</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const props = defineProps({
  participants: Array,
  getStartPage: Function
});

const emit = defineEmits(['delete', 'move', 'update']);

const editingId = ref(null);
const editName = ref('');
const editPages = ref('');

function startEdit(p) {
  editingId.value = p.id;
  editName.value = p.fullName;
  editPages.value = p.pages;
}

function cancelEdit() {
  editingId.value = null;
  editName.value = '';
  editPages.value = '';
}

function save(index) {
  if (!editName.value.trim()) return;
  if (!editPages.value || editPages.value < 1) return;
  
  emit('update', index, { fullName: editName.value, pages: parseInt(editPages.value) });
  cancelEdit();
}
</script>

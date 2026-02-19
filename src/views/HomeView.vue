<template>
  <header class="app-header">
    <div class="header-top">
      <div style="display: flex; align-items: center; gap: 20px;">
        <div class="logo">
          <img src="../assets/logo.png" alt="Hatim Takip Logo" style="width: 100%; height: 100%; object-fit: cover; border-radius: 12px;" />
        </div>
        <h1 class="app-title">Hatim Takip</h1>
      </div>
      <div v-if="user" class="user-info-section">
        <UserMenu />
      </div>
    </div>
  </header>

  <main class="main">
    <div class="list-card">
      <div class="list-header">
        <div style="display: flex; align-items: center; gap: 12px;">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 20px; height: 20px; color: var(--accent);">
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
          </svg>
          <span class="list-title">Hatim Listesi</span>
        </div>
        <button class="btn btn-primary" @click="openCreateModal">
          <svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" style="width: 16px; height: 16px; margin-right: 8px;">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          Yeni Hatim Oluştur
        </button>
      </div>
      <div class="table-wrap">
        <table v-if="hatims.length > 0">
          <thead>
            <tr>
              <th>HATIM ADI</th>
              <th>TARİH ARALIĞI</th>
              <th>KİŞİ SAYISI</th>
              <th>İŞLEMLER</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="h in hatims" :key="h.id" class="cursor-pointer" @click="goToDetail(h.id)">
              <td class="td-name">{{ h.name }}</td>
              <td class="td-range">
                <span v-if="h.startDate">{{ formatDate(h.startDate) }} - {{ formatDate(h.endDate) }}</span>
                <span v-else class="text-muted">-</span>
              </td>
              <td class="td-pages">
                <span class="counter-badge">{{ (h.participants || []).length }}</span>
              </td>
              <td class="td-actions" @click.stop>
                <button class="btn btn-danger btn-icon" @click="openDeleteModal(h.id)">🗑️</button>
              </td>
            </tr>
          </tbody>
        </table>
        <div v-else class="empty-state">
          <div class="empty-icon">📂</div>
          <div class="empty-text">Henüz hatim oluşturulmadı</div>
          <div class="empty-sub">Yeni bir hatim oluşturarak başlayın</div>
        </div>
      </div>
    </div>
  </main>

  <!-- Create Modal -->
  <BaseModal 
    :isOpen="createModalOpen" 
    title="Yeni Hatim Oluştur" 
    confirmText="Oluştur" 
    @close="createModalOpen = false" 
    @confirm="createConfirm"
  >
    <div class="field-group">
      <label class="field-label">Hatim Adı</label>
      <input 
        ref="createInput"
        v-model="newHatimName" 
        class="field-input" 
        placeholder="Örn: Ramazan Hatmi 2025" 
        @keydown.enter="createConfirm" 
      />
    </div>
  </BaseModal>

  <!-- Delete Modal -->
  <BaseModal 
    :isOpen="deleteModalOpen" 
    title="Hatimi Sil" 
    confirmText="Sil" 
    @close="deleteModalOpen = false" 
    @confirm="deleteConfirm"
  >
    <p>Bu hatimi silmek istediğinize emin misiniz? <br><br>Bu işlem geri alınamaz.</p>
  </BaseModal>
</template>

<script setup>
import { ref, nextTick, onMounted } from 'vue';
import { useHatim } from '../composables/useHatim';
import { useAuth } from '../composables/useAuth';
import { useRouter } from 'vue-router';
import BaseModal from '../components/BaseModal.vue';
import UserMenu from '../components/UserMenu.vue';

const { hatims, createHatim, deleteHatim, loadAll } = useHatim();
const { user } = useAuth();
const router = useRouter();

onMounted(() => {
  loadAll();
});

// Create Modal State
const createModalOpen = ref(false);
const newHatimName = ref('');
const createInput = ref(null);

// Delete Modal State
const deleteModalOpen = ref(false);
const deleteId = ref(null);

function openCreateModal() {
  newHatimName.value = '';
  createModalOpen.value = true;
  nextTick(() => {
    if (createInput.value) createInput.value.focus();
  });
}

async function createConfirm() {
  const name = newHatimName.value.trim() || 'Yeni Hatim';
  const id = await createHatim(name);
  if (id) {
    createModalOpen.value = false;
    router.push(`/hatim/${id}`);
  }
}

function openDeleteModal(id) {
  deleteId.value = id;
  deleteModalOpen.value = true;
}

async function deleteConfirm() {
  if (deleteId.value) {
    await deleteHatim(deleteId.value);
    deleteId.value = null;
  }
  deleteModalOpen.value = false;
}

function goToDetail(id) {
  router.push(`/hatim/${id}`);
}

function formatDate(d) {
  if (!d) return '';
  return d.split('-').reverse().join('.');
}
</script>

<style scoped>
.cursor-pointer { cursor: pointer; }
</style>

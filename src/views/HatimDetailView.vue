<template>
  <div v-if="hatim">
    <div class="nav-bar">
      <button class="btn btn-ghost" @click="$router.push('/')">⬅️ Hatim Listesine Dön</button>
      <UserMenu />
    </div>

    <main class="main">
      <HatimInfoCard
        v-model:hatimName="hatim.name"
        v-model:startDate="hatim.startDate"
        v-model:endDate="hatim.endDate"
      />

      <AddParticipantForm
        :remainingPages="remaining"
        :percentage="percentage"
        @add="handleAdd"
        @addBatch="handleAddBatch"
      />

      <ParticipantList
        :participants="hatim.participants"
        :getStartPage="idx => getStartPage(idx)"
        @delete="openDeleteModal"
        @move="handleMove"
        @update="handleUpdate"
        @reorder="handleReorder"
      />

      <AppFooter
        :count="hatim.participants.length"
        :used="total"
        :remaining="remaining"
        @export="handleExport"
        @exportPdf="handleExportPdf"
      />
    </main>

    <!-- Delete Modal -->
    <BaseModal 
      :isOpen="deleteModalOpen" 
      title="Kişiyi Sil" 
      confirmText="Sil" 
      @close="deleteModalOpen = false" 
      @confirm="confirmDelete"
    >
      <p>"{{ deleteName }}" adlı kişiyi listeden silmek istediğinize emin misiniz?</p>
    </BaseModal>
  </div>
  <div v-else class="not-found">
    Hatim bulunamadı. <button @click="$router.push('/')">Listeye Dön</button>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useHatim } from '../composables/useHatim';
import { useToast } from '../composables/useToast';

import HatimInfoCard from '../components/HatimInfoCard.vue';
import AddParticipantForm from '../components/AddParticipantForm.vue';
import ParticipantList from '../components/ParticipantList.vue';
import AppFooter from '../components/AppFooter.vue';
import BaseModal from '../components/BaseModal.vue';
import UserMenu from '../components/UserMenu.vue';

const route = useRoute();
const { hatims, calculateStats, getPersonStartPage, exportExcel, exportPdf, MAX_PAGES, updateHatim, loadHatim } = useHatim();
const { show } = useToast();

const hatim = ref(null);
const isLoading = ref(true);

onMounted(async () => {
  const id = route.params.id;
  // Try to find in global state first
  const existing = hatims.value.find(h => h.id === id);
  if (existing) {
    hatim.value = { ...existing };
  } else {
    // Fetch from Supabase directly (for shared links)
    const data = await loadHatim(id);
    if (data) {
      hatim.value = data;
    }
  }
  isLoading.value = false;
});

// Deep watch and auto-save (debounced would be better, but let's keep it simple for now or manual save)
// For now, let's call updateHatim manually to avoid excessive API calls
async function triggerSave() {
  if (hatim.value) {
    await updateHatim(hatim.value.id, {
      name: hatim.value.name,
      startDate: hatim.value.startDate,
      endDate: hatim.value.endDate,
      participants: hatim.value.participants
    });
  }
}

const stats = computed(() => {
  if (!hatim.value) return { total: 0, remaining: 604, percentage: 0 };
  return calculateStats(hatim.value.participants);
});

const total = computed(() => stats.value.total);
const remaining = computed(() => stats.value.remaining);
const percentage = computed(() => stats.value.percentage);

// Delete Modal State
const deleteModalOpen = ref(false);
const deleteIndex = ref(null);
const deleteName = ref('');

function getStartPage(index) {
  if (!hatim.value) return 1;
  return getPersonStartPage(hatim.value.participants, index);
}

async function handleAdd({ fullName, pages }) {
  hatim.value.participants.push({
    id: Date.now().toString(),
    fullName,
    pages
  });
  await triggerSave();
  show(`${fullName} eklendi.`);
}

async function handleAddBatch(newParticipants) {
  let count = 0;
  
  newParticipants.sort((a, b) => b.pages - a.pages);

  for (const p of newParticipants) {
    hatim.value.participants.push({
      id: (Date.now() + Math.random()).toString(),
      fullName: p.fullName,
      pages: p.pages
    });
    count++;
  }
  
  if (count > 0) {
    await triggerSave();
    show(`${count} kişi listeden eklendi.`, 'success');
  }
}

function openDeleteModal(index) {
  const p = hatim.value.participants[index];
  if (p) {
    deleteName.value = p.fullName;
    deleteIndex.value = index;
    deleteModalOpen.value = true;
  }
}

async function confirmDelete() {
  if (deleteIndex.value !== null && hatim.value) {
    hatim.value.participants.splice(deleteIndex.value, 1);
    await triggerSave();
    show('Kişi silindi.', 'warning');
    deleteIndex.value = null;
  }
  deleteModalOpen.value = false;
}

async function handleMove(index, direction) {
  const p = hatim.value.participants;
  if (direction === 'up' && index > 0) {
    [p[index], p[index - 1]] = [p[index - 1], p[index]];
    await triggerSave();
  } else if (direction === 'down' && index < p.length - 1) {
    [p[index], p[index + 1]] = [p[index + 1], p[index]];
    await triggerSave();
  }
}

async function handleReorder({ from, to, position }) {
  const p = hatim.value.participants;
  const item = p.splice(from, 1)[0];
  
  // Calculate new index after splice
  let newIndex = to;
  if (from < to && position === 'top') newIndex = to - 1;
  else if (from > to && position === 'bottom') newIndex = to + 1;
  
  p.splice(newIndex, 0, item);
  await triggerSave();
}

async function handleUpdate(index, { fullName, pages }) {
  hatim.value.participants[index].fullName = fullName;
  hatim.value.participants[index].pages = pages;
  await triggerSave();
  show('Güncellendi.');
}

function handleExport() {
  try {
    exportExcel(hatim.value);
    show('Excel indirildi!');
  } catch (e) {
    show(e.message, 'error');
  }
}

function handleExportPdf() {
  try {
    exportPdf(hatim.value);
    show('PDF indiriliyor...', 'success');
  } catch (e) {
    show(e.message, 'error');
  }
}

// Watchers for basic info
watch(() => hatim.value?.name, triggerSave);
watch(() => hatim.value?.startDate, triggerSave);
watch(() => hatim.value?.endDate, triggerSave);
</script>

<style scoped>
.nav-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--border-soft);
  padding: 16px 24px;
  position: sticky;
  top: 0;
  z-index: 101;
}
.not-found {
  padding: 100px 24px;
  text-align: center;
  color: var(--text-muted);
}
.not-found button {
  margin-left: 10px;
  padding: 8px 16px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border);
  background: var(--surface);
  cursor: pointer;
}
</style>

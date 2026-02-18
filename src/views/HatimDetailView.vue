<template>
  <div v-if="hatim">
    <div class="nav-bar">
      <button class="btn btn-ghost" @click="$router.push('/')">⬅️ Hatim Listesine Dön</button>
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
  if (total.value + pages > MAX_PAGES) {
    show(`Toplam sayfa sayısı 604'ü aşıyor! Kalan: ${remaining.value}`, 'error');
    return;
  }
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
  let currentTotal = total.value;
  
  newParticipants.sort((a, b) => b.pages - a.pages);

  for (const p of newParticipants) {
    if (currentTotal + p.pages <= MAX_PAGES) {
      hatim.value.participants.push({
        id: (Date.now() + Math.random()).toString(),
        fullName: p.fullName,
        pages: p.pages
      });
      currentTotal += p.pages;
      count++;
    } else {
      show(`Limit doldu! Kalan ${newParticipants.length - count} kişi eklenemedi.`, 'warning');
      break;
    }
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

async function handleUpdate(index, { fullName, pages }) {
  const currentPages = hatim.value.participants[index].pages;
  const otherPages = total.value - currentPages;
  
  if (otherPages + pages > MAX_PAGES) {
    show(`Limit aşılıyor! Kalan: ${MAX_PAGES - otherPages}`, 'error');
    return;
  }
  
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
  background: var(--surface);
  border-bottom: 1px solid var(--border);
  padding: 10px 20px;
}
.not-found {
  padding: 40px;
  text-align: center;
  color: var(--text-muted);
}
</style>

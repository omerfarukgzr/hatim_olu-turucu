<template>
  <teleport to="body">
    <div v-if="isOpen" class="modal-backdrop" @click="$emit('close')">
      <div class="modal-card" @click.stop>
        <div class="modal-header">
          <h3>{{ title }}</h3>
          <button class="btn-close" @click="$emit('close')">✕</button>
        </div>
        
        <div class="modal-body">
          <slot></slot>
        </div>
        
        <div class="modal-footer">
          <button class="btn btn-ghost" @click="$emit('close')">İptal</button>
          <button class="btn btn-primary" @click="$emit('confirm')">
            {{ confirmText || 'Onayla' }}
          </button>
        </div>
      </div>
    </div>
  </teleport>
</template>

<script setup>
defineProps({
  isOpen: Boolean,
  title: String,
  confirmText: String
});
defineEmits(['close', 'confirm']);
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  top: 0; 
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  animation: fadeIn 0.2s ease-out;
}

.modal-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 24px;
  width: 90%;
  max-width: 420px;
  box-shadow: var(--shadow-lg);
  display: flex;
  flex-direction: column;
  gap: 20px;
  animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  font-size: 18px;
  font-weight: 700;
}

.btn-close {
  background: none;
  border: none;
  color: var(--text-muted);
  font-size: 20px;
  cursor: pointer;
  padding: 4px;
}

.btn-close:hover { color: var(--text); }

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}
</style>

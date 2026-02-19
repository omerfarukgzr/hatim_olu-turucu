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
  background: rgba(45, 52, 54, 0.4);
  backdrop-filter: blur(8px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-card {
  background: var(--surface);
  border: 1px solid var(--border-soft);
  border-radius: var(--radius);
  padding: 32px;
  width: 90%;
  max-width: 460px;
  box-shadow: var(--shadow-lg);
  display: flex;
  flex-direction: column;
  gap: 24px;
  animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  font-family: 'Lora', serif;
  font-size: 22px;
  font-weight: 700;
  color: var(--accent);
}

.btn-close {
  background: var(--bg-alt);
  border: none;
  color: var(--text-muted);
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: var(--transition);
}

.btn-close:hover { 
  background: var(--border-soft);
  color: var(--text); 
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 8px;
}

@keyframes slideUp {
  from { transform: translateY(30px) scale(0.98); opacity: 0; }
  to { transform: translateY(0) scale(1); opacity: 1; }
}
</style>

<template>
  <div class="user-menu-container" v-if="user" v-click-outside="closeDropdown">
    <div class="avatar-trigger" @click="toggleDropdown">
      <div class="avatar-circle">
        {{ user.email[0].toUpperCase() }}
      </div>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="chevron">
        <polyline points="6 9 12 15 18 9"></polyline>
      </svg>
    </div>

    <transition name="fade-slide">
      <div v-if="isDropdownOpen" class="dropdown-menu">
        <div class="dropdown-header">
          <div class="user-name">{{ user.email }}</div>
        </div>
        <div class="dropdown-divider"></div>
        <button class="dropdown-item" @click="openProfileModal">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="item-icon">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
          Profil Yönetimi
        </button>
        <button class="dropdown-item logout" @click="handleLogout">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="item-icon">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
            <polyline points="16 17 21 12 16 7"></polyline>
            <line x1="21" y1="12" x2="9" y2="12"></line>
          </svg>
          Çıkış Yap
        </button>
      </div>
    </transition>

    <!-- Profile Modal -->
    <BaseModal 
      :isOpen="profileModalOpen" 
      title="Profil Yönetimi" 
      confirmText="Güncelle" 
      @close="profileModalOpen = false" 
      @confirm="submitUpdate"
    >
      <div class="profile-form">
        <div class="form-group">
          <label class="form-label">E-posta</label>
          <input v-model="editEmail" type="email" class="form-input" />
        </div>
        <div class="form-group">
          <label class="form-label">Yeni Şifre (Değiştirmek istemiyorsanız boş bırakın)</label>
          <input v-model="editPassword" type="password" class="form-input" placeholder="••••••••" />
        </div>
      </div>
    </BaseModal>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import { useAuth } from '../composables/useAuth';
import { useToast } from '../composables/useToast';
import { useRouter } from 'vue-router';
import BaseModal from './BaseModal.vue';

const { user, signOut, updateProfile } = useAuth();
const { show } = useToast();
const router = useRouter();

const isDropdownOpen = ref(false);
const profileModalOpen = ref(false);

const editEmail = ref('');
const editPassword = ref('');

function toggleDropdown() {
  isDropdownOpen.value = !isDropdownOpen.value;
}

function closeDropdown() {
  isDropdownOpen.value = false;
}

// Sync editEmail only when modal opens or user is first loaded
function openProfileModal() {
  editEmail.value = user.value?.email || '';
  editPassword.value = '';
  profileModalOpen.value = true;
  isDropdownOpen.value = false;
}

async function handleLogout() {
  await signOut();
  router.push('/login');
}

async function submitUpdate() {
  try {
    const updates = {};
    const emailChanged = editEmail.value !== user.value.email;
    const passwordChanged = editPassword.value.length > 0;

    if (!emailChanged && !passwordChanged) {
      profileModalOpen.value = false;
      return;
    }

    if (emailChanged) updates.email = editEmail.value;
    if (passwordChanged) updates.password = editPassword.value;
    
    const result = await updateProfile(updates);
    
    // Check if Supabase requires email confirmation even if it returned success
    if (emailChanged && result.user.email !== editEmail.value) {
      show('E-posta değişim isteği gönderildi. Lütfen yeni e-posta adresinize gönderilen onay mesajını kontrol edin.', 'info');
    } else {
      show('Profil başarıyla güncellendi.', 'success');
    }
    
    profileModalOpen.value = false;
    editPassword.value = '';
  } catch (err) {
    show(err.message, 'error');
  }
}

// Simple click outside directive logic
const vClickOutside = {
  mounted(el, binding) {
    el.clickOutsideEvent = (event) => {
      if (!(el === event.target || el.contains(event.target))) {
        binding.value();
      }
    };
    document.addEventListener('click', el.clickOutsideEvent);
  },
  unmounted(el) {
    document.removeEventListener('click', el.clickOutsideEvent);
  },
};
</script>

<style scoped>
.user-menu-container {
  position: relative;
}

.avatar-trigger {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 30px;
  transition: var(--transition);
}

.avatar-trigger:hover {
  background: var(--accent-soft);
}

.avatar-circle {
  width: 36px;
  height: 36px;
  background: var(--accent);
  color: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 16px;
  box-shadow: 0 4px 10px rgba(74, 103, 65, 0.2);
}

.chevron {
  width: 16px;
  height: 16px;
  color: var(--text-muted);
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 8px;
  background: #fff;
  border: 1px solid var(--border-soft);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);
  min-width: 220px;
  z-index: 200;
  overflow: hidden;
}

.dropdown-header {
  padding: 16px;
}

.user-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--text);
  word-break: break-all;
}

.dropdown-divider {
  height: 1px;
  background: var(--border-soft);
}

.dropdown-item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border: none;
  background: none;
  color: var(--text);
  font-size: 14px;
  font-weight: 500;
  text-align: left;
  cursor: pointer;
  transition: var(--transition);
}

.dropdown-item:hover {
  background: var(--bg-alt);
  color: var(--accent);
}

.dropdown-item.logout {
  color: var(--red);
}

.dropdown-item.logout:hover {
  background: #fff5f5;
}

.item-icon {
  width: 18px;
  height: 18px;
}

.profile-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.fade-slide-enter-active, .fade-slide-leave-active {
  transition: all 0.2s ease;
}

.fade-slide-enter-from, .fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>

<template>
  <div v-if="show" class="dialog-portal">
    <div class="dialog-overlay" @click="handleClose">
      <div class="dialog-container" @click.stop>
        <div class="dialog-header">
          <h3>添加到书签</h3>
          <button class="close-button" @click="handleClose">×</button>
        </div>
        
        <div class="dialog-content">
          <div class="form-group">
            <label>标题:</label>
            <input 
              v-model="localDialog.title" 
              type="text" 
              class="form-input"
              :class="{ error: !localDialog.title.trim() }"
              placeholder="请输入书签标题"
              maxlength="100"
            />
          </div>
          
          <div class="form-group">
            <label>URL:</label>
            <input 
              v-model="localDialog.url" 
              type="text" 
              class="form-input" 
              readonly 
            />
          </div>
          
          <div class="form-group">
            <label>文件夹:</label>
            <select v-model="localDialog.parentId" class="form-select">
              <option value="">选择文件夹</option>
              <option 
                v-for="folder in folders" 
                :key="folder.id" 
                :value="folder.id"
              >
                {{ folder.title }}
              </option>
            </select>
          </div>
        </div>
        
        <div class="dialog-footer">
          <button class="button button-secondary" @click="handleClose">
            取消
          </button>
          <button 
            class="button button-primary" 
            @click="handleSave"
            :disabled="!localDialog.title.trim() || saving"
          >
            {{ saving ? '保存中...' : '保存' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import type { BookmarkDialogState, BookmarkFolder } from '../utils/composables/useBookmarks';

interface Props {
  show: boolean;
  dialog: BookmarkDialogState;
  folders: { id: string; title: string }[];
}

interface Emits {
  (e: 'close'): void;
  (e: 'save', data: { title: string; url: string; parentId: string }): Promise<void>;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const saving = ref(false);

// 本地对话框状态，避免直接修改props
const localDialog = ref({
  title: '',
  url: '',
  parentId: ''
});

// 监听props变化，同步到本地状态
watch(() => props.dialog, (newDialog) => {
  localDialog.value = {
    title: newDialog.title,
    url: newDialog.url,
    parentId: newDialog.parentId
  };
}, { immediate: true, deep: true });

const handleClose = () => {
  emit('close');
};

const handleSave = async () => {
  if (!localDialog.value.title.trim()) {
    return;
  }

  saving.value = true;
  try {
    await emit('save', {
      title: localDialog.value.title.trim(),
      url: localDialog.value.url,
      parentId: localDialog.value.parentId
    });
  } catch (error) {
    console.error('保存书签失败:', error);
  } finally {
    saving.value = false;
  }
};
</script>

<style scoped>
.dialog-portal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 10000;
}

.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(4px);
  animation: fadeIn 0.3s ease-out;
}

.dialog-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
  width: 90%;
  max-width: 480px;
  max-height: 90vh;
  overflow: hidden;
  animation: slideIn 0.3s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.dialog-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  border-bottom: 1px solid #e2e8f0;
  background: #f8fafc;
}

.dialog-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #2d3748;
}

.close-button {
  background: none;
  border: none;
  cursor: pointer;
  color: #718096;
  font-size: 24px;
  padding: 4px;
  border-radius: 6px;
  transition: all 0.2s ease;
  line-height: 1;
}

.close-button:hover {
  background: #e2e8f0;
  color: #2d3748;
}

.dialog-content {
  padding: 20px;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 6px;
  font-weight: 500;
  color: #4a5568;
  font-size: 14px;
}

.form-input,
.form-select {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.2s ease;
  box-sizing: border-box;
}

.form-input:focus,
.form-select:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-input[readonly] {
  background: #f7fafc;
  color: #718096;
}

.form-input.error {
  border-color: #e53e3e;
}

.form-input.error:focus {
  border-color: #e53e3e;
  box-shadow: 0 0 0 3px rgba(229, 62, 62, 0.1);
}

.dialog-footer {
  padding: 20px;
  background: #f8fafc;
  border-top: 1px solid #e2e8f0;
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.button {
  padding: 10px 20px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  min-width: 80px;
}

.button-secondary {
  background: #e2e8f0;
  color: #4a5568;
}

.button-secondary:hover {
  background: #cbd5e0;
}

.button-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.button-primary:hover:not(:disabled) {
  background: linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.button-primary:disabled {
  background: #cbd5e0;
  color: #a0aec0;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}
</style> 
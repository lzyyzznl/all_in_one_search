<template>
  <div class="settings-container">
    <h2>插件设置</h2>
    
    <div class="setting-item">
      <label>快捷键设置</label>
      <div class="shortcut-input">
        <input 
          type="text" 
          v-model="shortcut" 
          @keydown.prevent="captureShortcut"
          placeholder="按下快捷键组合"
        />
        <button @click="saveShortcut">保存</button>
      </div>
      <p class="hint">支持组合键如: Ctrl+Shift+Space</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

const shortcut = ref('');

// 获取当前快捷键
const getCurrentShortcut = async () => {
  const commands = await chrome.commands.getAll();
  const openCommand = commands.find(c => c.name === '_execute_action');
  shortcut.value = openCommand?.shortcut || '';
};

// 捕获快捷键
const captureShortcut = (e: KeyboardEvent) => {
  const keys = [];
  if (e.ctrlKey) keys.push('Ctrl');
  if (e.shiftKey) keys.push('Shift');
  if (e.altKey) keys.push('Alt');
  if (e.metaKey) keys.push('Meta');
  
  // 排除修饰键本身
  if (!['Control', 'Shift', 'Alt', 'Meta'].includes(e.key)) {
    keys.push(e.key);
  }
  
  shortcut.value = keys.join('+');
};

// 保存快捷键
const saveShortcut = async () => {
  try {
    await chrome.storage.sync.set({ shortcut: shortcut.value });
    alert('快捷键保存成功！请重启插件后生效');
    console.log('保存的快捷键:', shortcut.value);
  } catch (error) {
    console.error('保存快捷键失败:', error);
    alert('保存失败，请重试');
  }
};

onMounted(() => {
  getCurrentShortcut();
});
</script>

<style lang="less" scoped>
.settings-container {
  padding: 16px;
  max-width: 600px;
  margin: 0 auto;
}

.setting-item {
  margin-bottom: 20px;
}

label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
}

.shortcut-input {
  display: flex;
  gap: 8px;
  
  input {
    flex: 1;
    padding: 8px;
    border: 1px solid #ddd;
    border-radius: 4px;
  }
  
  button {
    padding: 8px 16px;
    background: #667eea;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }
}

.hint {
  margin-top: 4px;
  font-size: 12px;
  color: #666;
}
</style>

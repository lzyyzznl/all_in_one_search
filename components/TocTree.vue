<template>
	<ul class="space-y-1">
		<li
			v-for="item in items"
			:key="item.id"
			class="pl-2 border-l-2 border-slate-200 dark:border-slate-700 ml-1"
		>
			<a
				class="block py-1 px-2 rounded hover:bg-blue-100 dark:hover:bg-blue-900 cursor-pointer text-slate-700 dark:text-slate-200 text-sm"
				:style="{ marginLeft: `${(item.level - 1) * 12}px` }"
				@click="jumpTo(item.id)"
			>
				{{ item.text }}
			</a>
			<TocTree
				v-if="item.children && item.children.length"
				:items="item.children"
			/>
		</li>
	</ul>
</template>
<script setup lang="ts">
import { defineProps, getCurrentInstance } from "vue";
const props = defineProps<{ items: any[] }>();
const instance = getCurrentInstance();
const jumpTo = (id: string) => {
	// 通过 provide/inject 或 window 方式获取 editor 实例
	const editor =
		instance?.appContext.config.globalProperties?.$editor ||
		(window as any).__editor__;
	if (editor && id) {
		// @ts-ignore
		editor.commands.scrollToHeading?.(id);
	}
};
</script>

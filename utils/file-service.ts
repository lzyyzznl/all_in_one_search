import type {
	FileSystemDirectoryHandle,
	FileSystemFileHandle,
	FileSystemHandle,
	FileTreeNode,
	SupportedFileType,
} from "./types";

// 全局类型声明
declare global {
	interface Window {
		showDirectoryPicker(options?: {
			mode?: "read" | "readwrite";
		}): Promise<FileSystemDirectoryHandle>;
	}
}

// 支持的文件扩展名
const SUPPORTED_EXTENSIONS: SupportedFileType[] = [
	".md",
	".txt",
	".log",
	".json",
	".js",
	".ts",
	".html",
	".css",
	".vue",
];

// 检查文件是否支持编辑
export function isSupportedFile(filename: string): boolean {
	const ext = filename
		.toLowerCase()
		.substring(filename.lastIndexOf(".")) as SupportedFileType;
	return SUPPORTED_EXTENSIONS.includes(ext);
}

// 选择根目录
export async function chooseDirectory(): Promise<FileSystemDirectoryHandle> {
	try {
		if (!("showDirectoryPicker" in window)) {
			throw new Error("File System Access API not supported in this browser");
		}

		const dirHandle = await window.showDirectoryPicker({
			mode: "readwrite",
		});

		return dirHandle;
	} catch (error) {
		console.error("Failed to choose directory:", error);
		throw error;
	}
}

// 构建文件树
export async function buildTree(
	dirHandle: FileSystemDirectoryHandle,
	parentPath: string = ""
): Promise<FileTreeNode[]> {
	const items: FileTreeNode[] = [];

	try {
		for await (const [name, handle] of (dirHandle as any).entries()) {
			const currentPath = parentPath ? `${parentPath}/${name}` : name;

			const node: FileTreeNode = {
				id: currentPath,
				label: name,
				handle: handle, // 确保传递完整的handle
				isDirectory: handle.kind === "directory",
				isFile: handle.kind === "file",
			};

			// 如果是目录，递归构建子节点
			if (handle.kind === "directory") {
				try {
					// 递归构建子节点
					node.children = await buildTree(
						handle as FileSystemDirectoryHandle,
						currentPath
					);
				} catch (error) {
					console.warn(`无法读取目录 ${name}:`, error);
					node.children = [];
				}
			}

			// 调试日志：检查handle是否正确设置
			if (handle.kind === "file") {
				console.log(`文件节点创建: ${name}`, {
					hasHandle: !!handle,
					handleKind: handle.kind,
					handleName: handle.name,
				});
			}

			items.push(node);
		}

		// 排序：目录在前，文件在后，然后按名称排序
		items.sort((a, b) => {
			if (a.isDirectory && !b.isDirectory) return -1;
			if (!a.isDirectory && b.isDirectory) return 1;
			return a.label.localeCompare(b.label);
		});

		console.log(`buildTree 完成，共 ${items.length} 个项目`);
		return items;
	} catch (error) {
		console.error("Failed to build tree:", error);
		throw error;
	}
}

// 读取文件内容
export async function readFile(
	fileHandle: FileSystemFileHandle
): Promise<string> {
	try {
		console.log("file-service: 开始读取文件", {
			fileName: fileHandle.name,
			fileHandleKind: fileHandle.kind,
		});

		const file = await fileHandle.getFile();
		console.log("file-service: 获取File对象成功", {
			fileName: file.name,
			fileSize: file.size,
			fileType: file.type,
			lastModified: new Date(file.lastModified).toISOString(),
		});

		const content = await file.text();
		console.log("file-service: 文件内容读取完成", {
			contentLength: content.length,
			contentType: typeof content,
			contentPreview:
				content.substring(0, 200) + (content.length > 200 ? "..." : ""),
			isEmptyContent: content.length === 0,
		});

		return content;
	} catch (error) {
		console.error("file-service: 读取文件失败", error);
		throw error;
	}
}

// 写入文件内容
export async function writeFile(
	fileHandle: FileSystemFileHandle,
	content: string
): Promise<void> {
	try {
		const writable = await fileHandle.createWritable();
		await writable.write(content);
		await writable.close();
	} catch (error) {
		console.error("Failed to write file:", error);
		throw error;
	}
}

// 创建新文件
export async function createFile(
	dirHandle: FileSystemDirectoryHandle,
	filename: string,
	content: string = ""
): Promise<FileSystemFileHandle> {
	try {
		const fileHandle = await (dirHandle as any).getFileHandle(filename, {
			create: true,
		});
		await writeFile(fileHandle, content);
		return fileHandle;
	} catch (error) {
		console.error("Failed to create file:", error);
		throw error;
	}
}

// 获取文件信息
export async function getFileInfo(fileHandle: FileSystemFileHandle) {
	try {
		const file = await fileHandle.getFile();
		return {
			name: file.name,
			size: file.size,
			lastModified: file.lastModified,
			type: file.type,
		};
	} catch (error) {
		console.error("Failed to get file info:", error);
		throw error;
	}
}

// 验证文件系统访问API是否可用
export function isFileSystemAccessSupported(): boolean {
	return "showDirectoryPicker" in window;
}

// 获取文件扩展名
export function getFileExtension(filename: string): string {
	return filename.substring(filename.lastIndexOf("."));
}

// 删除文件或文件夹
export async function deleteFileOrFolder(
	parentHandle: FileSystemDirectoryHandle,
	name: string,
	isDirectory: boolean = false
): Promise<void> {
	try {
		// 使用标准的removeEntry方法
		await parentHandle.removeEntry(name, {
			recursive: isDirectory, // 如果是目录，递归删除
		});
		console.log(`成功删除${isDirectory ? "文件夹" : "文件"}: ${name}`);
	} catch (error) {
		console.error(`删除${isDirectory ? "文件夹" : "文件"}失败:`, error);
		throw error;
	}
}

// 直接通过句柄删除（实验性方法，作为备选）
export async function deleteByHandle(
	handle: FileSystemFileHandle | FileSystemDirectoryHandle
): Promise<void> {
	try {
		// 检查是否支持remove方法
		if ("remove" in handle && typeof handle.remove === "function") {
			await (handle as any).remove({
				recursive: handle.kind === "directory",
			});
			console.log(`成功删除${handle.kind}: ${handle.name}`);
		} else {
			throw new Error("浏览器不支持直接删除方法");
		}
	} catch (error) {
		console.error("直接删除失败:", error);
		throw error;
	}
}

// 检查删除功能是否可用
export function isDeleteSupported(): boolean {
	// 检查removeEntry方法是否可用
	return "removeEntry" in FileSystemDirectoryHandle.prototype;
}

// 重命名文件或文件夹（通过复制+删除实现）
export async function renameFileOrFolder(
	parentHandle: FileSystemDirectoryHandle,
	oldName: string,
	newName: string,
	isDirectory: boolean = false
): Promise<void> {
	try {
		if (isDirectory) {
			// 文件夹重命名比较复杂，需要递归复制所有内容
			throw new Error("文件夹重命名功能暂未实现，需要递归复制所有子项");
		} else {
			// 文件重命名：读取内容 -> 创建新文件 -> 删除旧文件
			const oldFileHandle = await parentHandle.getFileHandle(oldName);
			const content = await readFile(oldFileHandle);

			// 创建新文件
			const newFileHandle = await parentHandle.getFileHandle(newName, {
				create: true,
			});
			await writeFile(newFileHandle, content);

			// 删除旧文件
			await parentHandle.removeEntry(oldName);

			console.log(`成功重命名文件: ${oldName} -> ${newName}`);
		}
	} catch (error) {
		console.error("重命名失败:", error);
		throw error;
	}
}

// 获取文件类型（用于编辑器语言模式）
export function getFileType(filename: string): string {
	const ext = getFileExtension(filename).toLowerCase();
	const typeMap: Record<string, string> = {
		".md": "markdown",
		".txt": "text",
		".log": "text",
		".json": "json",
		".js": "javascript",
		".ts": "typescript",
		".html": "html",
		".css": "css",
		".vue": "vue",
	};
	return typeMap[ext] || "text";
}

export default defineContentScript({
	matches: ["<all_urls>"],
	main() {
		console.log("Content script 已初始化");
	},
});

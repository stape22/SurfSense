import type { PlasmoCSConfig } from "plasmo";

export const config: PlasmoCSConfig = {
	matches: ["<all_urls>"],
	all_frames: true,
	// Removed world property - ISOLATED is the default in Manifest V3
	// This avoids variable conflicts with page scripts
};

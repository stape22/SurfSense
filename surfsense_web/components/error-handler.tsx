"use client";

import { useEffect } from "react";

/**
 * Global error handler for Next.js prefetch errors
 * This component suppresses "Failed to fetch" errors during route prefetching
 * which can occur when the dev server is restarting or routes are being built
 */
export function ErrorHandler() {
	useEffect(() => {
		// Suppress unhandled promise rejections from prefetch failures
		const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
			// Check if it's a fetch error related to prefetching
			if (
				event.reason instanceof TypeError &&
				event.reason.message === "Failed to fetch"
			) {
				// Check if the error is from Next.js prefetching by examining the stack trace
				const stack = event.reason.stack || "";
				if (
					stack.includes("fetchServerResponse") ||
					stack.includes("createFetch") ||
					stack.includes("prefetch") ||
					stack.includes("navigateReducer") ||
					stack.includes("clientReducer")
				) {
					// Suppress the error - it's just a prefetch failure, not critical
					event.preventDefault();
					console.debug("Suppressed prefetch error (non-critical):", event.reason);
					return;
				}
			}
		};

		window.addEventListener("unhandledrejection", handleUnhandledRejection);

		return () => {
			window.removeEventListener("unhandledrejection", handleUnhandledRejection);
		};
	}, []);

	return null;
}


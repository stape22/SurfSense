"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

interface SearchSpace {
	id: number;
	name: string;
	description: string;
	created_at: string;
	// Add other fields from your SearchSpaceRead model
}

export function useSearchSpaces() {
	const [searchSpaces, setSearchSpaces] = useState<SearchSpace[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchSearchSpaces = async () => {
			try {
				// Only run on client-side
				if (typeof window === "undefined") return;

				setLoading(true);
				const backendUrl = process.env.NEXT_PUBLIC_FASTAPI_BACKEND_URL;
				if (!backendUrl) {
					const errorMsg = "NEXT_PUBLIC_FASTAPI_BACKEND_URL is not set";
					console.error(errorMsg);
					setError(errorMsg);
					toast.error("Backend URL not configured");
					return;
				}

				const url = `${backendUrl}/api/v1/searchspaces`;
				const token = localStorage.getItem("surfsense_bearer_token");
				
				if (!token) {
					// No token means user is not logged in, this is expected
					setSearchSpaces([]);
					setError(null);
					return;
				}

				const response = await fetch(url, {
					headers: {
						Authorization: `Bearer ${token}`,
					},
					method: "GET",
				});

				if (response.status === 401) {
					// Clear token and redirect to home
					localStorage.removeItem("surfsense_bearer_token");
					setError("Not authenticated");
					return;
				}

				if (!response.ok) {
					const errorText = await response.text();
					let errorMessage = `Failed to fetch search spaces: ${response.status} ${response.statusText}`;
					try {
						const errorData = JSON.parse(errorText);
						errorMessage = errorData.detail || errorMessage;
					} catch {
						// If parsing fails, use default message
					}
					throw new Error(errorMessage);
				}

				const data = await response.json();
				setSearchSpaces(data);
				setError(null);
			} catch (err: any) {
				const errorMessage = err.message || "Failed to fetch search spaces";
				setError(errorMessage);
				console.error("Error fetching search spaces:", err);
				console.error("Backend URL:", process.env.NEXT_PUBLIC_FASTAPI_BACKEND_URL);
				if (err.name === "TypeError" && err.message.includes("Failed to fetch")) {
					toast.error("Cannot connect to backend. Please check if the backend is running.");
				}
			} finally {
				setLoading(false);
			}
		};

		fetchSearchSpaces();
	}, []);

	// Function to refresh the search spaces list
	const refreshSearchSpaces = async () => {
		setLoading(true);
		try {
			// Only run on client-side
			if (typeof window === "undefined") return;

			const backendUrl = process.env.NEXT_PUBLIC_FASTAPI_BACKEND_URL;
			if (!backendUrl) {
				throw new Error("NEXT_PUBLIC_FASTAPI_BACKEND_URL is not set");
			}

			const url = `${backendUrl}/api/v1/searchspaces`;
			const token = localStorage.getItem("surfsense_bearer_token");
			
			if (!token) {
				setSearchSpaces([]);
				setError(null);
				return;
			}

			const response = await fetch(url, {
				headers: {
					Authorization: `Bearer ${token}`,
				},
				method: "GET",
			});

			if (response.status === 401) {
				localStorage.removeItem("surfsense_bearer_token");
				setError("Not authenticated");
				toast.error("Not authenticated");
				return;
			}

			if (!response.ok) {
				const errorText = await response.text();
				let errorMessage = `Failed to fetch search spaces: ${response.status} ${response.statusText}`;
				try {
					const errorData = JSON.parse(errorText);
					errorMessage = errorData.detail || errorMessage;
				} catch {
					// If parsing fails, use default message
				}
				throw new Error(errorMessage);
			}

			const data = await response.json();
			setSearchSpaces(data);
			setError(null);
		} catch (err: any) {
			const errorMessage = err.message || "Failed to fetch search spaces";
			setError(errorMessage);
			console.error("Error refreshing search spaces:", err);
			if (err.name === "TypeError" && err.message.includes("Failed to fetch")) {
				toast.error("Cannot connect to backend. Please check if the backend is running.");
			}
		} finally {
			setLoading(false);
		}
	};

	return { searchSpaces, loading, error, refreshSearchSpaces };
}

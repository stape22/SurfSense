"use client";

import { Loader2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";
import { Logo } from "@/components/Logo";
import { AmbientBackground } from "../login/AmbientBackground";

export default function ForgotPasswordPage() {
	const t = useTranslations("auth");
	const tCommon = useTranslations("common");
	const router = useRouter();
	const [email, setEmail] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [success, setSuccess] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);
		setError(null);

		const loadingToast = toast.loading(t("requesting_reset"));

		try {
			const backendUrl = process.env.NEXT_PUBLIC_FASTAPI_BACKEND_URL;
			if (!backendUrl) {
				throw new Error("Backend URL not configured. Please restart the frontend server.");
			}

			const response = await fetch(`${backendUrl}/auth/forgot-password`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ email }),
			});

			if (!response.ok) {
				const data = await response.json().catch(() => ({}));
				throw new Error(data.detail || `HTTP ${response.status}: ${response.statusText}`);
			}

			setSuccess(true);
			toast.success(t("forgot_password_success"), {
				id: loadingToast,
				description: t("forgot_password_success_desc"),
				duration: 6000,
			});
		} catch (err) {
			const errorMessage = err instanceof Error ? err.message : "An unknown error occurred";
			setError(errorMessage);
			toast.error(t("forgot_password_error"), {
				id: loadingToast,
				description: errorMessage,
				duration: 6000,
			});
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="relative w-full overflow-hidden">
			<AmbientBackground />
			<div className="mx-auto flex h-screen max-w-lg flex-col items-center justify-center px-4">
				<Logo className="rounded-md" />
				<h1 className="my-8 text-xl font-bold text-neutral-800 dark:text-neutral-100 md:text-4xl">
					{t("forgot_password_title")}
				</h1>
				<p className="mb-6 text-center text-sm text-gray-600 dark:text-gray-400">
					{t("forgot_password_subtitle")}
				</p>

				<div className="w-full max-w-md">
					{success ? (
						<motion.div
							initial={{ opacity: 0, y: -10 }}
							animate={{ opacity: 1, y: 0 }}
							className="rounded-lg border border-green-200 bg-green-50 p-6 text-green-900 shadow-sm dark:border-green-900/30 dark:bg-green-900/20 dark:text-green-200"
						>
							<div className="mb-4 text-center">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									width="48"
									height="48"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									strokeWidth="2"
									strokeLinecap="round"
									strokeLinejoin="round"
									className="mx-auto text-green-500 dark:text-green-400"
								>
									<circle cx="12" cy="12" r="10" />
									<path d="M12 16v-4" />
									<path d="M12 8h.01" />
								</svg>
							</div>
							<p className="mb-4 text-center text-sm font-semibold">
								{t("forgot_password_success_desc")}
							</p>
							<p className="mb-4 text-center text-xs text-green-700 dark:text-green-300">
								The reset token will be displayed in your backend server console. Copy it and use it on
								the reset password page.
							</p>
							<div className="flex flex-col gap-2">
								<Link
									href="/reset-password"
									className="w-full rounded-md bg-green-600 px-4 py-2 text-center text-white shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
								>
									{t("reset_password")}
								</Link>
								<Link
									href="/login"
									className="w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-center text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700 transition-colors"
								>
									{t("back_to_login")}
								</Link>
							</div>
						</motion.div>
					) : (
						<form onSubmit={handleSubmit} className="space-y-4">
							<AnimatePresence>
								{error && (
									<motion.div
										initial={{ opacity: 0, y: -10, scale: 0.95 }}
										animate={{ opacity: 1, y: 0, scale: 1 }}
										exit={{ opacity: 0, y: -10, scale: 0.95 }}
										transition={{ duration: 0.3 }}
										className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-900 shadow-sm dark:border-red-900/30 dark:bg-red-900/20 dark:text-red-200"
									>
										<div className="flex items-start gap-3">
											<svg
												xmlns="http://www.w3.org/2000/svg"
												width="18"
												height="18"
												viewBox="0 0 24 24"
												fill="none"
												stroke="currentColor"
												strokeWidth="2"
												strokeLinecap="round"
												strokeLinejoin="round"
												className="flex-shrink-0 mt-0.5 text-red-500 dark:text-red-400"
											>
												<title>Error Icon</title>
												<circle cx="12" cy="12" r="10" />
												<line x1="15" y1="9" x2="9" y2="15" />
												<line x1="9" y1="9" x2="15" y2="15" />
											</svg>
											<div className="flex-1 min-w-0">
												<p className="text-sm text-red-700 dark:text-red-300">{error}</p>
											</div>
											<button
												onClick={() => setError(null)}
												className="flex-shrink-0 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-200 transition-colors"
												aria-label="Dismiss error"
												type="button"
											>
												<svg
													xmlns="http://www.w3.org/2000/svg"
													width="16"
													height="16"
													viewBox="0 0 24 24"
													fill="none"
													stroke="currentColor"
													strokeWidth="2"
													strokeLinecap="round"
													strokeLinejoin="round"
												>
													<title>Close</title>
													<line x1="18" y1="6" x2="6" y2="18" />
													<line x1="6" y1="6" x2="18" y2="18" />
												</svg>
											</button>
										</div>
									</motion.div>
								)}
							</AnimatePresence>

							<div>
								<label
									htmlFor="email"
									className="block text-sm font-medium text-gray-700 dark:text-gray-300"
								>
									{t("email")}
								</label>
								<input
									id="email"
									type="email"
									required
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									className={`mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 dark:bg-gray-800 dark:text-white transition-colors ${
										error
											? "border-red-300 focus:border-red-500 focus:ring-red-500 dark:border-red-700"
											: "border-gray-300 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-700"
									}`}
									disabled={isLoading}
									placeholder="your.email@example.com"
								/>
							</div>

							<button
								type="submit"
								disabled={isLoading}
								className="w-full rounded-md bg-blue-600 px-4 py-2 text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
							>
								{isLoading ? (
									<span className="flex items-center justify-center gap-2">
										<Loader2 className="h-4 w-4 animate-spin" />
										{t("requesting_reset")}
									</span>
								) : (
									t("reset_password")
								)}
							</button>

							<div className="text-center">
								<Link
									href="/login"
									className="text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400"
								>
									{t("back_to_login")}
								</Link>
							</div>
						</form>
					)}
				</div>
			</div>
		</div>
	);
}




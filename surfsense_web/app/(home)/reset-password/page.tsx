"use client";

import { Eye, EyeOff, Loader2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Logo } from "@/components/Logo";
import { AmbientBackground } from "../login/AmbientBackground";

export default function ResetPasswordPage() {
	const t = useTranslations("auth");
	const tCommon = useTranslations("common");
	const router = useRouter();
	const searchParams = useSearchParams();
	const [token, setToken] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(false);

	useEffect(() => {
		// Check if token is provided in URL
		const urlToken = searchParams.get("token");
		if (urlToken) {
			setToken(urlToken);
		}
	}, [searchParams]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);
		setError(null);

		// Form validation
		if (password !== confirmPassword) {
			setError(t("passwords_no_match"));
			setIsLoading(false);
			toast.error(t("password_mismatch"), {
				description: t("passwords_no_match_desc"),
				duration: 4000,
			});
			return;
		}

		if (password.length < 8) {
			setError(t("password_too_short"));
			setIsLoading(false);
			toast.error(t("password_too_short"), {
				duration: 4000,
			});
			return;
		}

		const loadingToast = toast.loading(t("resetting_password"));

		try {
			const backendUrl = process.env.NEXT_PUBLIC_FASTAPI_BACKEND_URL;
			if (!backendUrl) {
				throw new Error("Backend URL not configured. Please restart the frontend server.");
			}

			const response = await fetch(`${backendUrl}/auth/reset-password`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					token,
					password,
				}),
			});

			if (!response.ok) {
				const data = await response.json().catch(() => ({}));
				throw new Error(data.detail || `HTTP ${response.status}: ${response.statusText}`);
			}

			toast.success(t("reset_password_success"), {
				id: loadingToast,
				description: t("reset_password_success_desc"),
				duration: 2000,
			});

			// Redirect to login after a short delay
			setTimeout(() => {
				router.push("/login?password_reset=true");
			}, 500);
		} catch (err) {
			const errorMessage = err instanceof Error ? err.message : "An unknown error occurred";
			setError(errorMessage);
			toast.error(t("reset_password_error"), {
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
					{t("reset_password_title")}
				</h1>
				<p className="mb-6 text-center text-sm text-gray-600 dark:text-gray-400">
					{t("reset_password_subtitle")}
				</p>

				<div className="w-full max-w-md">
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
								htmlFor="token"
								className="block text-sm font-medium text-gray-700 dark:text-gray-300"
							>
								{t("reset_token")}
							</label>
							<input
								id="token"
								type="text"
								required
								value={token}
								onChange={(e) => setToken(e.target.value)}
								className={`mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 dark:bg-gray-800 dark:text-white transition-colors ${
									error
										? "border-red-300 focus:border-red-500 focus:ring-red-500 dark:border-red-700"
										: "border-gray-300 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-700"
								}`}
								disabled={isLoading}
								placeholder="Paste reset token here"
							/>
							<p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
								Get this token from your backend server console after requesting a password reset
							</p>
						</div>

						<div>
							<label
								htmlFor="password"
								className="block text-sm font-medium text-gray-700 dark:text-gray-300"
							>
								{t("new_password")}
							</label>
							<div className="relative">
								<input
									id="password"
									type={showPassword ? "text" : "password"}
									required
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									className={`mt-1 block w-full rounded-md border pr-10 px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 dark:bg-gray-800 dark:text-white transition-colors ${
										error
											? "border-red-300 focus:border-red-500 focus:ring-red-500 dark:border-red-700"
											: "border-gray-300 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-700"
									}`}
									disabled={isLoading}
									minLength={8}
								/>
								<button
									type="button"
									onClick={() => setShowPassword((prev) => !prev)}
									className="absolute inset-y-0 right-0 flex items-center pr-3 mt-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
									aria-label={showPassword ? t("hide_password") : t("show_password")}
								>
									{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
								</button>
							</div>
						</div>

						<div>
							<label
								htmlFor="confirmPassword"
								className="block text-sm font-medium text-gray-700 dark:text-gray-300"
							>
								{t("confirm_new_password")}
							</label>
							<div className="relative">
								<input
									id="confirmPassword"
									type={showConfirmPassword ? "text" : "password"}
									required
									value={confirmPassword}
									onChange={(e) => setConfirmPassword(e.target.value)}
									className={`mt-1 block w-full rounded-md border pr-10 px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 dark:bg-gray-800 dark:text-white transition-colors ${
										error
											? "border-red-300 focus:border-red-500 focus:ring-red-500 dark:border-red-700"
											: "border-gray-300 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-700"
									}`}
									disabled={isLoading}
									minLength={8}
								/>
								<button
									type="button"
									onClick={() => setShowConfirmPassword((prev) => !prev)}
									className="absolute inset-y-0 right-0 flex items-center pr-3 mt-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
									aria-label={showConfirmPassword ? t("hide_password") : t("show_password")}
								>
									{showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
								</button>
							</div>
						</div>

						<button
							type="submit"
							disabled={isLoading}
							className="w-full rounded-md bg-blue-600 px-4 py-2 text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
						>
							{isLoading ? (
								<span className="flex items-center justify-center gap-2">
									<Loader2 className="h-4 w-4 animate-spin" />
									{t("resetting_password")}
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
				</div>
			</div>
		</div>
	);
}




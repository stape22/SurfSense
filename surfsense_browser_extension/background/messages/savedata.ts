import type { PlasmoMessaging } from "@plasmohq/messaging";
import { Storage } from "@plasmohq/storage";

import { emptyArr, webhistoryToLangChainDocument } from "~utils/commons";

const clearMemory = async () => {
	try {
		const storage = new Storage({ area: "local" });

		const webHistory: any = await storage.get("webhistory");
		const urlQueue: any = await storage.get("urlQueueList");
		const timeQueue: any = await storage.get("timeQueueList");

		if (!webHistory.webhistory) {
			return;
		}

		//Main Cleanup COde
		chrome.tabs.query({}, async (tabs) => {
			//Get Active Tabs Ids
			// console.log("Event Tabs",tabs)
			let actives = tabs.map((tab) => {
				if (tab.id) {
					return tab.id;
				}
			});

			actives = actives.filter((item: any) => item);

			//Only retain which is still active
			const newHistory = webHistory.webhistory.map((element: any) => {
				//@ts-ignore
				if (actives.includes(element.tabsessionId)) {
					return element;
				}
			});

			const newUrlQueue = urlQueue.urlQueueList.map((element: any) => {
				//@ts-ignore
				if (actives.includes(element.tabsessionId)) {
					return element;
				}
			});

			const newTimeQueue = timeQueue.timeQueueList.map((element: any) => {
				//@ts-ignore
				if (actives.includes(element.tabsessionId)) {
					return element;
				}
			});

			await storage.set("webhistory", {
				webhistory: newHistory.filter((item: any) => item),
			});
			await storage.set("urlQueueList", {
				urlQueueList: newUrlQueue.filter((item: any) => item),
			});
			await storage.set("timeQueueList", {
				timeQueueList: newTimeQueue.filter((item: any) => item),
			});
		});
	} catch (error) {
		console.log(error);
	}
};

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
	console.log("savedata handler called!");
	try {
		const storage = new Storage({ area: "local" });

		const webhistoryObj: any = await storage.get("webhistory");
		console.log("webhistoryObj:", webhistoryObj);
		
		if (!webhistoryObj || !webhistoryObj.webhistory) {
			console.error("No webhistory found in storage");
			res.send({
				error: "No captured pages found. Please click 'Save Snapshot' first to capture the current page.",
			});
			return;
		}

		const webhistory = webhistoryObj.webhistory;
		console.log("webhistory:", webhistory);
		
		const toSaveFinally: any[] = [];
		const newHistoryAfterCleanup: any[] = [];

		for (let i = 0; i < webhistory.length; i++) {
			console.log(`Processing tab ${i}: tabsessionId=${webhistory[i].tabsessionId}, tabHistory length=${webhistory[i].tabHistory?.length || 0}`);
			
			if (!webhistory[i].tabHistory || webhistory[i].tabHistory.length === 0) {
				console.log(`Skipping tab ${i} - no tabHistory data`);
				newHistoryAfterCleanup.push({
					tabsessionId: webhistory[i].tabsessionId,
					tabHistory: emptyArr,
				});
				continue;
			}

			const markdownFormat = webhistoryToLangChainDocument(
				webhistory[i].tabsessionId,
				webhistory[i].tabHistory
			);
			console.log(`Tab ${i} generated ${markdownFormat.length} documents`);
			toSaveFinally.push(...markdownFormat);
			newHistoryAfterCleanup.push({
				tabsessionId: webhistory[i].tabsessionId,
				tabHistory: emptyArr,
			});
		}

		await storage.set("webhistory", { webhistory: newHistoryAfterCleanup });

		// Check if we have any data to save
		if (toSaveFinally.length === 0) {
			console.error("No documents to save - all tabHistory arrays are empty");
			res.send({
				error: "No pages captured. Please click 'Save Snapshot' first to capture the current page, then try saving again.",
			});
			return;
		}

		// Log first item to debug metadata structure
		console.log(`Total documents to save: ${toSaveFinally.length}`);
		console.log("First item metadata:", toSaveFinally[0].metadata);

		// Create content array for documents in the format expected by the new API
		const content = toSaveFinally.map((item) => ({
			metadata: {
				BrowsingSessionId: String(item.metadata.BrowsingSessionId || ""),
				VisitedWebPageURL: String(item.metadata.VisitedWebPageURL || ""),
				VisitedWebPageTitle: String(item.metadata.VisitedWebPageTitle || "No Title"),
				VisitedWebPageDateWithTimeInISOString: String(
					item.metadata.VisitedWebPageDateWithTimeInISOString || ""
				),
				VisitedWebPageReffererURL: String(item.metadata.VisitedWebPageReffererURL || ""),
				VisitedWebPageVisitDurationInMilliseconds: String(
					item.metadata.VisitedWebPageVisitDurationInMilliseconds || "0"
				),
			},
			pageContent: String(item.pageContent || ""),
		}));

		const token = await storage.get("token");
		if (!token) {
			console.error("No authentication token found");
			res.send({
				error: "Not authenticated. Please enter your API key in extension settings.",
			});
			return;
		}

		const search_space_id = parseInt(await storage.get("search_space_id"), 10);
		if (!search_space_id || isNaN(search_space_id)) {
			console.error("Invalid search_space_id:", search_space_id);
			res.send({
				error: "No search space selected. Please select a search space first.",
			});
			return;
		}

		const toSend = {
			document_type: "EXTENSION",
			content: content,
			search_space_id: search_space_id,
		};

		console.log("Sending to backend:", {
			url: `${process.env.PLASMO_PUBLIC_BACKEND_URL}/api/v1/documents`,
			documentCount: content.length,
			searchSpaceId: search_space_id,
		});

		const backendUrl = process.env.PLASMO_PUBLIC_BACKEND_URL;
		if (!backendUrl) {
			console.error("PLASMO_PUBLIC_BACKEND_URL is not set!");
			res.send({
				error: "Backend URL not configured. Please check extension configuration.",
			});
			return;
		}

		const requestOptions = {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${token}`,
			},
			body: JSON.stringify(toSend),
		};

		console.log("Making fetch request to:", `${backendUrl}/api/v1/documents`);
		console.log("Request body:", JSON.stringify(toSend).substring(0, 200) + "...");

		const response = await fetch(
			`${backendUrl}/api/v1/documents`,
			requestOptions
		);
		
		console.log("Fetch response status:", response.status, response.statusText);
		
		if (!response.ok) {
			const errorData = await response.json().catch(() => ({ detail: `HTTP ${response.status}: ${response.statusText}` }));
			console.error("Failed to save documents:", errorData);
			res.send({
				error: errorData.detail || `Failed to save: ${response.status} ${response.statusText}`,
			});
			return;
		}
		
		const resp = await response.json();
		console.log("Save response:", resp);
		await clearMemory();
		res.send({
			message: "Save Job Started",
		});
	} catch (error: any) {
		console.error("Error in savedata handler:", error);
		res.send({
			error: `Failed to save: ${error?.message || String(error)}`,
		});
	}
};

export default handler;

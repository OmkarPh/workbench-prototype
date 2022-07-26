interface HistoryItem {
	opened_at: string;
	json_path: string;
	sqlite_path: string;
}

export const HISTORY_STORE_KEY = "workbench_history_details";
export const HISTORY_MAX_LENGTH = 5;

export const GetHistory = () => {
	return JSON.parse(window.localStorage.getItem(HISTORY_STORE_KEY) || '[]') as HistoryItem[];
}

export const AddEntry = (entry: HistoryItem) => {
	const prevEntries = GetHistory();
	// console.log(prevEntries, prevEntries.length);

	const existingEntry: HistoryItem | undefined = prevEntries.find(
		existingEntry => entry.json_path === existingEntry.json_path
	);

	if(existingEntry){
		console.log("Updating:", entry);
		existingEntry.opened_at = entry.opened_at;
		existingEntry.sqlite_path = entry.sqlite_path;
	} else {
		console.log("Adding:", entry);
		prevEntries.unshift(entry);
	}

	if(prevEntries.length > 5)
		prevEntries.length = 5;

	// console.log("Result", prevEntries, prevEntries.length);
	window.localStorage.setItem(HISTORY_STORE_KEY, JSON.stringify(prevEntries));
}
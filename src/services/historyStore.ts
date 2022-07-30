import moment from "moment";

export interface HistoryItem {
	opened_at: string;
	json_path?: string;
	sqlite_path: string;
}

export const HISTORY_STORE_KEY = "workbench_history_details";
export const HISTORY_MAX_LENGTH = 5;

export const GetHistory = () => {
	return JSON.parse(window.localStorage.getItem(HISTORY_STORE_KEY) || '[]') as HistoryItem[];
}

export const AddEntry = (entry: HistoryItem) => {
	const history = GetHistory();
	// console.log(prevEntries, prevEntries.length);

	const existingEntryIndex = history.findIndex(
		existingEntry => entry.json_path === existingEntry.json_path
	)
	const existingEntry: HistoryItem | undefined = history[existingEntryIndex];

	if(existingEntry){
		console.log("Updating:", entry);
		existingEntry.opened_at = entry.opened_at;
		existingEntry.sqlite_path = entry.sqlite_path;
		history.sort(function(a, b){
			return Number(moment(b.opened_at).format('X')) - Number(moment(a.opened_at).format('X'));
		});
	} else {
		console.log("Adding:", entry);
		history.unshift(entry);
	}

	if(history.length > 5)
		history.length = 5;

	// console.log("Result", prevEntries, prevEntries.length);
	window.localStorage.setItem(HISTORY_STORE_KEY, JSON.stringify(history));
}
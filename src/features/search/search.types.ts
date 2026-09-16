export type SearchItem = {
	id: number;
	type: "business" | "doctor" | "product" | string;
	name: string;
	label: string;
	display_name: string;
	slug: string;
	aliases: string;
};

export type SearchState = {
	recentCategories: SearchItem[];
};

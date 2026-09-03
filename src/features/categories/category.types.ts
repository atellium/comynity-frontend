export type CategorySearchItem = {
	id: number;
	name: string;
	label: string | null;
	slug: string;
	aliases: string[] | string | null;
};

export type FeaturedCategory = Omit<CategorySearchItem, "label"> & {
	label: string | null;
	display_name: string | null;
	image: string | null;
	icon?: string | null;
	sort_order: number;
	is_active: boolean;
	is_featured: boolean;
	created_at: string;
	updated_at: string;
};

export type PopularCategory = FeaturedCategory & {
	icon?: string | null;
	color?: string | null;
	parent?: string | null;
	is_hidden?: boolean;
	is_popular?: boolean;
};

export type FeaturedCategoriesResponse = {
	results: FeaturedCategory[];
};

export type PopularCategoriesResponse = {
	results: PopularCategory[];
};

export type CategoriesState = {
	items: CategorySearchItem[];
	status: "idle" | "loading" | "succeeded" | "failed";
	error: string | null;
};

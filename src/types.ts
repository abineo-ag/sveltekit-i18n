export interface Parameter {
	name: string;
	type: string;
	strings: string[];
}

export interface ResourceItem {
	key: string;
	template: string;
	params: Parameter[];
}

export interface ResourceKey {
	key: string;
	items: Resource[];
}

export type Resource = ResourceItem | ResourceKey;

export interface Translation {
	lang: string;
	items: Resource[];
}

export interface SummaryItem {
	key: string;
	languages: string[];
	params: Parameter[];
	paramErr: boolean;
}

export interface Summary {
	key: string;
	languages: string[];
	items: (Summary | SummaryItem)[];
}

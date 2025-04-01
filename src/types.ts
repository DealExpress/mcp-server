/**
 * Common types for the DealX MCP Server
 */

// Ad search result types
export interface SanitizedAuthor {
  id: string;
  name: string;
  image: string | null;
  created: string;
  rank: number;
}

export interface SanitizedTag {
  id: string;
  name: string;
}

export interface SanitizedAd {
  id: string;
  created: string;
  updated: string;
  title: string;
  description: string;
  price: number;
  quantity: number;
  quantityQualifier: string;
  status: string;
  pinned: boolean;
  attachedImageUrls: string[];
  author: string;
  expand?: {
    author?: SanitizedAuthor;
    tags?: SanitizedTag[];
  };
}

export interface SearchResult {
  items: SanitizedAd[];
  page: number;
  perPage: number;
  totalItems: number;
  totalPages: number;
}

// Tool parameter types
export interface SearchAdsParams {
  query?: string;
  sort?: string;
  offset?: number;
  limit?: number;
}

// Future tool parameter types can be added here
// export interface CreateAdParams { ... }
// export interface EditAdParams { ... }
// export interface DeleteAdParams { ... }
// export interface GetThreadsParams { ... }
// export interface CreateThreadParams { ... }

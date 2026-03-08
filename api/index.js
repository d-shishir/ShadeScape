import axios from 'axios';

const ACCESS_KEY = process.env.EXPO_PUBLIC_UNSPLASH_ACCESS_KEY;
const API_URL = 'https://api.unsplash.com/';

const client = axios.create({
  baseURL: API_URL,
  headers: {
    Authorization: `Client-ID ${ACCESS_KEY}`
  }
});

export const apiCall = async (params) => {
  try {
    const { downloadUrl, page = 1, query, category, order_by } = params;

    if (downloadUrl) {
       // Single trigger call for Unsplash download tracking
       await client.get(downloadUrl);
       return { success: true };
    }

    // Determine the endpoint and parameters based on query/category
    // 1. If it's a search (explicit query or a specific category like 'Nature')
    // 2. If it's a list (Trending maps to popular, Recents maps to latest)
    
    let finalQuery = query;
    let finalOrderBy = order_by || 'latest';
    let isSearch = !!query;

    if (category) {
        if (category === 'Trending') {
            finalOrderBy = 'popular';
            isSearch = false; // Uses /photos endpoint
        } else if (category === 'Recents') {
            finalOrderBy = 'latest';
            isSearch = false; // Uses /photos endpoint
        } else {
            // Specific categories (e.g., 'Nature', 'Travel') use /search/photos
            finalQuery = category;
            isSearch = true;
        }
    }

    const endpoint = isSearch ? 'search/photos' : 'photos';
    
    const queryParams = {
        page,
        per_page: 25,
        ...(isSearch && { query: finalQuery }),
        ...(isSearch && { order_by: 'relevant' }), // Default for search
        ...(!isSearch && { order_by: finalOrderBy }), // Default for list
        ...(params.orientation && { orientation: params.orientation }),
        ...(params.color && { color: params.color }),
    };

    const response = await client.get(endpoint, { params: queryParams });
    const { data } = response;
    
    return {
        success: true,
        data: isSearch ? data.results : data
    };
  } catch (error) {
    console.log("API Error:", error?.response?.data || error.message);
    return { success: false, msg: error.message };
  }
};

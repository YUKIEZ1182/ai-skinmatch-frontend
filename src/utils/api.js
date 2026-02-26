const API_URL = import.meta.env.VITE_DIRECTUS_PUBLIC_URL;

export const apiFetch = async (endpoint, options = {}) => {
  const url = endpoint.startsWith('http') ? endpoint : `${API_URL}${endpoint}`;
  let token = localStorage.getItem('access_token');
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  let response = await fetch(url, { ...options, headers });

  if (response.status === 401) {
    const refreshToken = localStorage.getItem('refresh_token');
    
    if (refreshToken) {
      try {
        const refreshResponse = await fetch(`${API_URL}/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            refresh_token: refreshToken, 
            mode: 'json' 
          })
        });

        if (refreshResponse.ok) {
          const data = await refreshResponse.json();
          
          localStorage.setItem('access_token', data.data.access_token);
          localStorage.setItem('refresh_token', data.data.refresh_token);
          
          headers['Authorization'] = `Bearer ${data.data.access_token}`;
          response = await fetch(url, { ...options, headers });
          
        } else {
          throw new Error('Session expired');
        }
      } catch (error) {
        console.log('error while fetch token:', error)
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.reload();
      }
    }
  }

  return response;
};

export const deleteCartDetail = async (id) => {
  const response = await apiFetch(`/items/cart_detail/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error('Delete failed');
  }
  
  return response;
};

export const getProductById = async (id) => {
  const response = await apiFetch(
    `/items/product/${id}?fields=id,name,price,description,brand_name,suitable_skin_type,status,quantity,illustration.directus_files_id,ingredients.ingredient_id.name`
  );
  if (!response.ok) throw new Error('Failed to fetch product');
  const json = await response.json();
  return json.data;
};

export const getRecommendedProducts = async (skinType, categoryId = null) => {
  
  const params = { skin_type: skinType };
  
  if (categoryId && categoryId !== 'home' && categoryId !== 'new') {
    params.category = categoryId;
  }

  const queryParams = new URLSearchParams(params).toString();
  
  const response = await apiFetch(`/recommend/product-for-skin-type?${queryParams}`, {
    method: 'GET',
  });

  if (!response.ok) {
    throw new Error('Failed to fetch recommended products');
  }

  return await response.json();
};

export const getSimilarProducts = async (productId) => {
  const response = await apiFetch(`/recommend/similar-product?product_id=${productId}`, {
    method: 'GET',
  });

  if (!response.ok) {
    throw new Error('Failed to fetch similar products');
  }

  return await response.json();
};
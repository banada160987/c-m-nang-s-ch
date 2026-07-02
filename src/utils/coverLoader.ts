export const getBookCover = async (title: string, author: string, id: string): Promise<string> => {
  const cacheKey = 'bookCovers';
  const cacheStr = localStorage.getItem(cacheKey) || '{}';
  const coverCache = JSON.parse(cacheStr);
  
  if (coverCache[id]) return coverCache[id];
  
  // 1. Try Google Books API
  try {
    const query = encodeURIComponent(`${title} ${author}`);
    const res = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${query}&maxResults=3`);
    if (res.ok) {
      const data = await res.json();
      if (data.items && data.items.length > 0) {
        for (let item of data.items) {
          if (item.volumeInfo?.imageLinks?.thumbnail) {
            let url = item.volumeInfo.imageLinks.thumbnail.replace('http:', 'https:');
            url = url.replace('&edge=curl', '');
            coverCache[id] = url;
            localStorage.setItem(cacheKey, JSON.stringify(coverCache));
            return url;
          }
        }
      }
    }
  } catch (e) {
    // Fallback
  }

  // 2. Try Open Library
  try {
    const query = encodeURIComponent(title);
    const res = await fetch(`https://openlibrary.org/search.json?title=${query}&limit=3`);
    if (res.ok) {
      const contentType = res.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const data = await res.json();
        if (data.docs && data.docs.length > 0) {
          for (let doc of data.docs) {
            if (doc.cover_i) {
              const url = `https://covers.openlibrary.org/b/id/${doc.cover_i}-L.jpg`;
              coverCache[id] = url;
              localStorage.setItem(cacheKey, JSON.stringify(coverCache));
              return url;
            }
          }
        }
      }
    }
  } catch (e) {
    // Fallback
  }
  
  // 3. Fallback placeholder
  const colors = ['D97706', '059669', '7C3AED', 'DC2626', '2563EB', '0891B2', '4F46E5'];
  const bgColor = colors[Math.floor(Math.random() * colors.length)];
  const fallback = `https://ui-avatars.com/api/?name=${encodeURIComponent(title)}&background=${bgColor}&color=fff&size=400&font-size=0.15&length=3`;
  
  coverCache[id] = fallback;
  localStorage.setItem(cacheKey, JSON.stringify(coverCache));
  return fallback;
};

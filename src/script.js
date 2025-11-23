// ✅ Get the results container
const resultsDiv = document.getElementById("results");

// ✅ Mood-based book buttons
document.querySelectorAll(".emotion-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    const mood = btn.dataset.emotion;
    const query = encodeURIComponent(`${mood} books`);
    fetchBooks(query);
  });
});

// ✅ Genre-based book buttons (optional)
document.querySelectorAll(".category-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    const category = btn.dataset.category;
    const query = encodeURIComponent(`subject:${category}`);
    fetchBooks(query);
  });
});

// ✅ Search button logic
document.getElementById("searchBtn").addEventListener("click", () => {
  const keyword = document.getElementById("searchInput").value.trim();
  const genre = document.getElementById("genreSelect").value;
  const emotion = document.getElementById("emotionSelect").value;

  let query = "";

  if (keyword) query += `${keyword}`;
  if (genre) query += `+subject:${genre}`;
  if (emotion) query += `+${emotion} books`;

  const finalQuery = encodeURIComponent(query.trim() || "motivational books");

  fetchBooks(finalQuery);
});

// ✅ Main fetch function
function fetchBooks(query) {
  const API_KEY = "AIzaSyCl9qZcbS_OPE9xYNDEpYkxMNzrMNDTxeY"; // replace if needed
  const baseUrl = `https://www.googleapis.com/books/v1/volumes?q=${query}&maxResults=12&orderBy=relevance&printType=books`;
  const urlWithKey = API_KEY ? `${baseUrl}&key=${API_KEY}` : baseUrl;

  // Show loading state
  resultsDiv.innerHTML = `<p class="col-span-3 text-center text-gray-400">Loading books...</p>`;
  primaryFetch(urlWithKey, baseUrl, !!API_KEY);
}

function primaryFetch(urlWithKey, baseUrl, hasKey) {
  fetch(urlWithKey)
    .then(async (res) => {
      const status = res.status;
      const data = await res.json();
      // If success & items
      if (status === 200 && !data.error && data.items && data.items.length) {
        resultsDiv.innerHTML = "";
        renderBooks(data.items);
        return;
      }

      // Decide if we should fallback
      const shouldFallback = hasKey && (
        data.error || status !== 200
      );

      if (shouldFallback) {
        console.warn("Primary request failed, attempting fallback without key", { status, error: data.error });
        return fetch(baseUrl)
          .then(r => r.json())
          .then(fallback => {
            if (fallback.items && fallback.items.length) {
              resultsDiv.innerHTML = ""; // clear loading/error
              renderBooks(fallback.items);
            } else {
              const code = data.error?.code || status;
              const message = data.error?.message || `Request failed (status ${status}).`;
              resultsDiv.innerHTML = `<p class=\"col-span-3 text-center text-red-500\">API error after retry: ${message}<br><span class='text-xs text-gray-500'>Renew key or relax restrictions. Public retry returned no results.</span></p>`;
            }
          })
          .catch(fallbackErr => {
            console.error("Fallback fetch error", fallbackErr);
            resultsDiv.innerHTML = `<p class=\"text-red-500 text-center\">Network error on fallback. Check connection.</p>`;
          });
      }

      // No fallback scenario (e.g., no key present)
      if (!data.items || !data.items.length) {
        if (data.error) {
          const code = data.error.code || status;
          const message = data.error.message || "Unknown API error.";
          resultsDiv.innerHTML = `<p class=\"col-span-3 text-center text-red-500\">API Error (${code}): ${message}</p>`;
        } else {
          resultsDiv.innerHTML = `<p class=\"col-span-3 text-center text-gray-400\">No books found.</p>`;
        }
      }
    })
    .catch(err => {
      console.error("Primary fetch error", err);
      // Attempt fallback if we had a key
      if (hasKey) {
        return fetch(baseUrl)
          .then(r => r.json())
          .then(fallback => {
            if (fallback.items && fallback.items.length) {
              resultsDiv.innerHTML = "";
              renderBooks(fallback.items);
            } else {
              resultsDiv.innerHTML = `<p class=\"text-red-500 text-center\">Both primary and fallback failed.</p>`;
            }
          })
          .catch(e2 => {
            console.error("Fallback also failed", e2);
            resultsDiv.innerHTML = `<p class=\"text-red-500 text-center\">Network error. Please retry later.</p>`;
          });
      } else {
        resultsDiv.innerHTML = `<p class=\"text-red-500 text-center\">Failed to load books.</p>`;
      }
    });
}

// Extracted renderer for reuse (primary + fallback)
function renderBooks(items) {
  items.forEach((book) => {
    const info = book.volumeInfo;

    const card = document.createElement("div");
    card.className =
      "bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-lg overflow-hidden shadow p-4";

    const image = info.imageLinks?.thumbnail || "img/fallback.jpg"; // fallback image

    card.innerHTML = `
      <img src="${image}" alt="${info.title}" class="w-full h-48 object-cover mb-3 rounded" />
      <h3 class="font-bold text-lg">${info.title}</h3>
      <p class="text-sm mb-1">${info.authors?.join(", ") || "Unknown Author"}</p>
      <a href="${info.previewLink}" target="_blank" class="text-blue-500 underline text-sm">Preview</a>
    `;

    // ❤️ Save to favorites
    const saveBtn = document.createElement("button");
    saveBtn.textContent = "❤️ Save";
    saveBtn.className = "mt-2 bg-pink-500 text-white px-3 py-1 rounded text-sm";

    saveBtn.onclick = () => {
      const favorites = JSON.parse(localStorage.getItem("favorites")) || [];

      const bookData = {
        title: info.title,
        authors: info.authors?.join(", ") || "Unknown",
        thumbnail: image,
        previewLink: info.previewLink || "#",
      };

      const exists = favorites.some((fav) => fav.title === bookData.title);

      if (!exists) {
        favorites.push(bookData);
        localStorage.setItem("favorites", JSON.stringify(favorites));
        alert("Book saved to favorites! ❤️");
      } else {
        alert("Already in favorites.");
      }
    };

    card.appendChild(saveBtn);
    resultsDiv.appendChild(card);
  });
}



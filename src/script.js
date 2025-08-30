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
  const url = `https://www.googleapis.com/books/v1/volumes?q=${query}&maxResults=12&orderBy=relevance&printType=books&key=${API_KEY}`;

  // Show loading state
  resultsDiv.innerHTML = `<p class="col-span-3 text-center text-gray-400">Loading books...</p>`;

  fetch(url)
    .then((res) => res.json())
    .then((data) => {
      resultsDiv.innerHTML = "";

      if (!data.items || data.items.length === 0) {
        resultsDiv.innerHTML = `<p class="col-span-3 text-center text-gray-400">No books found.</p>`;
        return;
      }

      data.items.forEach((book) => {
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
    })
    .catch((err) => {
      resultsDiv.innerHTML = `<p class="text-red-500 text-center">Failed to load books.</p>`;
      console.error("Error fetching books:", err);
    });
}



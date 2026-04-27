document.addEventListener("DOMContentLoaded", () => {

    const grid = document.getElementById("resources-grid");
    const loading = document.getElementById("loading-indicator");
    const noResults = document.getElementById("no-results");

    const typeFilter = document.getElementById("type-filter");
    const moodFilter = document.getElementById("mood-filter");
    const searchFilter = document.getElementById("search-filter");
    const clearBtn = document.getElementById("clear-filters");

    const modal = document.getElementById("resource-modal");
    const modalContent = document.getElementById("modal-content");
    const modalOverlay = document.getElementById("modal-overlay");

    let allResources = [];
    let filteredResources = [];

    /* ===============================
       LOAD JSON
    =============================== */
    fetch("../resource/resources.json")
        .then(res => res.json())
        .then(data => {

            allResources = [
                ...data.videos,
                ...data.audio,
                ...data.posters,
                ...data.guides,
                ...data.books,
                ...data.quotes
            ];

            filteredResources = [...allResources];

            loading.style.display = "none";
            renderResources();
        })
        .catch(() => {
            if (loading) loading.innerText = window.t("Failed to load resources");
        });

    /* ===============================
       RENDER GRID
    =============================== */
    function renderResources() {
        grid.innerHTML = "";

        if (filteredResources.length === 0) {
            noResults.style.display = "block";
            return;
        }

        noResults.style.display = "none";

        filteredResources.forEach(resource => {
            grid.appendChild(createCard(resource));
        });
    }

    /* ===============================
       CREATE CARD
    =============================== */
    function createCard(resource) {
        const card = document.createElement("div");
        card.className = "resource-card";

        let media = "";

        if (resource.type === "videos") {
            media = `<video src="../resource/${resource.file}" muted></video>`;
        } else if (resource.type === "audio") {
            media = `<img src="../resource/${resource.thumbnail}" />`;
        } else if (resource.type === "posters") {
            media = `<img src="../resource/${resource.file}" />`;
        } else if (resource.type === "guides" || resource.type === "books") {
            media = `<iframe src="../resource/${resource.file}"></iframe>`;
        } else if (resource.type === "quotes") {
            media = `<div style="height:180px;background:linear-gradient(135deg,#ff416c,#ff4b2b);"></div>`;
        }

        card.innerHTML = `
            ${media}

            <div class="content-overlay">
                <h3>${window.t(resource.title || "Quotes")}</h3>

                <div class="tags">
                    ${resource.tags
                ? resource.tags.map(tag => `<span class="tag ${tag}">${window.t(tag)}</span>`).join("")
                : ""}
                </div>
            </div>
        `;

        card.addEventListener("click", () => openModal(resource));

        return card;
    }

    /* ===============================
       FILTER LOGIC
    =============================== */
    function applyFilters() {

        const type = typeFilter.value;
        const mood = moodFilter.value;
        const search = searchFilter.value.toLowerCase();

        filteredResources = allResources.filter(r => {

            if (type !== "all" && r.type !== type) return false;

            if (mood !== "all" && (!r.tags || !r.tags.includes(mood))) return false;

            if (search &&
                !(r.title || "").toLowerCase().includes(search) &&
                !(r.description || "").toLowerCase().includes(search)
            ) return false;

            return true;
        });

        renderResources();
    }

    typeFilter.addEventListener("change", applyFilters);
    moodFilter.addEventListener("change", applyFilters);
    searchFilter.addEventListener("input", applyFilters);

    clearBtn.addEventListener("click", () => {
        typeFilter.value = "all";
        moodFilter.value = "all";
        searchFilter.value = "";
        filteredResources = [...allResources];
        renderResources();
    });

    /* ===============================
       MODAL OPEN
    =============================== */
    function openModal(resource) {

        let content = `
            <span class="modal-close" id="modal-close">&times;</span>
        `;

        if (resource.type === "videos") {
            content += `<video controls autoplay src="../resource/${resource.file}"></video>`;
        }
        else if (resource.type === "audio") {
            content += `<audio controls autoplay src="../resource/${resource.file}"></audio>`;
        }
        else if (resource.type === "posters") {
            content += `<img src="../resource/${resource.file}" />`;
        }
        else if (resource.type === "guides" || resource.type === "books") {
            content += `<iframe src="../resource/${resource.file}"></iframe>`;
        }
        else if (resource.type === "quotes") {
            content += `
                <div class="quote-modal">
                    ${resource.quotes.map(q => `<p>${q}</p>`).join("")}
                </div>
            `;
        }

        modalContent.innerHTML = content;
        modal.classList.add("active");

        document.getElementById("modal-close").onclick = closeModal;
    }

    /* ===============================
       MODAL CLOSE
    =============================== */
    function closeModal() {
        modal.classList.remove("active");
        modalContent.innerHTML = "";
    }

    /* Overlay click */
    modalOverlay.addEventListener("click", closeModal);

    /* ESC key */
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") closeModal();
    });

});
/* =========================================================
   GAMESO — MAIN JAVASCRIPT
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    /* =====================================================
       ELEMENTS
    ===================================================== */

    const searchToggle = document.getElementById("searchToggle");
    const searchSection = document.getElementById("searchSection");
    const gameSearch = document.getElementById("gameSearch");
    const clearSearch = document.getElementById("clearSearch");

    const menuToggle = document.getElementById("menuToggle");
    const mobileNav = document.getElementById("mobileNav");

    const currentYear = document.getElementById("currentYear");

    const gameCards = document.querySelectorAll(".game-card");

    const gamesGrid = document.getElementById("popularGames");


    /* =====================================================
       CURRENT YEAR
    ===================================================== */

    if (currentYear) {
        currentYear.textContent = new Date().getFullYear();
    }


    /* =====================================================
       SEARCH TOGGLE
    ===================================================== */

    if (searchToggle && searchSection) {

        searchToggle.addEventListener("click", () => {

            const isOpen =
                searchSection.classList.contains("show");

            if (isOpen) {

                searchSection.classList.remove("show");

                if (gameSearch) {
                    gameSearch.value = "";
                }

                clearSearchButton();

                showAllGames();

            } else {

                searchSection.classList.add("show");

                setTimeout(() => {

                    if (gameSearch) {
                        gameSearch.focus();
                    }

                }, 100);

            }

        });

    }


    /* =====================================================
       SEARCH FUNCTION
    ===================================================== */

    if (gameSearch) {

        gameSearch.addEventListener("input", () => {

            const searchValue =
                gameSearch.value
                    .trim()
                    .toLowerCase();

            updateClearButton(searchValue);

            filterGames(searchValue);

        });

    }


    /* =====================================================
       FILTER GAMES
    ===================================================== */

    function filterGames(searchValue) {

        let visibleGames = 0;

        gameCards.forEach(card => {

            const gameName =
                (card.dataset.name || "")
                    .toLowerCase();

            const gameCategory =
                (card.dataset.category || "")
                    .toLowerCase();

            const gameText =
                card.textContent
                    .toLowerCase();

            const matches =
                searchValue === "" ||
                gameName.includes(searchValue) ||
                gameCategory.includes(searchValue) ||
                gameText.includes(searchValue);

            if (matches) {

                card.style.display = "";

                visibleGames++;

            } else {

                card.style.display = "none";

            }

        });


        /* ---------------------------------------------
           NO RESULTS MESSAGE
        --------------------------------------------- */

        removeNoResultsMessage();

        if (
            searchValue !== "" &&
            visibleGames === 0
        ) {

            createNoResultsMessage(searchValue);

        }

    }


    /* =====================================================
       SHOW ALL GAMES
    ===================================================== */

    function showAllGames() {

        gameCards.forEach(card => {

            card.style.display = "";

        });

        removeNoResultsMessage();

    }


    /* =====================================================
       NO RESULTS MESSAGE
    ===================================================== */

    function createNoResultsMessage(searchValue) {

        if (!gamesGrid) return;

        const message = document.createElement("div");

        message.className = "no-results";

        message.id = "noResults";

        message.innerHTML = `
            <strong>No games found</strong>
            <span>We couldn't find a game matching "${escapeHTML(searchValue)}".</span>
        `;

        gamesGrid.appendChild(message);

    }


    function removeNoResultsMessage() {

        const existing =
            document.getElementById("noResults");

        if (existing) {
            existing.remove();
        }

    }


    /* =====================================================
       CLEAR SEARCH BUTTON
    ===================================================== */

    if (clearSearch) {

        clearSearch.addEventListener("click", () => {

            if (!gameSearch) return;

            gameSearch.value = "";

            clearSearchButton();

            showAllGames();

            gameSearch.focus();

        });

    }


    function updateClearButton(value) {

        if (!clearSearch) return;

        if (value.length > 0) {

            clearSearch.classList.add("show");

        } else {

            clearSearch.classList.remove("show");

        }

    }


    function clearSearchButton() {

        if (!clearSearch) return;

        clearSearch.classList.remove("show");

    }


    /* =====================================================
       MOBILE MENU
    ===================================================== */

    if (menuToggle && mobileNav) {

        menuToggle.addEventListener("click", () => {

            const isOpen =
                mobileNav.classList.contains("show");

            if (isOpen) {

                mobileNav.classList.remove("show");

                menuToggle.textContent = "☰";

            } else {

                mobileNav.classList.add("show");

                menuToggle.textContent = "✕";

            }

        });


        /* Close menu when link clicked */

        const mobileLinks =
            mobileNav.querySelectorAll("a");

        mobileLinks.forEach(link => {

            link.addEventListener("click", () => {

                mobileNav.classList.remove("show");

                menuToggle.textContent = "☰";

            });

        });

    }


    /* =====================================================
       KEYBOARD SHORTCUTS
    ===================================================== */

    document.addEventListener("keydown", (event) => {

        /* ---------------------------------------------
           "/" opens search
        --------------------------------------------- */

        if (
            event.key === "/" &&
            document.activeElement !== gameSearch
        ) {

            event.preventDefault();

            if (searchSection) {
                searchSection.classList.add("show");
            }

            if (gameSearch) {
                gameSearch.focus();
            }

        }


        /* ---------------------------------------------
           ESCAPE closes search/menu
        --------------------------------------------- */

        if (event.key === "Escape") {

            if (searchSection) {

                searchSection.classList.remove("show");

            }

            if (mobileNav) {

                mobileNav.classList.remove("show");

            }

            if (menuToggle) {

                menuToggle.textContent = "☰";

            }

        }

    });


    /* =====================================================
       CLOSE SEARCH WHEN CLICKING OUTSIDE
    ===================================================== */

    document.addEventListener("click", (event) => {

        if (
            !searchSection ||
            !searchSection.classList.contains("show")
        ) {
            return;
        }

        const clickedInsideSearch =
            searchSection.contains(event.target);

        const clickedSearchButton =
            searchToggle &&
            searchToggle.contains(event.target);

        if (
            !clickedInsideSearch &&
            !clickedSearchButton
        ) {

            searchSection.classList.remove("show");

        }

    });


    /* =====================================================
       SMOOTH ANCHOR NAVIGATION
    ===================================================== */

    document.querySelectorAll('a[href^="#"]').forEach(link => {

        link.addEventListener("click", event => {

            const targetId =
                link.getAttribute("href");

            if (
                !targetId ||
                targetId === "#"
            ) {
                return;
            }

            const target =
                document.querySelector(targetId);

            if (!target) {
                return;
            }

            event.preventDefault();

            target.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });

        });

    });


    /* =====================================================
       ACTIVE NAVIGATION
    ===================================================== */

    const navLinks =
        document.querySelectorAll(".nav-link");

    const sections =
        document.querySelectorAll(
            "main section[id]"
        );

    if (
        navLinks.length > 0 &&
        sections.length > 0
    ) {

        const updateActiveNavigation = () => {

            const scrollPosition =
                window.scrollY + 130;

            let currentSection = "home";

            sections.forEach(section => {

                const sectionTop =
                    section.offsetTop;

                const sectionHeight =
                    section.offsetHeight;

                if (
                    scrollPosition >= sectionTop &&
                    scrollPosition <
                        sectionTop + sectionHeight
                ) {

                    currentSection =
                        section.id;

                }

            });

            navLinks.forEach(link => {

                link.classList.remove("active");

                const href =
                    link.getAttribute("href");

                if (
                    href === `#${currentSection}`
                ) {

                    link.classList.add("active");

                }

            });

        };


        window.addEventListener(
            "scroll",
            updateActiveNavigation,
            { passive: true }
        );

        updateActiveNavigation();

    }


    /* =====================================================
       ESCAPE HTML
       Prevents search text from becoming HTML.
    ===================================================== */

    function escapeHTML(value) {

        const div =
            document.createElement("div");

        div.textContent = value;

        return div.innerHTML;

    }


    /* =====================================================
       GAME CARD HOVER EFFECT
    ===================================================== */

    gameCards.forEach(card => {

        card.addEventListener("mouseenter", () => {

            card.style.zIndex = "5";

        });

        card.addEventListener("mouseleave", () => {

            card.style.zIndex = "";

        });

    });


    /* =====================================================
       INITIAL STATE
    ===================================================== */

    showAllGames();

});

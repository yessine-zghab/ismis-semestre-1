// FIXED RESOURCE LINKS v4
/* =====================================================
   script.js
   Rendu dynamique des matières, du plan d'étude
   et de la fenêtre modale des ressources.

   v4 :
   - Countdown DS en direct (jours / heures / min / sec)
   - Recherche de chapitres / fichiers dans toutes les matières
   - Suivi de progression (cases à cocher, sauvegardé localement)

   Dépend de la variable globale `subjects`
   définie dans subjects.js
===================================================== */

const CATEGORY_LABELS = {
    cours: { label: "Cours", icon: "📘" },
    td: { label: "TD", icon: "✏️" },
    tp: { label: "TP", icon: "🧪" },
    ds: { label: "DS", icon: "📝" },
    examens: { label: "Examens", icon: "🎯" },
    corrections: { label: "Corrections", icon: "✅" },
    autres: { label: "Autres", icon: "📎" }
};

const CATEGORY_ORDER = [
    "cours",
    "td",
    "tp",
    "ds",
    "examens",
    "corrections",
    "autres"
];


/* =====================================================
   SESSIONS DS
===================================================== */

/* Sessions de DS — dates indicatives, à confirmer
   avec le planning officiel de l'ISIMS */

const DS_SESSIONS = [
    {
        id: "ds1",
        label: "Session DS 1",
        period: "Début novembre 2026",
        date: "2026-11-02",
        icon: "🍂"
    },
    {
        id: "ds2",
        label: "Session DS 2",
        period: "Début janvier 2027",
        date: "2027-01-05",
        icon: "❄️"
    }
];


/* =====================================================
   HELPERS
===================================================== */

function fileName(path) {

    const parts = String(path || "")
        .replace(/\\/g, "/")
        .split("/");

    return parts[parts.length - 1];
}


/*
 * =====================================================
 * IMPORTANT : RESOURCE PATH FIX
 * =====================================================
 *
 * Structure de ton site :
 *
 * index.html
 * script.js
 * subjects.js
 *
 * assets/
 *    documents/
 *        Algèbre/
 *        Analyse/
 *        Algorithmique/
 *        ...
 *
 * Dans subjects.js, les chemins sont par exemple :
 *
 * Algèbre/DS/DS2025/DS1-PLSI-2025.pdf
 *
 * Le navigateur doit donc ouvrir :
 *
 * assets/documents/Algèbre/DS/DS2025/DS1-PLSI-2025.pdf
 *
 * Cette fonction fait automatiquement cette conversion.
 */

function resourceUrl(path) {

    const raw = String(path || "")
        .trim()
        .replace(/\\/g, "/");

    /*
     * Si tu ajoutes un jour un lien externe,
     * on le laisse tel quel.
     */
    if (/^(https?:|mailto:|data:|blob:)/i.test(raw)) {
        return raw;
    }

    /*
     * Supprimer ./ au début
     */
    const clean = raw.replace(/^\.\//, "");

    /*
     * Éviter :
     *
     * assets/documents/assets/documents/...
     */
    const relative = clean.replace(
        /^assets\/documents\//i,
        ""
    );

    /*
     * Ajouter le dossier réel des documents
     */
    const fullPath = "assets/documents/" + relative;

    /*
     * Encoder correctement :
     *
     * espaces
     * accents
     * caractères spéciaux
     *
     * mais conserver "/" comme séparateur
     */
    return fullPath
        .split("/")
        .map(function(part) {
            return encodeURIComponent(part);
        })
        .join("/");
}


/* =====================================================
   TOTAL RESOURCES
===================================================== */

function totalResources(subject) {

    const res = subject.resources || {};

    return Object.values(res).reduce(
        function(sum, arr) {
            return sum + (
                Array.isArray(arr)
                    ? arr.length
                    : 0
            );
        },
        0
    );
}


/* =====================================================
   UE SLUG
===================================================== */

function ueSlug(ue) {

    return ue &&
        ue.toLowerCase().includes("trans")
        ? "trans"
        : "fond";
}


/* =====================================================
   PROGRESS TRACKING (localStorage)
===================================================== */

const PROGRESS_KEY = "isims_progress_v1";

function getProgressSet() {

    try {

        return new Set(
            JSON.parse(
                localStorage.getItem(PROGRESS_KEY) || "[]"
            )
        );

    } catch (e) {

        return new Set();

    }

}

function saveProgressSet(set) {

    try {

        localStorage.setItem(
            PROGRESS_KEY,
            JSON.stringify(Array.from(set))
        );

    } catch (e) {

        /* stockage indisponible, on ignore */

    }

}

function resourceKey(index, catKey, path) {

    return index + "::" + catKey + "::" + path;

}

function toggleResource(key) {

    const set = getProgressSet();

    if (set.has(key)) {
        set.delete(key);
    } else {
        set.add(key);
    }

    saveProgressSet(set);

}

function computeProgress(subject, index) {

    const total = totalResources(subject);

    if (total === 0) {
        return { done: 0, total: 0, pct: 0 };
    }

    const set = getProgressSet();
    const res = subject.resources || {};

    let done = 0;

    Object.keys(res).forEach(function(k) {

        (res[k] || []).forEach(function(p) {

            if (set.has(resourceKey(index, k, p))) {
                done++;
            }

        });

    });

    return {
        done: done,
        total: total,
        pct: Math.round((done / total) * 100)
    };

}


/* =====================================================
   SUBJECTS PAGE
===================================================== */

function renderSubjects() {

    const list =
        document.getElementById("subjectList");

    const searchInput =
        document.getElementById("search");

    if (!list) return;

    const rawQuery =
        (searchInput && searchInput.value) || "";

    const query = rawQuery.trim().toLowerCase();

    const groups = {};

    subjects.forEach(function(subject) {

        if (!groups[subject.ue]) {
            groups[subject.ue] = [];
        }

        groups[subject.ue].push(subject);

    });


    let html = "";
    let matchCount = 0;


    Object.keys(groups).forEach(function(ueName) {

        const filtered =
            groups[ueName].filter(function(subject) {

                return subject.name
                    .toLowerCase()
                    .includes(query);

            });


        if (filtered.length === 0) {
            return;
        }


        matchCount += filtered.length;


        const slug = ueSlug(ueName);


        html += `
            <div class="resource-group ${slug}">
                <h3>${ueName}</h3>

                <div class="subject-grid">
        `;


        filtered.forEach(function(subject) {

            const globalIndex =
                subjects.indexOf(subject);

            const nbFiles =
                totalResources(subject);

            const regimeClass =
                subject.regime === "CC"
                    ? "regime-cc"
                    : "regime-rm";

            const prog =
                computeProgress(subject, globalIndex);


            html += `
                <div
                    class="card subject-card ${slug}"
                    onclick="openSubject(${globalIndex})"
                >

                    <span class="ue">
                        ${subject.ue}
                    </span>

                    <h3>
                        ${subject.name}
                    </h3>

                    <div class="subject-meta">

                        <span class="pill">
                            Coef ${subject.coef}
                        </span>

                        <span class="pill">
                            ${subject.credits} crédits
                        </span>

                        <span class="pill ${regimeClass}">
                            ${subject.regime}
                        </span>

                        <span class="pill">
                            ${nbFiles}
                            fichier${nbFiles > 1 ? "s" : ""}
                        </span>

                    </div>

                    ${
                        prog.total > 0
                            ? `
                        <div class="progress-bar">
                            <div
                                class="progress-fill"
                                style="width:${prog.pct}%"
                            ></div>
                        </div>
                        <span class="progress-label">
                            ${prog.done}/${prog.total}
                            ressources vues (${prog.pct}%)
                        </span>
                    `
                            : ""
                    }

                </div>
            `;

        });


        html += `
                </div>
            </div>
        `;

    });


    if (matchCount === 0) {

        html = `
            <div class="empty">
                Aucune matière ne correspond à
                « ${rawQuery} ».
            </div>
        `;

    }


    list.innerHTML = html;

    renderChapterMatches(rawQuery);

}


/* =====================================================
   CHAPTER / FILE SEARCH
   Recherche un chapitre / fichier dans toutes
   les matières (cours, TD, DS, examens...)
===================================================== */

function renderChapterMatches(rawQuery) {

    const el =
        document.getElementById("chapterResults");

    if (!el) return;

    const q = (rawQuery || "").trim().toLowerCase();

    if (!q) {
        el.innerHTML = "";
        return;
    }

    const matches = [];

    subjects.forEach(function(subject, index) {

        const res = subject.resources || {};

        CATEGORY_ORDER.forEach(function(catKey) {

            const files = res[catKey];

            if (!Array.isArray(files)) return;

            files.forEach(function(path) {

                const name =
                    fileName(path).toLowerCase();

                if (
                    name.includes(q) ||
                    String(path).toLowerCase().includes(q)
                ) {

                    matches.push({
                        index: index,
                        subject: subject,
                        catKey: catKey,
                        path: path
                    });

                }

            });

        });

    });

    if (matches.length === 0) {
        el.innerHTML = "";
        return;
    }

    const MAX_SHOWN = 40;
    const shown = matches.slice(0, MAX_SHOWN);

    let html = `
        <div class="section-title" style="margin-top:8px;">
            <div>
                <h2 style="font-size:20px;">
                    📄 Chapitres &amp; fichiers correspondants
                </h2>
                <span class="muted">
                    ${matches.length}
                    résultat${matches.length > 1 ? "s" : ""}
                    pour « ${rawQuery} »
                </span>
            </div>
        </div>

        <div class="file-list">
    `;

    shown.forEach(function(m) {

        const safePath = resourceUrl(m.path);
        const meta = CATEGORY_LABELS[m.catKey];

        html += `
            <a
                class="file"
                href="${safePath}"
                target="_blank"
                rel="noopener noreferrer"
                title="Ouvrir ${fileName(m.path)}"
                style="text-decoration:none;color:inherit;"
            >

                <span
                    class="file-name"
                    style="
                        display:flex;
                        align-items:center;
                        gap:8px;
                        min-width:0;
                        flex:1;
                    "
                >
                    📄 ${fileName(m.path)}
                </span>

                <span
                    style="
                        display:flex;
                        align-items:center;
                        gap:8px;
                        flex:0 0 auto;
                    "
                >
                    <span class="cat-badge cat-${m.catKey}">
                        ${meta.icon} ${meta.label}
                    </span>
                    <span class="pill" style="white-space:nowrap;">
                        ${m.subject.name}
                    </span>
                </span>

            </a>
        `;

    });

    html += `</div>`;

    if (matches.length > shown.length) {

        html += `
            <div class="muted" style="margin-top:10px;font-size:12px;">
                Affichage des ${shown.length} premiers résultats
                sur ${matches.length}.
            </div>
        `;

    }

    el.innerHTML = html;

}


/* =====================================================
   MODAL - DETAIL D'UNE MATIERE
===================================================== */

function openSubject(index) {

    const subject = subjects[index];

    if (!subject) return;


    const modal =
        document.getElementById("modal");

    const content =
        document.getElementById("modalContent");


    if (!modal || !content) {
        return;
    }


    const res =
        subject.resources || {};


    const regimeClass =
        subject.regime === "CC"
            ? "regime-cc"
            : "regime-rm";

    const prog =
        computeProgress(subject, index);


    let body = `

        <span class="ue">
            ${subject.ue}
        </span>

        <h2 style="margin:6px 0 14px;">
            ${subject.name}
        </h2>


        <div class="kv">

            <div>
                <span>H.C</span>
                <strong>${subject.hc}</strong>
            </div>

            <div>
                <span>H.TD</span>
                <strong>${subject.htd}</strong>
            </div>

            <div>
                <span>H.TP</span>
                <strong>${subject.htp}</strong>
            </div>

            <div>
                <span>H.CI</span>
                <strong>${subject.hci}</strong>
            </div>

        </div>


        <div
            class="subject-meta"
            style="margin-bottom:6px;"
        >

            <span class="pill">
                Coefficient ${subject.coef}
            </span>

            <span class="pill">
                ${subject.credits} crédits
            </span>

            <span class="pill ${regimeClass}">
                Régime ${subject.regime}
            </span>

        </div>

        ${
            prog.total > 0
                ? `
            <div style="margin-top:14px;">
                <div class="progress-bar">
                    <div
                        class="progress-fill"
                        id="modalProgressFill"
                        style="width:${prog.pct}%"
                    ></div>
                </div>
                <span class="progress-label" id="modalProgressLabel">
                    ${prog.done}/${prog.total}
                    ressources vues (${prog.pct}%)
                </span>
            </div>
        `
                : ""
        }

    `;


    const hasResources =
        CATEGORY_ORDER.some(function(key) {

            return (
                Array.isArray(res[key]) &&
                res[key].length > 0
            );

        });


    if (!hasResources) {

        body += `

            <div
                class="empty"
                style="margin-top:20px;"
            >

                Aucune ressource n'a encore été
                ajoutée pour cette matière.

            </div>

        `;

    }


    else {

        CATEGORY_ORDER.forEach(function(key) {

            const files = res[key];


            if (
                !Array.isArray(files) ||
                files.length === 0
            ) {
                return;
            }


            const meta =
                CATEGORY_LABELS[key];


            body += `

                <div
                    class="resource-group"
                    style="margin-top:22px;"
                >

                    <span
                        class="cat-badge cat-${key}"
                    >

                        ${meta.icon}
                        ${meta.label}
                        · ${files.length}

                    </span>


                    <div class="file-list">

            `;


            files.forEach(function(path) {

                const safePath =
                    resourceUrl(path);

                const rKey =
                    resourceKey(index, key, path);

                const isChecked =
                    getProgressSet().has(rKey)
                        ? "checked"
                        : "";


                body += `

                    <div class="file">

                        <input
                            type="checkbox"
                            class="progress-check"
                            data-key="${rKey}"
                            title="Marquer comme vu"
                            ${isChecked}
                        >

                        <a
                            class="file-name"
                            href="${safePath}"
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Ouvrir ${fileName(path)}"

                            style="
                                display:flex;
                                align-items:center;
                                gap:8px;
                                min-width:0;
                                flex:1;
                                text-decoration:none;
                                color:inherit;
                            "
                        >

                            📄
                            ${fileName(path)}

                        </a>


                        <a
                            class="file-open"
                            href="${safePath}"
                            target="_blank"
                            rel="noopener noreferrer"

                            style="
                                display:inline-flex;
                                align-items:center;
                                justify-content:center;
                                flex:0 0 auto;
                                padding:8px 12px;
                                border-radius:10px;
                                background:#4f46e5;
                                color:#fff;
                                font-size:13px;
                                font-weight:700;
                                white-space:nowrap;
                                text-decoration:none;
                            "
                        >

                            ↗ Ouvrir

                        </a>

                    </div>

                `;

            });


            body += `
                    </div>
                </div>
            `;

        });

    }


    content.innerHTML = body;


    /* Brancher les cases à cocher de progression */

    content.querySelectorAll(".progress-check").forEach(function(cb) {

        cb.addEventListener("change", function() {

            toggleResource(cb.dataset.key);
            updateModalProgress(index);

            if (typeof renderSubjects === "function") {
                renderSubjects();
            }

        });

    });


    modal.classList.add("show");

}


/* =====================================================
   UPDATE MODAL PROGRESS (sans tout re-render)
===================================================== */

function updateModalProgress(index) {

    const subject = subjects[index];

    if (!subject) return;

    const prog = computeProgress(subject, index);

    const fill =
        document.getElementById("modalProgressFill");

    const label =
        document.getElementById("modalProgressLabel");

    if (fill) {
        fill.style.width = prog.pct + "%";
    }

    if (label) {
        label.textContent =
            prog.done + "/" + prog.total +
            " ressources vues (" + prog.pct + "%)";
    }

}


/* =====================================================
   CLOSE MODAL
===================================================== */

function closeModal() {

    const modal =
        document.getElementById("modal");


    if (modal) {

        modal.classList.remove("show");

    }

}


/* =====================================================
   PLANNING PAGE
===================================================== */

function renderPlanning() {

    const fundBody =
        document.getElementById("fundTable");

    const transBody =
        document.getElementById("transTable");


    if (!fundBody || !transBody) {
        return;
    }


    function rowsFor(ueName) {

        return subjects

            .filter(function(s) {

                return s.ue === ueName;

            })

            .map(function(s) {

                return `

                    <tr>

                        <td>
                            ${s.name}
                        </td>

                        <td>
                            ${s.hc}
                        </td>

                        <td>
                            ${s.htd}
                        </td>

                        <td>
                            ${s.htp}
                        </td>

                        <td>
                            ${s.hci}
                        </td>

                        <td>
                            ${s.coef}
                        </td>

                        <td>
                            ${s.credits}
                        </td>

                        <td>

                            <span
                                class="pill ${
                                    s.regime === "CC"
                                        ? "regime-cc"
                                        : "regime-rm"
                                }"
                            >

                                ${s.regime}

                            </span>

                        </td>

                    </tr>

                `;

            })

            .join("");

    }


    fundBody.innerHTML =
        rowsFor("UE Fondamentales");


    transBody.innerHTML =
        rowsFor("UE Transversales");

}


/* =====================================================
   DARK MODE
===================================================== */

function initTheme() {

    let saved = null;


    try {

        saved =
            localStorage.getItem("theme");

    }

    catch (e) {

        saved = null;

    }


    if (saved === "dark") {

        document.documentElement
            .setAttribute(
                "data-theme",
                "dark"
            );

    }


    updateThemeIcon();

}


/* =====================================================
   TOGGLE THEME
===================================================== */

function toggleTheme() {

    const isDark =
        document.documentElement
            .getAttribute("data-theme") === "dark";


    if (isDark) {

        document.documentElement
            .removeAttribute("data-theme");

        trySaveTheme("light");

    }

    else {

        document.documentElement
            .setAttribute(
                "data-theme",
                "dark"
            );

        trySaveTheme("dark");

    }


    updateThemeIcon();

}


/* =====================================================
   SAVE THEME
===================================================== */

function trySaveTheme(value) {

    try {

        localStorage.setItem(
            "theme",
            value
        );

    }

    catch (e) {

        /* stockage indisponible, on ignore */

    }

}


/* =====================================================
   UPDATE THEME ICON
===================================================== */

function updateThemeIcon() {

    const btn =
        document.getElementById(
            "theme-toggle"
        );


    if (!btn) {
        return;
    }


    const isDark =
        document.documentElement
            .getAttribute("data-theme") === "dark";


    btn.textContent =
        isDark
            ? "☀️"
            : "🌙";

}


/* =====================================================
   REVISIONS / DS SCHEDULE PAGE
   Countdown en direct : jours / heures / min / sec
===================================================== */

let dsCountdownInterval = null;


function formatDate(dateStr) {

    const d =
        new Date(
            dateStr + "T00:00:00"
        );


    return d.toLocaleDateString(
        "fr-FR",
        {
            day: "numeric",
            month: "long",
            year: "numeric"
        }
    );

}


function renderCountdownGrid(dateStr) {

    return `
        <div class="ds-countdown" data-date="${dateStr}">

            <div class="ds-countdown-grid">

                <div class="cd-unit">
                    <strong class="cd-days">0</strong>
                    <span>Jours</span>
                </div>

                <div class="cd-unit">
                    <strong class="cd-hours">00</strong>
                    <span>Heures</span>
                </div>

                <div class="cd-unit">
                    <strong class="cd-minutes">00</strong>
                    <span>Min</span>
                </div>

                <div class="cd-unit">
                    <strong class="cd-seconds">00</strong>
                    <span>Sec</span>
                </div>

            </div>

            <span class="cd-status muted"></span>

        </div>
    `;

}


function updateCountdowns() {

    document
        .querySelectorAll(".ds-countdown[data-date]")
        .forEach(function(box) {

            const dateStr =
                box.getAttribute("data-date");

            const target =
                new Date(dateStr + "T00:00:00");

            const now = new Date();

            const diff = target - now;

            const daysEl = box.querySelector(".cd-days");
            const hoursEl = box.querySelector(".cd-hours");
            const minEl = box.querySelector(".cd-minutes");
            const secEl = box.querySelector(".cd-seconds");
            const statusEl = box.querySelector(".cd-status");


            if (diff <= 0) {

                if (daysEl) daysEl.textContent = "0";
                if (hoursEl) hoursEl.textContent = "00";
                if (minEl) minEl.textContent = "00";
                if (secEl) secEl.textContent = "00";

                if (statusEl) {

                    statusEl.textContent =
                        diff > -86400000
                            ? "🎯 Aujourd'hui — bonne chance !"
                            : "✅ Session passée";

                }

                return;

            }


            const d = Math.floor(diff / 86400000);
            const h = Math.floor((diff % 86400000) / 3600000);
            const m = Math.floor((diff % 3600000) / 60000);
            const s = Math.floor((diff % 60000) / 1000);


            if (daysEl) daysEl.textContent = d;
            if (hoursEl) hoursEl.textContent = String(h).padStart(2, "0");
            if (minEl) minEl.textContent = String(m).padStart(2, "0");
            if (secEl) secEl.textContent = String(s).padStart(2, "0");

            if (statusEl) {
                statusEl.textContent = "avant le début";
            }

        });

}


/* =====================================================
   RENDER REVISIONS
===================================================== */

function renderRevisions() {

    const sessionsEl =
        document.getElementById(
            "dsSessions"
        );


    const subjectListEl =
        document.getElementById(
            "dsSubjectList"
        );


    /* =================================================
       DS SESSIONS
    ================================================= */

    if (sessionsEl) {

        sessionsEl.innerHTML =
            DS_SESSIONS

                .map(function(session) {

                    return `

                        <div
                            class="card ds-session-card"
                        >

                            <div
                                class="ds-session-icon"
                            >
                                ${session.icon}
                            </div>


                            <span class="ue">
                                ${session.label}
                            </span>


                            <h3
                                style="
                                    margin:6px 0 4px;
                                "
                            >
                                ${session.period}
                            </h3>


                            <span class="muted">
                                ${formatDate(
                                    session.date
                                )}
                            </span>


                            ${renderCountdownGrid(session.date)}

                        </div>

                    `;

                })

                .join("");


        /* Démarrer / redémarrer le tick du countdown */

        if (dsCountdownInterval) {
            clearInterval(dsCountdownInterval);
        }

        updateCountdowns();

        dsCountdownInterval =
            setInterval(updateCountdowns, 1000);

    }


    /* =================================================
       SUBJECTS WITH DS
    ================================================= */

    if (subjectListEl) {

        const withDs =
            subjects.filter(function(s) {

                const res =
                    s.resources || {};


                return (
                    Array.isArray(res.ds) &&
                    res.ds.length > 0
                );

            });


        if (withDs.length === 0) {

            subjectListEl.innerHTML = `

                <div class="empty">

                    Aucun sujet de DS
                    n'est encore disponible.

                </div>

            `;

        }

        else {

            subjectListEl.innerHTML = `

                <div class="subject-grid">

                    ${withDs

                        .map(function(s) {

                            const globalIndex =
                                subjects.indexOf(s);


                            const slug =
                                ueSlug(s.ue);


                            return `

                                <div
                                    class="
                                        card
                                        subject-card
                                        ${slug}
                                    "

                                    onclick="
                                        openSubject(
                                            ${globalIndex}
                                        )
                                    "
                                >

                                    <span class="ue">
                                        ${s.ue}
                                    </span>


                                    <h3>
                                        ${s.name}
                                    </h3>


                                    <div
                                        class="subject-meta"
                                    >

                                        <span
                                            class="
                                                cat-badge
                                                cat-ds
                                            "
                                        >

                                            📝

                                            ${
                                                s.resources.ds.length
                                            }

                                            sujet${
                                                s.resources.ds.length > 1
                                                    ? "s"
                                                    : ""
                                            }

                                            de DS

                                        </span>

                                    </div>

                                </div>

                            `;

                        })

                        .join("")}

                </div>

            `;

        }

    }

}

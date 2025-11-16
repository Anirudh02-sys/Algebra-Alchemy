// ---------------------- PROBLEM DEFINITIONS ----------------------

const rawEquations = [
    "2x - 3 = x + 4",
    "3x + 2 = x + 10",
    "5x - 4 = 2x + 8",
    "4x + 1 = x + 13",
    "6x - 5 = 3x + 7"
];

// Build problems automatically: derive tokens & correct order
const problems = rawEquations.map((eq) => {
    const isolated = isolateEquation(eq);          // e.g. "3x - x = 10 - 2"
    const tokens = equationToTokens(isolated);     // ["3x","-","x","=","10","-","2"]
    return {
        original: eq,      // shown at top
        tokens,            // chips (shuffled before display)
        correct: tokens,   // target order
    };
});

let currentProblemIndex = 0;
let correctOrder = problems[0].correct;
let draggedElement = null;

let solved = Array(problems.length).fill(false);
let score = 0;   // number of problems solved

// ---------------------- UTILS ----------------------

function shuffle(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

// ---------------------- CORE UI LOGIC ----------------------

function loadProblem(index) {
    const problem = problems[index];
    correctOrder = problem.correct;

    const container = document.getElementById("chip-container");
    const status = document.getElementById("status-message");
    const nextBtn = document.getElementById("next-problem");
    const originalEq = document.getElementById("original-equation");

    originalEq.textContent = problem.original;

    container.innerHTML = "";
    status.textContent = "";
    status.classList.remove("correct");
    nextBtn.style.display = solved[index] ? "inline-flex" : "none";
    nextBtn.disabled = false;
    nextBtn.textContent = (index === problems.length - 1 && solved[index])
        ? "All problems done"
        : "Next problem →";

    const shuffledTokens = shuffle(problem.tokens);

    shuffledTokens.forEach(token => {
        const chip = document.createElement("div");
        chip.className = "chip";
        chip.textContent = token;
        chip.setAttribute("draggable", "true");
        addChipDragHandlers(chip);
        container.appendChild(chip);
    });

    updatePagination(index);
    updateProgressUI();
}

function addChipDragHandlers(chip) {
    chip.addEventListener("dragstart", () => {
        draggedElement = chip;
        chip.classList.add("dragging");
    });

    chip.addEventListener("dragend", () => {
        if (draggedElement) {
            draggedElement.classList.remove("dragging");
            draggedElement = null;
        }
        checkCorrect();
    });
}

function getDragAfterElement(container, x) {
    const draggableElements = [...container.querySelectorAll(".chip:not(.dragging)")];

    return draggableElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = x - box.left - box.width / 2;
        if (offset < 0 && offset > closest.offset) {
            return { offset: offset, element: child };
        } else {
            return closest;
        }
    }, { offset: Number.NEGATIVE_INFINITY, element: null }).element;
}

function setupContainerDnD() {
    const container = document.getElementById("chip-container");

    container.addEventListener("dragover", (e) => {
        e.preventDefault();
        if (!draggedElement) return;

        const afterElement = getDragAfterElement(container, e.clientX);
        if (afterElement == null) {
            container.appendChild(draggedElement);
        } else {
            container.insertBefore(draggedElement, afterElement);
        }
    });

    container.addEventListener("drop", (e) => {
        e.preventDefault();
        checkCorrect();
    });
}

// Check if tokens are in correct order
function checkCorrect() {
    const container = document.getElementById("chip-container");
    const status = document.getElementById("status-message");
    const nextBtn = document.getElementById("next-problem");

    const currentOrder = [...container.querySelectorAll(".chip")]
        .map(chip => chip.textContent.trim());

    if (currentOrder.length !== correctOrder.length) return;

    const isCorrect = currentOrder.every(
        (value, index) => value === correctOrder[index]
    );

    container.classList.remove("shake");

    if (isCorrect) {
        status.textContent = "Correct! 🎉";
        status.classList.add("correct");

        // pulse chips
        container.querySelectorAll(".chip").forEach(c => {
            c.classList.add("correct-chip");
            setTimeout(() => c.classList.remove("correct-chip"), 400);
        });

        if (!solved[currentProblemIndex]) {
            solved[currentProblemIndex] = true;
            score += 1;
            updateProgressUI();

            // if this was the last problem, show completion modal
            if (currentProblemIndex === problems.length - 1) {
                nextBtn.textContent = "All problems done";
                nextBtn.disabled = true;
                showCompletionModal();
            } else {
                nextBtn.style.display = "inline-flex";
            }
        } else {
            // already solved, but still show next button if not last
            if (currentProblemIndex !== problems.length - 1) {
                nextBtn.style.display = "inline-flex";
            }
        }
    } else {
        status.textContent = "Keep going...";
        status.classList.remove("correct");
        nextBtn.style.display = "none";

        // little shake animation on wrong arrangement
        container.classList.add("shake");
        setTimeout(() => container.classList.remove("shake"), 250);
    }
}

// Pagination highlighting
function updatePagination(index) {
    const currentPageNumber = index + 1;
    const pages = document.querySelectorAll(".pagination .page");

    pages.forEach(page => {
        const pageNum = parseInt(page.dataset.page, 10);
        const isCurrent = pageNum === currentPageNumber;
        page.classList.toggle("active", isCurrent);
        page.classList.toggle("inactive", !isCurrent);
    });
}

// Score / XP / Stars
function updateProgressUI() {
    const summary = document.getElementById("progress-summary");
    const xp = score * 10;
    summary.textContent = `Score: ${score}/${problems.length} · XP: ${xp}`;

    const stars = document.querySelectorAll(".star-indicator");
    const filledCount = score; // 1 star per solved problem
    stars.forEach((star, index) => {
        star.classList.toggle("filled", index < filledCount);
    });
}

// Next button
function setupNextButton() {
    const nextBtn = document.getElementById("next-problem");
    nextBtn.addEventListener("click", () => {
        if (currentProblemIndex < problems.length - 1) {
            currentProblemIndex++;
            loadProblem(currentProblemIndex);
        }
    });
}

// Completion modal
function showCompletionModal() {
    const overlay = document.getElementById("completion-overlay");
    const stats = document.getElementById("completion-stats");
    const xp = score * 10;
    stats.textContent = `You solved ${score} of ${problems.length} problems · XP earned: ${xp}`;
    overlay.classList.remove("hidden");
}

function setupCompletionModal() {
    const overlay = document.getElementById("completion-overlay");
    const closeBtn = document.getElementById("close-modal");
    closeBtn.addEventListener("click", () => {
        overlay.classList.add("hidden");
    });
}

// Init
document.addEventListener("DOMContentLoaded", () => {
    setupContainerDnD();
    setupNextButton();
    setupCompletionModal();
    loadProblem(currentProblemIndex);
});

// ---------------------- EQUATION HELPERS ----------------------

// Turn "3x - x = 10 - 2" into ["3x","-","x","=","10","-","2"]
function equationToTokens(eq) {
    return eq.replace(/\s+/g, " ").trim().split(" ");
}

function flipSign(term) {
    term = term.trim();
    if (term.startsWith("+")) term = term.slice(1);

    if (term.startsWith("-")) {
        return term.slice(1);          // "-2" -> "2"
    } else {
        return "-" + term;             // "2" -> "-2"
    }
}

function parseSide(side) {
    side = side.replace(/\s+/g, "");
    const chunks = side.match(/[+-]?[^+-]+/g) || [];

    const xTerms = [];
    const constTerms = [];

    chunks.forEach(ch => {
        if (ch.includes("x")) {
            xTerms.push(ch);
        } else {
            constTerms.push(ch);
        }
    });

    return { xTerms, constTerms };
}

function joinTerms(terms) {
    if (terms.length === 0) return "0";

    return terms.map((t, i) => {
        let sign = "+";
        let body = t;

        if (t.startsWith("-")) {
            sign = "-";
            body = t.slice(1);
        } else if (t.startsWith("+")) {
            body = t.slice(1);
        }

        if (i === 0) {
            return sign === "-" ? `-${body}` : body;
        } else {
            return ` ${sign} ${body}`;
        }
    }).join("");
}

// Given "3x + 2 = x + 10" return "3x - x = 10 - 2"
function isolateEquation(equation) {
    const [leftRaw, rightRaw] = equation.split("=");
    const left = parseSide(leftRaw);
    const right = parseSide(rightRaw);

    const xTerms = [
        ...left.xTerms,
        ...right.xTerms.map(flipSign)
    ];

    const constTerms = [
        ...right.constTerms,
        ...left.constTerms.map(flipSign)
    ];

    const leftStr = joinTerms(xTerms);
    const rightStr = joinTerms(constTerms);

    return `${leftStr} = ${rightStr}`;
}

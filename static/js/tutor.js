// ---------------------- LESSON 1: ISOLATING X (DRAG) ----------------------

const isolatingEquations = [
    "2x - 3 = x + 4",
    "3x + 2 = x + 10",
    "5x - 4 = 2x + 8",
    "4x + 1 = x + 13",
    "6x - 5 = 3x + 7"
];

const isolatingProblems = isolatingEquations.map((eq) => {
    const isolated = isolateEquation(eq);          // e.g. "3x - x = 10 - 2"
    const tokens = equationToTokens(isolated);     // ["3x","-","x","=","10","-","2"]
    return {
        original: eq,
        tokens,
        correct: tokens,
    };
});

let isolatingCurrentIndex = 0;
let isolatingCorrectOrder = isolatingProblems[0].correct;
let isolatingSolved = Array(isolatingProblems.length).fill(false);
let isolatingScore = 0;   // number of isolating problems solved

// ---------------------- LESSON 2: SOLVING FOR X (MCQ) ----------------------

const solvingProblems = [
    {
        original: "5x + 2 = 12",
        steps: [
            {
                question: "After isolating the x-terms on one side, what is the equation?",
                options: [
                    "5x = 12 - 2",
                    "5x + 2 = 12 - 2",
                    "5x - 2 = 12",
                    "5x = 12 + 2"
                ],
                correctIndex: 0
            },
            {
                question: "What is the equation after simplifying the right-hand side?",
                options: [
                    "5x = 14",
                    "5x = 10",
                    "5x = 2",
                    "x = 10"
                ],
                correctIndex: 1
            },
            {
                question: "What is the next algebraic step to solve for x?",
                options: [
                    "5x/5 = 10/5",
                    "5x + 5 = 10 + 5",
                    "5x = 10/5",
                    "x = 10/5"
                ],
                correctIndex: 0
            },
            {
                question: "What does x equal?",
                options: [
                    "x = 10",
                    "x = 1/2",
                    "x = 2",
                    "x = 5"
                ],
                correctIndex: 2
            }
        ]
    },
    {
        original: "3x - 4 = 11",
        steps: [
            {
                question: "After isolating the x-terms on one side, what is the equation?",
                options: [
                    "3x = 11 + 4",
                    "3x = 11 - 4",
                    "3x - 4 = 11 - 4",
                    "x = 11 + 4"
                ],
                correctIndex: 0
            },
            {
                question: "What is the equation after simplifying the right-hand side?",
                options: [
                    "3x = 7",
                    "3x = 15",
                    "3x = -15",
                    "x = 15"
                ],
                correctIndex: 1
            },
            {
                question: "What is the next algebraic step to solve for x?",
                options: [
                    "3x/3 = 15/3",
                    "3x + 3 = 15 + 3",
                    "3x = 15/3",
                    "x = 15/3"
                ],
                correctIndex: 0
            },
            {
                question: "What does x equal?",
                options: [
                    "x = 3",
                    "x = 4",
                    "x = 5",
                    "x = 15"
                ],
                correctIndex: 2
            }
        ]
    },
    {
        original: "4x + 6 = 22",
        steps: [
            {
                question: "After isolating the x-terms on one side, what is the equation?",
                options: [
                    "4x = 22 - 6",
                    "4x + 6 = 22 - 6",
                    "4x - 6 = 22",
                    "4x = 22 + 6"
                ],
                correctIndex: 0
            },
            {
                question: "What is the equation after simplifying the right-hand side?",
                options: [
                    "4x = 28",
                    "4x = 16",
                    "4x = 6",
                    "x = 4"
                ],
                correctIndex: 1
            },
            {
                question: "What is the next algebraic step to solve for x?",
                options: [
                    "4x/4 = 16/4",
                    "4x + 4 = 16 + 4",
                    "4x = 16/4",
                    "x = 16/4"
                ],
                correctIndex: 0
            },
            {
                question: "What does x equal?",
                options: [
                    "x = 2",
                    "x = 3",
                    "x = 4",
                    "x = 8"
                ],
                correctIndex: 2
            }
        ]
    },
    {
        original: "2x - 5 = 9",
        steps: [
            {
                question: "After isolating the x-terms on one side, what is the equation?",
                options: [
                    "2x = 9 + 5",
                    "2x = 9 - 5",
                    "2x - 5 = 9 - 5",
                    "x = 9 + 5"
                ],
                correctIndex: 0
            },
            {
                question: "What is the equation after simplifying the right-hand side?",
                options: [
                    "2x = 4",
                    "2x = 14",
                    "2x = -14",
                    "x = 14"
                ],
                correctIndex: 1
            },
            {
                question: "What is the next algebraic step to solve for x?",
                options: [
                    "2x/2 = 14/2",
                    "2x + 2 = 14 + 2",
                    "2x = 14/2",
                    "x = 14/2"
                ],
                correctIndex: 0
            },
            {
                question: "What does x equal?",
                options: [
                    "x = 9",
                    "x = 5",
                    "x = 7",
                    "x = 2"
                ],
                correctIndex: 2
            }
        ]
    },
    {
        original: "7x + 1 = 29",
        steps: [
            {
                question: "After isolating the x-terms on one side, what is the equation?",
                options: [
                    "7x = 29 - 1",
                    "7x + 1 = 29 - 1",
                    "7x - 1 = 29",
                    "7x = 29 + 1"
                ],
                correctIndex: 0
            },
            {
                question: "What is the equation after simplifying the right-hand side?",
                options: [
                    "7x = 30",
                    "7x = 28",
                    "7x = 26",
                    "x = 4"
                ],
                correctIndex: 1
            },
            {
                question: "What is the next algebraic step to solve for x?",
                options: [
                    "7x/7 = 28/7",
                    "7x + 7 = 28 + 7",
                    "7x = 28/7",
                    "x = 28/7"
                ],
                correctIndex: 0
            },
            {
                question: "What does x equal?",
                options: [
                    "x = 3",
                    "x = 4",
                    "x = 7",
                    "x = 28"
                ],
                correctIndex: 1
            }
        ]
    }
];

let solvingCurrentProblemIndex = 0;
let solvingCurrentStepIndex = 0;
let solvingSolved = Array(solvingProblems.length).fill(false);
let solvingScore = 0;   // number of equations fully completed

// ---------------------- GLOBAL STATE ----------------------

let currentMode = "isolating"; // "isolating" | "solving"
let draggedElement = null;

// ---------------------- GENERIC HELPERS ----------------------

function shuffle(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

// Turn "3x - x = 10 - 2" into ["3x","-","x","=","10","-","2"]
function equationToTokens(eq) {
    return eq.replace(/\s+/g, " ").trim().split(" ");
}

function flipSign(term) {
    term = term.trim();
    if (term.startsWith("+")) term = term.slice(1);

    if (term.startsWith("-")) {
        return term.slice(1);
    } else {
        return "-" + term;
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

// ---------------------- ISOLATING MODE (DRAG) ----------------------

function loadIsolatingProblem(index) {
    const problem = isolatingProblems[index];
    isolatingCorrectOrder = problem.correct;

    const container = document.getElementById("chip-container");
    const status = document.getElementById("status-message");
    const nextBtn = document.getElementById("next-problem");
    const originalEq = document.getElementById("original-equation");

    originalEq.textContent = problem.original;

    container.innerHTML = "";
    status.textContent = "";
    status.classList.remove("correct");
    nextBtn.style.display = isolatingSolved[index] ? "inline-flex" : "none";
    nextBtn.disabled = false;
    nextBtn.textContent =
        (index === isolatingProblems.length - 1 && isolatingSolved[index])
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
        checkIsolatingCorrect();
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
        checkIsolatingCorrect();
    });
}

function checkIsolatingCorrect() {
    if (currentMode !== "isolating") return;

    const container = document.getElementById("chip-container");
    const status = document.getElementById("status-message");
    const nextBtn = document.getElementById("next-problem");

    const currentOrder = [...container.querySelectorAll(".chip")]
        .map(chip => chip.textContent.trim());

    if (currentOrder.length !== isolatingCorrectOrder.length) return;

    const isCorrect = currentOrder.every(
        (value, index) => value === isolatingCorrectOrder[index]
    );

    container.classList.remove("shake");

    if (isCorrect) {
        status.textContent = "Correct! 🎉";
        status.classList.add("correct");

        container.querySelectorAll(".chip").forEach(c => {
            c.classList.add("correct-chip");
            setTimeout(() => c.classList.remove("correct-chip"), 400);
        });

        if (!isolatingSolved[isolatingCurrentIndex]) {
            isolatingSolved[isolatingCurrentIndex] = true;
            isolatingScore += 1;
            updateProgressUI();

            if (isolatingCurrentIndex === isolatingProblems.length - 1) {
                nextBtn.textContent = "All problems done";
                nextBtn.disabled = true;
                showCompletionModal();
            } else {
                nextBtn.style.display = "inline-flex";
            }
        } else {
            if (isolatingCurrentIndex !== isolatingProblems.length - 1) {
                nextBtn.style.display = "inline-flex";
            }
        }
    } else {
        status.textContent = "Keep going...";
        status.classList.remove("correct");
        nextBtn.style.display = "none";

        container.classList.add("shake");
        setTimeout(() => container.classList.remove("shake"), 250);
    }
}

// ---------------------- SOLVING MODE (MCQ) ----------------------

function loadSolvingProblem(index) {
    solvingCurrentProblemIndex = index;
    solvingCurrentStepIndex = 0;
    renderCurrentSolvingStep();
    updateProgressUI();
}

function renderCurrentSolvingStep() {
    const problem = solvingProblems[solvingCurrentProblemIndex];
    const step = problem.steps[solvingCurrentStepIndex];

    const original = document.getElementById("mcq-original");
    const qEl = document.getElementById("mcq-question");
    const optsContainer = document.getElementById("mcq-options");
    const feedback = document.getElementById("mcq-feedback");
    const nextBtn = document.getElementById("mcq-next-step");

    original.textContent = problem.original;
    qEl.textContent = step.question;
    feedback.textContent = "";
    feedback.classList.remove("correct");
    nextBtn.disabled = true;
    nextBtn.textContent =
        solvingCurrentStepIndex < problem.steps.length - 1
            ? "Next step →"
            : (solvingCurrentProblemIndex < solvingProblems.length - 1
                ? "Next equation →"
                : "All done 🎉");

    optsContainer.innerHTML = "";
    step.options.forEach((opt, idx) => {
        const btn = document.createElement("button");
        btn.className = "mcq-option";
        btn.textContent = opt;
        btn.addEventListener("click", () => handleMcqAnswer(idx));
        optsContainer.appendChild(btn);
    });
}

function handleMcqAnswer(selectedIndex) {
    if (currentMode !== "solving") return;

    const problem = solvingProblems[solvingCurrentProblemIndex];
    const step = problem.steps[solvingCurrentStepIndex];
    const feedback = document.getElementById("mcq-feedback");
    const nextBtn = document.getElementById("mcq-next-step");
    const optionButtons = document.querySelectorAll(".mcq-option");

    optionButtons.forEach(btn => {
        btn.classList.remove("mcq-correct", "mcq-incorrect");
    });

    if (selectedIndex === step.correctIndex) {
        feedback.textContent = "Correct! 🎉";
        feedback.classList.add("correct");
        optionButtons[selectedIndex].classList.add("mcq-correct");
        nextBtn.disabled = false;
    } else {
        feedback.textContent = "Not quite. Try again.";
        feedback.classList.remove("correct");
        optionButtons[selectedIndex].classList.add("mcq-incorrect");
        nextBtn.disabled = true;
    }
}

function setupMcqNextButton() {
    const nextBtn = document.getElementById("mcq-next-step");
    if (!nextBtn) return;

    nextBtn.addEventListener("click", () => {
        const problem = solvingProblems[solvingCurrentProblemIndex];

        if (solvingCurrentStepIndex < problem.steps.length - 1) {
            // next step within same equation
            solvingCurrentStepIndex++;
            renderCurrentSolvingStep();
        } else {
            // finished this equation
            if (!solvingSolved[solvingCurrentProblemIndex]) {
                solvingSolved[solvingCurrentProblemIndex] = true;
                solvingScore += 1;
                updateProgressUI();
            }

            if (solvingCurrentProblemIndex < solvingProblems.length - 1) {
                solvingCurrentProblemIndex++;
                solvingCurrentStepIndex = 0;
                renderCurrentSolvingStep();
            } else {
                // all solving problems done
                const feedback = document.getElementById("mcq-feedback");
                feedback.textContent = "You finished all Solving for X problems! 🎉";
                feedback.classList.add("correct");
                nextBtn.disabled = true;
            }
        }
    });
}

// ---------------------- SHARED UI: PROGRESS, PAGINATION, MODAL ----------------------

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

function updateProgressUI() {
    const summary = document.getElementById("progress-summary");
    const isolatingElem = document.getElementById("isolating-progress");
    const solvingElem = document.getElementById("solving-progress");
    const stars = document.querySelectorAll(".star-indicator");

    // Top-left lesson percentages (always kept in sync)
    if (isolatingElem) {
        const percentIso = Math.round((isolatingScore / isolatingProblems.length) * 100);
        isolatingElem.textContent = `${percentIso}%`;
    }
    if (solvingElem) {
        const percentSol = Math.round((solvingScore / solvingProblems.length) * 100);
        solvingElem.textContent = `${percentSol}%`;
    }

    // Bottom bar reflects the *current* lesson
    let label, done, total;
    if (currentMode === "isolating") {
        label = "Isolating X-Terms";
        done = isolatingScore;
        total = isolatingProblems.length;
    } else {
        label = "Solving for X";
        done = solvingScore;
        total = solvingProblems.length;
    }
    const xp = done * 10;
    summary.textContent = `${label}: ${done}/${total} · XP: ${xp}`;

    const filledCount = done;
    stars.forEach((star, index) => {
        star.classList.toggle("filled", index < filledCount);
    });
}

function setupNextButton() {
    const nextBtn = document.getElementById("next-problem");
    nextBtn.addEventListener("click", () => {
        if (currentMode !== "isolating") return;

        if (isolatingCurrentIndex < isolatingProblems.length - 1) {
            isolatingCurrentIndex++;
            loadIsolatingProblem(isolatingCurrentIndex);
        }
    });
}

function showCompletionModal() {
    const overlay = document.getElementById("completion-overlay");
    const stats = document.getElementById("completion-stats");
    const xp = isolatingScore * 10;
    stats.textContent = `You solved ${isolatingScore} of ${isolatingProblems.length} problems · XP earned: ${xp}`;
    overlay.classList.remove("hidden");
}

function setupCompletionModal() {
    const overlay = document.getElementById("completion-overlay");
    const closeBtn = document.getElementById("close-modal");
    const nextLessonBtn = document.getElementById("next-lesson");

    if (closeBtn) {
        closeBtn.addEventListener("click", () => {
            overlay.classList.add("hidden");
        });
    }

    if (nextLessonBtn) {
        nextLessonBtn.addEventListener("click", () => {
            overlay.classList.add("hidden");

            const isolatingItem = document.getElementById("lesson-isolating");
            const solvingItem = document.getElementById("lesson-solving");

            if (isolatingItem) isolatingItem.classList.remove("active-lesson");
            if (solvingItem) solvingItem.classList.add("active-lesson");

            activateSolvingLesson();
        });
    }
}

// ---------------------- LESSON MODE SWITCHING ----------------------

function activateIsolatingLesson() {
    currentMode = "isolating";
    const dragMode = document.getElementById("drag-mode");
    const mcqMode = document.getElementById("mcq-mode");
    const label = document.getElementById("workspace-label");

    if (dragMode) dragMode.classList.remove("hidden");
    if (mcqMode) mcqMode.classList.add("hidden");
    if (label) label.textContent = "DRAG TO ISOLATE X";

    loadIsolatingProblem(isolatingCurrentIndex);
}

function activateSolvingLesson() {
    currentMode = "solving";
    const dragMode = document.getElementById("drag-mode");
    const mcqMode = document.getElementById("mcq-mode");
    const label = document.getElementById("workspace-label");

    if (dragMode) dragMode.classList.add("hidden");
    if (mcqMode) mcqMode.classList.remove("hidden");
    if (label) label.textContent = "SOLVING FOR X";

    loadSolvingProblem(solvingCurrentProblemIndex);
}

function setupLessonClicks() {
    const workspace = document.querySelector(".workspace-wrapper");
    const isolatingItem = document.getElementById("lesson-isolating");
    const solvingItem = document.getElementById("lesson-solving");

    if (isolatingItem) {
        isolatingItem.addEventListener("click", () => {
            if (workspace) {
                workspace.scrollIntoView({ behavior: "smooth", block: "center" });
            }

            isolatingItem.classList.add("active-lesson");
            if (solvingItem) solvingItem.classList.remove("active-lesson");
            activateIsolatingLesson();
        });
    }

    if (solvingItem) {
        solvingItem.addEventListener("click", () => {
            if (workspace) {
                workspace.scrollIntoView({ behavior: "smooth", block: "center" });
            }

            solvingItem.classList.add("active-lesson");
            if (isolatingItem) isolatingItem.classList.remove("active-lesson");
            activateSolvingLesson();
        });
    }
}

// ---------------------- INIT ----------------------

document.addEventListener("DOMContentLoaded", () => {
    setupContainerDnD();
    setupNextButton();
    setupCompletionModal();
    setupLessonClicks();
    setupMcqNextButton();
    activateIsolatingLesson();  // start in drag mode
});

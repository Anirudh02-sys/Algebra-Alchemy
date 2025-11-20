// ======================= LESSON 1: ISOLATING X (DRAG) =======================

const isolatingEquations = [
    "2x - 3 = x + 4",
    "3x + 2 = x + 10",
    "5x - 4 = 2x + 8",
    "4x + 1 = x + 13",
    "6x - 5 = 3x + 7",
];

const isolatingProblems = isolatingEquations.map((eq) => {
    const isolated = isolateEquation(eq);
    const tokens = equationToTokens(isolated);
    return { original: eq, tokens, correct: tokens };
});

let isolatingCurrentIndex = 0;
let isolatingCorrectOrder = isolatingProblems[0].correct;
let isolatingSolved = Array(isolatingProblems.length).fill(false);
let isolatingScore = 0;

// ======================= LESSON 2: SOLVING FOR X (MCQ) =======================

const solvingProblems = [
    {
        original: "5x + 2 = 12",
        steps: [
            {
                question:
                    "After isolating the x-terms on one side, what is the equation?",
                options: [
                    "5x = 12 - 2",
                    "5x + 2 = 12 - 2",
                    "5x - 2 = 12",
                    "5x = 12 + 2",
                ],
                correctIndex: 0,
            },
            {
                question:
                    "What is the equation after simplifying the right-hand side?",
                options: ["5x = 14", "5x = 10", "5x = 2", "x = 10"],
                correctIndex: 1,
            },
            {
                question: "What is the next algebraic step to solve for x?",
                options: [
                    "5x/5 = 10/5",
                    "5x + 5 = 10 + 5",
                    "5x = 10/5",
                    "x = 10/5",
                ],
                correctIndex: 0,
            },
            {
                question: "What does x equal?",
                options: ["x = 10", "x = 1/2", "x = 2", "x = 5"],
                correctIndex: 2,
            },
        ],
    },
    {
        original: "3x - 4 = 11",
        steps: [
            {
                question:
                    "After isolating the x-terms on one side, what is the equation?",
                options: [
                    "3x = 11 + 4",
                    "3x = 11 - 4",
                    "3x - 4 = 11 - 4",
                    "x = 11 + 4",
                ],
                correctIndex: 0,
            },
            {
                question:
                    "What is the equation after simplifying the right-hand side?",
                options: ["3x = 7", "3x = 15", "3x = -15", "x = 15"],
                correctIndex: 1,
            },
            {
                question: "What is the next algebraic step to solve for x?",
                options: [
                    "3x/3 = 15/3",
                    "3x + 3 = 15 + 3",
                    "3x = 15/3",
                    "x = 15/3",
                ],
                correctIndex: 0,
            },
            {
                question: "What does x equal?",
                options: ["x = 3", "x = 4", "x = 5", "x = 15"],
                correctIndex: 2,
            },
        ],
    },
    {
        original: "4x + 6 = 22",
        steps: [
            {
                question:
                    "After isolating the x-terms on one side, what is the equation?",
                options: [
                    "4x = 22 - 6",
                    "4x + 6 = 22 - 6",
                    "4x - 6 = 22",
                    "4x = 22 + 6",
                ],
                correctIndex: 0,
            },
            {
                question:
                    "What is the equation after simplifying the right-hand side?",
                options: ["4x = 28", "4x = 16", "4x = 6", "x = 4"],
                correctIndex: 1,
            },
            {
                question: "What is the next algebraic step to solve for x?",
                options: [
                    "4x/4 = 16/4",
                    "4x + 4 = 16 + 4",
                    "4x = 16/4",
                    "x = 16/4",
                ],
                correctIndex: 0,
            },
            {
                question: "What does x equal?",
                options: ["x = 2", "x = 3", "x = 4", "x = 8"],
                correctIndex: 2,
            },
        ],
    },
    {
        original: "2x - 5 = 9",
        steps: [
            {
                question:
                    "After isolating the x-terms on one side, what is the equation?",
                options: [
                    "2x = 9 + 5",
                    "2x = 9 - 5",
                    "2x - 5 = 9 - 5",
                    "x = 9 + 5",
                ],
                correctIndex: 0,
            },
            {
                question:
                    "What is the equation after simplifying the right-hand side?",
                options: ["2x = 4", "2x = 14", "2x = -14", "x = 14"],
                correctIndex: 1,
            },
            {
                question: "What is the next algebraic step to solve for x?",
                options: [
                    "2x/2 = 14/2",
                    "2x + 2 = 14 + 2",
                    "2x = 14/2",
                    "x = 14/2",
                ],
                correctIndex: 0,
            },
            {
                question: "What does x equal?",
                options: ["x = 9", "x = 5", "x = 7", "x = 2"],
                correctIndex: 2,
            },
        ],
    },
    {
        original: "7x + 1 = 29",
        steps: [
            {
                question:
                    "After isolating the x-terms on one side, what is the equation?",
                options: [
                    "7x = 29 - 1",
                    "7x + 1 = 29 - 1",
                    "7x - 1 = 29",
                    "7x = 29 + 1",
                ],
                correctIndex: 0,
            },
            {
                question:
                    "What is the equation after simplifying the right-hand side?",
                options: ["7x = 30", "7x = 28", "7x = 26", "x = 4"],
                correctIndex: 1,
            },
            {
                question: "What is the next algebraic step to solve for x?",
                options: [
                    "7x/7 = 28/7",
                    "7x + 7 = 28 + 7",
                    "7x = 28/7",
                    "x = 28/7",
                ],
                correctIndex: 0,
            },
            {
                question: "What does x equal?",
                options: ["x = 3", "x = 4", "x = 7", "x = 28"],
                correctIndex: 1,
            },
        ],
    },
];

let solvingCurrentProblemIndex = 0;
let solvingCurrentStepIndex = 0;
let solvingSolved = Array(solvingProblems.length).fill(false);
let solvingScore = 0;

// ======================= LESSON 3 + TESTS: TEXT-INPUT EXPRESSIONS =======================

// Mini-lesson
const expressionProblems = [
    {
        prompt: "Five plus two times x equals fifteen.",
        answer: "5 + 2x = 15",
    },
    {
        prompt: "Three times a number minus four equals eleven.",
        answer: "3x - 4 = 11",
    },
    {
        prompt: "Seven more than four times x is twenty-three.",
        answer: "4x + 7 = 23",
    },
    {
        prompt: "Nine less than five times x equals sixteen.",
        answer: "5x - 9 = 16",
    },
    {
        prompt: "Twice a number plus six equals twenty.",
        answer: "2x + 6 = 20",
    },
];

// Practice Test 1 – 10 mixed skills (isolate, solve, word → expression)
const practice1Problems = [
    {
        prompt: "Isolate the x-terms: 2x - 3 = x + 5",
        answer: "2x - x = 5 + 3",
    },
    {
        prompt: "Solve for x: 3x + 4 = 13",
        answer: "x = 3",
    },
    {
        prompt: "Five more than twice x equals seventeen.",
        answer: "2x + 5 = 17",
    },
    {
        prompt: "Solve for x: 4x - 2 = 14",
        answer: "x = 4",
    },
    {
        prompt: "Isolate the x-terms: 5x + 6 = 2x + 15",
        answer: "5x - 2x = 15 - 6",
    },
    {
        prompt: "The sum of x and eight is thirteen.",
        answer: "x + 8 = 13",
    },
    {
        prompt: "Solve for x: 2x - 5 = 9",
        answer: "x = 7",
    },
    {
        prompt: "Isolate the x-terms: 3x + 1 = x + 9",
        answer: "3x - x = 9 - 1",
    },
    {
        prompt: "Four more than three times a number is nineteen.",
        answer: "3x + 4 = 19",
    },
    {
        prompt: "Solve for x: 6x = 24",
        answer: "x = 4",
    },
];

// Practice Test 2 – 10 harder mixed problems
const practice2Problems = [
    {
        prompt: "Isolate the x-terms: 4x - 3 = 2x + 9",
        answer: "4x - 2x = 9 + 3",
    },
    {
        prompt: "Solve for x: 3(x - 2) = 15",
        answer: "x = 7",
    },
    {
        prompt: "Half of x plus three equals eleven.",
        answer: "x/2 + 3 = 11",
    },
    {
        prompt: "Solve for x: (x + 5) / 3 = 4",
        answer: "x = 7",
    },
    {
        prompt: "Isolate the x-terms: 5x + 2 = 3x + 10",
        answer: "5x - 3x = 10 - 2",
    },
    {
        prompt: "Solve for x: 2(x + 4) - 3 = 13",
        answer: "x = 4",
    },
    {
        prompt: "Three less than the sum of x and twelve equals twenty.",
        answer: "x + 12 - 3 = 20",
    },
    {
        prompt: "Solve for x: x/4 + 9 = 16",
        answer: "x = 28",
    },
    {
        prompt: "Isolate the x-terms: 7x + 1 = 3x + 17",
        answer: "7x - 3x = 17 - 1",
    },
    {
        prompt:
            "Seven more than twice the quantity x minus one equals twenty-one.",
        answer: "7 + 2(x - 1) = 21",
    },
];

const expressionSets = {
    expressions: {
        label: "Word Problems to Expressions",
        problems: expressionProblems,
        currentIndex: 0,
        solved: Array(expressionProblems.length).fill(false),
        score: 0,
    },
    practice1: {
        label: "Practice Level Up Test 1",
        problems: practice1Problems,
        currentIndex: 0,
        solved: Array(practice1Problems.length).fill(false),
        score: 0,
    },
    practice2: {
        label: "Practice Level Up Test 2",
        problems: practice2Problems,
        currentIndex: 0,
        solved: Array(practice2Problems.length).fill(false),
        score: 0,
    },
};

// ======================= GLOBAL STATE =======================

let currentMode = "isolating"; // "isolating" | "solving" | "expressions" | "practice1" | "practice2"
let draggedElement = null;

// ======================= REACTION IMAGE =======================

const reactionImagePaths = {
    ready: "/static/images/wizard_enter.png",
    thinking: "/static/images/wizard_doubt.png",
    progress: "/static/images/wizard_happy_progress.png",
    complete: "/static/images/wizard_on_completion.png",
};

let reactionImageEl = null;

function ensureReactionImage() {
    if (reactionImageEl && document.body.contains(reactionImageEl)) {
        return reactionImageEl;
    }

    const panel = document.querySelector(".reaction-panel");
    if (!panel) return null;

    const existing = panel.querySelector("#reaction-image");
    if (existing) {
        reactionImageEl = existing;
        return reactionImageEl;
    }

    const wrapper = document.createElement("div");
    wrapper.className = "reaction-icon";

    const img = document.createElement("img");
    img.id = "reaction-image";
    img.alt = "Wizard reaction";
    img.classList.add("hidden");

    const label = document.createElement("span");
    label.textContent = "Wizard";

    wrapper.appendChild(img);
    wrapper.appendChild(label);

    const icons = panel.querySelector(".reaction-icons");
    if (icons) {
        panel.insertBefore(wrapper, icons);
    } else {
        panel.appendChild(wrapper);
    }

    reactionImageEl = img;
    return reactionImageEl;
}

function setReactionState(state) {
    const img = ensureReactionImage();
    if (!img) return;

    const src = reactionImagePaths[state];
    if (!src) return;

    img.src = src;
    img.classList.remove("hidden");
}

function hideReactionImage() {
    const img = ensureReactionImage();
    if (!img) return;

    img.classList.add("hidden");
}

// ======================= GENERIC HELPERS =======================

function shuffle(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

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
    chunks.forEach((ch) => {
        if (ch.includes("x")) xTerms.push(ch);
        else constTerms.push(ch);
    });
    return { xTerms, constTerms };
}

function joinTerms(terms) {
    if (terms.length === 0) return "0";
    return terms
        .map((t, i) => {
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
        })
        .join("");
}

function isolateEquation(equation) {
    const [leftRaw, rightRaw] = equation.split("=");
    const left = parseSide(leftRaw);
    const right = parseSide(rightRaw);

    const xTerms = [...left.xTerms, ...right.xTerms.map(flipSign)];
    const constTerms = [...right.constTerms, ...left.constTerms.map(flipSign)];

    const leftStr = joinTerms(xTerms);
    const rightStr = joinTerms(constTerms);

    return `${leftStr} = ${rightStr}`;
}

function normalizeEquation(str) {
    return str.toLowerCase().replace(/\s+/g, "").replace(/−/g, "-");
}

// ======================= DYNAMIC PAGINATION =======================

function renderPagination(total, currentIndex) {
    const container = document.getElementById("pagination");
    if (!container) return;

    container.innerHTML = "";
    if (total <= 0) return;

    for (let i = 0; i < total; i++) {
        const btn = document.createElement("button");
        btn.className = "page" + (i === currentIndex ? " active" : " inactive");
        btn.dataset.index = i;
        btn.textContent = i + 1;

        btn.addEventListener("click", () => {
            if (currentMode === "isolating") {
                isolatingCurrentIndex = i;
                loadIsolatingProblem(i);
            } else if (currentMode === "solving") {
                solvingCurrentProblemIndex = i;
                solvingCurrentStepIndex = 0;
                loadSolvingProblem(i);
            } else if (
                currentMode === "expressions" ||
                currentMode === "practice1" ||
                currentMode === "practice2"
            ) {
                const set = currentExpressionSet();
                if (!set) return;
                if (i < set.problems.length) {
                    loadExpressionProblem(i);
                }
            }
        });

        container.appendChild(btn);
    }
}

function updatePagination(currentIndex) {
    let total = 0;
    if (currentMode === "isolating") {
        total = isolatingProblems.length;
    } else if (currentMode === "solving") {
        total = solvingProblems.length;
    } else if (
        currentMode === "expressions" ||
        currentMode === "practice1" ||
        currentMode === "practice2"
    ) {
        const set = currentExpressionSet();
        total = set ? set.problems.length : 0;
    }
    renderPagination(total, currentIndex);
}

// ======================= ISOLATING MODE (DRAG) =======================

function loadIsolatingProblem(index) {
    const problem = isolatingProblems[index];
    isolatingCorrectOrder = problem.correct;

    setReactionState("ready");

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
        index === isolatingProblems.length - 1 && isolatingSolved[index]
            ? "All problems done"
            : "Next problem →";

    const shuffledTokens = shuffle(problem.tokens);

    shuffledTokens.forEach((token) => {
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
    return draggableElements.reduce(
        (closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = x - box.left - box.width / 2;
            if (offset < 0 && offset > closest.offset) {
                return { offset: offset, element: child };
            } else {
                return closest;
            }
        },
        { offset: Number.NEGATIVE_INFINITY, element: null }
    ).element;
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

    const currentOrder = [...container.querySelectorAll(".chip")].map((chip) =>
        chip.textContent.trim()
    );

    if (currentOrder.length !== isolatingCorrectOrder.length) return;

    const isCorrect = currentOrder.every(
        (value, index) => value === isolatingCorrectOrder[index]
    );

    container.classList.remove("shake");

    if (isCorrect) {
        status.textContent = "Correct! 🎉";
        status.classList.add("correct");
        setReactionState(
            isolatingCurrentIndex === isolatingProblems.length - 1
                ? "complete"
                : "progress"
        );

        container.querySelectorAll(".chip").forEach((c) => {
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
        setReactionState("thinking");
    }
}

// ======================= SOLVING MODE (MCQ) =======================

function loadSolvingProblem(index) {
    solvingCurrentProblemIndex = index;
    solvingCurrentStepIndex = 0;
    setReactionState("ready");
    renderCurrentSolvingStep();
    updatePagination(index);
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
            : solvingCurrentProblemIndex < solvingProblems.length - 1
            ? "Next equation →"
            : "All done 🎉";

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

    optionButtons.forEach((btn) => {
        btn.classList.remove("mcq-correct", "mcq-incorrect");
    });

    if (selectedIndex === step.correctIndex) {
        feedback.textContent = "Correct! 🎉";
        feedback.classList.add("correct");
        optionButtons[selectedIndex].classList.add("mcq-correct");
        nextBtn.disabled = false;
        setReactionState("progress");
    } else {
        feedback.textContent = "Not quite. Try again.";
        feedback.classList.remove("correct");
        optionButtons[selectedIndex].classList.add("mcq-incorrect");
        nextBtn.disabled = true;
        setReactionState("thinking");
    }
}

function setupMcqNextButton() {
    const nextBtn = document.getElementById("mcq-next-step");
    if (!nextBtn) return;

    nextBtn.addEventListener("click", () => {
        const problem = solvingProblems[solvingCurrentProblemIndex];

        if (solvingCurrentStepIndex < problem.steps.length - 1) {
            solvingCurrentStepIndex++;
            renderCurrentSolvingStep();
        } else {
            if (!solvingSolved[solvingCurrentProblemIndex]) {
                solvingSolved[solvingCurrentProblemIndex] = true;
                solvingScore += 1;
                updateProgressUI();
            }

            if (solvingCurrentProblemIndex < solvingProblems.length - 1) {
                solvingCurrentProblemIndex++;
                solvingCurrentStepIndex = 0;
                loadSolvingProblem(solvingCurrentProblemIndex);
            } else {
                const feedback = document.getElementById("mcq-feedback");
                feedback.textContent =
                    "You finished all Solving for X problems! 🎉";
                feedback.classList.add("correct");
                nextBtn.disabled = true;
                setReactionState("complete");
            }
        }
    });
}

// ======================= EXPRESSIONS MODE (3 SETS) =======================

function currentExpressionSet() {
    if (
        currentMode === "expressions" ||
        currentMode === "practice1" ||
        currentMode === "practice2"
    ) {
        return expressionSets[currentMode];
    }
    return null;
}

function isExpressionSetComplete(set) {
    return set.problems.length > 0 && set.solved.every(Boolean);
}

function loadExpressionProblem(index) {
    const set = currentExpressionSet();
    if (!set) return;

    set.currentIndex = index;
    setReactionState("ready");
    const problem = set.problems[index];

    const promptEl = document.getElementById("expr-prompt");
    const inputEl = document.getElementById("expr-input");
    const feedback = document.getElementById("expr-feedback");
    const checkBtn = document.getElementById("expr-check");
    const nextBtn = document.getElementById("expr-next");

    promptEl.textContent = problem.prompt;
    inputEl.value = "";
    inputEl.focus();

    feedback.textContent = "";
    feedback.classList.remove("correct");
    checkBtn.disabled = false;
    nextBtn.style.display = set.solved[index] ? "inline-flex" : "none";

    updatePagination(index);
    updateProgressUI();
}

function setupExpressionButtons() {
    const checkBtn = document.getElementById("expr-check");
    const nextBtn = document.getElementById("expr-next");
    const inputEl = document.getElementById("expr-input");

    if (!checkBtn || !nextBtn || !inputEl) return;

    checkBtn.addEventListener("click", () => {
        const set = currentExpressionSet();
        if (!set) return;

        const problem = set.problems[set.currentIndex];
        const user = normalizeEquation(inputEl.value);
        const correct = normalizeEquation(problem.answer);

        const feedback = document.getElementById("expr-feedback");

        if (!user) {
            feedback.textContent = "Type your equation first.";
            feedback.classList.remove("correct");
            return;
        }

        if (user === correct) {
            feedback.textContent = "Correct! 🎉";
            feedback.classList.add("correct");
            checkBtn.disabled = true;
            nextBtn.style.display = "inline-flex";

            if (!set.solved[set.currentIndex]) {
                set.solved[set.currentIndex] = true;
                set.score += 1;
                updateProgressUI();
            }

            if (isExpressionSetComplete(set)) {
                setReactionState("complete");
            } else {
                setReactionState("progress");
            }
        } else {
            feedback.textContent = "Not quite. Check your signs and order.";
            feedback.classList.remove("correct");
            setReactionState("thinking");
        }
    });

    nextBtn.addEventListener("click", () => {
        const set = currentExpressionSet();
        if (!set) return;

        if (set.currentIndex < set.problems.length - 1) {
            loadExpressionProblem(set.currentIndex + 1);
        } else {
            const feedback = document.getElementById("expr-feedback");
            feedback.textContent = "You finished all problems! 🎉";
            feedback.classList.add("correct");
            nextBtn.style.display = "none";
        }
    });
}

// ======================= STARS + SHARED UI: PROGRESS, MODAL, NEXT BTN =======================

function updateStars(done, total, isPractice) {
    const starContainer = document.getElementById("stars");
    if (!starContainer) return;

    if (!total || total <= 0) {
        total = 1;
    }

    const totalStars = isPractice ? 10 : 5;
    const existingStars = starContainer.querySelectorAll(".star-indicator");

    if (existingStars.length !== totalStars) {
        starContainer.innerHTML = "";
        for (let i = 0; i < totalStars; i++) {
            const span = document.createElement("span");
            span.className = "star-indicator";
            span.textContent = "★";
            starContainer.appendChild(span);
        }
    }

    const stars = starContainer.querySelectorAll(".star-indicator");
    const filledStars = Math.round((done / total) * totalStars);

    stars.forEach((star, index) => {
        star.classList.toggle("filled", index < filledStars);
    });
}

function updateProgressUI() {
    const summary = document.getElementById("progress-summary");

    const isolatingElem = document.getElementById("isolating-progress");
    const solvingElem = document.getElementById("solving-progress");
    const exprElem = document.getElementById("expressions-progress");
    const practice1Elem = document.getElementById("practice1-progress");
    const practice2Elem = document.getElementById("practice2-progress");

    // Per-lesson percentages in the left card
    if (isolatingElem) {
        const p = Math.round(
            (isolatingScore / isolatingProblems.length) * 100
        );
        isolatingElem.textContent = `${p}%`;
    }
    if (solvingElem) {
        const p = Math.round((solvingScore / solvingProblems.length) * 100);
        solvingElem.textContent = `${p}%`;
    }
    if (exprElem) {
        const set = expressionSets.expressions;
        const p = Math.round((set.score / set.problems.length) * 100);
        exprElem.textContent = `${p}%`;
    }
    if (practice1Elem) {
        const set = expressionSets.practice1;
        const p = Math.round((set.score / set.problems.length) * 100);
        practice1Elem.textContent = `${p}%`;
    }
    if (practice2Elem) {
        const set = expressionSets.practice2;
        const p = Math.round((set.score / set.problems.length) * 100);
        practice2Elem.textContent = `${p}%`;
    }

    // Active mode stats
    let label, done, total;

    if (currentMode === "isolating") {
        label = "Isolating X-Terms";
        done = isolatingScore;
        total = isolatingProblems.length;
    } else if (currentMode === "solving") {
        label = "Solving for X";
        done = solvingScore;
        total = solvingProblems.length;
    } else if (currentMode === "expressions") {
        const set = expressionSets.expressions;
        label = set.label;
        done = set.score;
        total = set.problems.length;
    } else if (currentMode === "practice1") {
        const set = expressionSets.practice1;
        label = set.label;
        done = set.score;
        total = set.problems.length;
    } else {
        const set = expressionSets.practice2;
        label = set.label;
        done = set.score;
        total = set.problems.length;
    }

    if (!total || total <= 0) {
        total = 1;
    }

    const xp = done * 10;
    if (summary) {
        summary.textContent = `${label}: ${done}/${total} · XP: ${xp}`;
    }

    const isPractice =
        currentMode === "practice1" || currentMode === "practice2";
    updateStars(done, total, isPractice);
}

function setupNextButton() {
    const nextBtn = document.getElementById("next-problem");
    if (!nextBtn) return;

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

// ======================= LESSON MODE SWITCHING =======================

function activateIsolatingLesson() {
    currentMode = "isolating";
    const dragMode = document.getElementById("drag-mode");
    const mcqMode = document.getElementById("mcq-mode");
    const exprMode = document.getElementById("expression-mode");
    const label = document.getElementById("workspace-label");

    dragMode.classList.remove("hidden");
    mcqMode.classList.add("hidden");
    exprMode.classList.add("hidden");
    label.textContent = "DRAG TO ISOLATE X";

    loadIsolatingProblem(isolatingCurrentIndex);
}

function activateSolvingLesson() {
    currentMode = "solving";
    const dragMode = document.getElementById("drag-mode");
    const mcqMode = document.getElementById("mcq-mode");
    const exprMode = document.getElementById("expression-mode");
    const label = document.getElementById("workspace-label");

    dragMode.classList.add("hidden");
    mcqMode.classList.remove("hidden");
    exprMode.classList.add("hidden");
    label.textContent = "SOLVING FOR X";

    loadSolvingProblem(solvingCurrentProblemIndex);
}

function activateExpressionLesson() {
    currentMode = "expressions";
    const dragMode = document.getElementById("drag-mode");
    const mcqMode = document.getElementById("mcq-mode");
    const exprMode = document.getElementById("expression-mode");
    const label = document.getElementById("workspace-label");

    dragMode.classList.add("hidden");
    mcqMode.classList.add("hidden");
    exprMode.classList.remove("hidden");
    label.textContent = "WORD PROBLEMS TO EXPRESSIONS";

    const set = expressionSets.expressions;
    loadExpressionProblem(set.currentIndex);
}

function activatePractice1Lesson() {
    currentMode = "practice1";
    const dragMode = document.getElementById("drag-mode");
    const mcqMode = document.getElementById("mcq-mode");
    const exprMode = document.getElementById("expression-mode");
    const label = document.getElementById("workspace-label");

    dragMode.classList.add("hidden");
    mcqMode.classList.add("hidden");
    exprMode.classList.remove("hidden");
    label.textContent = "PRACTICE TEST 1";

    const set = expressionSets.practice1;
    loadExpressionProblem(set.currentIndex);
}

function activatePractice2Lesson() {
    currentMode = "practice2";
    const dragMode = document.getElementById("drag-mode");
    const mcqMode = document.getElementById("mcq-mode");
    const exprMode = document.getElementById("expression-mode");
    const label = document.getElementById("workspace-label");

    dragMode.classList.add("hidden");
    mcqMode.classList.add("hidden");
    exprMode.classList.remove("hidden");
    label.textContent = "PRACTICE TEST 2";

    const set = expressionSets.practice2;
    loadExpressionProblem(set.currentIndex);
}

function setupLessonClicks() {
    const workspace = document.querySelector(".workspace-wrapper");

    const isolatingItem = document.getElementById("lesson-isolating");
    const solvingItem = document.getElementById("lesson-solving");
    const exprItem = document.getElementById("lesson-expressions");
    const practice1Item = document.getElementById("lesson-practice1");
    const practice2Item = document.getElementById("lesson-practice2");

    function activateItem(item) {
        [
            isolatingItem,
            solvingItem,
            exprItem,
            practice1Item,
            practice2Item,
        ].forEach((el) => el && el.classList.remove("active-lesson"));
        if (item) item.classList.add("active-lesson");
    }

    if (isolatingItem) {
        isolatingItem.addEventListener("click", () => {
            workspace.scrollIntoView({ behavior: "smooth", block: "center" });
            activateItem(isolatingItem);
            activateIsolatingLesson();
        });
    }

    if (solvingItem) {
        solvingItem.addEventListener("click", () => {
            workspace.scrollIntoView({ behavior: "smooth", block: "center" });
            activateItem(solvingItem);
            activateSolvingLesson();
        });
    }

    if (exprItem) {
        exprItem.addEventListener("click", () => {
            workspace.scrollIntoView({ behavior: "smooth", block: "center" });
            activateItem(exprItem);
            activateExpressionLesson();
        });
    }

    if (practice1Item) {
        practice1Item.addEventListener("click", () => {
            workspace.scrollIntoView({ behavior: "smooth", block: "center" });
            activateItem(practice1Item);
            activatePractice1Lesson();
        });
    }

    if (practice2Item) {
        practice2Item.addEventListener("click", () => {
            workspace.scrollIntoView({ behavior: "smooth", block: "center" });
            activateItem(practice2Item);
            activatePractice2Lesson();
        });
    }
}

// ======================= INIT =======================

document.addEventListener("DOMContentLoaded", () => {
    setupContainerDnD();
    setupNextButton();
    setupCompletionModal();
    setupLessonClicks();
    setupMcqNextButton();
    setupExpressionButtons();
    setupProgressPopup();
    activateIsolatingLesson(); // start in drag mode
});

function setupProgressPopup() {
    const trigger = document.getElementById("sidebar-progress");
    const overlay = document.getElementById("progress-overlay");

    if (!trigger || !overlay) return;

    const hide = () => {
        overlay.classList.add("hidden");
        overlay.classList.remove("active");
    };

    const show = () => {
        overlay.classList.remove("hidden");
        overlay.classList.add("active");
    };

    trigger.addEventListener("click", (e) => {
        e.preventDefault();
        if (overlay.classList.contains("active")) {
            hide();
        } else {
            show();
        }
    });

    overlay.addEventListener("click", (e) => {
        if (e.target === overlay || e.target.classList.contains("progress-backdrop")) {
            hide();
        }
    });

    // start hidden
    hide();
}

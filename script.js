// OOP: Base Question class
class Question {
    constructor(text, options, correctAnswer) {
        this.text = text;
        this.options = options;
        this.correctAnswer = correctAnswer;
    }

    checkAnswer(selectedAnswer) {
        return selectedAnswer === this.correctAnswer;
    }
}

// OOP: Inherited MCQ class
class MultipleChoiceQuestion extends Question {
    constructor(text, options, correctAnswer) {
        super(text, options, correctAnswer);
    }
}

// Quiz Generator class using OOP and DSA
class QuizGenerator {
    constructor() {
        this.questions = [];
        this.currentQuestionIndex = 0;
        this.score = 0;
        this.timer = null;
        this.timeLeft = 0;
    }

    async generateQuiz(language, difficulty, numQuestions) {
        const apiKey = "AIzaSyCvRIi7ryAQZPMO9xmjbuGJRM7q0KA4RGA";
        const model = "gemini-1.5-flash";
        const prompt = `Generate ${numQuestions} ${difficulty} multiple-choice questions for ${language}. Each question should have 4 options and indicate the correct answer. Return in JSON format like: [{"question": "text", "options": ["opt1", "opt2", "opt3", "opt4"], "correctAnswer": "opt1"}]`;

        const loadingDiv = document.getElementById("loading");
        loadingDiv.style.display = "block";

        try {
            console.log("Sending API request...");
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }]
                })
            });

            const data = await response.json();
            console.log("API response:", data);

            if (!data.candidates || !data.candidates[0] || !data.candidates[0].content || !data.candidates[0].content.parts[0].text) {
                throw new Error("Unexpected API response structure");
            }

            let generatedQuestions;
            try {
                let rawText = data.candidates[0].content.parts[0].text;
                // Remove Markdown code block markers and extra whitespace
                rawText = rawText.replace(/```json\n|\n```|```/g, "").trim();
                // Remove any leading/trailing newlines or unexpected characters
                rawText = rawText.replace(/^\s+|\s+$/g, "");
                console.log("Cleaned response text:", rawText);
                generatedQuestions = JSON.parse(rawText);
            } catch (parseError) {
                console.error("Error parsing API response:", parseError);
                throw new Error("Invalid JSON format in API response");
            }

            if (!Array.isArray(generatedQuestions) || generatedQuestions.length === 0) {
                throw new Error("No questions returned from API");
            }

            // DSA: Validate and map questions
            this.questions = generatedQuestions.map((q, index) => {
                if (!q.question || !Array.isArray(q.options) || q.options.length !== 4 || !q.correctAnswer) {
                    throw new Error(`Invalid question format at index ${index}`);
                }
                return new MultipleChoiceQuestion(q.question, q.options, q.correctAnswer);
            });
            this.timeLeft = numQuestions * 60; // 1 minute per question
        } catch (error) {
            console.error("Error generating quiz:", error.message);
            // Fallback to sample questions
            this.questions = this.getSampleQuestions(language, numQuestions);
            this.timeLeft = numQuestions * 60;
            alert(`Failed to fetch questions from API: ${error.message}. Using sample questions instead.`);
        } finally {
            loadingDiv.style.display = "none";
        }
    }

    // Fallback method for sample questions
    getSampleQuestions(language, numQuestions) {
        const sample = [
            {
                question: `What is the primary purpose of a class in ${language}?`,
                options: ["To store data", "To define objects", "To execute loops", "To manage memory"],
                correctAnswer: "To define objects"
            },
            {
                question: `How is inheritance implemented in ${language}?`,
                options: ["Using extends", "Using implements", "Using import", "Using include"],
                correctAnswer: "Using extends"
            },
            {
                question: `What is a common data structure used in ${language}?`,
                options: ["Array", "Loop", "Function", "Class"],
                correctAnswer: "Array"
            },
            {
                question: `What is the syntax for a function in ${language}?`,
                options: ["func()", "function()", "def()", "method()"],
                correctAnswer: language === "Python" ? "def()" : "function()"
            }
        ];
        // DSA: Adjust sample questions to match numQuestions
        const result = [];
        for (let i = 0; i < numQuestions; i++) {
            result.push(sample[i % sample.length]);
        }
        return result.map(q => new MultipleChoiceQuestion(q.question, q.options, q.correctAnswer));
    }

    displayQuiz() {
        const quizSection = document.getElementById("quiz-section");
        const questionsDiv = document.getElementById("questions");
        const submitButton = document.getElementById("submit-quiz");
        const quizCategory = document.getElementById("quiz-category");
        const totalQuestions = document.getElementById("total-questions");
        
        // Add the quiz-active class to transform layout
        document.getElementById("quiz-container").classList.add("quiz-active");
        
        // Update UI elements
        quizCategory.textContent = document.getElementById("language").value;
        totalQuestions.textContent = this.questions.length;
        
        quizSection.style.display = "block";
        questionsDiv.innerHTML = "";
        
        // Display first question
        this.displayQuestion(0);
        
        submitButton.style.display = "block";
        this.startTimer();
    }
    
    displayQuestion(index) {
        if (index < 0 || index >= this.questions.length) return;
        
        const questionsDiv = document.getElementById("questions");
        const questionNumber = document.getElementById("question-number");
        const currentQuestion = document.getElementById("current-question");
        const progressBar = document.getElementById("progress-bar");
        
        // Update question number and progress
        questionNumber.textContent = index + 1;
        currentQuestion.textContent = this.questions[index].text;
        progressBar.style.width = `${((index + 1) / this.questions.length) * 100}%`;
        
        // Clear previous options
        questionsDiv.innerHTML = "";
        
        // Create option markers (A, B, C, D)
        const markers = ['A', 'B', 'C', 'D'];
        
        // Create options
        this.questions[index].options.forEach((option, optIndex) => {
            const optionDiv = document.createElement("div");
            optionDiv.className = "option";
            
            const input = document.createElement("input");
            input.type = "radio";
            input.name = `q${index}`;
            input.id = `q${index}o${optIndex}`;
            input.value = option;
            
            const optionContent = document.createElement("div");
            optionContent.className = "option-content";
            
            const marker = document.createElement("div");
            marker.className = "option-marker";
            marker.textContent = markers[optIndex];
            
            const optionText = document.createElement("div");
            optionText.className = "option-text";
            optionText.textContent = option;
            
            optionContent.appendChild(marker);
            optionContent.appendChild(optionText);
            
            // Add click event to handle option selection
            optionDiv.addEventListener("click", () => {
                input.checked = true;
                // Remove 'selected' class from all siblings
                questionsDiv.querySelectorAll(".option").forEach(opt => {
                    opt.classList.remove("selected");
                });
                // Add 'selected' class to this option
                optionDiv.classList.add("selected");
            });
            
            optionDiv.appendChild(input);
            optionDiv.appendChild(optionContent);
            questionsDiv.appendChild(optionDiv);
        });
        
        // Update current question index
        this.currentQuestionIndex = index;
    }

    startTimer() {
        const timeDisplay = document.getElementById("time-display");
        this.timer = setInterval(() => {
            if (this.timeLeft <= 0) {
                clearInterval(this.timer);
                this.submitQuiz();
                return;
            }
            const minutes = Math.floor(this.timeLeft / 60);
            const seconds = this.timeLeft % 60;
            timeDisplay.textContent = `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
            this.timeLeft--;
        }, 1000);
    }

    submitQuiz() {
        clearInterval(this.timer);
        this.score = 0;

        // Check answers for all questions
        this.questions.forEach((question, index) => {
            const selectedOption = document.querySelector(`input[name="q${index}"]:checked`);
            if (selectedOption && question.checkAnswer(selectedOption.value)) {
                this.score++;
            }
        });

        this.showResult();
    }

    showResult() {
        const quizSection = document.getElementById("quiz-section");
        const resultSection = document.getElementById("result-section");
        const scoreDisplay = document.getElementById("score");
        const resultMessage = resultSection.querySelector(".result-message");
        const scoreHighlight = resultSection.querySelector(".score-highlight");

        quizSection.style.display = "none";
        resultSection.style.display = "block";
        
        const percentage = (this.score / this.questions.length) * 100;
        scoreHighlight.textContent = `${this.score}/${this.questions.length}`;
        
        let message;
        if (percentage === 100) {
            message = "Perfect score! Excellent work!";
        } else if (percentage >= 80) {
            message = "Great job! You've mastered this topic!";
        } else if (percentage >= 60) {
            message = "Good effort! Keep practicing!";
        } else {
            message = "Keep studying and try again!";
        }
        
        resultMessage.textContent = message;
    }

    reset() {
        this.questions = [];
        this.score = 0;
        this.timeLeft = 0;
        this.currentQuestionIndex = 0;
        clearInterval(this.timer);
        document.getElementById("quiz-section").style.display = "none";
        document.getElementById("result-section").style.display = "none";
        document.getElementById("quiz-form").reset();
        
        // Remove the quiz-active class to return to initial layout
        document.getElementById("quiz-container").classList.remove("quiz-active");
    }
    
    // Navigation methods
    nextQuestion() {
        if (this.currentQuestionIndex < this.questions.length - 1) {
            this.displayQuestion(this.currentQuestionIndex + 1);
        }
    }
    
    prevQuestion() {
        if (this.currentQuestionIndex > 0) {
            this.displayQuestion(this.currentQuestionIndex - 1);
        }
    }
}

// Initialize Quiz Generator
const quizGenerator = new QuizGenerator();

// Event Listeners
document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("quiz-form").addEventListener("submit", async (e) => {
        e.preventDefault();
        const language = document.getElementById("language").value;
        const difficulty = document.getElementById("difficulty").value;
        const numQuestions = parseInt(document.getElementById("num-questions").value);

        await quizGenerator.generateQuiz(language, difficulty, numQuestions);
        quizGenerator.displayQuiz();
    });

    document.getElementById("submit-quiz").addEventListener("click", () => {
        const currentQuestion = quizGenerator.currentQuestionIndex;
        const totalQuestions = quizGenerator.questions.length;
        
        // If we're on the last question, submit the quiz
        if (currentQuestion === totalQuestions - 1) {
            quizGenerator.submitQuiz();
        } else {
            // Otherwise go to next question
            quizGenerator.nextQuestion();
            
            // Update button text on last question
            if (quizGenerator.currentQuestionIndex === totalQuestions - 1) {
                document.getElementById("submit-quiz").textContent = "Submit Quiz";
            }
        }
    });

    document.getElementById("restart-quiz").addEventListener("click", () => {
        quizGenerator.reset();
    });
});
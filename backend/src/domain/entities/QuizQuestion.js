const VALID_OPTIONS = ['a', 'b', 'c', 'd'];

/**
 * QuizQuestion Entity (Domain Layer)
 * A single multiple-choice question. Knows how to grade itself against a
 * selected option — this is a small but real example of Polymorphism-ready
 * design: a future EssayQuestion/ShortAnswerQuestion could implement the
 * same `isAnsweredCorrectly()` contract differently.
 */
class QuizQuestion {
    constructor({ id, quiz_id, question_text, option_a, option_b, option_c, option_d, correct_option, marks }) {
        this.id = id;
        this.quiz_id = quiz_id;
        this.question_text = question_text;
        this.option_a = option_a;
        this.option_b = option_b;
        this.option_c = option_c;
        this.option_d = option_d;
        this.correct_option = correct_option;
        this.marks = marks ?? 1;

        this.validate();
    }

    validate() {
        if (!this.quiz_id) throw new Error('quiz_id is required');
        if (!this.question_text || this.question_text.trim().length < 3) {
            throw new Error('question_text must be at least 3 characters long');
        }
        for (const opt of ['option_a', 'option_b', 'option_c', 'option_d']) {
            if (!this[opt] || this[opt].trim().length === 0) {
                throw new Error(`${opt} cannot be empty`);
            }
        }
        if (!VALID_OPTIONS.includes(this.correct_option)) {
            throw new Error(`correct_option must be one of: ${VALID_OPTIONS.join(', ')}`);
        }
        if (this.marks <= 0) throw new Error('marks must be greater than 0');
    }

    isAnsweredCorrectly(selectedOption) {
        return selectedOption === this.correct_option;
    }

    // Never sends the correct answer to a student taking the quiz
    toStudentView() {
        const { id, quiz_id, question_text, option_a, option_b, option_c, option_d, marks } = this;
        return { id, quiz_id, question_text, option_a, option_b, option_c, option_d, marks };
    }
}

module.exports = QuizQuestion;

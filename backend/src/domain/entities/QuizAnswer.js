const VALID_OPTIONS = ['a', 'b', 'c', 'd'];

class QuizAnswer {
    constructor({ id, attempt_id, question_id, selected_option, is_correct }) {
        this.id = id;
        this.attempt_id = attempt_id;
        this.question_id = question_id;
        this.selected_option = selected_option;
        this.is_correct = Boolean(is_correct);

        this.validate();
    }

    validate() {
        if (!this.attempt_id) throw new Error('attempt_id is required');
        if (!this.question_id) throw new Error('question_id is required');
        if (!VALID_OPTIONS.includes(this.selected_option)) {
            throw new Error(`selected_option must be one of: ${VALID_OPTIONS.join(', ')}`);
        }
    }
}

module.exports = QuizAnswer;

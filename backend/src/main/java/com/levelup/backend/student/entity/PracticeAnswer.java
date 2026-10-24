package com.levelup.backend.student.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

@Entity
@Table(
        name = "practice_answers",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_practice_answer_session_question",
                        columnNames = {"session_id", "question_index"}
                )
        }
)
public class PracticeAnswer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "session_id", nullable = false)
    private PracticeSession session;

    @Column(name = "question_index", nullable = false)
    private int questionIndex;

    @Column(nullable = false, length = 500)
    private String submittedAnswer;

    @Column(nullable = false)
    private boolean correct;

    @Column(length = 500)
    private String correction;

    @Column(length = 1000)
    private String explanation;

    protected PracticeAnswer() {
    }

    public PracticeAnswer(
            PracticeSession session,
            int questionIndex,
            String submittedAnswer,
            boolean correct,
            String correction,
            String explanation
    ) {
        this.session = session;
        this.questionIndex = questionIndex;
        this.submittedAnswer = submittedAnswer;
        this.correct = correct;
        this.correction = correction;
        this.explanation = explanation;
    }

    public Long getId() {
        return id;
    }

    public PracticeSession getSession() {
        return session;
    }

    public int getQuestionIndex() {
        return questionIndex;
    }

    public String getSubmittedAnswer() {
        return submittedAnswer;
    }

    public boolean isCorrect() {
        return correct;
    }

    public String getCorrection() {
        return correction;
    }

    public String getExplanation() {
        return explanation;
    }
}

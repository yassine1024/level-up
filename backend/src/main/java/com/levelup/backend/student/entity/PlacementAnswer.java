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

@Entity
@Table(name = "placement_answers")
public class PlacementAnswer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "attempt_id", nullable = false)
    private PlacementAttempt attempt;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "question_id", nullable = false)
    private PlacementQuestion question;

    @Column(nullable = false, length = 1)
    private String selectedOption;

    @Column(nullable = false)
    private boolean correct;

    protected PlacementAnswer() {
    }

    public PlacementAnswer(
            PlacementAttempt attempt,
            PlacementQuestion question,
            String selectedOption,
            boolean correct
    ) {
        this.attempt = attempt;
        this.question = question;
        this.selectedOption = selectedOption;
        this.correct = correct;
    }

    public Long getId() {
        return id;
    }

    public PlacementAttempt getAttempt() {
        return attempt;
    }

    public PlacementQuestion getQuestion() {
        return question;
    }

    public String getSelectedOption() {
        return selectedOption;
    }

    public boolean isCorrect() {
        return correct;
    }
}

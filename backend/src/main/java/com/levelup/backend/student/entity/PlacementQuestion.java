package com.levelup.backend.student.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "placement_questions")
public class PlacementQuestion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 500)
    private String prompt;

    @Column(nullable = false, length = 255)
    private String optionA;

    @Column(nullable = false, length = 255)
    private String optionB;

    @Column(nullable = false, length = 255)
    private String optionC;

    @Column(nullable = false, length = 255)
    private String optionD;

    @Column(nullable = false, length = 1)
    private String correctOption;

    @Column(nullable = false, length = 1000)
    private String explanation;

    @Column(nullable = false)
    private int sortOrder;

    protected PlacementQuestion() {
    }

    public PlacementQuestion(
            String prompt,
            String optionA,
            String optionB,
            String optionC,
            String optionD,
            String correctOption,
            String explanation,
            int sortOrder
    ) {
        this.prompt = prompt;
        this.optionA = optionA;
        this.optionB = optionB;
        this.optionC = optionC;
        this.optionD = optionD;
        this.correctOption = correctOption;
        this.explanation = explanation;
        this.sortOrder = sortOrder;
    }

    public Long getId() {
        return id;
    }

    public String getPrompt() {
        return prompt;
    }

    public String getOptionA() {
        return optionA;
    }

    public String getOptionB() {
        return optionB;
    }

    public String getOptionC() {
        return optionC;
    }

    public String getOptionD() {
        return optionD;
    }

    public String getCorrectOption() {
        return correctOption;
    }

    public String getExplanation() {
        return explanation;
    }

    public int getSortOrder() {
        return sortOrder;
    }
}

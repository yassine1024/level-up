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

    @Column(nullable = false, length = 2)
    private String level;

    @Column(nullable = false, length = 50)
    private String skill;

    @Column(nullable = false, length = 150)
    private String focus;

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
            String level,
            String skill,
            String focus,
            String optionA,
            String optionB,
            String optionC,
            String optionD,
            String correctOption,
            String explanation,
            int sortOrder
    ) {
        this.prompt = prompt;
        this.level = level;
        this.skill = skill;
        this.focus = focus;
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

    public String getLevel() {
        return level;
    }

    public String getSkill() {
        return skill;
    }

    public String getFocus() {
        return focus;
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

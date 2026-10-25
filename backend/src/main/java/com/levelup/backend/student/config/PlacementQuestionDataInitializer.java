package com.levelup.backend.student.config;

import com.levelup.backend.student.entity.PlacementQuestion;
import com.levelup.backend.student.repository.PlacementQuestionRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.transaction.annotation.Transactional;

@Configuration
public class PlacementQuestionDataInitializer {

    @Bean
    CommandLineRunner seedPlacementQuestions(PlacementQuestionRepository repository) {
        return args -> initialize(repository);
    }

    @Transactional
    void initialize(PlacementQuestionRepository repository) {
        if (repository.count() > 0) {
            return;
        }

        repository.save(new PlacementQuestion("What is the correct greeting in English?", "Hello", "Goodbye", "Thanks", "Sorry", "A", "Hello is a common greeting.", 1));
        repository.save(new PlacementQuestion("Choose the correct pronoun: ___ am a student.", "I", "You", "He", "They", "A", "Use I with am.", 2));
        repository.save(new PlacementQuestion("What is the plural of 'child'?", "Childs", "Children", "Childrens", "Child", "B", "The plural of child is children.", 3));
        repository.save(new PlacementQuestion("Which word means 'happy'?", "Glad", "Sad", "Angry", "Tired", "A", "Glad means happy.", 4));
        repository.save(new PlacementQuestion("Complete: I ___ from Morocco.", "am", "is", "are", "was", "A", "Use am with I.", 5));
        repository.save(new PlacementQuestion("What time is it? It is 3:00.", "Three o'clock", "Four o'clock", "Five o'clock", "Six o'clock", "A", "3:00 is three o'clock.", 6));
        repository.save(new PlacementQuestion("Choose the correct article: ___ apple.", "A", "An", "The", "None", "B", "Use an before a vowel sound.", 7));
        repository.save(new PlacementQuestion("Which sentence is correct?", "She go to school", "She goes to school", "She going school", "She gone school", "B", "Third person singular takes goes.", 8));
        repository.save(new PlacementQuestion("What is the opposite of 'big'?", "Small", "Large", "Huge", "Tall", "A", "Small is the opposite of big.", 9));
        repository.save(new PlacementQuestion("Complete: They ___ playing football.", "is", "are", "was", "were", "B", "They takes are.", 10));
        repository.save(new PlacementQuestion("Which is a color?", "Book", "Red", "Run", "Happy", "B", "Red is a color.", 11));
        repository.save(new PlacementQuestion("Choose the correct question word: ___ is your name?", "What", "Where", "When", "Who", "A", "Use what for names.", 12));
        repository.save(new PlacementQuestion("What is the past tense of 'go'?", "Goed", "Went", "Gone", "Going", "B", "The past tense of go is went.", 13));
        repository.save(new PlacementQuestion("Complete: I have two ___.", "Book", "Books", "Bookes", "Boox", "B", "Plural of book is books.", 14));
        repository.save(new PlacementQuestion("Which sentence is a question?", "You are happy.", "Are you happy?", "You happy.", "Happy you are.", "B", "A question uses inverted word order.", 15));
    }
}

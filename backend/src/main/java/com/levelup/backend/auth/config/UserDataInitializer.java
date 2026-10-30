package com.levelup.backend.auth.config;

import com.levelup.backend.auth.entity.User;
import com.levelup.backend.auth.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;

@Configuration
public class UserDataInitializer {

    @Bean
    CommandLineRunner seedUsers(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder
    ) {
        return args -> initialize(userRepository, passwordEncoder);
    }

    @Transactional
    void initialize(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        seedUser(userRepository, passwordEncoder, "teacher", "teacher", User.Role.TEACHER);
        seedUser(userRepository, passwordEncoder, "student", "student", User.Role.STUDENT);
    }

    private void seedUser(
            UserRepository repository,
            PasswordEncoder encoder,
            String username,
            String password,
            User.Role role
    ) {
        if (repository.findByUsername(username).isPresent()) {
            return;
        }

        User user = new User();
        user.setUsername(username);
        user.setPasswordHash(encoder.encode(password));
        user.setRole(role);
        repository.save(user);
    }
}

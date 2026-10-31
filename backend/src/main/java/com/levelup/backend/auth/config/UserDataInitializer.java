package com.levelup.backend.auth.config;

import com.levelup.backend.auth.entity.User;
import com.levelup.backend.auth.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.Instant;

@Configuration
public class UserDataInitializer {

    @Bean
    CommandLineRunner seedDefaultUsers(UserRepository userRepository,
                                      PasswordEncoder passwordEncoder,
                                      @Value("${app.seed.default-users:true}") boolean enabled) {
        return args -> {
            if (!enabled) return;

            seed(userRepository, passwordEncoder, "teacher", "teacher", User.Role.TEACHER);
            seed(userRepository, passwordEncoder, "student", "student", User.Role.STUDENT);
            seed(userRepository, passwordEncoder, "admin", "admin", User.Role.ADMIN);
        };
    }

    private void seed(UserRepository userRepository, PasswordEncoder passwordEncoder,
                      String username, String password, User.Role role) {
        if (userRepository.findByUsername(username).isPresent()) return;
        User user = new User();
        user.setUsername(username);
        user.setPasswordHash(passwordEncoder.encode(password));
        user.setRole(role);
        user.setCreatedAt(Instant.now());
        userRepository.save(user);
    }
}
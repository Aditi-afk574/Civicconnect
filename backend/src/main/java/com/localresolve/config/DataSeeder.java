package com.localresolve.config;

import com.localresolve.model.User;
import com.localresolve.model.enums.Role;
import com.localresolve.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class DataSeeder {

    @Bean
    CommandLineRunner seedAdminUser(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            seedOrPromoteAdmin(userRepository, passwordEncoder, "admin@localresolve.com", "Admin", "admin123");
            seedOrPromoteAdmin(userRepository, passwordEncoder, "admin2@localresolve.com", "Admin Backup", "Admin@1234");
        };
    }

    private void seedOrPromoteAdmin(UserRepository userRepository, PasswordEncoder passwordEncoder,
                                     String email, String name, String rawPassword) {
        User existing = userRepository.findByEmail(email).orElse(null);
        if (existing == null) {
            User admin = User.builder()
                    .name(name)
                    .email(email)
                    .password(passwordEncoder.encode(rawPassword))
                    .role(Role.ADMIN)
                    .build();
            userRepository.save(admin);
            System.out.println("✅ Admin user seeded: " + email);
        } else if (existing.getRole() != Role.ADMIN) {
            existing.setRole(Role.ADMIN);
            userRepository.save(existing);
            System.out.println("✅ Promoted existing user to ADMIN: " + email);
        } else {
            System.out.println("ℹ️ Admin user already exists: " + email);
        }
    }
}

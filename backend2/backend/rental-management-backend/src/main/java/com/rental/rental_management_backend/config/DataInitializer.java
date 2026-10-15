package com.rental.rental_management_backend.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.rental.rental_management_backend.User.Repository.UserRepository;
import com.rental.rental_management_backend.User.entity.User;
import com.rental.rental_management_backend.User.enums.Gender;
import com.rental.rental_management_backend.User.enums.RoleType;
import com.rental.rental_management_backend.User.enums.UserStatus;

@Configuration
public class DataInitializer {

    @Bean
    CommandLineRunner initializeAdmin(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder) {

        return args -> {

            String adminEmail = "admin@rental.com";

            // Create admin only if it does not already exist
            if (userRepository.findByEmail(adminEmail).isEmpty()) {

                User admin = new User();

                admin.setFirstName("System");
                admin.setLastName("Admin");
                admin.setEmail(adminEmail);
                admin.setPassword(passwordEncoder.encode("Admin@123"));
                admin.setPhone("9000000000");
                admin.setGender(Gender.MALE);
                admin.setRole(RoleType.SUPER_ADMIN);
                admin.setStatus(UserStatus.ACTIVE);

                userRepository.save(admin);

                System.out.println("=================================");
                System.out.println("SUPER ADMIN CREATED");
                System.out.println("Email    : admin@rental.com");
                System.out.println("Password : Admin@123");
                System.out.println("Role     : SUPER_ADMIN");
                System.out.println("=================================");

            } else {

                System.out.println("SUPER ADMIN ALREADY EXISTS");
            }
        };
    }
}
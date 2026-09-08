
package com.rental.rental_management_backend.User.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    public SecurityConfig(
            JwtAuthenticationFilter jwtAuthenticationFilter) {

        this.jwtAuthenticationFilter =
                jwtAuthenticationFilter;
    }

    // =========================================================
    // PASSWORD ENCODER
    // =========================================================

    @Bean
    public PasswordEncoder passwordEncoder() {

        return new BCryptPasswordEncoder();
    }

    // =========================================================
    // SECURITY FILTER CHAIN
    // =========================================================

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http) throws Exception {

        http

            // Disable CSRF because JWT is used
            .csrf(csrf -> csrf.disable())

            // JWT authentication is stateless
            .sessionManagement(session ->
                    session.sessionCreationPolicy(
                            SessionCreationPolicy.STATELESS
                    )
            )

            .authorizeHttpRequests(auth -> auth

                // =================================================
                // PUBLIC AUTHENTICATION
                // =================================================

                .requestMatchers(
                        "/api/auth/register",
                        "/api/auth/login"
                ).permitAll()

                // =================================================
                // SWAGGER
                // =================================================

             // =================================================
             // SWAGGER + PROPERTY IMAGES
             // =================================================
             .requestMatchers(
                     "/swagger-ui/**",
                     "/swagger-ui.html",
                     "/v3/api-docs/**",
                     "/uploads/property-images/**"
             ).permitAll()

                // =================================================
                // USER MANAGEMENT
                // SUPER_ADMIN ONLY
                // =================================================

                .requestMatchers(
                        "/api/users/**"
                ).hasRole("SUPER_ADMIN")

                // =================================================
                // FUTURE PROPERTY OWNER APIs
                // =================================================

                .requestMatchers(
                        "/api/owner/**"
                ).hasRole("PROPERTY_OWNER")

                // =================================================
                // FUTURE PROPERTY MANAGER APIs
                // =================================================

                .requestMatchers(
                        "/api/manager/**"
                ).hasRole("PROPERTY_MANAGER")

                // =================================================
                // FUTURE TENANT APIs
                // =================================================

                .requestMatchers(
                        "/api/tenant/**"
                ).hasRole("TENANT")

                // =================================================
                // ALL OTHER APIs
                // =================================================

                .anyRequest().authenticated()
            )

            // =====================================================
            // JWT FILTER
            // =====================================================

            .addFilterBefore(
                    jwtAuthenticationFilter,
                    UsernamePasswordAuthenticationFilter.class
            );

        return http.build();
    }
}



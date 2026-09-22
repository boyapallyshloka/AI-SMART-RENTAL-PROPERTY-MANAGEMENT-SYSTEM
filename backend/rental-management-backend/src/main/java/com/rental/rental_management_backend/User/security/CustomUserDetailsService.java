package com.rental.rental_management_backend.User.security;

import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.rental.rental_management_backend.User.Repository.UserRepository;
import com.rental.rental_management_backend.User.entity.User;
import com.rental.rental_management_backend.User.enums.UserStatus;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    public CustomUserDetailsService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String email)
            throws UsernameNotFoundException {

        User user = userRepository
                .findByEmail(email.toLowerCase().trim())
                .orElseThrow(() ->
                        new UsernameNotFoundException(
                                "User not found with email: " + email
                        )
                );

        // DEBUG: Check user information
        System.out.println("=================================================");
        System.out.println("USER EMAIL : " + user.getEmail());
        System.out.println("USER ROLE  : " + user.getRole());
        System.out.println("USER STATUS: " + user.getStatus());
        System.out.println("AUTHORITY  : ROLE_" + user.getRole().name());
        System.out.println("=================================================");

        return org.springframework.security.core.userdetails.User
                .builder()
                .username(user.getEmail())
                .password(user.getPassword())

                // TENANT -> ROLE_TENANT
                // PROPERTY_OWNER -> ROLE_PROPERTY_OWNER
                // PROPERTY_MANAGER -> ROLE_PROPERTY_MANAGER
                // SUPER_ADMIN -> ROLE_SUPER_ADMIN
                .authorities(
                        new SimpleGrantedAuthority(
                                "ROLE_" + user.getRole().name()
                        )
                )

                .accountExpired(false)

                .accountLocked(
                        user.getStatus() == UserStatus.BLOCKED
                )

                .credentialsExpired(false)

                .disabled(
                        user.getStatus() != UserStatus.ACTIVE
                )

                .build();
    }
}
package com.rental.rental_management_backend.User.security;

import java.util.List;

import org.springframework.security.core.authority.SimpleGrantedAuthority;

import com.rental.rental_management_backend.User.dto.UserResponse;
import com.rental.rental_management_backend.User.entity.User;
import com.rental.rental_management_backend.User.enums.UserStatus;

public class RentalUserDetails
        extends org.springframework.security.core.userdetails.User {

    private final UserResponse userResponse;

    public RentalUserDetails(User user) {
        super(
                user.getEmail(),
                user.getPassword(),
                user.getStatus() == UserStatus.ACTIVE,
                true,
                true,
                user.getStatus() != UserStatus.BLOCKED,
                List.of(new SimpleGrantedAuthority(
                        "ROLE_" + user.getRole().name())));

        this.userResponse = new UserResponse();
        userResponse.setId(user.getId());
        userResponse.setFirstName(user.getFirstName());
        userResponse.setLastName(user.getLastName());
        userResponse.setEmail(user.getEmail());
        userResponse.setPhone(user.getPhone());
        userResponse.setGender(user.getGender());
        userResponse.setRole(user.getRole());
        userResponse.setStatus(user.getStatus());
        userResponse.setCreatedAt(user.getCreatedAt());
        userResponse.setUpdatedAt(user.getUpdatedAt());
    }

    public UserResponse getUserResponse() {
        return userResponse;
    }
}

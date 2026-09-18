package com.rental.rental_management_backend.User.service;

import java.util.List;

import com.rental.rental_management_backend.User.dto.LoginRequest;
import com.rental.rental_management_backend.User.dto.LoginResponse;
import com.rental.rental_management_backend.User.dto.RegisterRequest;
import com.rental.rental_management_backend.User.dto.UpdateUserRequest;
import com.rental.rental_management_backend.User.dto.UserResponse;
import com.rental.rental_management_backend.User.enums.RoleType;
import com.rental.rental_management_backend.User.enums.UserStatus;

public interface UserService {

    // Authentication

    UserResponse registerUser(RegisterRequest request);

    LoginResponse loginUser(LoginRequest request);

    // User operations

    UserResponse getUserById(Long id);

    UserResponse getUserByEmail(String email);

    UserResponse updateUser(
            Long id,
            UpdateUserRequest request
    );

    List<UserResponse> getAllUsers();

    // Filter operations

    List<UserResponse> getUsersByRole(RoleType role);

    List<UserResponse> getUsersByStatus(UserStatus status);

    List<UserResponse> getUsersByRoleAndStatus(
            RoleType role,
            UserStatus status
    );

    // Status

    UserResponse updateUserStatus(
            Long id,
            UserStatus status
    );

    // Delete

    void deleteUser(Long id);
}

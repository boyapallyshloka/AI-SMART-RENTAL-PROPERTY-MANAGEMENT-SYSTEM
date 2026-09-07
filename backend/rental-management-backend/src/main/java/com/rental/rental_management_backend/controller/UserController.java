
package com.rental.rental_management_backend.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.rental.rental_management_backend.User.dto.LoginRequest;
import com.rental.rental_management_backend.User.dto.LoginResponse;
import com.rental.rental_management_backend.User.dto.RegisterRequest;
import com.rental.rental_management_backend.User.dto.UpdateUserRequest;
import com.rental.rental_management_backend.User.dto.UserResponse;
import com.rental.rental_management_backend.User.enums.RoleType;
import com.rental.rental_management_backend.User.enums.UserStatus;
import com.rental.rental_management_backend.User.service.UserService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api")
public class UserController {

    private final UserService userService;

    public UserController(
            UserService userService) {

        this.userService = userService;
    }

    // =========================================================
    // PUBLIC AUTHENTICATION
    // =========================================================

    @PostMapping("/auth/register")
    public ResponseEntity<UserResponse> registerUser(
            @Valid @RequestBody RegisterRequest request) {

        UserResponse response =
                userService.registerUser(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    @PostMapping("/auth/login")
    public ResponseEntity<LoginResponse> loginUser(
            @Valid @RequestBody LoginRequest request) {

        LoginResponse response =
                userService.loginUser(request);

        return ResponseEntity.ok(response);
    }

    // =========================================================
    // SUPER ADMIN - USER MANAGEMENT
    // =========================================================

    @PreAuthorize("hasRole('SUPER_ADMIN')")
    @GetMapping("/users")
    public ResponseEntity<List<UserResponse>> getAllUsers() {

        return ResponseEntity.ok(
                userService.getAllUsers()
        );
    }

    @PreAuthorize("hasRole('SUPER_ADMIN')")
    @GetMapping("/users/{id}")
    public ResponseEntity<UserResponse> getUserById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                userService.getUserById(id)
        );
    }

    @PreAuthorize("hasRole('SUPER_ADMIN')")
    @GetMapping("/users/email")
    public ResponseEntity<UserResponse> getUserByEmail(
            @RequestParam String email) {

        return ResponseEntity.ok(
                userService.getUserByEmail(email)
        );
    }

    @PreAuthorize("hasRole('SUPER_ADMIN')")
    @PutMapping("/users/{id}")
    public ResponseEntity<UserResponse> updateUser(
            @PathVariable Long id,
            @Valid @RequestBody UpdateUserRequest request) {

        return ResponseEntity.ok(
                userService.updateUser(
                        id,
                        request
                )
        );
    }

    @PreAuthorize("hasRole('SUPER_ADMIN')")
    @DeleteMapping("/users/{id}")
    public ResponseEntity<String> deleteUser(
            @PathVariable Long id) {

        userService.deleteUser(id);

        return ResponseEntity.ok(
                "User deleted successfully"
        );
    }

    // =========================================================
    // USER FILTERING - SUPER ADMIN
    // =========================================================

    @PreAuthorize("hasRole('SUPER_ADMIN')")
    @GetMapping("/users/role/{role}")
    public ResponseEntity<List<UserResponse>> getUsersByRole(
            @PathVariable RoleType role) {

        return ResponseEntity.ok(
                userService.getUsersByRole(role)
        );
    }

    @PreAuthorize("hasRole('SUPER_ADMIN')")
    @GetMapping("/users/status/{status}")
    public ResponseEntity<List<UserResponse>> getUsersByStatus(
            @PathVariable UserStatus status) {

        return ResponseEntity.ok(
                userService.getUsersByStatus(status)
        );
    }

    @PreAuthorize("hasRole('SUPER_ADMIN')")
    @GetMapping("/users/filter")
    public ResponseEntity<List<UserResponse>>
    getUsersByRoleAndStatus(
            @RequestParam RoleType role,
            @RequestParam UserStatus status) {

        return ResponseEntity.ok(
                userService.getUsersByRoleAndStatus(
                        role,
                        status
                )
        );
    }

    // =========================================================
    // USER STATUS - SUPER ADMIN
    // =========================================================

    @PreAuthorize("hasRole('SUPER_ADMIN')")
    @PutMapping("/users/{id}/status")
    public ResponseEntity<UserResponse> updateUserStatus(
            @PathVariable Long id,
            @RequestParam UserStatus status) {

        return ResponseEntity.ok(
                userService.updateUserStatus(
                        id,
                        status
                )
        );
    }
}




package com.rental.rental_management_backend.User.serviceImpl;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.rental.rental_management_backend.User.Repository.UserRepository;
import com.rental.rental_management_backend.User.dto.LoginRequest;
import com.rental.rental_management_backend.User.dto.LoginResponse;
import com.rental.rental_management_backend.User.dto.RegisterRequest;
import com.rental.rental_management_backend.User.dto.UpdateUserRequest;
import com.rental.rental_management_backend.User.dto.UserResponse;
import com.rental.rental_management_backend.User.entity.User;
import com.rental.rental_management_backend.User.enums.RoleType;
import com.rental.rental_management_backend.User.enums.UserStatus;
import com.rental.rental_management_backend.User.exception.ResourceNotFoundException;
import com.rental.rental_management_backend.User.exception.UserAlreadyExistsException;
import com.rental.rental_management_backend.User.security.JwtService;
import com.rental.rental_management_backend.User.service.UserService;

@Service
@Transactional
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;

    private final PasswordEncoder passwordEncoder;

    private final JwtService jwtService;

    public UserServiceImpl(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService) {

        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    // =========================================================
    // REGISTER
    // =========================================================

    @Override
    public UserResponse registerUser(RegisterRequest request) {

        String email = request.getEmail()
                .toLowerCase()
                .trim();

        // Check duplicate email
        if (userRepository.existsByEmail(email)) {
            throw new UserAlreadyExistsException(
                    "Email already registered"
            );
        }

        // Check duplicate phone
        if (userRepository.existsByPhone(request.getPhone())) {
            throw new UserAlreadyExistsException(
                    "Phone number already registered"
            );
        }

        // SUPER_ADMIN cannot register publicly
        if (request.getRole() == RoleType.SUPER_ADMIN) {
            throw new IllegalArgumentException(
                    "SUPER_ADMIN cannot be created through public registration"
            );
        }

        User user = new User();

        user.setFirstName(
                request.getFirstName().trim()
        );

        user.setLastName(
                request.getLastName().trim()
        );

        user.setEmail(email);

        // Encrypt password
        user.setPassword(
                passwordEncoder.encode(
                        request.getPassword()
                )
        );

        user.setPhone(request.getPhone());

        user.setGender(request.getGender());

        user.setRole(request.getRole());

        // =====================================================
        // ROLE BASED REGISTRATION STATUS
        // =====================================================

        if (request.getRole() == RoleType.PROPERTY_OWNER) {

            // Property owners require SUPER_ADMIN verification
            user.setStatus(UserStatus.PENDING);

        } else {

            // Tenant and Property Manager can be active
            user.setStatus(UserStatus.ACTIVE);
        }

        User savedUser =
                userRepository.save(user);

        return mapToResponse(savedUser);
    }

    // =========================================================
    // LOGIN
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public LoginResponse loginUser(
            LoginRequest request) {

        String email = request.getEmail()
                .toLowerCase()
                .trim();

        User user =
                userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Invalid email or password"
                        )
                );

        // Only ACTIVE users can login
        if (user.getStatus() != UserStatus.ACTIVE) {

            throw new IllegalArgumentException(
                    "Account is not active"
            );
        }

        // Check password
        if (!passwordEncoder.matches(
                request.getPassword(),
                user.getPassword())) {

            throw new IllegalArgumentException(
                    "Invalid email or password"
            );
        }

        // Create Spring Security UserDetails
        UserDetails userDetails =
                org.springframework.security.core.userdetails.User
                        .withUsername(user.getEmail())
                        .password(user.getPassword())
                        .authorities(
                                "ROLE_" +
                                user.getRole().name()
                        )
                        .build();

        // Generate JWT
        String token =
                jwtService.generateToken(userDetails);

        LoginResponse response =
                new LoginResponse();

        response.setToken(token);
        response.setUserId(user.getId());
        response.setFirstName(user.getFirstName());
        response.setLastName(user.getLastName());
        response.setEmail(user.getEmail());
        response.setRole(user.getRole());

        return response;
    }

    // =========================================================
    // GET USER BY ID
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public UserResponse getUserById(Long id) {

        User user =
                userRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "User not found with id: " + id
                        )
                );

        return mapToResponse(user);
    }

    // =========================================================
    // GET USER BY EMAIL
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public UserResponse getUserByEmail(
            String email) {

        User user =
                userRepository.findByEmail(
                        email.toLowerCase().trim()
                )
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "User not found with email: "
                                        + email
                        )
                );

        return mapToResponse(user);
    }

    // =========================================================
    // UPDATE USER
    // =========================================================

    @Override
    public UserResponse updateUser(
            Long id,
            UpdateUserRequest request) {

        User user =
                userRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "User not found with id: "
                                        + id
                        )
                );

        if (request.getFirstName() != null
                && !request.getFirstName().isBlank()) {

            user.setFirstName(
                    request.getFirstName().trim()
            );
        }

        if (request.getLastName() != null
                && !request.getLastName().isBlank()) {

            user.setLastName(
                    request.getLastName().trim()
            );
        }

        if (request.getEmail() != null
                && !request.getEmail().isBlank()
                && !request.getEmail()
                        .equalsIgnoreCase(
                                user.getEmail()
                        )) {

            String newEmail =
                    request.getEmail()
                    .toLowerCase()
                    .trim();

            if (userRepository.existsByEmailAndIdNot(
                    newEmail,
                    id)) {

                throw new UserAlreadyExistsException(
                        "Email already registered by another user"
                );
            }

            user.setEmail(newEmail);
        }

        if (request.getPhone() != null
                && !request.getPhone().isBlank()
                && !request.getPhone()
                        .equals(user.getPhone())) {

            if (userRepository.existsByPhoneAndIdNot(
                    request.getPhone(),
                    id)) {

                throw new UserAlreadyExistsException(
                        "Phone number already registered by another user"
                );
            }

            user.setPhone(request.getPhone());
        }

        if (request.getGender() != null) {

            user.setGender(
                    request.getGender()
            );
        }

        User updatedUser =
                userRepository.save(user);

        return mapToResponse(updatedUser);
    }

    // =========================================================
    // GET ALL USERS
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public List<UserResponse> getAllUsers() {

        return userRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // =========================================================
    // GET USERS BY ROLE
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public List<UserResponse> getUsersByRole(
            RoleType role) {

        return userRepository.findByRole(role)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // =========================================================
    // GET USERS BY STATUS
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public List<UserResponse> getUsersByStatus(
            UserStatus status) {

        return userRepository.findByStatus(status)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // =========================================================
    // GET USERS BY ROLE AND STATUS
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public List<UserResponse> getUsersByRoleAndStatus(
            RoleType role,
            UserStatus status) {

        return userRepository
                .findByRoleAndStatus(
                        role,
                        status
                )
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // =========================================================
    // UPDATE USER STATUS
    // =========================================================

    @Override
    public UserResponse updateUserStatus(
            Long id,
            UserStatus status) {

        User user =
                userRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "User not found with id: "
                                        + id
                        )
                );

        user.setStatus(status);

        User updatedUser =
                userRepository.save(user);

        return mapToResponse(updatedUser);
    }

    // =========================================================
    // DELETE USER
    // =========================================================

    @Override
    public void deleteUser(Long id) {

        User user =
                userRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "User not found with id: "
                                        + id
                        )
                );

        userRepository.delete(user);
    }

    // =========================================================
    // ENTITY → DTO
    // =========================================================

    private UserResponse mapToResponse(
            User user) {

        UserResponse response =
                new UserResponse();

        response.setId(user.getId());

        response.setFirstName(
                user.getFirstName()
        );

        response.setLastName(
                user.getLastName()
        );

        response.setEmail(
                user.getEmail()
        );

        response.setPhone(
                user.getPhone()
        );

        response.setGender(
                user.getGender()
        );

        response.setRole(
                user.getRole()
        );

        response.setStatus(
                user.getStatus()
        );

        response.setCreatedAt(
                user.getCreatedAt()
        );

        response.setUpdatedAt(
                user.getUpdatedAt()
        );

        return response;
    }
}



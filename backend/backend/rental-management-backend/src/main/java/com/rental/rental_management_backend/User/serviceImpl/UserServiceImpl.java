
package com.rental.rental_management_backend.User.serviceImpl;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.rental.rental_management_backend.User.Repository.PasswordResetTokenRepository;
import com.rental.rental_management_backend.User.Repository.UserRepository;
import com.rental.rental_management_backend.User.dto.LoginRequest;
import com.rental.rental_management_backend.User.dto.LoginResponse;
import com.rental.rental_management_backend.User.dto.RegisterRequest;
import com.rental.rental_management_backend.User.dto.UpdateUserRequest;
import com.rental.rental_management_backend.User.dto.UserResponse;
import com.rental.rental_management_backend.User.entity.PasswordResetToken;
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

    private final PasswordResetTokenRepository passwordResetTokenRepository;

    public UserServiceImpl(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            PasswordResetTokenRepository passwordResetTokenRepository) {

        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.passwordResetTokenRepository =
                passwordResetTokenRepository;
    }

    // =========================================================
    // REGISTER
    // =========================================================

    @Override
    public UserResponse registerUser(RegisterRequest request) {

        String email = request.getEmail()
                .toLowerCase()
                .trim();

        if (userRepository.existsByEmail(email)) {

            throw new UserAlreadyExistsException(
                    "Email already registered"
            );
        }

        if (userRepository.existsByPhone(request.getPhone())) {

            throw new UserAlreadyExistsException(
                    "Phone number already registered"
            );
        }

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

        user.setPassword(
                passwordEncoder.encode(
                        request.getPassword()
                )
        );

        user.setPhone(request.getPhone());

        user.setGender(request.getGender());

        user.setRole(request.getRole());

        if (request.getRole() == RoleType.PROPERTY_OWNER) {

            user.setStatus(UserStatus.PENDING);

        } else {

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

        if (user.getStatus() != UserStatus.ACTIVE) {

            throw new IllegalArgumentException(
                    "Account is not active"
            );
        }

        if (!passwordEncoder.matches(
                request.getPassword(),
                user.getPassword())) {

            throw new IllegalArgumentException(
                    "Invalid email or password"
            );
        }

        UserDetails userDetails =
                org.springframework.security.core.userdetails.User
                        .withUsername(user.getEmail())
                        .password(user.getPassword())
                        .authorities(
                                "ROLE_" +
                                user.getRole().name()
                        )
                        .build();

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

    // =========================================================
    // GET MY PROFILE
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public UserResponse getMyProfile(
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
    // CHANGE PASSWORD
    // =========================================================

    @Override
    public void changePassword(
            Long id,
            String currentPassword,
            String newPassword) {

        User user =
                userRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "User not found with id: "
                                        + id
                        )
                );

        // Check current password
        if (!passwordEncoder.matches(
                currentPassword,
                user.getPassword())) {

            throw new IllegalArgumentException(
                    "Current password is incorrect"
            );
        }

        // Prevent using the same password
        if (passwordEncoder.matches(
                newPassword,
                user.getPassword())) {

            throw new IllegalArgumentException(
                    "New password must be different from current password"
            );
        }

        // Encrypt new password
        user.setPassword(
                passwordEncoder.encode(newPassword)
        );

        userRepository.save(user);
    }

    // =========================================================
    // FORGOT PASSWORD
    // =========================================================
    
    @Override
    public void forgotPassword(String email) {

        String normalizedEmail =
                email.toLowerCase().trim();

        // Find user
        User user =
                userRepository.findByEmail(normalizedEmail)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "User not found with email: " + email
                        )
                );

        // Find existing reset token for this user
        Optional<PasswordResetToken> existingToken =
                passwordResetTokenRepository
                        .findByUserId(user.getId());

        // Delete existing token
        if (existingToken.isPresent()) {

            passwordResetTokenRepository.delete(
                    existingToken.get()
            );

            // Force DELETE to PostgreSQL before INSERT
            passwordResetTokenRepository.flush();
        }

        // Generate new reset token
        String token =
                UUID.randomUUID().toString();

        // Token expires after 15 minutes
        LocalDateTime expiryDate =
                LocalDateTime.now().plusMinutes(15);

        PasswordResetToken resetToken =
                new PasswordResetToken(
                        token,
                        user,
                        expiryDate
                );

        // Save new token
        passwordResetTokenRepository.save(
                resetToken
        );

        // Temporary testing output
        System.out.println(
                "PASSWORD RESET TOKEN: " + token
        );
    }
    
    // =========================================================
    // RESET PASSWORD
    // =========================================================

    @Override
    public void resetPassword(
            String token,
            String newPassword) {

        // Find reset token
        PasswordResetToken resetToken =
                passwordResetTokenRepository
                        .findByToken(token)
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Invalid password reset token"
                                )
                        );

        // Check token expiry
        if (resetToken.getExpiryDate()
                .isBefore(LocalDateTime.now())) {

            passwordResetTokenRepository
                    .deleteByToken(token);

            throw new IllegalArgumentException(
                    "Password reset token has expired"
            );
        }

        // Get user associated with reset token
        User user = resetToken.getUser();

        // Prevent using the same password
        if (passwordEncoder.matches(
                newPassword,
                user.getPassword())) {

            throw new IllegalArgumentException(
                    "New password must be different from current password"
            );
        }

        // Encrypt new password
        user.setPassword(
                passwordEncoder.encode(newPassword)
        );

        // Save updated user
        userRepository.save(user);

        // Delete token after successful password reset
        passwordResetTokenRepository
                .deleteByToken(token);
    }
}



package com.rental.rental_management_backend.User.Repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.rental.rental_management_backend.User.entity.EmailVerificationOtp;

public interface EmailVerificationOtpRepository
        extends JpaRepository<EmailVerificationOtp, Long> {

    Optional<EmailVerificationOtp> findByUser_Id(Long userId);

    void deleteByUser_Id(Long userId);
}
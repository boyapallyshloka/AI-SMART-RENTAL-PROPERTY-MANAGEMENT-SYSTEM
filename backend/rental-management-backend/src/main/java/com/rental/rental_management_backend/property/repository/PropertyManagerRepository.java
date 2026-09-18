
package com.rental.rental_management_backend.property.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.rental.rental_management_backend.User.entity.User;
import com.rental.rental_management_backend.property.entity.PropertyManager;

public interface PropertyManagerRepository extends JpaRepository<PropertyManager, Long> {

    // Find PropertyManager profile using User
    Optional<PropertyManager> findByUser(User user);

    // Find PropertyManager profile using User ID
    Optional<PropertyManager> findByUser_Id(Long userId);

    // Check whether a PropertyManager profile exists for a User
    boolean existsByUser(User user);

    // Check whether a PropertyManager profile exists for a User ID
    boolean existsByUser_Id(Long userId);
}

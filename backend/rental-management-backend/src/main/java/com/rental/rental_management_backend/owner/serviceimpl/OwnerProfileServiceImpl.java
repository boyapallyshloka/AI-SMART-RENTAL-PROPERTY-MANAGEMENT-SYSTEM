package com.rental.rental_management_backend.owner.serviceimpl;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.rental.rental_management_backend.User.Repository.UserRepository;
import com.rental.rental_management_backend.User.entity.User;
import com.rental.rental_management_backend.User.enums.RoleType;
import com.rental.rental_management_backend.exception.ResourceNotFoundException;
import com.rental.rental_management_backend.owner.dto.OwnerProfileResponse;
import com.rental.rental_management_backend.owner.dto.OwnerProfileUpdateRequest;
import com.rental.rental_management_backend.owner.entity.OwnerProfile;
import com.rental.rental_management_backend.owner.repository.OwnerProfileRepository;
import com.rental.rental_management_backend.owner.service.OwnerProfileService;

@Service
@Transactional
public class OwnerProfileServiceImpl implements OwnerProfileService {


private final OwnerProfileRepository ownerProfileRepository;

private final UserRepository userRepository;

public OwnerProfileServiceImpl(
        OwnerProfileRepository ownerProfileRepository,
        UserRepository userRepository) {

    this.ownerProfileRepository = ownerProfileRepository;
    this.userRepository = userRepository;
}

// =========================================================
// GET MY PROFILE
// =========================================================

@Override
@Transactional(readOnly = true)
public OwnerProfileResponse getMyProfile(String email) {

    User user = getAuthenticatedOwner(email);

    OwnerProfile profile =
            ownerProfileRepository.findByUser_Id(user.getId())
                    .orElse(null);

    /*
     * IMPORTANT:
     * GET must remain read-only.
     *
     * If the owner profile does not exist yet,
     * do NOT create/save a profile here.
     *
     * The response will contain user details and
     * null profile/address fields.
     */
    return mapToResponse(user, profile);
}

// =========================================================
// UPDATE MY PROFILE
// =========================================================

@Override
public OwnerProfileResponse updateMyProfile(
        String email,
        OwnerProfileUpdateRequest request) {

    if (request == null) {

        throw new IllegalArgumentException(
                "Owner profile request cannot be null");
    }

    User user = getAuthenticatedOwner(email);

    OwnerProfile profile =
            ownerProfileRepository.findByUser_Id(user.getId())
                    .orElseGet(() -> createEmptyProfile(user));

    if (request.getProfileImage() != null) {

        profile.setProfileImage(
                cleanValue(request.getProfileImage()));
    }

    if (request.getAddressLine1() != null) {

        profile.setAddressLine1(
                cleanValue(request.getAddressLine1()));
    }

    if (request.getAddressLine2() != null) {

        profile.setAddressLine2(
                cleanValue(request.getAddressLine2()));
    }

    if (request.getArea() != null) {

        profile.setArea(
                cleanValue(request.getArea()));
    }

    if (request.getDistrict() != null) {

        profile.setDistrict(
                cleanValue(request.getDistrict()));
    }

    if (request.getCity() != null) {

        profile.setCity(
                cleanValue(request.getCity()));
    }

    if (request.getState() != null) {

        profile.setState(
                cleanValue(request.getState()));
    }

    if (request.getCountry() != null) {

        profile.setCountry(
                cleanValue(request.getCountry()));
    }

    if (request.getPincode() != null) {

        profile.setPincode(
                cleanValue(request.getPincode()));
    }

    OwnerProfile savedProfile =
            ownerProfileRepository.save(profile);

    return mapToResponse(user, savedProfile);
}

// =========================================================
// GET AUTHENTICATED OWNER
// =========================================================

private User getAuthenticatedOwner(String email) {

    if (email == null || email.isBlank()) {

        throw new IllegalArgumentException(
                "Authenticated user email is required");
    }

    User user = userRepository.findByEmail(
            email.toLowerCase().trim()

    ).orElseThrow(() ->
            new ResourceNotFoundException(
                    "Authenticated user not found"));

    if (user.getRole() != RoleType.PROPERTY_OWNER) {

        throw new IllegalArgumentException(
                "Only PROPERTY_OWNER users can access this profile");
    }

    return user;
}

// =========================================================
// CREATE EMPTY PROFILE
// =========================================================
/*
 * This method is now used ONLY during PUT/update.
 *
 * It is NOT called by GET.
 */
private OwnerProfile createEmptyProfile(User user) {

    if (ownerProfileRepository.existsByUser_Id(user.getId())) {

        return ownerProfileRepository
                .findByUser_Id(user.getId())
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Owner profile could not be loaded"));
    }

    OwnerProfile profile = new OwnerProfile();

    profile.setUser(user);

    return ownerProfileRepository.save(profile);
}

// =========================================================
// CLEAN VALUE
// =========================================================

private String cleanValue(String value) {

    if (value == null) {

        return null;
    }

    String cleaned = value.trim();

    return cleaned.isEmpty() ? null : cleaned;
}

// =========================================================
// MAP ENTITY → RESPONSE
// =========================================================

private OwnerProfileResponse mapToResponse(
        User user,
        OwnerProfile profile) {

    OwnerProfileResponse response =
            new OwnerProfileResponse();

    /*
     * USER DETAILS
     *
     * These are available even when OwnerProfile
     * does not exist yet.
     */
    response.setUserId(user.getId());

    response.setFirstName(user.getFirstName());

    response.setLastName(user.getLastName());

    response.setEmail(user.getEmail());

    response.setPhone(user.getPhone());

    if (user.getGender() != null) {

        response.setGender(user.getGender().name());
    }

    if (user.getRole() != null) {

        response.setRole(user.getRole().name());
    }

    if (user.getStatus() != null) {

        response.setStatus(user.getStatus().name());
    }

    /*
     * PROFILE DETAILS
     *
     * If profile does not exist, these remain null.
     */
    if (profile != null) {

        response.setProfileId(profile.getProfileId());

        response.setProfileImage(
                profile.getProfileImage());

        response.setAddressLine1(
                profile.getAddressLine1());

        response.setAddressLine2(
                profile.getAddressLine2());

        response.setArea(
                profile.getArea());

        response.setDistrict(
                profile.getDistrict());

        response.setCity(
                profile.getCity());

        response.setState(
                profile.getState());

        response.setCountry(
                profile.getCountry());

        response.setPincode(
                profile.getPincode());

        response.setCreatedAt(
                profile.getCreatedAt());

        response.setUpdatedAt(
                profile.getUpdatedAt());
    }

    return response;
}


}

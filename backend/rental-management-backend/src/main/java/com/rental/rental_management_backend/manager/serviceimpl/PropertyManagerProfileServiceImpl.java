package com.rental.rental_management_backend.manager.serviceimpl;

import org.springframework.stereotype.Service;

import com.rental.rental_management_backend.User.Repository.UserRepository;
import com.rental.rental_management_backend.User.entity.User;
import com.rental.rental_management_backend.User.enums.RoleType;
import com.rental.rental_management_backend.manager.dto.PropertyManagerProfileResponse;
import com.rental.rental_management_backend.manager.dto.PropertyManagerProfileUpdateRequest;
import com.rental.rental_management_backend.manager.entity.PropertyManagerProfile;
import com.rental.rental_management_backend.manager.repository.PropertyManagerProfileRepository;
import com.rental.rental_management_backend.manager.service.PropertyManagerProfileService;

@Service
public class PropertyManagerProfileServiceImpl
        implements PropertyManagerProfileService {

    private final PropertyManagerProfileRepository profileRepository;
    private final UserRepository userRepository;

    public PropertyManagerProfileServiceImpl(
            PropertyManagerProfileRepository profileRepository,
            UserRepository userRepository) {

        this.profileRepository = profileRepository;
        this.userRepository = userRepository;
    }

    @Override
    public PropertyManagerProfileResponse getMyProfile(String email) {

        User user = getAuthenticatedManager(email);

        PropertyManagerProfile profile =
                profileRepository.findByUser_Id(user.getId())
                        .orElseGet(() -> createEmptyProfile(user));

        return mapToResponse(profile);
    }

    @Override
    public PropertyManagerProfileResponse updateMyProfile(
            String email,
            PropertyManagerProfileUpdateRequest request) {

        User user = getAuthenticatedManager(email);

        PropertyManagerProfile profile =
                profileRepository.findByUser_Id(user.getId())
                        .orElseGet(() -> createEmptyProfile(user));

        if (request.getProfileImage() != null) {
            profile.setProfileImage(cleanValue(request.getProfileImage()));
        }

        if (request.getAddressLine1() != null) {
            profile.setAddressLine1(cleanValue(request.getAddressLine1()));
        }

        if (request.getAddressLine2() != null) {
            profile.setAddressLine2(cleanValue(request.getAddressLine2()));
        }

        if (request.getArea() != null) {
            profile.setArea(cleanValue(request.getArea()));
        }

        if (request.getDistrict() != null) {
            profile.setDistrict(cleanValue(request.getDistrict()));
        }

        if (request.getCity() != null) {
            profile.setCity(cleanValue(request.getCity()));
        }

        if (request.getState() != null) {
            profile.setState(cleanValue(request.getState()));
        }

        if (request.getCountry() != null) {
            profile.setCountry(cleanValue(request.getCountry()));
        }

        if (request.getPincode() != null) {
            profile.setPincode(cleanValue(request.getPincode()));
        }

        PropertyManagerProfile savedProfile =
                profileRepository.save(profile);

        return mapToResponse(savedProfile);
    }

    private User getAuthenticatedManager(String email) {

        User user = userRepository
                .findByEmail(email.trim().toLowerCase())
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        if (user.getRole() != RoleType.PROPERTY_MANAGER) {
            throw new RuntimeException(
                    "Only PROPERTY_MANAGER can access this profile");
        }

        return user;
    }

    private PropertyManagerProfile createEmptyProfile(User user) {

        PropertyManagerProfile profile =
                new PropertyManagerProfile();

        profile.setUser(user);

        return profileRepository.save(profile);
    }

    private PropertyManagerProfileResponse mapToResponse(
            PropertyManagerProfile profile) {

        User user = profile.getUser();

        PropertyManagerProfileResponse response =
                new PropertyManagerProfileResponse();

        response.setProfileId(profile.getProfileId());
        response.setUserId(user.getId());

        response.setFirstName(user.getFirstName());
        response.setLastName(user.getLastName());
        response.setEmail(user.getEmail());
        response.setPhone(user.getPhone());

        response.setGender(user.getGender());
        response.setRole(user.getRole());
        response.setStatus(user.getStatus());

        response.setProfileImage(profile.getProfileImage());

        response.setAddressLine1(profile.getAddressLine1());
        response.setAddressLine2(profile.getAddressLine2());
        response.setArea(profile.getArea());
        response.setDistrict(profile.getDistrict());
        response.setCity(profile.getCity());
        response.setState(profile.getState());
        response.setCountry(profile.getCountry());
        response.setPincode(profile.getPincode());

        response.setCreatedAt(profile.getCreatedAt());
        response.setUpdatedAt(profile.getUpdatedAt());

        return response;
    }

    private String cleanValue(String value) {

        if (value == null) {
            return null;
        }

        String cleaned = value.trim();

        return cleaned.isEmpty() ? null : cleaned;
    }
}
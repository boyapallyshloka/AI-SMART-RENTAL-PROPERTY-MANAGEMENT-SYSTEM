package com.rental.rental_management_backend.location.service;

import com.rental.rental_management_backend.location.dto.PincodeResponse;
import com.rental.rental_management_backend.location.dto.ReverseGeocodeResponse;

public interface LocationService {

    PincodeResponse getAddressByPincode(String pincode);

    ReverseGeocodeResponse reverseGeocode(
            double latitude,
            double longitude
    );
}
package com.rental.rental_management_backend.property.service;

import com.rental.rental_management_backend.property.dto.PropertyAddressRequest;
import com.rental.rental_management_backend.property.dto.PropertyAddressResponse;

public interface PropertyAddressService {

    PropertyAddressResponse createAddress(
            Long propertyId,
            PropertyAddressRequest request
    );

    PropertyAddressResponse getAddressByPropertyId(
            Long propertyId
    );

    PropertyAddressResponse updateAddress(
            Long propertyId,
            PropertyAddressRequest request
    );

    void deleteAddress(Long propertyId);
    PropertyAddressResponse getPublicAddressByPropertyId(Long propertyId);
}
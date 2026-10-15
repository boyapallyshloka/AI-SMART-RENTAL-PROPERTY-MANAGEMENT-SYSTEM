package com.rental.rental_management_backend.location.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.rental.rental_management_backend.location.dto.PincodeResponse;
import com.rental.rental_management_backend.location.dto.PincodeSuggestionResponse;
import com.rental.rental_management_backend.location.dto.ReverseGeocodeResponse;
import com.rental.rental_management_backend.location.service.LocationService;

@RestController
@RequestMapping("/api/location")
public class LocationController {

    private final LocationService locationService;

    public LocationController(LocationService locationService) {
        this.locationService = locationService;
    }

    // =========================================================
    // PINCODE AUTOCOMPLETE SEARCH
    // =========================================================

    @GetMapping("/pincode/search")
    public ResponseEntity<List<PincodeSuggestionResponse>> searchPincodes(
            @RequestParam String prefix) {

        return ResponseEntity.ok(
                locationService.searchPincodes(prefix)
        );
    }

    // =========================================================
    // PINCODE LOOKUP
    // =========================================================

    @GetMapping("/pincode/{pincode}")
    public ResponseEntity<PincodeResponse> getAddressByPincode(
            @PathVariable String pincode) {

        return ResponseEntity.ok(
                locationService.getAddressByPincode(pincode)
        );
    }

    // =========================================================
    // CURRENT LOCATION / REVERSE GEOCODING
    // =========================================================

    @GetMapping("/reverse-geocode")
    public ResponseEntity<ReverseGeocodeResponse> reverseGeocode(
            @RequestParam double latitude,
            @RequestParam double longitude) {

        return ResponseEntity.ok(
                locationService.reverseGeocode(
                        latitude,
                        longitude
                )
        );
    }
}
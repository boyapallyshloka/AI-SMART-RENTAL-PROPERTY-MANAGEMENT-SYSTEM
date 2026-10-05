package com.rental.rental_management_backend.location.serviceimpl;

import java.util.ArrayList;
import java.util.List;

import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.util.UriComponentsBuilder;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.rental.rental_management_backend.location.dto.PincodeResponse;
import com.rental.rental_management_backend.location.dto.ReverseGeocodeResponse;
import com.rental.rental_management_backend.location.service.LocationService;

@Service
public class LocationServiceImpl implements LocationService {

    private static final String PINCODE_API =
            "https://api.postalpincode.in/pincode/";

    private static final String NOMINATIM_API =
            "https://nominatim.openstreetmap.org/reverse";

    private final RestClient restClient;

    private final ObjectMapper objectMapper;

    public LocationServiceImpl() {

        this.restClient = RestClient.builder()
                .defaultHeader(
                        HttpHeaders.USER_AGENT,
                        "AI-Smart-Rental-Property-Management-System/1.0"
                )
                .build();

        this.objectMapper = new ObjectMapper();
    }

    // =========================================================
    // PINCODE LOOKUP
    // =========================================================

    @Override
    public PincodeResponse getAddressByPincode(String pincode) {

        if (pincode == null || !pincode.matches("\\d{6}")) {

            throw new IllegalArgumentException(
                    "Pincode must contain exactly 6 digits"
            );
        }

        String url = PINCODE_API + pincode;

        try {

            String response = restClient.get()
                    .uri(url)
                    .accept(MediaType.APPLICATION_JSON)
                    .retrieve()
                    .body(String.class);

            JsonNode root =
                    objectMapper.readTree(response);

            if (!root.isArray() || root.isEmpty()) {

                throw new IllegalArgumentException(
                        "Invalid response from pincode service"
                );
            }

            JsonNode result = root.get(0);

            String status =
                    result.path("Status").asText();

            if (!"Success".equalsIgnoreCase(status)) {

                throw new IllegalArgumentException(
                        "No address found for pincode: " + pincode
                );
            }

            JsonNode postOffice =
                    result.path("PostOffice");

            if (!postOffice.isArray()
                    || postOffice.isEmpty()) {

                throw new IllegalArgumentException(
                        "No post offices found for pincode: "
                                + pincode
                );
            }

            PincodeResponse pincodeResponse =
                    new PincodeResponse();

            pincodeResponse.setPincode(pincode);

            List<String> areas =
                    new ArrayList<>();

            JsonNode firstPostOffice =
                    postOffice.get(0);

            // -------------------------------------------------
            // COUNTRY
            // -------------------------------------------------

            pincodeResponse.setCountry(
                    firstPostOffice
                            .path("Country")
                            .asText(null)
            );

            // -------------------------------------------------
            // STATE
            // -------------------------------------------------

            pincodeResponse.setState(
                    firstPostOffice
                            .path("State")
                            .asText(null)
            );

            // -------------------------------------------------
            // DISTRICT
            // -------------------------------------------------

            pincodeResponse.setDistrict(
                    firstPostOffice
                            .path("District")
                            .asText(null)
            );

            // -------------------------------------------------
            // CITY
            // -------------------------------------------------
            /*
             * India Post does not always provide a dedicated
             * "City" field.
             *
             * We therefore use the postal hierarchy as a
             * practical fallback.
             *
             * Preference:
             * Division -> Region
             *
             * This value can be treated as the city/locality
             * suggestion by the frontend.
             */

            String city =
                    firstNonBlank(
                            firstPostOffice
                                    .path("Division")
                                    .asText(null),

                            firstPostOffice
                                    .path("Region")
                                    .asText(null)
                    );

            pincodeResponse.setCity(city);

            // -------------------------------------------------
            // AREAS / POST OFFICES
            // -------------------------------------------------
            /*
             * A single pincode can have multiple
             * post offices/areas.
             *
             * We return all of them so the frontend
             * can display them in a dropdown.
             */

            for (JsonNode office : postOffice) {

                String officeName =
                        office.path("Name")
                                .asText(null);

                if (officeName != null
                        && !officeName.isBlank()
                        && !areas.contains(officeName)) {

                    areas.add(officeName);
                }
            }

            pincodeResponse.setAreas(areas);

            return pincodeResponse;

        } catch (IllegalArgumentException ex) {

            throw ex;

        } catch (Exception ex) {

            throw new RuntimeException(
                    "Failed to lookup pincode: " + pincode,
                    ex
            );
        }
    }

    // =========================================================
    // CURRENT LOCATION
    // REVERSE GEOCODING
    // =========================================================

    @Override
    public ReverseGeocodeResponse reverseGeocode(
            double latitude,
            double longitude) {

        /*
         * Basic coordinate validation
         */

        if (latitude < -90 || latitude > 90) {

            throw new IllegalArgumentException(
                    "Invalid latitude"
            );
        }

        if (longitude < -180 || longitude > 180) {

            throw new IllegalArgumentException(
                    "Invalid longitude"
            );
        }

        try {

            String url = UriComponentsBuilder
                    .fromUriString(NOMINATIM_API)
                    .queryParam("format", "jsonv2")
                    .queryParam("lat", latitude)
                    .queryParam("lon", longitude)
                    .queryParam("addressdetails", 1)
                    .queryParam("zoom", 18)
                    .queryParam("accept-language", "en")
                    .build()
                    .toUriString();

            String response = restClient.get()
                    .uri(url)
                    .accept(MediaType.APPLICATION_JSON)
                    .retrieve()
                    .body(String.class);

            JsonNode root =
                    objectMapper.readTree(response);

            if (root == null || root.isEmpty()) {

                throw new IllegalArgumentException(
                        "No address found for the provided location"
                );
            }

            JsonNode address =
                    root.path("address");

            if (address.isMissingNode()
                    || address.isEmpty()) {

                throw new IllegalArgumentException(
                        "Address details were not found"
                );
            }

            ReverseGeocodeResponse result =
                    new ReverseGeocodeResponse();

            // -------------------------------------------------
            // ADDRESS LINE 1
            // -------------------------------------------------

            String houseNumber =
                    address.path("house_number")
                            .asText(null);

            String road =
                    address.path("road")
                            .asText(null);

            String addressLine1 =
                    buildAddressLine(
                            houseNumber,
                            road
                    );

            result.setAddressLine1(addressLine1);

            // -------------------------------------------------
            // AREA
            // -------------------------------------------------

            String area =
                    firstNonBlank(
                            address.path("neighbourhood")
                                    .asText(null),

                            address.path("suburb")
                                    .asText(null),

                            address.path("village")
                                    .asText(null)
                    );

            result.setArea(area);

            // -------------------------------------------------
            // DISTRICT
            // -------------------------------------------------

            String district =
                    firstNonBlank(
                            address.path("county")
                                    .asText(null),

                            address.path("state_district")
                                    .asText(null),

                            address.path("district")
                                    .asText(null)
                    );

            result.setDistrict(district);

            // -------------------------------------------------
            // CITY
            // -------------------------------------------------

            String city =
                    firstNonBlank(
                            address.path("city")
                                    .asText(null),

                            address.path("town")
                                    .asText(null),

                            address.path("municipality")
                                    .asText(null),

                            address.path("village")
                                    .asText(null)
                    );

            result.setCity(city);

            // -------------------------------------------------
            // STATE
            // -------------------------------------------------

            result.setState(
                    address.path("state")
                            .asText(null)
            );

            // -------------------------------------------------
            // COUNTRY
            // -------------------------------------------------

            result.setCountry(
                    address.path("country")
                            .asText(null)
            );

            // -------------------------------------------------
            // PINCODE
            // -------------------------------------------------

            result.setPincode(
                    address.path("postcode")
                            .asText(null)
            );

            return result;

        } catch (IllegalArgumentException ex) {

            throw ex;

        } catch (Exception ex) {

            throw new RuntimeException(
                    "Failed to reverse geocode the provided location",
                    ex
            );
        }
    }

    // =========================================================
    // BUILD ADDRESS LINE
    // =========================================================

    private String buildAddressLine(
            String houseNumber,
            String road) {

        if (houseNumber != null
                && !houseNumber.isBlank()
                && road != null
                && !road.isBlank()) {

            return houseNumber + ", " + road;
        }

        if (road != null
                && !road.isBlank()) {

            return road;
        }

        if (houseNumber != null
                && !houseNumber.isBlank()) {

            return houseNumber;
        }

        return null;
    }

    // =========================================================
    // FIRST NON-BLANK VALUE
    // =========================================================

    private String firstNonBlank(
            String... values) {

        for (String value : values) {

            if (value != null
                    && !value.isBlank()) {

                return value;
            }
        }

        return null;
    }
}
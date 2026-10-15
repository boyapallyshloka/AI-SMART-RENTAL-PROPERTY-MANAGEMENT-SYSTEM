
package com.rental.rental_management_backend.location.serviceimpl;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.rental.rental_management_backend.location.dto.PincodeResponse;
import com.rental.rental_management_backend.location.dto.PincodeSuggestionResponse;
import com.rental.rental_management_backend.location.dto.ReverseGeocodeResponse;
import com.rental.rental_management_backend.location.service.LocationService;

@Service
public class LocationServiceImpl implements LocationService {

    private static final String INDIA_POST_API =
            "https://api.postalpincode.in/pincode/";

    private static final String PINCODE_API =
            "https://api.pincodeapi.in/api/v1";

    private final RestClient restClient;

    private final ObjectMapper objectMapper;

    public LocationServiceImpl() {

        this.restClient = RestClient.builder().build();

        this.objectMapper = new ObjectMapper();
    }

    /*
     * ============================================================
     * GET COMPLETE ADDRESS BY PINCODE
     * ============================================================
     *
     * Flow:
     *
     * User selects pincode
     *        ↓
     * Frontend calls:
     * GET /api/location/pincode/{pincode}
     *        ↓
     * Spring Boot
     *        ↓
     * India Post API
     *        ↓
     * Country
     * State
     * District
     * City
     * Areas
     *
     * These details are then automatically filled
     * in the frontend form.
     */
    @Override
    public PincodeResponse getAddressByPincode(String pincode) {

        if (pincode == null || !pincode.matches("\\d{6}")) {

            throw new IllegalArgumentException(
                    "Pincode must contain exactly 6 digits"
            );
        }

        try {

            String url = INDIA_POST_API + pincode;

            String response = restClient.get()
                    .uri(url)
                    .accept(MediaType.APPLICATION_JSON)
                    .retrieve()
                    .body(String.class);

            JsonNode root = objectMapper.readTree(response);

            if (!root.isArray() || root.isEmpty()) {

                throw new IllegalArgumentException(
                        "No address found for pincode: " + pincode
                );
            }

            JsonNode firstResult = root.get(0);

            String status =
                    firstResult.path("Status").asText();

            if (!"Success".equalsIgnoreCase(status)) {

                throw new IllegalArgumentException(
                        "Invalid pincode: " + pincode
                );
            }

            JsonNode postOffices =
                    firstResult.path("PostOffice");

            if (!postOffices.isArray()
                    || postOffices.isEmpty()) {

                throw new IllegalArgumentException(
                        "No post office data found for pincode: "
                                + pincode
                );
            }

            JsonNode firstOffice =
                    postOffices.get(0);

            PincodeResponse result =
                    new PincodeResponse();

            /*
             * Pincode
             */
            result.setPincode(pincode);

            /*
             * Country
             */
            result.setCountry("India");

            /*
             * State
             */
            result.setState(
                    firstOffice.path("State").asText(null)
            );

            /*
             * District
             */
            result.setDistrict(
                    firstOffice.path("District").asText(null)
            );

            /*
             * City
             *
             * India Post provides Division in this response.
             *
             * We keep your existing mapping here.
             */
            result.setCity(
                    firstOffice.path("Division").asText(null)
            );

            /*
             * Areas / Post Offices
             *
             * One pincode can contain multiple
             * post offices.
             */
            List<String> areas =
                    new ArrayList<>();

            for (JsonNode office : postOffices) {

                String name =
                        office.path("Name").asText(null);

                if (name != null && !name.isBlank()) {

                    areas.add(name);
                }
            }

            result.setAreas(areas);

            return result;

        } catch (IllegalArgumentException ex) {

            throw ex;

        } catch (Exception ex) {

            throw new RuntimeException(
                    "Failed to fetch address for pincode: "
                            + pincode,
                    ex
            );
        }
    }

    /*
     * ============================================================
     * PINCODE SEARCH / AUTOCOMPLETE
     * ============================================================
     *
     * Flow:
     *
     * User types:
     * 523
     *        ↓
     * PincodeAPI.in
     *        ↓
     * Unique pincode suggestions
     *
     * IMPORTANT:
     *
     * This method does NOT try to fill city or area.
     *
     * It only helps the user find/select a pincode.
     *
     * After selecting the pincode,
     * getAddressByPincode() is called.
     */
    @Override
    public List<PincodeSuggestionResponse> searchPincodes(
            String prefix) {

        if (prefix == null || prefix.isBlank()) {

            throw new IllegalArgumentException(
                    "Pincode prefix cannot be empty"
            );
        }

        if (!prefix.matches("\\d+")) {

            throw new IllegalArgumentException(
                    "Pincode prefix must contain only digits"
            );
        }

        if (prefix.length() < 3
                || prefix.length() > 6) {

            throw new IllegalArgumentException(
                    "Pincode prefix must contain between 3 and 6 digits"
            );
        }

        try {

            String response =
                    restClient.get()
                            .uri(uriBuilder ->
                                    uriBuilder
                                            .scheme("https")
                                            .host("api.pincodeapi.in")
                                            .path("/api/v1/search")
                                            .queryParam(
                                                    "q",
                                                    prefix
                                            )
                                            .queryParam(
                                                    "limit",
                                                    50
                                            )
                                            .queryParam(
                                                    "offset",
                                                    0
                                            )
                                            .build()
                            )
                            .accept(MediaType.APPLICATION_JSON)
                            .retrieve()
                            .body(String.class);

            JsonNode root =
                    objectMapper.readTree(response);

            boolean success =
                    root.path("success")
                            .asBoolean(false);

            if (!success) {

                throw new RuntimeException(
                        "PincodeAPI.in search failed"
                );
            }

            JsonNode postOffices =
                    root.path("data")
                            .path("post_offices");

            List<PincodeSuggestionResponse> suggestions =
                    new ArrayList<>();

            if (!postOffices.isArray()) {

                return suggestions;
            }

            /*
             * PincodeAPI can return multiple post-office
             * records for the same pincode.
             *
             * Therefore we keep track of the pincodes
             * already added to the response.
             */
            Set<String> addedPincodes =
                    new HashSet<>();

            for (JsonNode office : postOffices) {

                String pincode =
                        office.path("pincode")
                                .asText(null);

                /*
                 * Ignore invalid pincode values.
                 */
                if (pincode == null
                        || !pincode.startsWith(prefix)) {

                    continue;
                }

                /*
                 * Ignore duplicate pincodes.
                 */
                if (!addedPincodes.add(pincode)) {

                    continue;
                }

                String district =
                        office.path("district")
                                .asText(null);

                String state =
                        office.path("state")
                                .asText(null);

                /*
                 * Search response only contains:
                 *
                 * Pincode
                 * District
                 * State
                 *
                 * We intentionally do not use "division"
                 * as city.
                 */
                suggestions.add(
                        new PincodeSuggestionResponse(
                                pincode,
                                district,
                                state
                        )
                );

                /*
                 * Return maximum 10 suggestions.
                 */
                if (suggestions.size() >= 10) {

                    break;
                }
            }

            return suggestions;

        } catch (Exception ex) {

            throw new RuntimeException(
                    "Failed to search pincode prefix: "
                            + prefix,
                    ex
            );
        }
    }

    /*
     * ============================================================
     * CURRENT LOCATION / REVERSE GEOCODING
     * ============================================================
     *
     * Flow:
     *
     * Browser gets latitude + longitude
     *        ↓
     * Nominatim
     *        ↓
     * Address details
     *
     * This is completely separate from pincode search.
     */
    @Override
    public ReverseGeocodeResponse reverseGeocode(
            double latitude,
            double longitude) {

        if (latitude < -90
                || latitude > 90) {

            throw new IllegalArgumentException(
                    "Invalid latitude"
            );
        }

        if (longitude < -180
                || longitude > 180) {

            throw new IllegalArgumentException(
                    "Invalid longitude"
            );
        }

        try {

            String response =
                    restClient.get()
                            .uri(uriBuilder ->
                                    uriBuilder
                                            .scheme("https")
                                            .host(
                                                    "nominatim.openstreetmap.org"
                                            )
                                            .path("/reverse")
                                            .queryParam(
                                                    "lat",
                                                    latitude
                                            )
                                            .queryParam(
                                                    "lon",
                                                    longitude
                                            )
                                            .queryParam(
                                                    "format",
                                                    "json"
                                            )
                                            .queryParam(
                                                    "addressdetails",
                                                    1
                                            )
                                            .build()
                            )
                            .header(
                                    "User-Agent",
                                    "AI-Smart-Rental-Property-Management-System"
                            )
                            .accept(
                                    MediaType.APPLICATION_JSON
                            )
                            .retrieve()
                            .body(String.class);

            JsonNode root =
                    objectMapper.readTree(response);

            JsonNode address =
                    root.path("address");

            ReverseGeocodeResponse result =
                    new ReverseGeocodeResponse();

            result.setAddressLine1(
                    buildAddressLine(address)
            );

            result.setArea(
                    firstNonBlank(
                            address.path("suburb")
                                    .asText(null),

                            address.path("neighbourhood")
                                    .asText(null),

                            address.path("village")
                                    .asText(null)
                    )
            );

            result.setDistrict(
                    firstNonBlank(
                            address.path("county")
                                    .asText(null),

                            address.path("district")
                                    .asText(null)
                    )
            );

            result.setCity(
                    firstNonBlank(
                            address.path("city")
                                    .asText(null),

                            address.path("town")
                                    .asText(null),

                            address.path("municipality")
                                    .asText(null)
                    )
            );

            result.setState(
                    address.path("state")
                            .asText(null)
            );

            result.setCountry(
                    address.path("country")
                            .asText(null)
            );

            result.setPincode(
                    address.path("postcode")
                            .asText(null)
            );

            return result;

        } catch (Exception ex) {

            throw new RuntimeException(
                    "Failed to reverse geocode location",
                    ex
            );
        }
    }

    /*
     * ============================================================
     * BUILD ADDRESS LINE
     * ============================================================
     */
    private String buildAddressLine(
            JsonNode address) {

        List<String> parts =
                new ArrayList<>();

        String houseNumber =
                address.path("house_number")
                        .asText(null);

        String road =
                address.path("road")
                        .asText(null);

        if (houseNumber != null
                && !houseNumber.isBlank()) {

            parts.add(houseNumber);
        }

        if (road != null
                && !road.isBlank()) {

            parts.add(road);
        }

        return String.join(", ", parts);
    }

    /*
     * ============================================================
     * FIRST NON-BLANK VALUE
     * ============================================================
     */
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

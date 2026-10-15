
package com.rental.rental_management_backend.location.dto;

public class PincodeSuggestionResponse {

    private String pincode;

    private String district;

    private String state;

    public PincodeSuggestionResponse() {

    }

    public PincodeSuggestionResponse(
            String pincode,
            String district,
            String state) {

        this.pincode = pincode;

        this.district = district;

        this.state = state;
    }

    public String getPincode() {

        return pincode;
    }

    public void setPincode(String pincode) {

        this.pincode = pincode;
    }

    public String getDistrict() {

        return district;
    }

    public void setDistrict(String district) {

        this.district = district;
    }

    public String getState() {

        return state;
    }

    public void setState(String state) {

        this.state = state;
    }
}

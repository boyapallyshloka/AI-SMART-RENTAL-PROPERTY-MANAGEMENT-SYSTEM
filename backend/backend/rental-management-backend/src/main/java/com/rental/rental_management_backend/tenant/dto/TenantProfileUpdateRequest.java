package com.rental.rental_management_backend.tenant.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Size;

public class TenantProfileUpdateRequest {

    // =========================================================
    // PERSONAL DETAILS
    // =========================================================

    private LocalDate dateOfBirth;

    @Size(
        max = 20,
        message = "Alternate phone cannot exceed 20 characters"
    )
    private String alternatePhone;

    // =========================================================
    // PROFESSIONAL DETAILS
    // =========================================================

    @Size(
        max = 100,
        message = "Occupation cannot exceed 100 characters"
    )
    private String occupation;

    @Size(
        max = 150,
        message = "Company name cannot exceed 150 characters"
    )
    private String companyName;

    @DecimalMin(
        value = "0.0",
        message = "Monthly income cannot be negative"
    )
    private BigDecimal monthlyIncome;

    // =========================================================
    // EMERGENCY CONTACT
    // =========================================================

    @Size(
        max = 100,
        message = "Emergency contact name cannot exceed 100 characters"
    )
    private String emergencyContactName;

    @Size(
        max = 20,
        message = "Emergency contact phone cannot exceed 20 characters"
    )
    private String emergencyContactPhone;

    // =========================================================
    // CURRENT ADDRESS
    // =========================================================

    @Size(
        max = 500,
        message = "Current address cannot exceed 500 characters"
    )
    private String currentAddress;

    @Size(
        max = 100,
        message = "City cannot exceed 100 characters"
    )
    private String city;

    @Size(
        max = 100,
        message = "State cannot exceed 100 characters"
    )
    private String state;

    @Size(
        max = 20,
        message = "Pincode cannot exceed 20 characters"
    )
    private String pincode;

    // =========================================================
    // CONSTRUCTOR
    // =========================================================

    public TenantProfileUpdateRequest() {
    }

    // =========================================================
    // GETTERS AND SETTERS
    // =========================================================

    public LocalDate getDateOfBirth() {
        return dateOfBirth;
    }

    public void setDateOfBirth(LocalDate dateOfBirth) {
        this.dateOfBirth = dateOfBirth;
    }

    public String getAlternatePhone() {
        return alternatePhone;
    }

    public void setAlternatePhone(String alternatePhone) {
        this.alternatePhone = alternatePhone;
    }

    public String getOccupation() {
        return occupation;
    }

    public void setOccupation(String occupation) {
        this.occupation = occupation;
    }

    public String getCompanyName() {
        return companyName;
    }

    public void setCompanyName(String companyName) {
        this.companyName = companyName;
    }

    public BigDecimal getMonthlyIncome() {
        return monthlyIncome;
    }

    public void setMonthlyIncome(BigDecimal monthlyIncome) {
        this.monthlyIncome = monthlyIncome;
    }

    public String getEmergencyContactName() {
        return emergencyContactName;
    }

    public void setEmergencyContactName(String emergencyContactName) {
        this.emergencyContactName = emergencyContactName;
    }

    public String getEmergencyContactPhone() {
        return emergencyContactPhone;
    }

    public void setEmergencyContactPhone(String emergencyContactPhone) {
        this.emergencyContactPhone = emergencyContactPhone;
    }

    public String getCurrentAddress() {
        return currentAddress;
    }

    public void setCurrentAddress(String currentAddress) {
        this.currentAddress = currentAddress;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public String getState() {
        return state;
    }

    public void setState(String state) {
        this.state = state;
    }

    public String getPincode() {
        return pincode;
    }

    public void setPincode(String pincode) {
        this.pincode = pincode;
    }
}
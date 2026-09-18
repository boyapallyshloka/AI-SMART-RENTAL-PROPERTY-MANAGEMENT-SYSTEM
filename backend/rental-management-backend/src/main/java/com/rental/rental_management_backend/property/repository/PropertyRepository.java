package com.rental.rental_management_backend.property.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.rental.rental_management_backend.User.entity.User;
import com.rental.rental_management_backend.property.entity.Property;
import com.rental.rental_management_backend.property.entity.PropertyManager;
import com.rental.rental_management_backend.property.enums.FurnishingStatus;
import com.rental.rental_management_backend.property.enums.PropertyStatus;
import com.rental.rental_management_backend.property.enums.PropertyType;

public interface PropertyRepository extends JpaRepository<Property, Long> {

    List<Property> findByOwner(User owner);

    Optional<Property> findByPropertyIdAndOwner(
            Long propertyId,
            User owner
    );

    List<Property> findByStatus(PropertyStatus status);

    List<Property> findByPropertyManager(PropertyManager propertyManager);

    // Get all properties assigned using PropertyManager ID
    List<Property> findByPropertyManager_PropertyManagerId(
            Long propertyManagerId
    );

    /*
     * Tenant property search/filter
     *
     * Searches only AVAILABLE properties.
     *
     * Property-level filters:
     * - property name
     * - area
     * - city
     * - state
     * - address
     * - property type
     * - furnishing status
     * - parking
     *
     * Unit-level filters:
     * - minimum rent
     * - maximum rent
     * - bedrooms
     *
     * All unit-level filters are applied
     * to the SAME vacant unit.
     */
    @Query("""
        SELECT DISTINCT p
        FROM Property p
        WHERE p.status = :status

        AND (
            COALESCE(:searchQuery, '') = ''
            OR LOWER(p.propertyName)
                LIKE LOWER(CONCAT('%', COALESCE(:searchQuery, ''), '%'))

            OR EXISTS (
                SELECT a.addressId
                FROM PropertyAddress a
                WHERE a.property = p
                AND (
                    LOWER(a.area)
                        LIKE LOWER(CONCAT('%', COALESCE(:searchQuery, ''), '%'))

                    OR LOWER(a.city)
                        LIKE LOWER(CONCAT('%', COALESCE(:searchQuery, ''), '%'))

                    OR LOWER(a.state)
                        LIKE LOWER(CONCAT('%', COALESCE(:searchQuery, ''), '%'))

                    OR LOWER(a.addressLine1)
                        LIKE LOWER(CONCAT('%', COALESCE(:searchQuery, ''), '%'))
                )
            )
        )

        AND (
            COALESCE(:city, '') = ''
            OR EXISTS (
                SELECT a2.addressId
                FROM PropertyAddress a2
                WHERE a2.property = p
                AND LOWER(a2.city) = LOWER(COALESCE(:city, ''))
            )
        )

        AND (
            :propertyType IS NULL
            OR p.propertyType = :propertyType
        )

        AND (
            :furnishingStatus IS NULL
            OR p.furnishingStatus = :furnishingStatus
        )

        AND (
            :parkingAvailable IS NULL
            OR p.parkingAvailable = :parkingAvailable
        )

        AND (
            :minRent IS NULL
            AND :maxRent IS NULL
            AND :bedrooms IS NULL

            OR EXISTS (
                SELECT u.unitId
                FROM Unit u
                JOIN u.floor f
                JOIN f.building b

                WHERE b.property = p

                AND u.status =
                    com.rental.rental_management_backend.property.enums.UnitStatus.VACANT

                AND (
                    :minRent IS NULL
                    OR u.monthlyRent >= :minRent
                )

                AND (
                    :maxRent IS NULL
                    OR u.monthlyRent <= :maxRent
                )

                AND (
                    :bedrooms IS NULL
                    OR u.bedrooms = :bedrooms
                )
            )
        )
        """)
    List<Property> searchAvailableProperties(

            @Param("status")
            PropertyStatus status,

            @Param("searchQuery")
            String searchQuery,

            @Param("city")
            String city,

            @Param("propertyType")
            PropertyType propertyType,

            @Param("furnishingStatus")
            FurnishingStatus furnishingStatus,

            @Param("parkingAvailable")
            Boolean parkingAvailable,

            @Param("minRent")
            Double minRent,

            @Param("maxRent")
            Double maxRent,

            @Param("bedrooms")
            Integer bedrooms
    );
}
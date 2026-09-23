package com.rental.rental_management_backend.maintenance.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.rental.rental_management_backend.maintenance.entity.Equipment;

@Repository
public interface EquipmentRepository extends JpaRepository<Equipment, Long> {

    List<Equipment> findByProperty_PropertyId(Long propertyId);

    long countByProperty_PropertyId(Long propertyId);

    long countByProperty_PropertyIdAndIsCriticalTrue(Long propertyId);

    long countByProperty_PropertyIdAndNeedsAttentionTrue(Long propertyId);

    default List<Equipment> findByPropertyId(Long propertyId) {
        return findByProperty_PropertyId(propertyId);
    }

    default long countByPropertyId(Long propertyId) {
        return countByProperty_PropertyId(propertyId);
    }

    default long countByPropertyIdAndIsCriticalTrue(Long propertyId) {
        return countByProperty_PropertyIdAndIsCriticalTrue(propertyId);
    }

    default long countByPropertyIdAndNeedsAttentionTrue(Long propertyId) {
        return countByProperty_PropertyIdAndNeedsAttentionTrue(propertyId);
    }
}
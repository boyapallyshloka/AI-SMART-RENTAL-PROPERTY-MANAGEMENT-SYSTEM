package com.rental.rental_management_backend.maintenancewroker.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.rental.rental_management_backend.maintenancewroker.entity.MaintenanceWorker;

@Repository
public interface MaintenanceWorkerRepository
        extends JpaRepository<MaintenanceWorker, Long> {

}
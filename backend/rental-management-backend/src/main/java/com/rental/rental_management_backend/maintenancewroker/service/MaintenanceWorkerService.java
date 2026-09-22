package com.rental.rental_management_backend.maintenancewroker.service;

import java.util.List;

import com.rental.rental_management_backend.maintenancewroker.entity.MaintenanceWorker;

public interface MaintenanceWorkerService {

    MaintenanceWorker createWorker(MaintenanceWorker worker);

    List<MaintenanceWorker> getAllWorkers();

    MaintenanceWorker getWorkerById(Long workerId);

    MaintenanceWorker updateWorker(
            Long workerId,
            MaintenanceWorker worker);

    void deleteWorker(Long workerId);
}
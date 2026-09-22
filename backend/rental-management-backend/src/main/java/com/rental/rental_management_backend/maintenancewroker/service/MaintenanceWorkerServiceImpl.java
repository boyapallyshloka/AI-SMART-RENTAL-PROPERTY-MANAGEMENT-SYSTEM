package com.rental.rental_management_backend.maintenancewroker.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.rental.rental_management_backend.maintenancewroker.entity.MaintenanceWorker;
import com.rental.rental_management_backend.maintenancewroker.repository.MaintenanceWorkerRepository;

@Service
public class MaintenanceWorkerServiceImpl implements MaintenanceWorkerService {

    private final MaintenanceWorkerRepository repository;

    public MaintenanceWorkerServiceImpl(
            MaintenanceWorkerRepository repository) {
        this.repository = repository;
    }

    @Override
    public MaintenanceWorker createWorker(MaintenanceWorker worker) {
        return repository.save(worker);
    }

    @Override
    public List<MaintenanceWorker> getAllWorkers() {
        return repository.findAll();
    }

    @Override
    public MaintenanceWorker getWorkerById(Long workerId) {
        return repository.findById(workerId)
                .orElseThrow(() ->
                    new RuntimeException(
                        "Maintenance Worker not found with ID: " + workerId
                    )
                );
    }

    @Override
    public MaintenanceWorker updateWorker(
            Long workerId,
            MaintenanceWorker worker) {

        MaintenanceWorker existingWorker =
                repository.findById(workerId)
                .orElseThrow(() ->
                    new RuntimeException(
                        "Maintenance Worker not found with ID: " + workerId
                    )
                );

        existingWorker.setName(worker.getName());
        existingWorker.setPhone(worker.getPhone());
        existingWorker.setEmail(worker.getEmail());
        existingWorker.setSpecialization(
                worker.getSpecialization()
        );
        existingWorker.setAvailabilityStatus(
                worker.getAvailabilityStatus()
        );

        return repository.save(existingWorker);
    }

    @Override
    public void deleteWorker(Long workerId) {

        if (!repository.existsById(workerId)) {
            throw new RuntimeException(
                "Maintenance Worker not found with ID: " + workerId
            );
        }

        repository.deleteById(workerId);
    }
}
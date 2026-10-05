package com.rental.rental_management_backend.maintenance;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.List;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import com.rental.rental_management_backend.maintenance.entity.MaintenanceRequest;
import com.rental.rental_management_backend.maintenance.repository.MaintenanceRequestRepository;

@SpringBootTest
class MaintenanceRequestRepositoryIntegrationTest {

    @Autowired
    private MaintenanceRequestRepository maintenanceRequestRepository;

    @Test
    @DisplayName("Verify JPQL findByPropertyOwnerId(20L) executes successfully against DB")
    void testFindByPropertyOwnerIdAgainstDatabase() {
        List<MaintenanceRequest> requests = maintenanceRequestRepository.findByPropertyOwnerId(20L);
        assertNotNull(requests);

        // Every request returned must belong to a property owned by Owner 20
        for (MaintenanceRequest r : requests) {
            assertNotNull(r.getProperty());
            assertNotNull(r.getProperty().getOwner());
            org.junit.jupiter.api.Assertions.assertEquals(20L, r.getProperty().getOwner().getId());
        }

        // Must NOT contain properties 1, 2, 4, 11 (owned by user 4 and user 7)
        assertTrue(requests.stream().noneMatch(r -> r.getProperty().getPropertyId() == 1L));
        assertTrue(requests.stream().noneMatch(r -> r.getProperty().getPropertyId() == 2L));
        assertTrue(requests.stream().noneMatch(r -> r.getProperty().getPropertyId() == 4L));
        assertTrue(requests.stream().noneMatch(r -> r.getProperty().getPropertyId() == 11L));
    }

    @Test
    @DisplayName("Verify JPQL findByPropertyManagerUserId executes successfully against DB")
    void testFindByPropertyManagerUserIdAgainstDatabase() {
        List<MaintenanceRequest> requests = maintenanceRequestRepository.findByPropertyManagerUserId(999999L);
        assertNotNull(requests);
        assertTrue(requests.isEmpty());
    }
}

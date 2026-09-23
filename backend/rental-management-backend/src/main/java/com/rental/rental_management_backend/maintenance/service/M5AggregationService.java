package com.rental.rental_management_backend.maintenance.service;

import java.lang.reflect.Method;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.rental.rental_management_backend.maintenance.dto.M5PredictionRequest;
import com.rental.rental_management_backend.maintenance.entity.Equipment;
import com.rental.rental_management_backend.maintenance.entity.MaintenanceRequest;
import com.rental.rental_management_backend.maintenance.enums.MaintenanceStatus;
import com.rental.rental_management_backend.maintenance.repository.EquipmentRepository;
import com.rental.rental_management_backend.maintenance.repository.InspectionRepository;
import com.rental.rental_management_backend.maintenance.repository.MaintenanceRequestRepository;
import com.rental.rental_management_backend.property.entity.Property;
import com.rental.rental_management_backend.property.entity.Unit;
import com.rental.rental_management_backend.property.repository.AmenityRepository;

@Service
public class M5AggregationService {

    private final MaintenanceRequestRepository maintenanceRepo;
    private final EquipmentRepository equipmentRepo;
    private final InspectionRepository inspectionRepo;
    private final AmenityRepository amenityRepo;

    @Autowired
    public M5AggregationService(
            MaintenanceRequestRepository maintenanceRepo,
            EquipmentRepository equipmentRepo,
            InspectionRepository inspectionRepo,
            AmenityRepository amenityRepo) {
        this.maintenanceRepo = maintenanceRepo;
        this.equipmentRepo = equipmentRepo;
        this.inspectionRepo = inspectionRepo;
        this.amenityRepo = amenityRepo;
    }

    public M5PredictionRequest aggregate(Property property, Unit unit) {
        int currentYear = LocalDate.now().getYear();
        Long propertyId = (property != null && property.getPropertyId() != null) ? property.getPropertyId() : 0L;

        // 1. property_age_years
        double propertyAge = (property != null && property.getYearBuilt() != null)
                ? (double) (currentYear - property.getYearBuilt())
                : 0.0;

        // 2. size_sqft
        double sizeSqft = 0.0;
        if (unit != null) {
            Double unitArea = extractDouble(unit, "getAreaSqft", "getArea", "getSizeSqft");
            if (unitArea != null) {
                sizeSqft = unitArea;
            }
        }
        if (sizeSqft == 0.0 && property != null && property.getTotalArea() != null) {
            sizeSqft = ((Number) property.getTotalArea()).doubleValue();
        }

        // 3. bedrooms_bhk
        int bedroomsBhk = 1;
        if (unit != null) {
            Integer bhk = extractInteger(unit, "getBedrooms", "getBedroomsBhk", "getBhk");
            if (bhk != null) {
                bedroomsBhk = bhk;
            }
        }

        // 4. amenity_count
        int amenityCount = (int) amenityRepo.count();

        // 5. Fetch maintenance history (Safe ID lookup across getId() / getUnitId())
        Long unitId = null;
        if (unit != null) {
            unitId = extractLong(unit, "getUnitId", "getId");
        }

        List<MaintenanceRequest> requests;
        if (unitId != null) {
            requests = maintenanceRepo.findByUnit_UnitId(unitId);
        } else {
            requests = maintenanceRepo.findByProperty_PropertyId(propertyId);
        }

        int histCount = (requests != null) ? requests.size() : 0;

        // 6. maintenance_count_last_90d
        LocalDateTime ninetyDaysAgo = LocalDateTime.now().minusDays(90);
        int countLast90d = 0;
        if (requests != null) {
            countLast90d = (int) requests.stream()
                    .filter(r -> r.getRequestedDate() != null && r.getRequestedDate().isAfter(ninetyDaysAgo))
                    .count();
        }

        // 7. historical_maintenance_cost
        double totalCost = 0.0;
        if (requests != null) {
            totalCost = requests.stream()
                    .filter(r -> r.getCost() != null)
                    .mapToDouble(r -> ((Number) r.getCost()).doubleValue())
                    .sum();
        }

        // 8. historical_avg_cost
        double avgCost = histCount > 0 ? (totalCost / histCount) : 0.0;

        // 9. days_since_last_maintenance
        int daysSinceLast = 365;
        if (requests != null) {
            Optional<LocalDateTime> lastCompleted = requests.stream()
                    .filter(r -> r.getStatus() == MaintenanceStatus.COMPLETED && r.getCompletedDate() != null)
                    .map(MaintenanceRequest::getCompletedDate)
                    .max(LocalDateTime::compareTo);

            if (lastCompleted.isPresent()) {
                daysSinceLast = (int) ChronoUnit.DAYS.between(lastCompleted.get().toLocalDate(), LocalDate.now());
            }
        }

        // 10. dominant_issue_category
        String dominantCategory = "OTHER";
        if (requests != null && !requests.isEmpty()) {
            dominantCategory = requests.stream()
                    .filter(r -> r.getCategory() != null)
                    .collect(Collectors.groupingBy(r -> r.getCategory().name(), Collectors.counting()))
                    .entrySet().stream()
                    .max(Map.Entry.comparingByValue())
                    .map(Map.Entry::getKey)
                    .orElse("OTHER");
        }

        // 11. inspection_count
        int inspectionCount = (int) inspectionRepo.countByProperty_PropertyId(propertyId);

        // 12. needs_attention_count
        int eqAttention = (int) equipmentRepo.countByProperty_PropertyIdAndNeedsAttentionTrue(propertyId);
        int inspAttention = (int) inspectionRepo.countByProperty_PropertyIdAndHasIssuesRequiringAttentionTrue(propertyId);
        int needsAttentionCount = eqAttention + inspAttention;

        // 13. equipment_count
        List<Equipment> equipmentList = equipmentRepo.findByProperty_PropertyId(propertyId);
        int equipmentCount = (equipmentList != null) ? equipmentList.size() : 0;

        // 14. avg_equipment_age_years
        double avgEquipmentAge = propertyAge;
        if (equipmentList != null && !equipmentList.isEmpty()) {
            avgEquipmentAge = equipmentList.stream()
                    .filter(e -> e.getInstallationDate() != null)
                    .mapToDouble(e -> ChronoUnit.DAYS.between(e.getInstallationDate(), LocalDate.now()) / 365.25)
                    .average()
                    .orElse(propertyAge);
        }

        // 15. critical_equipment_count
        int criticalEquipmentCount = (int) equipmentRepo.countByProperty_PropertyIdAndIsCriticalTrue(propertyId);

        // 16. snapshot_month
        String snapshotMonth = YearMonth.now().toString();

        // Populate DTO
        M5PredictionRequest request = new M5PredictionRequest();
        request.setPropertyAgeYears(propertyAge);
        request.setSizeSqft(sizeSqft);
        request.setBedroomsBhk(bedroomsBhk);
        request.setAmenityCount(amenityCount);
        request.setHistoricalMaintenanceCount(histCount);
        request.setMaintenanceCountLast90d(countLast90d);
        request.setHistoricalMaintenanceCost(totalCost);
        request.setHistoricalAvgCost(avgCost);
        request.setDaysSinceLastMaintenance(daysSinceLast);
        request.setDominantIssueCategory(dominantCategory);
        request.setInspectionCount(inspectionCount);
        request.setNeedsAttentionCount(needsAttentionCount);
        request.setEquipmentCount(equipmentCount);
        request.setAvgEquipmentAgeYears(avgEquipmentAge);
        request.setCriticalEquipmentCount(criticalEquipmentCount);
        request.setSnapshotMonth(snapshotMonth);

        return request;
    }

    private Long extractLong(Object target, String... methodNames) {
        for (String mName : methodNames) {
            try {
                Method method = target.getClass().getMethod(mName);
                Object val = method.invoke(target);
                if (val != null) {
                    return ((Number) val).longValue();
                }
            } catch (Exception ignored) {
            }
        }
        return null;
    }

    private Double extractDouble(Object target, String... methodNames) {
        for (String mName : methodNames) {
            try {
                Method method = target.getClass().getMethod(mName);
                Object val = method.invoke(target);
                if (val != null) {
                    return ((Number) val).doubleValue();
                }
            } catch (Exception ignored) {
            }
        }
        return null;
    }

    private Integer extractInteger(Object target, String... methodNames) {
        for (String mName : methodNames) {
            try {
                Method method = target.getClass().getMethod(mName);
                Object val = method.invoke(target);
                if (val != null) {
                    return ((Number) val).intValue();
                }
            } catch (Exception ignored) {
            }
        }
        return null;
    }
}
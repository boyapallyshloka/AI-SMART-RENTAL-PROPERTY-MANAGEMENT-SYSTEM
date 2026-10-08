
package com.rental.rental_management_backend.rental.serviceImpl;

import java.time.LocalDate;
import java.util.List;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.rental.rental_management_backend.notification.enums.NotificationPriority;
import com.rental.rental_management_backend.notification.enums.NotificationType;
import com.rental.rental_management_backend.notification.repository.NotificationRepository;
import com.rental.rental_management_backend.notification.service.NotificationService;
import com.rental.rental_management_backend.rental.entity.RentalAgreement;
import com.rental.rental_management_backend.rental.enums.AgreementStatus;
import com.rental.rental_management_backend.rental.repository.RentalAgreementRepository;
import com.rental.rental_management_backend.rental.service.AgreementNotificationSchedulerService;

@Service
public class AgreementNotificationSchedulerServiceImpl
        implements AgreementNotificationSchedulerService {

    private final RentalAgreementRepository rentalAgreementRepository;
    private final NotificationRepository notificationRepository;
    private final NotificationService notificationService;

    public AgreementNotificationSchedulerServiceImpl(
            RentalAgreementRepository rentalAgreementRepository,
            NotificationRepository notificationRepository,
            NotificationService notificationService) {

        this.rentalAgreementRepository = rentalAgreementRepository;
        this.notificationRepository = notificationRepository;
        this.notificationService = notificationService;
    }

    @Override
    @Scheduled(cron = "0 0 9 * * *", zone = "Asia/Kolkata")
    @Transactional
    public void processAgreementExpiryNotifications() {

        LocalDate today = LocalDate.now();

        List<RentalAgreement> agreements =
                rentalAgreementRepository.findAll();

        for (RentalAgreement agreement : agreements) {

            if (agreement == null) {
                continue;
            }

            /*
             * Only ACTIVE agreements should receive
             * expiry notifications.
             */
            if (agreement.getStatus() != AgreementStatus.ACTIVE) {
                continue;
            }

            /*
             * End date is required.
             */
            if (agreement.getEndDate() == null) {
                continue;
            }

            /*
             * Notice period is required.
             */
            if (agreement.getNoticePeriodDays() == null) {
                continue;
            }

            /*
             * Ignore invalid negative notice periods.
             */
            if (agreement.getNoticePeriodDays() < 0) {
                continue;
            }

            /*
             * Example:
             *
             * End date = October 31
             * Notice period = 30 days
             *
             * Notification starts = October 1
             */
            LocalDate notificationStartDate =
                    agreement.getEndDate()
                            .minusDays(
                                    agreement.getNoticePeriodDays()
                            );

            /*
             * Do not notify before the notice period starts.
             */
            if (today.isBefore(notificationStartDate)) {
                continue;
            }

            /*
             * Do not notify after the agreement has expired.
             */
            if (today.isAfter(agreement.getEndDate())) {
                continue;
            }

            notifyTenantIfRequired(agreement);
        }
    }

    private void notifyTenantIfRequired(
            RentalAgreement agreement) {

        /*
         * Tenant is mandatory in RentalAgreement,
         * but keep this check for safety.
         */
        if (agreement.getTenant() == null) {
            return;
        }

        /*
         * Tenant has a direct User relationship.
         */
        if (agreement.getTenant().getUser() == null) {
            return;
        }

        Long tenantUserId =
                agreement.getTenant()
                        .getUser()
                        .getId();

        if (tenantUserId == null) {
            return;
        }

        Long agreementId = agreement.getAgreementId();

        if (agreementId == null) {
            return;
        }

        /*
         * Prevent duplicate notifications.
         *
         * The same tenant + agreement will receive
         * only one AGREEMENT_EXPIRING notification.
         */
        boolean alreadyNotified =
                notificationRepository
                        .existsByUser_IdAndTypeAndReferenceIdAndReferenceType(
                                tenantUserId,
                                NotificationType.AGREEMENT_EXPIRING,
                                agreementId,
                                "RENTAL_AGREEMENT"
                        );

        if (alreadyNotified) {
            return;
        }

        String message =
                "Your rental agreement will expire on "
                        + agreement.getEndDate()
                        + ". Please contact the property management team "
                        + "if you want to renew your agreement.";

        notificationService.notifyUser(
                tenantUserId,
                NotificationType.AGREEMENT_EXPIRING,
                NotificationPriority.HIGH,
                "Rental Agreement Expiring",
                message,
                agreementId,
                "RENTAL_AGREEMENT"
        );
    }
}

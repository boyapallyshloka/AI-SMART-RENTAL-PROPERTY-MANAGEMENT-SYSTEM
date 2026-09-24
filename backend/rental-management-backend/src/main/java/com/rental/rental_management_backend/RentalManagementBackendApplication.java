package com.rental.rental_management_backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;
@EnableScheduling
@SpringBootApplication
public class RentalManagementBackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(RentalManagementBackendApplication.class, args);
	}

}

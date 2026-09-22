package com.rental.rental_management_backend.User.security;

import java.io.IOException;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final CustomUserDetailsService userDetailsService;

    public JwtAuthenticationFilter(
            JwtService jwtService,
            CustomUserDetailsService userDetailsService) {

        this.jwtService = jwtService;
        this.userDetailsService = userDetailsService;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain)
            throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");

        String jwt = null;
        String userEmail = null;

        // ---------------------------------------------------------
        // READ JWT FROM AUTHORIZATION HEADER
        // ---------------------------------------------------------

        if (authHeader != null && authHeader.startsWith("Bearer ")) {

            jwt = authHeader.substring(7);

            try {

                userEmail = jwtService.extractUsername(jwt);

                System.out.println("=================================================");
                System.out.println("JWT EMAIL : " + userEmail);
                System.out.println("REQUEST   : " + request.getRequestURI());
                System.out.println("=================================================");

            } catch (Exception e) {

                System.out.println(
                        "Invalid JWT token: " + e.getMessage()
                );
            }
        }

        // ---------------------------------------------------------
        // LOAD USER AND SET AUTHENTICATION
        // ---------------------------------------------------------

        if (userEmail != null &&
                SecurityContextHolder.getContext().getAuthentication() == null) {

            try {

                UserDetails userDetails =
                        userDetailsService.loadUserByUsername(userEmail);

                if (jwtService.isTokenValid(jwt, userDetails)) {

                    UsernamePasswordAuthenticationToken authenticationToken =
                            new UsernamePasswordAuthenticationToken(
                                    userDetails,
                                    null,
                                    userDetails.getAuthorities()
                            );

                    authenticationToken.setDetails(
                            new WebAuthenticationDetailsSource()
                                    .buildDetails(request)
                    );

                    SecurityContextHolder
                            .getContext()
                            .setAuthentication(authenticationToken);

                    // -------------------------------------------------
                    // DEBUG - CHECK ACTUAL SPRING SECURITY AUTHORITY
                    // -------------------------------------------------

                    System.out.println(
                            "================================================="
                    );

                    System.out.println(
                            "AUTHENTICATED USER : "
                                    + userDetails.getUsername()
                    );

                    System.out.println(
                            "AUTHORITIES        : "
                                    + userDetails.getAuthorities()
                    );

                    System.out.println(
                            "AUTHENTICATION     : "
                                    + SecurityContextHolder
                                            .getContext()
                                            .getAuthentication()
                    );

                    System.out.println(
                            "================================================="
                    );

                } else {

                    System.out.println(
                            "JWT TOKEN IS NOT VALID"
                    );
                }

            } catch (Exception e) {

                System.out.println(
                        "JWT authentication failed: "
                                + e.getMessage()
                );
            }
        }

        filterChain.doFilter(request, response);
    }
}
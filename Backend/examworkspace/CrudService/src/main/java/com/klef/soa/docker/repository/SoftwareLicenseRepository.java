package com.klef.soa.docker.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.klef.soa.docker.entity.SoftwareLicense;

public interface SoftwareLicenseRepository
        extends JpaRepository<SoftwareLicense, Long> {
}

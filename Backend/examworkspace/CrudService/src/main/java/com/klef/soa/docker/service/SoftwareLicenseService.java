package com.klef.soa.docker.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.klef.soa.docker.entity.SoftwareLicense;
import com.klef.soa.docker.repository.SoftwareLicenseRepository;
import com.klef.soa.docker.service.impl.SoftwareLicenseServiceImpl;

@Service
public class SoftwareLicenseService implements SoftwareLicenseServiceImpl {

    @Autowired
    private SoftwareLicenseRepository repository;

    // CREATE
    @Override
    public SoftwareLicense addLicense(SoftwareLicense license) {
        return repository.save(license);
    }

    // READ ALL
    @Override
    public List<SoftwareLicense> displayAll() {
        return repository.findAll();
    }

    // READ BY ID
    @Override
    public SoftwareLicense getLicenseById(Long id) {
        return repository.findById(id)
                .orElseThrow(() ->
                    new RuntimeException("License not found with ID: " + id));
    }

    // UPDATE
    @Override
    public SoftwareLicense updateLicense(Long id, SoftwareLicense license) {
        SoftwareLicense existing = repository.findById(id)
                .orElseThrow(() ->
                    new RuntimeException("License not found with ID: " + id));

        existing.setLicenseKey(license.getLicenseKey());
        existing.setSoftwareName(license.getSoftwareName());
        existing.setExpiryDate(license.getExpiryDate());
        existing.setActive(license.isActive());

        return repository.save(existing);
    }

    // DELETE
    @Override
    public String deleteLicense(Long id) {
        if (repository.existsById(id)) {
            repository.deleteById(id);
            return "Software license deleted successfully!";
        }

        return "Software license not found with ID: " + id;
    }
}

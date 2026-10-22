package com.klef.soa.docker.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.klef.soa.docker.entity.SoftwareLicense;
import com.klef.soa.docker.service.impl.SoftwareLicenseServiceImpl;

@RestController
public class SoftwareLicenseController {

    @Autowired
    private SoftwareLicenseServiceImpl service;

    // ROOT
    @GetMapping("/")
    public String home() {
        return "Software License CRUD Service is running!";
    }

    // CREATE
    @PostMapping("/Add")
    public SoftwareLicense addLicense(
            @RequestBody SoftwareLicense license) {
        return service.addLicense(license);
    }

    // READ ALL
    @GetMapping("/DisplayAll")
    public List<SoftwareLicense> displayAll() {
        return service.displayAll();
    }

    // READ BY ID
    @GetMapping("/GetById/{id}")
    public SoftwareLicense getLicenseById(@PathVariable Long id) {
        return service.getLicenseById(id);
    }

    // UPDATE
    @PutMapping("/Update/{id}")
    public SoftwareLicense updateLicense(
            @PathVariable Long id,
            @RequestBody SoftwareLicense license) {
        return service.updateLicense(id, license);
    }

    // DELETE
    @DeleteMapping("/Delete/{id}")
    public String deleteLicense(@PathVariable Long id) {
        return service.deleteLicense(id);
    }
}

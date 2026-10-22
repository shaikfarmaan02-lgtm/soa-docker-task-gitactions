package com.klef.soa.docker.service.impl;

import java.util.List;
import com.klef.soa.docker.entity.SoftwareLicense;

public interface SoftwareLicenseServiceImpl {

    SoftwareLicense addLicense(SoftwareLicense license);

    List<SoftwareLicense> displayAll();

    SoftwareLicense getLicenseById(Long id);

    SoftwareLicense updateLicense(Long id, SoftwareLicense license);

    String deleteLicense(Long id);
}

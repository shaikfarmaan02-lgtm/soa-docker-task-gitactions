import { useEffect, useState } from 'react';
import api, { getApiErrorMessage } from './api.js';

const emptyForm = {
  licenseKey: '',
  softwareName: '',
  expiryDate: '',
  active: true,
};

function formatDate(value) {
  if (!value) {
    return '—';
  }

  const [year, month, day] = value.slice(0, 10).split('-').map(Number);
  if (!year || !month || !day) {
    return value;
  }

  return new Date(year, month - 1, day).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function getLicenseList(data) {
  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.content)) {
    return data.content;
  }

  throw new Error('The server response did not contain a license list.');
}

export default function App() {
  const [licenses, setLicenses] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [alert, setAlert] = useState(null);
  const [validated, setValidated] = useState(false);

  async function refreshLicenses() {
    setLoading(true);
    try {
      const response = await api.get('/DisplayAll');
      setLicenses(getLicenseList(response.data));
      setListError(null);
    } catch (error) {
      setListError(getApiErrorMessage(error));
      throw error;
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refreshLicenses().catch((error) => {
      setAlert({ type: 'danger', message: getApiErrorMessage(error) });
    });
  }, []);

  function handleInputChange(event) {
    const { name, value, checked, type } = event.target;
    setForm((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : value,
    }));
  }

  function resetForm() {
    setForm(emptyForm);
    setEditingId(null);
    setValidated(false);
  }

  function startEditing(license) {
    setEditingId(license.id);
    setForm({
      licenseKey: license.licenseKey || '',
      softwareName: license.softwareName || '',
      expiryDate: license.expiryDate ? license.expiryDate.slice(0, 10) : '',
      active: Boolean(license.active),
    });
    setValidated(false);
    setAlert(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const formElement = event.currentTarget;
    setValidated(true);
    setAlert(null);

    if (!formElement.checkValidity()) {
      return;
    }

    const payload = {
      licenseKey: form.licenseKey.trim(),
      softwareName: form.softwareName.trim(),
      expiryDate: form.expiryDate,
      active: form.active,
    };

    setSaving(true);
    try {
      if (editingId === null) {
        await api.post('/Add', payload);
      } else {
        await api.put(`/Update/${encodeURIComponent(editingId)}`, payload);
      }

      const action = editingId === null ? 'added' : 'updated';
      resetForm();
      try {
        await refreshLicenses();
        setAlert({ type: 'success', message: `License ${action} successfully.` });
      } catch (refreshError) {
        setAlert({
          type: 'warning',
          message: `License ${action}, but the table could not be refreshed: ${getApiErrorMessage(refreshError)}`,
        });
      }
    } catch (error) {
      setAlert({ type: 'danger', message: getApiErrorMessage(error) });
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(license) {
    if (!window.confirm(`Delete the license for "${license.softwareName}"? This cannot be undone.`)) {
      return;
    }

    setDeletingId(license.id);
    setAlert(null);
    try {
      await api.delete(`/Delete/${encodeURIComponent(license.id)}`);
      try {
        await refreshLicenses();
        setAlert({ type: 'success', message: 'License deleted successfully.' });
      } catch (refreshError) {
        setAlert({
          type: 'warning',
          message: `License deleted, but the table could not be refreshed: ${getApiErrorMessage(refreshError)}`,
        });
      }
    } catch (error) {
      setAlert({ type: 'danger', message: getApiErrorMessage(error) });
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="app-shell">
      <nav className="navbar navbar-expand-lg navbar-dark app-navbar">
        <div className="container">
          <a className="navbar-brand d-flex align-items-center gap-2" href="#">
            <span className="brand-mark" aria-hidden="true">L</span>
            <span>Software License Management</span>
          </a>
        </div>
      </nav>

      <main className="container py-4 py-lg-5">
        <header className="page-heading mb-4 mb-lg-5">
          <div>
            <p className="eyebrow mb-2">LICENSE ADMINISTRATION</p>
            <h1 className="h2 mb-2">Manage your software licenses</h1>
            <p className="text-secondary mb-0">
              Keep license keys, renewals, and active status in one place.
            </p>
          </div>
          <div className="license-count">
            <span className="count-number">{licenses.length}</span>
            <span className="count-label">licenses</span>
          </div>
        </header>

        {alert && (
          <div
            className={`alert alert-${alert.type} alert-dismissible fade show`}
            role="alert"
          >
            {alert.message}
            <button
              type="button"
              className="btn-close"
              aria-label="Close alert"
              onClick={() => setAlert(null)}
            />
          </div>
        )}

        <section className="card app-card mb-4" aria-labelledby="form-title">
          <div className="card-header">
            <div className="section-icon" aria-hidden="true">
              {editingId === null ? '+' : '↻'}
            </div>
            <div>
              <h2 id="form-title" className="h5 mb-1">
                {editingId === null ? 'Add Software License' : 'Edit Software License'}
              </h2>
              <p className="small text-secondary mb-0">
                {editingId === null
                  ? 'Enter the license details below to add a record.'
                  : 'Update the license details and save your changes.'}
              </p>
            </div>
          </div>

          <div className="card-body p-4">
            <form
              className={validated ? 'was-validated' : ''}
              onSubmit={handleSubmit}
              noValidate
            >
              <div className="row g-3">
                <div className="col-12 col-md-6 col-lg-4">
                  <label className="form-label" htmlFor="licenseKey">License Key</label>
                  <input
                    className="form-control"
                    id="licenseKey"
                    name="licenseKey"
                    type="text"
                    value={form.licenseKey}
                    onChange={handleInputChange}
                    placeholder="e.g. XXXX-1234-ABCD"
                    required
                    maxLength={255}
                  />
                  <div className="invalid-feedback">Please enter a license key.</div>
                </div>
                <div className="col-12 col-md-6 col-lg-4">
                  <label className="form-label" htmlFor="softwareName">Software Name</label>
                  <input
                    className="form-control"
                    id="softwareName"
                    name="softwareName"
                    type="text"
                    value={form.softwareName}
                    onChange={handleInputChange}
                    placeholder="e.g. Design Suite Pro"
                    required
                    maxLength={255}
                  />
                  <div className="invalid-feedback">Please enter a software name.</div>
                </div>
                <div className="col-12 col-md-6 col-lg-4">
                  <label className="form-label" htmlFor="expiryDate">Expiry Date</label>
                  <input
                    className="form-control"
                    id="expiryDate"
                    name="expiryDate"
                    type="date"
                    value={form.expiryDate}
                    onChange={handleInputChange}
                    required
                  />
                  <div className="invalid-feedback">Please select an expiry date.</div>
                </div>
                <div className="col-12 d-flex flex-wrap align-items-center justify-content-between gap-3 pt-1">
                  <div className="form-check form-switch">
                    <input
                      className="form-check-input"
                      id="active"
                      name="active"
                      type="checkbox"
                      role="switch"
                      checked={form.active}
                      onChange={handleInputChange}
                    />
                    <label className="form-check-label" htmlFor="active">Active</label>
                  </div>
                  <div className="d-flex gap-2">
                    {editingId !== null && (
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={() => {
                          resetForm();
                          setAlert(null);
                        }}
                        disabled={saving}
                      >
                        Cancel
                      </button>
                    )}
                    <button type="submit" className="btn btn-primary px-4" disabled={saving}>
                      {saving && (
                        <span
                          className="spinner-border spinner-border-sm me-2"
                          aria-hidden="true"
                        />
                      )}
                      {saving
                        ? 'Saving...'
                        : editingId === null
                          ? 'Add License'
                          : 'Update License'}
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </section>

        <section className="card app-card" aria-labelledby="licenses-title">
          <div className="card-header d-flex flex-wrap align-items-center justify-content-between gap-3">
            <div>
              <h2 id="licenses-title" className="h5 mb-1">All Licenses</h2>
              <p className="small text-secondary mb-0">Review and manage your license records.</p>
            </div>
            <button
              type="button"
              className="btn btn-sm btn-outline-secondary"
              onClick={() => {
                setAlert(null);
                refreshLicenses().catch((error) => {
                  setAlert({ type: 'danger', message: getApiErrorMessage(error) });
                });
              }}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" aria-hidden="true" />
                  Loading...
                </>
              ) : (
                'Refresh'
              )}
            </button>
          </div>

          {loading ? (
            <div className="loading-state" role="status">
              <span className="spinner-border text-primary" aria-hidden="true" />
              <span>Loading licenses...</span>
            </div>
          ) : listError && licenses.length === 0 ? (
            <div className="empty-state">
              <h3 className="h6 mb-2">Unable to load licenses</h3>
              <p className="text-secondary mb-0">{listError}</p>
            </div>
          ) : licenses.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon" aria-hidden="true">▤</div>
              <h3 className="h6 mb-2">No licenses yet</h3>
              <p className="text-secondary mb-0">
                Add your first software license using the form above.
              </p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table align-middle mb-0">
                <thead>
                  <tr>
                    <th scope="col">ID</th>
                    <th scope="col">License Key</th>
                    <th scope="col">Software Name</th>
                    <th scope="col">Expiry Date</th>
                    <th scope="col">Status</th>
                    <th scope="col" className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {licenses.map((license) => (
                    <tr key={license.id}>
                      <td className="text-secondary">{license.id}</td>
                      <td><span className="license-key">{license.licenseKey}</span></td>
                      <td className="fw-medium">{license.softwareName}</td>
                      <td>{formatDate(license.expiryDate)}</td>
                      <td>
                        <span className={`status-badge ${license.active ? 'is-active' : 'is-inactive'}`}>
                          <span className="status-dot" aria-hidden="true" />
                          {license.active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>
                        <div className="d-flex justify-content-end gap-2">
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => startEditing(license)}
                            disabled={saving || deletingId !== null}
                            aria-label={`Edit license ${license.id}`}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleDelete(license)}
                            disabled={deletingId !== null || saving}
                            aria-label={`Delete license ${license.id}`}
                          >
                            {deletingId === license.id ? (
                              <span className="spinner-border spinner-border-sm" aria-label="Deleting" />
                            ) : (
                              'Delete'
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
        <footer className="text-center text-secondary small py-4">
          Software License Management
        </footer>
      </main>
    </div>
  );
}

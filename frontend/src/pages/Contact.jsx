import { useState } from "react";
import { api } from "../api.js";

const SERVICE_OPTIONS = [
  "Website Development",
  "Full-Stack Development",
  "App Development",
  "IT Services & Consulting",
  "Data Pipeline Engineering",
  "Data Analysis & BI",
  "Not sure yet",
];

const initialForm = {
  name: "",
  email: "",
  company: "",
  service: SERVICE_OPTIONS[0],
  message: "",
};

export default function Contact() {
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState(null); // { type: 'success' | 'error', message }
  const [submitting, setSubmitting] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setStatus(null);
    try {
      const res = await api.submitContact(form);
      setStatus({ type: "success", message: res.message });
      setForm(initialForm);
    } catch (err) {
      setStatus({
        type: "error",
        message:
          err.message ||
          "Something went wrong. Please try again, or email us directly.",
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <h1>Let's talk about your project</h1>
          <p>Tell us what you're building — we typically reply within 1 business day.</p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="contact-layout">
            <div className="contact-info-card">
              <h3>Contact details</h3>
              <div className="contact-info-row">
                <span className="label">Email</span>
                <span>alichalasathish50@gmail.com</span>
              </div>
              <div className="contact-info-row">
                <span className="label">Response time</span>
                <span>Within 1 business day</span>
              </div>
              <div className="contact-info-row">
                <span className="label">Free discovery call</span>
                <span>Available for all new projects</span>
              </div>
              <div className="contact-info-row">
                <span className="label">Services</span>
                <span>Web, full-stack &amp; app development, IT services, data pipelines &amp; analytics</span>
              </div>
            </div>

            <form className="form-card" onSubmit={handleSubmit}>
              <div className="form-row-2">
                <div className="form-group">
                  <label htmlFor="name">Full name</label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Jane Doe"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={form.email}
                    onChange={handleChange}
                    placeholder="jane@company.com"
                  />
                </div>
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label htmlFor="company">Company (optional)</label>
                  <input
                    id="company"
                    name="company"
                    type="text"
                    value={form.company}
                    onChange={handleChange}
                    placeholder="Company name"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="service">Service of interest</label>
                  <select id="service" name="service" value={form.service} onChange={handleChange}>
                    {SERVICE_OPTIONS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="message">Project details</label>
                <textarea
                  id="message"
                  name="message"
                  rows={6}
                  required
                  value={form.message}
                  onChange={handleChange}
                  placeholder="Tell us about your project, timeline, and budget..."
                />
              </div>

              <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
                {submitting ? "Sending…" : "Send Message"}
              </button>

              {status && (
                <div className={`form-status ${status.type}`}>{status.message}</div>
              )}
            </form>
          </div>
        </div>
      </section>
    </>
  );
}

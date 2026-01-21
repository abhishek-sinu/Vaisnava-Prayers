import React, { useRef, useState } from 'react';
import emailjs from 'emailjs-com';
import './ContactUs.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import qrPhonePe from './assets/phonepe-qr.jpg'; // Place your QR image in src/assets/ as phonepe-qr.jpg

const ContactUs = () => {
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [contact, setContact] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [lastCombinedMessage, setLastCombinedMessage] = useState("");
  const formRef = useRef();

  const SERVICE_ID = "service_wdoh0ry";
  const TEMPLATE_ID = "template_e3upcp7";
  const PUBLIC_KEY = "DPUFxxOM3f2oYWU8s";

  const handleSend = (e) => {
    e.preventDefault();
    setSending(true);
    setError("");
    setSent(false);
    const combinedMessage =
      `Name: ${name || "-"}\nContact: ${contact || "-"}\nMessage: ${message}`;
    emailjs.send(
      SERVICE_ID,
      TEMPLATE_ID,
      {
        message: combinedMessage,
        from_email: "spvyaspujabook.hyd@gmail.com"
      },
      PUBLIC_KEY
    )
      .then(() => {
        setSent(true);
        setShowModal(true);
        setLastCombinedMessage(combinedMessage);
        setName("");
        setMessage("");
        setContact("");
      })
      .catch((err) => {
        setError("Failed to send. Please try again later.");
      })
      .finally(() => setSending(false));
  };

  return (
    <div className="contact-us-container" style={{background: 'linear-gradient(135deg, #f8fafc 60%, #e0e7ef 100%)', minHeight: '100vh', padding: '32px 0'}}>
      <div className="contact-card shadow-lg rounded-4 p-4" style={{maxWidth: 1100, margin: 'auto', background: 'rgba(255,255,255,0.97)'}}>
        <h1 className="mb-3 text-primary fw-bold" style={{letterSpacing: 1}}>Contact Us</h1>
        <p className="contact-description fs-5 mb-4" style={{color: '#444'}}>We value your feedback and suggestions! Please feel free to reach out to us at:</p>
        <a className="contact-email d-block mb-4 fw-semibold" style={{color: '#0d6efd'}} href="mailto:aparupagourangadas.hs@gmail.com">
          abhi.sinu.1@gmail.com
        </a>

        {/* Row for Donation and Feedback */}
        <div className="row g-4 align-items-start" style={{marginTop: 0, display: 'flex'}}>
          {/* Donation Section */}
          <div className="col-12 col-md-6 d-flex" style={{display: 'flex'}}>
            <div className="donation-section border rounded-4 p-4 flex-fill bg-light d-flex flex-column justify-content-between w-100 h-100" style={{boxShadow: '0 2px 12px #e0e7ef', minHeight: 420, height: '100%'}}>
              <div className="text-center mt-3">
                <img src={qrPhonePe} alt="PhonePe UPI QR" style={{width: 170, height: 170, borderRadius: 16, border: '2px solid #0d6efd', background: '#fff'}} />
                <div className="mt-2">
                  <span className="badge bg-primary fs-6">PhonePe UPI</span>
                </div>
                <div className="mt-1 text-secondary fw-semibold" style={{fontSize: '1rem'}}>Account Name: <span className="text-dark">Laxmi Priya Patra</span></div>
              </div>
              <div>
                <h2 className="text-success fw-bold mb-2" style={{fontSize: '1.5rem'}}>Support Our Service</h2>
                <p className="mb-2" style={{color: '#2d3a4a'}}>
                  Maintaining this website and acquiring a dedicated domain name involves ongoing costs. If you find value in our content and wish to help us grow, please consider making a small donation. Every contribution, no matter the amount, helps us keep this resource available and ad-free for everyone.<br/>
                  <span className="fw-semibold text-primary">Thank you for your support!</span>
                </p>
                <p className="mb-0 text-muted" style={{fontSize: '0.95rem'}}>Scan the QR code to donate any amount via PhonePe UPI.</p>
              </div>
            </div>
          </div>
          {/* Feedback Section */}
          <div className="col-12 col-md-6 d-flex align-items-start" style={{display: 'flex'}}>
            <div className="contact-feedback flex-fill bg-light rounded-4 p-4 d-flex flex-column justify-content-between w-100 h-100" style={{boxShadow: '0 2px 12px #e0e7ef', minHeight: 420, height: '100%', marginTop: 0, paddingTop: 0}}>
              <h2 className="mb-2 text-secondary text-center" style={{marginTop: 0, paddingTop: 0, lineHeight: 1.1}}>Send us your thoughts</h2>
              <form ref={formRef} onSubmit={handleSend} className="mt-0" style={{marginTop: 0, paddingTop: 0}}>
                <input
                  className="form-control mb-2"
                  type="text"
                  placeholder="Your name"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  disabled={sending}
                  maxLength={50}
                />
                <input
                  className="form-control mb-2"
                  type="text"
                  placeholder="Your contact details (email, phone, etc.)"
                  value={contact}
                  onChange={e => setContact(e.target.value)}
                  disabled={sending}
                  maxLength={100}
                />
                <textarea
                  className="contact-textarea form-control mb-2"
                  placeholder="Type your feedback or suggestion here..."
                  rows={5}
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  required
                  disabled={sending}
                ></textarea>
                <button
                  className="contact-send-btn btn btn-primary px-4 py-2 fw-semibold w-100"
                  type="submit"
                  disabled={sending || !message.trim()}
                >
                  {sending ? "Sending..." : sent ? "Sent!" : "Send"}
                </button>
              </form>
              {error && <p className="contact-note mt-2" style={{color: 'red'}}>{error}</p>}
            </div>
          </div>
        </div>
      </div>

      {/* Bootstrap Modal for Thank You */}
      {showModal && (
        <div className="modal fade show" style={{display: 'block'}} tabIndex="-1" role="dialog">
          <div className="modal-dialog modal-dialog-centered" role="document">
            <div className="modal-content">
              <div className="modal-header bg-success text-white">
                <h5 className="modal-title">Thank You!</h5>
                <button type="button" className="btn-close" aria-label="Close" onClick={() => setShowModal(false)} style={{filter: 'invert(1)'}}></button>
              </div>
              <div className="modal-body">
                <div className="d-flex flex-column align-items-center">
                  <svg width="64" height="64" fill="green" className="mb-3" viewBox="0 0 16 16"><path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM7 10.414l5.207-5.207-1.414-1.414L7 7.586 5.207 5.793 3.793 7.207 7 10.414z"/></svg>
                  <p className="fs-5 mb-0">Thank you for your feedback!</p>
                  <small className="text-muted">We appreciate your input and will review it soon.</small>
                  {lastCombinedMessage && (
                    <pre className="alert alert-light mt-3 w-100 text-center p-2" style={{whiteSpace: 'pre-wrap', wordBreak: 'break-word'}}>
                      {lastCombinedMessage}
                    </pre>
                  )}
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-success" onClick={() => setShowModal(false)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContactUs;

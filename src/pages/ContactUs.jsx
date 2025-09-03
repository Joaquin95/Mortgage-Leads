export default function ContactUs() {
  const email = "Texasmortgagelead@gmail.com";
  const phone = "(972) 275-6719";
  const facebookUrl = "https://www.facebook.com/profile.php?id=61579933152558";

  return (
    <div className="contact-wrapper">
      <div className="contact-card">
        <h2>Contact Us</h2>
        <p>Have questions? Reach out to us at</p>
        <p>
          Email: <a href={`mailto:${email}`}>{email}</a>
        </p>
        <p>
          Phone: <a href={`tel:${phone}`}>{phone}</a>
        </p>
        <a href={facebookUrl} target="_blank" rel="noopener noreferrer">
          <img src="/facebook.svg" alt="Facebook" width="20" height="20" />
          Connect with Us on Facebook
        </a>
      </div>
    </div>
  );
}

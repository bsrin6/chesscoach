# Contact form setup

The contact page is contact.html. All Contact Me and Contact Us links lead there.
The recipient defaults to uxdsrini@gmail.com. The handler uses PHPMailer via Gmail SMTP with STARTTLS on port 587.

1. Use PHP 8.1+ hosting with OpenSSL. GitHub Pages and the Python static preview cannot execute PHP.
2. Keep the included `PHPMailer-master` folder alongside `send-contact.php`. The handler loads its three required classes directly. Composer is not needed.
3. Set SMTP_USERNAME to uxdsrini@gmail.com and SMTP_PASSWORD to the Gmail app password in your hosting provider's private environment settings. Never place the password in HTML, JavaScript, Git, or a public .env file. This code reads server environment variables; it does not load .env files.
4. Set CONTACT_TO to change the recipient later. If changing the sender, update both SMTP_USERNAME and SMTP_PASSWORD.
5. Serve locally using `php -S 127.0.0.1:8767 -t .` with those environment variables set, or deploy to your PHP host over HTTPS.
6. Submit a test enquiry and verify receipt. Sending has not been tested in the current environment because PHP is unavailable.

Server validation, a honeypot, and a per-IP 60-second cooldown are included. For public launch, configure hosting-level rate limiting as well. The SMTP sender is fixed; the visitor's email is used only as Reply-To.

PHPMailer documentation: https://github.com/PHPMailer/PHPMailer

Local credentials are stored outside this website in ../.private/contact-smtp.php and are excluded from the ZIP. On hosting, use private environment variables or set CONTACT_CONFIG_PATH to a private PHP config file outside the document root returning username, password, and recipient keys. Never serve the parent workspace as the document root.

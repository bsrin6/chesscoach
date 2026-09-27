<?php
// Requires PHP 8.1+ and the bundled PHPMailer folder. Credentials are server environment variables.
declare(strict_types=1);
use PHPMailer\PHPMailer\PHPMailer;
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
function respond(int $code, string $message): never {
    http_response_code($code);
    echo json_encode(['message' => $message]);
    exit;
}
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Allow: POST');
    respond(405, 'Please submit the contact form.');
}
if ((int)($_SERVER['CONTENT_LENGTH'] ?? 0) > 8192) respond(413, 'Submission is too large.');
function field(string $key): string {
    $value = $_POST[$key] ?? '';
    if (!is_string($value)) respond(422, 'Please check your contact details.');
    return trim($value);
}
$name = field('name'); $phone = field('phone'); $email = field('email');
if (field('website') !== '') respond(422, 'Unable to submit this enquiry.');
if ($name === '' || strlen($name) > 100 || preg_match('/[\x00-\x1F\x7F]/', $name)
    || !preg_match('/^[+0-9() .-]{7,30}$/D', $phone)
    || strlen(preg_replace('/\D/', '', $phone)) < 7
    || strlen($email) > 254 || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    respond(422, 'Please enter a valid name, phone number, and email address.');
}
// Per-IP cooldown with an atomic file lock, outside the public directory.
$ratePath = sys_get_temp_dir() . '/chess-contact-' . hash('sha256', __DIR__ . ($_SERVER['REMOTE_ADDR'] ?? 'unknown'));
$lock = fopen($ratePath, 'c+');
if (!$lock || !flock($lock, LOCK_EX)) respond(503, 'Please try again shortly.');
$last = (int)stream_get_contents($lock);
if (time() - $last < 60) {
    header('Retry-After: 60');
    respond(429, 'Please wait a minute before sending another enquiry.');
}
ftruncate($lock, 0); rewind($lock); fwrite($lock, (string)time());
flock($lock, LOCK_UN); fclose($lock);
// Optional private configuration lives outside the public website directory.
$configPath = getenv('CONTACT_CONFIG_PATH') ?: dirname(__DIR__) . '/.private/contact-smtp.php';
$config = is_file($configPath) ? require $configPath : [];
$password = getenv('SMTP_PASSWORD') ?: ($config['password'] ?? '');
$username = getenv('SMTP_USERNAME') ?: ($config['username'] ?? 'uxdsrini@gmail.com');
$recipient = getenv('CONTACT_TO') ?: ($config['recipient'] ?? 'uxdsrini@gmail.com');
if (!$password) {
    respond(503, 'Email is not configured yet. Please email uxdsrini@gmail.com.');
}
// Load the uploaded PHPMailer package directly; Composer is not required.
$library = __DIR__ . '/PHPMailer-master/src/';
foreach (['Exception.php', 'PHPMailer.php', 'SMTP.php'] as $file) {
    if (!is_file($library . $file)) {
        respond(503, 'Email service is unavailable. Please try again later.');
    }
    require_once $library . $file;
}
try {
    $mail = new PHPMailer(true);
    $mail->isSMTP();
    $mail->Host = 'smtp.gmail.com';
    $mail->SMTPAuth = true;
    $mail->Username = $username;
    $mail->Password = preg_replace('/\s+/', '', $password);
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
    $mail->Port = 587;
    $mail->Timeout = 20;
    $mail->CharSet = 'UTF-8';
    $mail->setFrom($username, 'Boyana Susishveer Website');
    $mail->addAddress($recipient);
    $mail->addReplyTo($email, $name);
    $mail->Subject = 'New chess coaching enquiry';
    $mail->Body = "New website enquiry\n\nName: {$name}\nPhone: {$phone}\nEmail: {$email}\n";
    $mail->send();
    respond(200, 'Thank you! Your enquiry has been sent. I will get back to you soon.');
} catch (Throwable $error) {
    respond(502, 'Your enquiry could not be sent. Please try again later or email uxdsrini@gmail.com.');
}

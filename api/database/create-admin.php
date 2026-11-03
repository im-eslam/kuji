<?php

if (PHP_SAPI !== 'cli') {
    http_response_code(404);
    exit;
}

require __DIR__ . '/../core/Autoload.php';
Autoload::register(__DIR__ . '/..');

Env::load(__DIR__ . '/../.env');
$config = require __DIR__ . '/../config.php';
$table  = Auth::settings($config)['table'];

$username = strtolower(trim($argv[1] ?? ''));
if (!Auth::usernameIsValid($config, $username)) {
    fwrite(STDERR, "Usage: php features/auth/create-admin.php <username>\n(3-50 chars: a-z 0-9 . _ -)\n");
    exit(1);
}

$tty  = function_exists('stream_isatty') && stream_isatty(STDIN);
$unix = DIRECTORY_SEPARATOR === '/';

function ask(string $label, bool $hide): string
{
    echo $label;
    if ($hide) {
        shell_exec('stty -echo');
    }
    $value = rtrim(fgets(STDIN) ?: '', "\r\n");
    if ($hide) {
        shell_exec('stty echo');
        echo "\n";
    }
    return $value;
}

if ($tty && !$unix) {
    echo "Note: on Windows the password is visible while you type. Clear the terminal afterwards.\n";
}
$hide     = $tty && $unix;
$password = ask('New password (min 10 chars): ', $hide);
$confirm  = ask('Repeat password: ', $hide);

if ($password !== $confirm) {
    fwrite(STDERR, "Passwords do not match.\n");
    exit(1);
}
if (!Auth::passwordIsValid($config, $password, $username)) {
    fwrite(STDERR, "Password must be 10-72 bytes long and different from the username.\n");
    exit(1);
}

$pdo  = Database::connect($config['db']);
$hash = password_hash($password, PASSWORD_DEFAULT);

$stmt = $pdo->prepare("SELECT id FROM $table WHERE username = ?");
$stmt->execute([$username]);

if ($stmt->fetch()) {
    $pdo->prepare("UPDATE $table SET password_hash = ? WHERE username = ?")->execute([$hash, $username]);
    echo "Password updated for '$username'. All existing sessions are now logged out.\n";
} else {
    $pdo->prepare("INSERT INTO $table (username, password_hash) VALUES (?, ?)")->execute([$username, $hash]);
    echo "Admin '$username' created.\n";
}

#!/usr/bin/env sh
set -e

if [ -z "$APP_KEY" ] || ! echo "$APP_KEY" | grep -q '^base64:'; then
  export APP_KEY="base64:$(php -r 'echo base64_encode(random_bytes(32));')"
fi

php artisan config:clear --no-interaction
php artisan migrate --force --no-interaction

php artisan serve --host=0.0.0.0 --port="${PORT:-8000}"

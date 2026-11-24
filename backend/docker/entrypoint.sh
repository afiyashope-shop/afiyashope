#!/bin/sh
set -eu

for module in mpm_event mpm_worker; do
    module_config="/etc/apache2/mods-enabled/${module}.load"
    if [ -e "$module_config" ]; then
        a2dismod "$module"
    fi
done

a2enmod mpm_prefork
apache2ctl configtest

port="${PORT:-8080}"

case "$port" in
    ''|*[!0-9]*)
        echo "PORT must be a numeric TCP port." >&2
        exit 1
        ;;
esac

sed -i "s|^Listen 80$|Listen ${port}|" /etc/apache2/ports.conf
sed -i "s|<VirtualHost \*:80>|<VirtualHost *:${port}>|" /etc/apache2/sites-available/000-default.conf

exec apache2-foreground

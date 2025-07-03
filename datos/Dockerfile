FROM php:8.3-apache

WORKDIR /var/www/html

RUN a2enmod rewrite \
    && apt-get update \
    && apt-get install -y wget zip git ca-certificates unzip \
    && docker-php-ext-install pdo pdo_mysql mysqli

# Instala Composer
RUN wget https://getcomposer.org/installer -O composer-setup.php \
    && php composer-setup.php --install-dir=/usr/local/bin --filename=composer \
    && rm composer-setup.php

# Copiar archivos relevantes
COPY ./datos/composer.json .
COPY ./datos/.htaccess .
COPY ./datos/.env .

# Instalar dependencias
RUN composer install
RUN composer dump-autoload

# Configurar Apache
RUN sed -i 's|DocumentRoot.*|DocumentRoot /var/www/html/public|' /etc/apache2/sites-enabled/000-default.conf

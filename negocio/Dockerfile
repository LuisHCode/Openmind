FROM php:8.2-apache

WORKDIR /var/www/html

ENV DEBIAN_FRONTEND=noninteractive

RUN a2enmod rewrite && \
    apt-get update && \
    apt-get install -y wget zip git ca-certificates unzip && \
    docker-php-ext-install pdo pdo_mysql mysqli

# Instalar Composer (sin validación por ahora)
RUN php -r "copy('https://getcomposer.org/installer', 'composer-setup.php');" && \
    php composer-setup.php --install-dir=/usr/local/bin --filename=composer && \
    rm composer-setup.php

COPY ./negocio/composer.json ./
COPY ./negocio/.htaccess ./

RUN composer install && composer dump-autoload

RUN sed -i 's|DocumentRoot.*|DocumentRoot /var/www/html/public|' /etc/apache2/sites-enabled/000-default.conf

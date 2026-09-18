FROM php:8.2-apache

# 1. Install system dependencies & PHP extensions: GD (WebP/JPEG/PNG/FreeType), PDO MySQL, and FTP
RUN apt-get update && apt-get install -y \
    libpng-dev \
    libjpeg-dev \
    libwebp-dev \
    libfreetype6-dev \
    && docker-php-ext-configure gd --with-freetype --with-jpeg --with-webp \
    && docker-php-ext-install gd pdo pdo_mysql ftp \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# 2. Enable Apache mod_rewrite and headers
RUN a2enmod rewrite headers

# 3. Allow .htaccess rewrite overrides
RUN sed -i '/<Directory \/var\/www\/>/,/<\/Directory>/ s/AllowOverride None/AllowOverride All/' /etc/apache2/apache2.conf

# 4. Configure PHP upload & memory limits for high-res WebP image processing
RUN echo "upload_max_filesize = 64M\npost_max_size = 64M\nmemory_limit = 256M\nmax_execution_time = 300" > /usr/local/etc/php/conf.d/uploads.ini

# 5. Set working directory and copy server source files
WORKDIR /var/www/html
COPY . /var/www/html/

# 6. Create temporary uploads folder and grant permissions to www-data
RUN mkdir -p /var/www/html/uploads \
    && chown -R www-data:www-data /var/www/html/uploads \
    && chmod -R 775 /var/www/html/uploads

EXPOSE 80

CMD ["apache2-foreground"]

# Use the official MySQL image version 8
FROM mysql:8

# Set environment variables for MySQL
ENV MYSQL_ROOT_PASSWORD="rootroot"
ENV MYSQL_DATABASE="db_se_thesismanagement"

# Copy the local initialization script volume to the container
COPY db-init.sql /docker-entrypoint-initdb.d

# Expose the port specified in the environment variable DB_PORT
EXPOSE 3307

# Run the MySQL server on container startup
CMD ["mysqld"]

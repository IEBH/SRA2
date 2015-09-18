# Config details
DB=sra
USER="apache"
PASS="asdf"
HOST="localhost"

database: database-clean
	@echo "Installing database schema..."
	mysql ${DB} <../database/Schema.sql

database-clean:
	@echo "Cleaning database [${DB}]..."
	mysql -e 'DROP DATABASE IF EXISTS ${DB}; CREATE DATABASE ${DB}'

database-install:
	@echo "Creating new database [${DB}]..."
	mysql -u root -e "CREATE DATABASE IF NOT EXISTS ${DB}"
	@echo "Adding user '${USER}@${HOST}' (with password)..."
	mysql -u root -e "GRANT ALL PRIVILEGES ON *.* TO '${USER}'@'${HOST}' IDENTIFIED BY '${PASS}'"

install: database-install database
	@echo "All done"

include .env
export

create-database:
	docker-compose exec -T sqlserver /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "$${DB_PASSWORD}" -C < data-generator/init-db.sql

db-healthcheck:
	docker-compose exec sqlserver /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "$${DB_PASSWORD}" -C -Q "SELECT name FROM sys.databases WHERE name = 'ClientsDB'"

restart-worker:
	docker-compose restart worker
	docker-compose logs -f worker

query-count:
	docker-compose exec sqlserver /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "$${DB_PASSWORD}" -C -Q "USE ClientsDB; SELECT COUNT(*) as TotalRecords FROM Clients"

query-sample:
	docker-compose exec sqlserver /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "$${DB_PASSWORD}" -C -Q "USE ClientsDB; SELECT TOP 10 * FROM Clients"
	
clean-database:
	docker-compose exec sqlserver /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "$${DB_PASSWORD}" -C -Q "USE ClientsDB; DELETE  FROM Clients"

sql-shell:
	docker-compose exec sqlserver /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "$${DB_PASSWORD}" -C

generate-file:
	cd data-generator && npx ts-node src/generateFile.ts

reset-all: clean-database generate-file restart-worker

up:
	docker-compose up -d

down:
	docker-compose down

down-volumes:
	docker-compose down -v

rebuild:
	docker-compose up -d --build

reset-full: down-volumes rebuild create-database restart-worker

logs:
	docker-compose logs --tail=100

logs-follow:
	docker-compose logs -f

status:
	docker-compose ps

-- Create database
IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'ClientsDB')
BEGIN
    CREATE DATABASE ClientsDB;
END
GO

-- Use the database
USE ClientsDB;
GO

-- Create table
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Clients')
BEGIN
    CREATE TABLE Clients (
        IdCliente INT IDENTITY(1,1) PRIMARY KEY,
        NombreCompleto NVARCHAR(100) NOT NULL,
        DNI BIGINT NOT NULL,
        Estado VARCHAR(10) NOT NULL,
        FechaIngreso DATE NOT NULL,
        EsPEP BIT NOT NULL,
        EsSujetoObligado BIT NULL,
        FechaCreacion DATETIME NOT NULL DEFAULT GETDATE()
    );
END
GO

PRINT 'Database and table setup complete!';
GO

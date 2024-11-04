-- create_tables.sql

-- Ensure you're using the correct database
USE rr;
GO

-- 1. Create Vendor Table
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Vendor' AND xtype='U')
BEGIN
    CREATE TABLE Vendor (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        Username NVARCHAR(50) NOT NULL UNIQUE,
        VendorName NVARCHAR(100) NOT NULL UNIQUE,
        Password NVARCHAR(255) NOT NULL,
        Email NVARCHAR(100) NOT NULL UNIQUE,
        ContactNumber NVARCHAR(20) NOT NULL UNIQUE,
        MongoId NVARCHAR(24) NOT NULL UNIQUE,
        CreatedAt DATETIME DEFAULT GETDATE(),
        UpdatedAt DATETIME DEFAULT GETDATE()
    );
    PRINT 'Vendor table created.';
END
ELSE
BEGIN
    PRINT 'Vendor table already exists. Skipping creation.';
END
GO

-- 2. Create User Table
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='User' AND xtype='U')
BEGIN
    CREATE TABLE [User] (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        Username NVARCHAR(50) NOT NULL UNIQUE,
        Password NVARCHAR(255) NOT NULL,
        Email NVARCHAR(100) NOT NULL UNIQUE,
        ContactNumber NVARCHAR(20) NOT NULL UNIQUE,
        Role NVARCHAR(20) NOT NULL,
        Status NVARCHAR(20) NOT NULL,
        MongoId NVARCHAR(24) NOT NULL UNIQUE,
        CreatedAt DATETIME DEFAULT GETDATE(),
        UpdatedAt DATETIME DEFAULT GETDATE()
    );
    PRINT 'User table created.';
END
ELSE
BEGIN
    PRINT 'User table already exists. Skipping creation.';
END
GO

-- 3. Create RFQ Table
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='RFQ' AND xtype='U')
BEGIN
    CREATE TABLE RFQ (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        RFQNumber NVARCHAR(50) NOT NULL UNIQUE,
        ShortName NVARCHAR(100),
        CompanyType NVARCHAR(100),
        SapOrder NVARCHAR(50),
        ItemType NVARCHAR(100),
        CustomerName NVARCHAR(200),
        OriginLocation NVARCHAR(100),
        DropLocationState NVARCHAR(100),
        DropLocationDistrict NVARCHAR(100),
        Address NVARCHAR(255) NOT NULL,
        Pincode NVARCHAR(6) NOT NULL,
        VehicleType NVARCHAR(100),
        AdditionalVehicleDetails NVARCHAR(255),
        NumberOfVehicles INT,
        Weight NVARCHAR(50),
        BudgetedPriceBySalesDept INT,
        MaxAllowablePrice INT,
        eReverseDate DATETIME NULL,
        eReverseTime NVARCHAR(10) NULL,
        VehiclePlacementBeginDate DATETIME NULL,
        VehiclePlacementEndDate DATETIME NULL,
        Status NVARCHAR(50) DEFAULT 'initial',
        InitialQuoteEndTime DATETIME NOT NULL,
        EvaluationEndTime DATETIME NOT NULL,
        FinalizeReason NVARCHAR(255) NULL,
        l1Price INT NULL,
        l1VendorId INT NULL,
        RFQClosingDate DATETIME NULL,
        RFQClosingTime NVARCHAR(10) NOT NULL,
        eReverseToggle BIT DEFAULT 0,
        rfqType NVARCHAR(50) DEFAULT 'D2D',
        CreatedAt DATETIME DEFAULT GETDATE(),
        UpdatedAt DATETIME DEFAULT GETDATE(),
        MongoId NVARCHAR(24) NOT NULL UNIQUE,
        FOREIGN KEY (l1VendorId) REFERENCES Vendor(Id)
    );
    PRINT 'RFQ table created.';
END
ELSE
BEGIN
    PRINT 'RFQ table already exists. Skipping creation.';
END
GO

-- 4. Create Quote Table
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Quote' AND xtype='U')
BEGIN
    CREATE TABLE Quote (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        RFQId INT NOT NULL,
        VendorName NVARCHAR(100) NOT NULL,
        Price INT NOT NULL,
        Message NVARCHAR(500) NULL,
        NumberOfTrucks INT NOT NULL,
        ValidityPeriod NVARCHAR(50) NULL,
        Label NVARCHAR(10) NULL,
        TrucksAllotted INT DEFAULT 0,
        NumberOfVehiclesPerDay INT NOT NULL,
        CreatedAt DATETIME DEFAULT GETDATE(),
        UpdatedAt DATETIME DEFAULT GETDATE(),
        MongoId NVARCHAR(24) NOT NULL UNIQUE,
        FOREIGN KEY (RFQId) REFERENCES RFQ(Id)
    );
    PRINT 'Quote table created.';
END
ELSE
BEGIN
    PRINT 'Quote table already exists. Skipping creation.';
END
GO

-- 5. Create Verification Table
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Verification' AND xtype='U')
BEGIN
    CREATE TABLE Verification (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        Email NVARCHAR(100) NOT NULL,
        OTP NVARCHAR(10) NOT NULL,
        CreatedAt DATETIME DEFAULT GETDATE(),
        MongoId NVARCHAR(24) NOT NULL UNIQUE
    );
    PRINT 'Verification table created.';
END
ELSE
BEGIN
    PRINT 'Verification table already exists. Skipping creation.';
END
GO

-- 6. Create RFQ_SelectedVendors Table
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='RFQ_SelectedVendors' AND xtype='U')
BEGIN
    CREATE TABLE RFQ_SelectedVendors (
        RFQId INT NOT NULL,
        VendorId INT NOT NULL,
        PRIMARY KEY (RFQId, VendorId),
        FOREIGN KEY (RFQId) REFERENCES RFQ(Id),
        FOREIGN KEY (VendorId) REFERENCES Vendor(Id)
    );
    PRINT 'RFQ_SelectedVendors table created.';
END
ELSE
BEGIN
    PRINT 'RFQ_SelectedVendors table already exists. Skipping creation.';
END
GO

-- 7. Create RFQ_VendorActions Table
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='RFQ_VendorActions' AND xtype='U')
BEGIN
    CREATE TABLE RFQ_VendorActions (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        RFQId INT NOT NULL,
        Action NVARCHAR(50) NOT NULL,
        VendorId INT NOT NULL,
        Timestamp DATETIME DEFAULT GETDATE(),
        MongoId NVARCHAR(24) NOT NULL UNIQUE,
        FOREIGN KEY (RFQId) REFERENCES RFQ(Id),
        FOREIGN KEY (VendorId) REFERENCES Vendor(Id)
    );
    PRINT 'RFQ_VendorActions table created.';
END
ELSE
BEGIN
    PRINT 'RFQ_VendorActions table already exists. Skipping creation.';
END
GO
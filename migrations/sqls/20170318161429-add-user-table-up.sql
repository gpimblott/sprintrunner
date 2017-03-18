CREATE TABLE IF NOT EXISTS users(
    id SERIAL PRIMARY KEY,
    firstName VARCHAR(30),
    surname VARCHAR(50),
    googleId VARCHAR(50),
    fullName VARCHAR(50),
    email VARCHAR(50),
    picture VARCHAR(100),
    gender VARCHAR(10),
    googleToken VARCHAR(100),
    admin boolean default false );
CREATE TABLE IF NOT EXISTS users(
    id SERIAL PRIMARY KEY,
    firstName VARCHAR(50),
    surname VARCHAR(50),
    googleId text,
    fullName VARCHAR(100),
    email VARCHAR(100),
    picture VARCHAR(150),
    gender VARCHAR(10),
    googleToken text,
    admin boolean default false );
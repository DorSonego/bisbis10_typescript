
CREATE TABLE restaurants (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    isKosher BOOLEAN NOT NULL,
    averageRating DECIMAL(2, 1) NOT NULL,
    cuisines VARCHAR(255)[] NOT NULL,
    UNIQUE (name)
);

CREATE TABLE ratings (
    id SERIAL PRIMARY KEY,
    restaurantId INT NULL REFERENCES restaurants(id),
    rating DECIMAL(2, 1) NOT NULL
);
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    restaurantId INT NOT NULL REFERENCES restaurants(id),
    orderItems JSONB NOT NULL
);
CREATE TABLE dishes (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    price DECIMAL(5, 2) NOT NULL,
    restaurantId INT NULL REFERENCES restaurants(id),
    UNIQUE (restaurantId, name)
);
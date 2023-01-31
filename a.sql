CREATE TABLE IF NOT EXISTS "orders" (
    id UUID NOT NULL PRIMARY KEY,
    external_id INTEGER,
    couirier_id UUID,
    product_id UUID,
    creator_id UUID,
    customer_id UUID,
    price DECIMAL(16,2)
);


CREATE TABLE  IF NOT EXISTS "users" (
    id UUID NOT NULL PRIMARY KEY,
    name VARCHAR(256),
    phone VARCHAR(64)
);

CREATE TABLE IF NOT EXISTS "couirier" (
    id UUID NOT NULL PRIMARY KEY,
    name VARCHAR(256),
    phone VARCHAR(64)
);


CREATE TABLE  IF NOT EXISTS "catalog" (
    id UUID NOT NULL PRIMARY KEY,
    name VARCHAR(256),
    price DECIMAL(16,2)
);
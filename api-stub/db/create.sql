CREATE USER rmaddin WITH PASSWORD '123456';
CREATE DATABASE middlewaredb;
GRANT ALL PRIVILEGES ON DATABASE "middlewaredb" to rmaddin;
\c middlewaredb
	
CREATE TABLE "managers"
(
    id serial,
    name varchar(256) NOT NULL,
    password varchar(256) NOT NULL,
    email varchar(256) NOT NULL,
	user_token varchar(256) NOT NULL,
	allow_update_orders BOOLEAN NOT NULL,
	userType INTEGER NOT NULL,
	CONSTRAINT managers_primary_key PRIMARY KEY (id)
);

CREATE TABLE "orders"
(
    id serial,
	user_token varchar(256) NOT NULL,
	parseketable varchar(256),
	isin varchar(256),
	op_type varchar(256),
	limit_price varchar(256),
	tif varchar(256),
	gtd varchar(256),
	instructions varchar(256),
	security_name varchar(256),
	side varchar(256),
	filled_name varchar(256),
	working varchar(256),
	amnt_left varchar(256),
	pct_left varchar(256),
	status varchar(256),
	portfolio_manager varchar(256),
	trader_name varchar(256),
	order_date varchar(256),
	order_creation varchar(256),
	last_touched varchar(256),
	ts_order_date varchar(256),
	settle_date varchar(256),
	security_id varchar(256),
	order_number varchar(256),
	ticket_number varchar(256),
	order_id varchar(256),
	asset_type varchar(256),
	CONSTRAINT orders_primary_key PRIMARY KEY (id)
);

CREATE TABLE "allocations" 
(
    order_id serial,
    user_token varchar(256) NOT NULL,
    account varchar(256),
    amount_ordered varchar(256),
    broker_name varchar(256),
    average_price varchar(256),
    id int NOT NULL,
    PRIMARY KEY (order_id),
    FOREIGN KEY (id) REFERENCES orders(id)
    	match full
    	on delete cascade
    	on update restrict
);

GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO rmaddin;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO rmaddin;

INSERT INTO public.managers(
	name, password, email, user_token, allow_update_orders, userType)
	VALUES ('admin', 'admin', 'razoulay@ffstrategies.net', '66B3B68E-84B2-4F96-984B-8F9C81A90BCA', True, 1);
	
INSERT INTO public.managers(
	name, password, email, user_token, allow_update_orders, userType)
	VALUES ('test', 'test', 'razoulay@ffstrategies.net','56B3B68E-84B2-4F96-984B-8F9C81A90BCD', False, 2);

/**
 * Unified configuration module
 * Extensible: add more services (Kafka, S3, etc.) later.
 */

const isLocal = process.env.NODE_ENV === 'local';

export const config = {
	app: {
		env: process.env.NODE_ENV || 'development',
		port: parseInt(process.env.PORT || '3000', 10),
		apiBase: process.env.API_BASE || 'http://api:3000',
	},

	temporal: {
		address: process.env.TEMPORAL_ADDRESS || (isLocal ? 'localhost:7233' : 'temporal:7233'),
		taskQueue: process.env.TEMPORAL_TASK_QUEUE || 'hotel-orchestrator',
		activities: {
			defaultTimeout: '1 minute',
			retryPolicy: {
				maximumAttempts: 3,
			},
		},
	},

	redis: {
		host: process.env.REDIS_HOST || (isLocal ? 'localhost' : 'redis'),
		port: parseInt(process.env.REDIS_PORT || '6379', 10),
	},

	postgres: {
		host: process.env.POSTGRES_HOST || (isLocal ? 'localhost' : 'postgres'),
		port: parseInt(process.env.POSTGRES_PORT || '5432', 10),
		user: process.env.POSTGRES_USER || 'temporal',
		password: process.env.POSTGRES_PASSWORD || 'temporal',
		database: process.env.POSTGRES_DB || 'temporal',
	},
	
	suppliers: [
		{
			id: 'supplierA',
			name: 'Supplier A',
			url: '/supplierA/hotels',
			hotels: [
				{ hotelId: 'a1', name: 'Holtin',       price: 6000, city: 'delhi',     commissionPct: 10 },
				{ hotelId: 'a2', name: 'Radison',      price: 5900, city: 'delhi',     commissionPct: 13 },
				{ hotelId: 'a3', name: 'Taj Palace',   price: 12000, city: 'mumbai',   commissionPct: 15 },
				{ hotelId: 'a4', name: 'Oberoi',       price: 15000, city: 'mumbai',   commissionPct: 12 },
				{ hotelId: 'a5', name: 'Leela',        price: 9800,  city: 'bangalore',commissionPct: 14 },
				{ hotelId: 'a6', name: 'Marriott',     price: 8700,  city: 'bangalore',commissionPct: 11 },
				{ hotelId: 'a7', name: 'Holiday Inn',  price: 7100,  city: 'goa',      commissionPct: 18 },
				{ hotelId: 'a8', name: 'Novotel',      price: 9400,  city: 'goa',      commissionPct: 13 },
				{ hotelId: 'a9', name: 'Hyatt Regency',price: 11200, city: 'delhi',    commissionPct: 12 },
				{ hotelId: 'a10', name: 'ITC Grand',   price: 13500, city: 'kolkata',  commissionPct: 16 },
			],
		},
		{
			id: 'supplierB',
			name: 'Supplier B',
			url: '/supplierB/hotels',
			hotels: [
				{ hotelId: 'b1',  name: 'Holtin',        price: 5340,  city: 'delhi',     commissionPct: 20 },
				{ hotelId: 'b2',  name: 'Grand Palace',  price: 8800,  city: 'delhi',     commissionPct: 12 },
				{ hotelId: 'b3',  name: 'Taj Palace',    price: 11500, city: 'mumbai',    commissionPct: 14 },
				{ hotelId: 'b4',  name: 'Oberoi',        price: 15200, city: 'mumbai',    commissionPct: 10 },
				{ hotelId: 'b5',  name: 'Leela',         price: 9500,  city: 'bangalore', commissionPct: 15 },
				{ hotelId: 'b6',  name: 'Marriott',      price: 8600,  city: 'bangalore', commissionPct: 12 },
				{ hotelId: 'b7',  name: 'Holiday Inn',   price: 7000,  city: 'goa',       commissionPct: 19 },
				{ hotelId: 'b8',  name: 'Novotel',       price: 9700,  city: 'goa',       commissionPct: 14 },
				{ hotelId: 'b9',  name: 'Hyatt Regency', price: 10900, city: 'delhi',     commissionPct: 11 },
				{ hotelId: 'b10', name: 'ITC Grand',     price: 13800, city: 'kolkata',   commissionPct: 15 },
			],
		},
		{
			id: 'supplierC',
			name: 'Supplier C',
			url: '/supplierC/hotels',
			hotels: [
				{ hotelId: 'c1', name: 'Holtin',        price: 5600,  city: 'delhi',     commissionPct: 17 },
				{ hotelId: 'c2', name: 'Radison',       price: 6050,  city: 'delhi',     commissionPct: 14 },
				{ hotelId: 'c3', name: 'Taj Palace',    price: 11800, city: 'mumbai',    commissionPct: 13 },
				{ hotelId: 'c4', name: 'Oberoi',        price: 14900, city: 'mumbai',    commissionPct: 11 },
				{ hotelId: 'c5', name: 'Leela',         price: 9700,  city: 'bangalore', commissionPct: 13 },
				{ hotelId: 'c6', name: 'Marriott',      price: 8900,  city: 'bangalore', commissionPct: 10 },
				{ hotelId: 'c7', name: 'Holiday Inn',   price: 7200,  city: 'goa',       commissionPct: 16 },
				{ hotelId: 'c8', name: 'Novotel',       price: 9500,  city: 'goa',       commissionPct: 15 },
				{ hotelId: 'c9', name: 'Hyatt Regency', price: 11100, city: 'delhi',     commissionPct: 12 },
				{ hotelId: 'c10',name: 'ITC Grand',     price: 13700, city: 'kolkata',   commissionPct: 14 },
			],
		},
	],
};

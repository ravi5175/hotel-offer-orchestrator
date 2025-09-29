
export interface SupplierHotel {
	hotelId: string;
	name: string;
	price: number;
	city: string;
	commissionPct: number;
}

export interface PublicHotel {
	name: string;
	price: number;
	supplier: string;
	commissionPct: number;
}

export type StatusOK = { status: 'ok'; count?: number };
export type StatusErr = { status: 'error'; error: string };
export type Status = StatusOK | StatusErr;

export interface HealthSnapshot {
	redis: Status;
	postgres?: Status;
	temporal: Status;
	suppliers: {
		supplierA: Status;
		supplierB: Status;
	};
}

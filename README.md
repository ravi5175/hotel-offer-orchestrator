# Hotel Offer Orchestrator

## Overview
The **Hotel Offer Orchestrator** is a sample microservice built with:

- **NestJS (TypeScript)** for API layer  
- **Temporal.io** for orchestrating workflows  
- **Redis** for caching and filtering hotel data  
- **PostgreSQL** for Temporal persistence  
- **Winston** for structured logging  
- **Docker Compose** for local orchestration  

It aggregates hotel offers from multiple suppliers, deduplicates hotels by name, picks the cheapest offer, and caches results in Redis for fast price range filtering.

---

## Features
- Fetch hotel offers from multiple mock suppliers  
- Deduplicate hotels by name, pick cheapest per hotel  
- Cache results in Redis with sorted sets for price filtering  
- Orchestrate supplier fetch → dedupe → save using **Temporal workflows**  
- Health check endpoint covering Redis, Temporal, Postgres, and suppliers  
- Winston-based structured logging  

---

## Configuration

### `config/config.ts`

Suppliers, Temporal, Redis, and Postgres are defined here.

```ts
export const config = {
  suppliers: [
    {
      id: 'supplierA',
      name: 'Supplier A',
      url: '/supplierA/hotels',
      hotels: [
        { hotelId: 'a1', name: 'Holtin', price: 6000, city: 'delhi', commissionPct: 10 },
        { hotelId: 'a2', name: 'Radison', price: 5900, city: 'delhi', commissionPct: 13 },
      ],
    },
    {
      id: 'supplierB',
      name: 'Supplier B',
      url: '/supplierB/hotels',
      hotels: [
        { hotelId: 'b1', name: 'Holtin', price: 5340, city: 'delhi', commissionPct: 20 },
        { hotelId: 'b2', name: 'Grand Palace', price: 8800, city: 'delhi', commissionPct: 12 },
      ],
    },
  ],
  temporal: {
    address: process.env.TEMPORAL_ADDRESS || 'temporal:7233',
    taskQueue: process.env.TEMPORAL_TASK_QUEUE || 'hotel-orchestrator',
  },
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: +(process.env.REDIS_PORT || 6379),
  },
  postgres: {
    host: process.env.POSTGRES_HOST || 'localhost',
    port: +(process.env.POSTGRES_PORT || 5432),
    user: process.env.POSTGRES_USER || 'temporal',
    password: process.env.POSTGRES_PASSWORD || 'temporal',
    database: process.env.POSTGRES_DB || 'temporal',
  },
};
```

---

## API Endpoints

### 1. Hotels

**GET** `/api/hotels?city=delhi`

- Runs the Temporal workflow
- Fetches supplier data, dedupes, stores in Redis
- Returns cheapest offer per hotel

**GET** `/api/hotels?city=delhi&minPrice=5000&maxPrice=7000`

- Reads directly from Redis
- Returns hotels in price range

**Example Response:**

```json
[
  {
    "name": "Holtin",
    "price": 5340,
    "supplier": "Supplier B",
    "commissionPct": 20
  },
  {
    "name": "Radison",
    "price": 5900,
    "supplier": "Supplier A",
    "commissionPct": 13
  }
]
```

### 2. Suppliers (mock endpoints)

**GET** `/supplierA/hotels?city=delhi`  
**GET** `/supplierB/hotels?city=delhi`

Returns mock data defined in `config.suppliers`.

### 3. Health Check

**GET** `/health`

**Response Example:**

```json
{
  "redis": { "status": "ok" },
  "postgres": { "status": "ok" },
  "temporal": { "status": "ok" },
  "suppliers": {
    "supplierA": { "status": "ok", "count": 5 },
    "supplierB": { "status": "ok", "count": 5 }
  }
}
```

---

## Docker Compose Architecture

The `docker-compose.yml` orchestrates 6 services that work together:

### Service Breakdown

#### 1. **api** (NestJS API Server)
```yaml
ports: "3000:3000"
depends_on: redis, temporal
```
- Built from your Dockerfile
- Exposes REST API endpoints
- Triggers Temporal workflows
- Connects to Redis for caching and Temporal for workflow orchestration

#### 2. **worker** (Temporal Worker)
```yaml
command: npm run worker
depends_on: temporal, api, redis
```
- Built from same Dockerfile as API
- Runs `npm run worker` to start Temporal worker
- Polls Temporal server for workflow tasks
- Executes activities (fetch suppliers, dedupe, save to Redis)
- **Must be running** for workflows to execute

#### 3. **redis** (Cache & Data Store)
```yaml
image: redis:7-alpine
ports: "6379:6379"
```
- Lightweight Redis instance
- Stores deduplicated hotel offers
- Uses sorted sets for price range filtering
- No persistence configured (data lost on restart)

#### 4. **postgres** (Temporal Persistence)
```yaml
image: postgres:12-alpine
healthcheck: pg_isready every 5s
```
- Stores Temporal workflow state and history
- Uses Postgres 12 (compatible with Temporal's `postgres12` driver)
- Healthcheck ensures DB is ready before Temporal starts
- Credentials: `temporal/temporal/temporal`

#### 5. **temporal** (Workflow Engine)
```yaml
image: temporalio/auto-setup:latest
depends_on: postgres (healthy)
ports: "7233:7233"
```
- Temporal server with auto-setup (creates schemas automatically)
- Uses Postgres for persistence (`DB=postgres12`)
- Connects to `postgres` service via `POSTGRES_SEEDS=postgres`
- Exposes gRPC port 7233 for client/worker connections
- **Note:** Uses `POSTGRES_PWD` (not `POSTGRES_PASSWORD`) per Temporal convention

#### 6. **temporal-ui** (Web Interface)
```yaml
image: temporalio/ui:latest
ports: "8080:8080"
```
- Web UI for monitoring workflows
- Access at http://localhost:8080
- Shows workflow executions, history, errors
- CORS enabled for localhost:3000

### Network & Dependencies

All services run on the `orchestrator-net` bridge network, allowing communication via service names (e.g., `redis`, `temporal`, `postgres`).

**Startup Order:**
1. `postgres` starts with healthcheck
2. `redis` starts independently  
3. `temporal` waits for postgres to be healthy
4. `temporal-ui` waits for temporal
5. `api` waits for redis + temporal
6. `worker` waits for temporal + api + redis

---

## Running with Docker Compose

**Start the stack:**

```bash
docker-compose up --build
```

**Stop and clean up:**

```bash
docker-compose down -v  # -v removes volumes (clears data)
```

**View logs:**

```bash
docker-compose logs -f api          # API logs
docker-compose logs -f worker       # Worker logs
docker-compose logs -f temporal     # Temporal server logs
```

**Access services:**

- **API**: http://localhost:3000
- **Temporal UI**: http://localhost:8080
- **Redis**: localhost:6379
- **Postgres**: localhost:5432

---

## Development

**Run API locally:**

```bash
npm run start:dev
```

**Run Temporal worker locally:**

```bash
npm run worker
```

(Worker must always be running for workflows to execute.)

---

## Observability

- **Logs**: Winston logs all activity/service logs to console (JSON or colorized)
- **Temporal UI**: Monitor workflows at http://localhost:8080
- **Health endpoint**: Check dependencies at `/health`

---

## Next Steps

- Add more suppliers by updating `config.suppliers`
- Extend Redis caching strategy (TTL, invalidation)
- Add authentication/authorization around APIs
- Deploy to Kubernetes or cloud environment

---

## License

MIT
import { Worker, NativeConnection } from '@temporalio/worker';
import { config } from '../../config/config';

// import activities
import * as hotelActivities from '../activities/hotel.activities';
import * as supplierActivities from '../activities/supplier.activities';

/**
 * Retry Temporal connection with exponential backoff
 */
async function connectWithBackoff(
    address: string,
    maxRetries = 8,
    baseDelay = 1000 // 1 second
): Promise<NativeConnection> {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            console.log(`Attempt ${attempt}: connecting to Temporal at ${address}...`);
            return await NativeConnection.connect({ address });
        } catch (err) {
            const delay = baseDelay * Math.pow(2, attempt - 1); // exponential backoff
            console.warn(
                `Connection attempt ${attempt} failed: ${(err as Error).message}. Retrying in ${
                    delay / 1000
                }s...`
            );
            await new Promise((res) => setTimeout(res, delay));
        }
    }
    throw new Error(
        `Failed to connect to Temporal at ${address} after ${maxRetries} attempts`
    );
}

async function run() {
    console.log('DEBUG ENV:', {
        NODE_ENV: process.env.NODE_ENV,
        TEMPORAL_ADDRESS: process.env.TEMPORAL_ADDRESS,
        resolved: config.temporal.address,
    });

    try {
        // establish connection with retry + backoff
        const connection = await connectWithBackoff(config.temporal.address);

        // create worker bound to connection
        const worker = await Worker.create({
            connection,
            workflowsPath: require.resolve('../workflows/hotelOrchestrator.workflow'),
            activities: {
                ...hotelActivities,
                ...supplierActivities,
            },
            taskQueue: config.temporal.taskQueue,
        });

        console.log(
            `Hotel worker started. Connected to Temporal at ${config.temporal.address}, listening on task queue: ${config.temporal.taskQueue}`
        );

        await worker.run(); // blocks until terminated
    } catch (err) {
        console.error('Worker failed to start after retries:', err);
        process.exit(1);
    }
}

run();

import { Worker } from '@temporalio/worker';
import { config } from '../../config/config';

// import activities
import * as hotelActivities from '../activities/hotel.activities';
import * as supplierActivities from '../activities/supplier.activities';

async function run() {
	try {
		const worker = await Worker.create({
			// workflowsPath points to the folder where workflow files are compiled
			workflowsPath: require.resolve('../workflows/hotelOrchestrator.workflow'),
			activities: {
				...hotelActivities,
				...supplierActivities,
			},
			taskQueue: config.temporal.taskQueue, // "hotel-orchestrator"
		});

		console.log(`Hotel worker started. Listening on task queue: ${config.temporal.taskQueue}`);

		await worker.run(); // blocks until terminated
	} catch (err) {
		console.error('Worker failed to start:', err);
		process.exit(1);
	}
}

run();

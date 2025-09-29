import { Inject, Injectable } from '@nestjs/common';
import { TEMPORAL_CLIENT } from '../database/temporal.provider';
import { Client, WorkflowHandle } from '@temporalio/client';
import { config } from '../config/config';

@Injectable()
export class TemporalService {
	constructor(@Inject(TEMPORAL_CLIENT) private readonly temporal: Client) {}

	/**
	 * Start the hotel orchestrator workflow
	 */
	async startHotelWorkflow(city: string): Promise<WorkflowHandle> {
		const workflowId = `wf-hotels-${city}-${Date.now()}`;
		const handle = await this.temporal.workflow.start('hotelOrchestrator', {
			taskQueue: config.temporal.taskQueue,
			workflowId,
			args: [city],
		});

		console.log(`[temporal] Started workflow ${workflowId} for city=${city}`);
		return handle;
	}

	/**
	 * Run workflow and wait for results
	 */
	async runHotelWorkflow(city: string) {
		const handle = await this.startHotelWorkflow(city);
		return await handle.result();
	}

	/**
	 * Cancel a running workflow
	 */
	async cancelWorkflow(workflowId: string) {
		const handle = this.temporal.workflow.getHandle(workflowId);
		await handle.cancel();
		console.log(`[temporal] Cancelled workflow ${workflowId}`);
	}

	/**
	 * Query workflow by ID
	 */
	async getWorkflowResult(workflowId: string) {
		const handle = this.temporal.workflow.getHandle(workflowId);
		return await handle.result();
	}
}

import { proxyActivities, log, workflowInfo } from '@temporalio/workflow';
import type * as supplierActs from '../activities/supplier.activities';
import type * as hotelActs from '../activities/hotel.activities';

const supplierActivities = proxyActivities<typeof supplierActs>({
    startToCloseTimeout: '1 minute',
    retry: { maximumAttempts: 3 },
});

const hotelActivities = proxyActivities<typeof hotelActs>({
    startToCloseTimeout: '1 minute',
    retry: { maximumAttempts: 3 },
});

export async function hotelOrchestrator(city: string) {
    const info = workflowInfo();
    const wfId = info.workflowId;
    const runId = info.runId;

    log.info(`HotelOrchestrator started for city=${city}`, { wfId, runId });

    try {
        // 1. fetch hotels from all suppliers
        log.info(`Fetching hotels from suppliers for city=${city}`, { wfId, runId });
        const allHotels = await supplierActivities.fetchAllSuppliersFlat(city);
        log.info(`Fetched ${allHotels.length} hotels for city=${city}`, { wfId, runId });

        // 2. dedupe by name, pick cheapest
        log.info(`Deduping ${allHotels.length} hotels for city=${city}`, { wfId, runId });
        const deduped = await hotelActivities.dedupeAndPickBest(allHotels);
        log.info(`Deduped to ${deduped.length} unique hotels for city=${city}`, { wfId, runId });

        // 3. persist to Redis for quick filtering
        log.info(`Saving ${deduped.length} hotels to Redis for city=${city}`, { wfId, runId });
        await hotelActivities.saveToRedis(city, deduped);
        log.info(`Saved hotels to Redis for city=${city}`, { wfId, runId });

        // 4. return final list
        log.info(`Workflow completed successfully for city=${city}`, { wfId, runId });
        return deduped;
    } catch (err: any) {
        log.error(`HotelOrchestrator failed for city=${city}: ${err.message}`, {
            wfId,
            runId,
            stack: err.stack,
        });
        throw err; // rethrow so Temporal retry policies still apply
    }
}

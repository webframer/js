import { GET, SET } from '../../constants'
import { bench } from '../log.js'
import { performCache, performStorage } from '../storage.js'

/**
 * BENCHMARK TESTS =============================================================
 * =============================================================================
 */

bench({type: SET, log: ''}, performCache, SET, 'id', [7])  // ~ 0.080 ms for 1
bench({type: GET, log: ''}, performCache, GET, 'id')  // ~ 0.005 ms for 1
bench({type: SET, log: ''}, performStorage, SET, 'id', [13])  // ~ 1.000 ms for 1
bench({type: GET, log: ''}, performStorage, GET, 'id')

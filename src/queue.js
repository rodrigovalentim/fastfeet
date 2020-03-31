import 'dotenv/config';
/**
 * Processa a lista de envio de email em um
 * processador diferente
 */
import Queue from './lib/Queue';

Queue.processQueue();

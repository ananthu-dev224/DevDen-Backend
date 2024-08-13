import crypto from 'crypto'
import { TicketRepository } from '../repository/ticketRepository'

const ticketRepo = new TicketRepository();

// Function to generate a unique 6-digit ticket ID
export const generateUniqueTicketId = async () => {
    let ticketId: string = '';
    let isUnique = false;
  
    while (!isUnique) {
      // Generate a random 6-digit number
      ticketId = crypto.randomInt(100000, 999999).toString();
  
      // Check if this ticket ID already exists
      const existingTicket = await ticketRepo.findByTicketId(ticketId);
      if (!existingTicket) {
        isUnique = true;
      }
    }
  
    return ticketId;
};
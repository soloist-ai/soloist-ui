import { TELEGRAM_BOT_USERNAME } from '../config/environment';

/**
 * Opens the Telegram bot proof submission flow for a given task.
 * Uses Telegram WebApp API if available, otherwise falls back to window.open.
 */
export const openProofSubmission = (taskId: string, proofType: string): void => {
  const url = `https://t.me/${TELEGRAM_BOT_USERNAME}?start=proof_${taskId}_${proofType}`;

  if (
    typeof window !== 'undefined' &&
    (window as any).Telegram?.WebApp?.openTelegramLink
  ) {
    (window as any).Telegram.WebApp.openTelegramLink(url);
  } else {
    window.open(url, '_blank');
  }
};

import type { QNotifyCreateOptions } from 'quasar';

import { Notify as QuasarNotify } from 'quasar';

import { iconCached, iconCheck, iconError, iconInfo, iconWarning } from '@/icons';

class Notify {
  create(opts: QNotifyCreateOptions): void {
    QuasarNotify.create({
      ...opts,
      position: 'bottom',
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  apiError(error: any): void {
    // Handle fetch API errors or other errors
    const msg = error instanceof Error ? error.message : String(error);

    this.create({
      timeout: 10000,
      progress: true,
      html: true,
      message: msg,
      type: 'negative',
      icon: iconError,
      actions: [
        {
          label: '✕',
          color: 'white',
        },
      ],
      attrs: {
        role: 'alert',
      },
    });
  }

  error(msg: string): void {
    this.create({
      type: 'negative',
      message: msg,
      timeout: 5000,
      icon: iconError,
    });
  }

  info(msg: string): void {
    this.create({
      message: msg,
      timeout: 2500,
      icon: iconInfo,
    });
  }

  ongoing(msg: string, timeout: number): void {
    this.create({
      type: 'ongoing',
      message: msg,
      timeout: timeout,
      spinner: false,
      progress: true,
    });
  }

  success(msg: string): void {
    this.create({
      type: 'positive',
      message: msg,
      timeout: 2500,
      icon: iconCheck,
    });
  }

  warning(msg: string): void {
    this.create({
      type: 'warning',
      message: msg,
      timeout: 5000,
      icon: iconWarning,
    });
  }

  reload(): void {
    this.create({
      color: 'dark',
      icon: iconCached,
      message: 'We have updated the website. Please refresh the page.',
      timeout: 0,
      multiLine: true,
      position: 'bottom',
      actions: [
        {
          label: 'Refresh',
          color: 'lime',
          handler: () => {
            window.location.reload();
          },
        },
      ],
    });
  }
}

export const notify = new Notify();
